# GitHub Copilot Instructions for LaserTag PWA

## Project Overview

LaserTag PWA is a Progressive Web Application for generating 1-bit monochrome BMP files for laser engraving text onto pre-printed name tags. The application provides a WYSIWYG editor, Firebase-backed history management, and AI-powered name extraction from photos.

## Technology Stack

- **Frontend Framework**: Vue.js 3 with Composition API and TypeScript
- **Build Tool**: Vite 7.x
- **Styling**: Tailwind CSS 4.x
- **Database**: Firebase Firestore
- **AI Integration**: Google Gemini AI (gemini-1.5-flash)
- **PWA**: vite-plugin-pwa with Workbox
- **Node**: >=24.0.0
- **Package Manager**: pnpm >=10.0.0

## Key Commands

### Development

```bash
pnpm install          # Install dependencies
pnpm run dev         # Start development server (Vite)
pnpm run build       # Build for production (runs vue-tsc + vite build)
pnpm run preview     # Preview production build
```

### Important Notes

- Always run `pnpm run build` before production deployment to ensure TypeScript compilation
- Use `pnpm install` (not `npm` or `yarn`) as the project uses pnpm

## Tool & Skill Usage Policy (Required)

For non-trivial tasks, the agent must follow a tool-first workflow and use available MCP tools and skills when relevant.

### Required Workflow

1. **Preflight first**: Before implementation, identify relevant MCP tools and relevant skills.
2. **Use skills explicitly**: If a matching skill exists, read its `SKILL.md` and apply its guidance.
3. **Use tools explicitly**: Use available tools for discovery, edits, validation, and verification rather than relying only on assumptions.
4. **Report usage**: In the final response, include which MCP tools/skills were used and how they influenced the result.

### Completion Gate

- Do not finalize a non-trivial task without using at least one relevant tool and one relevant skill when available.
- If no relevant tool or skill exists, explicitly state that and proceed with the best available approach.

### Enforcement Heuristics

- Prefer tool calls for: file discovery, code search, file reads, edits, error checks, tests/builds, and runtime verification.
- Prefer skill guidance for domain-specific work (Firestore, PWA, Vite, Vue/TS, Playwright).
- If a task is simple and atomic (e.g., one-line typo fix), tool usage can be minimal, but verification is still expected.

## Project Structure

```
/src
  /components      # Vue components
    Editor.vue     # Main editing interface with canvas
    History.vue    # History list with miniature previews
    AIUpload.vue   # AI-powered name extraction
  /composables     # Vue composables
    useHistory.js  # Firebase operations
  /utils           # Utility functions
    canvas.js      # Canvas rendering (300 DPI)
    bmp.js         # 1-bit BMP generation
    gemini.js      # Gemini AI integration
  firebase.ts      # Firebase initialization
  types.ts         # TypeScript type definitions
```

## Code Conventions and Style

### Vue Components

- Use Vue 3 Composition API (`<script setup>`) for all components
- Use TypeScript for type safety
- Follow the existing pattern of reactive state management
- Components should be self-contained and reusable

### File Naming

- Vue components: PascalCase (e.g., `Editor.vue`, `AIUpload.vue`)
- Utilities: camelCase (e.g., `canvas.js`, `bmp.js`)
- TypeScript files: camelCase with `.ts` extension
- Composables: camelCase with `use` prefix (e.g., `useHistory.js`)

### Styling

- Use Tailwind CSS utility classes for styling
- Follow existing Tailwind configuration in `tailwind.config.js`
- Maintain consistent spacing and responsive design patterns

### Canvas Rendering

- Always use 300 DPI for physical accuracy
- Text must be centered within the engrave zone (not the entire tag)
- Use binary search algorithm for optimal font sizing
- Respect the 5% safety margin

### BMP Generation

- Generate only 1-bit monochrome BMP files
- Follow standard BMP format specifications
- Ensure compatibility with EZCad and LightBurn laser software
- Row alignment must be 4-byte boundaries

## Firebase Integration

### Data Structure

All history items follow this structure:

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

### Best Practices

- Use the `useHistory` composable for all Firebase operations
- Proper cleanup of real-time listeners in component unmount
- Query with timestamp ordering

## Environment Variables

Never commit the `.env` file. Always use `.env.example` as a template.

Required variables:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_GEMINI_API_KEY=
```

## Security and Boundaries

### DO NOT

- Commit secrets or API keys to source code
- Modify `.env` file (only modify `.env.example` for documentation)
- Break the 1-bit BMP format specification
- Change canvas DPI from 300 without careful consideration
- Remove error handling from Firebase or Gemini AI calls
- Modify files in `node_modules/` or `dist/`

### DO

- Validate all user input
- Handle errors gracefully with user-friendly messages
- Maintain HTTPS in production for PWA functionality
- Follow existing patterns for new features
- Test canvas rendering with various text inputs
- Verify BMP exports work with laser engraving software

## Testing and Validation

### Manual Testing Checklist

- Test canvas rendering with different text inputs and dimensions
- Verify BMP export produces valid 1-bit monochrome files
- Check Firebase history synchronization works correctly
- Test AI name extraction with sample images
- Verify PWA installation works (requires HTTPS)
- Test all units (mm, cm, inches) conversion
- Verify horizontal flip functionality

### Browser Testing

Ensure compatibility with:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Common Patterns

### Adding a New Component

1. Create component in `/src/components` using Composition API
2. Use TypeScript for props and emits
3. Follow existing styling patterns with Tailwind CSS
4. Import and use in `App.vue`

### Adding a New Utility

1. Create utility file in `/src/utils`
2. Export pure functions with clear parameters and return types
3. Add JSDoc comments for complex logic
4. Import where needed

### Modifying Canvas Rendering

1. Changes should be made in `/src/utils/canvas.js`
2. Maintain 300 DPI resolution
3. Test with various dimensions and text inputs
4. Verify both full and miniature rendering

## Dependencies

### Production Dependencies

- `vue`: Vue.js 3 framework
- `firebase`: Firebase SDK for Firestore
- `@google/generative-ai`: Gemini AI SDK
- `vite-plugin-pwa`: PWA support

### Development Dependencies

- `@vitejs/plugin-vue`: Vite plugin for Vue
- `tailwindcss`: CSS framework
- `typescript`: Type checking
- `vue-tsc`: TypeScript checker for Vue

### Adding New Dependencies

- Always check for security vulnerabilities before adding
- Prefer well-maintained packages with active communities
- Update package.json and package-lock.json
- Run `npm install` to verify

## Documentation

### When to Update Documentation

- Update `README.md` for user-facing changes
- Update `DOCUMENTATION.md` for technical/architectural changes
- Update `QUICK_REFERENCE.md` for new features or workflow changes
- Update this file for new conventions or guidelines

### Documentation Style

- Use clear, concise language
- Include code examples where appropriate
- Keep formatting consistent with existing documentation
- Add Table of Contents for long documents

## Troubleshooting Common Issues

### Canvas Not Rendering

- Check console for errors
- Verify canvas element has proper dimensions
- Ensure text is not empty

### Firebase Connection Issues

- Verify environment variables are set correctly
- Check Firestore rules in Firebase Console
- Review browser console for CORS errors

### BMP Export Issues

- Ensure canvas is fully rendered before export
- Verify BMP file headers match specification
- Test with laser engraving software

### AI Extraction Not Working

- Verify Gemini API key is valid and has quota
- Check image is clear and readable
- Review network connectivity

## Performance Considerations

- Canvas operations are expensive; batch when possible
- Use miniature rendering for preview thumbnails
- Binary search reduces font size calculation iterations
- Implement proper cleanup for Firebase listeners
- Leverage Vite's tree shaking and code splitting

## Accessibility

- Ensure proper ARIA labels for interactive elements
- Maintain keyboard navigation support
- Provide alternative text for images
- Use semantic HTML elements

## Version Control

### Commit Messages

- Use clear, descriptive commit messages
- Follow conventional commits format when possible
- Reference issue numbers when applicable

### Branch Strategy

- Create feature branches from main
- Keep changes focused and atomic
- Write meaningful PR descriptions

## Support and Resources

- Main documentation: `/DOCUMENTATION.md`
- Quick reference: `/QUICK_REFERENCE.md`
- Environment setup: `.env.example`
- Dev Container: `.devcontainer/README.md`
