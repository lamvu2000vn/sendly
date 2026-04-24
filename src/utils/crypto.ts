/**
 * Utility to calculate SHA-256 hash of a File or Blob.
 */
export async function calculateFileHash(file: File | Blob): Promise<string> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
        return hashHex;
    } catch (error) {
        console.error('Hash calculation failed', error);
        return '';
    }
}
