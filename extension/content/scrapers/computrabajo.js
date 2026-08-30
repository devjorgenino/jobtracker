/**
 * CompuTrabajo Job Scraper
 * Extracts vacancies across all LATAM CompuTrabajo domains (.com, .com.co, .com.mx, .com.ar, .pe, etc.)
 */

window.JobTrackerCompuTrabajoScraper = {
  name: 'CompuTrabajo',

  detect: function() {
    return window.location.hostname.includes('computrabajo.');
  },

  scrape: function() {
    const titleEl = document.querySelector(
      'h1.title_offer, h1.fs24, h1[class*="title"], h1'
    );
    const title = titleEl?.innerText?.trim() || '';

    const companyEl = document.querySelector(
      'a.link[href*="/empresas/"], p.fs16 a, .fs16.fc_base, [class*="company"]'
    );
    const company = companyEl?.innerText?.trim() || '';

    const locationEl = document.querySelector(
      'p.fs14.fc_sub, .fs14.fc_base, [class*="location"]'
    );
    const location = locationEl?.innerText?.trim() || 'Remoto';

    const salaryEl = document.querySelector(
      'span.tag.fc_base, .fs14.fw_bold, [class*="salary"]'
    );
    const salary = salaryEl?.innerText?.trim() || '';

    const descEl = document.querySelector(
      '.box_detail, .box_border .fs16, .box_border, [class*="description"]'
    );
    const description = descEl?.innerText?.trim() || '';

    const workMode = window.JobTrackerGenericScraper.detectWorkMode(`${title} ${location} ${description}`);
    const techStack = window.JobTrackerGenericScraper.extractTechStack(`${title} ${description}`);

    return {
      title: title || 'Vacante en CompuTrabajo',
      company: company || 'Empresa Confidencial',
      location: location,
      workMode: workMode,
      salary: salary,
      description: description,
      techStack: techStack,
      url: window.location.href,
      portal: 'CompuTrabajo',
      recruiterName: '',
      recruiterProfile: '',
      postedDate: new Date().toISOString().split('T')[0]
    };
  }
};
