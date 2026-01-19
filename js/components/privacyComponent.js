// ============================================
// Privacy Component
// ============================================

import DOM from '../config/domElements.js';
import appState from '../state/appState.js';
import { updatePrivacyIcon, updateStatusUI } from '../utils/uiUtils.js';
import { renderChannels } from '../services/channelService.js';
import { renderRecordings } from '../services/recordingService.js';

// Toggle privacy mode
export function togglePrivacyMode() {
    appState.togglePrivacyMode();
    updatePrivacyIcon();
    renderChannels();
    renderRecordings();
    updateStatusUI();
}

// Initialize privacy toggle
export function initPrivacyMode() {
    if (DOM.privacyToggle) {
        DOM.privacyToggle.addEventListener('click', togglePrivacyMode);
    }
    
    // Set initial icon state
    updatePrivacyIcon();
}
