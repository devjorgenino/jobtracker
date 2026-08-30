/**
 * Torre.ai Job Scraper
 */

window.JobTrackerTorreScraper = {
  name: 'Torre.ai',

  detect: function() {
    return window.location.hostname.includes('torre.ai') || window.location.hostname.includes('torre.co');
  },

  scrape: function() {
    const titleEl = document.querySelector('h1, [data-test="job-title"], .opportunity-title');
    const title = titleEl?.innerText?.trim() || '';

    const companyEl = document.querySelector('.organization-name, [data-test="organization-name"], a[href*="/organizations/"]');
    const company = companyEl?.innerText?.trim() || '';

    const locationEl = document.querySelector('.opportunity-location, [data-test="location"]');
    const location = locationEl?.innerText?.trim() || 'Remoto';

    const salaryEl = document.querySelector('.compensation-amount, [data-test="compensation"]');
    const salary = salaryEl?.innerText?.trim() || '';

    const descEl = document.querySelector('.opportunity-details, .job-details, main');
    const description = descEl?.innerText?.trim() || '';

    const workMode = window.JobTrackerGenericScraper.detectWorkMode(`${title} ${location} ${description}`);
    const techStack = window.JobTrackerGenericScraper.extractTechStack(`${title} ${description}`);

    return {
      title: title || 'Vacante en Torre.ai',
      company: company || 'Empresa Confidencial',
      location: location,
      workMode: workMode,
      salary: salary,
      description: description,
      techStack: techStack,
      url: window.location.href,
      portal: 'Torre.ai',
      recruiterName: '',
      recruiterProfile: '',
      postedDate: new Date().toISOString().split('T')[0]
    };
  }
};
