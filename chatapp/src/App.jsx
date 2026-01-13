import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import ChatPage from './components/ChatPage';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  // Check if user is already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <div className="app">
      {!currentUser ? (
        <AuthPage 
          onAuthSuccess={handleAuthSuccess} 
          isLogin={isLogin}
          onToggleMode={toggleAuthMode}
        />
      ) : (
        <ChatPage currentUser={currentUser} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;