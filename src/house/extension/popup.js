async function sendMessageToContentScript(message) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) throw new Error('No active tab found')

    const response = await chrome.tabs.sendMessage(tab.id, message)
    return response
  } catch (error) {
    console.error('Error sending message to content script:', error)
    throw error
  }
}

document.getElementById('saveHouse').addEventListener('click', async () => {
  const response = await sendMessageToContentScript({ action: 'getStoredResponses' })
  const responsesDiv = document.getElementById('responses')

  if (response && response.length > 0) {
    // convert array to object with url as key
    const responseObject = response.reduce((acc, res) => {
      acc[res.url] = res
      return acc
    }, {})

    // Create the file content
    const fileContent = JSON.stringify(responseObject, null, 2)
    const blob = new Blob([fileContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const listingDetail = response.filter((res) => res.url.includes('listing/info/detail_v2'))[0]
    if (!listingDetail) {
      console.error('No listing detail found in responses')
      alert('No listing detail found in responses')
      return
    }

    const listingId = listingDetail.data.data.house.id_listing
    const listingUrl = listingDetail.data.data.meta.canonical_url
    const listingTitle = listingDetail.data.data.meta.title
    const listingAddress = listingDetail.data.data.house.address
    const timestamp = new Date().toISOString().split('T')[0]

    // Create a temporary link element and trigger the download
    const downloadLink = document.createElement('a')
    downloadLink.href = url
    downloadLink.download = `${listingId}_housesigma.json`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)

    // Clean up the URL object
    URL.revokeObjectURL(url)

    responsesDiv.innerHTML = `
      <p>Listing Saved</p>
      <p>Listing ID: ${listingId}</p>
      <p>Listing URL: ${listingUrl}</p>
      <p>Listing Title: ${listingTitle}</p>
      <p>Listing Address: ${listingAddress}</p>
    `
  } else {
    responsesDiv.innerHTML = '<p>No responses intercepted yet.</p>'
  }
})
