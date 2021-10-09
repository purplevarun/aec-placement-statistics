const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  name: { type: String },
  visits: { type: Number, default: 1 },
  when: {
    type: Array,
    default: [
      new Date(new Date().getTime() + 330 * 60000).toLocaleString() +
        " - first login",
    ],
  },
});
module.exports = mongoose.model("User", UserSchema);
