document.addEventListener('DOMContentLoaded', () => {
  const scriptTag = document.currentScript || document.querySelector('script[src*="chatbot.js"]');
  const logoPath = scriptTag ? new URL('../images/setconnect-logo.png', scriptTag.src).href : '/images/setconnect-logo.png';

  // Inject HTML for the chat widget
  const chatHTML = `
    <div id="chat-widget-container">
      <div id="chat-window">
        <div id="chat-header">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="${logoPath}" alt="SetConnect AI Avatar" style="width: 40px; height: 40px; border-radius: 50%; object-fit: contain; background: #0a192f; padding: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border: 1px solid #0891b2;">
            <div class="chat-header-info">
              <h3>SetConnect Assistant</h3>
              <p><span class="status-dot"></span> Online & Ready to Help</p>
            </div>
          </div>
          <button id="chat-close">&times;</button>
        </div>
        <div id="chat-messages">
          <div class="message bot">
            <div style="display: flex; gap: 8px; align-items: flex-start;">
              <img src="${logoPath}" alt="SetConnect AI" style="width: 24px; height: 24px; border-radius: 50%; object-fit: contain; background: #0a192f; padding: 3px; flex-shrink: 0; border: 1px solid #0891b2;">
              <div>Hello! I'm the SetConnect AI assistant. How can I help you today?</div>
            </div>
          </div>
        </div>
        <div id="chat-input-area">
          <form id="chat-form">
            <input type="text" id="chat-input" placeholder="Type your question..." autocomplete="off">
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

  let isOpen = false;

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
          <img src="${logoPath}" alt="SetConnect AI" style="width: 24px; height: 24px; border-radius: 50%; object-fit: contain; background: #0a192f; padding: 3px; flex-shrink: 0; border: 1px solid #0891b2;">
          <div>${text}</div>
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
        <img src="${logoPath}" alt="SetConnect AI" style="width: 24px; height: 24px; border-radius: 50%; object-fit: contain; background: #0a192f; padding: 3px; flex-shrink: 0; border: 1px solid #0891b2;">
        <div style="display: flex; align-items: center; gap: 4px; margin-top: 6px;">
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
      // NOTE: Replace localhost with your actual deployed backend URL when going live
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });

      const data = await response.json();
      
      removeTypingIndicator();
      
      if (response.ok && data.reply) {
        addMessage(data.reply, 'bot', data.quickReplies || []);
      } else {
        addMessage("Sorry, I'm having trouble connecting to the server right now.", 'bot');
      }
    } catch (error) {
      console.error('Chat Error:', error);
      removeTypingIndicator();
      addMessage("Sorry, the chat server is currently offline.", 'bot');
    } finally {
      submitBtn.disabled = false;
      chatInput.focus();
    }
  });
});
