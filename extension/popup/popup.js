/**
 * JobTracker AI - Popup Controller
 * Manages extraction preview, manual editing, floating widget activation,
 * and synchronization with the JobTracker app.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const loadingState = document.getElementById('loading-state');
  const formState = document.getElementById('form-state');
  const portalBadge = document.getElementById('portal-badge');
  const quickActionBar = document.getElementById('quick-action-bar');
  const quickActionText = document.getElementById('quick-action-text');
  const toggleFloatingBtn = document.getElementById('toggle-floating-btn');
  const widgetModeSelect = document.getElementById('widget-mode-select');

  const titleInput = document.getElementById('job-title');
  const companyInput = document.getElementById('job-company');
  const workModeInput = document.getElementById('job-work-mode');
  const locationInput = document.getElementById('job-location');
  const salaryInput = document.getElementById('job-salary');
  const statusInput = document.getElementById('job-status');
  const priorityInput = document.getElementById('job-priority');
  const techInput = document.getElementById('job-tech');
  const recruiterInput = document.getElementById('job-recruiter');
  const emailInput = document.getElementById('job-email');
  const descInput = document.getElementById('job-description');
  const toggleDescBtn = document.getElementById('toggle-desc-btn');
  const saveBtn = document.getElementById('save-btn');
  const optimizeBtn = document.getElementById('optimize-btn');
  const copyJsonBtn = document.getElementById('copy-json-btn');
  const openAppBtn = document.getElementById('open-app-btn');
  const statusMsg = document.getElementById('status-msg');

  let currentJobData = null;
  let activeTabId = null;
  let activeTabUrl = '';
  let isJobSiteDetected = false;
  let isWidgetCurrentlyVisible = false;

  // Load user preference for widget mode
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['floatingWidgetMode'], (result) => {
      if (result.floatingWidgetMode && widgetModeSelect) {
        widgetModeSelect.value = result.floatingWidgetMode;
      } else if (widgetModeSelect) {
        widgetModeSelect.value = 'job_portals_only';
      }
    });
  }

  // Handle widget mode preference change
  if (widgetModeSelect) {
    widgetModeSelect.addEventListener('change', (e) => {
      const selectedMode = e.target.value;
      if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ floatingWidgetMode: selectedMode }, () => {
          showStatus('⚙️ Preferencia guardada: ' + getModeLabel(selectedMode), 'success');
        });
      }
      if (activeTabId) {
        chrome.tabs.sendMessage(activeTabId, { action: 'SET_WIDGET_MODE', mode: selectedMode }, () => {
          if (chrome.runtime.lastError) {}
        });
      }
    });
  }

  function getModeLabel(mode) {
    switch (mode) {
      case 'job_portals_only': return 'Solo en portales de empleo';
      case 'manual': return 'Solo manual';
      case 'always': return 'En todas las páginas';
      default: return mode;
    }
  }

  function parseTitleAndPortal(tabTitle, tabUrl) {
    let portal = 'Web Externa';
    const url = tabUrl || '';
    if (url.includes('linkedin.com')) portal = 'LinkedIn';
    else if (url.includes('indeed.')) portal = 'Indeed';
    else if (url.includes('infojobs.')) portal = 'InfoJobs';
    else if (url.includes('computrabajo.')) portal = 'CompuTrabajo';
    else if (url.includes('getonbrd.')) portal = 'Get on Board';
    else if (url.includes('glassdoor.')) portal = 'Glassdoor';
    else if (url.includes('torre.co') || url.includes('torre.ai')) portal = 'Torre';
    else if (url.includes('weworkremotely.com')) portal = 'We Work Remotely';
    else if (url.includes('greenhouse.io')) portal = 'Greenhouse';
    else if (url.includes('lever.co')) portal = 'Lever';
    else if (url.includes('workable.com')) portal = 'Workable';
    else if (url.includes('myworkdayjobs.com')) portal = 'Workday';
    else if (url.includes('wellfound.com')) portal = 'Wellfound';

    let clean = (tabTitle || '').replace(/^\(\d+\+?\)\s*/, '').trim();
    clean = clean.replace(/\s*([|–—-•])\s*(?:LinkedIn|Indeed|InfoJobs|CompuTrabajo|Get on Board|Glassdoor|Torre|We Work Remotely).*$/i, '').trim();

    let position = clean;
    let company = '';
    let location = 'Remoto';

    const hiringMatch = clean.match(/^(.+?)\s+(?:hiring|contratando|busca|is looking for)\s+(.+?)(?:\s+(?:in|en)\s+(.+))?$/i);
    if (hiringMatch) {
      company = hiringMatch[1].trim();
      position = hiringMatch[2].trim();
      location = hiringMatch[3]?.trim() || 'Remoto';
    } else {
      const atMatch = clean.match(/^(.+?)\s+(?:at|en|@)\s+(.+)$/i);
      if (atMatch) {
        position = atMatch[1].trim();
        company = atMatch[2].trim();
      } else {
        const parts = clean.split(/\s+[|–—-•]\s+/);
        if (parts.length >= 2) {
          position = parts[0].trim();
          company = parts[1].trim();
        }
      }
    }

    return { position, company, location, portal };
  }

  async function requestJobData(tabId) {
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, { action: 'GET_JOB_DATA' }, async (response) => {
        if (chrome.runtime.lastError || !response || !response.success) {
          // Tab might have been opened before extension install/update; inject content scripts dynamically and retry
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tabId },
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
            });
            setTimeout(() => {
              chrome.tabs.sendMessage(tabId, { action: 'GET_JOB_DATA' }, (retryRes) => {
                if (chrome.runtime.lastError || !retryRes || !retryRes.success) {
                  resolve(null);
                } else {
                  resolve(retryRes);
                }
              });
            }, 300);
          } catch (e) {
            resolve(null);
          }
        } else {
          resolve(response);
        }
      });
    });
  }

  async function checkPageStatus(tabId) {
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, { action: 'CHECK_PAGE_STATUS' }, (res) => {
        if (chrome.runtime.lastError || !res) {
          resolve(null);
        } else {
          resolve(res);
        }
      });
    });
  }

  // 1. Query active tab and request job data
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      throw new Error('No se pudo acceder a la pestaña activa.');
    }

    activeTabId = tab.id;
    activeTabUrl = tab.url || '';

    // Fetch page status and job data
    const [pageStatus, response] = await Promise.all([
      checkPageStatus(tab.id),
      requestJobData(tab.id)
    ]);

    loadingState.style.display = 'none';
    formState.style.display = 'flex';

    isJobSiteDetected = !!(pageStatus?.isJobSite || response?.isJobSite);
    isWidgetCurrentlyVisible = !!(pageStatus?.isWidgetVisible);

    // Update portal badge with distinction between detected job portals and manual web extraction
    if (isJobSiteDetected) {
      const portalName = pageStatus?.portalName || response?.scraperName || response?.job?.portal || 'Portal Empleo';
      portalBadge.textContent = '🟢 ' + portalName;
      portalBadge.className = 'badge badge-portal detected';
      portalBadge.title = 'Portal de empleo detectado automáticamente';

      if (quickActionBar) {
        quickActionBar.style.display = 'flex';
        quickActionText.textContent = isWidgetCurrentlyVisible ? 'Widget flotante activo' : 'Portal de empleo detectado';
        toggleFloatingBtn.textContent = isWidgetCurrentlyVisible ? 'Ocultar Widget' : 'Mostrar Widget';
        toggleFloatingBtn.className = isWidgetCurrentlyVisible ? 'btn-sm-action active' : 'btn-sm-action';
      }
    } else {
      portalBadge.textContent = '⚪ Web Externa (Manual)';
      portalBadge.className = 'badge badge-portal manual';
      portalBadge.title = 'El widget no se muestra automáticamente en sitios externos';

      if (quickActionBar) {
        quickActionBar.style.display = 'flex';
        quickActionText.textContent = '¿Viendo una vacante aquí?';
        toggleFloatingBtn.textContent = '⚡ Mostrar Widget';
        toggleFloatingBtn.className = 'btn-sm-action';
      }
    }

    if (!response || !response.success || !response.job) {
      // Fallback parsed from title and url
      const parsed = parseTitleAndPortal(tab.title, tab.url);
      currentJobData = {
        id: 'job_' + Date.now(),
        company: parsed.company || '',
        position: parsed.position || 'Nueva Vacante',
        url: tab.url,
        location: parsed.location || 'Remoto',
        workMode: 'Remoto',
        salary: '',
        description: '',
        techStack: '',
        portal: parsed.portal,
        status: 'wishlist',
        priority: 'medium'
      };
    } else {
      currentJobData = response.job;
    }

    populateForm(currentJobData);
  } catch (err) {
    loadingState.style.display = 'none';
    formState.style.display = 'flex';
    portalBadge.textContent = '⚪ Modo Manual';
    portalBadge.className = 'badge badge-portal manual';
    populateForm({
      position: '',
      company: '',
      location: 'Remoto',
      workMode: 'Remoto',
      url: activeTabUrl
    });
  }

  // Handle Quick Toggle Floating Widget Button
  if (toggleFloatingBtn) {
    toggleFloatingBtn.addEventListener('click', () => {
      if (!activeTabId) return;

      const action = isWidgetCurrentlyVisible ? 'HIDE_FLOATING_WIDGET' : 'SHOW_FLOATING_WIDGET';
      chrome.tabs.sendMessage(activeTabId, { action }, (res) => {
        if (chrome.runtime.lastError) {
          showStatus('⚠️ No se pudo comunicar con la pestaña activa.', 'error');
          return;
        }

        isWidgetCurrentlyVisible = !isWidgetCurrentlyVisible;
        if (isWidgetCurrentlyVisible) {
          toggleFloatingBtn.textContent = 'Ocultar Widget';
          toggleFloatingBtn.className = 'btn-sm-action active';
          quickActionText.textContent = 'Widget flotante activo';
          showStatus('⚡ Widget flotante activado en la página.', 'success');
        } else {
          toggleFloatingBtn.textContent = 'Mostrar Widget';
          toggleFloatingBtn.className = 'btn-sm-action';
          quickActionText.textContent = 'Widget flotante ocultado';
          showStatus('Widget flotante ocultado.', 'info');
        }
      });
    });
  }

  function populateForm(data) {
    if (!data) return;
    titleInput.value = data.position || data.title || '';
    companyInput.value = data.company || '';
    workModeInput.value = data.workMode || 'Remoto';
    locationInput.value = data.location || '';
    salaryInput.value = data.salary || '';
    statusInput.value = data.status || 'wishlist';
    priorityInput.value = data.priority || 'medium';
    techInput.value = data.techStack || '';
    recruiterInput.value = data.contactName || data.recruiterName || '';
    emailInput.value = data.contactEmail || '';
    descInput.value = data.description || '';
  }

  function getFormData() {
    return {
      id: currentJobData?.id || ('job_' + Date.now()),
      position: titleInput.value.trim(),
      company: companyInput.value.trim(),
      workMode: workModeInput.value,
      location: locationInput.value.trim() || 'Remoto',
      salary: salaryInput.value.trim(),
      status: statusInput.value,
      priority: priorityInput.value,
      techStack: techInput.value.trim(),
      contactName: recruiterInput.value.trim(),
      contactEmail: emailInput.value.trim(),
      contactProfile: currentJobData?.contactProfile || '',
      description: descInput.value.trim(),
      url: currentJobData?.url || activeTabUrl,
      portal: currentJobData?.portal || (isJobSiteDetected ? 'Portal Empleo' : 'Web Externa'),
      createdAt: currentJobData?.createdAt || new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      notes: currentJobData?.notes || 'Capturado vía Extensión JobTracker AI'
    };
  }

  // Toggle Description box height
  let descExpanded = false;
  toggleDescBtn.addEventListener('click', () => {
    descExpanded = !descExpanded;
    descInput.rows = descExpanded ? 8 : 3;
    toggleDescBtn.textContent = descExpanded ? 'Minimizar' : 'Ver / Editar';
  });

  // Save to JobTracker
  saveBtn.addEventListener('click', async () => {
    const job = getFormData();
    if (!job.position || !job.company) {
      showStatus('⚠️ Por favor completa el título y la empresa.', 'error');
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = 'Guardando...';

    chrome.runtime.sendMessage({ action: 'SAVE_JOB', job: job }, (response) => {
      saveBtn.disabled = false;
      saveBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        ¡Guardado con éxito!
      `;
      showStatus('✅ Vacante sincronizada correctamente con JobTracker.', 'success');
      
      setTimeout(() => {
        saveBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          Guardar en JobTracker
        `;
      }, 2500);
    });
  });

  // Save & Optimize
  optimizeBtn.addEventListener('click', async () => {
    const job = getFormData();
    if (!job.position || !job.company) {
      showStatus('⚠️ Por favor completa el título y la empresa.', 'error');
      return;
    }

    chrome.runtime.sendMessage({ action: 'SAVE_AND_OPTIMIZE', job: job }, (response) => {
      showStatus('🚀 Abriendo JobTracker para optimizar CV...', 'success');
    });
  });

  // Copy JSON
  copyJsonBtn.addEventListener('click', () => {
    const job = getFormData();
    navigator.clipboard.writeText(JSON.stringify(job, null, 2));
    showStatus('📋 JSON copiado al portapapeles', 'success');
  });

  // Open App
  openAppBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'OPEN_APP' });
  });

  function showStatus(text, type) {
    statusMsg.textContent = text;
    statusMsg.style.display = 'block';
    statusMsg.className = `status-banner show ${type}`;
    setTimeout(() => {
      statusMsg.className = 'status-banner';
      statusMsg.style.display = 'none';
    }, 4000);
  }
});
