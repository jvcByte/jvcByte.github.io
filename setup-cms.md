# CMS Setup Instructions

## Problem
The CMS was prompting file downloads instead of saving directly to the JSON files because it's a client-side only application without server-side file writing capabilities.

## Solution
I've created a simple Node.js backend server that allows the CMS to save files directly to the `data/` folder.

## Setup Instructions

### Option 1: Use the Backend Server (Recommended)

1. **Install Node.js** (if not already installed):
   - Download from https://nodejs.org/
   - Or use your package manager: `sudo apt install nodejs npm`

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

4. **Access the CMS**:
   - Open http://localhost:3001/cms.html
   - Make your changes
   - Click "Save All Changes" - files will be saved directly to the `data/` folder
   - Commit and push your changes to GitHub

### Option 2: Manual File Replacement (Current Workaround)

If you can't run the server:

1. Open `cms.html` directly in your browser
2. Make your changes
3. Click "Save All Changes" - this will download JSON files
4. Manually replace the downloaded files in the `data/` folder
5. Commit and push changes to GitHub

## How It Works

### With Server (Option 1):
1. CMS tries to save to `/api/save-all-data` endpoint
2. Server writes files directly to `data/` folder
3. Success message shows "Data saved successfully to server!"

### Without Server (Option 2):
1. CMS detects server is unavailable
2. Falls back to downloading JSON files
3. Shows message "Server not available. Downloading files..."

## Files Created:
- `server.js` - Express server for handling file saves
- `package.json` - Node.js dependencies
- Updated `js/cms.js` - Now tries server first, falls back to download

## Benefits of Server Approach:
- ✅ Direct file saving to `data/` folder
- ✅ No manual file replacement needed
- ✅ Faster workflow
- ✅ Automatic fallback to download if server unavailable