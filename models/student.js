const mongoose = require("mongoose");
const StudentSchema = new mongoose.Schema({
  name: { type: String },
  company: { type: String },
  ctc: { type: String },
});
module.exports = mongoose.model("Student", StudentSchema);
