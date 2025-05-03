'use client';

import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Simple Chat Rooms</h1>
      </header>
      <LoginForm />
    </div>
  );
}