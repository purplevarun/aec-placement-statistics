const mongoose = require("mongoose");
const ChatSchema = new mongoose.Schema({
  sender: { type: String },
  title: { type: String },
  descrip: { type: String },
});
module.exports = mongoose.model("Chat", ChatSchema);
