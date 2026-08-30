/**
 * InfoJobs Job Scraper
 * Extracts vacancies from infojobs.net
 */

window.JobTrackerInfoJobsScraper = {
  name: 'InfoJobs',

  detect: function() {
    return window.location.hostname.includes('infojobs.net');
  },

  scrape: function() {
    const titleEl = document.querySelector(
      'h1.heading-1, h1.ij-OfferDetail-title, h1[class*="title"]'
    );
    const title = titleEl?.innerText?.trim() || '';

    const companyEl = document.querySelector(
      '.ij-OfferDetail-companyName, a[href*="/empresa-"], .link[href*="empresa"]'
    );
    const company = companyEl?.innerText?.trim() || '';

    const locationEl = document.querySelector(
      '.ij-OfferDetail-location, .ij-ComponentList li:first-child, [class*="location"]'
    );
    const location = locationEl?.innerText?.trim() || 'Remoto';

    const salaryEl = document.querySelector(
      '.ij-OfferDetail-salary, [class*="salary"], span:has(svg)'
    );
    const salary = salaryEl?.innerText?.trim() || '';

    const descEl = document.querySelector(
      '#pref-description, .ij-OfferDetail-description, [class*="description"]'
    );
    const description = descEl?.innerText?.trim() || '';

    const workMode = window.JobTrackerGenericScraper.detectWorkMode(`${title} ${location} ${description}`);
    const techStack = window.JobTrackerGenericScraper.extractTechStack(`${title} ${description}`);

    return {
      title: title || 'Vacante en InfoJobs',
      company: company || 'Empresa Confidencial',
      location: location,
      workMode: workMode,
      salary: salary,
      description: description,
      techStack: techStack,
      url: window.location.href,
      portal: 'InfoJobs',
      recruiterName: '',
      recruiterProfile: '',
      postedDate: new Date().toISOString().split('T')[0]
    };
  }
};
