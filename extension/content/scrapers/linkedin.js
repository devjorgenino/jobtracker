/**
 * LinkedIn Job Scraper
 * Extracts job details, recruiter info, skills and metadata from LinkedIn Jobs (Search, Collections, Direct & Public).
 */

window.JobTrackerLinkedInScraper = {
  name: 'LinkedIn',
  
  detect: function() {
    return window.location.hostname.includes('linkedin.com');
  },

  cleanText: function(text) {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').trim();
  },

  parseLinkedInTitle: function(rawTitle) {
    if (!rawTitle) return { title: '', company: '', location: '' };
    
    // 1. Remove notification prefix like "(1) ", "(99+) "
    let clean = rawTitle.replace(/^\(\d+\+?\)\s*/, '').trim();
    
    // 2. Remove " | LinkedIn", " - LinkedIn", " • LinkedIn" at the end
    clean = clean.replace(/\s*([|–—-•])\s*LinkedIn.*$/i, '').trim();

    // 3. Pattern: "Company hiring Title in Location" or "Empresa contratando/busca Title en Location"
    const hiringMatch = clean.match(/^(.+?)\s+(?:hiring|contratando|busca|is looking for)\s+(.+?)(?:\s+(?:in|en)\s+(.+))?$/i);
    if (hiringMatch) {
      return {
        company: this.cleanText(hiringMatch[1]),
        title: this.cleanText(hiringMatch[2]),
        location: this.cleanText(hiringMatch[3] || '')
      };
    }

    // 4. Pattern: "Title at Company" or "Title en Empresa" or "Title @ Company"
    const atMatch = clean.match(/^(.+?)\s+(?:at|en|@)\s+(.+)$/i);
    if (atMatch) {
      let comp = atMatch[2].trim();
      let loc = '';
      if (comp.includes(' - ')) {
        const cParts = comp.split(' - ');
        comp = cParts[0].trim();
        loc = cParts.slice(1).join(' - ').trim();
      }
      return {
        title: this.cleanText(atMatch[1]),
        company: this.cleanText(comp),
        location: this.cleanText(loc)
      };
    }

    // 5. Pattern: "Title | Company | Location" or "Title - Company - Location"
    const parts = clean.split(/\s+[|–—-•]\s+/);
    if (parts.length >= 2) {
      return {
        title: this.cleanText(parts[0]),
        company: this.cleanText(parts[1]),
        location: this.cleanText(parts[2] || '')
      };
    }

    return {
      title: this.cleanText(clean),
      company: '',
      location: ''
    };
  },

  extractJsonLd: function() {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scripts) {
      try {
        const data = JSON.parse(script.textContent || '{}');
        const items = Array.isArray(data) ? data : (data['@graph'] ? data['@graph'] : [data]);
        
        for (const item of items) {
          if (item && (item['@type'] === 'JobPosting' || item.type === 'JobPosting')) {
            const org = item.hiringOrganization || {};
            const loc = item.jobLocation || {};
            const address = loc.address || {};
            
            let locationStr = '';
            if (typeof address === 'string') locationStr = address;
            else if (typeof address === 'object') {
              locationStr = [address.addressLocality, address.addressRegion, address.addressCountry].filter(Boolean).join(', ');
            }
            if (item.jobLocationType === 'TELECOMMUTE') {
              locationStr = locationStr ? `Remoto (${locationStr})` : 'Remoto';
            }

            let salaryStr = '';
            if (item.baseSalary) {
              const val = item.baseSalary.value || item.baseSalary;
              const currency = item.baseSalary.currency || val.currency || 'USD';
              if (val.minValue && val.maxValue) {
                salaryStr = `${val.minValue} - ${val.maxValue} ${currency}`;
              } else if (val.value) {
                salaryStr = `${val.value} ${currency}`;
              }
            }

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = item.description || '';
            const cleanDesc = tempDiv.textContent || tempDiv.innerText || '';

            return {
              title: item.title || '',
              company: typeof org === 'string' ? org : (org.name || ''),
              location: locationStr || '',
              salary: salaryStr || '',
              description: cleanDesc.trim(),
              postedDate: item.datePosted || '',
              employmentType: item.employmentType || ''
            };
          }
        }
      } catch (e) {}
    }
    return null;
  },

  scrape: function() {
    // 1. Check JSON-LD (Standard schema structured data)
    const jsonLd = this.extractJsonLd();

    // 2. Parse Document Title & OpenGraph Meta tags
    const docParsed = this.parseLinkedInTitle(document.title);
    const ogTitle = document.querySelector('meta[property="og:title"]')?.content || '';
    const ogParsed = this.parseLinkedInTitle(ogTitle);
    const metaDescription = document.querySelector('meta[property="og:description"]')?.content || 
                            document.querySelector('meta[name="description"]')?.content || '';

    // 3. Locate Main Job Detail Container (Right pane in split view or direct page)
    const detailContainer = document.querySelector(
      '[data-view-name="job-details"], .jobs-search__job-details, .scaffold-layout__detail, .jobs-details__main-content, .job-view-layout, main'
    ) || document;

    // --- A. TITLE EXTRACTION ---
    let title = '';
    const titleSelectors = [
      '.job-details-jobs-unified-top-card__job-title h1',
      '.job-details-jobs-unified-top-card__job-title a',
      '.job-details-jobs-unified-top-card__job-title',
      '.job-details-jobs-unified-top-card__title-container h1',
      '.job-details-jobs-unified-top-card__title-container',
      'h1.job-details-jobs-unified-top-card__job-title',
      'h2.job-details-jobs-unified-top-card__job-title',
      '.jobs-unified-top-card__job-title',
      'h1.jobs-unified-top-card__job-title',
      'h2.jobs-unified-top-card__job-title',
      '[data-view-name="job-details"] h1',
      '[data-view-name="job-details"] h2',
      '.jobs-search__job-details h1',
      '.jobs-search__job-details h2',
      '.scaffold-layout__detail h1',
      '.scaffold-layout__detail h2',
      'h1.topcard__title',
      'h1.top-card-layout__title',
      'h1.t-24',
      'h2.t-24',
      'h1',
      // Active card in left list
      'li.jobs-search-results-list__list-item--active .job-card-list__title',
      'li.jobs-search-results-list__list-item--active a.job-card-container__link',
      '.job-card-container--active a.job-card-container__link'
    ];

    for (const sel of titleSelectors) {
      const el = detailContainer.querySelector(sel) || document.querySelector(sel);
      if (el) {
        const text = el.innerText?.trim();
        // Avoid generic button texts or empty
        if (text && text.length > 2 && !text.toLowerCase().startsWith('linkedin') && !text.toLowerCase().includes('notificaciones')) {
          title = text;
          break;
        }
      }
    }

    if (!title || title.toLowerCase() === 'linkedin') {
      title = jsonLd?.title || docParsed.title || ogParsed.title || 'Vacante en LinkedIn';
    }

    // Clean any trailing newlines or subtitle badges inside title element
    if (title.includes('\n')) {
      title = title.split('\n')[0].trim();
    }

    // --- B. COMPANY EXTRACTION ---
    let company = '';
    const companySelectors = [
      '.job-details-jobs-unified-top-card__company-name a',
      '.job-details-jobs-unified-top-card__company-name',
      '.job-details-jobs-unified-top-card__primary-description-container a[href*="/company/"]',
      '.job-details-jobs-unified-top-card__primary-description-container a',
      '.job-details-jobs-unified-top-card__primary-description-container span.app-aware-link',
      '.jobs-unified-top-card__company-name a',
      '.jobs-unified-top-card__company-name',
      '.jobs-unified-top-card__primary-description a[href*="/company/"]',
      '.jobs-unified-top-card__primary-description a',
      '[data-view-name="job-details"] a[href*="/company/"]',
      '.scaffold-layout__detail a[href*="/company/"]',
      'a.topcard__org-name-link',
      '.top-card-layout__first-subline a',
      'a[data-tracking-control-name*="company_name"]',
      'a[data-tracking-control-name*="company"]',
      'a[href*="/company/"]',
      // Active card in list
      'li.jobs-search-results-list__list-item--active .job-card-container__primary-description',
      'li.jobs-search-results-list__list-item--active .artdeco-entity-lockup__subtitle',
      '.job-card-container--active .artdeco-entity-lockup__subtitle'
    ];

    for (const sel of companySelectors) {
      const el = detailContainer.querySelector(sel) || document.querySelector(sel);
      if (el) {
        const text = el.innerText?.trim();
        if (text && text.length > 1 && !text.toLowerCase().includes('solicitud') && !text.toLowerCase().includes('guardar')) {
          company = text;
          break;
        }
      }
    }

    if (!company) {
      company = jsonLd?.company || docParsed.company || ogParsed.company || 'Empresa Confidencial';
    }

    let companyUrl = '';
    const compLink = detailContainer.querySelector('a[href*="/company/"]') || document.querySelector('a[href*="/company/"]');
    if (compLink) companyUrl = compLink.href;

    // --- C. DESCRIPTION EXTRACTION ---
    let description = '';
    const descSelectors = [
      '#job-details',
      '.jobs-description__content',
      '.jobs-description-content__text',
      '.jobs-description__container',
      'article.jobs-description__container',
      'article.jobs-description',
      'div.jobs-box__html-content',
      '.show-more-less-html__markup',
      '[data-view-name="job-details"] article',
      '[data-view-name="job-details"] #job-details',
      '.scaffold-layout__detail article',
      '.scaffold-layout__detail #job-details',
      '.scaffold-layout__detail .jobs-description',
      '.jobs-search__job-details #job-details',
      '.jobs-search__job-details article',
      'div[class*="jobs-description"]',
      'div[class*="description__text"]',
      'section.show-more-less-html'
    ];

    for (const sel of descSelectors) {
      const el = detailContainer.querySelector(sel) || document.querySelector(sel);
      if (el) {
        const text = el.innerText?.trim();
        if (text && text.length > 40) {
          description = text;
          break;
        }
      }
    }

    if (!description || description.length < 40) {
      description = jsonLd?.description || metaDescription || '';
    }

    // Fallback: If still empty, scan detail container for paragraphs and text blocks
    if (!description || description.length < 40) {
      const paragraphs = Array.from(detailContainer.querySelectorAll('p, li, span'))
        .map(el => el.innerText?.trim())
        .filter(t => t && t.length > 25);
      if (paragraphs.length > 0) {
        description = paragraphs.join('\n\n');
      }
    }

    // --- D. LOCATION & WORK MODE ---
    let locationText = '';
    const locSelectors = [
      '.job-details-jobs-unified-top-card__primary-description-container',
      '.jobs-unified-top-card__bullet',
      '.job-details-jobs-unified-top-card__tertiary-description',
      '.jobs-unified-top-card__job-insight',
      '.topcard__flavor--bullet',
      '[data-view-name="job-details"] .job-details-jobs-unified-top-card__primary-description-container'
    ];

    for (const sel of locSelectors) {
      const el = detailContainer.querySelector(sel) || document.querySelector(sel);
      if (el) {
        const text = el.innerText?.trim();
        if (text && !text.toLowerCase().includes('solicitudes') && !text.toLowerCase().includes('visualizaciones')) {
          locationText = text;
          break;
        }
      }
    }

    if (!locationText) {
      locationText = jsonLd?.location || docParsed.location || ogParsed.location || 'Remoto';
    }

    // Determine Work Mode (Remoto, Híbrido, Presencial)
    const combinedContext = `${title} ${locationText} ${description}`.toLowerCase();
    let workMode = 'Remoto';
    if (combinedContext.includes('hybrid') || combinedContext.includes('híbrido') || combinedContext.includes('hibrido')) {
      workMode = 'Híbrido';
    } else if (combinedContext.includes('on-site') || combinedContext.includes('onsite') || combinedContext.includes('presencial') || combinedContext.includes('en oficina')) {
      workMode = 'Presencial';
    } else if (combinedContext.includes('remote') || combinedContext.includes('remoto') || combinedContext.includes('teletrabajo') || combinedContext.includes('100%')) {
      workMode = 'Remoto';
    }

    // --- E. SALARY ---
    let salary = jsonLd?.salary || '';
    const salaryEl = detailContainer.querySelector(
      '.job-details-jobs-unified-top-card__job-insight--highlight, .jobs-unified-top-card__job-insight--highlight, [data-tracking-control-name*="salary"]'
    ) || document.querySelector('.job-details-jobs-unified-top-card__job-insight--highlight');
    if (salaryEl && !salary) {
      salary = salaryEl.innerText?.trim() || '';
    }

    // --- F. RECRUITER / HIRING TEAM ---
    let recruiterName = '';
    let recruiterProfile = '';
    const recruiterCard = detailContainer.querySelector('.hirer-card__hirer-information, .jobs-poster, .message-the-recruiter') ||
                          document.querySelector('.hirer-card__hirer-information, .jobs-poster, .message-the-recruiter');
    if (recruiterCard) {
      const nameEl = recruiterCard.querySelector('a, .hirer-card__hirer-information-title, .jobs-poster__name');
      recruiterName = nameEl?.innerText?.trim() || '';
      recruiterProfile = nameEl?.href || recruiterCard.querySelector('a')?.href || '';
    }

    // --- G. URL NORMALIZATION ---
    let url = window.location.href;
    const urlObj = new URL(url);
    const jobId = urlObj.searchParams.get('currentJobId') || url.match(/\/view\/(\d+)/)?.[1];
    if (jobId) {
      url = `https://www.linkedin.com/jobs/view/${jobId}/`;
    }

    // --- H. TECH STACK EXTRACTION ---
    const techStack = window.JobTrackerGenericScraper.extractTechStack(`${title} ${description}`);

    return {
      title: title || 'Vacante en LinkedIn',
      company: company || 'Empresa Confidencial',
      companyUrl: companyUrl,
      location: locationText || workMode,
      workMode: workMode,
      salary: salary,
      description: description,
      techStack: techStack,
      url: url,
      portal: 'LinkedIn',
      recruiterName: recruiterName,
      recruiterProfile: recruiterProfile,
      postedDate: jsonLd?.postedDate || new Date().toISOString().split('T')[0]
    };
  }
};
