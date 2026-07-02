document.addEventListener('DOMContentLoaded', () => {
  const scriptTag = document.currentScript || document.querySelector('script[src*="chatbot.js"]');
  const logoPath = scriptTag ? new URL('../images/setconnect-logo.png', scriptTag.src).href : '/images/setconnect-logo.png';
  let apiUrl = '/api/chat';
  let chatHistory = [];
  if (scriptTag) {
    try {
      const url = new URL('../api/chat', scriptTag.src);
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        url.port = '5000'; // Force backend port for local development
        apiUrl = url.href;
      } else if (url.protocol === 'file:') {
        apiUrl = 'http://localhost:5000/api/chat'; // Fallback for file:// protocol
      } else {
        apiUrl = url.href;
      }
    } catch (e) {
      apiUrl = '/api/chat';
    }
  }

  const greetings = [
    "Hello! I'm the SetConnect AI assistant. How can I help you today?",
    "Hi there! I'm the SetConnect AI. Are you looking to book a call with our team today?<br><div class='chat-link-card' onclick='window.location.href=\"/contact.html\"'><div class='card-icon'>📞</div><div class='card-content'><strong>Book Discovery Call</strong><span>Speak with our AI experts</span></div><span class='card-arrow'>→</span></div>",
    "Welcome! I'm the SetConnect AI. Want to stay updated?<br><div class='chat-link-card' onclick='window.location.href=\"/ai-blogs.html\"'><div class='card-icon'>✉️</div><div class='card-content'><strong>Subscribe to Newsletter</strong><span>Weekly AI insights</span></div><span class='card-arrow'>→</span></div>",
    "Hello! I'm your SetConnect guide.<br><div class='chat-link-card' onclick='window.location.href=\"/Documents/4steps/discovery.html\"'><div class='card-icon'>📘</div><div class='card-content'><strong>Download AI Playbook</strong><span>Learn our exact process</span></div><span class='card-arrow'>→</span></div>",
    "Hi! I'm the SetConnect AI. Learn about our 4-Step Framework:<br><div class='chat-link-card' onclick='window.location.href=\"/Documents/4steps/discovery.html\"'><div class='card-icon'>📑</div><div class='card-content'><strong>Get Discovery PDF</strong><span>Identify AI bottlenecks</span></div><span class='card-arrow'>→</span></div>"
  ];
  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

  // Inject HTML for the chat widget
  const chatHTML = `
    <div id="chat-widget-container">
      <div id="chat-window">
        <div id="chat-header">
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div class="avatar-container">
                <img src="${logoPath}" alt="SetConnect AI Avatar" style="width: 42px; height: 42px; border-radius: 50%; object-fit: contain; background: #0a192f; padding: 4px; border: 1px solid #0891b2;">
                <div class="avatar-online-dot"></div>
              </div>
              <div class="chat-header-info">
                <h3 style="display: flex; align-items: center; gap: 8px; margin: 0; font-size: 1.1rem; color: #ffffff; font-weight: 600;">
                  SetConnect Guide
                </h3>
                <p style="margin: 4px 0 0; font-size: 0.8rem; color: rgba(255, 255, 255, 0.8);">AI Discovery Assistant</p>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <button id="chat-close">&times;</button>
            </div>
          </div>
        </div>
        <div id="chat-messages">
          <div class="message bot">
            <div style="display: flex; gap: 8px; align-items: flex-start;">
              <div class="avatar-container">
                <img src="${logoPath}" alt="SetConnect AI" style="width: 28px; height: 28px; border-radius: 50%; object-fit: contain; background: #0a192f; padding: 3px; border: 1px solid #0891b2;">
                <div class="avatar-online-dot" style="width: 8px; height: 8px; border-width: 1.5px;"></div>
              </div>
              <div style="margin-top: 4px;">${randomGreeting}</div>
            </div>
          </div>
        </div>
        <div id="chat-input-area">
          <form id="chat-form">
            <input type="text" id="chat-input" placeholder="Type your question..." autocomplete="off">
            <button type="button" id="chat-mic" class="chat-mic-btn" title="Use Voice">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
            </button>
            <button type="submit" id="chat-submit">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
        </div>
      </div>
      <div id="chat-launcher">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', chatHTML);

  const launcher = document.getElementById('chat-launcher');
  const chatWindow = document.getElementById('chat-window');
  const closeBtn = document.getElementById('chat-close');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  const submitBtn = document.getElementById('chat-submit');
  const micBtn = document.getElementById('chat-mic');

  let isOpen = false;
  let isRecording = false;

  // Speech Recognition setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = function() {
      isRecording = true;
      micBtn.classList.add('recording');
      chatInput.placeholder = 'Listening...';
    };

    recognition.onresult = function(event) {
      const transcript = event.results[0][0].transcript;
      chatInput.value = transcript;
    };

    recognition.onerror = function(event) {
      console.error('Speech recognition error', event.error);
      stopRecording();
    };

    recognition.onend = function() {
      stopRecording();
    };
  } else {
    if (micBtn) micBtn.style.display = 'none'; // Hide if not supported
  }

  function stopRecording() {
    isRecording = false;
    micBtn.classList.remove('recording');
    chatInput.placeholder = 'Type your question...';
    chatInput.focus();
  }

  if (micBtn) {
    micBtn.addEventListener('click', () => {
      if (!recognition) return;
      if (isRecording) {
        recognition.stop();
      } else {
        recognition.start();
      }
    });
  }

  function toggleChat() {
    isOpen = !isOpen;
    if (isOpen) {
      chatWindow.classList.add('active');
      chatInput.focus();
    } else {
      chatWindow.classList.remove('active');
    }
  }

  launcher.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);

  function addMessage(text, sender, quickReplies = []) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    
    if (sender === 'bot') {
      msgDiv.innerHTML = `
        <div style="display: flex; gap: 8px; align-items: flex-start;">
          <div class="avatar-container">
            <img src="${logoPath}" alt="SetConnect AI" style="width: 28px; height: 28px; border-radius: 50%; object-fit: contain; background: #0a192f; padding: 3px; border: 1px solid #0891b2;">
            <div class="avatar-online-dot" style="width: 8px; height: 8px; border-width: 1.5px;"></div>
          </div>
          <div style="margin-top: 4px;">${text}</div>
        </div>
      `;
    } else {
      msgDiv.innerHTML = text;
    }
    chatMessages.appendChild(msgDiv);
    

    if (quickReplies && quickReplies.length > 0) {
      const qrDiv = document.createElement('div');
      qrDiv.style.display = 'flex';
      qrDiv.style.gap = '8px';
      qrDiv.style.marginTop = '8px';
      qrDiv.style.marginLeft = '40px';
      qrDiv.style.flexWrap = 'wrap';
      
      quickReplies.forEach(qr => {
        const btn = document.createElement('button');
        btn.textContent = qr;
        btn.style.padding = '6px 12px';
        btn.style.borderRadius = '16px';
        btn.style.border = '1px solid var(--chat-primary)';
        btn.style.background = 'transparent';
        btn.style.color = 'var(--chat-primary)';
        btn.style.cursor = 'pointer';
        btn.style.fontSize = '0.85rem';
        btn.style.transition = 'all 0.2s';
        
        btn.onmouseover = () => {
          btn.style.background = 'var(--chat-primary)';
          btn.style.color = 'white';
        };
        btn.onmouseout = () => {
          btn.style.background = 'transparent';
          btn.style.color = 'var(--chat-primary)';
        };
        
        btn.onclick = () => {
          qrDiv.remove();
          chatInput.value = qr;
          chatForm.dispatchEvent(new Event('submit'));
        };
        
        qrDiv.appendChild(btn);
      });
      chatMessages.appendChild(qrDiv);
    }
    
    if (sender === 'user') {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    } else {
      // For bot messages, scroll so the top of the new message is visible
      msgDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.classList.add('typing-indicator');
    indicator.id = 'typing-indicator';
    indicator.innerHTML = `
      <div style="display: flex; gap: 8px; align-items: flex-start;">
        <div class="avatar-container">
          <img src="${logoPath}" alt="SetConnect AI" style="width: 28px; height: 28px; border-radius: 50%; object-fit: contain; background: #0a192f; padding: 3px; border: 1px solid #0891b2;">
          <div class="avatar-online-dot" style="width: 8px; height: 8px; border-width: 1.5px;"></div>
        </div>
        <div style="display: flex; align-items: center; gap: 4px; margin-top: 10px;">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message to UI
    addMessage(message, 'user');
    chatInput.value = '';
    submitBtn.disabled = true;

    // Show typing animation
    showTypingIndicator();

    try {
      // Append user message to history
      chatHistory.push({ role: 'user', content: message });
      // Keep only last 12 messages (6 user, 6 bot)
      if (chatHistory.length > 12) chatHistory = chatHistory.slice(chatHistory.length - 12);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, history: chatHistory })
      });

      const data = await response.json();
      
      removeTypingIndicator();
      
      if (response.ok && data.reply) {
        // Append bot message to history
        chatHistory.push({ role: 'bot', content: data.reply });
        
        addMessage(data.reply, 'bot', data.quickReplies || []);
        
        if (data.action && data.action.type === 'submitContactForm') {
          showTypingIndicator();
          try {
            const formData = new FormData();
            formData.append('name', data.action.formData.name || 'NA');
            formData.append('email', data.action.formData.email || 'NA');
            formData.append('message', data.action.formData.message || 'NA');
            formData.append('_subject', 'New Contact Form Submission via AI Chatbot');

            await fetch('https://formsubmit.co/ajax/nishanthattarki23@gmail.com', {
                method: 'POST',
                body: formData
            });
            
            removeTypingIndicator();
            addMessage("Thank you! Your details have been successfully submitted. Our team will be in touch shortly.", 'bot');
          } catch (formError) {
            removeTypingIndicator();
            console.error('Form Submit Error:', formError);
            addMessage("I've collected your details, but there was an error sending them to our team. Please try the contact page.", 'bot');
          }
        }
      } else {
        addMessage("Sorry, I'm having trouble connecting to the server right now.", 'bot');
      }
    } catch (error) {
      console.error('Chat Error:', error);
      removeTypingIndicator();
      addMessage(`Debug Info - Error: ${error.message} | URL: ${apiUrl}`, 'bot');
    } finally {
      submitBtn.disabled = false;
      chatInput.focus();
    }
  });
});
