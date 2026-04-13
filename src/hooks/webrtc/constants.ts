export const DEFAULT_CHUNK_SIZE = 16 * 1024; // 16 KB
export const MAX_CHUNK_SIZE = 64 * 1024; // 64 KB
export const SEND_OFFER_DELAY = 3000;
export const POLL_INTERVAL = 2000;
export const ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
];
