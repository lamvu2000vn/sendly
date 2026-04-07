# Sendly — Project Context

## Overview
Sendly is a peer-to-peer file transfer web application that allows users
to send files directly between devices without a backend server.

The application works over shared networks such as WiFi, LAN, or mobile data.

## Core Goals
- Direct device-to-device file transfer
- Preserve original file quality
- Zero backend storage
- Fast pairing experience
- Cross-device compatibility

## Tech Stack
Frontend:
- Next.js (App Router)
- React
- TypeScript
- TailwindCSS
- shadcn/ui

State & Data:
- Zustand → global state
- TanStack Query → async state & caching

Networking:
- WebRTC → peer-to-peer communication
- Browser APIs → file streaming

## Architecture Philosophy
Frontend-first architecture.
All logic runs on client devices.

No persistent backend exists.

## Main Features
- Device pairing
- Secure connection establishment
- Chunk-based file transfer
- Transfer progress tracking
- Reconnection handling

## Folder Philosophy
- feature-based structure
- reusable hooks
- UI separated from logic

## Important Constraints
- No server-side file storage
- Avoid heavy global state
- Optimize large file streaming