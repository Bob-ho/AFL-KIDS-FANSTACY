var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// User Mongoose Schema
var player = new Schema({
    imageLink:{ type: String, required: true},
    playerName: { type: String, required: true},
    point: { type: Number, required: false},
});
module.exports = mongoose.model('Player',player);

