const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const cauhoiSchema = new Schema({
    question: String,
    option_a: String,
    option_b: String,
    option_c: String,
    option_d: String,
    option_e: String,
    answer: String,
    monthi: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Monthi",
    },
    monthiString: String
},{timestamps: true});

const Cauhois = mongoose.model('Cauhois', cauhoiSchema);

module.exports = Cauhois;