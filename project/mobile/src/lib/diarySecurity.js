// Password Security Utility compatible with React Native / Expo
function simpleHash(str, salt) {
  let hash = 0;
  const combined = str + (salt || '');
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export async function generatePasswordHash(password, saltHex = null) {
  const salt = saltHex || Math.random().toString(36).substring(2, 10);
  const hashHex = simpleHash(password, salt);
  return {
    hashHex,
    saltHex: salt,
  };
}

export async function verifyPasswordHash(inputPassword, storedHashHex, storedSaltHex) {
  if (!storedHashHex || !storedSaltHex) return false;
  const { hashHex } = await generatePasswordHash(inputPassword, storedSaltHex);
  return hashHex === storedHashHex;
}
