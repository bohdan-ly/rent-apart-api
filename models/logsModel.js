const mongoose = require("mongoose");

const logsSchema = new mongoose.Schema({
  log: {
    type: String,
  },
});

const Logs = mongoose.model("Logs", logsSchema);

module.exports = Logs;
