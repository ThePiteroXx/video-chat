import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

import { Room, Message } from '@/types/roomApi';

import { RtmChannel, RtmMessage } from 'agora-rtm-sdk';

import styles from './PanelChat.module.css';

export type ChatHandle = {
  resetMessages: () => void;
};

type PannelChatProps = {
  userId: string;
  room: Room | null;
  clientChannel?: RtmChannel;
};

const indentifyUser = (myId: string, messageId: string) => {
  if (messageId === myId) return 'You';
  if (messageId === 'info') return 'Info';

  return 'Stranger';
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
      const onMemberLeft = () => {
        setMessages((prev) => [
          ...prev,
          { userId: 'info', message: 'Member has been disconnected from chat.' },
        ]);
      };

      const onMemberJoined = () => {
        setMessages((prev) => [
          ...prev,
          { userId: 'info', message: 'Member has joined your room' },
        ]);
      };

      clientChannel.on('ChannelMessage', onMessage);
      clientChannel.on('MemberLeft', onMemberLeft);
      clientChannel.on('MemberJoined', onMemberJoined);

      return () => {
        clientChannel.off('ChannelMessage', onMessage);
        clientChannel.off('MemberLeft', onMemberLeft);
        clientChannel.off('MemberJoined', onMemberJoined);
      };
    }, [clientChannel]);

    return (
      <div className={styles.wrapper}>
        <ul className={styles.messages}>
          {messages.map(({ message, userId: id }, index) => (
            <li key={index} className={id === 'info' ? styles.info : ''}>
              <span className={styles.user}>{indentifyUser(userId, id)}:</span> {message}
            </li>
          ))}
        </ul>
        <form onSubmit={onSubmit} className={styles.form}>
          <input ref={inputRef} className={styles.input} />
          <button disabled={!room} className={styles['submit-button']}>
            submit
          </button>
        </form>
      </div>
    );
  }
);

PannelChat.displayName = 'PannelChat';

export default PannelChat;
