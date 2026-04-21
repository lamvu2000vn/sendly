<p align="center">
  <img src="public/assets/images/icon_256.svg" alt="Sendly Logo" width="128" />
</p>

<h1 align="center">Sendly</h1>

<p align="center">
  <strong>Fast, Secure, Peer-to-Peer File Transfer</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/WebRTC-P2P-orange?style=flat-square" alt="WebRTC" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
</p>

---

Sendly is a modern, serverless web application designed for high-speed, peer-to-peer file sharing. By leveraging WebRTC technology, Sendly establishes a direct connection between devices, allowing you to transfer files, images, and videos of any size with original quality—without ever uploading them to a server.

## ✨ Features

- **🚀 P2P Transfer**: Direct device-to-device communication using WebRTC.
- **🛡️ Privacy First**: Your files never touch any backend server. Everything stays in your browser.
- **📦 Unlimited Size**: Send huge files without worrying about server storage limits.
- **💎 Original Quality**: No compression or resizing. What you send is what they get.
- **🔗 Serverless Signaling**: Uses [ntfy.sh](https://ntfy.sh) for lightweight, serverless WebRTC signaling.
- **🎨 Modern UI**: Beautiful, responsive interface built with shadcn/ui and Framer Motion.
- **📱 Cross-Platform**: Works on any device with a modern web browser.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **P2P Engine**: WebRTC API
- **Signaling**: [ntfy.sh](https://ntfy.sh) (Public topic-based signaling)

## 🏗️ Architecture

Sendly operates on a unique **Serverless P2P** architecture:

1. **Signaling**: When you share a code, Sendly uses a specific topic on `ntfy.sh` to exchange WebRTC session descriptions (offer/answer) and ICE candidates.
2. **Connection**: Once the signaling is complete, a direct PeerConnection is established between the two browsers.
3. **Transfer**: Files are sliced into chunks and streamed through WebRTC Data Channels for maximum efficiency and memory management.

## 🚀 Getting Started

First, clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/sendly.git
cd sendly
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📝 License

This project is licensed under the MIT License.

