/**
 * JobTracker Background Service Worker (Manifest V3)
 */

const APP_DEFAULT_URL = 'http://localhost:5173';

// Initialize context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'jobtracker-save-selection',
    title: 'Guardar selección como vacante en JobTracker',
    contexts: ['selection']
  });
  console.log('[JobTracker Background] Extensión inicializada correctamente.');
});

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'jobtracker-save-selection') {
    const selectedText = info.selectionText || '';
    const job = {
      id: 'job_' + Date.now(),
      position: tab.title || 'Vacante Seleccionada',
      company: 'Empresa',
      description: selectedText,
      url: tab.url,
      location: 'Remoto',
      workMode: 'Remoto',
      status: 'wishlist',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      notes: 'Guardado desde menú contextual'
    };
    saveAndBroadcastJob(job);
  }
});

// Handle Messages from Popup or Content Scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'SAVE_JOB') {
    saveAndBroadcastJob(request.job).then((result) => {
      sendResponse(result);
    });
    return true; // Keep channel open for async response
  }

  if (request.action === 'SAVE_AND_OPTIMIZE') {
    saveAndBroadcastJob(request.job).then(() => {
      openOrFocusApp(`/optimize?jobId=${request.job.id}`);
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'OPEN_APP') {
    openOrFocusApp();
    sendResponse({ success: true });
    return true;
  }
});

/**
 * Save job to chrome.storage.local and broadcast to active JobTracker tabs
 */
async function saveAndBroadcastJob(job) {
  try {
    // 1. Save in extension local storage
    const storage = await chrome.storage.local.get(['jobs']);
    const existingJobs = storage.jobs || [];
    
    // Check if already exists (by url or id)
    const index = existingJobs.findIndex(j => j.id === job.id || (j.url && j.url === job.url));
    if (index >= 0) {
      existingJobs[index] = { ...existingJobs[index], ...job, lastUpdate: new Date().toISOString() };
    } else {
      existingJobs.unshift(job);
    }

    await chrome.storage.local.set({ jobs: existingJobs, lastSavedJob: job });

    // 2. Broadcast to any open JobTracker tabs
    const tabs = await chrome.tabs.query({});
    let appFound = false;

    for (const tab of tabs) {
      if (tab.url && (tab.url.includes('localhost:') || tab.url.includes('127.0.0.1:') || tab.url.includes('jobtracker'))) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (jobData) => {
              window.postMessage({
                type: 'JOBTRACKER_EXTENSION_SYNC',
                source: 'jobtracker-extension',
                payload: jobData
              }, '*');
              
              // Also trigger BroadcastChannel
              if (typeof BroadcastChannel !== 'undefined') {
                const bc = new BroadcastChannel('jobtracker_channel');
                bc.postMessage({ type: 'NEW_JOB', job: jobData });
                bc.close();
              }
            },
            args: [job]
          });
          appFound = true;
        } catch (e) {
          console.log('[JobTracker] Could not inject into tab', tab.id, e);
        }
      }
    }

    // Set badge
    chrome.action.setBadgeText({ text: '✓' });
    chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' });
    }, 3000);

    return { success: true, appFound: appFound };
  } catch (err) {
    console.error('[JobTracker] Error saving job:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Open or Focus JobTracker Web App Tab
 */
async function openOrFocusApp(path = '') {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (tab.url && (tab.url.includes('localhost:') || tab.url.includes('127.0.0.1:') || tab.url.includes('jobtracker'))) {
      const targetUrl = new URL(path, tab.url).href;
      await chrome.tabs.update(tab.id, { active: true, url: targetUrl });
      if (tab.windowId) {
        await chrome.windows.update(tab.windowId, { focused: true });
      }
      return;
    }
  }

  // If no tab found, open new tab
  chrome.tabs.create({ url: `${APP_DEFAULT_URL}${path}` });
}
