// Gerenciamento da seção de tendências
const trendingTabs = document.querySelectorAll('.trend-tab');
const trendingGrid = document.querySelector('.trending-grid');

let currentTrend = 'daily';

// Gerenciamento das tabs de tendências
trendingTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        trendingTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentTrend = tab.dataset.trend;
        loadTrendingContent(currentTrend);
    });
});

// Carrega o conteúdo das tendências
async function loadTrendingContent(period) {
    trendingGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i></div>';

    try {
        // Simulação de chamada API
        const response = await fetch(`/api/trending?period=${period}`);
        const data = await response.json();
        
        displayTrendingContent(data);
    } catch (error) {
        trendingGrid.innerHTML = '<div class="error">Erro ao carregar tendências. Tente novamente.</div>';
    }
}

function displayTrendingContent(items) {
    if (!items.length) {
        trendingGrid.innerHTML = '<div class="no-results">Nenhum item em tendência</div>';
        return;
    }

    const html = items.map((item, index) => `
        <div class="trending-card">
            <div class="trending-rank">#${index + 1}</div>
            <div class="trending-image">
                <img src="${item.thumbnail}" alt="${item.title}">
                <span class="duration">${item.duration}</span>
            </div>
            <div class="trending-info">
                <h3>${item.title}</h3>
                <div class="trending-meta">
                    <span><i class="fas fa-play"></i> ${item.plays}</span>
                    <span><i class="fas fa-download"></i> ${item.downloads}</span>
                </div>
                <div class="trending-actions">
                    <button onclick="previewAudio('${item.id}')">
                        <i class="fas fa-play"></i>
                    </button>
                    <button onclick="downloadAudio('${item.id}')">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    trendingGrid.innerHTML = html;
}

// Carrega as tendências iniciais
loadTrendingContent('daily');
