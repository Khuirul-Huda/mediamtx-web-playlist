// ============================================
// MediaMTX Web Playlist - Main Entry Point
// ============================================

import DOM from './config/domElements.js';
import appState from './state/appState.js';
import { updateStatusUI, startClock, copyLink, toggleSection } from './utils/uiUtils.js';
import { renderChannels, measureAllLatencies } from './services/channelService.js';
import { fetchRecordings } from './services/recordingService.js';
import { triggerDownload } from './services/playerService.js';
import { setToday, renderCalendar, initCalendar } from './components/calendarComponent.js';
import { initChannelModal } from './components/channelModal.js';
import { initMobileNav } from './components/mobileNav.js';
import { initPrivacyMode } from './components/privacyComponent.js';

// Initialize application
function initApp() {
    // Render channels list
    renderChannels();
    
    // Measure latencies for all channels
    measureAllLatencies();
    
    // Set today's date
    setToday();
    
    // Initialize calendar
    renderCalendar();
    initCalendar();
    
    // Initialize components
    initChannelModal();
    initMobileNav();
    initPrivacyMode();
    
    // Initialize legacy settings form (kept for compatibility but hidden)
    initLegacySettings();
    
    // Update UI
    updateStatusUI();
    startClock();
    
    // Auto-fetch recordings if channel is configured
    if (appState.currentChannel && appState.currentChannel.host && appState.currentChannel.path) {
        fetchRecordings();
    }
}

// Legacy settings form handlers
function initLegacySettings() {
    if (DOM.settingsForm) {
        DOM.settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    }
    
    if (DOM.formatToggle) {
        DOM.formatToggle.addEventListener('change', (e) => {
            if (!appState.currentChannel) return;
            appState.updateChannel(appState.currentChannelId, {
                useMp4: e.target.checked
            });
        });
    }
}

// Wait for DOM to be ready
window.addEventListener('DOMContentLoaded', initApp);

// Expose functions to global scope for HTML onclick handlers
window.toggleSection = toggleSection;
window.setToday = setToday;
window.fetchRecordings = fetchRecordings;
window.copyLink = copyLink;
window.triggerDownload = triggerDownload;
