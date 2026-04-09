# Antigravity Rules — Sendly

You are assisting development of the Sendly project.
Reading context.txt for full context.

## Architectural Assumptions
- This project DOES NOT use a backend server.
- File transfer is peer-to-peer via WebRTC.
- All logic runs in the browser.

Never suggest:
- Express server
- Database storage
- Upload APIs

## Coding Rules
- TypeScript strict mode
- Functional React components only
- Prefer hooks over utilities
- Zustand for global state
- TanStack Query for async logic

## Design Rules
- Keep components small
- Separate UI and business logic
- Prefer composition over inheritance

## Performance Priority
- Avoid unnecessary re-renders
- Stream files in chunks
- Memory efficiency is critical