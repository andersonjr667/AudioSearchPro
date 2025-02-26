// Modelo para áudios
const mongoose = require('mongoose');

const audioSchema = new mongoose.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String, required: false },
});

module.exports = mongoose.model('Audio', audioSchema);
