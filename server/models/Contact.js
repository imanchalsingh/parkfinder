import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: "open", enum: ["open", "in-progress", "resolved"] },
  },
  { timestamps: true }
);

export default mongoose.model("Contact", contactSchema);
