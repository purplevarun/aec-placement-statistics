const mongoose = require("mongoose");
const ChatSchema = new mongoose.Schema({
  sender: { type: String },
  msg: { type: String },
  time: {
    type: String,
    default: new Date(new Date().getTime() + 330 * 60000).toLocaleString(), // 330 is offset for IST (5.5 ghanta)
  },
});
module.exports = mongoose.model("Chat", ChatSchema);
