const typingForm = document.querySelector('.typing-form');
const chatList = document.querySelector('.chat-list');

let userMessage = null;

const createMessageElement = (content, className) => {
    const div = document.createElement('div');
    div.classList.add('message', className);
    div.innerHTML = content;
    return div;
}

const showLoadingAnimation = () => {
    const html = `<div class="message-content">
                    <img src="images/user.jpg" alt="User Image" class="avatar">
                    <p class="text"></p>
                  </div>`;

    const outGoingMessageDiv = createMessageElement(html, 'incoming', 'loading');
    chatList.appendChild(outGoingMessageDiv);
};

const handleOutGoingChat = () => {
    userMessage = typingForm.querySelector('.typing-input');
    if (!userMessage) return;

    const html = `<div class="message-content">
                    <img src="images/user.jpg" alt="User Image" class="avatar">
                    <p class="text"></p>
                  </div>`;

    const outGoingMessageDiv = createMessageElement(html, 'outgoing');
    outGoingMessageDiv.querySelector('.text').textContent = userMessage;
    chatList.appendChild(outGoingMessageDiv);

    typingForm.reset();
    setTimeout(showLoadingAnimation, 500);
}

typingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    handleOutGoingChat();
})