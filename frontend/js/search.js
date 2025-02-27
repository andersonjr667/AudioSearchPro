// Gerenciamento da busca
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const resultsContainer = document.getElementById('results');
const searchTabs = document.querySelectorAll('.tab-btn');
const durationFilter = document.getElementById('duration');
const qualityFilter = document.getElementById('quality');

let currentTab = 'audio';
let searchTimeout;

// Gerenciamento das tabs
searchTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        searchTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentTab = tab.dataset.tab;
        if (searchInput.value) {
            performSearch();
        }
    });
});

// Busca com debounce
searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 500);
});

// Filtros
[durationFilter, qualityFilter].forEach(filter => {
    filter.addEventListener('change', performSearch);
});

searchButton.addEventListener('click', performSearch);

async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) {
        resultsContainer.innerHTML = '';
        return;
    }

    // Mostrar loading
    resultsContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i></div>';

    try {
        // Simulação de chamada API
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${currentTab}&duration=${durationFilter.value}&quality=${qualityFilter.value}`);
        const data = await response.json();

        // Log para depuração
        console.log('Resposta da API:', data);

        // Verificar se os dados estão no formato esperado
        if (!Array.isArray(data)) {
            console.error('Dados inválidos retornados pela API:', data);
            resultsContainer.innerHTML = '<div class="error">Erro: Dados inválidos retornados pela API.</div>';
            return;
        }

        displayResults(data);
    } catch (error) {
        console.error('Erro ao buscar resultados:', error);
        resultsContainer.innerHTML = '<div class="error">Erro ao buscar resultados. Tente novamente.</div>';
    }
}

function displayResults(results) {
    if (!results || !results.length) {
        resultsContainer.innerHTML = '<div class="no-results">Nenhum resultado encontrado</div>';
        return;
    }

    const html = results.map(result => `
        <div class="result-card">
            <div class="result-image">
                <img src="${result.thumbnail}" alt="${result.title}">
                <span class="duration">${result.duration}</span>
            </div>
            <div class="result-info">
                <h3>${result.title}</h3>
                <p>${result.description}</p>
                <div class="result-meta">
                    <span><i class="fas fa-clock"></i> ${result.duration}</span>
                    <span><i class="fas fa-music"></i> ${result.quality}</span>
                </div>
                <div class="result-actions">
                    <button class="preview-btn" onclick="previewAudio('${result.id}')">
                        <i class="fas fa-play"></i> Preview
                    </button>
                    <button class="download-btn" onclick="downloadAudio('${result.id}')">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    resultsContainer.innerHTML = html;
}

// Funções de preview e download
function previewAudio(id) {
    // Implementar preview do áudio
    console.log('Preview:', id);
}

function downloadAudio(id) {
    // Implementar download do áudio
    console.log('Download:', id);
}