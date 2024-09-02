const mongoose = require("mongoose");
const { isEmail } = require("validator");

const editRequestSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    validate: [isEmail, "Provide valid email address"],
  },
  createdAt: { type: Date, default: new Date(Date.now()) },
});

const EditRequest = mongoose.model("EditRequest", editRequestSchema);

module.exports = EditRequest;
