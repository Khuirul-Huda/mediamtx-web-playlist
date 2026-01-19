// ============================================
// Channel Service
// ============================================

import DOM from '../config/domElements.js';
import appState from '../state/appState.js';
import { showToast, getBlurClass, getLatencyBadgeClass, getLatencyText, updateStatusUI } from '../utils/uiUtils.js';

// Measure latency for a channel
export async function measureLatency(channelId) {
    const channel = appState.channels.find(ch => ch.id === channelId);
    if (!channel) return null;
    
    const startTime = performance.now();
    
    try {
        const now = new Date();
        const url = `${channel.host}/list?path=${encodeURIComponent(channel.path)}&start=${encodeURIComponent(now.toISOString())}&end=${encodeURIComponent(now.toISOString())}`;
        
        await fetch(url);
        const latency = Math.round(performance.now() - startTime);
        appState.setChannelLatency(channelId, latency);
        return latency;
    } catch (error) {
        appState.setChannelLatency(channelId, -1); // Error
        return -1;
    }
}

// Measure latency for all channels
export async function measureAllLatencies() {
    for (const channel of appState.channels) {
        await measureLatency(channel.id);
    }
    renderChannels(); // Re-render to show latencies
}

// Select a channel
export async function selectChannel(channelId) {
    appState.setCurrentChannel(channelId);
    
    if (!appState.currentChannel) return;
    
    renderChannels();
    updateStatusUI();
    
    // Measure latency for the selected channel
    await measureLatency(channelId);
    renderChannels(); // Re-render to show updated latency
    
    // Import fetchRecordings dynamically to avoid circular dependency
    const { fetchRecordings } = await import('./recordingService.js');
    fetchRecordings();
}

// Delete a channel
export async function deleteChannel(channelId) {
    const index = appState.channels.findIndex(ch => ch.id === channelId);
    if (index === -1) return;
    
    const channelName = appState.channels[index].name;
    
    if (!confirm(`Delete channel "${channelName}"?\n\nThis action cannot be undone.`)) return;
    
    appState.deleteChannel(channelId);
    
    updateStatusUI();
    
    if (appState.currentChannel) {
        const { fetchRecordings } = await import('./recordingService.js');
        fetchRecordings();
    }
    
    renderChannels();
    showToast('Channel Deleted', `${channelName} has been removed`, 'info');
}

// Render channels list
export function renderChannels() {
    if (!DOM.channelsContainer) return;
    
    DOM.channelsContainer.innerHTML = '';
    
    if (appState.channels.length === 0) {
        DOM.channelsContainer.innerHTML = `
            <div class="text-center py-6 text-gray-500 text-xs">
                <i class="fa-solid fa-tower-broadcast mb-2 text-2xl block"></i>
                <p>No channels yet</p>
                <p class="text-[10px] mt-1">Click "Add New Channel" to get started</p>
            </div>
        `;
        return;
    }
    
    appState.channels.forEach(channel => {
        const isActive = channel.id === appState.currentChannelId;
        const latency = appState.getChannelLatency(channel.id);
        const latencyClass = latency !== null ? getLatencyBadgeClass(latency) : 'latency-unknown';
        const latencyText = latency !== null ? getLatencyText(latency) : '...';
        
        const el = document.createElement('div');
        el.className = `channel-item p-3 rounded-lg mb-2 ${isActive ? 'active' : ''}`;
        
        el.innerHTML = `
            <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0 cursor-pointer" data-channel-id="${channel.id}">
                    <div class="flex items-center gap-2 mb-1">
                        <i class="fa-solid fa-tower-broadcast text-xs ${isActive ? 'text-brand-400' : 'text-gray-500'}"></i>
                        <span class="text-sm font-medium ${isActive ? 'text-white' : 'text-gray-300'} truncate">
                            ${channel.name}
                        </span>
                        <span class="latency-badge ${latencyClass}">
                            ${latencyText}
                        </span>
                    </div>
                    <div class="text-[10px] text-gray-500 font-mono truncate pl-5">
                        <span class="${getBlurClass()}">${channel.path}</span> @ <span class="${getBlurClass()}">${new URL(channel.host).hostname}</span>
                    </div>
                </div>
                <div class="flex gap-1 flex-shrink-0">
                    <button class="edit-channel-btn p-1.5 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors" data-channel-id="${channel.id}" title="Edit channel">
                        <i class="fa-solid fa-pen text-xs"></i>
                    </button>
                    <button class="delete-channel-btn p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors" data-channel-id="${channel.id}" title="Delete channel">
                        <i class="fa-solid fa-trash text-xs"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Click to select channel
        const selectArea = el.querySelector('[data-channel-id]');
        selectArea.addEventListener('click', () => {
            if (!isActive) selectChannel(channel.id);
        });
        
        // Edit button - import modal function dynamically
        const editBtn = el.querySelector('.edit-channel-btn');
        editBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const { openChannelModal } = await import('../components/channelModal.js');
            openChannelModal(channel.id);
        });
        
        // Delete button
        const deleteBtn = el.querySelector('.delete-channel-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteChannel(channel.id);
        });
        
        DOM.channelsContainer.appendChild(el);
    });
}
