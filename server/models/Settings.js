const mongoose = require('mongoose');

const Settings = new mongoose.Schema({
    sleepOptions: {
        type: String,
        default: '3'
    },

    autoIrrigation: {
        type: Boolean,
        default: true
    },

    moistureThreshold: {
        type: Number,
        min: 0.3,
        max: 1,
        default: 0.6
    },

    irrigationDuration: {
        type: String,
        default: "2"
    },

});

module.exports = Settings;