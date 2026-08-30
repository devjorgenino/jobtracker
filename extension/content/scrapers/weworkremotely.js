/**
 * We Work Remotely & RemoteOK Scraper
 */

window.JobTrackerWWRScraper = {
  name: 'We Work Remotely',

  detect: function() {
    return window.location.hostname.includes('weworkremotely.com') || window.location.hostname.includes('remoteok.com');
  },

  scrape: function() {
    const isWWR = window.location.hostname.includes('weworkremotely.com');
    
    let title = '';
    let company = '';
    let location = '100% Remoto';
    let salary = '';
    let description = '';

    if (isWWR) {
      title = document.querySelector('h1, .listing-header-container h1')?.innerText?.trim() || '';
      company = document.querySelector('.company-card h2, .company-name, .listing-header-container h2 a')?.innerText?.trim() || '';
      const regionEl = document.querySelector('.region, .listing-tag');
      if (regionEl) location = regionEl.innerText.trim();
      description = document.querySelector('#job-details, .listing-container')?.innerText?.trim() || '';
    } else {
      // RemoteOK
      title = document.querySelector('h2[itemprop="title"], h1')?.innerText?.trim() || '';
      company = document.querySelector('h3[itemprop="name"], .company')?.innerText?.trim() || '';
      location = document.querySelector('.location')?.innerText?.trim() || 'Remoto';
      salary = document.querySelector('.salary')?.innerText?.trim() || '';
      description = document.querySelector('.description, [itemprop="description"]')?.innerText?.trim() || '';
    }

    const techStack = window.JobTrackerGenericScraper.extractTechStack(`${title} ${description}`);

    return {
      title: title || 'Vacante Remota',
      company: company || 'Empresa Confidencial',
      location: location,
      workMode: 'Remoto',
      salary: salary,
      description: description,
      techStack: techStack,
      url: window.location.href,
      portal: isWWR ? 'We Work Remotely' : 'RemoteOK',
      recruiterName: '',
      recruiterProfile: '',
      postedDate: new Date().toISOString().split('T')[0]
    };
  }
};
