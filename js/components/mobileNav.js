// ============================================
// Mobile Navigation Component
// ============================================

import DOM from '../config/domElements.js';

// Toggle mobile menu
function toggleMenu() {
    const isHidden = DOM.sidebar.classList.contains('-translate-x-full');
    if (isHidden) {
        DOM.sidebar.classList.remove('-translate-x-full');
        DOM.overlay.classList.remove('hidden', 'opacity-0');
    } else {
        DOM.sidebar.classList.add('-translate-x-full');
        DOM.overlay.classList.add('opacity-0');
        setTimeout(() => DOM.overlay.classList.add('hidden'), 300);
    }
}

// Show playlist panel (mobile)
export function showPlaylist() {
    DOM.playlistPanel.classList.remove('translate-y-full');
    DOM.playlistPanel.classList.add('translate-y-0');
}

// Hide playlist panel (mobile)
export function hidePlaylist() {
    DOM.playlistPanel.classList.remove('translate-y-0');
    DOM.playlistPanel.classList.add('translate-y-full');
}

// Initialize mobile navigation
export function initMobileNav() {
    if (DOM.menuBtn) {
        DOM.menuBtn.addEventListener('click', toggleMenu);
    }
    
    if (DOM.overlay) {
        DOM.overlay.addEventListener('click', toggleMenu);
    }
    
    if (DOM.playlistToggleBtn) {
        DOM.playlistToggleBtn.addEventListener('click', showPlaylist);
    }
    
    if (DOM.playlistCloseBtn) {
        DOM.playlistCloseBtn.addEventListener('click', hidePlaylist);
    }
    
    if (DOM.playlistPanel) {
        DOM.playlistPanel.addEventListener('click', function (e) {
            if (window.innerWidth < 1024 && e.target === DOM.playlistPanel) {
                hidePlaylist();
            }
        });
    }
    
    // ESC key to hide playlist (if modal is not open)
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && window.innerWidth < 1024 && 
            DOM.channelModal && DOM.channelModal.classList.contains('hidden')) {
            hidePlaylist();
        }
    });
    
    // Auto-hide playlist when clicking on a playlist item (mobile)
    if (DOM.playlistContainer) {
        DOM.playlistContainer.addEventListener('click', function (e) {
            if (window.innerWidth < 1024) {
                let el = e.target;
                while (el && el !== DOM.playlistContainer) {
                    if (el.classList && (el.classList.contains('glass-card') || el.classList.contains('active-item'))) {
                        hidePlaylist();
                        break;
                    }
                    el = el.parentElement;
                }
            }
        });
    }
}
