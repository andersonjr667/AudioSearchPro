// Rotas para buscar áudios
const express = require('express');
const router = express.Router();

// Exemplo de rota para buscar áudios
router.get('/search', (req, res) => {
    // Lógica para buscar áudios
    res.send('Busca de áudio');
});

module.exports = router;
