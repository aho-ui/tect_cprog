'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken, isLoggedIn } from '@/lib/auth';
import { getBotReply } from '@/lib/chatAPI';

type Message = {
  sender: 'bot' | 'user';
  text: string;
};

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [token, setToken] = useState('');
  const [tokenCount, setTokenCount] = useState(0);
  const [profile, setProfile] = useState<{ age: string; bio: string }>({
    age: '',
    bio: '',
  });

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }

    const access = getAccessToken();
    if (!access) {
      console.warn('No token found, forcing logout');
      router.push('/login');
      return;
    }

    setToken(access);
    fetchProfile(access);
  }, []);

  const fetchProfile = async (accessToken: string) => {
    const res = await fetch('http://127.0.0.1:8000/api/profile/', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    setProfile({
      age: data.age?.toString() || '',
      bio: data.bio || '',
    });
  };

  const handleSend = async () => {
    const userMsg = input.trim();
    if (!userMsg) return;

    setMessages((prev) => [...prev, { sender: 'user' as const, text: userMsg }]);
    setInput('');

    const botResponse = await getBotReply(userMsg);
    const update: { age?: number; bio?: string } = {};

    if (botResponse.age) update.age = botResponse.age;
    if (botResponse.bio) update.bio = botResponse.bio;


    console.log('Will send to backend:', update);

    let replyText = botResponse.reply;

    if (Object.keys(update).length > 0) {
      await fetch('http://127.0.0.1:8000/api/profile/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(update),
      });

      setProfile({
        age: update.age !== undefined ? String(update.age) : profile.age,
        bio: update.bio !== undefined ? update.bio : profile.bio,
      });

      replyText = `✅ Profile updated!\n\n${replyText.replace(/AGE:.+?BIO:/i, '').trim()}`;
    }

    setTokenCount((prev) => prev + (botResponse.tokensUsed || 0));

    setMessages((prev) => [...prev, { sender: 'bot' as const, text: replyText }]);
  };

  return (
    <main className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Chat</h1>
      <div className="border p-4 mb-4 h-64 overflow-y-auto rounded bg-gray-800 text-white">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.sender === 'user' ? 'text-right' : ''}`}>
            <span className="inline-block">{msg.text}</span>
          </div>
        ))}
      </div>
      <input
        className="w-full p-2 border mb-2"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your answer..."
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        onClick={handleSend}
      >
        Send
      </button>

      <p className="text-sm text-right text-gray-400 mt-2">
        Tokens used this session: {tokenCount}
      </p>
    </main>
  );
}
