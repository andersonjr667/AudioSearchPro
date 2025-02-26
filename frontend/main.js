// Elementos do DOM
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const voiceSearchButton = document.getElementById('voiceSearchButton');
const resultsDiv = document.getElementById('results');
const voiceFeedback = document.getElementById('voiceFeedback');

// Configuração do reconhecimento de voz
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'pt-BR';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
} else {
    voiceSearchButton.style.display = 'none';
}

// Função para buscar áudios
async function searchAudios(searchTerm) {
    try {
        // Mostrar loading
        resultsDiv.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Buscando áudios com IA...</p>
                <p class="search-term">"${searchTerm}"</p>
            </div>
        `;

        const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) {
            throw new Error('Erro na busca');
        }
        
        const data = await response.json();
        displayResults(data);
    } catch (error) {
        console.error('Erro ao buscar áudios:', error);
        resultsDiv.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Desculpe, ocorreu um erro ao buscar os áudios.</p>
                <p>Por favor, tente novamente mais tarde.</p>
            </div>
        `;
    }
}

// Função para exibir resultados
function displayResults(audios) {
    if (audios.length === 0) {
        resultsDiv.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>Nenhum áudio encontrado.</p>
                <p>Tente uma busca diferente.</p>
            </div>
        `;
        return;
    }

    // Separar resultados do YouTube dos outros
    const youtubeResults = audios.filter(audio => audio.source === 'YouTube');
    const otherResults = audios.filter(audio => audio.source !== 'YouTube');

    const youtubeHtml = youtubeResults.map(video => `
        <div class="video-card">
            <div class="video-player">
                <iframe 
                    src="${video.embedUrl}?rel=0" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
            <div class="video-info">
                <h3 class="video-title">${video.title}</h3>
                <p class="video-channel">
                    <i class="fas fa-user"></i> ${video.artist}
                </p>
                <div class="video-metadata">
                    <span class="video-views">
                        <i class="fas fa-eye"></i> ${video.views} visualizações
                    </span>
                    <span class="video-date">
                        <i class="fas fa-calendar"></i> ${video.publishedAt}
                    </span>
                </div>
                <p class="video-description">${video.description}</p>
                <a href="${video.url}" target="_blank" class="video-link">
                    <i class="fab fa-youtube"></i> Ver no YouTube
                </a>
            </div>
        </div>
    `).join('');

    const otherHtml = otherResults.map(audio => `
        <div class="audio-card">
            ${audio.thumbnail ? `
                <div class="audio-thumbnail">
                    <img src="${audio.thumbnail}" alt="${audio.title}">
                </div>
            ` : ''}
            <div class="audio-info">
                <h3 class="audio-title">${audio.title}</h3>
                ${audio.artist ? `<p class="audio-artist"><i class="fas fa-user"></i> ${audio.artist}</p>` : ''}
                <p class="audio-description">${audio.description || 'Sem descrição'}</p>
                <div class="audio-metadata">
                    <span class="audio-source"><i class="fas fa-database"></i> ${audio.source}</span>
                    ${audio.duration ? `
                        <span class="audio-duration">
                            <i class="fas fa-clock"></i> 
                            ${Math.floor(audio.duration / 60)}:${String(Math.floor(audio.duration % 60)).padStart(2, '0')}
                        </span>
                    ` : ''}
                </div>
                <a href="${audio.url}" target="_blank" class="audio-link">
                    <i class="fas fa-play"></i> Ouvir áudio
                </a>
            </div>
        </div>
    `).join('');

    resultsDiv.innerHTML = `
        <div class="results-header">
            <h2>Resultados encontrados</h2>
            <p>Encontramos ${audios.length} resultados para você</p>
        </div>
        ${youtubeResults.length > 0 ? `
            <div class="results-section youtube-results">
                <h3><i class="fab fa-youtube"></i> Vídeos do YouTube</h3>
                <div class="video-grid">
                    ${youtubeHtml}
                </div>
            </div>
        ` : ''}
        ${otherResults.length > 0 ? `
            <div class="results-section other-results">
                <h3><i class="fas fa-music"></i> Outros Resultados</h3>
                <div class="results-grid">
                    ${otherHtml}
                </div>
            </div>
        ` : ''}
    `;
}

// Funções de busca por voz
function startVoiceSearch() {
    if (recognition) {
        recognition.start();
        voiceSearchButton.classList.add('listening');
        voiceFeedback.classList.add('show');
        voiceFeedback.innerHTML = `
            <i class="fas fa-microphone-alt"></i>
            <span>Ouvindo... Fale o que você procura</span>
        `;
    }
}

function stopVoiceSearch() {
    if (recognition) {
        recognition.stop();
        voiceSearchButton.classList.remove('listening');
        voiceFeedback.classList.remove('show');
    }
}

// Event Listeners
searchButton.addEventListener('click', () => {
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
        searchAudios(searchTerm);
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            searchAudios(searchTerm);
        }
    }
});

// Event Listeners para busca por voz
if (recognition) {
    voiceSearchButton.addEventListener('click', () => {
        if (voiceSearchButton.classList.contains('listening')) {
            stopVoiceSearch();
        } else {
            startVoiceSearch();
        }
    });

    recognition.addEventListener('result', (e) => {
        const transcript = Array.from(e.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
        
        searchInput.value = transcript;
        voiceFeedback.innerHTML = `
            <i class="fas fa-microphone-alt"></i>
            <span>"${transcript}"</span>
        `;
        
        if (e.results[0].isFinal) {
            stopVoiceSearch();
            searchAudios(transcript);
        }
    });

    recognition.addEventListener('end', () => {
        stopVoiceSearch();
    });

    recognition.addEventListener('error', (e) => {
        console.error('Erro no reconhecimento de voz:', e.error);
        stopVoiceSearch();
        voiceFeedback.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>Erro no reconhecimento de voz. Tente novamente.</span>
        `;
        setTimeout(() => {
            voiceFeedback.classList.remove('show');
        }, 2000);
    });
}

// Smooth scroll para as seções
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
