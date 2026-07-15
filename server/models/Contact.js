import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: [150, "Subject cannot exceed 150 characters."],
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: [10, "Message must be at least 10 characters long."],
      maxlength: [2000, "Message cannot exceed 2000 characters."],
    },
    status: {
      type: String,
      default: "open",
      enum: {
        values: ["open", "in-progress", "resolved"],
        message: "{VALUE} is not a supported status type. Allowed values are: open, in-progress, resolved.",
      },
    },
  },
  { timestamps: true }
);

contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ createdAt: -1 }); // -1 for descending sort (newest first)

export default mongoose.model("Contact", contactSchema);