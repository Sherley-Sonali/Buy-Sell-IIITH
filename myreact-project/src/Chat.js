import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import Navbar from './Navbar';
import './Chat.css';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [connectionError, setConnectionError] = useState(null);
    const [socket, setSocket] = useState(null);

    // Establish socket connection
    useEffect(() => {
        // Create socket connection
        const newSocket = io('http://localhost:5001', {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 5000,
            transports: ['websocket', 'polling']
        });

        // Connection success handler
        newSocket.on('connect', () => {
            console.log('Socket connected successfully');
            setConnectionError(null);
            setSocket(newSocket);
        });

        // Connection error handler
        newSocket.on('connect_error', (error) => {
            console.error('Detailed Socket Connection Error:', error);
            setConnectionError(error.message || 'Connection failed');
        });

        // Disconnection handler
        newSocket.on('disconnect', (reason) => {
            console.warn('Socket disconnected:', reason);
            setConnectionError(`Disconnected: ${reason}`);
        });

        // Cleanup on component unmount
        return () => {
            newSocket.disconnect();
        };
    }, []); // Empty dependency array means this effect runs once on mount

    // Message sending handler
    const sendMessage = useCallback(() => {
        if (socket && input.trim()) {
            // Emit message to server
            socket.emit('chat message', input, (response) => {
                // Update messages with user input and bot response
                setMessages((prevMessages) => [
                    ...prevMessages, 
                    { text: input, sender: 'user' },
                    { text: response, sender: 'bot' }
                ]);
                
                // Clear input after sending
                setInput('');
            });
        }
    }, [socket, input]);

    // Handle input submission via enter key
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <div className="chat-container" >
            <Navbar />
            <br/><br/>
            {/* Connection Error Display */}
            {connectionError && (
                <div style={{ 
                    color: 'red', 
                    border: '1px solid red', 
                    padding: '10px', 
                    marginBottom: '15px',
                    borderRadius: '5px'
                }}>
                    Connection Error: {connectionError}
                </div>
            )}

            {/* Message Display Area */}
            <div className="messages">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        style={{ 
                            textAlign: msg.sender === 'user' ? 'right' : 'left',
                            margin: '10px 0',
                            padding: '8px',
                            borderRadius: '5px',
                            backgroundColor: msg.sender === 'user' ? '#e6f2ff' : '#f0f0f0',
                            maxWidth: '80%',
                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                        }}
                    >
                        {msg.text}
                    </div>
                ))}
            </div>

            {/* Message Input Area */}
            <div className="input-area">
                <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid #ccc'
                    }}
                />
                <button 
                    onClick={sendMessage}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chat;