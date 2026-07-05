import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: "user" },
    twoFactorSecret: { type: String, select: false },
    isTwoFactorEnabled: { type: Boolean, default: false },
    resetToken: String,
    resetTokenExpiry: Date,
    trustedDevices: [{ type: String }],
    emailVerificationOTP: { type: String, select: false },
    emailVerificationOTPExpiry: Date,
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parking",
      },
    ],
  },
  { timestamps: true }
);

// Password hashing
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

export default mongoose.model("User", userSchema);
