// ============================================
// UI Utilities
// ============================================

import DOM from '../config/domElements.js';
import appState from '../state/appState.js';

// Toast timeout tracker
let toastTimeout = null;

// Toast Notification
export function showToast(title, message, type) {
    if (!DOM.toast) return;
    
    // Clear any existing timeout
    if (toastTimeout) {
        clearTimeout(toastTimeout);
        toastTimeout = null;
    }
    
    DOM.toastTitle.innerText = title;
    DOM.toastMessage.innerText = message;
    
    // Reset to base classes
    DOM.toast.className = 'fixed bottom-6 right-6 glass-panel px-5 py-4 rounded-xl shadow-2xl transform transition-all duration-500 z-50 flex items-center gap-4 border-l-4';
    
    // Add type-specific styling
    if (type === 'success') {
        DOM.toast.classList.add('border-emerald-500');
        DOM.toastIcon.className = 'fa-solid fa-check text-emerald-400 text-sm';
    } else if (type === 'error') {
        DOM.toast.classList.add('border-red-500');
        DOM.toastIcon.className = 'fa-solid fa-triangle-exclamation text-red-400 text-sm';
    } else {
        DOM.toast.classList.add('border-brand-500');
        DOM.toastIcon.className = 'fa-solid fa-bell text-brand-400 text-sm';
    }
    
    // Show toast (force reflow for animation)
    DOM.toast.classList.remove('translate-y-32', 'opacity-0');
    DOM.toast.classList.add('translate-y-0', 'opacity-100');
    
    // Auto close after 3 seconds
    toastTimeout = setTimeout(() => {
        DOM.toast.classList.remove('translate-y-0', 'opacity-100');
        DOM.toast.classList.add('translate-y-32', 'opacity-0');
        toastTimeout = null;
    }, 3000);
}

// Privacy Mode Functions
export function updatePrivacyIcon() {
    if (!DOM.privacyIcon || !DOM.privacyToggle) return;
    
    if (appState.privacyMode) {
        DOM.privacyIcon.className = 'fa-solid fa-eye-slash';
        DOM.privacyToggle.classList.add('text-brand-400');
        DOM.privacyToggle.title = 'Privacy Mode: ON';
    } else {
        DOM.privacyIcon.className = 'fa-solid fa-eye';
        DOM.privacyToggle.classList.remove('text-brand-400');
        DOM.privacyToggle.title = 'Privacy Mode: OFF';
    }
}

export function getBlurClass() {
    return appState.privacyMode ? 'privacy-blur' : '';
}

// Latency Functions
export function getLatencyBadgeClass(latency) {
    if (latency < 0) return 'latency-unknown';
    if (latency < 100) return 'latency-good';
    if (latency < 300) return 'latency-medium';
    return 'latency-bad';
}

export function getLatencyText(latency) {
    if (latency < 0) return 'N/A';
    return `${latency}ms`;
}

// Status UI Update
export function updateStatusUI() {
    const channel = appState.currentChannel;
    
    if (channel && channel.host && channel.path) {
        if (DOM.statusDot) {
            DOM.statusDot.classList.remove('bg-red-500', 'shadow-[0_0_10px_rgba(239,68,68,0.5)]');
            DOM.statusDot.classList.add('bg-emerald-500', 'shadow-[0_0_10px_rgba(16,185,129,0.5)]');
        }
        const pathBlur = appState.privacyMode ? 'privacy-blur' : '';
        const hostBlur = appState.privacyMode ? 'privacy-blur' : '';
        DOM.currentConfigDisplay.innerHTML = `${channel.name} (<span class="${pathBlur}">${channel.path}</span> @ <span class="${hostBlur}">${new URL(channel.host).hostname}</span>)`;
    } else {
        if (DOM.statusDot) {
            DOM.statusDot.classList.remove('bg-emerald-500', 'shadow-[0_0_10px_rgba(16,185,129,0.5)]');
            DOM.statusDot.classList.add('bg-red-500', 'shadow-[0_0_10px_rgba(239,68,68,0.5)]');
        }
        DOM.currentConfigDisplay.innerText = 'No channel selected';
    }
}

export function updateLastRefreshedTime() {
    if (!DOM.lastUpdatedDisplay) return;
    
    const now = new Date();
    DOM.lastUpdatedDisplay.innerText = `Updated: ${now.toLocaleTimeString()}`;
}

// Clock
export function startClock() {
    if (!DOM.clock) return;
    
    setInterval(() => {
        DOM.clock.innerText = new Date().toLocaleTimeString();
    }, 1000);
}

// Copy Link
export function copyLink() {
    const url = DOM.videoUrlDisplay.innerText;
    if (url.length < 5) return;
    
    navigator.clipboard.writeText(url).then(() => {
        showToast('Copied', 'Stream URL copied to clipboard', 'info');
    });
}

// Section Toggle
export function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }
}
