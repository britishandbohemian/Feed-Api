import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
// Generate a secure 32-byte (256-bit) key and convert to hex
const key = Buffer.from('7cc854956df5d3fec2c460c95f936053f40e3a116dab0812f0c5a6922ec6e8bd', 'hex');
const ivLength = 16;

export const encrypt = (text) => {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

export const decrypt = (encryptedData) => {
  try {
    if (!encryptedData) {
      throw new Error('No data provided for decryption');
    }
    const [storedIv, encryptedText] = encryptedData.split(':');
    if (!storedIv || !encryptedText) {
      throw new Error('Invalid encrypted data format');
    }
    const iv = Buffer.from(storedIv, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    throw new Error('Failed to decrypt the data');
  }
};