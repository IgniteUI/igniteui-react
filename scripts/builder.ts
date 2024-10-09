import type { Options } from 'prettier';
import type { Package } from './schema';
import { type CustomElementWithPath, hasEvents, indent, parseElementsJSON } from './utils';

// REVIEW: We ain't going to need it? Probably, but leave it for now
export abstract class Builder<T> {
  protected config: T;

  protected readonly NEWLINE = '\n';
  protected readonly COMMA_NEWLINE = ',\n';

  protected _buffer: string[] = [];
  protected _prettierConfig: Options = {
    parser: 'babel-ts',
    singleQuote: true,
    tabWidth: 2,
  };

  protected createJSDoc({
    description = '',
    events = [],
    slots = [],
    cssParts = [],
    cssProperties = [],
  }: CustomElementWithPath): string {
    const buffer: string[] = [`/**${this.NEWLINE}`];

    for (const line of description.split('\n')) {
      buffer.push(indent(line));
    }

    for (const { name, description } of slots) {
      buffer.push(indent(`@slot ${name} - ${description}`));
    }

    if (hasEvents(events)) {
      for (const event of events) {
        if (event.name) {
          buffer.push(indent(`@fires ${event.name} - ${event.description}`));
        }
      }
    }

    for (const { name, description } of cssParts) {
      buffer.push(indent(`@csspart ${name} - ${description}`));
    }

    for (const { name, description } of cssProperties) {
      buffer.push(indent(`@cssproperty ${name} - ${description}`));
    }

    this._buffer.push(`${this.NEWLINE}*/`);

    return this._buffer.length > 2 ? this._buffer.join(this.NEWLINE) : '';
  }

  protected abstract createImports(): string;

  protected parseCustomElements(jsonManifest: Package) {
    return parseElementsJSON(jsonManifest).filter(
      (declaration) => !this.config.ignore.has(declaration.tagName!),
    );
  }
}
