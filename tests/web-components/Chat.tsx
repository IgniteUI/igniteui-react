import { type ChatMessageRenderContext, IgrChat } from '../../src/components';
import '../../node_modules/igniteui-webcomponents/themes/light/bootstrap.css';
import { createChatMarkdownRenderer } from '../../src/extras/index';

const markdownRenderer = await createChatMarkdownRenderer();

export default function BasicForm() {
  const logEvent = (e: any) => console.log(e);

  const messages = [
    {
      id: '1',
      text: 'Hi there! What would you like to do today — check your order status, request a return, or talk to one of our agents?',
      sender: 'support',
      timestamp: (Date.now() - 3500000).toString(),
    },
  ];

  const messageHeader = ({ message }: ChatMessageRenderContext) => {
    return message.sender !== 'user' ? (
      <span style={{ color: '#c00000', fontWeight: 'bold', margin: '8px' }}>
        Customer Support BOLD
      </span>
    ) : null;
  };

  const messageContent = async ({ message }: ChatMessageRenderContext) =>
    await markdownRenderer(message);

  return (
    <IgrChat
      messages={messages}
      options={{
        disableAutoScroll: false,
        disableInputAttachments: false,
        inputPlaceholder: 'Type your message here...',
        headerText: 'Chat Header',
        renderers: {
          messageHeader,
          messageContent,
        },
      }}
      onMessageCreated={logEvent}
    ></IgrChat>
  );
}
