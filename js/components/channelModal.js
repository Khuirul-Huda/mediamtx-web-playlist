// ============================================
// Channel Modal Component
// ============================================

import DOM from '../config/domElements.js';
import appState from '../state/appState.js';
import { showToast, updateStatusUI } from '../utils/uiUtils.js';
import { renderChannels } from '../services/channelService.js';
import { fetchRecordings } from '../services/recordingService.js';

// Open channel modal
export function openChannelModal(channelId = null) {
    appState.editingChannelId = channelId;
    
    if (channelId) {
        // Edit mode
        const channel = appState.channels.find(ch => ch.id === channelId);
        if (!channel) return;
        
        DOM.modalTitle.textContent = 'Edit Channel';
        DOM.modalSubtitle.textContent = 'Update your MediaMTX stream configuration';
        DOM.modalChannelName.value = channel.name;
        DOM.modalHost.value = channel.host;
        DOM.modalPath.value = channel.path;
        DOM.modalFormatToggle.checked = channel.useMp4;
        DOM.saveChannelBtn.innerHTML = '<i class="fa-solid fa-check"></i> Update Channel';
    } else {
        // Add mode
        DOM.modalTitle.textContent = 'Add New Channel';
        DOM.modalSubtitle.textContent = 'Configure your MediaMTX stream';
        DOM.modalChannelName.value = '';
        DOM.modalHost.value = 'http://localhost:9996';
        DOM.modalPath.value = '';
        DOM.modalFormatToggle.checked = false;
        DOM.saveChannelBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save Channel';
    }
    
    DOM.connectionStatus.classList.add('hidden');
    DOM.channelModal.classList.remove('hidden');
}

// Close channel modal
export function closeChannelModal() {
    DOM.channelModal.classList.add('hidden');
    appState.editingChannelId = null;
}

// Test connection to MediaMTX server
export async function testConnection() {
    const host = DOM.modalHost.value.trim();
    const path = DOM.modalPath.value.trim();
    
    if (!host || !path) {
        showToast('Validation Error', 'Please fill in all required fields', 'error');
        return;
    }
    
    DOM.connectionStatus.classList.remove('hidden');
    DOM.connectionStatus.className = 'p-3 rounded-lg border border-blue-500/20 bg-blue-500/10';
    DOM.connectionStatusText.innerHTML = '<div class="loader-small inline-block mr-2"></div>Testing connection...';
    DOM.testConnectionBtn.disabled = true;
    
    const startTime = performance.now();
    
    try {
        const now = new Date();
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        const end = new Date(now);
        end.setHours(23, 59, 59, 999);
        
        const cleanHost = host.endsWith('/') ? host.slice(0, -1) : host;
        const url = `${cleanHost}/list?path=${encodeURIComponent(path)}&start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`;
        
        const response = await fetch(url);
        const latency = Math.round(performance.now() - startTime);
        
        if (response.status === 404) {
            // 404 is acceptable (no recordings)
            DOM.connectionStatus.className = 'p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10';
            DOM.connectionStatusText.innerHTML = `<i class="fa-solid fa-check text-emerald-400 mr-2"></i>Connection successful! (${latency}ms) - No recordings found for today`;
        } else if (response.ok) {
            const data = await response.json();
            DOM.connectionStatus.className = 'p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10';
            DOM.connectionStatusText.innerHTML = `<i class="fa-solid fa-check text-emerald-400 mr-2"></i>Connection successful! (${latency}ms) - Found ${data.length} recordings`;
        } else {
            throw new Error('Connection failed');
        }
        
        showToast('Connection Test', `Server responded in ${latency}ms`, 'success');
    } catch (error) {
        console.error(error);
        DOM.connectionStatus.className = 'p-3 rounded-lg border border-red-500/20 bg-red-500/10';
        DOM.connectionStatusText.innerHTML = '<i class="fa-solid fa-triangle-exclamation text-red-400 mr-2"></i>Connection failed. Check host URL and CORS settings.';
        showToast('Connection Failed', 'Unable to reach MediaMTX server', 'error');
    } finally {
        DOM.testConnectionBtn.disabled = false;
    }
}

// Save channel (add or update)
export function saveChannel(e) {
    e.preventDefault();
    
    const name = DOM.modalChannelName.value.trim();
    const host = DOM.modalHost.value.trim().replace(/\/$/, '');
    const path = DOM.modalPath.value.trim();
    const useMp4 = DOM.modalFormatToggle.checked;
    
    if (!name || !host || !path) {
        showToast('Validation Error', 'All fields are required', 'error');
        return;
    }
    
    if (appState.editingChannelId) {
        // Update existing channel
        appState.updateChannel(appState.editingChannelId, {
            name: name,
            host: host,
            path: path,
            useMp4: useMp4
        });
        showToast('Channel Updated', `${name} has been updated`, 'success');
    } else {
        // Check duplicate name
        if (appState.channels.some(ch => ch.name === name)) {
            showToast('Duplicate Name', 'A channel with this name already exists', 'error');
            return;
        }
        
        // Create new channel
        const newChannel = {
            id: Date.now().toString(),
            name: name,
            host: host,
            path: path,
            useMp4: useMp4
        };
        
        appState.addChannel(newChannel);
        showToast('Channel Added', `${name} has been created`, 'success');
        
        // Auto-select if it's the first channel
        if (appState.channels.length === 1) {
            // Import selectChannel dynamically to avoid circular dependency
            import('../services/channelService.js').then(({ selectChannel }) => {
                selectChannel(newChannel.id);
            });
        }
    }
    
    renderChannels();
    closeChannelModal();
    
    // If we edited the current channel, refresh recordings
    if (appState.editingChannelId === appState.currentChannelId) {
        updateStatusUI();
        fetchRecordings();
    }
}

// Initialize modal event listeners
export function initChannelModal() {
    if (DOM.addChannelBtn) {
        DOM.addChannelBtn.addEventListener('click', () => {
            openChannelModal();
        });
    }
    
    if (DOM.closeModalBtn) {
        DOM.closeModalBtn.addEventListener('click', closeChannelModal);
    }
    
    if (DOM.cancelModalBtn) {
        DOM.cancelModalBtn.addEventListener('click', closeChannelModal);
    }
    
    if (DOM.channelModal) {
        DOM.channelModal.addEventListener('click', (e) => {
            if (e.target === DOM.channelModal) {
                closeChannelModal();
            }
        });
    }
    
    if (DOM.testConnectionBtn) {
        DOM.testConnectionBtn.addEventListener('click', testConnection);
    }
    
    if (DOM.channelForm) {
        DOM.channelForm.addEventListener('submit', saveChannel);
    }
    
    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !DOM.channelModal.classList.contains('hidden')) {
            closeChannelModal();
        }
    });
}
