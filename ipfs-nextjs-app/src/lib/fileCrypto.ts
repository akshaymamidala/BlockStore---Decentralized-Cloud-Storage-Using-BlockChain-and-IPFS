export const ENCRYPTION_VERSION = "aes-gcm-pbkdf2-v1";

const PBKDF2_ITERATIONS = 250000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

export type EncryptedFilePayload = {
  version: typeof ENCRYPTION_VERSION;
  name: string;
  type: string;
  size: number;
  salt: string;
  iv: string;
  iterations: number;
  cipherText: string;
  createdAt: string;
};

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function fromBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  // WebCrypto typings in TS expect ArrayBuffer-backed views.
  return new Uint8Array(bytes).buffer;
}

async function deriveKey(
  passphrase: string,
  salt: Uint8Array,
  iterations: number
): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: toArrayBuffer(salt),
      iterations,
    },
    keyMaterial,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptFile(
  file: File,
  passphrase: string
): Promise<EncryptedFilePayload> {
  if (!passphrase || passphrase.length < 8) {
    throw new Error("Passphrase must be at least 8 characters long");
  }

  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const key = await deriveKey(passphrase, salt, PBKDF2_ITERATIONS);
  const plainBuffer = await file.arrayBuffer();

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv) },
    key,
    plainBuffer
  );

  return {
    version: ENCRYPTION_VERSION,
    name: file.name,
    type: file.type || "application/octet-stream",
    size: file.size,
    salt: toBase64(salt),
    iv: toBase64(iv),
    iterations: PBKDF2_ITERATIONS,
    cipherText: toBase64(new Uint8Array(encryptedBuffer)),
    createdAt: new Date().toISOString(),
  };
}

export async function decryptFilePayload(
  payload: EncryptedFilePayload,
  passphrase: string
): Promise<Blob> {
  if (!passphrase) {
    throw new Error("Passphrase is required");
  }

  const salt = fromBase64(payload.salt);
  const iv = fromBase64(payload.iv);
  const cipherBytes = fromBase64(payload.cipherText);
  const key = await deriveKey(passphrase, salt, payload.iterations);

  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(cipherBytes)
  );

  return new Blob([plainBuffer], {
    type: payload.type || "application/octet-stream",
  });
}

export function isEncryptedFilePayload(
  value: unknown
): value is EncryptedFilePayload {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<EncryptedFilePayload>;

  return (
    candidate.version === ENCRYPTION_VERSION &&
    typeof candidate.name === "string" &&
    typeof candidate.type === "string" &&
    typeof candidate.size === "number" &&
    typeof candidate.salt === "string" &&
    typeof candidate.iv === "string" &&
    typeof candidate.iterations === "number" &&
    typeof candidate.cipherText === "string"
  );
}
