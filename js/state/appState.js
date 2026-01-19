// ============================================
// State Management
// ============================================

class AppState {
    constructor() {
        // Channel State
        this.channels = JSON.parse(localStorage.getItem('mmtx_channels')) || [];
        this.currentChannelId = localStorage.getItem('mmtx_current_channel') || null;
        this.currentChannel = null;
        this.editingChannelId = null;
        this.channelLatencies = {}; // Store latency per channel
        
        // Privacy Mode
        this.privacyMode = localStorage.getItem('mmtx_privacy_mode') === 'true' || false;
        
        // Calendar State
        this.currentCalendarDate = new Date();
        this.selectedDate = new Date();
        
        // Recording State
        this.currentStreamUrl = "";
        this.cachedRecordings = []; // Store last fetched recordings for re-rendering
        
        // Perform legacy migration if needed
        this.performLegacyMigration();
        
        // Initialize current channel
        this.initializeCurrentChannel();
    }
    
    performLegacyMigration() {
        if (this.channels.length === 0) {
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
                this.channels.push(migratedChannel);
                this.currentChannelId = migratedChannel.id;
                this.saveChannels();
            }
        }
    }
    
    initializeCurrentChannel() {
        if (this.currentChannelId) {
            this.currentChannel = this.channels.find(ch => ch.id === this.currentChannelId);
        }
        
        // If no current channel but channels exist, select first
        if (!this.currentChannel && this.channels.length > 0) {
            this.currentChannel = this.channels[0];
            this.currentChannelId = this.currentChannel.id;
        }
    }
    
    saveChannels() {
        localStorage.setItem('mmtx_channels', JSON.stringify(this.channels));
        if (this.currentChannelId) {
            localStorage.setItem('mmtx_current_channel', this.currentChannelId);
        }
    }
    
    savePrivacyMode() {
        localStorage.setItem('mmtx_privacy_mode', this.privacyMode.toString());
    }
    
    setCurrentChannel(channelId) {
        this.currentChannelId = channelId;
        this.currentChannel = this.channels.find(ch => ch.id === channelId);
        this.saveChannels();
    }
    
    addChannel(channel) {
        this.channels.push(channel);
        this.saveChannels();
    }
    
    updateChannel(channelId, updates) {
        const channel = this.channels.find(ch => ch.id === channelId);
        if (channel) {
            Object.assign(channel, updates);
            this.saveChannels();
        }
    }
    
    deleteChannel(channelId) {
        const index = this.channels.findIndex(ch => ch.id === channelId);
        if (index !== -1) {
            this.channels.splice(index, 1);
            
            // If deleted channel was active, select another
            if (this.currentChannelId === channelId) {
                this.currentChannelId = this.channels.length > 0 ? this.channels[0].id : null;
                this.currentChannel = this.channels.length > 0 ? this.channels[0] : null;
            }
            
            delete this.channelLatencies[channelId];
            this.saveChannels();
        }
    }
    
    setChannelLatency(channelId, latency) {
        this.channelLatencies[channelId] = latency;
    }
    
    getChannelLatency(channelId) {
        return this.channelLatencies[channelId] || null;
    }
    
    togglePrivacyMode() {
        this.privacyMode = !this.privacyMode;
        this.savePrivacyMode();
    }
    
    setCurrentStreamUrl(url) {
        this.currentStreamUrl = url;
    }
    
    setCachedRecordings(recordings) {
        this.cachedRecordings = recordings;
    }
}

// Create singleton instance
const appState = new AppState();

export default appState;
