/**
 * Simple IndexedDB wrapper to store file chunks temporarily
 * to avoid RAM overflow for large file transfers.
 */

const DB_NAME = 'sendly_storage';
const STORE_NAME = 'file_chunks';
const DB_VERSION = 2;

let dbCache: IDBDatabase | null = null;

export async function initStorage() {
    if (dbCache) return dbCache;
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = request.result;
            if (event.oldVersion < 1) {
                db.createObjectStore(STORE_NAME, { autoIncrement: true });
            }
            const store = request.transaction?.objectStore(STORE_NAME);
            if (store && !store.indexNames.contains('fileId')) {
                store.createIndex('fileId', 'fileId', { unique: false });
            }
        };
        request.onsuccess = () => {
            dbCache = request.result;
            resolve(request.result);
        };
        request.onerror = () => reject(request.error);
    });
}

export async function clearStorage(fileId?: string) {
    const db = await initStorage();
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        let request: IDBRequest;
        if (fileId) {
            const index = store.index('fileId');
            const range = IDBKeyRange.only(fileId);
            request = index.openCursor(range);
            request.onsuccess = () => {
                const cursor = (request as IDBRequest<IDBCursorWithValue>)
                    .result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                } else {
                    resolve();
                }
            };
        } else {
            request = store.clear();
            request.onsuccess = () => resolve();
        }
        request.onerror = () => reject(request.error);
    });
}

export async function purgeStorage() {
    if (dbCache) {
        dbCache.close();
        dbCache = null;
    }
    return new Promise<void>((resolve, reject) => {
        const request = indexedDB.deleteDatabase(DB_NAME);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
        request.onblocked = () => {
            console.warn('Delete database blocked');
            resolve(); // Still resolve to avoid hanging
        };
    });
}

export async function saveChunk(fileId: string, chunk: ArrayBuffer) {
    const db = await initStorage();
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add({ fileId, data: chunk });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function getAllChunks(fileId: string): Promise<ArrayBuffer[]> {
    const db = await initStorage();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('fileId');
        const request = index.openCursor(IDBKeyRange.only(fileId));

        const chunks: ArrayBuffer[] = [];
        request.onsuccess = () => {
            const cursor = request.result;
            if (cursor) {
                chunks.push(cursor.value.data);
                cursor.continue();
            } else {
                resolve(chunks);
            }
        };
        request.onerror = () => reject(request.error);
    });
}

/**
 * Returns a ReadableStream for a file's chunks,
 * allowing for memory-efficient file access.
 */
export function getFileStream(fileId: string): ReadableStream<ArrayBuffer> {
    return new ReadableStream({
        async start(controller) {
            const db = await initStorage();
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('fileId');
            const request = index.openCursor(IDBKeyRange.only(fileId));

            request.onsuccess = () => {
                const cursor = request.result;
                if (cursor) {
                    controller.enqueue(cursor.value.data);
                    cursor.continue();
                } else {
                    controller.close();
                }
            };
            request.onerror = () => {
                controller.error(request.error);
            };
        },
    });
}

export async function getBlobFromStorage(
    fileId: string,
    type: string = '',
): Promise<Blob> {
    // For large files, we should ideally use the stream to create a blob if possible,
    // but the Blob constructor already accepts a list of chunks.
    // The key optimization is using a cursor to fetch chunks instead of index.getAll()
    // which avoids creating a massive intermediate results array.
    const chunks = await getAllChunks(fileId);
    return new Blob(chunks, { type });
}
