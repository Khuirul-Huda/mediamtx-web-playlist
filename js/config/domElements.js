// ============================================
// DOM Elements Configuration
// ============================================

const DOM = {
    // Settings Form Elements
    settingsForm: document.getElementById('settingsForm'),
    hostInput: document.getElementById('hostInput'),
    pathInput: document.getElementById('pathInput'),
    formatToggle: document.getElementById('formatToggle'),
    
    // Playlist Elements
    playlistContainer: document.getElementById('playlistContainer'),
    itemCountBadge: document.getElementById('itemCountBadge'),
    
    // Player Elements
    mainPlayer: document.getElementById('mainPlayer'),
    playerPlaceholder: document.getElementById('playerPlaceholder'),
    videoTitle: document.getElementById('videoTitle'),
    videoDuration: document.getElementById('videoDuration'),
    videoUrlDisplay: document.getElementById('videoUrlDisplay'),
    downloadBtn: document.getElementById('downloadBtn'),
    downloadText: document.getElementById('downloadText'),
    
    // Status Elements
    statusDot: document.getElementById('statusDot'),
    currentConfigDisplay: document.getElementById('currentConfigDisplay'),
    lastUpdatedDisplay: document.getElementById('lastUpdated'),
    
    // Filter Elements
    filterStart: document.getElementById('filterStart'),
    filterEnd: document.getElementById('filterEnd'),
    
    // Channel Elements
    channelsContainer: document.getElementById('channelsContainer'),
    addChannelBtn: document.getElementById('addChannelBtn'),
    privacyToggle: document.getElementById('privacyToggle'),
    privacyIcon: document.getElementById('privacyIcon'),
    
    // Modal Elements
    channelModal: document.getElementById('channelModal'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    cancelModalBtn: document.getElementById('cancelModalBtn'),
    channelForm: document.getElementById('channelForm'),
    modalTitle: document.getElementById('modalTitle'),
    modalSubtitle: document.getElementById('modalSubtitle'),
    modalChannelName: document.getElementById('modalChannelName'),
    modalHost: document.getElementById('modalHost'),
    modalPath: document.getElementById('modalPath'),
    modalFormatToggle: document.getElementById('modalFormatToggle'),
    testConnectionBtn: document.getElementById('testConnectionBtn'),
    saveChannelBtn: document.getElementById('saveChannelBtn'),
    connectionStatus: document.getElementById('connectionStatus'),
    connectionStatusText: document.getElementById('connectionStatusText'),
    
    // Calendar Elements
    calendarGrid: document.getElementById('calendarGrid'),
    currentMonthYear: document.getElementById('currentMonthYear'),
    prevMonth: document.getElementById('prevMonth'),
    nextMonth: document.getElementById('nextMonth'),
    
    // Toast Elements
    toast: document.getElementById('toast'),
    toastTitle: document.getElementById('toastTitle'),
    toastMessage: document.getElementById('toastMessage'),
    toastIcon: document.getElementById('toastIcon'),
    
    // Clock Element
    clock: document.getElementById('clock'),
    
    // Mobile Navigation Elements
    menuBtn: document.getElementById('menuBtn'),
    sidebar: document.getElementById('sidebar'),
    overlay: document.getElementById('mobileOverlay'),
    
    // Playlist Panel (Mobile)
    playlistToggleBtn: document.getElementById('playlistToggleBtn'),
    playlistPanel: document.getElementById('playlistPanel'),
    playlistCloseBtn: document.getElementById('playlistCloseBtn')
};

export default DOM;
