const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function randomCode(n: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(n));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

export const orderId = () => `PT-${randomCode(6)}`;
export const leadId = () => `LD-${randomCode(6)}`;
export const requestId = () => `QR-${randomCode(6)}`;
export const awb = () => `PTX${Math.floor(1e9 + Math.random() * 9e9)}`;
export const uid = () => randomCode(10);
