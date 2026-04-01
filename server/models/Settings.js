const mongoose = require('mongoose');

const Settings = new mongoose.Schema({
    sleepOptions: {
        type: String,
        enum: ['1', '3', '6', '12', '24'],
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

    manualIrrigation: {
        type: Boolean,
        default: false
    },

    irrigationDuration: {
        type: Number,
        default: 2
    },

    skipIrrigation: {
        type: Boolean,
        default: false
    },

    moistureSensor: {
        type: String,
        default: "unknown"
    },

    sensorCalibration: {
        type: String,
        default: "not_calibrated"
    }
});

module.exports = Settings;