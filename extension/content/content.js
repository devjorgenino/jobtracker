/**
 * JobTracker Content Script Coordinator
 * Injects floating quick save button ONLY on detected job portals/vacancies, or when explicitly requested by user.
 * Communicates with extension popup/background and provides bi-directional bridge on JobTracker web app.
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

  // 2. Job Portals Scrapers
  const specificScrapers = [
    window.JobTrackerLinkedInScraper,
    window.JobTrackerIndeedScraper,
    window.JobTrackerInfoJobsScraper,
    window.JobTrackerCompuTrabajoScraper,
    window.JobTrackerGetOnBrdScraper,
    window.JobTrackerGlassdoorScraper,
    window.JobTrackerTorreScraper,
    window.JobTrackerWWRScraper
  ];

  // Current user configuration for floating widget
  // 'job_portals_only' (Default): Only show on detected job sites/vacancies
  // 'manual': Never show automatically; only when activated from popup or context menu
  // 'always': Show on all web pages
  let currentWidgetMode = 'job_portals_only';

  // Load user preference from storage
  chrome.storage.local.get(['floatingWidgetMode'], (result) => {
    if (result && result.floatingWidgetMode) {
      currentWidgetMode = result.floatingWidgetMode;
    }
    evaluateFloatingButton();
  });

  // Listen for storage changes from popup
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.floatingWidgetMode) {
      currentWidgetMode = changes.floatingWidgetMode.newValue || 'job_portals_only';
      evaluateFloatingButton();
    }
  });

  /**
   * Returns the scraper specifically detecting this site/page as a job portal/offer,
   * or null if this page is not recognized as a job posting.
   */
  function getDetectedScraper() {
    for (const scraper of specificScrapers) {
      if (scraper && typeof scraper.detect === 'function') {
        try {
          if (scraper.detect()) return scraper;
        } catch (e) {
          console.warn('[JobTracker] Scraper detect error:', scraper.name, e);
        }
      }
    }
    if (window.JobTrackerGenericScraper && typeof window.JobTrackerGenericScraper.detect === 'function') {
      try {
        if (window.JobTrackerGenericScraper.detect()) {
          return window.JobTrackerGenericScraper;
        }
      } catch (e) {
        console.warn('[JobTracker] Generic detect error:', e);
      }
    }
    return null;
  }

  /**
   * Check if current page is a verified job portal or job posting
   */
  function isJobPage() {
    return getDetectedScraper() !== null;
  }

  /**
   * Get active scraper for extraction.
   * If allowFallback is true and no specific portal detected, returns generic scraper.
   */
  function getActiveScraper(allowFallback = true) {
    const detected = getDetectedScraper();
    if (detected) return detected;
    return allowFallback ? window.JobTrackerGenericScraper : null;
  }

  function extractCurrentJob() {
    const scraper = getActiveScraper(true);
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
        portal: data.portal || (scraper ? scraper.name : 'Web Externa'),
        contactName: data.recruiterName || '',
        contactEmail: '',
        contactProfile: data.recruiterProfile || '',
        status: 'wishlist',
        priority: 'medium',
        createdAt: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
        notes: `Extraído por la extensión desde ${data.portal || (scraper ? scraper.name : 'Web')}.`
      };
    } catch (e) {
      console.error('[JobTracker] Error extracting job:', e);
      return null;
    }
  }

  // Remove existing floating widget
  function removeFloatingButton() {
    const existing = document.getElementById('jobtracker-floating-btn');
    if (existing) {
      existing.classList.add('jobtracker-fade-out');
      setTimeout(() => existing.remove(), 250);
    }
  }

  // Floating Quick Action Button
  function injectFloatingButton() {
    if (document.getElementById('jobtracker-floating-btn')) return;

    const container = document.createElement('div');
    container.id = 'jobtracker-floating-btn';
    container.className = 'jobtracker-float-container jobtracker-fade-in';
    
    container.innerHTML = `
      <div class="jobtracker-badge" id="jobtracker-badge-action" title="Guardar esta vacante en JobTracker">
        <div class="jobtracker-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
        </div>
        <span class="jobtracker-text">Guardar en JobTracker</span>
      </div>
      <button type="button" class="jobtracker-close-btn" id="jobtracker-btn-dismiss" title="Ocultar widget en esta pestaña" aria-label="Cerrar widget">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    // Click on main badge action
    const badgeAction = container.querySelector('#jobtracker-badge-action');
    badgeAction.addEventListener('click', async (e) => {
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

    // Click on dismiss button
    const dismissBtn = container.querySelector('#jobtracker-btn-dismiss');
    dismissBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      sessionStorage.setItem('jobtracker_widget_dismissed', 'true');
      removeFloatingButton();
    });

    document.body.appendChild(container);
  }

  /**
   * Decides whether to show, hide or inject the floating widget based on:
   * 1. Mode: 'job_portals_only' (default), 'manual', 'always'
   * 2. Page detection: Is it a job portal or job posting?
   * 3. Session state: Has user dismissed it in this tab?
   */
  function evaluateFloatingButton(force = false) {
    if (isJobTrackerApp) return;

    if (force) {
      sessionStorage.removeItem('jobtracker_widget_dismissed');
      injectFloatingButton();
      return;
    }

    // If user explicitly dismissed it in this session, don't show automatically
    if (sessionStorage.getItem('jobtracker_widget_dismissed') === 'true') {
      removeFloatingButton();
      return;
    }

    if (currentWidgetMode === 'manual') {
      // Never auto-inject in manual mode
      removeFloatingButton();
      return;
    }

    if (currentWidgetMode === 'always') {
      injectFloatingButton();
      return;
    }

    // Default mode: 'job_portals_only'
    if (isJobPage()) {
      injectFloatingButton();
    } else {
      removeFloatingButton();
    }
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
      const detected = getDetectedScraper();
      sendResponse({ 
        success: !!job, 
        job: job, 
        scraper: detected ? detected.name : (job?.portal || 'Genérico'),
        isJobSite: isJobPage()
      });
    } else if (request.action === 'CHECK_PAGE_STATUS') {
      const detected = getDetectedScraper();
      sendResponse({
        isJobSite: isJobPage(),
        portalName: detected ? detected.name : 'Web Externa',
        mode: currentWidgetMode,
        isDismissed: sessionStorage.getItem('jobtracker_widget_dismissed') === 'true',
        isWidgetVisible: !!document.getElementById('jobtracker-floating-btn')
      });
    } else if (request.action === 'SHOW_FLOATING_WIDGET') {
      evaluateFloatingButton(true);
      showToast('⚡ Widget de JobTracker activado en esta página', 'info');
      sendResponse({ success: true });
    } else if (request.action === 'HIDE_FLOATING_WIDGET') {
      sessionStorage.setItem('jobtracker_widget_dismissed', 'true');
      removeFloatingButton();
      sendResponse({ success: true });
    } else if (request.action === 'TOGGLE_FLOATING_WIDGET') {
      const isVisible = !!document.getElementById('jobtracker-floating-btn');
      if (isVisible) {
        sessionStorage.setItem('jobtracker_widget_dismissed', 'true');
        removeFloatingButton();
        showToast('Widget de JobTracker ocultado', 'info');
      } else {
        evaluateFloatingButton(true);
        showToast('⚡ Widget de JobTracker activado en esta página', 'info');
      }
      sendResponse({ success: true, isVisible: !isVisible });
    } else if (request.action === 'SET_WIDGET_MODE') {
      currentWidgetMode = request.mode || 'job_portals_only';
      evaluateFloatingButton();
      sendResponse({ success: true, mode: currentWidgetMode });
    } else if (request.action === 'SHOW_TOAST') {
      showToast(request.message, request.type || 'success');
      sendResponse({ success: true });
    }
    return true;
  });

  // Initial evaluation after DOM is ready
  setTimeout(() => {
    evaluateFloatingButton();
  }, 1000);

  // Re-check on URL changes (SPA navigation on LinkedIn/Indeed/ATS)
  let lastUrl = location.href;
  let debounceTimeout = null;
  new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        evaluateFloatingButton();
      }, 1000);
    }
  }).observe(document, { subtree: true, childList: true });

})();
