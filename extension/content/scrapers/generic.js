/**
 * Generic Smart Job Scraper
 * Extracts job information from any webpage using JSON-LD, OpenGraph, microdata, and DOM heuristics.
 */

window.JobTrackerGenericScraper = {
  name: 'Generic',
  
  detect: function() {
    // Generic is the fallback for any page
    return true;
  },

  extractTechStack: function(text) {
    if (!text) return [];
    const techPatterns = [
      'JavaScript', 'TypeScript', 'React', 'React Native', 'Next.js', 'Vue', 'Vue.js', 'Angular',
      'Node.js', 'NodeJS', 'Express', 'NestJS', 'Python', 'Django', 'FastAPI', 'Flask',
      'Java', 'Spring Boot', 'Spring', 'C#', '.NET', 'ASP.NET', 'Golang', 'Go', 'Rust', 'PHP', 'Laravel',
      'Ruby', 'Ruby on Rails', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL',
      'REST API', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'CI/CD', 'Git', 'GitHub',
      'TailwindCSS', 'Tailwind', 'Sass', 'CSS3', 'HTML5', 'Redux', 'Zustand', 'Prisma', 'TypeORM',
      'Terraform', 'Linux', 'Microservices', 'Scrum', 'Agile', 'Jira', 'Figma'
    ];
    
    const found = new Set();
    const lowerText = text.toLowerCase();
    
    for (const tech of techPatterns) {
      const regex = new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(text)) {
        found.add(tech);
      }
    }
    return Array.from(found);
  },

  detectWorkMode: function(text) {
    if (!text) return 'Remoto';
    const lower = text.toLowerCase();
    if (lower.includes('remoto') || lower.includes('remote') || lower.includes('100% remoto') || lower.includes('teletrabajo') || lower.includes('anywhere')) {
      return 'Remoto';
    }
    if (lower.includes('híbrido') || lower.includes('hibrido') || lower.includes('hybrid')) {
      return 'Híbrido';
    }
    if (lower.includes('presencial') || lower.includes('on-site') || lower.includes('onsite')) {
      return 'Presencial';
    }
    return 'Remoto';
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
            if (item.applicantLocationRequirements) {
              const req = item.applicantLocationRequirements.name || '';
              if (req) locationStr = locationStr ? `${locationStr} (${req})` : req;
            }
            if (item.jobLocationType === 'TELECOMMUTE') {
              locationStr = locationStr ? `Remoto - ${locationStr}` : 'Remoto';
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

            // Description HTML to clean text
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = item.description || '';
            const cleanDesc = tempDiv.textContent || tempDiv.innerText || '';

            return {
              title: item.title || '',
              company: typeof org === 'string' ? org : (org.name || ''),
              location: locationStr || 'Remoto',
              salary: salaryStr || '',
              description: cleanDesc.trim(),
              postedDate: item.datePosted || '',
              deadline: item.validThrough || '',
              employmentType: item.employmentType || 'Full-time'
            };
          }
        }
      } catch (e) {
        // Continue to next script
      }
    }
    return null;
  },

  scrape: function() {
    // 1. Try JSON-LD first (most reliable semantic data)
    const jsonLd = this.extractJsonLd();
    
    // 2. DOM heuristics
    const h1 = document.querySelector('h1')?.innerText?.trim() || '';
    const pageTitle = document.title || '';
    
    // Company heuristics
    let company = jsonLd?.company || '';
    if (!company) {
      const companyEl = document.querySelector('[data-company], .company-name, .employer-name, .company, [class*="company"], [class*="employer"]');
      if (companyEl) company = companyEl.innerText?.trim() || '';
    }

    // Title heuristics
    let title = jsonLd?.title || h1;
    if (!title && pageTitle) {
      title = pageTitle.split(/[-|–•]/)[0].trim();
    }

    // Description heuristics
    let description = jsonLd?.description || '';
    if (!description || description.length < 50) {
      const descEl = document.querySelector('[data-description], #job-description, .job-description, .description, [class*="job-description"], [class*="jobDescription"], article, main');
      if (descEl) {
        description = descEl.innerText?.trim() || '';
      }
    }
    if (!description) {
      description = document.body.innerText?.slice(0, 5000) || '';
    }

    // Location heuristics
    let location = jsonLd?.location || '';
    if (!location) {
      const locEl = document.querySelector('[data-location], .location, .job-location, [class*="location"]');
      location = locEl?.innerText?.trim() || 'Remoto';
    }

    // Salary heuristics
    let salary = jsonLd?.salary || '';
    if (!salary) {
      const salaryEl = document.querySelector('[data-salary], .salary, .compensation, [class*="salary"]');
      if (salaryEl) salary = salaryEl.innerText?.trim() || '';
      else {
        const salaryMatch = description.match(/(\$|€|£|USD|COP|MXN|ARS)\s?(\d{1,3}[.,\d]*k?)\s*(-|a|to)\s*(\$|€|£|USD|COP|MXN|ARS)?\s?(\d{1,3}[.,\d]*k?)/i);
        if (salaryMatch) salary = salaryMatch[0];
      }
    }

    const workMode = this.detectWorkMode(`${title} ${location} ${description}`);
    const techStack = this.extractTechStack(`${title} ${description}`);

    return {
      title: title || 'Vacante Detectada',
      company: company || 'Empresa Confidencial',
      location: location || 'Remoto',
      workMode: workMode,
      salary: salary || '',
      description: description,
      techStack: techStack,
      url: window.location.href,
      portal: new URL(window.location.href).hostname.replace('www.', ''),
      recruiterName: '',
      recruiterProfile: '',
      postedDate: jsonLd?.postedDate || new Date().toISOString().split('T')[0],
      deadline: jsonLd?.deadline || ''
    };
  }
};
