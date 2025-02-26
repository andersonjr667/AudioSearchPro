const express = require('express');
const router = express.Router();
const Audio = require('../models/Audio');
const { searchWithAI } = require('../services/audioSearch');

// Get all audio files
router.get('/audios', async (req, res) => {
    try {
        const audios = await Audio.find();
        res.json(audios);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Search audio files using AI
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        const results = await searchWithAI(query);
        res.json(results);
    } catch (error) {
        console.error('Error in search route:', error);
        res.status(500).json({ 
            error: 'Erro ao processar a busca',
            details: error.message 
        });
    }
});

// Add new audio file
router.post('/audios', async (req, res) => {
    const audio = new Audio({
        title: req.body.title,
        description: req.body.description,
        filename: req.body.filename,
        path: req.body.path
    });

    try {
        const newAudio = await audio.save();
        res.status(201).json(newAudio);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
