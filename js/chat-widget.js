document.addEventListener('DOMContentLoaded', () => {
    // 1. Inject HTML into the page
    const widgetHtml = `
        <div id="chat-widget-container">
            <div id="chat-window">
                <div id="chat-header">
                    <span>Chat Support</span>
                    <span id="chat-close">&times;</span>
                </div>
                <div id="chat-messages">
                    <div class="chat-message bot">Hi there! How can I help you today?</div>
                </div>
                <div id="chat-input-container">
                    <input type="text" id="chat-input" placeholder="Type your message..." />
                    <button id="chat-send">Send</button>
                </div>
            </div>
            <div id="chat-widget-button">
                <svg viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path>
                </svg>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', widgetHtml);

    // 2. Select Elements
    const chatButton = document.getElementById('chat-widget-button');
    const chatWindow = document.getElementById('chat-window');
    const chatClose = document.getElementById('chat-close');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chat-messages');

    let chatHistory = [];
    
    // IMPORTANT: Once deployed to Railway, update this URL to your Railway backend URL!
    // Example: const BACKEND_URL = 'https://your-railway-app.up.railway.app/api/chat';
    const BACKEND_URL = 'https://loyal-essence-production-507b.up.railway.app/api/chat';

    // 3. Toggle Chat Window
    chatButton.addEventListener('click', () => {
        chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
    });

    chatClose.addEventListener('click', () => {
        chatWindow.style.display = 'none';
    });

    // 4. Handle Sending Messages
    const sendMessage = async () => {
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message to UI
        addMessage(message, 'user');
        chatInput.value = '';

        // Add loading state
        const loadingId = addMessage('...', 'bot');

        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, history: chatHistory })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            
            // Remove loading and add bot response
            document.getElementById(loadingId).remove();
            addMessage(data.reply, 'bot');

            // Update History
            chatHistory.push({ role: 'user', content: message });
            chatHistory.push({ role: 'assistant', content: data.reply });

        } catch (error) {
            console.error('Error:', error);
            document.getElementById(loadingId).remove();
            addMessage('Sorry, I am having trouble connecting right now. Ensure the backend is running.', 'bot');
        }
    };

    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // 5. Helper function to add messages to UI
    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${sender}`;
        msgDiv.textContent = text;
        const id = 'msg-' + Date.now();
        msgDiv.id = id;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll
        return id;
    }
});
