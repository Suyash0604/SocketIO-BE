import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import ReactMarkdown from 'react-markdown'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import './App.css'

function App() {
  const [socket, setSocket] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const newSocket = io('http://localhost:3000')
    setSocket(newSocket)

    newSocket.on('response', (data) => {
      setIsTyping(false)
      setMessages(prev => [...prev, { text: data.response, sender: 'bot', timestamp: new Date() }])
    })

    return () => newSocket.close()
  }, [])

  const sendMessage = () => {
    if (input.trim() && socket) {
      socket.emit('message', input)
      setMessages(prev => [...prev, { text: input, sender: 'user', timestamp: new Date() }])
      setInput('')
      setIsTyping(true)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage()
    }
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={`app ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h1 className="header-title">AI Chat Assistant</h1>
            <p className="header-subtitle">Powered by Socket.IO</p>
          </div>
        </div>
        <button
          onClick={toggleDarkMode}
          className="dark-mode-toggle"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      </header>

      {/* Messages Container */}
      <div className="chat-container">
        <div className="messages-container">
          {messages.length === 0 && (
            <div className="welcome-screen">
              <div className="welcome-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="welcome-title">Welcome to AI Chat</h3>
              <p className="welcome-text">Start a conversation with your AI assistant</p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender}`}
            >
              <div className="message-content">
                <div className="message-bubble">
                  {msg.sender === 'bot' ? (
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '')
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={docco}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{
                                margin: '12px 0',
                                borderRadius: '8px',
                                fontSize: '14px',
                                background: '#f8f9fa'
                              }}
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code
                              className="inline-code"
                              style={{
                                backgroundColor: msg.sender === 'user' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.9em',
                                fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Fira Code", monospace',
                                color: msg.sender === 'user' ? '#ffffff' : '#2563eb'
                              }}
                              {...props}
                            >
                              {children}
                            </code>
                          )
                        },
                        p: ({ children }) => (
                          <p style={{
                            margin: '8px 0',
                            lineHeight: '1.6',
                            wordWrap: 'break-word'
                          }}>
                            {children}
                          </p>
                        ),
                        strong: ({ children }) => (
                          <strong style={{
                            fontWeight: '600',
                            color: msg.sender === 'user' ? '#ffffff' : '#1e293b'
                          }}>
                            {children}
                          </strong>
                        ),
                        em: ({ children }) => (
                          <em style={{
                            fontStyle: 'italic',
                            color: msg.sender === 'user' ? '#e0e7ff' : '#64748b'
                          }}>
                            {children}
                          </em>
                        ),
                        ul: ({ children }) => (
                          <ul style={{
                            margin: '12px 0',
                            paddingLeft: '24px',
                            listStyleType: 'disc'
                          }}>
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol style={{
                            margin: '12px 0',
                            paddingLeft: '24px',
                            listStyleType: 'decimal'
                          }}>
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li style={{
                            margin: '6px 0',
                            lineHeight: '1.5'
                          }}>
                            {children}
                          </li>
                        ),
                        h1: ({ children }) => (
                          <h1 style={{
                            fontSize: '1.5em',
                            fontWeight: '700',
                            margin: '16px 0 8px 0',
                            color: msg.sender === 'user' ? '#ffffff' : '#1e293b',
                            borderBottom: msg.sender === 'bot' ? '2px solid #e2e8f0' : '2px solid rgba(255,255,255,0.3)',
                            paddingBottom: '4px'
                          }}>
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 style={{
                            fontSize: '1.3em',
                            fontWeight: '600',
                            margin: '14px 0 8px 0',
                            color: msg.sender === 'user' ? '#ffffff' : '#1e293b'
                          }}>
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 style={{
                            fontSize: '1.1em',
                            fontWeight: '600',
                            margin: '12px 0 6px 0',
                            color: msg.sender === 'user' ? '#ffffff' : '#1e293b'
                          }}>
                            {children}
                          </h3>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote style={{
                            borderLeft: msg.sender === 'user' ? '4px solid rgba(255,255,255,0.5)' : '4px solid #cbd5e1',
                            padding: '8px 16px',
                            margin: '12px 0',
                            backgroundColor: msg.sender === 'user' ? 'rgba(255,255,255,0.1)' : 'rgba(203,213,225,0.3)',
                            borderRadius: '0 8px 8px 0',
                            fontStyle: 'italic',
                            color: msg.sender === 'user' ? '#e0e7ff' : '#64748b'
                          }}>
                            {children}
                          </blockquote>
                        ),
                        a: ({ children, href }) => (
                          <a
                            href={href}
                            style={{
                              color: msg.sender === 'user' ? '#93c5fd' : '#3b82f6',
                              textDecoration: 'underline',
                              textDecorationColor: msg.sender === 'user' ? 'rgba(147,197,253,0.5)' : 'rgba(59,130,246,0.5)'
                            }}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        ),
                        hr: () => (
                          <hr style={{
                            border: 'none',
                            height: '1px',
                            backgroundColor: msg.sender === 'user' ? 'rgba(255,255,255,0.3)' : '#e2e8f0',
                            margin: '16px 0'
                          }} />
                        )
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    <div style={{
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      lineHeight: '1.5'
                    }}>
                      {msg.text}
                    </div>
                  )}
                </div>
                <span className="message-time">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="typing-indicator">
              <div className="typing-bubble">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Container */}
        <div className="input-container">
          <div className="input-wrapper">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="input-field"
              disabled={isTyping}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className="send-button"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App