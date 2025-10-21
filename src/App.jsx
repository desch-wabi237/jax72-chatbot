import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- Définitions et Constantes Globales ---
const PROMO_CODE = "JAX72";
const BOT_NAME = "INTERPRONOSTIC";

// Liens affiliés et sociaux
const AFFILIATE_LINK_1XBET = "https://refpa58144.com/L?tag=d_4708581m_1573c_&site=4708581&ad=1573";
const AFFILIATE_LINK_MELBET = "https://lien-melbet-a-remplacer.com";
const WHATSAPP_LINK = "https://whatsapp.com/channel/0029VbBRgnhEawdxneZ5To1i";
const TELEGRAM_LINK = "https://t.me/+tuopCS5aGEk3ZWZk";

// La route API
const API_ROUTE = "/api/chat";

// --- LOGIQUE D'INTÉGRATION GEMINI ---
const getAiResponse = async (userQuery, maxRetries = 2) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            console.log(`🔄 Tentative ${attempt + 1} pour: ${userQuery}`);
            
            const response = await fetch(API_ROUTE, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ userQuery }) 
            });

            console.log(`📨 Statut réponse: ${response.status}`);

            if (!response.ok) {
                let errorText;
                try {
                    errorText = await response.text();
                } catch (e) {
                    errorText = `Erreur HTTP: ${response.status}`;
                }
                throw new Error(errorText || `Erreur Serverless: ${response.status}`);
            }

            const text = await response.text();
            console.log(`✅ Réponse reçue: ${text.substring(0, 100)}...`);
            
            if (text && text.trim().length > 0) {
                return text;
            } else {
                throw new Error("Réponse de l'API vide.");
            }

        } catch (error) {
            console.error(`❌ Tentative ${attempt + 1} échouée:`, error.message);
            
            if (attempt === maxRetries - 1) {
                // Dernière tentative échouée
                return `🚨 Service temporairement indisponible. \n\n🎯 **Code promo : ${PROMO_CODE}** \n\n🎰 Inscrivez-vous sur 1xBet : ${AFFILIATE_LINK_1XBET} \n⚽ Ou sur Melbet : ${AFFILIATE_LINK_MELBET}`;
            }
            
            // Attente progressive
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
    }
};
// --- Composant Principal de l'Application ---
const App = () => {
    const [messages, setMessages] = useState([
        { 
            id: 1, 
            text: `👋 Bonjour ! Je suis **${BOT_NAME}**, votre assistant expert pour les meilleurs bonus de paris sportifs. Je vous aide à obtenir le **BONUS MAXIMAL** sur 1xBet et Melbet grâce au code promo **${PROMO_CODE}**. 🎯`, 
            sender: 'bot', 
            isTyping: false 
        }
    ]);
    const [input, setInput] = useState('');
    const [isBotTyping, setIsBotTyping] = useState(false);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const formatMessageText = useCallback((text) => {
        let parts = text.split(/(\s(https?:\/\/[^\s]+))/g);
        const regexBold = /\*\*(.*?)\*\*/g;

        return parts.map((part, index) => {
            if (part.startsWith(' https://') || part.startsWith('https://')) {
                const url = part.trim();
                let display = url.length > 50 ? url.substring(0, 50) + '...' : url;
                
                if (url === AFFILIATE_LINK_1XBET) display = "🎰 S'inscrire sur 1xBet";
                if (url === AFFILIATE_LINK_MELBET) display = "⚽ S'inscrire sur Melbet";
                if (url === WHATSAPP_LINK) display = "💬 Rejoindre WhatsApp";
                if (url === TELEGRAM_LINK) display = "📢 Rejoindre Telegram";
                
                return (
                    <a 
                        key={index} 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="link-anchor"
                    >
                        {display}
                    </a>
                );
            }
            
            const textWithBold = part.split(regexBold).map((subPart, i) => {
                if (i % 2 === 1) {
                    return <strong key={i} className="promo-code-bold">{subPart}</strong>;
                }
                return subPart;
            });

            return <span key={index}>{textWithBold}</span>;
        });
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        const trimmedInput = input.trim();
        if (!trimmedInput) return;
        
        const newUserMessage = { 
            id: Date.now(), 
            text: trimmedInput, 
            sender: 'user', 
            isTyping: false 
        };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        
        setIsBotTyping(true);
        let botResponseText = "";

        try {
            botResponseText = await getAiResponse(trimmedInput);
        } catch (error) {
            console.error("Erreur de traitement:", error);
            botResponseText = "🚨 Une erreur inattendue est survenue.";
        } finally {
            setIsBotTyping(false);
        }

        setTimeout(() => {
            const newBotMessage = {
                id: Date.now() + 1,
                text: botResponseText,
                sender: 'bot',
                isTyping: false
            };
            setMessages(prev => [...prev, newBotMessage]);
        }, 300); 
    };

    // --- Composant d'une Bulle de Message ---
    const MessageBubble = ({ message }) => {
        const isBot = message.sender === 'bot';
        
        return (
            <div className={`message-row ${isBot ? 'bot-row' : 'user-row'}`}>
                {isBot && (
                    <div className="bot-avatar">
                        <div className="avatar-icon">🤖</div>
                    </div>
                )}
                <div 
                    className={`message-bubble ${isBot ? 'bot-bubble' : 'user-bubble'}`}
                >
                    {formatMessageText(message.text)}
                </div>
                {!isBot && (
                    <div className="user-avatar">
                        <div className="avatar-icon">👤</div>
                    </div>
                )}
            </div>
        );
    };

    // --- Rendu de l'interface ---
    return (
        <div className="app-container">
            {/* Styles CSS */}
            <style jsx="true">{`
                :root {
                    --color-primary: #f59e0b;
                    --color-secondary: #10b981;
                    --color-background: #0f172a;
                    --color-card: #1e293b;
                    --color-bot-bubble: #334155;
                    --color-user-bubble: #2563eb;
                    --color-text-light: #f8fafc;
                    --color-promo-code: #facc15;
                    --color-1xbet: #1d4ed8;
                    --color-melbet: #f59e0b;
                }

                .app-container {
                    min-height: 100vh;
                    background: var(--color-background);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                    font-family: 'Segoe UI', system-ui, sans-serif;
                }
                
                .chat-card {
                    width: 100%;
                    max-width: 1024px;
                    height: 90vh;
                    display: flex;
                    flex-direction: column;
                    border-radius: 20px;
                    background: var(--color-card);
                    overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }

                .chat-header {
                    padding: 20px;
                    background: linear-gradient(135deg, #1e293b, #334155);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .header-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .logo-container {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #f59e0b, #fbbf24);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 18px;
                    color: #1e293b;
                }

                .header-title {
                    font-size: 22px;
                    font-weight: 800;
                    color: var(--color-text-light);
                    margin: 0;
                }

                .header-subtitle {
                    font-size: 14px;
                    color: var(--color-promo-code);
                    font-weight: 600;
                }

                .register-buttons-container {
                    display: flex;
                    gap: 10px;
                }

                .register-button {
                    padding: 10px 20px;
                    font-size: 14px;
                    font-weight: 700;
                    border-radius: 12px;
                    transition: all 0.3s ease;
                    color: white;
                    text-decoration: none;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                }

                .register-button.xbet {
                    background: linear-gradient(135deg, var(--color-1xbet), #3b82f6);
                }

                .register-button.melbet {
                    background: linear-gradient(135deg, var(--color-melbet), #fbbf24);
                }

                .register-button:hover {
                    transform: translateY(-2px);
                }

                .messages-area {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .message-row {
                    display: flex;
                    align-items: flex-end;
                    gap: 8px;
                }

                .bot-row {
                    justify-content: flex-start;
                }

                .user-row {
                    justify-content: flex-end;
                }

                .avatar-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    background: rgba(255, 255, 255, 0.1);
                }

                .message-bubble {
                    max-width: 70%;
                    padding: 16px 20px;
                    border-radius: 18px;
                    font-size: 15px;
                    line-height: 1.5;
                    color: var(--color-text-light);
                }

                .bot-bubble {
                    background: var(--color-bot-bubble);
                    border-bottom-left-radius: 4px;
                }

                .user-bubble {
                    background: var(--color-user-bubble);
                    border-bottom-right-radius: 4px;
                }

                .promo-code-bold {
                    font-weight: 800;
                    color: var(--color-promo-code);
                }
                
                .link-anchor {
                    font-size: 14px;
                    font-weight: 700;
                    text-decoration: none;
                    color: #4ade80;
                    background: rgba(16, 185, 129, 0.2);
                    padding: 8px 16px;
                    border-radius: 8px;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    margin: 6px 0;
                    transition: all 0.3s ease;
                }

                .link-anchor:hover {
                    background: rgba(16, 185, 129, 0.3);
                    transform: translateY(-1px);
                }

                .typing-indicator-container {
                    display: flex;
                    justify-content: flex-start;
                    margin-bottom: 16px;
                }

                .typing-indicator-dots {
                    padding: 16px 20px;
                    border-radius: 18px;
                    background: var(--color-bot-bubble);
                    border-bottom-left-radius: 4px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .dot {
                    height: 8px;
                    width: 8px;
                    background: var(--color-promo-code);
                    border-radius: 50%;
                    animation: bounce 1.4s infinite;
                }

                .dot:nth-child(2) { animation-delay: 0.1s; }
                .dot:nth-child(3) { animation-delay: 0.2s; }

                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }

                .input-form {
                    padding: 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    background: rgba(30, 41, 59, 0.8);
                    gap: 12px;
                }

                .chat-input {
                    flex: 1;
                    padding: 16px 20px;
                    border-radius: 16px;
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.05);
                    color: var(--color-text-light);
                    font-size: 15px;
                    outline: none;
                }

                .chat-input:focus {
                    border-color: var(--color-primary);
                }

                .chat-button {
                    padding: 16px 28px;
                    border-radius: 16px;
                    font-weight: 700;
                    background: linear-gradient(135deg, #f59e0b, #fbbf24);
                    color: #1e293b;
                    border: none;
                    cursor: pointer;
                }

                .footer-links {
                    position: absolute;
                    bottom: 16px;
                    right: 16px;
                    display: flex;
                    gap: 16px;
                    align-items: center;
                    background: rgba(30, 41, 59, 0.9);
                    padding: 12px 20px;
                    border-radius: 16px;
                }

                .footer-link {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    text-decoration: none;
                    color: var(--color-text-light);
                    font-weight: 600;
                    font-size: 13px;
                    padding: 8px 16px;
                    border-radius: 10px;
                }

                .footer-link.whatsapp {
                    background: rgba(37, 211, 102, 0.1);
                }

                .footer-link.telegram {
                    background: rgba(0, 136, 204, 0.1);
                }

                .promo-badge {
                    background: linear-gradient(135deg, #f59e0b, #fbbf24);
                    color: #1e293b;
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-weight: 800;
                    font-size: 12px;
                }

                @media (max-width: 768px) {
                    .chat-card {
                        height: 95vh;
                        border-radius: 0;
                    }
                    .chat-header {
                        padding: 16px;
                        flex-wrap: wrap;
                        gap: 12px;
                    }
                    .register-buttons-container {
                        width: 100%;
                        justify-content: center;
                    }
                    .message-bubble {
                        max-width: 85%;
                    }
                }
            `}</style>

            <div className="chat-card">
                <div className="chat-header">
                    <div className="header-content">
                        <div className="logo-container">
                            J72
                        </div>
                        <div className="header-text">
                            <h1 className="header-title">
                                {BOT_NAME}
                            </h1>
                            <span className="header-subtitle">
                                Code Promo: {PROMO_CODE}
                            </span>
                        </div>
                    </div>

                    <div className="register-buttons-container">
                        <a href={AFFILIATE_LINK_1XBET} target="_blank" rel="noopener noreferrer" className="register-button xbet">
                            🎰 1xBet
                        </a>
                        <a href={AFFILIATE_LINK_MELBET} target="_blank" rel="noopener noreferrer" className="register-button melbet">
                            ⚽ Melbet
                        </a>
                    </div>
                </div>

                <div className="messages-area">
                    {messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                    ))}
                    
                    {isBotTyping && (
                        <div className="typing-indicator-container">
                            <div className="typing-indicator-dots">
                                <span className="dot"></span>
                                <span className="dot"></span>
                                <span className="dot"></span>
                            </div>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="input-form">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="💬 Posez votre question ou demandez le code promo..."
                        disabled={isBotTyping} 
                        className="chat-input"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isBotTyping} 
                        className="chat-button"
                    >
                        Envoyer 🚀
                    </button>
                </form>
            </div>
        </div>
    );
};

export default App;