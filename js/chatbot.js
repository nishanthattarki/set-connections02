document.addEventListener('DOMContentLoaded', () => {
  // Inject HTML for the chat widget
  const chatHTML = `
    <div id="chat-widget-container">
      <div id="chat-window">
        <div id="chat-header">
          <div class="chat-header-info">
            <h3>SetConnect AI</h3>
            <p><span class="status-dot"></span> Online</p>
          </div>
          <button id="chat-close">&times;</button>
        </div>
        <div id="chat-messages">
          <div class="message bot">Hello! I'm the SetConnect AI assistant. How can I help you today?</div>
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

  function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    msgDiv.innerHTML = text;
    chatMessages.appendChild(msgDiv);
    
    if (sender === 'user') {
      // Only force scroll to bottom when the user sends a message.
      // When the bot replies, the top of its message will appear exactly
      // where the typing indicator was, and the user can naturally scroll down.
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.classList.add('typing-indicator');
    indicator.id = 'typing-indicator';
    indicator.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
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
      // Uses relative URL so it dynamically works on Localhost AND Railway!
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });

      const data = await response.json();
      
      removeTypingIndicator();
      
      if (response.ok && data.reply) {
        addMessage(data.reply, 'bot');
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
