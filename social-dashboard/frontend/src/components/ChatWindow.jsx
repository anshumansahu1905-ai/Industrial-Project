import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';

export default function ChatWindow({ username }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [draft, setDraft] = useState('');
  const [otherTyping, setOtherTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    if (!username) return;
    client.get(`/messages/${username}`).then((res) => {
      setMessages(res.data.messages);
      setOtherUser(res.data.otherUser);
    });
  }, [username]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket) return undefined;
    const onMessage = (payload) => {
      if (otherUser && (payload.sender === otherUser.id || payload.recipient === otherUser.id)) {
        setMessages((prev) => [...prev, payload]);
      }
    };
    const onTyping = ({ from, isTyping }) => {
      if (otherUser && from === otherUser.id) setOtherTyping(isTyping);
    };
    socket.on('message:new', onMessage);
    socket.on('typing', onTyping);
    return () => {
      socket.off('message:new', onMessage);
      socket.off('typing', onTyping);
    };
  }, [socket, otherUser]);

  function handleTyping(value) {
    setDraft(value);
    if (!socket || !otherUser) return;
    socket.emit('typing', { recipientId: otherUser.id, isTyping: true });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('typing', { recipientId: otherUser.id, isTyping: false });
    }, 1500);
  }

  function send(e) {
    e.preventDefault();
    if (!draft.trim() || !socket || !otherUser) return;
    socket.emit('message:send', { recipientId: otherUser.id, body: draft });
    setDraft('');
  }

  if (!username) {
    return <div className="flex-1 flex items-center justify-center text-muted text-sm">Select a conversation.</div>;
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="px-5 py-3.5 border-b border-hair">
        <p className="text-sm font-medium">{otherUser?.displayName}</p>
        <p className="text-xs text-muted font-mono">{otherTyping ? 'typing…' : `@${otherUser?.username || username}`}</p>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 flex flex-col gap-2.5">
        {messages.map((m) => {
          const mine = m.sender === user.id;
          return (
            <div key={m.id || m._id} className={`max-w-[70%] ${mine ? 'self-end' : 'self-start'}`}>
              <div
                className={`px-3.5 py-2 rounded-2xl text-sm ${
                  mine ? 'bg-sage text-ink rounded-br-sm' : 'bg-surfaceAlt rounded-bl-sm'
                }`}
              >
                {m.body}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="border-t border-hair p-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Write a message"
          className="flex-1 bg-surface border border-hair rounded-lg px-3 py-2 text-sm outline-none focus:border-sage"
        />
        <button type="submit" className="w-9 h-9 rounded-lg bg-sage text-ink flex items-center justify-center hover:bg-sageDeep transition-colors">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
