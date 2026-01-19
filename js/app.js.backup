// ============================================
// MediaMTX Web Playlist - Main Application
// ============================================

// --- DOM Elements ---
const settingsForm = document.getElementById('settingsForm');
const hostInput = document.getElementById('hostInput');
const pathInput = document.getElementById('pathInput');
const formatToggle = document.getElementById('formatToggle');
const playlistContainer = document.getElementById('playlistContainer');
const mainPlayer = document.getElementById('mainPlayer');
const playerPlaceholder = document.getElementById('playerPlaceholder');
const videoTitle = document.getElementById('videoTitle');
const videoDuration = document.getElementById('videoDuration');
const videoUrlDisplay = document.getElementById('videoUrlDisplay');
const downloadBtn = document.getElementById('downloadBtn');
const downloadText = document.getElementById('downloadText');
const statusDot = document.getElementById('statusDot');
const filterStart = document.getElementById('filterStart');
const filterEnd = document.getElementById('filterEnd');
const itemCountBadge = document.getElementById('itemCountBadge');
const currentConfigDisplay = document.getElementById('currentConfigDisplay');
const lastUpdatedDisplay = document.getElementById('lastUpdated');
const channelsContainer = document.getElementById('channelsContainer');
const addChannelBtn = document.getElementById('addChannelBtn');
const privacyToggle = document.getElementById('privacyToggle');
const privacyIcon = document.getElementById('privacyIcon');

// Modal Elements
const channelModal = document.getElementById('channelModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const channelForm = document.getElementById('channelForm');
const modalTitle = document.getElementById('modalTitle');
const modalSubtitle = document.getElementById('modalSubtitle');
const modalChannelName = document.getElementById('modalChannelName');
const modalHost = document.getElementById('modalHost');
const modalPath = document.getElementById('modalPath');
const modalFormatToggle = document.getElementById('modalFormatToggle');
const testConnectionBtn = document.getElementById('testConnectionBtn');
const saveChannelBtn = document.getElementById('saveChannelBtn');
const connectionStatus = document.getElementById('connectionStatus');
const connectionStatusText = document.getElementById('connectionStatusText');

// --- State Management ---
let channels = JSON.parse(localStorage.getItem('mmtx_channels')) || [];
let currentChannelId = localStorage.getItem('mmtx_current_channel') || null;
let currentChannel = null;
let editingChannelId = null;
let channelLatencies = {}; // Store latency per channel
let privacyMode = localStorage.getItem('mmtx_privacy_mode') === 'true' || false;

// Legacy migration
if (channels.length === 0) {
    const legacyHost = localStorage.getItem('mmtx_host');
    const legacyPath = localStorage.getItem('mmtx_path');
    const legacyMp4 = localStorage.getItem('mmtx_mp4');
    
    if (legacyHost && legacyPath) {
        const migratedChannel = {
            id: Date.now().toString(),
            name: legacyPath || 'Default Channel',
            host: legacyHost,
            path: legacyPath,
            useMp4: legacyMp4 === 'true'
        };
        channels.push(migratedChannel);
        currentChannelId = migratedChannel.id;
        saveChannels();
    }
}

// Calendar State
let currentCalendarDate = new Date();
let selectedDate = new Date();
let currentStreamUrl = "";
let cachedRecordings = []; // Store last fetched recordings for re-rendering

// --- Channel Management Functions ---
function saveChannels() {
    localStorage.setItem('mmtx_channels', JSON.stringify(channels));
    if (currentChannelId) {
        localStorage.setItem('mmtx_current_channel', currentChannelId);
    }
}

function openChannelModal(channelId = null) {
    editingChannelId = channelId;
    
    if (channelId) {
        // Edit mode
        const channel = channels.find(ch => ch.id === channelId);
        if (!channel) return;
        
        modalTitle.textContent = 'Edit Channel';
        modalSubtitle.textContent = 'Update your MediaMTX stream configuration';
        modalChannelName.value = channel.name;
        modalHost.value = channel.host;
        modalPath.value = channel.path;
        modalFormatToggle.checked = channel.useMp4;
        saveChannelBtn.innerHTML = '<i class="fa-solid fa-check"></i> Update Channel';
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Channel';
        modalSubtitle.textContent = 'Configure your MediaMTX stream';
        modalChannelName.value = '';
        modalHost.value = 'http://localhost:9996';
        modalPath.value = '';
        modalFormatToggle.checked = false;
        saveChannelBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save Channel';
    }
    
    connectionStatus.classList.add('hidden');
    channelModal.classList.remove('hidden');
}

function closeChannelModal() {
    channelModal.classList.add('hidden');
    editingChannelId = null;
}

async function testConnection() {
    const host = modalHost.value.trim();
    const path = modalPath.value.trim();
    
    if (!host || !path) {
        showToast('Validation Error', 'Please fill in all required fields', 'error');
        return;
    }
    
    connectionStatus.classList.remove('hidden');
    connectionStatus.className = 'p-3 rounded-lg border border-blue-500/20 bg-blue-500/10';
    connectionStatusText.innerHTML = '<div class="loader-small inline-block mr-2"></div>Testing connection...';
    testConnectionBtn.disabled = true;
    
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
            connectionStatus.className = 'p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10';
            connectionStatusText.innerHTML = `<i class="fa-solid fa-check text-emerald-400 mr-2"></i>Connection successful! (${latency}ms) - No recordings found for today`;
        } else if (response.ok) {
            const data = await response.json();
            connectionStatus.className = 'p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10';
            connectionStatusText.innerHTML = `<i class="fa-solid fa-check text-emerald-400 mr-2"></i>Connection successful! (${latency}ms) - Found ${data.length} recordings`;
        } else {
            throw new Error('Connection failed');
        }
        
        showToast('Connection Test', `Server responded in ${latency}ms`, 'success');
    } catch (error) {
        console.error(error);
        connectionStatus.className = 'p-3 rounded-lg border border-red-500/20 bg-red-500/10';
        connectionStatusText.innerHTML = '<i class="fa-solid fa-triangle-exclamation text-red-400 mr-2"></i>Connection failed. Check host URL and CORS settings.';
        showToast('Connection Failed', 'Unable to reach MediaMTX server', 'error');
    } finally {
        testConnectionBtn.disabled = false;
    }
}

function saveChannel(e) {
    e.preventDefault();
    
    const name = modalChannelName.value.trim();
    const host = modalHost.value.trim().replace(/\/$/, '');
    const path = modalPath.value.trim();
    const useMp4 = modalFormatToggle.checked;
    
    if (!name || !host || !path) {
        showToast('Validation Error', 'All fields are required', 'error');
        return;
    }
    
    if (editingChannelId) {
        // Update existing channel
        const channel = channels.find(ch => ch.id === editingChannelId);
        if (channel) {
            channel.name = name;
            channel.host = host;
            channel.path = path;
            channel.useMp4 = useMp4;
            showToast('Channel Updated', `${name} has been updated`, 'success');
        }
    } else {
        // Check duplicate name
        if (channels.some(ch => ch.name === name)) {
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
        
        channels.push(newChannel);
        showToast('Channel Added', `${name} has been created`, 'success');
        
        // Auto-select if it's the first channel
        if (channels.length === 1) {
            selectChannel(newChannel.id);
        }
    }
    
    saveChannels();
    renderChannels();
    closeChannelModal();
    
    // If we edited the current channel, refresh recordings
    if (editingChannelId === currentChannelId) {
        updateStatusUI();
        fetchRecordings();
    }
}

function deleteChannel(channelId) {
    const index = channels.findIndex(ch => ch.id === channelId);
    if (index === -1) return;
    
    const channelName = channels[index].name;
    
    if (!confirm(`Delete channel "${channelName}"?\n\nThis action cannot be undone.`)) return;
    
    channels.splice(index, 1);
    
    // If deleted channel was active, select another
    if (currentChannelId === channelId) {
        currentChannelId = channels.length > 0 ? channels[0].id : null;
        currentChannel = channels.length > 0 ? channels[0] : null;
        updateStatusUI();
        if (currentChannel) {
            fetchRecordings();
        }
    }
    
    delete channelLatencies[channelId];
    saveChannels();
    renderChannels();
    
    showToast('Channel Deleted', `${channelName} has been removed`, 'info');
}

function selectChannel(channelId) {
    currentChannelId = channelId;
    currentChannel = channels.find(ch => ch.id === channelId);
    
    if (!currentChannel) return;
    
    saveChannels();
    renderChannels();
    updateStatusUI();
    
    // Measure latency for the selected channel
    measureLatency(channelId).then(() => {
        renderChannels(); // Re-render to show updated latency
    });
    
    // Auto-refresh recordings when switching channels
    fetchRecordings();
}

async function measureLatency(channelId) {
    const channel = channels.find(ch => ch.id === channelId);
    if (!channel) return null;
    
    const startTime = performance.now();
    
    try {
        const now = new Date();
        const url = `${channel.host}/list?path=${encodeURIComponent(channel.path)}&start=${encodeURIComponent(now.toISOString())}&end=${encodeURIComponent(now.toISOString())}`;
        
        await fetch(url);
        const latency = Math.round(performance.now() - startTime);
        channelLatencies[channelId] = latency;
        return latency;
    } catch (error) {
        channelLatencies[channelId] = -1; // Error
        return -1;
    }
}

function getLatencyBadgeClass(latency) {
    if (latency < 0) return 'latency-unknown';
    if (latency < 100) return 'latency-good';
    if (latency < 300) return 'latency-medium';
    return 'latency-bad';
}

function togglePrivacyMode() {
    privacyMode = !privacyMode;
    localStorage.setItem('mmtx_privacy_mode', privacyMode.toString());
    updatePrivacyIcon();
    renderChannels();
    renderRecordings();
    updateStatusUI();
}

function updatePrivacyIcon() {
    if (privacyMode) {
        privacyIcon.className = 'fa-solid fa-eye-slash';
        privacyToggle.classList.add('text-brand-400');
        privacyToggle.title = 'Privacy Mode: ON';
    } else {
        privacyIcon.className = 'fa-solid fa-eye';
        privacyToggle.classList.remove('text-brand-400');
        privacyToggle.title = 'Privacy Mode: OFF';
    }
}

function getBlurClass() {
    return privacyMode ? 'privacy-blur' : '';
}

function renderRecordings() {
    // Re-render the current playlist with updated privacy mode
    if (cachedRecordings.length > 0) {
        renderPlaylist(cachedRecordings);
    }
    
    // Update the currently playing video URL display
    if (videoUrlDisplay && videoUrlDisplay.innerText !== '--') {
        if (privacyMode) {
            videoUrlDisplay.classList.add('privacy-blur');
        } else {
            videoUrlDisplay.classList.remove('privacy-blur');
        }
    }
}

function getLatencyText(latency) {
    if (latency < 0) return 'N/A';
    return `${latency}ms`;
}

function renderChannels() {
    if (!channelsContainer) return;
    
    channelsContainer.innerHTML = '';
    
    if (channels.length === 0) {
        channelsContainer.innerHTML = `
            <div class="text-center py-6 text-gray-500 text-xs">
                <i class="fa-solid fa-tower-broadcast mb-2 text-2xl block"></i>
                <p>No channels yet</p>
                <p class="text-[10px] mt-1">Click "Add New Channel" to get started</p>
            </div>
        `;
        return;
    }
    
    channels.forEach(channel => {
        const isActive = channel.id === currentChannelId;
        const latency = channelLatencies[channel.id] || null;
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
        
        // Edit button
        const editBtn = el.querySelector('.edit-channel-btn');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openChannelModal(channel.id);
        });
        
        // Delete button
        const deleteBtn = el.querySelector('.delete-channel-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteChannel(channel.id);
        });
        
        channelsContainer.appendChild(el);
    });
}

// Measure latency for all channels on page load
async function measureAllLatencies() {
    for (const channel of channels) {
        await measureLatency(channel.id);
    }
    renderChannels(); // Re-render to show latencies
}

// --- Initialization ---
window.addEventListener('DOMContentLoaded', () => {
    // Initialize current channel
    if (currentChannelId) {
        currentChannel = channels.find(ch => ch.id === currentChannelId);
    }
    
    // If no current channel but channels exist, select first
    if (!currentChannel && channels.length > 0) {
        currentChannel = channels[0];
        currentChannelId = currentChannel.id;
    }
    
    // Initialize privacy mode UI
    updatePrivacyIcon();
    
    // Render channels list
    renderChannels();
    
    // Measure latencies
    measureAllLatencies();
    
    // Set Time (Today)
    setToday();
    
    // Init Calendar
    renderCalendar();
    
    // UI Updates
    updateStatusUI();
    startClock();
    
    // Auto-fetch if configured
    if (currentChannel && currentChannel.host && currentChannel.path) {
        fetchRecordings();
    }
});

// --- Privacy Toggle Event Handler ---
if (privacyToggle) {
    privacyToggle.addEventListener('click', togglePrivacyMode);
}

// --- Modal Event Handlers ---
if (addChannelBtn) {
    addChannelBtn.addEventListener('click', () => {
        openChannelModal();
    });
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeChannelModal);
}

if (cancelModalBtn) {
    cancelModalBtn.addEventListener('click', closeChannelModal);
}

if (channelModal) {
    channelModal.addEventListener('click', (e) => {
        if (e.target === channelModal) {
            closeChannelModal();
        }
    });
}

if (testConnectionBtn) {
    testConnectionBtn.addEventListener('click', testConnection);
}

if (channelForm) {
    channelForm.addEventListener('submit', saveChannel);
}

// ESC key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !channelModal.classList.contains('hidden')) {
        closeChannelModal();
    }
});

// --- Legacy Settings Form (kept for compatibility but hidden) ---
if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
    });
}

if (formatToggle) {
    formatToggle.addEventListener('change', (e) => {
        if (!currentChannel) return;
        currentChannel.useMp4 = e.target.checked;
        saveChannels();
    });
}

// --- Calendar Functions ---
function setToday() {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    
    setFilterDates(start, end);
    selectedDate = now;
    renderCalendar();
    if (currentChannel) {
        fetchRecordings();
    }
}

function setFilterDates(start, end) {
    const toLocalIso = (date) => {
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - offset).toISOString().slice(0, 16);
    };
    filterStart.value = toLocalIso(start);
    filterEnd.value = toLocalIso(end);
}

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const monthLabel = document.getElementById('currentMonthYear');
    
    grid.innerHTML = '';
    
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    monthLabel.innerText = new Date(year, month).toLocaleString('default', {
        month: 'long',
        year: 'numeric'
    });
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Empty slots
    for (let i = 0; i < firstDay; i++) {
        const el = document.createElement('div');
        el.className = 'calendar-day empty';
        grid.appendChild(el);
    }
    
    // Days
    for (let day = 1; day <= daysInMonth; day++) {
        const el = document.createElement('div');
        el.className = 'calendar-day';
        el.innerText = day;
        
        // Check if Today
        const today = new Date();
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            el.classList.add('today');
        }
        
        // Check if Selected
        if (day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear()) {
            el.classList.add('active');
        }
        
        el.onclick = () => {
            selectedDate = new Date(year, month, day);
            const start = new Date(selectedDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(selectedDate);
            end.setHours(23, 59, 59, 999);
            setFilterDates(start, end);
            renderCalendar();
            if (currentChannel) {
                fetchRecordings();
            }
        };
        
        grid.appendChild(el);
    }
}

document.getElementById('prevMonth').onclick = () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar();
};

document.getElementById('nextMonth').onclick = () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar();
};

// --- Status UI Update ---
function updateStatusUI() {
    if (currentChannel && currentChannel.host && currentChannel.path) {
        if (statusDot) {
            statusDot.classList.remove('bg-red-500', 'shadow-[0_0_10px_rgba(239,68,68,0.5)]');
            statusDot.classList.add('bg-emerald-500', 'shadow-[0_0_10px_rgba(16,185,129,0.5)]');
        }
        const pathBlur = privacyMode ? 'privacy-blur' : '';
        const hostBlur = privacyMode ? 'privacy-blur' : '';
        currentConfigDisplay.innerHTML = `${currentChannel.name} (<span class="${pathBlur}">${currentChannel.path}</span> @ <span class="${hostBlur}">${new URL(currentChannel.host).hostname}</span>)`;
    } else {
        if (statusDot) {
            statusDot.classList.remove('bg-emerald-500', 'shadow-[0_0_10px_rgba(16,185,129,0.5)]');
            statusDot.classList.add('bg-red-500', 'shadow-[0_0_10px_rgba(239,68,68,0.5)]');
        }
        currentConfigDisplay.innerText = 'No channel selected';
    }
}

function updateLastRefreshedTime() {
    const now = new Date();
    lastUpdatedDisplay.innerText = `Updated: ${now.toLocaleTimeString()}`;
}

// --- Fetch Recordings ---
async function fetchRecordings() {
    if (!currentChannel || !currentChannel.host || !currentChannel.path) {
        playlistContainer.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-gray-500 opacity-60 text-center px-4">
                <i class="fa-solid fa-tower-broadcast text-3xl mb-2"></i>
                <p class="text-sm">No channel selected</p>
                <p class="text-xs mt-1">Add a channel to get started</p>
            </div>
        `;
        return;
    }
    
    playlistContainer.innerHTML = '<div class="h-full flex items-center justify-center"><div class="loader"></div></div>';
    
    try {
        const startDate = new Date(filterStart.value).toISOString();
        const endDate = new Date(filterEnd.value).toISOString();
        
        const url = `${currentChannel.host}/list?path=${encodeURIComponent(currentChannel.path)}&start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`;
        
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
        playlistContainer.innerHTML = `
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

// --- Render Playlist ---
function renderPlaylist(items) {
    cachedRecordings = items; // Cache for re-rendering
    playlistContainer.innerHTML = '';
    
    if (!items || items.length === 0) {
        const selectedDateStr = new Date(filterStart.value).toLocaleDateString();
        playlistContainer.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-gray-500 opacity-60 text-center px-4">
                <i class="fa-regular fa-calendar-xmark text-3xl mb-2"></i>
                <p class="text-sm">Recording not found on selected date<br/><span class="font-mono text-xs">${selectedDateStr}</span></p>
            </div>
        `;
        itemCountBadge.innerText = '0 Clips';
        return;
    }
    
    items.sort((a, b) => new Date(b.start) - new Date(a.start));
    itemCountBadge.innerText = `${items.length} Clips`;
    
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
        
        playlistContainer.appendChild(el);
    });
}

// --- Play Video ---
function playVideo(item) {
    if (!currentChannel) return;
    
    playerPlaceholder.style.display = 'none';
    
    let streamUrl = `${currentChannel.host}/get?path=${encodeURIComponent(currentChannel.path)}&start=${encodeURIComponent(item.start)}&duration=${item.duration}`;
    
    if (currentChannel.useMp4) {
        streamUrl += '&format=mp4';
    }
    
    currentStreamUrl = streamUrl;
    
    const recordingDate = new Date(item.start).toLocaleString();
    videoTitle.innerText = `Recording: ${recordingDate}`;
    videoDuration.innerText = `${parseFloat(item.duration).toFixed(1)}s`;
    
    // Apply blur to the URL display - set class BEFORE setting text
    if (privacyMode) {
        videoUrlDisplay.classList.add('privacy-blur');
    } else {
        videoUrlDisplay.classList.remove('privacy-blur');
    }
    videoUrlDisplay.innerText = streamUrl;
    
    downloadBtn.classList.remove('pointer-events-none', 'opacity-50', 'grayscale');
    
    mainPlayer.src = streamUrl;
    mainPlayer.type = currentChannel.useMp4 ? 'video/mp4' : 'video/mp4';
    mainPlayer.play().catch(console.warn);
    
    if (window.innerWidth < 1024) {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// --- Copy Link ---
function copyLink() {
    const url = videoUrlDisplay.innerText;
    if (url.length < 5) return;
    
    navigator.clipboard.writeText(url).then(() => {
        showToast('Copied', 'Stream URL copied to clipboard', 'info');
    });
}

// --- Download ---
async function triggerDownload() {
    if (!currentStreamUrl) return;
    
    const btn = document.getElementById('downloadBtn');
    const txt = document.getElementById('downloadText');
    const originalText = "Download";
    
    try {
        btn.disabled = true;
        btn.classList.add('opacity-75', 'cursor-not-allowed');
        txt.innerText = "Connecting...";
        
        const response = await fetch(currentStreamUrl);
        if (!response.ok) throw new Error("Download failed");
        
        const contentLength = response.headers.get('Content-Length');
        const total = contentLength ? parseInt(contentLength, 10) : 0;
        let loaded = 0;
        
        const reader = response.body.getReader();
        const chunks = [];
        
        while (true) {
            const {
                done,
                value
            } = await reader.read();
            if (done) break;
            
            chunks.push(value);
            loaded += value.length;
            
            if (total > 0) {
                const progress = Math.round((loaded / total) * 100);
                txt.innerText = `${progress}%`;
            } else {
                const mb = (loaded / (1024 * 1024)).toFixed(1);
                txt.innerText = `${mb} MB`;
            }
        }
        
        txt.innerText = "Saving...";
        const blob = new Blob(chunks);
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        a.download = `recording-${timestamp}.mp4`;
        
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToast('Success', 'Download complete', 'success');
        
    } catch (error) {
        console.error("Download error:", error);
        showToast('Error', 'Failed to download directly. Opening in new tab.', 'error');
        window.open(currentStreamUrl, '_blank');
    } finally {
        txt.innerText = originalText;
        btn.disabled = false;
        btn.classList.remove('opacity-75', 'cursor-not-allowed');
    }
}

// --- Toast Notification ---
function showToast(title, message, type) {
    const toast = document.getElementById('toast');
    document.getElementById('toastTitle').innerText = title;
    document.getElementById('toastMessage').innerText = message;
    
    const icon = document.getElementById('toastIcon');
    toast.className = 'fixed bottom-6 right-6 glass-panel px-5 py-4 rounded-xl shadow-2xl transform translate-y-0 opacity-100 transition-all duration-500 z-50 flex items-center gap-4 border-l-4';
    
    if (type === 'success') {
        toast.classList.add('border-emerald-500');
        icon.className = 'fa-solid fa-check text-emerald-400 text-sm';
    } else if (type === 'error') {
        toast.classList.add('border-red-500');
        icon.className = 'fa-solid fa-triangle-exclamation text-red-400 text-sm';
    } else {
        toast.classList.add('border-brand-500');
        icon.className = 'fa-solid fa-bell text-brand-400 text-sm';
    }
    
    setTimeout(() => {
        toast.classList.add('translate-y-32', 'opacity-0');
    }, 3000);
}

// --- Clock ---
function startClock() {
    setInterval(() => {
        document.getElementById('clock').innerText = new Date().toLocaleTimeString();
    }, 1000);
}

// --- Mobile Navigation ---
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('mobileOverlay');

const toggleMenu = () => {
    const isHidden = sidebar.classList.contains('-translate-x-full');
    if (isHidden) {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden', 'opacity-0');
    } else {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
};

menuBtn.addEventListener('click', toggleMenu);
overlay.addEventListener('click', toggleMenu);

// --- Playlist Panel Toggle (Mobile) ---
const playlistToggleBtn = document.getElementById('playlistToggleBtn');
const playlistPanel = document.getElementById('playlistPanel');
const playlistCloseBtn = document.getElementById('playlistCloseBtn');

function showPlaylist() {
    playlistPanel.classList.remove('translate-y-full');
    playlistPanel.classList.add('translate-y-0');
}

function hidePlaylist() {
    playlistPanel.classList.remove('translate-y-0');
    playlistPanel.classList.add('translate-y-full');
}

playlistToggleBtn.addEventListener('click', showPlaylist);
playlistCloseBtn.addEventListener('click', hidePlaylist);

playlistPanel.addEventListener('click', function (e) {
    if (window.innerWidth < 1024 && e.target === playlistPanel) hidePlaylist();
});

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && window.innerWidth < 1024 && !channelModal.classList.contains('hidden')) {
        // Modal takes precedence
        return;
    }
    if (e.key === 'Escape' && window.innerWidth < 1024) hidePlaylist();
});

playlistContainer.addEventListener('click', function (e) {
    if (window.innerWidth < 1024) {
        let el = e.target;
        while (el && el !== playlistContainer) {
            if (el.classList && (el.classList.contains('glass-card') || el.classList.contains('active-item'))) {
                hidePlaylist();
                break;
            }
            el = el.parentElement;
        }
    }
});

// --- Section Toggle ---
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }
}

// Make functions globally accessible
window.toggleSection = toggleSection;
window.setToday = setToday;
window.fetchRecordings = fetchRecordings;
window.copyLink = copyLink;
window.triggerDownload = triggerDownload;
