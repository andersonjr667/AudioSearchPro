// server.js
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const audioRoutes = require('./routes/audio'); // Importa as rotas de áudio

const app = express();
const PORT = process.env.PORT || 3000; // Usa a porta definida no .env ou a porta 3000 por padrão

// Middleware
app.use(cors()); // Habilita o CORS para permitir requisições de diferentes origens
app.use(express.json()); // Permite que o servidor entenda JSON no corpo das requisições
app.use(express.static('frontend')); // Serve arquivos estáticos da pasta 'frontend'

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado ao MongoDB')) // Mensagem de sucesso na conexão
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err)); // Mensagem de erro na conexão

// Rotas
app.use('/api', audioRoutes); // Define o prefixo '/api' para as rotas de áudio

// Rota de exemplo para a raiz do servidor
app.get('/', (req, res) => {
    res.send('Bem-vindo ao AudioSearch Pro API!');
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
