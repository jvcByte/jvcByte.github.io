/**
 * Portfolio CMS — John Valentine
 * Manages content via GitHub API with local JSON editing
 */

'use strict';

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_PASSWORD = 'jvc@cms2026';
const DATA_FILES = ['personal','experience','education','skills','projects','services','certifications','awards','blog'];

// ─── State ────────────────────────────────────────────────────────────────────

const state = {
  data: {},
  github: {},
  dirty: new Set(),
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

function getPassword() {
  return localStorage.getItem('cms_password') || DEFAULT_PASSWORD;
}

function initAuth() {
  const gate = document.getElementById('auth-gate');
  const app  = document.getElementById('cms-app');
  const btn  = document.getElementById('auth-btn');
  const inp  = document.getElementById('cms-password');
  const err  = document.getElementById('auth-error');

  if (localStorage.getItem('cms_authed') === 'true') {
    gate.style.display = 'none';
    app.style.display  = 'flex';
    initApp();
    return;
  }

  btn.addEventListener('click', () => authenticate(inp, err, gate, app));
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') authenticate(inp, err, gate, app); });
}

function authenticate(inp, err, gate, app) {
  if (inp.value === getPassword()) {
    localStorage.setItem('cms_authed', 'true');
    gate.style.display = 'none';
    app.style.display  = 'flex';
    err.style.display  = 'none';
    initApp();
  } else {
    err.style.display = 'block';
    inp.value = '';
    inp.focus();
  }
}

function logout() {
  localStorage.removeItem('cms_authed');
  location.reload();
}

// ─── App Init ─────────────────────────────────────────────────────────────────

async function initApp() {
  state.github = loadGithubConfig();
  setupNavigation();
  setupSidebar();
  setupSaveButton();
  setupLogout();
  await loadAllData();
  renderAll();
  initSettings();
}

// ─── Navigation ───────────────────────────────────────────────────────────────

const SECTION_TITLES = {
  personal: 'Personal Information', experience: 'Work Experience',
  education: 'Education', skills: 'Skills',
  projects: 'Projects', services: 'Services',
  certifications: 'Certifications', awards: 'Awards & Recognition',
  blog: 'Blog Posts', settings: 'Settings',
};

function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.cms-section').forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`section-${section}`).classList.add('active');
      document.getElementById('section-title').textContent = SECTION_TITLES[section];
    });
  });
}

function setupSidebar() {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.cms-sidebar');
  const main = document.querySelector('.cms-main');
  toggle?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
}

function setupLogout() {
  document.getElementById('logout-btn')?.addEventListener('click', logout);
}

// ─── Data Loading ─────────────────────────────────────────────────────────────

async function loadAllData() {
  await Promise.all(DATA_FILES.map(async file => {
    try {
      const res = await fetch(`./data/${file}.json?v=${Date.now()}`, { cache: 'no-cache' });
      if (res.ok) state.data[file] = await res.json();
      else         state.data[file] = getDefaultData(file);
    } catch {
      state.data[file] = getDefaultData(file);
    }
  }));
  ensureDataStructure();
}

function getDefaultData(file) {
  const defaults = {
    personal: { name:'', title:'', email:'', phone:'', location:'', avatar:'', avatarLarge:'', bio:['',''], socialLinks:[] },
    experience: [], education: [], skills: { aboutSkills:[], resumeSkills:[] },
    projects: [], services: [], certifications: [], awards: [], blog: [],
  };
  return defaults[file] ?? [];
}

function ensureDataStructure() {
  if (!state.data.personal.socialLinks)   state.data.personal.socialLinks = [];
  if (!state.data.personal.bio)           state.data.personal.bio = ['',''];
  if (!state.data.skills.aboutSkills)     state.data.skills.aboutSkills = [];
  if (!state.data.skills.resumeSkills)    state.data.skills.resumeSkills = [];
  ['experience','education','certifications','awards','blog','projects','services'].forEach(k => {
    if (!Array.isArray(state.data[k])) state.data[k] = [];
  });
  state.data.experience.forEach(e => { if (!e.achievements) e.achievements = []; });
  state.data.education.forEach(e  => { if (!e.courses)      e.courses = []; });
}

// ─── Render All ───────────────────────────────────────────────────────────────

function renderAll() {
  renderPersonal();
  renderList('experience', renderExperienceItem);
  renderList('education',  renderEducationItem);
  renderSkills();
  renderList('projects',   renderProjectItem);
  renderList('services',   renderServiceItem);
  renderList('certifications', renderCertItem);
  renderList('awards',     renderAwardItem);
  renderList('blog',       renderBlogItem);
  setupAddButtons();
  setupProjectFilter();
}

// ─── Personal ─────────────────────────────────────────────────────────────────

function renderPersonal() {
  const p = state.data.personal;
  document.getElementById('p-name').value        = p.name        || '';
  document.getElementById('p-email').value       = p.email       || '';
  document.getElementById('p-phone').value       = p.phone       || '';
  document.getElementById('p-location').value    = p.location    || '';
  document.getElementById('p-avatar').value      = p.avatar      || '';
  document.getElementById('p-avatarLarge').value = p.avatarLarge || '';
  document.getElementById('p-bio-0').value       = p.bio?.[0]    || '';
  document.getElementById('p-bio-1').value       = p.bio?.[1]    || '';

  // bind changes
  ['name','email','phone','location','avatar','avatarLarge'].forEach(f => {
    const el = document.getElementById(`p-${f}`);
    el.oninput = () => { state.data.personal[f] = el.value; markDirty('personal'); };
  });
  ['0','1'].forEach(i => {
    const el = document.getElementById(`p-bio-${i}`);
    el.oninput = () => { state.data.personal.bio[+i] = el.value; markDirty('personal'); };
  });

  renderSocialLinks();
}

function renderSocialLinks() {
  const container = document.getElementById('social-list');
  container.innerHTML = '';
  (state.data.personal.socialLinks || []).forEach((link, i) => {
    const div = document.createElement('div');
    div.className = 'list-item';
    div.innerHTML = `
      <div class="form-grid">
        <div class="form-group"><label>Platform</label>
          <input type="text" value="${esc(link.platform)}" data-field="platform" data-index="${i}" /></div>
        <div class="form-group"><label>URL</label>
          <input type="url" value="${esc(link.url)}" data-field="url" data-index="${i}" /></div>
        <div class="form-group"><label>Icon (bootstrap-icons name)</label>
          <input type="text" value="${esc(link.icon)}" data-field="icon" data-index="${i}" /></div>
      </div>
      <button class="btn-danger btn-sm remove-social" data-index="${i}"><i class="bi bi-trash"></i> Remove</button>`;
    div.querySelectorAll('input').forEach(inp => {
      inp.oninput = () => {
        state.data.personal.socialLinks[+inp.dataset.index][inp.dataset.field] = inp.value;
        markDirty('personal');
      };
    });
    div.querySelector('.remove-social').onclick = () => {
      state.data.personal.socialLinks.splice(i, 1);
      markDirty('personal');
      renderSocialLinks();
    };
    container.appendChild(div);
  });
}

// ─── Generic List Renderer ────────────────────────────────────────────────────

function renderList(key, itemRenderer) {
  const container = document.getElementById(`${key}-list`);
  if (!container) return;
  container.innerHTML = '';
  const items = Array.isArray(state.data[key]) ? state.data[key] : [];
  items.forEach((item, i) => container.appendChild(itemRenderer(item, i, key)));
}

// ─── Experience ───────────────────────────────────────────────────────────────

function renderExperienceItem(exp, i) {
  const div = makeCard(`${exp.position || 'Experience ' + (i+1)} — ${exp.company || ''}`, i, 'experience');
  div.querySelector('.list-item-body').innerHTML = `
    <div class="form-grid">
      ${field('Position', 'text', exp.position, `experience.${i}.position`)}
      ${field('Company',  'text', exp.company,  `experience.${i}.company`)}
      ${field('Start Date', 'date', exp.startDate, `experience.${i}.startDate`)}
      ${field('End Date (or "present")', 'text', exp.endDate, `experience.${i}.endDate`)}
    </div>
    <div class="form-group"><label>Achievements</label>
      <div class="sub-list" id="ach-${i}"></div>
      <button class="btn-secondary btn-sm mt-2 add-ach" data-exp="${i}"><i class="bi bi-plus"></i> Add Achievement</button>
    </div>`;
  bindFields(div, 'experience');
  renderAchievements(i, exp.achievements || []);
  div.querySelector('.add-ach').onclick = () => {
    state.data.experience[i].achievements.push('');
    markDirty('experience');
    renderAchievements(i, state.data.experience[i].achievements);
  };
  return div;
}

function renderAchievements(expIdx, achievements) {
  const container = document.getElementById(`ach-${expIdx}`);
  if (!container) return;
  container.innerHTML = '';
  achievements.forEach((ach, j) => {
    const row = document.createElement('div');
    row.className = 'sub-item';
    row.innerHTML = `<input type="text" value="${esc(ach)}" />
      <button class="btn-danger btn-sm"><i class="bi bi-x"></i></button>`;
    row.querySelector('input').oninput = e => {
      state.data.experience[expIdx].achievements[j] = e.target.value;
      markDirty('experience');
    };
    row.querySelector('button').onclick = () => {
      state.data.experience[expIdx].achievements.splice(j, 1);
      markDirty('experience');
      renderAchievements(expIdx, state.data.experience[expIdx].achievements);
    };
    container.appendChild(row);
  });
}

// ─── Education ────────────────────────────────────────────────────────────────

function renderEducationItem(edu, i) {
  const div = makeCard(`${edu.institution || 'Education ' + (i+1)}`, i, 'education');
  div.querySelector('.list-item-body').innerHTML = `
    <div class="form-grid">
      ${field('Institution', 'text', edu.institution, `education.${i}.institution`)}
      ${field('Degree',      'text', edu.degree,      `education.${i}.degree`)}
      ${field('Period',      'text', edu.period,       `education.${i}.period`)}
    </div>
    <div class="form-group"><label>Courses</label>
      <div class="sub-list" id="courses-${i}"></div>
      <button class="btn-secondary btn-sm mt-2 add-course" data-edu="${i}"><i class="bi bi-plus"></i> Add Course</button>
    </div>`;
  bindFields(div, 'education');
  renderCourses(i, edu.courses || []);
  div.querySelector('.add-course').onclick = () => {
    state.data.education[i].courses.push('');
    markDirty('education');
    renderCourses(i, state.data.education[i].courses);
  };
  return div;
}

function renderCourses(eduIdx, courses) {
  const container = document.getElementById(`courses-${eduIdx}`);
  if (!container) return;
  container.innerHTML = '';
  courses.forEach((c, j) => {
    const row = document.createElement('div');
    row.className = 'sub-item';
    row.innerHTML = `<input type="text" value="${esc(c)}" />
      <button class="btn-danger btn-sm"><i class="bi bi-x"></i></button>`;
    row.querySelector('input').oninput = e => {
      state.data.education[eduIdx].courses[j] = e.target.value;
      markDirty('education');
    };
    row.querySelector('button').onclick = () => {
      state.data.education[eduIdx].courses.splice(j, 1);
      markDirty('education');
      renderCourses(eduIdx, state.data.education[eduIdx].courses);
    };
    container.appendChild(row);
  });
}

// ─── Skills ───────────────────────────────────────────────────────────────────

function renderSkills() {
  renderSkillList('aboutSkills',  'about-skills-list');
  renderSkillList('resumeSkills', 'resume-skills-list');
  document.querySelectorAll('.add-skill-btn').forEach(btn => {
    btn.onclick = () => {
      const type = btn.dataset.type;
      state.data.skills[type].push('');
      markDirty('skills');
      renderSkillList(type, type === 'aboutSkills' ? 'about-skills-list' : 'resume-skills-list');
    };
  });
}

function renderSkillList(type, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  (state.data.skills[type] || []).forEach((skill, i) => {
    const row = document.createElement('div');
    row.className = 'skill-row';
    row.innerHTML = `<input type="text" value="${esc(skill)}" />
      <button class="btn-danger btn-sm"><i class="bi bi-x"></i></button>`;
    row.querySelector('input').oninput = e => {
      state.data.skills[type][i] = e.target.value;
      markDirty('skills');
    };
    row.querySelector('button').onclick = () => {
      state.data.skills[type].splice(i, 1);
      markDirty('skills');
      renderSkillList(type, containerId);
    };
    container.appendChild(row);
  });
}

// ─── Projects ─────────────────────────────────────────────────────────────────

function renderProjectItem(proj, i) {
  const div = makeCard(proj.title || `Project ${i+1}`, i, 'projects');
  div.dataset.category = proj.category || '';
  div.querySelector('.list-item-body').innerHTML = `
    <div class="form-grid">
      ${field('Title',       'text', proj.title,       `projects.${i}.title`)}
      ${fieldSelect('Category', proj.category, `projects.${i}.category`, [
        ['web2','Web2'], ['web3','Web3'],
        ['automation','Automation & Bots'],
        ['iot & embedded systems','IoT & Embedded Systems'],
        ['graphics design','Graphics Design']
      ])}
      ${field('URL',         'url',  proj.url,         `projects.${i}.url`)}
      ${field('Image Path',  'text', proj.image,       `projects.${i}.image`)}
    </div>
    <div class="form-group"><label>Description</label>
      <textarea data-path="projects.${i}.description">${esc(proj.description)}</textarea></div>
    <div class="checkbox-row">
      <input type="checkbox" id="feat-${i}" ${proj.featured ? 'checked' : ''} data-path="projects.${i}.featured" data-bool />
      <label for="feat-${i}">Featured Project</label>
    </div>`;
  bindFields(div, 'projects');
  return div;
}

function setupProjectFilter() {
  const filter = document.getElementById('project-filter');
  filter?.addEventListener('change', () => {
    const val = filter.value;
    document.querySelectorAll('#projects-list .list-item').forEach(card => {
      card.style.display = (val === 'all' || card.dataset.category === val) ? '' : 'none';
    });
  });
}

// ─── Services ─────────────────────────────────────────────────────────────────

function renderServiceItem(svc, i) {
  const div = makeCard(svc.title || `Service ${i+1}`, i, 'services');
  div.querySelector('.list-item-body').innerHTML = `
    <div class="form-grid">
      ${field('Title',     'text', svc.title, `services.${i}.title`)}
      ${field('Icon Path', 'text', svc.icon,  `services.${i}.icon`)}
    </div>
    <div class="form-group"><label>Description</label>
      <textarea data-path="services.${i}.description">${esc(svc.description)}</textarea></div>`;
  bindFields(div, 'services');
  return div;
}

// ─── Certifications ───────────────────────────────────────────────────────────

function renderCertItem(cert, i) {
  const div = makeCard(cert.name || `Certification ${i+1}`, i, 'certifications');
  div.querySelector('.list-item-body').innerHTML = `
    <div class="form-grid">
      ${field('Name',          'text', cert.name,         `certifications.${i}.name`)}
      ${field('Issuer',        'text', cert.issuer,       `certifications.${i}.issuer`)}
      ${field('Issue Date',    'text', cert.issueDate,    `certifications.${i}.issueDate`)}
      ${field('Credential ID', 'text', cert.credentialId, `certifications.${i}.credentialId`)}
      ${field('Image Path',    'text', cert.image,        `certifications.${i}.image`)}
    </div>`;
  bindFields(div, 'certifications');
  return div;
}

// ─── Awards ───────────────────────────────────────────────────────────────────

function renderAwardItem(award, i) {
  const div = makeCard(award.title || `Award ${i+1}`, i, 'awards');
  div.querySelector('.list-item-body').innerHTML = `
    <div class="form-grid">
      ${field('Title',      'text', award.title, `awards.${i}.title`)}
      ${field('Image Path', 'text', award.image, `awards.${i}.image`)}
    </div>
    <div class="form-group"><label>Description</label>
      <textarea data-path="awards.${i}.description">${esc(award.description)}</textarea></div>`;
  bindFields(div, 'awards');
  return div;
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

function renderBlogItem(post, i) {
  const div = makeCard(post.title || `Post ${i+1}`, i, 'blog');
  div.querySelector('.list-item-body').innerHTML = `
    <div class="form-grid">
      ${field('Title',      'text', post.title,    `blog.${i}.title`)}
      ${field('Category',   'text', post.category, `blog.${i}.category`)}
      ${field('Date',       'date', post.date,     `blog.${i}.date`)}
      ${field('URL',        'url',  post.url,      `blog.${i}.url`)}
      ${field('Image Path', 'text', post.image,    `blog.${i}.image`)}
    </div>
    <div class="form-group"><label>Description</label>
      <textarea data-path="blog.${i}.description">${esc(post.description)}</textarea></div>`;
  bindFields(div, 'blog');
  return div;
}

// ─── Add Buttons ──────────────────────────────────────────────────────────────

function setupAddButtons() {
  const adds = {
    'add-social':        () => { state.data.personal.socialLinks.push({platform:'',url:'',icon:''}); markDirty('personal'); renderSocialLinks(); },
    'add-experience':    () => { state.data.experience.unshift({id:Date.now(),position:'',company:'',startDate:'',endDate:'',achievements:[]}); markDirty('experience'); renderList('experience', renderExperienceItem); },
    'add-education':     () => { state.data.education.unshift({id:Date.now(),institution:'',degree:'',period:'',courses:[]}); markDirty('education'); renderList('education', renderEducationItem); },
    'add-project':       () => { state.data.projects.unshift({id:Date.now(),title:'',category:'web2',description:'',image:'',url:'',featured:false}); markDirty('projects'); renderList('projects', renderProjectItem); },
    'add-service':       () => { state.data.services.push({id:Date.now(),title:'',description:'',icon:''}); markDirty('services'); renderList('services', renderServiceItem); },
    'add-certification': () => { state.data.certifications.push({id:Date.now(),name:'',issuer:'',issueDate:'',credentialId:'',image:''}); markDirty('certifications'); renderList('certifications', renderCertItem); },
    'add-award':         () => { state.data.awards.push({id:Date.now(),title:'',description:'',image:''}); markDirty('awards'); renderList('awards', renderAwardItem); },
    'add-blog':          () => { state.data.blog.unshift({id:Date.now(),title:'',category:'Blog',date:today(),description:'',image:'',url:'',featured:false}); markDirty('blog'); renderList('blog', renderBlogItem); },
  };
  Object.entries(adds).forEach(([id, fn]) => {
    document.getElementById(id)?.addEventListener('click', fn);
  });
}

// ─── Card Builder ─────────────────────────────────────────────────────────────

function makeCard(title, index, dataKey) {
  const div = document.createElement('div');
  div.className = 'list-item';
  div.innerHTML = `
    <div class="list-item-header">
      <h4>${esc(title)}</h4>
      <div class="item-actions">
        <button class="btn-secondary btn-sm toggle-btn"><i class="bi bi-chevron-down"></i></button>
        <button class="btn-danger btn-sm remove-btn"><i class="bi bi-trash"></i> Remove</button>
      </div>
    </div>
    <div class="list-item-body"></div>`;

  // Toggle collapse
  div.querySelector('.list-item-header').addEventListener('click', e => {
    if (e.target.closest('.remove-btn')) return;
    div.querySelector('.list-item-body').classList.toggle('collapsed');
    const icon = div.querySelector('.toggle-btn i');
    icon.className = icon.className.includes('down') ? 'bi bi-chevron-up' : 'bi bi-chevron-down';
  });

  // Remove
  div.querySelector('.remove-btn').addEventListener('click', () => {
    if (!confirm(`Remove "${title}"?`)) return;
    const arr = Array.isArray(state.data[dataKey]) ? state.data[dataKey] : null;
    if (arr) { arr.splice(index, 1); markDirty(dataKey); }
    const renderers = {
      experience: renderExperienceItem, education: renderEducationItem,
      projects: renderProjectItem,      services:  renderServiceItem,
      certifications: renderCertItem,   awards:    renderAwardItem,
      blog: renderBlogItem,
    };
    if (renderers[dataKey]) renderList(dataKey, renderers[dataKey]);
  });

  return div;
}

// ─── Field Helpers ────────────────────────────────────────────────────────────

function field(label, type, value, path) {
  return `<div class="form-group"><label>${label}</label>
    <input type="${type}" value="${esc(value)}" data-path="${path}" /></div>`;
}

function fieldSelect(label, value, path, options) {
  const opts = options.map(([v,l]) => `<option value="${v}" ${value===v?'selected':''}>${l}</option>`).join('');
  return `<div class="form-group"><label>${label}</label>
    <select data-path="${path}">${opts}</select></div>`;
}

function bindFields(container, dataKey) {
  container.querySelectorAll('[data-path]').forEach(el => {
    const handler = () => {
      setByPath(state.data, el.dataset.path, el.dataset.bool ? el.checked : el.value);
      markDirty(dataKey);
    };
    el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', handler);
  });
}

function setByPath(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
  cur[parts[parts.length - 1]] = value;
}

// ─── Settings ─────────────────────────────────────────────────────────────────

function loadGithubConfig() {
  try { return JSON.parse(localStorage.getItem('cms_github') || '{}'); }
  catch { return {}; }
}

function saveGithubConfig(cfg) {
  localStorage.setItem('cms_github', JSON.stringify(cfg));
  state.github = cfg;
}

function initSettings() {
  const g = state.github;
  document.getElementById('gh-owner').value  = g.owner  || '';
  document.getElementById('gh-repo').value   = g.repo   || '';
  document.getElementById('gh-branch').value = g.branch || 'main';
  document.getElementById('gh-token').value  = g.token  || '';

  document.getElementById('save-settings').addEventListener('click', () => {
    saveGithubConfig({
      owner:  document.getElementById('gh-owner').value.trim(),
      repo:   document.getElementById('gh-repo').value.trim(),
      branch: document.getElementById('gh-branch').value.trim() || 'main',
      token:  document.getElementById('gh-token').value.trim(),
    });
    toast('Settings saved', 'success');
  });

  document.getElementById('test-connection').addEventListener('click', testConnection);

  document.getElementById('change-password').addEventListener('click', () => {
    const np = document.getElementById('new-password').value;
    const cp = document.getElementById('confirm-password').value;
    if (!np) return toast('Enter a new password', 'error');
    if (np !== cp) return toast('Passwords do not match', 'error');
    if (np.length < 6) return toast('Password must be at least 6 characters', 'error');
    localStorage.setItem('cms_password', np);
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    toast('Password updated', 'success');
  });
}

async function testConnection() {
  const g = state.github;
  if (!g.owner || !g.repo || !g.token) return toast('Fill in all GitHub settings first', 'error');
  try {
    const res = await fetch(`https://api.github.com/repos/${g.owner}/${g.repo}`, {
      headers: { Authorization: `token ${g.token}`, Accept: 'application/vnd.github.v3+json' }
    });
    if (res.ok) toast('✅ Connection successful!', 'success');
    else        toast(`❌ Failed: ${res.status} ${res.statusText}`, 'error');
  } catch (e) {
    toast('❌ Network error: ' + e.message, 'error');
  }
}

// ─── Save ─────────────────────────────────────────────────────────────────────

function setupSaveButton() {
  document.getElementById('save-btn').addEventListener('click', saveAll);
}

function markDirty(key) {
  state.dirty.add(key);
  const btn = document.getElementById('save-btn');
  btn.innerHTML = `<i class="bi bi-cloud-upload"></i> Save Changes <span class="dirty-badge">${state.dirty.size}</span>`;
}

async function saveAll() {
  const g = state.github;
  if (!g.owner || !g.repo || !g.token) {
    toast('⚠️ Configure GitHub settings before saving', 'warning');
    // Navigate to settings
    document.querySelector('[data-section="settings"]').click();
    return;
  }

  const btn = document.getElementById('save-btn');
  btn.disabled = true;
  btn.innerHTML = `<i class="bi bi-hourglass-split"></i> Saving…`;

  const filesToSave = state.dirty.size > 0 ? [...state.dirty] : DATA_FILES;
  let saved = 0, failed = [];

  for (const file of filesToSave) {
    const ok = await saveFileToGitHub(file, state.data[file]);
    if (ok) saved++;
    else failed.push(file);
  }

  btn.disabled = false;
  state.dirty.clear();
  btn.innerHTML = `<i class="bi bi-cloud-upload"></i> Save Changes`;

  if (failed.length === 0) {
    toast(`✅ Saved ${saved} file${saved !== 1 ? 's' : ''} successfully`, 'success');
  } else {
    toast(`⚠️ Saved ${saved}, failed: ${failed.join(', ')}`, 'error');
  }
}

async function saveFileToGitHub(filename, content) {
  const g = state.github;
  const path = `data/${filename}.json`;
  const apiUrl = `https://api.github.com/repos/${g.owner}/${g.repo}/contents/${path}`;
  const headers = {
    Authorization: `token ${g.token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  try {
    // Get current SHA
    let sha = null;
    const getRes = await fetch(`${apiUrl}?ref=${g.branch}`, { headers });
    if (getRes.ok) { const d = await getRes.json(); sha = d.sha; }

    const body = {
      message: `Update ${filename}.json via CMS`,
      content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
      branch: g.branch,
    };
    if (sha) body.sha = sha;

    const putRes = await fetch(apiUrl, { method: 'PUT', headers, body: JSON.stringify(body) });
    return putRes.ok;
  } catch (e) {
    console.error(`Failed to save ${filename}:`, e);
    return false;
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${type} show`;
  setTimeout(() => el.classList.remove('show'), 3500);
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', initAuth);
