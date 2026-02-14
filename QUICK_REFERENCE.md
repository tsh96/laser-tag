# LaserTag PWA - Quick Reference Guide

## Getting Started

### First Time Setup
1. Clone the repository
2. Run `npm install`
3. Copy `.env.example` to `.env`
4. Add your Firebase and Gemini API keys
5. Run `npm run dev` to start

### Firebase Configuration
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Gemini AI Configuration
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## Basic Workflow

### Creating a Single Tag
1. Set dimensions (width, height, logo padding)
2. Choose unit (mm, cm, or in)
3. Enter text
4. Preview updates automatically
5. Click "Save to History" or "Export BMP"

### Batch Processing with AI
1. Take a clear photo of a name list
2. Click "Choose File" in AI Batch Entry
3. Wait for AI to extract names
4. Names automatically added to history
5. Export individually from history

### Exporting Files
- **Export (New)**: Creates unique filename with timestamp
- **Export (Overwrite)**: Always saves as `output.bmp`

## Tips & Tricks

### For Best Results
- Use high-contrast photos for AI extraction
- Keep text concise to fit better
- Adjust logo padding to match your physical tags
- Test with a single export before batch processing

### Dimensions Guide
- **Standard Name Tag**: 3" × 1" (or 76mm × 25mm)
- **Logo Padding**: Typically 0.5" - 1" (13mm - 25mm)
- **Resolution**: Always 300 DPI for best quality

### Unit Conversion
- 1 inch = 25.4 mm = 2.54 cm
- 1 cm = 10 mm = 0.394 inches
- 1 mm = 0.1 cm = 0.0394 inches

## Understanding the Interface

### Editor Panel
- **Width/Height**: Overall tag dimensions
- **Logo Padding**: Left side reserved for logo
- **Unit**: Measurement system (mm/cm/in)
- **Text**: Name or text to engrave
- **Flip Horizontally**: Mirror the text

### Canvas Preview
- **Gray Hatched Area**: Logo dead-zone (won't engrave)
- **White Area**: Engrave zone
- **Black Text**: What will be engraved
- Auto-scales to fit with 5% margin

### History Cards
- **Preview**: Miniature of actual output
- **Status Badge**: Pending (AI) or Exported
- **Dimensions**: Settings used for this item
- **Action Buttons**: Export or delete

## Common Issues

### Firebase Connection Error
- Check `.env` file exists
- Verify all Firebase variables are set
- Check Firestore rules allow access
- Ensure Firebase project is active

### AI Not Extracting Names
- Ensure photo is clear and well-lit
- Check Gemini API key is valid
- Verify API quota not exceeded
- Try a different photo

### BMP Won't Open in Laser Software
- Ensure file downloaded completely
- Try "Export (Overwrite)" mode
- Check BMP is 1-bit monochrome
- Verify software supports BMP format

### Text Not Showing
- Check text field is not empty
- Ensure canvas is visible on screen
- Try refreshing the page
- Check browser console for errors

## Keyboard Shortcuts

Currently none - all interactions via UI

## Browser Requirements

- Modern browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Canvas API support
- LocalStorage enabled
- Internet connection (for Firebase & AI)

## PWA Features

### Install as App
1. Open in Chrome/Edge
2. Click install icon in address bar
3. Or: Menu → Install LaserTag

### Benefits
- Runs like native app
- Faster loading
- Offline asset caching
- Home screen icon

## Support

For issues, questions, or feature requests:
1. Check DOCUMENTATION.md
2. Review console for errors
3. Create issue in repository

## Quick Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production
npm run preview

# Install dependencies
npm install
```

## File Locations

- **Exports**: Downloads folder (browser default)
- **Icons**: `/public/icon-*.png`
- **Source**: `/src/`
- **Build Output**: `/dist/`

## Best Practices

1. **Before Batch Export**: Test with one item first
2. **Backup Data**: Export important items immediately
3. **Regular Cleanup**: Delete old history items
4. **Check Dimensions**: Verify settings before AI batch
5. **Clear Photos**: Use good lighting for AI extraction

## Laser Software Setup

### EZCad
1. Import BMP file
2. Set power/speed settings
3. Position on workspace
4. Run job

### LightBurn
1. Import → BMP
2. Image mode → Threshold
3. Set job parameters
4. Send to laser

## Production Deployment

1. Build: `npm run build`
2. Test: `npm run preview`
3. Deploy `dist/` folder to hosting
4. Update environment variables on hosting
5. Verify PWA manifest loads
6. Test on mobile and desktop

## Troubleshooting Checklist

- [ ] Node.js installed (v18+)
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with valid keys
- [ ] Firebase project created and configured
- [ ] Gemini API key obtained
- [ ] Firestore rules allow access
- [ ] Browser is modern and updated
- [ ] JavaScript and cookies enabled
- [ ] Internet connection active

## Version Information

- Vue.js: 3.5+
- Vite: 7.x
- Node.js: 18+ recommended
- Firebase: 10.x
- Tailwind CSS: Latest

## Getting Help

1. Read documentation
2. Check browser console
3. Review Firebase logs
4. Test with mock data
5. Create detailed issue report

---

For complete documentation, see [DOCUMENTATION.md](./DOCUMENTATION.md)
