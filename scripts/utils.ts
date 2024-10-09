import type {
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

export function hasEvents(events?: PackageEvent[]): events is PackageEvent[] {
  return events !== undefined && events.length > 1;
}

export function indent(string: string) {
  return string.replace(/^(.*)/, '* $1');
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
  return `
    ${importRenderer(declaration, config)}

    ${createJSDoc(declaration)}
    const ReactComponent = createComponent({
      tagName: '${declaration.tagName}',
      displayName: '${declaration.name}',
      elementClass: Component,
      react: React,
      ${eventRenderer(declaration, config)}
      ${templateRenderer(declaration, config)}
    });

    export default ReactComponent;
  `;
}
