// utils/otpEncryption.js
import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const key = crypto.scryptSync(process.env.OTP_SECRET, 'salt', 32);
const iv = Buffer.alloc(16, 0);

// In utils/otpEncryption.js
export const encrypt = (text) => {
  if (!text) throw new Error('OTP text is required for encryption');
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

export const decrypt = (encryptedText) => {
  if (!encryptedText) throw new Error('Encrypted text is required for decryption');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};