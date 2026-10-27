import type { IgcChatMessage } from 'igniteui-webcomponents';
import type { MarkdownRendererOptions } from 'igniteui-webcomponents/extras';
import { setupMarkdownRenderer } from 'igniteui-webcomponents/extras';
import type { ReactNode } from 'react';

export type IgrChatMarkdownRendererOptions = MarkdownRendererOptions;

export async function createChatMarkdownRenderer(
  options: IgrChatMarkdownRendererOptions,
): Promise<(message: IgcChatMessage) => Promise<ReactNode>> {
  const renderer = await setupMarkdownRenderer(options);

  return async (message: IgcChatMessage): Promise<ReactNode> => {
    return (
      <div
        style={{ display: 'contents' }}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: This is passed through the `DOMPurify.sanitize` method
        dangerouslySetInnerHTML={{
          __html: message.text ? await renderer.parse(message.text) : '',
        }}
      ></div>
    );
  };
}
