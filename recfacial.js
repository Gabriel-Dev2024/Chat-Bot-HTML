// Seleciona elementos HTML
const video = document.createElement('video');
const enterButton = document.getElementById('enter-button');
const registerButton = document.getElementById('register-button'); // Botão adicional para cadastro
const statusMessage = document.getElementById('status-message');

let labeledDescriptors = []; // Armazena descritores de rostos cadastrados

// Carrega os modelos do Face-api.js
async function loadModels() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    console.log("Modelos carregados!");
}

// Inicia a câmera
async function startVideo() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;
    video.play();
}

// Cadastra um novo rosto
async function registerFace() {
    statusMessage.textContent = "Posicione seu rosto para cadastro...";
    const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!detection) {
        statusMessage.textContent = "Nenhum rosto detectado. Tente novamente.";
        return;
    }

    const label = prompt("Digite um nome para o rosto:");
    if (!label) {
        alert("Cadastro cancelado.");
        return;
    }

    labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(label, [detection.descriptor]));
    saveDescriptorsToLocalStorage();
    alert(`Rosto cadastrado para ${label}!`);
}

// Salva descritores no LocalStorage
function saveDescriptorsToLocalStorage() {
    const serializedDescriptors = labeledDescriptors.map(ld => ({
        label: ld.label,
        descriptors: ld.descriptors.map(d => Array.from(d))
    }));
    localStorage.setItem('labeledDescriptors', JSON.stringify(serializedDescriptors));
}

// Carrega descritores do LocalStorage
function loadDescriptorsFromLocalStorage() {
    const savedDescriptors = JSON.parse(localStorage.getItem('labeledDescriptors') || '[]');
    labeledDescriptors = savedDescriptors.map(ld => 
        new faceapi.LabeledFaceDescriptors(ld.label, ld.descriptors.map(d => new Float32Array(d)))
    );
}

// Reconhece um rosto
async function recognizeFace() {
    statusMessage.textContent = "Verificando identidade...";
    const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!detection) {
        statusMessage.textContent = "Nenhum rosto detectado. Tente novamente.";
        return;
    }

    if (labeledDescriptors.length === 0) {
        statusMessage.textContent = "Nenhum rosto cadastrado.";
        return;
    }

    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6); // Tolerância de 0.6
    const bestMatch = faceMatcher.findBestMatch(detection.descriptor);

    if (bestMatch.label !== 'unknown') {
        statusMessage.textContent = `Bem-vindo, ${bestMatch.label}!`;
        setTimeout(() => {
            // Redireciona para o chatbot
            window.location.href = 'chatbot.html';
        }, 1000);
    } else {
        statusMessage.textContent = "Rosto não reconhecido. Tente novamente.";
    }
}

// Configura eventos dos botões
enterButton.addEventListener('click', async () => {
    await startVideo();

    // Adiciona o vídeo ao corpo da página para visualização
    document.body.append(video);

    // Aguarda alguns segundos antes de verificar o rosto
    setTimeout(() => {
        recognizeFace();
    }, 3000);
});

registerButton.addEventListener('click', async () => {
    await startVideo();

    // Adiciona o vídeo ao corpo da página para visualização
    document.body.append(video);

    // Aguarda alguns segundos antes de capturar o rosto para cadastro
    setTimeout(() => {
        registerFace();
    }, 3000);
});

// Carrega os modelos e os descritores salvos
loadModels();
loadDescriptorsFromLocalStorage();
