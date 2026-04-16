export const DEFAULT_CHUNK_SIZE = 16 * 1024; // 16 KB
export const MAX_CHUNK_SIZE = 64 * 1024; // 64 KB
export const SEND_OFFER_DELAY = 5000;
export const POLL_INTERVAL = 3000;
export const ICE_SERVERS: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.services.mozilla.com' },
];
export const HOST_CODE_EXPIRATION = 5 * 60 * 1000; // 5 minutes
export const GUEST_SIGNAL_TIMEOUT = 15 * 1000; // 15 seconds
export const GUEST_ICE_TIMEOUT = 15 * 1000; // 15 seconds
