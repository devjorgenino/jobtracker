/**
 * LinkedIn Job Scraper
 * Extracts job details, recruiter info, skills and metadata from LinkedIn Jobs.
 */

window.JobTrackerLinkedInScraper = {
  name: 'LinkedIn',
  
  detect: function() {
    return window.location.hostname.includes('linkedin.com') && 
           (window.location.pathname.includes('/jobs/') || window.location.pathname.includes('/job/'));
  },

  scrape: function() {
    // 1. Job Title
    const titleEl = document.querySelector(
      '.job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title, h1.t-24, .topcard__title, h2.topcard__title, .jobs-search__job-details h1'
    );
    const title = titleEl?.innerText?.trim() || '';

    // 2. Company Name & Profile
    const companyEl = document.querySelector(
      '.job-details-jobs-unified-top-card__company-name a, .jobs-unified-top-card__company-name a, .jobs-unified-top-card__company-name, .topcard__org-name-link, [data-tracking-control-name*="company_name"]'
    );
    const company = companyEl?.innerText?.trim() || '';
    const companyUrl = companyEl?.href || '';

    // 3. Location & Work Mode
    const locationEl = document.querySelector(
      '.job-details-jobs-unified-top-card__primary-description-container span, .jobs-unified-top-card__bullet, .topcard__flavor--bullet'
    );
    let locationText = locationEl?.innerText?.trim() || '';
    
    // Check all bullets for location and workplace type (Remote, Hybrid, On-site)
    const bullets = Array.from(document.querySelectorAll('.job-details-jobs-unified-top-card__primary-description-container span, .jobs-unified-top-card__job-insight'));
    let workMode = 'Remoto';
    for (const b of bullets) {
      const txt = b.innerText.toLowerCase();
      if (txt.includes('remote') || txt.includes('remoto')) workMode = 'Remoto';
      else if (txt.includes('hybrid') || txt.includes('híbrido')) workMode = 'Híbrido';
      else if (txt.includes('on-site') || txt.includes('presencial')) workMode = 'Presencial';
    }

    // 4. Salary
    const salaryEl = document.querySelector(
      '.job-details-jobs-unified-top-card__job-insight--highlight, .jobs-unified-top-card__job-insight--highlight'
    );
    const salary = salaryEl?.innerText?.trim() || '';

    // 5. Job Description
    const descEl = document.querySelector(
      '#job-details, .jobs-description__content, .jobs-box__html-content, .show-more-less-html__markup'
    );
    const description = descEl?.innerText?.trim() || '';

    // 6. Recruiter / Hiring Team info
    const recruiterCard = document.querySelector(
      '.hirer-card__hirer-information, .jobs-poster, .message-the-recruiter'
    );
    let recruiterName = '';
    let recruiterProfile = '';
    
    if (recruiterCard) {
      const nameEl = recruiterCard.querySelector('a, .hirer-card__hirer-information-title, .jobs-poster__name');
      recruiterName = nameEl?.innerText?.trim() || '';
      recruiterProfile = nameEl?.href || recruiterCard.querySelector('a')?.href || '';
    }

    // Clean job URL (strip tracking parameters)
    let url = window.location.href;
    const urlObj = new URL(url);
    const jobId = urlObj.searchParams.get('currentJobId') || url.match(/\/view\/(\d+)/)?.[1];
    if (jobId) {
      url = `https://www.linkedin.com/jobs/view/${jobId}/`;
    }

    // Extract tech stack
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
      postedDate: new Date().toISOString().split('T')[0]
    };
  }
};
