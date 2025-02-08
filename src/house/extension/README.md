# HouseSigma Request Logger

A browser extension that intercepts and logs POST requests to HouseSigma.com when viewing property listings.

## Installation

### Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this directory

### Firefox

1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox" on the left sidebar
3. Click "Load Temporary Add-on" and select the `manifest.json` file from this directory

## Usage

The extension will automatically intercept POST requests that match these criteria:

- The URL contains `housesigma.com`
- The path contains `/home/`
- The URL has a query parameter `id_listing`

To view intercepted requests:

1. Open the browser's Developer Tools (F12)
2. Go to the Console tab
3. Type `getStoredRequests()` to see all intercepted requests
4. Type `clearStoredRequests()` to clear the stored requests

All intercepted requests are stored in memory and include:

- Timestamp
- URL
- HTTP method
- Request body

Note: The stored requests will be cleared when you close the browser or reload the extension.
