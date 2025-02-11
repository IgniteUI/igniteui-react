import type {
  ClassField,
  ClassMember,
  CustomElementDeclaration,
  Declaration,
  Package,
  Event as PackageEvent,
} from './schema';

/**
 * CustomElementDeclaration with a `path` property added for convenience
 */
export interface CustomElementWithPath extends CustomElementDeclaration {
  path: string;
}

// Helpers

/**
 * Returns whether the given declaration is an actual custom element
 */
function isCustomElement(declaration: Declaration): declaration is CustomElementDeclaration {
  return declaration.kind === 'class' && 'tagName' in declaration;
}

/**
 * Returns whether the given declaration member is a field
 */
export function isField(member: ClassMember): member is ClassField {
  return member.kind === 'field';
}

export function hasEvents(events?: PackageEvent[]): events is PackageEvent[] {
  return !!events?.filter((x) => x.name).length;
}

export function indent(string: string) {
  return string.replace(/^(.*)/, '* $1');
}

export function toReactName(string: string) {
  return string.replace(/^Igc/, 'Igr').replace(/Component$/, '');
}

/**
 * Parses a custom-elements.json file and returns all custom elements from it
 */
export function parseElementsJSON(json: Package) {
  return json.modules
    .flatMap(({ declarations, path }) => {
      if (!declarations) {
        return null;
      }

      return declarations.flatMap((declaration) => {
        return isCustomElement(declaration) ? Object.assign(declaration, { path }) : null;
      });
    })
    .filter((declaration) => Boolean(declaration)) as CustomElementWithPath[];
}

export function createJSDoc({
  description,
  events,
  slots,
  cssParts,
  cssProperties,
}: CustomElementWithPath) {
  const buffer: string[] = [];

  if (description) {
    for (const line of description.split('\n')) {
      buffer.push(indent(line));
    }
  }

  if (slots) {
    for (const slot of slots) {
      buffer.push(indent(`@slot ${slot.name} - ${slot.description}`));
    }
  }

  if (hasEvents(events)) {
    for (const event of events) {
      if (event.name) {
        buffer.push(indent(`@fires ${event.name} - ${event.description}`));
      }
    }
  }

  if (cssParts) {
    for (const part of cssParts) {
      buffer.push(indent(`@csspart ${part.name} - ${part.description}`));
    }
  }

  if (cssProperties) {
    for (const prop of cssProperties) {
      buffer.push(indent(`@cssproperty ${prop.name} - ${prop.description}`));
    }
  }

  return `/**\n${buffer.join('\n')}\n*/`;
}

export function createEvents({ events, name: component }: CustomElementWithPath) {
  const buffer: string[] = [];

  if (hasEvents(events)) {
    for (const { name } of events) {
      if (name) {
        buffer.push(`${name}: '${name}' as EventName<${component}EventMap['${name}']>`);
      }
    }
  }

  return buffer.length ? `events: {${buffer.join(',\n')}},` : '';
}

export function createImports({ name, events }: CustomElementWithPath, packageName: string) {
  const buffer: string[] = [
    "import * as React from 'react'",
    `import { ${name} as Component } from '${packageName}'`,
  ];

  hasEvents(events)
    ? buffer.push(
        ...[
          `import type { ${name}EventMap } from '${packageName}/types'`,
          "import { type EventName, createComponent} from '../react-props.js'",
        ],
      )
    : buffer.push("import { createComponent } from '../react-props.js'");

  return buffer.join('\n');
}

type ImportRendererParams<T> = (declaration: CustomElementWithPath, config: T) => string;

export function createFileContent<T>(
  declaration: CustomElementWithPath,
  eventRenderer: ImportRendererParams<T>,
  importRenderer: ImportRendererParams<T>,
  templateRenderer: ImportRendererParams<T>,
  config: T,
) {
  const name = toReactName(declaration.name);

  // TODO: Conditional? Not all components had modules exposed, but CEM doesn't have that meta
  const moduleBackfill = `
    /** @deprecated Module register is no longer needed and can be removed */
    export const ${name}Module = Component;`;

  return `
    ${importRenderer(declaration, config)}

    ${createJSDoc(declaration)}
    export const ${name} = createComponent({
      tagName: '${declaration.tagName}',
      displayName: '${name}',
      elementClass: Component,
      react: React,
      ${eventRenderer(declaration, config)}
      ${templateRenderer(declaration, config)}
    });

    export type ${name} = Component;
    ${moduleBackfill}
  `;
}
