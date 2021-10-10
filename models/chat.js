const mongoose = require("mongoose");
const ChatSchema = new mongoose.Schema({
  sender: { type: String },
  msg: { type: String },
  time: {
    type: String,
  },
});
module.exports = mongoose.model("Chat", ChatSchema);
