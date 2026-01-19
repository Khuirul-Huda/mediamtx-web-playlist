# Module Dependency Graph

```
                         index.html
                              |
                              | (loads)
                              v
                          main.js
                              |
                              | (initializes)
        +-----------+---------+---------+----------+
        |           |         |         |          |
        v           v         v         v          v
  calendarComp  channelModal mobileNav privacyComp uiUtils
        |           |         |         |          |
        |           |         |         |          |
        +-----+-----+---------+---------+----------+
              |           |         |
              v           v         v
        +-----------------------------------+
        |          Services Layer           |
        +-----------------------------------+
        |                 |                 |
        v                 v                 v
 channelService   recordingService   playerService
        |                 |                 |
        |                 |                 |
        +--------+--------+---------+-------+
                 |                  |
                 v                  v
        +----------------+  +---------------+
        | domElements.js |  | appState.js   |
        | (config)       |  | (state)       |
        +----------------+  +---------------+
```

## Layer Description

### 1. **Entry Layer** (index.html → main.js)
   - Application bootstrap
   - Module initialization

### 2. **Component Layer** (UI Components)
   - `calendarComponent.js` - Date selection UI
   - `channelModal.js` - Channel management modal
   - `mobileNav.js` - Mobile menu & playlist panel
   - `privacyComponent.js` - Privacy mode toggle

### 3. **Service Layer** (Business Logic)
   - `channelService.js` - Channel CRUD operations
   - `recordingService.js` - Fetch & display recordings
   - `playerService.js` - Video playback & download

### 4. **Foundation Layer** (Shared Resources)
   - `domElements.js` - DOM element references
   - `appState.js` - Application state & storage
   - `uiUtils.js` - Common UI helpers

## Import Flow

```javascript
// Components import Services
calendarComponent → recordingService.fetchRecordings()
channelModal → channelService.renderChannels()
privacyComponent → recordingService.renderRecordings()

// Services import Foundation
channelService → domElements, appState, uiUtils
recordingService → domElements, appState, uiUtils
playerService → domElements, appState, uiUtils

// All paths lead to Foundation
Everything → domElements.js (DOM refs)
Everything → appState.js (state)
Everything → uiUtils.js (helpers)
```

## Circular Dependency Prevention

Some modules use **dynamic imports** to avoid circular dependencies:

```javascript
// Instead of direct import at top
import { selectChannel } from '../services/channelService.js';

// Use dynamic import when needed
import('../services/channelService.js').then(({ selectChannel }) => {
    selectChannel(newChannel.id);
});
```

This pattern is used in:
- `channelService.js` → imports `recordingService` dynamically
- `channelModal.js` → imports `channelService` dynamically
- Components that need services after user interaction
