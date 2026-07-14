// backend/utils/authResponseHelper.js
// Utility for building consistent authentication success responses

/**
 * Standard success response (Login, Signup, Verify)
 */
export const sendAuthSuccess = (res, user, token, message = "Authentication successful") => {
  const response = { success: true };
  if (message) response.message = message;
  if (token) response.token = token;
  if (user) {
    response.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
  return res.json(response);
};

/**
 * 2FA / Email 2FA required response
 */
export const sendAuth2FARequired = (res, tempToken, requiresEmail2FA = false) => {
  return res.json({
    success: true,
    ...(requiresEmail2FA ? { requiresEmail2FA: true } : { requires2FA: true }),
    tempToken,
  });
};

/**
 * Simple success message response (Forgot Password, Reset Password)
 */
export const sendAuthMessage = (res, message) => {
  return res.json({ success: true, message });
};