/**
 * Glassdoor Job Scraper
 */

window.JobTrackerGlassdoorScraper = {
  name: 'Glassdoor',

  detect: function() {
    return window.location.hostname.includes('glassdoor.');
  },

  scrape: function() {
    const titleEl = document.querySelector(
      'h1.JobDetails_jobTitle__rw_gn, h1[class*="jobTitle"], h1[data-test="job-title"], h1'
    );
    const title = titleEl?.innerText?.trim() || '';

    const companyEl = document.querySelector(
      'h4.EmployerProfile_employerName__8aAaf, [data-test="employer-name"], a.EmployerProfile_profileLink__8aAaf, [class*="employerName"]'
    );
    const company = companyEl?.innerText?.trim() || '';

    const locationEl = document.querySelector(
      'div.JobDetails_location__mSg5h, [data-test="location"], [class*="location"]'
    );
    const location = locationEl?.innerText?.trim() || 'Remoto';

    const salaryEl = document.querySelector(
      'div.JobDetails_salary__m_XvP, [data-test="detailSalary"], [class*="salary"]'
    );
    const salary = salaryEl?.innerText?.trim() || '';

    const descEl = document.querySelector(
      'div.JobDetails_jobDescription__uW_fK, #JobDescriptionContainer, [class*="jobDescriptionContent"]'
    );
    const description = descEl?.innerText?.trim() || '';

    const workMode = window.JobTrackerGenericScraper.detectWorkMode(`${title} ${location} ${description}`);
    const techStack = window.JobTrackerGenericScraper.extractTechStack(`${title} ${description}`);

    return {
      title: title || 'Vacante en Glassdoor',
      company: company || 'Empresa Confidencial',
      location: location,
      workMode: workMode,
      salary: salary,
      description: description,
      techStack: techStack,
      url: window.location.href,
      portal: 'Glassdoor',
      recruiterName: '',
      recruiterProfile: '',
      postedDate: new Date().toISOString().split('T')[0]
    };
  }
};
