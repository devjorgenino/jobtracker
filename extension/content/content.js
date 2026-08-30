/**
 * JobTracker Content Script Coordinator
 * Injects on job pages, provides 1-click floating quick save, and communicates with extension popup/background.
 * Also provides a bi-directional bridge when loaded on the JobTracker web app.
 */

(function() {
  // Prevent multiple injections
  if (window.__JOBTRACKER_INJECTED__) return;
  window.__JOBTRACKER_INJECTED__ = true;

  // 1. Detect if we are on the JobTracker Web App page
  const isJobTrackerApp = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' || 
                           window.location.port === '5173' ||
                           document.title.includes('JobTracker') ||
                           !!document.querySelector('meta[name="jobtracker-app"]');

  if (isJobTrackerApp) {
    // Flag extension as installed in the page window
    try {
      window.__JOBTRACKER_EXTENSION_INSTALLED__ = true;
      window.dispatchEvent(new CustomEvent('jobtracker:extension-ready', { detail: { version: '1.0.0' } }));
    } catch (e) {}

    // Auto-sync existing jobs from extension storage on app load
    setTimeout(() => {
      chrome.runtime.sendMessage({ action: 'GET_ALL_SAVED_JOBS' }, (response) => {
        if (response && response.success && Array.isArray(response.jobs) && response.jobs.length > 0) {
          // Send all jobs to the web app
          window.postMessage({
            type: 'JOBTRACKER_EXTENSION_SYNC_ALL',
            source: 'jobtracker-extension',
            payload: response.jobs
          }, '*');

          if (typeof window.__JOBTRACKER_RECEIVE_ALL_JOBS__ === 'function') {
            window.__JOBTRACKER_RECEIVE_ALL_JOBS__(response.jobs);
          }
        }
      });
    }, 500);

    // Listen for requests from the web app (e.g. "Sincronizar ahora" button)
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'JOBTRACKER_REQUEST_EXTENSION_SYNC') {
        chrome.runtime.sendMessage({ action: 'GET_ALL_SAVED_JOBS' }, (response) => {
          if (response && response.success) {
            window.postMessage({
              type: 'JOBTRACKER_EXTENSION_SYNC_ALL',
              source: 'jobtracker-extension',
              payload: response.jobs || []
            }, '*');
          }
        });
      }
    });

    // We don't need scrapers or floating buttons on the JobTracker app itself
    return;
  }

  // 2. Job Portals Scrapers & Floating Button Injection
  const scrapers = [
    window.JobTrackerLinkedInScraper,
    window.JobTrackerIndeedScraper,
    window.JobTrackerInfoJobsScraper,
    window.JobTrackerCompuTrabajoScraper,
    window.JobTrackerGetOnBrdScraper,
    window.JobTrackerGlassdoorScraper,
    window.JobTrackerTorreScraper,
    window.JobTrackerWWRScraper,
    window.JobTrackerGenericScraper // Fallback
  ];

  function getActiveScraper() {
    for (const scraper of scrapers) {
      if (scraper && typeof scraper.detect === 'function' && scraper.detect()) {
        return scraper;
      }
    }
    return window.JobTrackerGenericScraper;
  }

  function extractCurrentJob() {
    const scraper = getActiveScraper();
    try {
      const data = scraper ? scraper.scrape() : {};
      return {
        id: 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        company: data.company || 'Empresa',
        position: data.title || 'Vacante',
        url: data.url || window.location.href,
        location: data.location || 'Remoto',
        workMode: data.workMode || 'Remoto',
        salary: data.salary || '',
        description: data.description || '',
        techStack: Array.isArray(data.techStack) ? data.techStack.join(', ') : (data.techStack || ''),
        portal: data.portal || (scraper ? scraper.name : 'Web'),
        contactName: data.recruiterName || '',
        contactEmail: '',
        contactProfile: data.recruiterProfile || '',
        status: 'wishlist',
        priority: 'medium',
        createdAt: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
        notes: `Extraído automáticamente por la extensión desde ${data.portal || (scraper ? scraper.name : 'Web')}.`
      };
    } catch (e) {
      console.error('[JobTracker] Error extracting job:', e);
      return null;
    }
  }

  // Floating Quick Action Button
  function injectFloatingButton() {
    if (document.getElementById('jobtracker-floating-btn')) return;
    
    // Only inject on likely job pages or supported domains
    const scraper = getActiveScraper();
    if (!scraper) return;

    const container = document.createElement('div');
    container.id = 'jobtracker-floating-btn';
    container.className = 'jobtracker-float-container';
    
    container.innerHTML = `
      <div class="jobtracker-badge" title="Guardar esta vacante en JobTracker">
        <div class="jobtracker-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
        </div>
        <span class="jobtracker-text">Guardar en JobTracker</span>
      </div>
    `;

    container.addEventListener('click', async (e) => {
      e.stopPropagation();
      const job = extractCurrentJob();
      if (!job || !job.position) {
        showToast('⚠️ No se pudo extraer la información completa de la vacante.', 'warning');
        return;
      }

      container.classList.add('loading');
      
      chrome.runtime.sendMessage({ action: 'SAVE_JOB', job: job }, (response) => {
        container.classList.remove('loading');
        if (response && response.success) {
          showToast(`✅ "${job.position}" guardada con éxito en JobTracker!`, 'success');
          container.classList.add('saved');
        } else {
          showToast(`⚠️ Guardada localmente (${response?.error || 'Verifica la app'})`, 'info');
        }
      });
    });

    document.body.appendChild(container);
  }

  // Toast Notification
  function showToast(message, type = 'success') {
    const existing = document.getElementById('jobtracker-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'jobtracker-toast';
    toast.className = `jobtracker-toast jobtracker-toast-${type}`;
    toast.innerText = message;

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Listen for messages from popup or background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'GET_JOB_DATA') {
      const job = extractCurrentJob();
      sendResponse({ success: !!job, job: job, scraper: getActiveScraper() ? getActiveScraper().name : 'Generic' });
    } else if (request.action === 'SHOW_TOAST') {
      showToast(request.message, request.type || 'success');
      sendResponse({ success: true });
    }
    return true;
  });

  // Check if current page is a job page and inject floating button
  setTimeout(() => {
    injectFloatingButton();
  }, 1200);

  // Re-check on URL changes (SPA navigation on LinkedIn/Indeed)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      setTimeout(injectFloatingButton, 1000);
    }
  }).observe(document, { subtree: true, childList: true });

})();
