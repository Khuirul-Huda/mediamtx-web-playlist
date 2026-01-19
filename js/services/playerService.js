// ============================================
// Player Service
// ============================================

import DOM from '../config/domElements.js';
import appState from '../state/appState.js';
import { showToast } from '../utils/uiUtils.js';

// Play a video recording
export function playVideo(item) {
    const channel = appState.currentChannel;
    if (!channel) return;
    
    DOM.playerPlaceholder.style.display = 'none';
    
    let streamUrl = `${channel.host}/get?path=${encodeURIComponent(channel.path)}&start=${encodeURIComponent(item.start)}&duration=${item.duration}`;
    
    if (channel.useMp4) {
        streamUrl += '&format=mp4';
    }
    
    appState.setCurrentStreamUrl(streamUrl);
    
    const recordingDate = new Date(item.start).toLocaleString();
    DOM.videoTitle.innerText = `Recording: ${recordingDate}`;
    DOM.videoDuration.innerText = `${parseFloat(item.duration).toFixed(1)}s`;
    
    // Apply blur to the URL display - set class BEFORE setting text
    if (appState.privacyMode) {
        DOM.videoUrlDisplay.classList.add('privacy-blur');
    } else {
        DOM.videoUrlDisplay.classList.remove('privacy-blur');
    }
    DOM.videoUrlDisplay.innerText = streamUrl;
    
    DOM.downloadBtn.classList.remove('pointer-events-none', 'opacity-50', 'grayscale');
    
    DOM.mainPlayer.src = streamUrl;
    DOM.mainPlayer.type = channel.useMp4 ? 'video/mp4' : 'video/mp4';
    DOM.mainPlayer.play().catch(console.warn);
    
    if (window.innerWidth < 1024) {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// Download current video
export async function triggerDownload() {
    const currentStreamUrl = appState.currentStreamUrl;
    if (!currentStreamUrl) return;
    
    const btn = DOM.downloadBtn;
    const txt = DOM.downloadText;
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
            const { done, value } = await reader.read();
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
