const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  admin: { type: Boolean, default: false },
  likedGrills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Grill' }]
});

module.exports = mongoose.model('User', UserSchema);