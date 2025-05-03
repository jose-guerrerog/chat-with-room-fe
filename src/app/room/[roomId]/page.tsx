'use client';

import ChatRoom from '@/components/ChatRoom';
import { useParams } from 'next/navigation';

export default function RoomPage() {
  // Use the useParams hook to get the roomId
  const params = useParams();
  const roomId = params.roomId as string;
  
  return <ChatRoom roomId={roomId} />;
}