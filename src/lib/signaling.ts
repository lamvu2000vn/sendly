import { customAlphabet } from 'nanoid';

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const generateCode = customAlphabet(alphabet, 8);

const NTFY_URL = 'https://ntfy.sh';

export interface SignalMessage {
    type: 'offer' | 'answer' | 'candidate';
    data: string;
}

export async function sendSignal(code: string, message: SignalMessage) {
    const topic = `sendly_${code}_${message.type}`;
    await fetch(`${NTFY_URL}/${topic}`, {
        method: 'POST',
        body: JSON.stringify(message),
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function pollSignal(
    code: string,
    type: 'offer' | 'answer' | 'candidate',
): Promise<SignalMessage | null> {
    const topic = `sendly_${code}_${type}`;
    // We use ?poll=1 to wait for a message if none exists, but with a timeout
    const response = await fetch(`${NTFY_URL}/${topic}/json?poll=1`, {
        signal: AbortSignal.timeout(30000), // 30s timeout for polling
    });

    if (!response.ok) return null;

    try {
        const text = await response.text();
        if (!text) return null;

        // ntfy can return multiple messages, we take the last one
        const lines = text.trim().split('\n');
        const lastLine = lines[lines.length - 1];
        const msg = JSON.parse(lastLine);

        if (msg.message) {
            return JSON.parse(msg.message);
        }
        return null;
    } catch (e) {
        console.error('Error parsing signal', e);
        return null;
    }
}

export { generateCode };
