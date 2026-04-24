import { z } from 'zod';

// --- Signaling Schemas ---

export const SignalMessageSchema = z.object({
    type: z.enum(['offer', 'answer', 'candidate']),
    data: z.string().min(1),
});

export type SignalMessage = z.infer<typeof SignalMessageSchema>;

// --- WebRTC Data Channel Schemas ---

export const FileManifestItemSchema = z.object({
    id: z.string(),
    fileName: z.string(),
    fileSize: z.number().nonnegative(),
    hash: z.string().nullish(),
});

export const ManifestMessageSchema = z.object({
    type: z.literal('manifest'),
    files: z.array(FileManifestItemSchema),
});

export const FileStartMessageSchema = z.object({
    type: z.literal('file-start'),
    fileId: z.string(),
    fileName: z.string(),
    fileSize: z.number().nonnegative(),
    chunkSize: z.number().positive(),
    hash: z.string().optional(),
});

export const FileCancelMessageSchema = z.object({
    type: z.literal('file-cancel'),
    fileId: z.string(),
});

export const WebRTCMessageSchema = z.discriminatedUnion('type', [
    ManifestMessageSchema,
    FileStartMessageSchema,
    FileCancelMessageSchema,
]);

export type WebRTCMessage = z.infer<typeof WebRTCMessageSchema>;

// --- WebRTC signaling data schemas ---

export const RTCSessionDescriptionSchema = z.object({
    type: z.enum(['offer', 'answer', 'pranswer', 'rollback']),
    sdp: z.string(),
});

export const RTCIceCandidateSchema = z.object({
    candidate: z.string(),
    sdpMid: z.string().nullable().optional(),
    sdpMLineIndex: z.number().nullable().optional(),
    usernameFragment: z.string().nullable().optional(),
});
