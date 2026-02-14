# LaserTag PWA - Laser Engraving Tool

A Progressive Web App (PWA) for generating 1-bit monochrome BMP files for laser engraving text onto pre-printed name tags.

## Features

- **WYSIWYG Editor**: Live preview canvas with auto-scaling text
- **Logo Dead-Zone**: Visual representation of pre-printed logo area with hatch pattern
- **Multi-Unit Support**: Work with mm, cm, or inches
- **Firebase Integration**: Real-time history synchronization
- **Email/Password Auth**: Firebase Authentication sign-in and account creation
- **AI-Powered OCR**: Extract names from photos using Gemini AI
- **1-Bit BMP Export**: Generate industry-standard BMP files at 300 DPI
- **Horizontal Flip**: Mirror text for special engraving needs
- **PWA Support**: Install on mobile and desktop devices

## Technology Stack

- **Frontend**: Vue.js 3 (Composition API)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **AI Engine**: Google Gemini AI (gemini-1.5-flash)
- **PWA**: vite-plugin-pwa

## Setup Instructions

### Option 1: Dev Container (Recommended)

The fastest way to get started is using VS Code Dev Containers:

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop) and [VS Code](https://code.visualstudio.com/)
2. Install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
3. Open this repository in VS Code
4. Press `F1` and select "Dev Containers: Reopen in Container"
5. Create `.env` file from `.env.example` and add your credentials
6. Start developing! Dependencies are automatically installed.

See [.devcontainer/README.md](.devcontainer/README.md) for more details.

### Option 2: Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file based on `.env.example` and fill in your Firebase and Gemini AI credentials.
Also enable **Email/Password** under Firebase Console → Authentication → Sign-in method.

### 3. Run Development Server

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build
```

See full documentation in the README for detailed setup and usage instructions.
