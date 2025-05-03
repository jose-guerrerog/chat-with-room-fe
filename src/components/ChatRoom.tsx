'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

interface Message {
  _id: string;
  room: string;
  username: string;
  message: string;
  timestamp: string;
}

interface ChatRoomProps {
  roomId: string;
}

let socket: Socket;

const ChatRoom = ({ roomId }: ChatRoomProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [error, setError] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  useEffect(() => {
    // Check if user is logged in
    const storedUsername = localStorage.getItem('username');
    if (!storedUsername) {
      router.push('/login');
      return;
    }
    
    setUsername(storedUsername);
    
    // Initialize socket connection
    socket = io(API_URL);
    
    // Join the room
    socket.emit('join-room', roomId, storedUsername);
    
    // Fetch previous messages
    fetchMessages();
    
    // Listen for new messages
    socket.on('receive-message', (message: Message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });
    
    // Clean up on component unmount
    return () => {
      socket.disconnect();
    };
  }, [roomId, router, API_URL]);
  
  // Scroll to bottom whenever messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/rooms/${roomId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to fetch messages. Please try again later.');
    }
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    socket.emit('send-message', {
      room: roomId,
      username,
      message: newMessage.trim()
    });
    
    setNewMessage('');
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="chat-room-container">
      <div className="chat-header">
        <Link href="/" className="back-btn">←</Link>
        <h2>Room: {roomId}</h2>
      </div>
      
      {error && <p className="error-message">{error}</p>}
      
      <div className="chat-messages">
        {messages.length === 0 ? (
          <p className="no-messages">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`message ${msg.username === username ? 'own-message' : 'other-message'}`}
            >
              <div className="message-header">
                <span className="message-username">{msg.username}</span>
                <span className="message-time">{formatTime(msg.timestamp)}</span>
              </div>
              <div className="message-content">{msg.message}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="chat-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="chat-input"
        />
        <button type="submit" className="btn-send">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;