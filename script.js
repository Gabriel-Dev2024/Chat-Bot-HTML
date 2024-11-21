const typingForm = document.querySelector('.typing-form');
const chatList = document.querySelector('.chat-list');
const suggestions = document.querySelectorAll('.suggestion-list .suggestion');
const toggleThemeButton = document.querySelector('#toggle-theme-button');
const deleteChatButton = document.querySelector('#delete-chat-button');
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
const subtitle = document.querySelector('.subtitle');
const typingInput = document.querySelector('.typing-input');

let userMessage = null;
let isResponseGenerating = false;

let subtitleTexts = [
    "Olá! Bem-vindo(a)! Como posso ajudar você hoje?",
    "Olá! Que bom te ver por aqui! Vamos começar?",
    "Oi! Precisa de ajuda? Estou aqui para o que você precisar.",
    "Bem-vindo(a)! Pronto para explorar? Vamos nessa!",
    "Oi! Meu objetivo é ajudar você. Pergunte o que quiser!",
    "Como posso ajudar?",
    "Vamos começar?",
    "Precisa de algo?",
    "Estou aqui para ajudar!",
    "O que deseja saber?",
    "Pronto para explorar!",
    "Fale comigo!",
    "Dúvidas? Pergunte!",
    "Conte comigo!",
    "Vamos lá!"
];

const updateSubtitle = () => {
    const randomIndex = Math.floor(Math.random() * subtitleTexts.length);
    subtitle.textContent = subtitleTexts[randomIndex];
}

const API_KEY = 'AIzaSyBditdh8-JKnA7FkrDyGFicOf4xQOljePs';
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

const loadLocalStorageData = () => {
    const savedChats = localStorage.getItem('savedChats');
    const isLightMode = (localStorage.getItem('themeColor') === 'light-mode');

    document.body.classList.toggle('light-mode', isLightMode);
    toggleThemeButton.textContent = isLightMode ? 'dark_mode' : 'light_mode';

    chatList.innerHTML = savedChats || '';

    document.body.classList.toggle('hide-header', savedChats);
    chatList.scrollTo(0, chatList.scrollHeight);

    updateSubtitle();
};

loadLocalStorageData();

const createMessageElement = (content, ...classes) => {
    const div = document.createElement('div');
    div.classList.add('message', ...classes);

    const htmlContent = marked.parse(content);
    div.innerHTML = htmlContent;

    return div;
};

const showTypingEffect = (text, textElement, incomingMessageDiv) => {
    const words = text.split(' ');
    let currentWordIndex = 0;
    textElement.textContent = '';

    const typingInterval = setInterval(() => {
        textElement.textContent += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];
        incomingMessageDiv.querySelector('.icon').classList.add('hide');

        if (currentWordIndex === words.length) {
            clearInterval(typingInterval);
            isResponseGenerating = false;
            incomingMessageDiv.querySelector('.icon').classList.remove('hide');
            localStorage.setItem('savedChats', chatList.innerHTML);
            chatList.scrollTo(0, chatList.scrollHeight);
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

        if (!response.ok) throw new Error(data.error.message);

        // Get the API response text
        const apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');

        if (apiResponse) {
            showTypingEffect(apiResponse, textElement, incomingMessageDiv);
        } else {
            textElement.textContent = "Nenhuma resposta recebida"
        }
    } catch (err) {
        isResponseGenerating = false;
        textElement.textContent = err.message;
        textElement.classList.add('error');
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

    chatList.scrollTo(0, chatList.scrollHeight);
    generateAPIResponse(outGoingMessageDiv);
};

const copyMessage = (copyIcon) => {
    console.log('Ola');
    const messageText = copyIcon.parentElement.querySelector(".text").innerHTML;

    navigator.clipboard.writeText(messageText);
    copyIcon.textContent = "done";
    setTimeout(() => copyIcon.innerHTML = "content_copy", 1000);
}

const handleOutGoingChat = () => {
    userMessage = typingForm.querySelector('.typing-input').value.trim() || userMessage;
    if (!userMessage || isResponseGenerating) return;

    isResponseGenerating = true;


    const html = `<div class="message-content">
                    <img src="images/person-icon.webp" alt="User Image" class="avatar">
                    <p class="text"></p>
                  </div>`;

    const outGoingMessageDiv = createMessageElement(html, 'outgoing');
    outGoingMessageDiv.querySelector('.text').textContent = userMessage;
    chatList.appendChild(outGoingMessageDiv);

    typingForm.reset();
    chatList.scrollTo(0, chatList.scrollHeight);
    document.body.classList.add('hide-header');
    setTimeout(showLoadingAnimation, 500);
};

suggestions.forEach(suggestion => {
    suggestion.addEventListener('click', () => {
        userMessage = suggestion.querySelector('.text').textContent;
        handleOutGoingChat();
    });
});

toggleThemeButton.addEventListener('click', () => {
    const isLightMode = document.body.classList.toggle('light-mode');
    localStorage.setItem('themeColor', isLightMode ? 'light-mode' : 'dark-mode');

    // Alterar o texto do ícone para 'dark_mode' ou 'light_mode'
    toggleThemeButton.textContent = isLightMode ? 'dark_mode' : 'light_mode';
});

deleteChatButton.addEventListener('click', () => {
    if (confirm('Você tem certeza que quer apagar as mensagens?')) {
        localStorage.removeItem('savedChats');

        isResponseGenerating = false;
        userMessage = '';
        typingForm.querySelector('.typing-input').value = '';

        loadLocalStorageData();

        chatList.scrollTo(0, chatList.scrollHeight);
    }
});

typingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    handleOutGoingChat();
});

typingForm.querySelector('.typing-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {  // Verifica se foi "Enter" sem "Shift" (para evitar quebra de linha)
        e.preventDefault();  // Evita a quebra de linha (comportamento padrão do "Enter")
        handleOutGoingChat();  // Envia a mensagem
    }
});

menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

typingInput.addEventListener('input', () => {
    typingInput.style.height = 'auto';

    typingInput.style.height = `${typingInput.scrollHeight}px`;

    typingInput.style.overflowY = typingInput.scrollHeight > parseInt(window.getComputedStyle(typingInput).maxHeight) 
        ? 'auto' 
        : 'hidden';
});

marked.setOptions({
    breaks: true, // Suporta quebras de linha com apenas ENTER
    gfm: true,    // Ativa suporte para GitHub Flavored Markdown
    headerIds: false, // Desativa IDs automáticos em headers
    mangle: false // Evita obfuscar e-mails
});

const markdownText = "### Exemplo\nTexto **Markdown** com [link](https://example.com)";
const html = marked(markdownText);
console.log(html);