# MediaMTX Web Playlist

A modern web UI for browsing and playing recorded clips from a MediaMTX (rtsp/rtmp/hls) server with multi-channel support.

This repository provides a clean, organized web application with separated HTML, CSS, and JavaScript files following web development best practices.

## Features

- 🎥 **Multi-Channel Support**: Manage multiple MediaMTX streams from a single interface
- 💾 **LocalStorage Persistence**: All channels and settings are saved locally
- 📅 **Calendar-based Navigation**: Intuitive date selection with visual calendar
- 🎨 **Modern Glassmorphism UI**: Beautiful animated background with glass effects
- 📱 **Fully Responsive**: Works seamlessly on desktop, tablet, and mobile
- ⬇️ **Direct Downloads**: Download recordings with progress indication
- 🔄 **Auto-refresh**: Real-time updates with manual refresh option

## Project Structure

```
mediamtx-web-playlist/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styling and animations
├── js/
│   └── app.js          # Application logic and channel management
├── server.js           # Optional Bun server for local development
└── README.md
```

## Quick Start

### Option 1: Using Bun 
```bash
bun run server.js
```

### Option 2: Using Python
```bash
python3 -m http.server 8000
```

### Option 3: Using Node.js
```bash
npx http-server -p 8000
```

Then open http://localhost:8000 in your browser.

## Multi-Channel Usage

### Adding a Channel
1. In the sidebar, find the "Channels" section
2. Enter a name for your channel (e.g., "Front Door Cam")
3. Click "Add" button
4. Configure the newly created channel with host and stream name

### Managing Channels
- **Switch Channel**: Click on any channel in the list to switch to it
- **Delete Channel**: Click the trash icon next to a channel to remove it
- **Active Channel**: The currently active channel is highlighted with a blue accent

### Channel Configuration
For each channel, configure:
- **Server Host**: Base URL of your MediaMTX API (e.g., `http://localhost:9996`)
- **Stream Name**: Stream path/name (e.g., `cam1`, `frontdoor`, etc.)
- **Force MP4**: Toggle MP4 format for compatibility

All settings are automatically saved to localStorage.

## How to use
- Date selection: use the calendar or the manual `Start` / `End` datetime inputs. Click `Apply Filter` to fetch recordings for the selected range.
- Reset to Today: clicking "Reset to Today" sets the range to the current day and refreshes the recordings list.
- Playlist: click an item to play it in the embedded video player. Use `Copy URL` to copy the direct stream URL or `Download` to attempt a direct download.

## API endpoints used by the UI
This UI expects the following endpoints on the configured host:

- `GET /list?path=<path>&start=<ISO>&end=<ISO>`
  - Returns a JSON array of recordings. Each item should include `start` (ISO timestamp) and `duration` (seconds). Example:
    ```json
    [ { "start": "2024-01-01T12:00:00Z", "duration": "12.3" } ]
    ```
  - A `404` response is treated as "no recordings".

- `GET /get?path=<path>&start=<ISO>&duration=<seconds>&format=mp4` (optional format)
  - Returns the raw media stream (mp4 or chunked). The UI uses this URL to play or download.

If your MediaMTX instance uses different endpoints, adapt the host or provide a small proxy that matches the expected routes.

> NOTE: This UI's playback/list endpoints follow the MediaMTX playback documentation at https://mediamtx.org/docs/usage/playback. If that upstream documentation or the endpoints change, please open an issue in this repository so the UI can be updated accordingly.

## Troubleshooting
- Empty list / Connection failed: check the Host URL, Stream Name, and browser console for CORS errors.
- If recordings are not found, verify your MediaMTX server's `/list` response and time ranges.
- The `Download` feature streams the resource via the browser; large downloads may fail depending on server headers or chunking.

## Important notes

- This project is a full client-side application (everything runs in the browser). However, it still requires internet access to load third-party libraries and fonts used by the single-file bundle (Tailwind CDN, Font Awesome, Google Fonts). If you need fully offline operation, extract the assets and host them locally or build a self-contained release.

- PROTOCOL MATCHING IS CRITICAL: the web page and the MediaMTX endpoints must use the same protocol (both HTTPS or both HTTP). Modern browsers block mixed content — a page served over HTTPS will NOT fetch resources from an HTTP API. If you serve this UI via HTTPS, make sure your `Server Host` uses `https://` so the browser can contact the MediaMTX endpoints successfully.

- DATA PERSISTENCE: this app stores user configuration (Server Host, Stream Name, Force MP4) in the browser's `localStorage`. These values persist on the user's machine and are not transmitted to any third-party by the app itself. Clear your browser storage to reset saved settings.

- REQUESTS & PROCESSING: all network requests (the `/list` and `/get` calls) are performed directly by the browser (via `fetch`). All UI logic and processing run client-side in the browser—there is no server-side component in this project. Because of this, CORS, browser security, and protocol mismatches (HTTP vs HTTPS) directly affect functionality.

## Notice
This  not affiliated with the official MediaMTX project.

## Contributing
Feel free to open issues or PRs on the repository: https://github.com/Khuirul-Huda/mediamtx-web-playlist

## License
See repository for license information.

## Screenshots
![Screenshot 1](./.github/image.png)

## TODO
- Add multi instance support and default instance selection
- Desktop application ?

## Known Issues
- Playback not seekable due to server limitations. See: [https://github.com/bluenviron/mediamtx/issues/4199](https://github.com/bluenviron/mediamtx/issues/4199)