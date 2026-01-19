// ============================================
// Recording Service
// ============================================

import DOM from '../config/domElements.js';
import appState from '../state/appState.js';
import { showToast, updateLastRefreshedTime } from '../utils/uiUtils.js';
import { playVideo } from './playerService.js';

// Fetch recordings from MediaMTX server
export async function fetchRecordings() {
    const channel = appState.currentChannel;
    
    if (!channel || !channel.host || !channel.path) {
        DOM.playlistContainer.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-gray-500 opacity-60 text-center px-4">
                <i class="fa-solid fa-tower-broadcast text-3xl mb-2"></i>
                <p class="text-sm">No channel selected</p>
                <p class="text-xs mt-1">Add a channel to get started</p>
            </div>
        `;
        return;
    }
    
    DOM.playlistContainer.innerHTML = '<div class="h-full flex items-center justify-center"><div class="loader"></div></div>';
    
    try {
        const startDate = new Date(DOM.filterStart.value).toISOString();
        const endDate = new Date(DOM.filterEnd.value).toISOString();
        
        const url = `${channel.host}/list?path=${encodeURIComponent(channel.path)}&start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`;
        
        const response = await fetch(url);
        
        if (response.status === 404) {
            renderPlaylist([]);
            updateLastRefreshedTime();
            return;
        }
        
        if (!response.ok) throw new Error('API Error');
        
        const data = await response.json();
        renderPlaylist(data);
        showToast('Sync Complete', `Found ${data ? data.length : 0} recordings`, 'success');
        updateLastRefreshedTime();
        
    } catch (error) {
        console.error(error);
        DOM.playlistContainer.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-red-400 opacity-80 p-4 text-center">
                <i class="fa-solid fa-wifi text-3xl mb-2"></i>
                <p class="text-sm font-medium">Connection Failed</p>
                <p class="text-xs opacity-60 mt-1">Check CORS settings or URL</p>
            </div>
        `;
        showToast('Error', 'Failed to fetch recordings. Check console.', 'error');
        updateLastRefreshedTime();
    }
}

// Render playlist items
export function renderPlaylist(items) {
    appState.setCachedRecordings(items); // Cache for re-rendering
    DOM.playlistContainer.innerHTML = '';
    
    if (!items || items.length === 0) {
        const selectedDateStr = new Date(DOM.filterStart.value).toLocaleDateString();
        DOM.playlistContainer.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-gray-500 opacity-60 text-center px-4">
                <i class="fa-regular fa-calendar-xmark text-3xl mb-2"></i>
                <p class="text-sm">Recording not found on selected date<br/><span class="font-mono text-xs">${selectedDateStr}</span></p>
            </div>
        `;
        DOM.itemCountBadge.innerText = '0 Clips';
        return;
    }
    
    items.sort((a, b) => new Date(b.start) - new Date(a.start));
    DOM.itemCountBadge.innerText = `${items.length} Clips`;
    
    items.forEach((item, index) => {
        const el = document.createElement('div');
        const start = new Date(item.start);
        const duration = parseFloat(item.duration);
        const end = new Date(start.getTime() + (duration * 1000));
        
        const hour = start.getHours();
        const isDay = hour >= 6 && hour < 18;
        const iconClass = isDay ? "fa-sun text-yellow-400" : "fa-moon text-blue-300";
        const bgClass = isDay ? "bg-yellow-500/10" : "bg-blue-500/10";
        
        const startTimeStr = start.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const endTimeStr = end.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const delay = Math.min(index * 0.05, 0.5);
        el.style.animationDelay = `${delay}s`;
        
        el.className = 'glass-card p-3 rounded-xl cursor-pointer opacity-0 animate-fade-in group relative overflow-hidden';
        
        el.innerHTML = `
            <div class="flex items-center gap-3 relative z-10">
                <div class="w-10 h-10 rounded-lg ${bgClass} flex items-center justify-center flex-shrink-0 transition-colors">
                    <i class="fa-solid ${iconClass} text-sm"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-center mb-0.5">
                        <span class="text-xs font-bold text-gray-200 group-hover:text-white truncate">
                            ${startTimeStr} <span class="text-gray-600 px-1">→</span> ${endTimeStr}
                        </span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-[10px] text-gray-500 font-mono">${start.toLocaleDateString()}</span>
                        <span class="text-[10px] font-mono bg-white/5 px-1.5 py-0.5 rounded text-gray-400 border border-white/5">
                            ${duration.toFixed(1)}s
                        </span>
                    </div>
                </div>
            </div>
            <div class="absolute inset-0 bg-gradient-to-r from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        `;
        
        el.onclick = () => {
            document.querySelectorAll('.active-item').forEach(e => {
                e.classList.remove('active-item');
                e.classList.add('glass-card');
            });
            
            el.classList.remove('glass-card');
            el.classList.add('active-item');
            
            playVideo(item);
        };
        
        DOM.playlistContainer.appendChild(el);
    });
}

// Re-render recordings with updated privacy mode
export function renderRecordings() {
    if (appState.cachedRecordings.length > 0) {
        renderPlaylist(appState.cachedRecordings);
    }
    
    // Update the currently playing video URL display
    if (DOM.videoUrlDisplay && DOM.videoUrlDisplay.innerText !== '--') {
        if (appState.privacyMode) {
            DOM.videoUrlDisplay.classList.add('privacy-blur');
        } else {
            DOM.videoUrlDisplay.classList.remove('privacy-blur');
        }
    }
}
