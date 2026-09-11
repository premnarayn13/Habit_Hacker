// Password Security Utility using Web Crypto API PBKDF2/SHA-256

export async function generatePasswordHash(password, saltHex = null) {
  const enc = new TextEncoder();
  const salt = saltHex 
    ? hexToBytes(saltHex) 
    : window.crypto.getRandomValues(new Uint8Array(16));
  
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  
  return {
    hashHex: bytesToHex(new Uint8Array(derivedBits)),
    saltHex: bytesToHex(salt)
  };
}

export async function verifyPasswordHash(inputPassword, storedHashHex, storedSaltHex) {
  if (!storedHashHex || !storedSaltHex) return false;
  const { hashHex } = await generatePasswordHash(inputPassword, storedSaltHex);
  return hashHex === storedHashHex;
}

function bytesToHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}
