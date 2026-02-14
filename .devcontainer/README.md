# Dev Container for LaserTag PWA

This directory contains the configuration for development containers, providing a consistent development environment for the LaserTag PWA project.

## What is a Dev Container?

A Dev Container is a Docker container that provides a fully configured development environment. It works with:
- **VS Code Dev Containers** - Local development in Docker containers
- **GitHub Codespaces** - Cloud-based development environments

The container includes:
- Node.js 20 LTS
- All necessary tools and dependencies
- Pre-configured VS Code extensions
- Port forwarding for the Vite dev server

## Quick Start Options

### Option 1: VS Code Dev Containers (Local)

Perfect for local development with full control.

**Prerequisites:**
- [Visual Studio Code](https://code.visualstudio.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

**Steps:**
1. Install prerequisites (if not already installed)
2. Open this repository in VS Code
3. Press `F1` or `Ctrl+Shift+P` (Windows/Linux) / `Cmd+Shift+P` (Mac)
4. Type "Dev Containers: Reopen in Container" and select it
5. Wait for the container to build (first time may take a few minutes)
6. Copy `.env.example` to `.env` and fill in your credentials
7. Start developing with `npm run dev`

### Option 2: GitHub Codespaces (Cloud)

Perfect for quick access from anywhere, no local setup required.

**Steps:**
1. Go to the repository on GitHub
2. Click the "Code" button
3. Select "Codespaces" tab
4. Click "Create codespace on main" (or your branch)
5. Wait for the environment to initialize
6. Copy `.env.example` to `.env` and fill in your credentials
7. Start developing with `npm run dev`

**Note:** The codespace configuration uses `devcontainer-codespaces.json` which is optimized for cloud environments.

## What's Included

### Pre-installed Extensions
- **Vue Language Features (Volar)** - Vue 3 support
- **TypeScript Vue Plugin** - Enhanced TypeScript support for Vue
- **Tailwind CSS IntelliSense** - Autocomplete for Tailwind classes
- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **Docker** - Docker file support (local only)

### Configured Ports
- **5173** - Vite development server (automatically forwarded)

### Features
- Node.js 20 LTS
- npm package manager
- Git
- Automatic dependency installation on container creation

## Environment Variables

The dev container supports mounting your local `.env` file:
1. Copy `.env.example` to `.env` in the root directory
2. Fill in your Firebase and Gemini API credentials
3. The file is automatically available in the container

For Codespaces, you can also use repository secrets:
1. Go to repository Settings → Secrets → Codespaces
2. Add secrets with the `VITE_` prefix
3. They'll be available as environment variables

## Benefits

- **Consistent Environment**: Everyone uses the same tools and versions
- **Quick Setup**: New developers can start in minutes
- **Isolation**: Dependencies don't pollute your local machine
- **Reproducible**: Same environment on Windows, Mac, Linux, and cloud
- **Pre-configured**: Extensions and settings ready to go

## Troubleshooting

### Container fails to build
- Ensure Docker Desktop is running (for local dev containers)
- Check Docker Desktop resources (memory/CPU allocation)
- Try "Dev Containers: Rebuild Container" from the command palette
- Check Docker Desktop logs for specific errors

### Environment variables not working
- Ensure `.env` file exists in the root directory
- Check file format matches `.env.example`
- For Codespaces, verify secrets are set correctly
- Restart the container after creating/modifying `.env`

### Port 5173 already in use
- Stop any local Vite servers running outside the container
- Or change the port in `vite.config.js` and update `devcontainer.json`

### Extensions not loading
- Reload the window: `F1` → "Developer: Reload Window"
- Check the Extensions view for any installation errors
- Rebuild the container if issues persist

## Development Commands

Once inside the container:

```bash
# Install/update dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Customization

### Adding Extensions

Edit `.devcontainer/devcontainer.json` and add to the `extensions` array:

```json
"customizations": {
  "vscode": {
    "extensions": [
      "your.extension.id"
    ]
  }
}
```

### Changing Node Version

Update the `image` property in `devcontainer.json`:

```json
"image": "mcr.microsoft.com/devcontainers/javascript-node:18"
```

### Adding Tools

Add to the `features` section:

```json
"features": {
  "ghcr.io/devcontainers/features/git:1": {},
  "ghcr.io/devcontainers/features/github-cli:1": {}
}
```

## Files in This Directory

- **devcontainer.json** - Main configuration for VS Code Dev Containers
- **devcontainer-codespaces.json** - Optimized configuration for GitHub Codespaces
- **README.md** - This file

## More Information

- [VS Code Dev Containers Documentation](https://code.visualstudio.com/docs/devcontainers/containers)
- [GitHub Codespaces Documentation](https://docs.github.com/en/codespaces)
- [Dev Container Specification](https://containers.dev/)
- [Available Dev Container Images](https://github.com/devcontainers/images)
