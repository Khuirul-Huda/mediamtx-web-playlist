# MediaMTX Web Playlist - Code Structure

## Folder Organization

The JavaScript code has been refactored into a modular structure for better maintainability:

```
js/
├── main.js                      # Entry point, initializes the application
├── config/
│   └── domElements.js          # All DOM element references
├── state/
│   └── appState.js             # Application state management and localStorage
├── services/
│   ├── channelService.js       # Channel CRUD operations and rendering
│   ├── recordingService.js     # Fetch and display recordings from MediaMTX
│   └── playerService.js        # Video player and download functionality
├── components/
│   ├── calendarComponent.js    # Calendar UI and date selection
│   ├── channelModal.js         # Channel add/edit modal
│   ├── mobileNav.js            # Mobile navigation and playlist panel
│   └── privacyComponent.js     # Privacy mode toggle
└── utils/
    └── uiUtils.js              # UI helper functions (toast, status, clock)
```

## Module Descriptions

### main.js
- Application entry point
- Initializes all components on DOMContentLoaded
- Exposes global functions for HTML onclick handlers
- Coordinates initial app setup

### config/domElements.js
- Central location for all DOM element references
- Exports a single `DOM` object with all elements
- Makes it easy to find and update element selectors

### state/appState.js
- Singleton state management class
- Handles all application state (channels, privacy mode, calendar, recordings)
- Manages localStorage persistence
- Includes legacy migration logic

### services/channelService.js
- Channel CRUD operations (create, read, update, delete)
- Channel rendering and UI updates
- Latency measurement for channels
- Channel selection logic

### services/recordingService.js
- Fetch recordings from MediaMTX API
- Render playlist items
- Handle recording display and caching
- Privacy mode support for recordings

### services/playerService.js
- Video playback functionality
- Download recordings with progress tracking
- Stream URL generation
- Player UI updates

### components/calendarComponent.js
- Calendar rendering and navigation
- Date selection handling
- Month navigation (prev/next)
- Integration with recording fetch

### components/channelModal.js
- Channel add/edit modal UI
- Form validation
- Connection testing
- Modal lifecycle management

### components/mobileNav.js
- Mobile menu toggle
- Playlist panel show/hide (mobile)
- Touch/ESC key handling
- Responsive behavior

### components/privacyComponent.js
- Privacy mode toggle
- Privacy icon updates
- Coordinates privacy updates across components

### utils/uiUtils.js
- Toast notifications
- Status indicator updates
- Clock display
- Privacy blur helpers
- Latency badge helpers
- Copy to clipboard
- Section toggle

## Key Design Decisions

1. **ES6 Modules**: Using native JavaScript modules for better code organization
2. **Singleton State**: Single source of truth for application state
3. **Separation of Concerns**: Clear boundaries between data, UI, and business logic
4. **Minimal Circular Dependencies**: Resolved through dynamic imports where needed
5. **Backward Compatibility**: All existing features preserved without changes

## Migration Notes

- The original `app.js` has been backed up as `app.js.backup`
- All functionality remains identical to the original version
- No breaking changes to the user interface
- HTML updated to use ES6 module loading (`type="module"`)

## Benefits of This Structure

✅ **Maintainability**: Easy to find and modify specific features
✅ **Scalability**: Simple to add new features without affecting existing code
✅ **Testability**: Individual modules can be tested in isolation
✅ **Readability**: Clear module names indicate their purpose
✅ **Reusability**: Components can be reused or replaced independently
✅ **Debugging**: Issues can be quickly traced to specific modules
