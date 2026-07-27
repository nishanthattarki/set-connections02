function initChatbot() {
  const scriptTag = document.currentScript || document.querySelector('script[src*="chatbot.js"]');
  const logoPath = scriptTag ? new URL('../images/valoris.png', scriptTag.src).href : '/images/valoris.png';
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
    "Hello! I am Valoris - your Trusted AI Navigator. How can I help you today?",
    "Hi there! I am Valoris - your Trusted AI Navigator. Are you looking to book a call with our team today?<br><div class='chat-link-card' onclick='openBookingModal()'><div class='card-icon'>📞</div><div class='card-content'><strong>Book Discovery Call</strong><span>Speak with our AI experts</span></div><span class='card-arrow'>→</span></div>",
    "Welcome! I am Valoris - your Trusted AI Navigator. Want to stay updated?<br><div class='chat-link-card' onclick='window.open(\"/ai-blogs.html\", \"_blank\")'><div class='card-icon'>✉️</div><div class='card-content'><strong>Subscribe to Newsletter</strong><span>Weekly AI insights</span></div><span class='card-arrow'>→</span></div>",
    "Hello! I am Valoris - your Trusted AI Navigator.<br><div class='chat-link-card' onclick='window.open(\"/Documents/4steps/discovery.html\", \"_blank\")'><div class='card-icon'>📘</div><div class='card-content'><strong>Download AI Playbook</strong><span>Learn our exact process</span></div><span class='card-arrow'>→</span></div>",
    "Hi! I am Valoris - your Trusted AI Navigator. Learn about our 4-Step Framework:<br><div class='chat-link-card' onclick='window.open(\"/Documents/4steps/discovery.html\", \"_blank\")'><div class='card-icon'>📑</div><div class='card-content'><strong>Get Discovery PDF</strong><span>Identify AI bottlenecks</span></div><span class='card-arrow'>→</span></div>"
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
                <img src="${logoPath}" alt="Valoris AI Avatar" style="width: 42px; height: 42px; border-radius: 50%; object-fit: contain; background: #0a192f; padding: 4px; border: 1px solid #0891b2;">
                <div class="avatar-online-dot"></div>
              </div>
              <div class="chat-header-info">
                <h3 style="display: flex; align-items: center; gap: 8px; margin: 0; font-size: 1.1rem; color: #ffffff; font-weight: 600;">
                  Valoris
                </h3>
                <p style="margin: 4px 0 0; font-size: 0.8rem; color: rgba(255, 255, 255, 0.8);">Your Trusted AI Navigator</p>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <div id="voice-waves">
                <div class="wave"></div>
                <div class="wave"></div>
                <div class="wave"></div>
                <div class="wave"></div>
                <div class="wave"></div>
              </div>
              <button id="chat-close">&times;</button>
            </div>
          </div>
        </div>
        <div id="chat-messages">
          <div class="message bot">
            <div style="display: flex; gap: 8px; align-items: flex-start;">
              <div class="avatar-container">
                <img src="${logoPath}" alt="Valoris AI" style="width: 28px; height: 28px; border-radius: 50%; object-fit: contain; background: #0a192f; padding: 3px; border: 1px solid #0891b2;">
                <div class="avatar-online-dot" style="width: 8px; height: 8px; border-width: 1.5px;"></div>
              </div>
              <div style="margin-top: 4px;">${randomGreeting}</div>
            </div>
          </div>
        </div>
        <div id="chat-input-area" style="position: relative;">
          <div id="chat-image-preview" style="display: none; position: absolute; bottom: 100%; left: 0; padding: 8px; background: #0a192f; border: 1px solid #0891b2; border-radius: 8px; margin-bottom: 8px; align-items: center; gap: 8px;">
            <img id="preview-img" style="max-height: 50px; max-width: 50px; border-radius: 4px; object-fit: cover;">
            <button type="button" id="remove-image" style="background: none; border: none; cursor: pointer; color: #ff4444; font-size: 1.2rem; display: flex; align-items: center; justify-content: center;">&times;</button>
          </div>
          <form id="chat-form">
            <input type="file" id="chat-file-input" accept="image/*" style="display: none;">
            <button type="button" id="chat-attach" class="chat-attach-btn" title="Attach Image" style="background: none; border: none; cursor: pointer; padding: 8px; color: #0891b2; display: flex; align-items: center; justify-content: center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
            </button>
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

  const bookingModalHTML = `
    <div id="booking-modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 10000; align-items: center; justify-content: center;">
      <div style="position: relative; width: 90%; max-width: 1000px; height: 90%; max-height: 700px; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <button onclick="closeBookingModal()" style="position: absolute; top: 10px; right: 20px; background: #f0f0f0; border: none; font-size: 28px; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; z-index: 10001; display: flex; align-items: center; justify-content: center; color: #333;">&times;</button>
        <iframe src="https://calendar.app.google/9kk7CgBRL1VKyfQ87?gv=true" style="width: 100%; height: 100%; border: none;"></iframe>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', chatHTML + bookingModalHTML);

  window.openBookingModal = function() {
    const modal = document.getElementById('booking-modal-overlay');
    if(modal) modal.style.display = 'flex';
  };
  window.closeBookingModal = function() {
    const modal = document.getElementById('booking-modal-overlay');
    if(modal) modal.style.display = 'none';
  };

  const launcher = document.getElementById('chat-launcher');
  const chatWindow = document.getElementById('chat-window');
  const closeBtn = document.getElementById('chat-close');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  const submitBtn = document.getElementById('chat-submit');
  const micBtn = document.getElementById('chat-mic');
  const fileInput = document.getElementById('chat-file-input');
  const attachBtn = document.getElementById('chat-attach');
  const imagePreview = document.getElementById('chat-image-preview');
  const previewImg = document.getElementById('preview-img');
  const removeImageBtn = document.getElementById('remove-image');

  let isOpen = false;
  let isRecording = false;
  let selectedImageData = null;
  let selectedImageMimeType = null;

  function saveChatState() {
    sessionStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    // Don't save typing indicator in html
    const clone = chatMessages.cloneNode(true);
    const indicator = clone.querySelector('#typing-indicator');
    if (indicator) indicator.remove();
    sessionStorage.setItem('chatHTML', clone.innerHTML);
  }

  // Restore state
  const savedHistory = sessionStorage.getItem('chatHistory');
  const savedHTML = sessionStorage.getItem('chatHTML');

  if (savedHistory && savedHTML) {
    chatHistory = JSON.parse(savedHistory);
    chatMessages.innerHTML = savedHTML;
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Image handling
  if (attachBtn && fileInput) {
    attachBtn.addEventListener('click', () => {
      fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          selectedImageData = event.target.result.split(',')[1];
          selectedImageMimeType = file.type;
          if (previewImg) previewImg.src = event.target.result;
          if (imagePreview) imagePreview.style.display = 'flex';
          chatInput.focus();
        };
        reader.readAsDataURL(file);
      }
    });
    
    removeImageBtn.addEventListener('click', () => {
      fileInput.value = '';
      selectedImageData = null;
      selectedImageMimeType = null;
      if (imagePreview) imagePreview.style.display = 'none';
      if (previewImg) previewImg.src = '';
    });

    // Handle paste events (Ctrl+V)
    chatInput.addEventListener('paste', (e) => {
      const items = (e.clipboardData || e.originalEvent.clipboardData).items;
      for (let index in items) {
        const item = items[index];
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          e.preventDefault(); // Prevent pasting text if there's an image
          const file = item.getAsFile();
          const reader = new FileReader();
          reader.onload = (event) => {
            selectedImageData = event.target.result.split(',')[1];
            selectedImageMimeType = file.type;
            if (previewImg) previewImg.src = event.target.result;
            if (imagePreview) imagePreview.style.display = 'flex';
          };
          reader.readAsDataURL(file);
          break; // Only handle the first image
        }
      }
    });
  }

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
            <img src="${logoPath}" alt="Valoris AI" style="width: 28px; height: 28px; border-radius: 50%; object-fit: contain; background: #0a192f; padding: 3px; border: 1px solid #0891b2;">
            <div class="avatar-online-dot" style="width: 8px; height: 8px; border-width: 1.5px;"></div>
          </div>
          <div style="margin-top: 4px;">${text}</div>
        </div>
      `;
    } else {
      if (selectedImageData && selectedImageMimeType) {
        msgDiv.innerHTML = `<div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-end;">
          <img src="data:${selectedImageMimeType};base64,${selectedImageData}" style="max-width: 150px; border-radius: 8px; margin-bottom: 4px;">
          <div>${text}</div>
        </div>`;
      } else {
        msgDiv.innerHTML = text;
      }
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
          saveChatState();
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
    saveChatState();
  }

  function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.classList.add('typing-indicator');
    indicator.id = 'typing-indicator';
    indicator.innerHTML = `
      <div style="display: flex; gap: 8px; align-items: flex-start;">
        <div class="avatar-container">
          <img src="${logoPath}" alt="Valoris AI" style="width: 28px; height: 28px; border-radius: 50%; object-fit: contain; background: #0a192f; padding: 3px; border: 1px solid #0891b2;">
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
    if (!message && !selectedImageData) return;

    // Save image state for payload
    const imageBase64 = selectedImageData;
    const mimeType = selectedImageMimeType;

    // Add user message to UI
    addMessage(message, 'user');
    
    // Reset inputs
    chatInput.value = '';
    if (fileInput) fileInput.value = '';
    selectedImageData = null;
    selectedImageMimeType = null;
    if (imagePreview) imagePreview.style.display = 'none';

    submitBtn.disabled = true;

    // Show typing animation
    showTypingIndicator();

    try {
      // Append user message to history
      let historyMessage = message;
      if (imageBase64) historyMessage += " [User uploaded an image]";
      chatHistory.push({ role: 'user', content: historyMessage });
      // Keep only last 12 messages (6 user, 6 bot)
      if (chatHistory.length > 12) chatHistory = chatHistory.slice(chatHistory.length - 12);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: message || "Can you analyze this image?", history: chatHistory, imageBase64, mimeType })
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
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChatbot);
} else {
  initChatbot();
}
