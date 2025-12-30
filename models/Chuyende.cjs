const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const chuyendeSchema = new Schema({
    title: String,
    monthi: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Monthis",
    },
},{timestamps: true});

const Chuyendes = mongoose.model('Chuyendes', chuyendeSchema);

module.exports = Chuyendes;