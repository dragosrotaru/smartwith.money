const responses = []

// Add message listener in content script
window.addEventListener('message', function (event) {
  if (event.data.type === 'INTERCEPTED_FETCH') {
    console.log('Received message from content script:', event.data.response.url)
    responses.push(event.data.response)
  }
})

// Expose functions to global scope
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Return true to indicate we'll respond asynchronously
  if (request.action === 'getStoredResponses') {
    sendResponse(responses)
    return true // Keep the message channel open
  } else if (request.action === 'clearStoredResponses') {
    responses = [] // Note: You might want to use let instead of const for responses at the top
    sendResponse('Cleared all stored responses')
    return true // Keep the message channel open
  }
})

function injectCode(code) {
  const script = document.createElement('script')
  script.textContent = code
  document.documentElement.appendChild(script)
  script.remove()
}

injectCode(`
console.log('Adding interceptor for XMLHttpRequest')
const originalOpen = XMLHttpRequest.prototype.open
const originalSend = XMLHttpRequest.prototype.send

XMLHttpRequest.prototype.open = function (method, url, async, user, pass) {
  this._requestData = { method, url }
  return originalOpen.apply(this, arguments)
}

XMLHttpRequest.prototype.send = function (body) {
  this.addEventListener('load', function () {
    try {
      const contentType = this.getResponseHeader('content-type')
      if (contentType && contentType.includes('application/json')) {
        const response = {
          url: this._requestData.url,
          status: this.status,
          method: this._requestData.method,
          timestamp: new Date().toISOString(),
          data: JSON.parse(this.responseText),
        }
        window.postMessage({ type: 'INTERCEPTED_FETCH', response }, '*')
      }
    } catch (e) {
      console.error('[XHR Interceptor] Error processing response:', e)
    }
  })

  return originalSend.apply(this, arguments)
}

const smoothScroll = () => {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: 'smooth'
  });
  
  setTimeout(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, 1000);
};

setTimeout(smoothScroll, 1000);
`)
