# Sendly Architecture

## High Level Flow

Device A
   ↓ pairing
Signaling Phase
   ↓
WebRTC Peer Connection
   ↓
DataChannel
   ↓
Chunked File Transfer
   ↓
Device B

## Transfer Lifecycle

1. Device discovery
2. Pairing handshake
3. Peer connection creation
4. DataChannel open
5. File chunk streaming
6. Transfer completion

## Key Concepts

### Pairing
Temporary session connects two devices.

### WebRTC
Used for direct communication without server relay.

### Chunk Transfer
Files split into smaller chunks to:
- reduce memory usage
- enable progress tracking
- retry failures