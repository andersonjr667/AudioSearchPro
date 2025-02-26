// Gerenciamento da busca por voz
const voiceSearchButton = document.getElementById('voiceSearchButton');
const voiceFeedback = document.getElementById('voiceFeedback');

let isListening = false;
let recognition;

// Verifica se o navegador suporta reconhecimento de voz
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'pt-BR';

    recognition.onstart = () => {
        isListening = true;
        voiceSearchButton.classList.add('listening');
        showVoiceFeedback(true);
    };

    recognition.onend = () => {
        isListening = false;
        voiceSearchButton.classList.remove('listening');
        showVoiceFeedback(false);
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        searchInput.value = transcript;
        performSearch();
    };

    recognition.onerror = (event) => {
        console.error('Erro no reconhecimento de voz:', event.error);
        showVoiceFeedback(false);
        voiceSearchButton.classList.remove('listening');
    };

    voiceSearchButton.addEventListener('click', () => {
        if (!isListening) {
            recognition.start();
        } else {
            recognition.stop();
        }
    });
} else {
    voiceSearchButton.style.display = 'none';
}

function showVoiceFeedback(show) {
    voiceFeedback.style.display = show ? 'flex' : 'none';
}
