const typingForm = document.querySelector('.typing-form');

let userMessage = null;

const createMessageElement = (content, className) => {
    const div = document.createElement("div");
    div.classList.add(className);
}

const handleOutGoingChat = () => {
    userMessage = typingForm.querySelector('.typing-input');
    if (!userMessage) return;

}

typingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    handleOutGoingChat();
})