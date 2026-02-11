const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // Add user message
    addMessage(text, 'user');
    userInput.value = '';

    // Show typing indicator
    const typingIndicator = showTyping();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: text })
        });

        if (!response.ok) {
            throw new Error(`Server API Error: ${response.status}`);
        }

        const data = await response.json();

        // Remove typing indicator
        removeTyping(typingIndicator);

        // Add bot message
        addMessage(data.reply, 'bot');

    } catch (error) {
        removeTyping(typingIndicator);
        addMessage("Yo, my bad! The connection dropped. 💀 Try again later fam.", 'bot');
        console.error(error);
    }
}

function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);

    const bubble = document.createElement('div');
    bubble.classList.add('bubble');

    // Parse Markdown for bot messages
    if (sender === 'bot') {
        bubble.innerHTML = marked.parse(text);
    } else {
        bubble.textContent = text;
    }

    msgDiv.appendChild(bubble);
    chatWindow.appendChild(msgDiv);
    scrollToBottom();
}

function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'bot', 'typing-container');

    const bubble = document.createElement('div');
    bubble.classList.add('typing');

    // 3 Dots animation
    bubble.innerHTML = `
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
    `;

    typingDiv.appendChild(bubble);
    chatWindow.appendChild(typingDiv);
    scrollToBottom();
    return typingDiv;
}

function removeTyping(element) {
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
}

function scrollToBottom() {
    chatWindow.scrollTop = chatWindow.scrollHeight;
}
