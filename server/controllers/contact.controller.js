import Contact from "../models/Contact.js";
import { sendContactSupportEmail } from "../utils/email.js";

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate inputs
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required (name, email, subject, message).",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format.",
      });
    }

    if (name.length > 100 || email.length > 100 || subject.length > 200 || message.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Input length exceeds allowed limits.",
      });
    }

    // Save to database for auditing
    const contactEntry = new Contact({
      name,
      email,
      subject,
      message,
    });
    await contactEntry.save();

    // Send email using Nodemailer
    try {
      await sendContactSupportEmail({ name, email, subject, message });
    } catch (emailError) {
      console.error("Failed to send contact support email:", emailError);
      // We still return success if the email fails but the DB save succeeded, 
      // or we can return a partial success. Returning a 500 might confuse the user.
      // But let's log it.
    }

    return res.status(200).json({
      success: true,
      message: "Your message has been sent successfully. We will get back to you soon.",
    });
  } catch (error) {
    console.error("Contact Form Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};
