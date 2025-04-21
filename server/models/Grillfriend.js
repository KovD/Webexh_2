const mongoose = require('mongoose');

const GrillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  picture: { type: String, required: true },
  desc: { type: String, required: true },
  likes: { type: Number, default: 0 }
});

module.exports = mongoose.model('Grill', GrillSchema);
