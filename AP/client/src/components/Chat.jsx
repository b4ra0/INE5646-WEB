// components/Chat.jsx
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('/', { withCredentials: true });

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [scope, setScope] = useState('global'); // 'global' ou 'room'

  useEffect(() => {
    socket.on('chat-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => socket.off('chat-message');
  }, []);

  function send() {
    if (!text.trim()) return;
    socket.emit('chat-message', {
      roomId: scope === 'room' ? 'currentRoomId' : null,
      message: { text, at: new Date().toISOString() }
    });
    setText('');
  }

  return (
    <div className="border rounded p-2 h-64 flex flex-col bg-white dark:bg-slate-800">
      <div className="flex justify-between items-center mb-2 text-sm">
        <span>Chat</span>
        <select
          className="border rounded px-1"
          value={scope}
          onChange={e => setScope(e.target.value)}
        >
          <option value="room">Jogadores</option>
          <option value="global">Geral</option>
        </select>
      </div>
      <div className="flex-1 overflow-auto text-xs space-y-1">
        {messages.map((m, i) => (
          <div key={i}>{m.text}</div>
        ))}
      </div>
      <div className="mt-2 flex gap-1">
        <input
          className="flex-1 border rounded px-1 text-xs"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button className="px-2 border rounded text-xs" onClick={send}>
          Enviar
        </button>
      </div>
    </div>
  );
}
