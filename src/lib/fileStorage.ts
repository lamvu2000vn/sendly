/**
 * Simple IndexedDB wrapper to store file chunks temporarily
 * to avoid RAM overflow for large file transfers.
 */

const DB_NAME = 'sendly_storage';
const STORE_NAME = 'file_chunks';

let dbCache: IDBDatabase | null = null;

export async function initStorage() {
    if (dbCache) return dbCache;
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { autoIncrement: true });
            }
        };
        request.onsuccess = () => {
            dbCache = request.result;
            resolve(request.result);
        };
        request.onerror = () => reject(request.error);
    });
}

export async function clearStorage() {
    const db = await initStorage();
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function saveChunk(chunk: ArrayBuffer) {
    const db = await initStorage();
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(chunk);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function getAllChunks(): Promise<ArrayBuffer[]> {
    const db = await initStorage();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function getBlobFromStorage(type: string = ''): Promise<Blob> {
    const chunks = await getAllChunks();
    return new Blob(chunks, { type });
}
