/**
 * JobTracker Background Service Worker (Manifest V3)
 * Handles storage, context menus, cross-tab synchronization, and web app communication.
 */

const APP_DEFAULT_URL = 'http://localhost:5173';

// Initialize context menu and default configuration
chrome.runtime.onInstalled.addListener(() => {
  // 1. Context menu for text selection
  chrome.contextMenus.create({
    id: 'jobtracker-save-selection',
    title: 'Guardar selección como vacante en JobTracker AI',
    contexts: ['selection']
  });

  // 2. Context menu to toggle/show floating widget on any page
  chrome.contextMenus.create({
    id: 'jobtracker-toggle-widget',
    title: '⚡ Mostrar / Ocultar widget de JobTracker en esta página',
    contexts: ['page', 'frame']
  });

  // 3. Ensure default floatingWidgetMode is set to 'job_portals_only'
  chrome.storage.local.get(['floatingWidgetMode'], (res) => {
    if (!res.floatingWidgetMode) {
      chrome.storage.local.set({ floatingWidgetMode: 'job_portals_only' });
    }
  });

  console.log('✅ [JobTracker Background] Extensión inicializada correctamente con modo inteligente por defecto.');
});

// Handle Keyboard Shortcut Commands
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-floating-widget') {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab && tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'TOGGLE_FLOATING_WIDGET' }, () => {
          if (chrome.runtime.lastError) {}
        });
      }
    });
  }
});

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'jobtracker-save-selection') {
    const selectedText = info.selectionText || '';
    const job = {
      id: 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      position: tab.title || 'Vacante Seleccionada',
      company: 'Empresa',
      description: selectedText,
      url: tab.url,
      location: 'Remoto',
      workMode: 'Remoto',
      status: 'wishlist',
      priority: 'medium',
      portal: 'Menú Contextual',
      createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      notes: 'Guardado desde menú contextual del navegador.'
    };
    saveAndBroadcastJob(job);
  } else if (info.menuItemId === 'jobtracker-toggle-widget') {
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { action: 'TOGGLE_FLOATING_WIDGET' }, (res) => {
        if (chrome.runtime.lastError) {
          // If script not injected yet, inject dynamically
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: [
              'content/scrapers/generic.js',
              'content/scrapers/linkedin.js',
              'content/scrapers/indeed.js',
              'content/scrapers/infojobs.js',
              'content/scrapers/computrabajo.js',
              'content/scrapers/getonbrd.js',
              'content/scrapers/glassdoor.js',
              'content/scrapers/torre.js',
              'content/scrapers/weworkremotely.js',
              'content/content.js'
            ]
          }).then(() => {
            setTimeout(() => {
              chrome.tabs.sendMessage(tab.id, { action: 'SHOW_FLOATING_WIDGET' });
            }, 250);
          }).catch((e) => console.log('Could not inject content scripts:', e));
        }
      });
    }
  }
});

// Handle Messages from Popup, Content Scripts, or Web App
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'SAVE_JOB') {
    saveAndBroadcastJob(request.job).then((result) => {
      sendResponse(result);
    });
    return true; // Async response
  }

  if (request.action === 'SAVE_AND_OPTIMIZE') {
    saveAndBroadcastJob(request.job).then(() => {
      openOrFocusApp(`/optimize?jobId=${request.job.id}`);
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'GET_ALL_SAVED_JOBS') {
    chrome.storage.local.get(['jobs']).then((res) => {
      sendResponse({ success: true, jobs: res.jobs || [] });
    }).catch((err) => {
      sendResponse({ success: false, error: err.message, jobs: [] });
    });
    return true;
  }

  if (request.action === 'CLEAR_SAVED_JOBS') {
    chrome.storage.local.set({ jobs: [] }).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'OPEN_APP') {
    openOrFocusApp(request.path || '');
    sendResponse({ success: true });
    return true;
  }
});

/**
 * Save job to chrome.storage.local and broadcast across all channels to active JobTracker tabs
 */
async function saveAndBroadcastJob(job) {
  try {
    // 1. Save in extension local storage
    const storage = await chrome.storage.local.get(['jobs']);
    const existingJobs = storage.jobs || [];
    
    const index = existingJobs.findIndex(j => j.id === job.id || (job.url && j.url === job.url && job.url.length > 5));
    if (index >= 0) {
      existingJobs[index] = { ...existingJobs[index], ...job, lastUpdate: new Date().toISOString() };
    } else {
      existingJobs.unshift(job);
    }

    await chrome.storage.local.set({ jobs: existingJobs, lastSavedJob: job });

    // 2. Broadcast to all matching tabs (localhost, 127.0.0.1, or custom domains)
    const tabs = await chrome.tabs.query({});
    let appFound = false;

    for (const tab of tabs) {
      if (tab.url && (tab.url.includes('localhost:') || tab.url.includes('127.0.0.1:') || tab.url.includes('jobtracker'))) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (jobData) => {
              // 1. Dispatch window.postMessage with multiple action keys
              window.postMessage({
                type: 'JOBTRACKER_EXTENSION_JOB',
                source: 'jobtracker-extension',
                payload: jobData
              }, '*');

              window.postMessage({
                type: 'JOBTRACKER_EXTENSION_SYNC',
                source: 'jobtracker-extension',
                payload: jobData
              }, '*');

              window.postMessage({
                type: 'JOB_SAVED',
                source: 'jobtracker-extension',
                payload: jobData
              }, '*');

              // 2. Direct Window Helper Call
              if (typeof window.__JOBTRACKER_RECEIVE_JOB__ === 'function') {
                window.__JOBTRACKER_RECEIVE_JOB__(jobData);
              }

              // 3. Custom DOM Event
              window.dispatchEvent(new CustomEvent('jobtracker:job', { detail: jobData }));

              // 4. LocalStorage Sync trigger
              try {
                localStorage.setItem('jobtracker_new_job', JSON.stringify(jobData));
              } catch (e) {}

              // 5. BroadcastChannels
              ['jobtracker_sync', 'jobtracker_channel', 'jobtracker_extension_channel'].forEach(chName => {
                try {
                  const bc = new BroadcastChannel(chName);
                  bc.postMessage({ type: 'JOB_SAVED', payload: jobData, job: jobData });
                  bc.close();
                } catch (e) {}
              });
            },
            args: [job]
          });
          appFound = true;
        } catch (e) {
          console.log('[JobTracker Background] Could not inject sync into tab', tab.id, e);
        }
      }
    }

    // Set badge indicator
    chrome.action.setBadgeText({ text: '✓' });
    chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' });
    }, 3000);

    return { success: true, appFound: appFound, totalSaved: existingJobs.length };
  } catch (err) {
    console.error('[JobTracker Background] Error saving job:', err);
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
      const baseUrl = tab.url.split('#')[0].split('?')[0].replace(/\/+$/, '');
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      const targetUrl = `${baseUrl}${cleanPath}`;
      
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
