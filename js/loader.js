/**
 * Portfolio Data Loader — John Valentine
 * Fetches JSON data files and populates the page dynamically
 */

'use strict';

const PortfolioLoader = (() => {

  // ─── Fetch Helpers ──────────────────────────────────────────────────────────

  async function fetchJSON(file) {
    try {
      const res = await fetch(`./data/${file}.json?v=${Date.now()}`, { cache: 'no-cache' });
      return res.ok ? await res.json() : null;
    } catch { return null; }
  }

  function set(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    if (dateStr.toLowerCase() === 'present') return 'Present';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  function dateRange(start, end) {
    return `${formatDate(start)} — ${formatDate(end)}`;
  }

  // ─── Social Links Icon Map ───────────────────────────────────────────────────

  const ICON_MAP = {
    'logo-linkedin':  'bi bi-linkedin',
    'logo-github':    'bi bi-github',
    'logo-twitter':   'bi bi-twitter-x',
    'logo-whatsapp':  'bi bi-whatsapp',
    'logo-instagram': 'bi bi-instagram',
    'logo-facebook':  'bi bi-facebook',
  };

  function socialIcon(icon) {
    return ICON_MAP[icon] || `bi bi-${icon.replace('logo-','')}`;
  }

  // ─── Personal ───────────────────────────────────────────────────────────────

  function loadPersonal(p) {
    if (!p) return;

    // Hero
    if (p.name) {
      const parts = p.name.split(' ');
      const first = parts[0], rest = parts.slice(1).join(' ');
      set('dyn-name', `${first}<span class="accent-text"> ${rest}</span>`);
    }
    // dyn-title removed — title is now handled by typed.js animation
    if (p.bio?.length) set('dyn-bio', p.bio[0]);

    // About section — use bio[1], split on natural paragraph breaks (\n\n)
    if (p.bio?.length) {
      const bioText = p.bio[1] || p.bio[0] || '';
      const paras = bioText
        .split(/\n\n+/)
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => `<p>${s}</p>`)
        .join('');
      set('dyn-about-bio', paras);
    }
    if (p.title)    set('dyn-specialization',  p.title);
    if (p.location) set('dyn-location-label',  p.location);

    // Hero social links
    if (p.socialLinks?.length) {
      set('dyn-hero-social', p.socialLinks.map(l =>
        `<a href="${l.url}" target="_blank" rel="noopener"><i class="${socialIcon(l.icon)}"></i></a>`
      ).join(''));
    }

    // Sidebar social links
    if (p.socialLinks?.length) {
      set('dyn-sidebar-social', p.socialLinks.map(l =>
        `<a href="${l.url}" class="${l.platform?.toLowerCase()}" target="_blank" rel="noopener">
          <i class="${socialIcon(l.icon)}"></i></a>`
      ).join(''));
    }

    // About card
    set('dyn-about-name', p.name || '');
    set('dyn-profession', p.title || '');
    if (p.avatarLarge || p.avatar) {
      const img = document.getElementById('dyn-avatar');
      if (img) { img.src = p.avatarLarge || p.avatar; img.alt = p.name || ''; }
    }

    // About contact links
    const contactLinks = [
      p.email    ? `<a href="mailto:${p.email}" class="contact-item"><i class="bi bi-envelope"></i><span>${p.email}</span></a>` : '',
      p.phone    ? `<a href="tel:${p.phone}" class="contact-item"><i class="bi bi-telephone"></i>${p.phone}</a>` : '',
      p.location ? `<a href="#" class="contact-item"><i class="bi bi-geo-alt"></i>${p.location}</a>` : '',
    ].join('');
    set('dyn-contact-links', contactLinks);

    // Resume sidebar contact — removed (sidebar now has static skills)
    // Resume summary — removed

    // Contact section info items
    const infoItems = [
      p.location ? `<div class="info-item"><div class="icon-box"><i class="bi bi-geo-alt"></i></div><div class="content"><h4>Location</h4><p>${p.location}</p></div></div>` : '',
      p.phone    ? `<div class="info-item"><div class="icon-box"><i class="bi bi-telephone"></i></div><div class="content"><h4>Phone</h4><p><a href="tel:${p.phone}">${p.phone}</a></p></div></div>` : '',
      p.email    ? `<div class="info-item"><div class="icon-box"><i class="bi bi-envelope"></i></div><div class="content"><h4>Email</h4><p><a href="mailto:${p.email}">${p.email}</a></p></div></div>` : '',
      ...(p.socialLinks || []).map(l => `
        <div class="info-item">
          <div class="icon-box"><i class="${socialIcon(l.icon)}"></i></div>
          <div class="content"><h4>${l.platform}</h4><p><a href="${l.url}" target="_blank">${l.url.replace('https://','')}</a></p></div>
        </div>`),
    ].join('');

    const infoBox = document.getElementById('dyn-contact-info');
    if (infoBox) {
      const existing = infoBox.innerHTML;
      // Replace just the info items (keep header and intro p)
      const afterIntro = existing.indexOf('<div class="info-item">');
      if (afterIntro !== -1) {
        infoBox.innerHTML = existing.substring(0, afterIntro) + infoItems;
      }
    }
  }

  // ─── Experience ─────────────────────────────────────────────────────────────

  function loadExperience(experience) {
    if (!experience?.length) return;
    const html = [...experience].reverse().map(exp => {
      const ach = exp.achievements?.length
        ? `<ul>${exp.achievements.map(a => `<li>${a}</li>`).join('')}</ul>` : '';
      return `<div class="resume-item">
        <h4>${exp.position || ''}</h4>
        <h5>${dateRange(exp.startDate, exp.endDate)}</h5>
        <p class="company"><i class="bi bi-building"></i> ${exp.company || ''}</p>
        ${ach}
      </div>`;
    }).join('');

    const container = document.getElementById('dyn-experience');
    if (container) {
      container.innerHTML = html;
      // Remove old static resume-items after the container
      let next = container.nextElementSibling;
      while (next && next.classList?.contains('resume-item')) {
        const toRemove = next;
        next = next.nextElementSibling;
        toRemove.remove();
      }
    }
  }

  // ─── Education ──────────────────────────────────────────────────────────────

  function loadEducation(education) {
    if (!education?.length) return;

    // Update the "Get to Know Me" education label with the first degree
    const first = education[0];
    if (first) set('dyn-education-label', first.degree || first.institution || '');
    const html = education.map(edu => {
      const courses = edu.courses?.length
        ? `<p>${edu.courses.slice(0,3).join(' · ')}${edu.courses.length > 3 ? '…' : ''}</p>` : '';
      return `<div class="resume-item">
        <h4>${edu.degree || ''}</h4>
        <h5>${edu.period || ''}</h5>
        <p class="company"><i class="bi bi-building"></i> ${edu.institution || ''}</p>
        ${courses}
      </div>`;
    }).join('');

    const container = document.getElementById('dyn-education');
    if (container) {
      container.innerHTML = html;
      let next = container.nextElementSibling;
      while (next && next.classList?.contains('resume-item')) {
        const toRemove = next;
        next = next.nextElementSibling;
        toRemove.remove();
      }
    }
  }

  // ─── Certifications ─────────────────────────────────────────────────────────

  function loadCertifications(certs) {
    if (!certs?.length) return;
    const html = certs.map(c => `
      <div class="resume-item">
        <h4>${c.name || ''}</h4>
        <h5>${c.issueDate || ''}</h5>
        <p class="company"><i class="bi bi-building"></i> ${c.issuer || ''}</p>
        ${c.credentialId ? `<p><small>ID: ${c.credentialId}</small></p>` : ''}
      </div>`).join('');

    const container = document.getElementById('dyn-certifications');
    if (container) {
      container.innerHTML = html;
      let next = container.nextElementSibling;
      while (next && next.classList?.contains('resume-item')) {
        const toRemove = next;
        next = next.nextElementSibling;
        toRemove.remove();
      }
    }
  }

  // ─── Skills ─────────────────────────────────────────────────────────────────

  function loadSkills(skills) {
    // Skills are now rendered statically in the resume sidebar
    // No dynamic injection needed
  }

  // ─── Portfolio ──────────────────────────────────────────────────────────────

  const CATEGORY_FILTER = {
    'web3':                   'filter-web3',
    'web2':                   'filter-web2',
    'automation':             'filter-automation',
    'iot & embedded systems': 'filter-iot',
    'graphics design':        'filter-design',
  };

  const CATEGORY_LABEL = {
    'web3':                   'Web3',
    'web2':                   'Web2',
    'automation':             'Automation & Bots',
    'iot & embedded systems': 'IoT & Embedded',
    'graphics design':        'Graphics Design',
  };

  function loadPortfolio(projects) {
    if (!projects?.length) return;
    const container = document.getElementById('dyn-projects');
    if (!container) return;

    container.innerHTML = projects.map(p => {
      const filterClass = CATEGORY_FILTER[p.category] || 'filter-web2';
      const label = CATEGORY_LABEL[p.category] || p.category;
      return `
        <div class="col-lg-6 col-md-6 portfolio-item isotope-item ${filterClass}">
          <div class="portfolio-wrap">
            <img src="${p.image}" class="img-fluid" alt="${p.title}" loading="lazy" />
            <div class="portfolio-info">
              <div class="content">
                <span class="category">${label}</span>
                <h4>${p.title}</h4>
                <p style="color:#ccc;font-size:0.82rem;margin-bottom:12px">${p.description || ''}</p>
                <div class="portfolio-links">
                  <a href="${p.url}" target="_blank" rel="noopener" title="Visit"><i class="bi bi-arrow-right"></i></a>
                </div>
              </div>
            </div>
          </div>
        </div>`;
    }).join('');

    // Re-init isotope after injecting items
    if (typeof imagesLoaded !== 'undefined' && typeof Isotope !== 'undefined') {
      imagesLoaded(container, () => {
        const iso = new Isotope(container, {
          itemSelector: '.isotope-item',
          layoutMode: 'masonry',
          filter: '*',
        });
        // Re-bind filter buttons
        document.querySelectorAll('.isotope-filters li').forEach(btn => {
          btn.addEventListener('click', function () {
            document.querySelector('.isotope-filters .filter-active')?.classList.remove('filter-active');
            this.classList.add('filter-active');
            iso.arrange({ filter: this.dataset.filter });
          });
        });
      });
    }
  }

  // ─── Services ───────────────────────────────────────────────────────────────

  function loadServices(services) {
    if (!services?.length) return;
    const container = document.getElementById('dyn-services');
    if (!container) return;

    const ICONS = {
      'blockchain': 'bi-currency-bitcoin', 'dlt': 'bi-currency-bitcoin',
      'backend': 'bi-server',              'api': 'bi-server',
      'mobile': 'bi-phone',
      'embedded': 'bi-cpu',               'iot': 'bi-cpu',
      'automation': 'bi-robot',           'bot': 'bi-chat-dots',
      'design': 'bi-palette',
    };

    function pickIcon(title) {
      const t = title.toLowerCase();
      for (const [key, icon] of Object.entries(ICONS)) {
        if (t.includes(key)) return `bi ${icon}`;
      }
      return 'bi bi-hdd-stack';
    }

    const delays = [100, 200, 300, 100, 200, 300];
    container.innerHTML = services.map((svc, i) => {
      const icon = svc.icon?.startsWith('./') || svc.icon?.startsWith('assets')
        ? `<img src="${svc.icon}" width="40" alt="${svc.title}" />`
        : `<i class="${pickIcon(svc.title)}"></i>`;
      const [first, ...rest] = (svc.title || '').split(' ');
      return `
        <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="${delays[i] || 100}">
          <div class="service-card position-relative z-1">
            <div class="service-icon">${icon}</div>
            <a href="#contact" class="card-action d-flex align-items-center justify-content-center rounded-circle">
              <i class="bi bi-arrow-up-right"></i>
            </a>
            <h3>${first} <span>${rest.join(' ')}</span></h3>
            <p>${svc.description || ''}</p>
          </div>
        </div>`;
    }).join('');
  }

  // ─── Awards ─────────────────────────────────────────────────────────────────

  function loadAwards(awards) {
    if (!awards?.length) return;
    const container = document.getElementById('dyn-awards');
    if (!container) return;

    const delays = [100, 200, 300, 100, 200, 300];
    container.innerHTML = awards.map((a, i) => `
      <div class="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="${delays[i] || 100}">
        <div class="service-card position-relative z-1 text-center">
          ${a.image ? `<img src="${a.image}" alt="${a.title}" class="img-fluid rounded mb-3"
            style="max-height:180px;object-fit:cover;width:100%;">` : ''}
          <h3>${a.title || ''}</h3>
          <p>${a.description || ''}</p>
        </div>
      </div>`).join('');
  }

  // ─── Init ───────────────────────────────────────────────────────────────────

  async function init() {
    const [personal, experience, education, skills, projects, services, certifications, awards] =
      await Promise.all([
        fetchJSON('personal'), fetchJSON('experience'), fetchJSON('education'),
        fetchJSON('skills'),   fetchJSON('projects'),  fetchJSON('services'),
        fetchJSON('certifications'), fetchJSON('awards'),
      ]);

    loadPersonal(personal);
    loadExperience(experience);
    loadEducation(education);
    loadCertifications(certifications);
    loadSkills(skills);
    loadPortfolio(projects);
    loadServices(services);
    loadAwards(awards);

    // Dynamic stats
    if (projects?.length) set('dyn-stat-projects', projects.length + '+');
    if (awards?.length)   set('dyn-stat-awards',   awards.length + '');
  }

  return { init };

})();

document.addEventListener('DOMContentLoaded', PortfolioLoader.init);
