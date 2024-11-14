const typingForm = document.querySelector('.typing-form');
const chatList = document.querySelector('.chat-list');

let userMessage = null;

const API_KEY = 'AIzaSyBditdh8-JKnA7FkrDyGFicOf4xQOljePs';
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

const createMessageElement = (content, ...classes) => {
    const div = document.createElement('div');
    div.classList.add('message', ...classes);
    div.innerHTML = content;
    return div;
};

const showTypingEffect = (text, textElement) => {
    const words = text.split(' ');
    let currentWordIndex = 0;
    textElement.textContent = '';

    const typingInterval = setInterval(() => {
        textElement.textContent += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];

        if (currentWordIndex === words.length) {
            clearInterval(typingInterval);
        };
    }, 75);
};


const generateAPIResponse = async (incomingMessageDiv) => {
    const textElement = await incomingMessageDiv.querySelector(".text");

    if (!textElement) {
        console.error("Elemento '.text' não encontrado.");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: userMessage }]
                }]
            })
        });

        const data = await response.json();

        // Get the API response text
        const apiResponse = data?.candidates[0].content.parts[0].text;

        if (apiResponse) {
            showTypingEffect(apiResponse, textElement);
        } else {
            textElement.textContent = "Nenhuma resposta recebida"
        }
    } catch (err) {
        console.error(err)
    } finally {
        incomingMessageDiv.classList.remove("loading");
    };
};

const showLoadingAnimation = () => {
    const html = `<div class="message-content">
                     <img src="images/logo.png" alt="Gemini Image" class="avatar">
                     <p class="text"></p>
                     <div class="loading-indicator">
                        <div class="loading-bar"></div>
                        <div class="loading-bar"></div>
                        <div class="loading-bar"></div>
                     </div>
                  </div>
                  <span onclick="copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>`;

    const outGoingMessageDiv = createMessageElement(html, 'incoming', 'loading');
    chatList.appendChild(outGoingMessageDiv);

    generateAPIResponse(outGoingMessageDiv);
};

const copyMessage = (copyIcon) => {
    const messageText = copyIcon.parentElement.querySelector(".text").innerHTML;

    navigator.clipboard.writeText(messageText);
    copyIcon.textContent = "done";
    setTimeout(() => copyIcon.innerHTML = "content_copy", 1000);
}

const handleOutGoingChat = () => {
    userMessage = typingForm.querySelector('.typing-input').value.trim();
    if (!userMessage) return;

    const html = `<div class="message-content">
                    <img src="images/person-icon.webp" alt="User Image" class="avatar">
                    <p class="text"></p>
                  </div>`;

    const outGoingMessageDiv = createMessageElement(html, 'outgoing');
    outGoingMessageDiv.querySelector('.text').textContent = userMessage;
    chatList.appendChild(outGoingMessageDiv);

    typingForm.reset();
    setTimeout(showLoadingAnimation, 500);
};

typingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    handleOutGoingChat();
});