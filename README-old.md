Project Specification: LaserTag PWA (Vue.js + Firebase + Gemini)
Role: Expert Full-Stack Vue.js Developer
Goal: Build a Progressive Web App (PWA) to generate 1-bit monochrome BMP files for laser engraving text onto pre-printed name tags.
1. Technical Stack
 * Frontend: Vue.js 3 (Composition API), Vite, Tailwind CSS.
 * Database: Firebase Firestore (Real-time history sync).
 * AI Engine: Gemini 3 Flash API (OCR for name list extraction).
 * Imaging: HTML5 Canvas API (Strictly monochrome/1-bit output).
2. Core Layout & WYSIWYG Logic
The editor must be a live WYSIWYG (What You See Is What You Get) interface.
 * Input Dimensions: User defines Width, Height, and Logo Padding (Units: mm, cm, or in).
 * The "Logo Dead-Zone": The left side of the tag (defined by Logo Padding) is a reserved area for a pre-printed logo. It must be visually shaded with a hatch pattern.
 * The "Engrave Zone": The remaining area to the right of the padding.
 * Auto-Scaling Text: * Text must be perfectly centered within the Engrave Zone (not the whole tag).
   * Font size must automatically shrink to fit the width and height of the Engrave Zone with a 5% safety margin.
3. History Management (Firebase)
 * Data Structure: Store text, status (pending/exported), timestamp, and a settings object containing the specific dimensions (width, height, padding, unit, isFlipped) used at the time of creation.
 * On-the-Fly Previews: Do not store images in Firestore. The History List must render a miniature version of the WYSIWYG canvas for every item using its saved settings.
 * Pending State: Items created via AI OCR that have not been exported yet must display a "Pending" badge.
4. Key Workflows
 * AI Batch Entry: * Use Gemini 3 Flash to process an uploaded photo of a handwritten/printed name list.
   * Extract names and create individual Firestore documents for each name.
   * New items inherit the current active settings from the editor.
 * Exporting:
   * Direct Export: Each history card must have an "Export BMP" button.
   * Logic: Export a 1-bit monochrome BMP. If isFlipped is true, the text must be mirrored horizontally.
   * File Handling: User can choose to "Save as New" (unique filename) or "Overwrite" (fixed filename: output.bmp).
5. UI/UX Requirements
 * Clean PWA Interface: Mobile-friendly for capturing lists, desktop-friendly for exporting to the laser.
 * Live Preview: Any change to dimensions or text in the editor reflects instantly on the canvas.
 * Visual Feed: A vertical or grid list of history items, each showing its unique layout preview.
6. BMP Technical Constraints
 * Color Depth: 1-bit (Black and White). No grey, no anti-aliasing.
 * Resolution: Render at 300 DPI for physical accuracy.
 * Output: Proper BMP file header structure for compatibility with industrial laser software (e.g., EZCad, LightBurn).
