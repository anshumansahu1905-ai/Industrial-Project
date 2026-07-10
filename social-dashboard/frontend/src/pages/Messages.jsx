import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import AppShell from '../components/layout/AppShell.jsx';
import ConversationList from '../components/ConversationList.jsx';
import ChatWindow from '../components/ChatWindow.jsx';

export default function Messages() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    client.get('/messages').then((res) => setConversations(res.data.conversations));
  }, [username]);

  return (
    <AppShell title="Messages">
      <div className="border border-hair rounded-2xl bg-surface flex h-[70vh] -mx-2 md:mx-0 overflow-hidden">
        <ConversationList
          conversations={conversations}
          activeUsername={username}
          onSelect={(u) => navigate(`/messages/${u}`)}
        />
        <ChatWindow username={username} />
      </div>
    </AppShell>
  );
}
