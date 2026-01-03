import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

// Icons
const RobotIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4" />
        <line x1="8" y1="16" x2="8" y2="16" />
        <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
);

const TrashIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
);

const VolumeIcon = ({ active }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {active ? (
            <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></>
        ) : (
            <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></>
        )}
    </svg>
);

const MicIcon = ({ listening }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={listening ? "#ff5f6d" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
);

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi there! 👋 I'm your ERP Assistant. How can I help you today?", sender: 'bot' }
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const messagesEndRef = useRef(null);
    const { user } = useAuth();
    const recognitionRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Cleanup speech synth on unmount
    useEffect(() => {
        return () => window.speechSynthesis.cancel();
    }, []);

    const clearChat = () => {
        if (window.confirm('Clear conversation history?')) {
            setMessages([{ text: "Conversation cleared. How can I help you?", sender: 'bot' }]);
            window.speechSynthesis.cancel();
        }
    };

    const toggleSpeech = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            setIsSpeaking(true);
        }
    };

    const speakText = (text) => {
        if (!isSpeaking) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        // Select a nice voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google US English')) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;
        utterance.rate = 1;
        window.speechSynthesis.speak(utterance);
    };

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Voice input is not supported in this browser.");
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInputText(transcript);
        };
        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!inputText.trim()) return;

        const userMessage = { text: inputText, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setLoading(true);

        try {
            const previousMessages = messages.slice(-5).map(m => ({
                text: m.text,
                sender: m.sender
            }));

            const response = await api.post('/chat', {
                message: userMessage.text,
                previousMessages
            });

            const botMessage = {
                text: response.data.reply,
                sender: 'bot'
            };
            setMessages(prev => [...prev, botMessage]);
            speakText(botMessage.text);

        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage = {
                text: "Sorry, I'm having trouble connecting right now.",
                sender: 'bot'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
            if (isListening) setIsListening(false);
        }
    };

    return (
        <>
            <button
                className={`chatbot-trigger ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title={isOpen ? "Close Chat" : "Open Assistant"}
            >
                {isOpen ? '✕' : <RobotIcon />}
            </button>

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div>
                            <h3>ERP Assistant</h3>
                            <span style={{ opacity: 0.8, fontSize: '11px' }}>{user?.role === 'admin' ? 'Administrator' : 'Faculty Member'}</span>
                        </div>
                        <div className="chatbot-header-actions">
                            <button
                                className={`icon-btn ${isSpeaking ? 'active' : ''}`}
                                onClick={toggleSpeech}
                                title={isSpeaking ? "Mute Voice" : "Enable Voice Output"}
                            >
                                <VolumeIcon active={isSpeaking} />
                            </button>
                            <button
                                className="icon-btn"
                                onClick={clearChat}
                                title="Clear Conversation"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                        {loading && (
                            <div className="message bot">
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chatbot-input-area" onSubmit={handleSend}>
                        <button
                            type="button"
                            className={`mic-btn ${isListening ? 'listening' : ''}`}
                            onClick={startListening}
                            title="Speak"
                        >
                            <MicIcon listening={isListening} />
                        </button>

                        <input
                            type="text"
                            placeholder={isListening ? "Listening..." : "Ask me anything..."}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            disabled={loading}
                        />
                        <button type="submit" className="chatbot-send" disabled={loading || !inputText.trim()}>
                            ➤
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default Chatbot;
