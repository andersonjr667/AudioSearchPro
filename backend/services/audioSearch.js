const axios = require('axios');
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function searchWithAI(query) {
    try {
        // Usar GPT-4 para entender melhor a consulta do usuário
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "Você é um assistente especializado em encontrar músicas e áudios. Analise a entrada do usuário e extraia informações relevantes como: artista, título, gênero, letra ou trecho da música, humor ou emoção. Retorne apenas as palavras-chave mais relevantes para busca, separadas por vírgula."
                },
                {
                    role: "user",
                    content: query
                }
            ]
        });

        const keywords = completion.choices[0].message.content;

        // Buscar em múltiplas fontes incluindo YouTube
        const [youtubeResults, soundcloudResults, freesoundResults, archiveResults] = await Promise.all([
            searchYouTube(keywords),
            searchSoundCloud(keywords),
            searchFreesound(keywords),
            searchInternetArchive(keywords)
        ]);

        // Combinar e filtrar resultados
        return [...youtubeResults, ...soundcloudResults, ...freesoundResults, ...archiveResults]
            .filter(result => result !== null)
            .slice(0, 15);
    } catch (error) {
        console.error('Erro na busca com IA:', error);
        throw error;
    }
}

async function searchYouTube(query) {
    try {
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
            params: {
                part: 'snippet',
                q: query,
                type: 'video',
                videoCategoryId: '10', // Música
                maxResults: 5,
                key: process.env.YOUTUBE_API_KEY
            }
        });

        const videos = response.data.items;
        const detailedVideos = await Promise.all(videos.map(async (video) => {
            try {
                const details = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
                    params: {
                        part: 'contentDetails,statistics',
                        id: video.id.videoId,
                        key: process.env.YOUTUBE_API_KEY
                    }
                });

                const duration = details.data.items[0].contentDetails.duration;
                const viewCount = details.data.items[0].statistics.viewCount;

                return {
                    title: video.snippet.title,
                    description: video.snippet.description,
                    url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
                    embedUrl: `https://www.youtube.com/embed/${video.id.videoId}`,
                    thumbnail: video.snippet.thumbnails.high.url,
                    source: 'YouTube',
                    artist: video.snippet.channelTitle,
                    duration: duration,
                    views: parseInt(viewCount).toLocaleString('pt-BR'),
                    publishedAt: new Date(video.snippet.publishedAt).toLocaleDateString('pt-BR')
                };
            } catch (error) {
                console.error('Erro ao buscar detalhes do vídeo:', error);
                return null;
            }
        }));

        return detailedVideos.filter(video => video !== null);
    } catch (error) {
        console.error('Erro no YouTube:', error);
        return [];
    }
}

async function searchSoundCloud(query) {
    try {
        const response = await axios.get(`https://api.soundcloud.com/tracks`, {
            params: {
                q: query,
                client_id: process.env.SOUNDCLOUD_CLIENT_ID,
                limit: 5
            }
        });

        return response.data.map(track => ({
            title: track.title,
            description: track.description || '',
            url: track.permalink_url,
            source: 'SoundCloud',
            thumbnail: track.artwork_url,
            duration: track.duration,
            artist: track.user.username
        }));
    } catch (error) {
        console.error('Erro no SoundCloud:', error);
        return [];
    }
}

async function searchFreesound(query) {
    try {
        const response = await axios.get(`https://freesound.org/apiv2/search/text/`, {
            params: {
                query: query,
                token: process.env.FREESOUND_API_KEY,
                fields: 'name,description,url,username,duration',
                page_size: 5
            }
        });

        return response.data.results.map(sound => ({
            title: sound.name,
            description: sound.description,
            url: sound.url,
            source: 'Freesound',
            duration: sound.duration,
            artist: sound.username
        }));
    } catch (error) {
        console.error('Erro no Freesound:', error);
        return [];
    }
}

async function searchInternetArchive(query) {
    try {
        const response = await axios.get(`https://archive.org/advancedsearch.php`, {
            params: {
                q: `${query} AND mediatype:(audio)`,
                output: 'json',
                rows: 5
            }
        });

        return response.data.response.docs.map(item => ({
            title: item.title,
            description: item.description || '',
            url: `https://archive.org/details/${item.identifier}`,
            source: 'Internet Archive',
            artist: item.creator
        }));
    } catch (error) {
        console.error('Erro no Internet Archive:', error);
        return [];
    }
}

module.exports = {
    searchWithAI
};
