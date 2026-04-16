import { customAlphabet } from 'nanoid';
import { POLL_INTERVAL, SIGNALING_FETCH_TIMEOUT } from '@/hooks/webrtc/constants';

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
    });
}

export interface SignalWithMeta {
    message: SignalMessage;
    timestamp: number;
}

export async function pollSignal(
    code: string,
    type: 'offer' | 'answer' | 'candidate',
    signal?: AbortSignal,
): Promise<SignalWithMeta | null> {
    const topic = `sendly_${code}_${type}`;
    // Combine provided signal with timeout
    const timeoutSignal = AbortSignal.timeout(SIGNALING_FETCH_TIMEOUT);
    const combinedSignal = signal
        ? AbortSignal.any([signal, timeoutSignal])
        : timeoutSignal;

    try {
        const response = await fetch(`${NTFY_URL}/${topic}/json?poll=1`, {
            signal: combinedSignal,
        });

        if (!response.ok) return null;

        const text = await response.text();
        if (!text) return null;

        // ntfy can return multiple messages, we take the last one
        const lines = text
            .trim()
            .split('\n')
            .filter((line) => line.trim() !== '');
        if (lines.length === 0) return null;

        const lastLine = lines[lines.length - 1];
        const ntfyMsg = JSON.parse(lastLine);

        if (ntfyMsg.message) {
            return {
                message: JSON.parse(ntfyMsg.message),
                timestamp: ntfyMsg.time, // unixtime in seconds
            };
        }
        return null;
    } catch (e) {
        if ((e as any).name === 'AbortError') return null;
        console.error('Error parsing signal', e);
        return null;
    }
}

export { generateCode };
