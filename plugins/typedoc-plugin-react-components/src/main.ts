import assert from "node:assert";
import {
  type Application,
  Comment,
  CommentTag,
  type Context,
  Converter,
  DeclarationReflection,
  IntrinsicType,
  ParameterReflection,
  PredicateType,
  ReflectionFlag,
  ReflectionKind,
  ReflectionSymbolId,
  ReflectionType,
  Renderer,
  SignatureReflection,
  UnionType,
  type SomeType,
} from "typedoc";
import ts, { ModifierFlags, SymbolFlags } from "typescript";

export function load(app: Application) {
  app.converter.on(Converter.EVENT_CREATE_DECLARATION, (context: Context, reflection: DeclarationReflection) => {
    // Ignore types like `displayName` or `$$typeOf` and any of the old deprecated modules exported.
    const isDeprecated = reflection.comment?.blockTags?.length &&
      reflection.comment?.blockTags.find(tag => tag.tag === "@deprecated");
    const isReactType = reflection.sources?.some((source) => source.fileName.endsWith("react/index.d.ts"));
    if (isReactType ||
      (reflection.name.endsWith("Module") && isDeprecated)) {
      // We just remove them since we cannot set a custom filter to not create reflections for them afaik.
      context.project.removeReflection(reflection);
    }

    // This renders the Alias for `PopoverPlacement` a bit better but still no like. Possibly add handling for aliases?
    // if (reflection.name === "PopoverPlacement") {
    //     reflection.kind = ReflectionKind.TypeParameter;
    // }
  });

  app.converter.on(Converter.EVENT_CREATE_SIGNATURE, (context: Context, reflection: SignatureReflection, sig: any, test: any) => {
    // Each component generates a signature due to the nature for the react nodes. We use it to further process it correctly so members appear where we need them.
    // A signature is a definition of a more complex type like a function that can have arguments/return type and etc. The other reflection type is a simple type.
    if ((reflection.type as any).qualifiedName === "React.ReactNode" && context.scope instanceof DeclarationReflection) {
      const sourceFile = context.program.getSourceFile(context.scope.sources ? context.scope.sources[0].fileName : '') as any;
      sourceFile.symbol.exports.forEach((value: any, key: string) => {
        if (!key.endsWith("Module")) {
          const declaration = value.getDeclarations()?.find(ts.isVariableDeclaration);
          const accessDeclaration = declaration ?? value.valueDeclaration;
          const type = accessDeclaration
            ? context.checker.getTypeOfSymbolAtLocation(value, accessDeclaration)
            : context.checker.getDeclaredTypeOfSymbol(value);

          if (type.aliasTypeArguments) {
            // The 1st element is the ref to the node of the component it pretty much implements or otherwise `elementClass` prop of `createComponent`.
            type.aliasTypeArguments[0].symbol?.members?.forEach((value: ts.Symbol, key: ts.__String) => {
              const memberDeclaration = value?.declarations?.length ? value.declarations[0] as any : null;
              const modifiers = ts.getCombinedModifierFlags(memberDeclaration);
              if (!key.toString().startsWith("_") &&
                (modifiers === ModifierFlags.None || modifiers === ModifierFlags.Public || modifiers === ModifierFlags.Static)) {
                let reflectionKind = ReflectionKind.Property;
                let category = "Other";
                switch (value.flags) {
                  case SymbolFlags.GetAccessor:
                    category = "Accessors";
                    reflectionKind = ReflectionKind.Accessor;
                    break;
                  case SymbolFlags.Method:
                    category = "Methods";
                    reflectionKind = ReflectionKind.Method;
                    break;
                  case SymbolFlags.Accessor:
                  case SymbolFlags.Property:
                    category = "Properties";
                }
                if (value.flags.toString() === "16777220") {
                    // For some reason optional properties get flagged to this number, even though the optional is 16777216
                    category = "Properties";
                }
                if (category === "Other") {
                    // Other types we just ignore creating.
                    return;
                }

                createMemberDeclaration(context, value, reflectionKind, category);
              }
            });
            // The 2nd element is the `events` prop of the `createComponent` method.
            type.aliasTypeArguments[1].symbol?.members?.forEach((value: ts.Symbol, key: ts.__String) => {
              createEventDeclaration(context, value);
            });
            // The 3rd element is for the `renderProps` prop of the `createComponent` method, but this is only declaration of them. 
            // Definition of them should be handled in the 1st part.
          }

          // Clear out component signature parameters, since they are only internal and we should already have processed them correctly.
          reflection.parameters = undefined;
          // No need to show sources for the root component reflection.
          reflection.sources = undefined;

          if (type.aliasTypeArguments) {
            // Register symbolId for this component base type that comes from the webcomponents and points to its reflection.
            // That way later on a link from example IgcSelectItemComponent(alias symbol) can be created to IgrSelectItem(the current context).
            const testSymbolID = new ReflectionSymbolId(type.aliasTypeArguments[0].symbol);
            context.project.registerSymbolId(context.scope, testSymbolID);
          }
        }
      });
    }
  });

  app.converter.on(Converter.EVENT_RESOLVE_END, (context: Context) => {
    // Maybe there is a better way to ignore everything from typescript except CustomEvent on init level?
    for (const item of Object.values(context.project.reflections)) {
      const reflection = item as DeclarationReflection;
      const isTsType = reflection?.sources?.some((source: any) => source.fileName.endsWith("typescript/lib/lib.dom.d.ts"));
      if (isTsType &&
        !((reflection.name === "CustomEvent" && reflection.kind === ReflectionKind.Interface) ||
          (reflection.parent?.name === "CustomEvent" && reflection.name === "detail"))) {
        context.project.children?.length ? context.project.children[0].removeChild(reflection) : null;
        context.project.removeReflection(reflection);
      }
    }

    // Shorten name since there's no need to show the full path to the destination folder.
    for (const child of context.project.children || []) {
      if (child.name.endsWith("lib.dom")) {
        child.name = "typescript";
      }
    }
  });

  app.converter.on(Converter.EVENT_END, (context: Context) => {
    console.log("Converter finished!");
  });

  app.renderer.on(Renderer.EVENT_BEGIN_PAGE, (page: any) => {
    // Filter out @fires tags for components, since they should be already processed and added as events.
    if (page.model?.comment) {
      page.model.comment.blockTags = page.model.comment.blockTags?.filter((commentTag: CommentTag) => commentTag.tag !== "@fires");
    }

    // Force camelCase on the links for props. This is to be consistent with other docs.
    if (page?.model?.children?.length && page.model.children[0].url.includes(".html#")) {
      for (const childDeclaration of page.model.children) {
        if (childDeclaration.url.includes(".html#")) {
          const urlParts = childDeclaration.url.split("#");
          childDeclaration.anchor = childDeclaration.name;
          childDeclaration.url = `${urlParts[0]}#${childDeclaration.name}`;
        }
      }
    }
  });
}

function createMemberDeclaration(context: Context, value: ts.Symbol, reflectionKind: ReflectionKind, category: string) {
  const declaration = value.getDeclarations()?.[0] as any;
  // Reflections automatically get added using this method to the context provided as parent.
  const reflection = context.createDeclarationReflection(reflectionKind, value, undefined, void 0);

  const type = context.checker.getTypeOfSymbol(value);
  reflection.type = context.converter.convertType(context.withScope(reflection), type);
  if (reflectionKind === ReflectionKind.Method) {
    // Create signatures that describe methods in greater detail compared to a simple type in the reflection.
    // One should be enough but maybe there could be multiple?
    for (const signature of type.getCallSignatures()) {
      createSignature(context.withScope(reflection), ReflectionKind.CallSignature, signature, value);
    }
  }

  // To Do: Better handling of default values?
  reflection.defaultValue = declaration?.initializer ? (declaration as any).initializer.getText() : undefined;

  const categoryTag = new CommentTag("@category", [{ kind: "text", text: category }]);
  if (reflection.comment) {
    reflection.comment.blockTags = [categoryTag];
  } else {
    const comment = declaration?.jsDoc?.length ? declaration?.jsDoc[0].comment : "";
    reflection.comment = new Comment([{ kind: "text", text: comment }], [categoryTag]);
  }

  // For some reason everything by default is static.
  reflection.setFlag(ReflectionFlag.Static, false);
  return reflection;
}

function createEventDeclaration(context: Context, value: ts.Symbol) {
  const declaration = value.getDeclarations()?.find(ts.isVariableDeclaration) as any;
  const reflection = context.createDeclarationReflection(ReflectionKind.SetSignature, value, undefined, void 0);
  const typeReflection = new DeclarationReflection("__type", ReflectionKind.TypeLiteral, reflection);

  // Mock signature reflection for the events, since their type is a function.
  const eventSignature = new SignatureReflection("__type", ReflectionKind.CallSignature, typeReflection);
  // Mark all events to return void.
  eventSignature.type = new IntrinsicType("void");

  // Create the `args` parameter reflection and get its type from the value node.
  const paramRefl = new ParameterReflection("args", ReflectionKind.Parameter, eventSignature);
  const symbolType = context.checker.getTypeOfSymbol(value);
  const eventDefinitionType = context.converter.convertType(context.withScope(reflection), symbolType) as any;
  const argsType = eventDefinitionType?.typeArguments?.length ? eventDefinitionType.typeArguments[0] : eventDefinitionType;
  paramRefl.type = argsType;

  eventSignature.parameters = [paramRefl];

  const categoryTag = new CommentTag("@category", [{ kind: "text", text: "Events" }]);
  if (reflection.comment) {
    reflection.comment.blockTags = [categoryTag];
  } else {
    // Get the event description from the @fires tag of the parent component and just extract the text.
    const parentComment = context.scope.comment?.blockTags
      .filter(tag => tag.tag === "@fires").map(tag => tag.content[0].text)
      .find(tag => tag.startsWith(`igc${reflection.name.substring(2)}`))
      ?.split("-")[1].trim();
    const comment = declaration?.jsDoc?.length ? declaration?.jsDoc[0].comment : parentComment;
    reflection.comment = new Comment([{ kind: "text", text: comment }], [categoryTag]);
  }

  typeReflection.signatures = [eventSignature];
  const resolvedType = new ReflectionType(typeReflection);

  reflection.type = resolvedType;
  reflection.setFlag(ReflectionFlag.Static, false);
  return reflection;
}

//#region Taken from typedoc source for creating a generic signature of a Symbol.
function removeUndefined(type: SomeType): SomeType {
  if (type instanceof UnionType) {
    const types = type.types.filter((t) => {
      if (t instanceof IntrinsicType) {
        return t.name !== "undefined";
      }
      return true;
    });
    if (types.length === 1) {
      return types[0];
    }
    type.types = types;
    return type;
  }
  return type;
}

function convertParameters(
  context: Context,
  sigRef: SignatureReflection,
  parameters: readonly (ts.Symbol & { type?: ts.Type })[],
  parameterNodes:
    | readonly ts.ParameterDeclaration[]
    | readonly ts.JSDocParameterTag[]
    | undefined,
) {
  // #2698 if `satisfies` is used to imply a this parameter, we might have
  // more parameters than parameter nodes and need to shift the parameterNode
  // access index. Very ugly, but it does the job.
  const parameterNodeOffset = parameterNodes?.length !== parameters.length ? -1 : 0;

  return parameters.map((param, i) => {
    const declaration = param.valueDeclaration;
    assert(
      !declaration ||
      ts.isParameter(declaration) ||
      ts.isJSDocParameterTag(declaration),
    );
    const paramRefl = new ParameterReflection(
      /__\d+/.test(param.name) ? "__namedParameters" : param.name,
      ReflectionKind.Parameter,
      sigRef,
    );
    if (declaration && ts.isJSDocParameterTag(declaration)) {
      paramRefl.comment = context.getJsDocComment(declaration);
    }
    paramRefl.comment ||= context.getComment(param, paramRefl.kind);

    context.registerReflection(paramRefl, param);

    let type: ts.Type | ts.TypeNode | undefined;
    let typeNode: ts.TypeNode | undefined;
    if (declaration) {
      type = context.checker.getTypeOfSymbolAtLocation(
        param,
        declaration,
      );

      if (ts.isParameter(declaration)) {
        typeNode = declaration.type;
      } else {
        typeNode = declaration.typeExpression?.type;
      }
    } else {
      type = param.type;
    }

    if (
      declaration &&
      ts.isParameter(declaration) &&
      declaration.type?.kind === ts.SyntaxKind.ThisType
    ) {
      paramRefl.type = new IntrinsicType("this");
    } else if (!type) {
      paramRefl.type = new IntrinsicType("any");
    } else {
      paramRefl.type = context.converter.convertType(
        context.withScope(paramRefl),
        type,
        typeNode,
      );
    }

    let isOptional = false;
    if (declaration) {
      isOptional = ts.isParameter(declaration)
        ? !!declaration.questionToken ||
        ts
          .getJSDocParameterTags(declaration)
          .some((tag) => tag.isBracketed)
        : declaration.isBracketed;
    }

    if (isOptional) {
      paramRefl.type = removeUndefined(paramRefl.type);
    }

    // paramRefl.defaultValue = convertDefaultValue(
    //     parameterNodes?.[i + parameterNodeOffset],
    // );
    paramRefl.setFlag(ReflectionFlag.Optional, isOptional);

    // If we have no declaration, then this is an implicitly defined parameter in JS land
    // because the method body uses `arguments`... which is always a rest argument
    let isRest = true;
    if (declaration) {
      isRest = ts.isParameter(declaration)
        ? !!declaration.dotDotDotToken
        : !!declaration.typeExpression &&
        ts.isJSDocVariadicType(declaration.typeExpression.type);
    }

    paramRefl.setFlag(ReflectionFlag.Rest, isRest);
    checkForDestructuredParameterDefaults(
      paramRefl,
      parameterNodes?.[i + parameterNodeOffset],
    );
    return paramRefl;
  });
}

function checkForDestructuredParameterDefaults(
  param: ParameterReflection,
  decl: ts.ParameterDeclaration | ts.JSDocParameterTag | undefined,
) {
  if (!decl || !ts.isParameter(decl)) return;
  if (param.name !== "__namedParameters") return;
  if (!ts.isObjectBindingPattern(decl.name)) return;
  if (param.type?.type !== "reflection") return;

  for (const child of param.type.declaration.children || []) {
    const tsChild = decl.name.elements.find(
      (el) => (el.propertyName || el.name).getText() === child.name,
    );

    if (tsChild) {
      //child.defaultValue = convertDefaultValue(tsChild);
    }
  }
}

function createSignature(
  context: Context,
  kind:
    | ReflectionKind.CallSignature
    | ReflectionKind.ConstructorSignature
    | ReflectionKind.GetSignature
    | ReflectionKind.SetSignature,
  signature: ts.Signature,
  symbol: ts.Symbol | undefined,
  inDeclaration?: ts.SignatureDeclaration | ts.JSDocSignature,
) {
  assert(context.scope instanceof DeclarationReflection);

  const declaration = inDeclaration || signature.getDeclaration() as
    | ts.SignatureDeclaration
    | undefined;

  const sigRef = new SignatureReflection(
    kind === ReflectionKind.ConstructorSignature
      ? context.scope.parent!.name
      : context.scope.name,
    kind,
    context.scope,
  );
  // This feels awful, but we need some way to tell if callable signatures on classes
  // are "static" (e.g. `Foo()`) or not (e.g. `(new Foo())()`)
  if (context.shouldBeStatic) {
    sigRef.setFlag(ReflectionFlag.Static);
  }
  if (symbol && declaration) {
    // context.project.registerSymbolId(
    //     sigRef,
    //     createSymbolId(symbol, declaration),
    // );
  }

  let parentReflection = context.scope;
  if (
    parentReflection.kindOf(ReflectionKind.TypeLiteral) &&
    parentReflection.parent instanceof DeclarationReflection
  ) {
    parentReflection = parentReflection.parent;
  }

  if (declaration) {
    const sigComment = context.getSignatureComment(declaration);
    if (parentReflection.comment?.discoveryId !== sigComment?.discoveryId) {
      sigRef.comment = sigComment;
      if (parentReflection.kindOf(ReflectionKind.MayContainDocuments)) {
        context.converter.processDocumentTags(sigRef, parentReflection);
      }
    }
  }

  const sigRefCtx = context.withScope(sigRef);
  // sigRef.typeParameters = convertTypeParameters(
  //     sigRefCtx,
  //     sigRef,
  //     signature.typeParameters,
  // );

  const parameterSymbols: ReadonlyArray<ts.Symbol & { type?: ts.Type }> = signature.thisParameter
    ? [signature.thisParameter, ...signature.parameters]
    : signature.parameters;

  sigRef.parameters = convertParameters(
    sigRefCtx,
    sigRef,
    parameterSymbols,
    declaration?.parameters,
  );

  const predicate = context.checker.getTypePredicateOfSignature(signature);
  if (predicate) {
    sigRef.type = convertPredicate(predicate, sigRefCtx);
  } else if (kind === ReflectionKind.SetSignature) {
    sigRef.type = new IntrinsicType("void");
  } else if (declaration?.type?.kind === ts.SyntaxKind.ThisType) {
    sigRef.type = new IntrinsicType("this");
  } else {
    let typeNode = declaration?.type;
    if (typeNode && ts.isJSDocReturnTag(typeNode)) {
      typeNode = typeNode.typeExpression?.type;
    }

    sigRef.type = context.converter.convertType(
      sigRefCtx,
      signature.getReturnType(),
      typeNode,
    );
  }

  context.registerReflection(sigRef, undefined);

  switch (kind) {
    case ReflectionKind.GetSignature:
      context.scope.getSignature = sigRef;
      break;
    case ReflectionKind.SetSignature:
      context.scope.setSignature = sigRef;
      break;
    case ReflectionKind.CallSignature:
    case ReflectionKind.ConstructorSignature:
      context.scope.signatures ??= [];
      context.scope.signatures.push(sigRef);
      break;
  }
}

function convertPredicate(
  predicate: ts.TypePredicate,
  context: Context,
): PredicateType {
  let name: string;
  switch (predicate.kind) {
    case ts.TypePredicateKind.This:
    case ts.TypePredicateKind.AssertsThis:
      name = "this";
      break;
    case ts.TypePredicateKind.Identifier:
    case ts.TypePredicateKind.AssertsIdentifier:
      name = predicate.parameterName;
      break;
  }

  let asserts: boolean;
  switch (predicate.kind) {
    case ts.TypePredicateKind.This:
    case ts.TypePredicateKind.Identifier:
      asserts = false;
      break;
    case ts.TypePredicateKind.AssertsThis:
    case ts.TypePredicateKind.AssertsIdentifier:
      asserts = true;
      break;
  }

  return new PredicateType(
    name,
    asserts,
    predicate.type
      ? context.converter.convertType(context, predicate.type)
      : void 0,
  );
}
//#endregion
