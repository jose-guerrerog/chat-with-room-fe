'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

interface Room {
  _id: string;
  name: string;
  createdAt: string;
}

let socket: Socket;

const RoomList = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [username, setUsername] = useState<string>('');
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
    
    // Initialize socket
    socket = io(API_URL);
    
    // Fetch all rooms on component mount
    fetchRooms();
    
    // Listen for new room creation events
    socket.on('room-created', (room: Room) => {
      setRooms(prevRooms => {
        // Check if room already exists
        if (prevRooms.some(r => r._id === room._id)) {
          return prevRooms;
        }
        return [room, ...prevRooms];
      });
    });
    
    return () => {
      socket.off('room-created');
      socket.disconnect();
    };
  }, [API_URL, router]);
  
  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/rooms`);
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Failed to fetch rooms. Please try again later.');
    }
  };
  
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRoomName.trim()) {
      setError('Room name cannot be empty');
      return;
    }
    
    try {
      await axios.post(`${API_URL}/api/rooms`, { name: newRoomName.trim() });
      setNewRoomName('');
      setError('');
    } catch (error) {
      console.error('Error creating room:', error);
      setError('Failed to create room. Please try again.');
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('username');
    router.push('/login');
  };
  
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Chat Rooms</h1>
        {username && (
          <div className="user-info">
            <span>Logged in as: {username}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        )}
      </header>
      
      <div className="room-list-container">
        <h2>Available Chat Rooms</h2>
        
        <form onSubmit={handleCreateRoom} className="create-room-form">
          <div className="form-group">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="New room name"
              className="form-control"
            />
            <button type="submit" className="btn-create">
              Create Room
            </button>
          </div>
          {error && <p className="error-message">{error}</p>}
        </form>
        
        <div className="rooms-grid">
          {rooms.length === 0 ? (
            <p>No rooms available. Create one to get started!</p>
          ) : (
            rooms.map((room) => (
              <div key={room._id} className="room-card">
                <h3>{room.name}</h3>
                <Link
                  href={`/room/${room.name}`}
                  className="btn-join"
                >
                  Join Room
                </Link>
                <p className="room-created">
                  Created: {new Date(room.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomList;