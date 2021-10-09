const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  name: { type: String },
  visits: { type: Number, default: 0 },
});
module.exports = mongoose.model("User", UserSchema);
