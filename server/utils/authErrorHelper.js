// utils/authErrorHelper.js
export const sendAuthError = (res, statusCode, message) => {
  return res.status(statusCode).json({ success: false, message });
};