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

marked.setOptions({
    breaks: true, // Permite quebra de linha simples
    gfm: true,    // Ativa o suporte para GitHub Flavored Markdown (links, listas, etc.)
    headerIds: false, // Desativa IDs automáticos em cabeçalhos
    mangle: false     // Evita a obfuscação de e-mails
});

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

const createMessageElement = (content, ...classes) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', ...classes);
    messageElement.innerHTML = content;
    return messageElement;
};

const addCopyButtons = () => {
    // Seleciona todos os blocos de código <pre><code>
    document.querySelectorAll('pre').forEach((preBlock) => {
        // Verifica se o botão já foi adicionado
        if (preBlock.querySelector('.copy-button')) return;

        // Cria o botão de copiar
        const button = document.createElement('button');
        button.classList.add('copy-button');
        button.textContent = 'Copiar';

        // Configura o posicionamento do bloco <pre> para suportar o botão
        preBlock.style.position = 'relative';

        // Adiciona o botão ao bloco <pre>
        preBlock.appendChild(button);

        // Evento para copiar o conteúdo do bloco de código
        button.addEventListener('click', () => {
            const codeContent = preBlock.querySelector('code').innerText;
            navigator.clipboard.writeText(codeContent).then(() => {
                button.textContent = 'Copiado!';
                setTimeout(() => button.textContent = 'Copiar', 1500);
            }).catch(err => {
                console.error('Erro ao copiar: ', err);
            });
        });
    });
};


const showTypingEffect = (htmlContent, textElement, incomingMessageDiv) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    const words = htmlContent.split(' ');
    let currentWordIndex = 0;
    textElement.textContent = '';

    const typingInterval = setInterval(() => {
        textElement.innerHTML += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];
        incomingMessageDiv.querySelector('.icon').classList.add('hide');

        if (currentWordIndex === words.length) {
            clearInterval(typingInterval);
            textElement.innerHTML = htmlContent;
            isResponseGenerating = false;
            incomingMessageDiv.querySelector('.icon').classList.remove('hide');
            localStorage.setItem('savedChats', chatList.innerHTML);
            chatList.scrollTo(0, chatList.scrollHeight);

            // Verifica se o conteúdo contém <pre><code> e adiciona o botão de copiar se necessário
            if (tempDiv.querySelector('pre code')) {
                addCopyButtons();  // Chama a função que adiciona o botão de copiar aos blocos de código
            }
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
        const response = await Promise.race([
            fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        role: "user",
                        parts: [{ text: userMessage }]
                    }]
                })
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout de resposta da API')), 10000))
        ]);

        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseText) throw new Error('Resposta Invalida da API');

        const parsedHtml = marked.parse(responseText);
        textElement.innerHTML = parsedHtml;

        showTypingEffect(parsedHtml, textElement, incomingMessageDiv);

    } catch (err) {
        isResponseGenerating = false;
        textElement.textContent = err.message;
        textElement.classList.add('error');
    } finally {
        isResponseGenerating = false;
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
                    <p class="text">${userMessage}</p>
                  </div>`;

    const outGoingMessageDiv = createMessageElement(html, 'outgoing');
    chatList.appendChild(outGoingMessageDiv);

    typingForm.querySelector('.typing-input').value = '';
    typingInput.style.height = 'auto';  

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

function copyCode() {
    // Seleciona o bloco de código
    const codeBlock = document.getElementById('code-block');
    const textToCopy = codeBlock.innerText; // Pega o conteúdo do bloco de código

    // Usa a API do Clipboard para copiar o texto
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert('Código copiado com sucesso!');
    }).catch(err => {
        console.error('Erro ao copiar: ', err);
    });
}

loadLocalStorageData();