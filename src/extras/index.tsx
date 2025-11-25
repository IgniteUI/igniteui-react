import DOMPurify from 'dompurify';
import type { IgcChatMessage } from 'igniteui-webcomponents';
import type { MarkdownRendererOptions } from 'igniteui-webcomponents/extras';
import { Marked } from 'marked';
import markedShiki from 'marked-shiki';
import { bundledThemes, createHighlighter } from 'shiki/bundle/web';

const DEFAULT_LANGUAGES = ['javascript', 'typescript', 'html', 'css'];
const DEFAULT_THEME = {
  light: 'github-light',
  dark: 'github-dark',
};

export type IgrChatMarkdownRendererOptions = MarkdownRendererOptions;

export async function createChatMarkdownRenderer(options?: MarkdownRendererOptions) {
  const sanitizer = options?.sanitizer ?? DOMPurify.sanitize;

  const markdown = new Marked({
    breaks: true,
    gfm: true,
    extensions: [
      {
        name: 'link',
        renderer({ href, title, text }) {
          return `<a href="${href}" target="_blank" rel="noopener noreferrer" ${title ? `title="${title}"` : ''}>${text}</a>`;
        },
      },
    ],
  });

  if (!options?.noHighlighter) {
    const themes = options?.theme ?? DEFAULT_THEME;
    const langs = options?.languages ?? DEFAULT_LANGUAGES;
    const colorReplacements = {
      '#6f42c1': 'var(--shiki-purple)',
      '#032f62': 'var(--shiki-dark-blue)',
      '#24292e': 'var(--shiki-navy)',
      '#d73a49': 'var(--shiki-red)',
      '#005cc5': 'var(--shiki-blue)',
      '#22863a': 'var(--shiki-green)',
      '#e36209': 'var(--shiki-orange)',
    };

    const highlighter = await createHighlighter({
      langs,
      themes: Object.keys(bundledThemes),
    });

    markdown.use(
      markedShiki({
        highlight(code, lang, _) {
          try {
            return highlighter.codeToHtml(code, {
              lang,
              themes,
              colorReplacements: {
                'github-light': {
                  ...colorReplacements,
                  '#fff': 'var(--shiki-bg)',
                  '#24292e': 'var(--shiki-fg)',
                },
                'github-dark': {
                  ...colorReplacements,
                  '#24292e': 'var(--shiki-bg)',
                  '#e1e4e8': 'var(--shiki-fg)',
                },
              },
              defaultColor: 'light-dark()',
            });
          } catch {
            return `<pre><code>${sanitizer(code)}</code></pre>`;
          }
        },
      }),
    );
  }

  return async (message: IgcChatMessage): Promise<unknown> => {
    return (
      <div
        style={{ display: 'contents' }}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: This is passed through the `DOMPurify.sanitize` method
        dangerouslySetInnerHTML={{
          __html: message.text ? sanitizer(await markdown.parse(message.text)) : '',
        }}
      ></div>
    );
  };
}
