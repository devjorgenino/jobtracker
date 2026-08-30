/**
 * Indeed Job Scraper
 * Extracts job info across all regional Indeed domains (indeed.com, es.indeed.com, etc.)
 */

window.JobTrackerIndeedScraper = {
  name: 'Indeed',

  detect: function() {
    return window.location.hostname.includes('indeed.') &&
           (window.location.pathname.includes('/viewjob') || 
            window.location.pathname.includes('/jobs') || 
            window.location.search.includes('vjk=') ||
            window.location.search.includes('jk='));
  },

  scrape: function() {
    const titleEl = document.querySelector(
      '.jobsearch-JobInfoHeader-title, h1.jobsearch-JobInfoHeader-title, h1.title, h2.jobTitle'
    );
    const title = titleEl?.innerText?.trim() || '';

    const companyEl = document.querySelector(
      '[data-company-name="true"], [data-testid="inlineHeader-companyName"], .jobsearch-InlineCompanyRating-companyHeader, .companyName'
    );
    const company = companyEl?.innerText?.trim() || '';

    const locationEl = document.querySelector(
      '[data-testid="inlineHeader-companyLocation"], [data-testid="job-location"], .jobsearch-JobInfoHeader-subtitle div'
    );
    const location = locationEl?.innerText?.trim() || 'Remoto';

    const salaryEl = document.querySelector(
      '#salaryInfoAndJobType, [data-testid="attribute_snippets_section"], .jobsearch-JobDescriptionSection-sectionItem'
    );
    const salary = salaryEl?.innerText?.trim() || '';

    const descEl = document.querySelector(
      '#jobDescriptionText, .jobsearch-jobDescriptionText, .jobsearch-JobComponent-description'
    );
    const description = descEl?.innerText?.trim() || '';

    // URL normalization
    let url = window.location.href;
    const urlObj = new URL(url);
    const jk = urlObj.searchParams.get('jk') || urlObj.searchParams.get('vjk');
    if (jk) {
      url = `${window.location.origin}/viewjob?jk=${jk}`;
    }

    const workMode = window.JobTrackerGenericScraper.detectWorkMode(`${title} ${location} ${description}`);
    const techStack = window.JobTrackerGenericScraper.extractTechStack(`${title} ${description}`);

    return {
      title: title || 'Vacante en Indeed',
      company: company || 'Empresa Confidencial',
      location: location,
      workMode: workMode,
      salary: salary,
      description: description,
      techStack: techStack,
      url: url,
      portal: 'Indeed',
      recruiterName: '',
      recruiterProfile: '',
      postedDate: new Date().toISOString().split('T')[0]
    };
  }
};
