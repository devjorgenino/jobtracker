/**
 * Get on Board Job Scraper (getonbrd.com / getonbrd.cl / getonbrd.pe / etc.)
 * Great platform for remote tech jobs in Latin America and globally.
 */

window.JobTrackerGetOnBrdScraper = {
  name: 'Get on Board',

  detect: function() {
    return window.location.hostname.includes('getonbrd.');
  },

  scrape: function() {
    const titleEl = document.querySelector(
      'h1.gb-landing-header__title, h1.job-title, h1[itemprop="title"], h1'
    );
    const title = titleEl?.innerText?.trim() || '';

    const companyEl = document.querySelector(
      '.gb-landing-header__company a, strong[itemprop="hiringOrganization"], .company-name'
    );
    const company = companyEl?.innerText?.trim() || '';

    const locationEl = document.querySelector(
      '.gb-landing-header__location, .badge-remote, .job-location, [itemprop="jobLocation"]'
    );
    const location = locationEl?.innerText?.trim() || 'Remoto';

    const salaryEl = document.querySelector(
      '.gb-landing-header__salary, .salary, [itemprop="baseSalary"]'
    );
    const salary = salaryEl?.innerText?.trim() || '';

    const descEl = document.querySelector(
      '#job-body, [itemprop="description"], .job-body'
    );
    const description = descEl?.innerText?.trim() || '';

    // Extract tags from Get on Board badge list
    const tags = Array.from(document.querySelectorAll('.gb-tags a, .tag, .badge')).map(el => el.innerText.trim()).filter(Boolean);
    const extractedTech = window.JobTrackerGenericScraper.extractTechStack(`${title} ${description} ${tags.join(' ')}`);
    const allTech = Array.from(new Set([...tags, ...extractedTech])).slice(0, 15);

    const workMode = window.JobTrackerGenericScraper.detectWorkMode(`${title} ${location} ${description}`);

    return {
      title: title || 'Vacante en Get on Board',
      company: company || 'Empresa Confidencial',
      location: location,
      workMode: workMode,
      salary: salary,
      description: description,
      techStack: allTech,
      url: window.location.href,
      portal: 'Get on Board',
      recruiterName: '',
      recruiterProfile: '',
      postedDate: new Date().toISOString().split('T')[0]
    };
  }
};
