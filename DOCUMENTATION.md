# LaserTag PWA - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Key Features](#key-features)
4. [Component Structure](#component-structure)
5. [Utilities](#utilities)
6. [Configuration](#configuration)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

## Overview

LaserTag PWA is a Progressive Web Application designed to generate 1-bit monochrome BMP files for laser engraving text onto pre-printed name tags. The application provides a WYSIWYG editor, Firebase-backed history management, and AI-powered name extraction from photos.

## Architecture

### Technology Stack
- **Frontend Framework**: Vue.js 3 with Composition API
- **Build Tool**: Vite 7.x
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **AI Integration**: Google Gemini AI (gemini-1.5-flash)
- **PWA**: vite-plugin-pwa with Workbox

### Design Patterns
- **Composition API**: All components use Vue 3's Composition API for better code organization
- **Reactive State**: Uses Vue's reactive system for real-time updates
- **Composables**: Reusable logic extracted into composables (e.g., `useHistory`)

## Key Features

### 1. WYSIWYG Editor
- **Live Preview**: Canvas updates in real-time as you type or change settings
- **Auto-scaling**: Text automatically scales to fit within the engrave zone with 5% safety margin
- **Multi-unit Support**: Switch between mm, cm, and inches
- **Logo Dead-Zone**: Visual representation of pre-printed logo area with hatch pattern

### 2. Canvas Rendering
- **Resolution**: 300 DPI for physical accuracy
- **Dimensions**: User-defined width, height, and logo padding
- **Text Centering**: Text is perfectly centered within the engrave zone (not the entire tag)
- **Binary Search**: Uses binary search algorithm to find optimal font size

### 3. BMP Generation
- **Color Depth**: 1-bit monochrome (black and white only)
- **Format**: Standard BMP with proper file headers
- **Compatibility**: Works with EZCad, LightBurn, and other laser software
- **Horizontal Flip**: Support for mirrored text when needed

### 4. Firebase Integration
- **Real-time Sync**: History updates in real-time across devices
- **Data Structure**:
  ```javascript
  {
    text: string,
    settings: {
      width: number,
      height: number,
      padding: number,
      unit: 'mm' | 'cm' | 'in',
      isFlipped: boolean
    },
    status: 'pending' | 'exported',
    timestamp: Timestamp
  }
  ```

### 5. AI-Powered OCR
- **Model**: Gemini 1.5 Flash
- **Input**: Photos of handwritten or printed name lists
- **Output**: Array of extracted names
- **Batch Creation**: Automatically creates history items for each extracted name

## Component Structure

### Editor.vue
Main editing interface with:
- Input fields for dimensions (width, height, padding)
- Unit selector (mm, cm, in)
- Text input field
- Flip horizontally checkbox
- Live canvas preview
- Save and Export buttons

**Key Methods**:
- `updateCanvas()`: Renders the canvas with current settings
- `saveToHistory()`: Saves current design to Firebase
- `exportBMP()`: Generates and downloads BMP file

### History.vue
Displays all saved designs with:
- Miniature canvas previews (200x100px max)
- Timestamp display
- Pending/Exported status badges
- Export options (new file or overwrite)
- Delete functionality

**Key Methods**:
- `renderPreviews()`: Renders miniature previews for all history items
- `exportItem()`: Exports a specific history item as BMP
- `deleteItem()`: Removes an item from history

### AIUpload.vue
Handles AI-powered name extraction with:
- File input for photo upload
- Processing indicator
- Success/Error messages
- Usage tips

**Key Methods**:
- `handleFileSelect()`: Processes uploaded image with Gemini AI
- Emits `names-extracted` event with array of names

## Utilities

### canvas.js
Canvas rendering utilities:
- `convertToPixels(value, unit)`: Converts measurements to pixels at 300 DPI
- `renderCanvas(canvas, text, settings)`: Renders full-resolution canvas
- `renderMiniature(canvas, text, settings, maxWidth, maxHeight)`: Renders scaled-down preview

### bmp.js
BMP file generation:
- `generateBMP(canvas, isFlipped)`: Generates 1-bit BMP blob from canvas
- `downloadBMP(blob, filename)`: Triggers browser download

**BMP Specifications**:
- File Header: 14 bytes
- DIB Header (BITMAPINFOHEADER): 40 bytes
- Color Table: 8 bytes (2 colors)
- Pixel Data: Row-aligned to 4-byte boundaries
- Bottom-up format (standard for BMP)

### gemini.js
AI integration:
- `extractNamesFromImage(imageFile)`: Extracts names from image using Gemini AI

### composables/useHistory.js
Firebase operations:
- `historyItems`: Reactive array of history items
- `loading`: Loading state
- `error`: Error state
- `addHistoryItem(text, settings)`: Creates new history item
- `updateHistoryItem(id, updates)`: Updates existing item
- `deleteHistoryItem(id)`: Deletes an item

## Configuration

### Environment Variables

Required variables in `.env`:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Gemini AI Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Firebase Setup

1. **Create Firestore Database**:
   - Go to Firebase Console
   - Create a new project
   - Enable Firestore Database
   - Start in test mode for development

2. **Firestore Rules** (Production):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /history/{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

3. **Firestore Rules** (Development):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /history/{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```

### PWA Configuration

PWA settings in `vite.config.js`:
- Auto-update strategy
- Service worker generation
- Manifest configuration
- Asset caching with Workbox

## Deployment

### Build for Production

```bash
npm run build
```

This creates optimized files in `dist/` directory with:
- Minified JavaScript and CSS
- Service worker for offline support
- Web manifest for installability
- Optimized assets

### Deploy to Hosting

#### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

#### Netlify
```bash
npm run build
# Drag dist/ folder to Netlify
```

#### Vercel
```bash
npm install -g vercel
vercel
```

## Troubleshooting

### Canvas Not Rendering
- Check console for errors
- Ensure canvas element has proper dimensions
- Verify text is not empty

### Firebase Connection Issues
- Verify environment variables are set correctly
- Check Firebase project configuration
- Review Firestore rules
- Check browser console for CORS errors

### BMP Export Issues
- Ensure canvas is fully rendered before export
- Check browser console for errors
- Verify BMP file headers are correct
- Test with different laser software

### AI Extraction Not Working
- Verify Gemini API key is valid
- Check API quota limits
- Ensure image is clear and readable
- Check network connectivity

### PWA Installation Issues
- Serve over HTTPS (required for PWA)
- Check manifest.json is accessible
- Verify service worker registration
- Use Chrome DevTools > Application > Manifest

## Performance Optimization

### Canvas Rendering
- Miniature previews use scaled-down rendering
- Binary search for optimal font size reduces iterations
- Canvas operations are batched

### Firebase
- Real-time listeners only for active views
- Proper cleanup in component unmount
- Query indexing for timestamp ordering

### Bundle Size
- Tree shaking with Vite
- Dynamic imports for code splitting
- Optimized image assets

## Browser Support

### Minimum Requirements
- Canvas API support
- ES6+ JavaScript
- Service Worker API (for PWA)
- IndexedDB (for offline caching)

### Tested Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Security Considerations

1. **API Keys**: Never commit `.env` file
2. **Firestore Rules**: Implement proper authentication in production
3. **Input Validation**: Sanitize user input
4. **CORS**: Configure Firebase CORS settings
5. **HTTPS**: Always serve over HTTPS in production

## Future Enhancements

- [ ] User authentication
- [ ] Custom fonts
- [ ] Multiple text lines
- [ ] Logo upload and placement
- [ ] Batch export
- [ ] Templates and presets
- [ ] Cloud storage integration
- [ ] Collaboration features
- [ ] Advanced text formatting
- [ ] QR code support
