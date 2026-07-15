import jwt from "jsonwebtoken";

export const generateToken = (userId, role, options = {}) => {
  const payload = { id: userId, role };

  if (options.isTemp) payload.isTemp = true;
  if (options.isEmail2FA) payload.isEmail2FA = true;

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: options.expiresIn || '7d',
  });
};