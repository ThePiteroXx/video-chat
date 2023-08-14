import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

import { Room, Message } from '@/types/roomApi';

import { RtmChannel, RtmMessage } from 'agora-rtm-sdk';

export type ChatHandle = {
  resetMessages: () => void;
};

type PannelChatProps = {
  userId: string;
  room: Room | null;
  clientChannel?: RtmChannel;
};

const PannelChat = forwardRef<ChatHandle, PannelChatProps>(
  ({ userId, room, clientChannel }, ref) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(
      ref,
      () => {
        return {
          resetMessages() {
            setMessages([]);
          },
        };
      },
      []
    );

    const onSubmit = async (e: React.SyntheticEvent) => {
      e.preventDefault();

      if (!inputRef.current?.value || !clientChannel) return;
      const value = inputRef.current.value;

      await clientChannel.sendMessage({ text: value });
      setMessages((prev) => [...prev, { userId, message: value }]);
      inputRef.current.value = '';
    };

    useEffect(() => {
      if (!clientChannel) return;

      const onMessage = (message: RtmMessage, userId: string) => {
        if (!message.text) return;
        setMessages((prev) => [...prev, { userId, message: message.text }]);
      };
      clientChannel.on('ChannelMessage', onMessage);

      return () => {
        clientChannel.off('ChannelMessage', onMessage);
      };
    }, [clientChannel]);

    return (
      <div>
        <ul>
          {messages.map(({ message, userId: id }, index) => (
            <li key={index}>
              {id === userId ? 'You: ' : 'Stranger: '}
              {message}
            </li>
          ))}
        </ul>
        <form onSubmit={onSubmit}>
          <input ref={inputRef} />
          <button disabled={!!!room}>submit</button>
        </form>
      </div>
    );
  }
);

PannelChat.displayName = 'PannelChat';

export default PannelChat;
