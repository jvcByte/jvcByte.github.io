// CMS JavaScript
class PortfolioCMS {
    constructor() {
        this.data = {
            personal: {},
            services: [],
            awards: [],
            skills: { aboutSkills: [], resumeSkills: [] },
            experience: [],
            education: [],
            certifications: [],
            projects: [],
            blog: []
        };
        
        // GitHub configuration
        this.githubConfig = this.loadGitHubConfig();
        
        this.init();
    }

    loadGitHubConfig() {
        const config = localStorage.getItem('githubConfig');
        if (config) {
            return JSON.parse(config);
        }
        return {
            owner: '',
            repo: '',
            branch: 'main',
            token: '',
            apiEndpoint: ''
        };
    }

    saveGitHubConfig() {
        localStorage.setItem('githubConfig', JSON.stringify(this.githubConfig));
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.renderAllSections();
        this.showToast('CMS loaded successfully!', 'success');
    }

    // Data Loading
    async loadData() {
        try {
            const dataFiles = [
                'personal', 'services', 'awards', 'skills', 
                'experience', 'education', 'certifications', 'projects', 'blog'
            ];

            for (const file of dataFiles) {
                try {
                    const response = await fetch(`./data/${file}.json`);
                    if (response.ok) {
                        this.data[file] = await response.json();
                    }
                } catch (error) {
                    console.warn(`Could not load ${file}.json:`, error);
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.showToast('Error loading data', 'error');
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.showSection(section);
            });
        });

        // Save All Button
        document.getElementById('save-all-btn').addEventListener('click', () => {
            this.saveAllData();
        });

        // Preview Button
        document.getElementById('preview-btn').addEventListener('click', () => {
            window.open('./index.html', '_blank');
        });

        // Settings Button
        document.getElementById('config-btn')?.addEventListener('click', () => {
            this.showSettingsModal();
        });

        // Settings Modal
        document.getElementById('close-settings')?.addEventListener('click', () => {
            this.hideSettingsModal();
        });

        document.getElementById('save-settings')?.addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('test-connection')?.addEventListener('click', () => {
            this.testGitHubConnection();
        });

        // Close modal on outside click
        document.getElementById('settings-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'settings-modal') {
                this.hideSettingsModal();
            }
        });

        // Add buttons
        document.getElementById('add-social-link')?.addEventListener('click', () => {
            this.addSocialLink();
        });

        document.getElementById('add-service')?.addEventListener('click', () => {
            this.addService();
        });

        document.getElementById('add-award')?.addEventListener('click', () => {
            this.addAward();
        });

        document.getElementById('add-about-skill')?.addEventListener('click', () => {
            this.addSkill('about');
        });

        document.getElementById('add-resume-skill')?.addEventListener('click', () => {
            this.addSkill('resume');
        });

        document.getElementById('add-experience')?.addEventListener('click', () => {
            this.addExperience();
        });

        document.getElementById('add-education')?.addEventListener('click', () => {
            this.addEducation();
        });

        document.getElementById('add-certification')?.addEventListener('click', () => {
            this.addCertification();
        });

        document.getElementById('add-project')?.addEventListener('click', () => {
            this.addProject();
        });

        document.getElementById('add-blog-post')?.addEventListener('click', () => {
            this.addBlogPost();
        });

        // Skills tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.showSkillsTab(tab);
            });
        });

        // Projects filter
        document.getElementById('project-filter')?.addEventListener('change', (e) => {
            this.filterProjects(e.target.value);
        });
    }

    // Navigation
    showSection(sectionName) {
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update sections
        document.querySelectorAll('.cms-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`).classList.add('active');
    }

    showSkillsTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    // Rendering Methods
    renderAllSections() {
        this.renderPersonalInfo();
        this.renderServices();
        this.renderAwards();
        this.renderSkills();
        this.renderExperience();
        this.renderEducation();
        this.renderCertifications();
        this.renderProjects();
        this.renderBlog();
    }

    renderPersonalInfo() {
        const personal = this.data.personal;
        
        // Basic info
        document.getElementById('name').value = personal.name || '';
        document.getElementById('title').value = personal.title || '';
        document.getElementById('email').value = personal.email || '';
        document.getElementById('phone').value = personal.phone || '';
        document.getElementById('location').value = personal.location || '';
        document.getElementById('avatar').value = personal.avatar || '';
        
        // Bio
        if (personal.bio && Array.isArray(personal.bio)) {
            document.getElementById('bio-1').value = personal.bio[0] || '';
            document.getElementById('bio-2').value = personal.bio[1] || '';
        }

        // Social links
        this.renderSocialLinks();

        // Add event listeners for personal info
        ['name', 'title', 'email', 'phone', 'location', 'avatar', 'bio-1', 'bio-2'].forEach(field => {
            document.getElementById(field).addEventListener('input', (e) => {
                this.updatePersonalInfo(field, e.target.value);
            });
        });
    }

    renderSocialLinks() {
        const container = document.getElementById('social-links-container');
        container.innerHTML = '';

        if (this.data.personal.socialLinks) {
            this.data.personal.socialLinks.forEach((link, index) => {
                container.appendChild(this.createSocialLinkElement(link, index));
            });
        }
    }

    createSocialLinkElement(link, index) {
        const div = document.createElement('div');
        div.className = 'social-link-item';
        div.innerHTML = `
            <div class="form-group">
                <label>Platform</label>
                <input type="text" value="${link.platform || ''}" onchange="cms.updateSocialLink(${index}, 'platform', this.value)">
            </div>
            <div class="form-group">
                <label>URL</label>
                <input type="url" value="${link.url || ''}" onchange="cms.updateSocialLink(${index}, 'url', this.value)">
            </div>
            <div class="form-group">
                <label>Icon</label>
                <input type="text" value="${link.icon || ''}" onchange="cms.updateSocialLink(${index}, 'icon', this.value)">
            </div>
            <button class="btn btn-danger btn-small" onclick="cms.removeSocialLink(${index})">Remove</button>
        `;
        return div;
    }

    renderServices() {
        const container = document.getElementById('services-container');
        container.innerHTML = '';

        this.data.services.forEach((service, index) => {
            container.appendChild(this.createServiceElement(service, index));
        });
    }

    createServiceElement(service, index) {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">Service ${index + 1}</h3>
                <div class="card-actions">
                    <button class="btn btn-danger btn-small" onclick="cms.removeService(${index})">Remove</button>
                </div>
            </div>
            <div class="form-group">
                <label>Title</label>
                <input type="text" value="${service.title || ''}" onchange="cms.updateService(${index}, 'title', this.value)">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea onchange="cms.updateService(${index}, 'description', this.value)">${service.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Icon Path</label>
                <input type="text" value="${service.icon || ''}" onchange="cms.updateService(${index}, 'icon', this.value)">
            </div>
        `;
        return div;
    }

    renderAwards() {
        const container = document.getElementById('awards-container');
        container.innerHTML = '';

        this.data.awards.forEach((award, index) => {
            container.appendChild(this.createAwardElement(award, index));
        });
    }

    createAwardElement(award, index) {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">Award ${index + 1}</h3>
                <div class="card-actions">
                    <button class="btn btn-danger btn-small" onclick="cms.removeAward(${index})">Remove</button>
                </div>
            </div>
            <div class="form-group">
                <label>Title</label>
                <input type="text" value="${award.title || ''}" onchange="cms.updateAward(${index}, 'title', this.value)">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea onchange="cms.updateAward(${index}, 'description', this.value)">${award.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Image Path</label>
                <input type="text" value="${award.image || ''}" onchange="cms.updateAward(${index}, 'image', this.value)">
            </div>
            <div class="form-group">
                <label>Image Class</label>
                <input type="text" value="${award.imageClass || ''}" onchange="cms.updateAward(${index}, 'imageClass', this.value)">
            </div>
        `;
        return div;
    }

    renderSkills() {
        this.renderSkillsList('about', 'about-skills-container');
        this.renderSkillsList('resume', 'resume-skills-container');
    }

    renderSkillsList(type, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        const skills = type === 'about' ? this.data.skills.aboutSkills : this.data.skills.resumeSkills;
        
        skills.forEach((skill, index) => {
            container.appendChild(this.createSkillElement(skill, index, type));
        });
    }

    createSkillElement(skill, index, type) {
        const div = document.createElement('div');
        div.className = 'skill-item';
        div.innerHTML = `
            <input type="text" value="${skill}" onchange="cms.updateSkill('${type}', ${index}, this.value)">
            <button class="btn btn-danger btn-small" onclick="cms.removeSkill('${type}', ${index})">Remove</button>
        `;
        return div;
    }

    renderExperience() {
        const container = document.getElementById('experience-container');
        container.innerHTML = '';

        this.data.experience.forEach((exp, index) => {
            container.appendChild(this.createExperienceElement(exp, index));
        });
    }

    createExperienceElement(exp, index) {
        const div = document.createElement('div');
        div.className = 'experience-item';
        div.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">Experience ${index + 1}</h3>
                <div class="card-actions">
                    <button class="btn btn-danger btn-small" onclick="cms.removeExperience(${index})">Remove</button>
                </div>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Position</label>
                    <input type="text" value="${exp.position || ''}" onchange="cms.updateExperience(${index}, 'position', this.value)">
                </div>
                <div class="form-group">
                    <label>Company</label>
                    <input type="text" value="${exp.company || ''}" onchange="cms.updateExperience(${index}, 'company', this.value)">
                </div>
                <div class="form-group">
                    <label>Start Date</label>
                    <input type="date" value="${exp.startDate || ''}" onchange="cms.updateExperience(${index}, 'startDate', this.value)">
                </div>
                <div class="form-group">
                    <label>End Date (or 'present')</label>
                    <input type="text" value="${exp.endDate || ''}" onchange="cms.updateExperience(${index}, 'endDate', this.value)">
                </div>
            </div>
            <div class="form-group">
                <label>Achievements</label>
                <div class="achievements-container" id="achievements-${index}">
                    ${(exp.achievements || []).map((achievement, achIndex) => `
                        <div class="achievement-item">
                            <input type="text" value="${achievement}" onchange="cms.updateAchievement(${index}, ${achIndex}, this.value)">
                            <button class="btn btn-danger btn-small" onclick="cms.removeAchievement(${index}, ${achIndex})">Remove</button>
                        </div>
                    `).join('')}
                </div>
                <button class="btn btn-secondary btn-small" onclick="cms.addAchievement(${index})">Add Achievement</button>
            </div>
        `;
        return div;
    }

    renderEducation() {
        const container = document.getElementById('education-container');
        container.innerHTML = '';

        this.data.education.forEach((edu, index) => {
            container.appendChild(this.createEducationElement(edu, index));
        });
    }

    createEducationElement(edu, index) {
        const div = document.createElement('div');
        div.className = 'education-item';
        div.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">Education ${index + 1}</h3>
                <div class="card-actions">
                    <button class="btn btn-danger btn-small" onclick="cms.removeEducation(${index})">Remove</button>
                </div>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Institution</label>
                    <input type="text" value="${edu.institution || ''}" onchange="cms.updateEducation(${index}, 'institution', this.value)">
                </div>
                <div class="form-group">
                    <label>Degree</label>
                    <input type="text" value="${edu.degree || ''}" onchange="cms.updateEducation(${index}, 'degree', this.value)">
                </div>
                <div class="form-group">
                    <label>Period</label>
                    <input type="text" value="${edu.period || ''}" onchange="cms.updateEducation(${index}, 'period', this.value)">
                </div>
            </div>
            <div class="form-group">
                <label>Courses</label>
                <div class="achievements-container" id="courses-${index}">
                    ${(edu.courses || []).map((course, courseIndex) => `
                        <div class="achievement-item">
                            <input type="text" value="${course}" onchange="cms.updateCourse(${index}, ${courseIndex}, this.value)">
                            <button class="btn btn-danger btn-small" onclick="cms.removeCourse(${index}, ${courseIndex})">Remove</button>
                        </div>
                    `).join('')}
                </div>
                <button class="btn btn-secondary btn-small" onclick="cms.addCourse(${index})">Add Course</button>
            </div>
        `;
        return div;
    }

    renderCertifications() {
        const container = document.getElementById('certifications-container');
        container.innerHTML = '';

        this.data.certifications.forEach((cert, index) => {
            container.appendChild(this.createCertificationElement(cert, index));
        });
    }

    createCertificationElement(cert, index) {
        const div = document.createElement('div');
        div.className = 'certification-item';
        div.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">Certification ${index + 1}</h3>
                <div class="card-actions">
                    <button class="btn btn-danger btn-small" onclick="cms.removeCertification(${index})">Remove</button>
                </div>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" value="${cert.name || ''}" onchange="cms.updateCertification(${index}, 'name', this.value)">
                </div>
                <div class="form-group">
                    <label>Issuer</label>
                    <input type="text" value="${cert.issuer || ''}" onchange="cms.updateCertification(${index}, 'issuer', this.value)">
                </div>
                <div class="form-group">
                    <label>Issue Date</label>
                    <input type="text" value="${cert.issueDate || ''}" onchange="cms.updateCertification(${index}, 'issueDate', this.value)">
                </div>
                <div class="form-group">
                    <label>Credential ID</label>
                    <input type="text" value="${cert.credentialId || ''}" onchange="cms.updateCertification(${index}, 'credentialId', this.value)">
                </div>
                <div class="form-group">
                    <label>Image Path</label>
                    <input type="text" value="${cert.image || ''}" onchange="cms.updateCertification(${index}, 'image', this.value)">
                </div>
                <div class="form-group">
                    <label>Image Class</label>
                    <input type="text" value="${cert.imageClass || ''}" onchange="cms.updateCertification(${index}, 'imageClass', this.value)">
                </div>
            </div>
        `;
        return div;
    }

    renderProjects() {
        const container = document.getElementById('projects-container');
        container.innerHTML = '';

        this.data.projects.forEach((project, index) => {
            container.appendChild(this.createProjectElement(project, index));
        });
    }

    createProjectElement(project, index) {
        const div = document.createElement('div');
        div.className = 'card';
        div.dataset.category = project.category;
        div.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">${project.title || `Project ${index + 1}`}</h3>
                <div class="card-actions">
                    <button class="btn btn-danger btn-small" onclick="cms.removeProject(${index})">Remove</button>
                </div>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" value="${project.title || ''}" onchange="cms.updateProject(${index}, 'title', this.value)">
                </div>
                <div class="form-group">
                    <label>Category</label>
                    <select onchange="cms.updateProject(${index}, 'category', this.value)">
                        <option value="web2" ${project.category === 'web2' ? 'selected' : ''}>Web2</option>
                        <option value="web3" ${project.category === 'web3' ? 'selected' : ''}>Web3</option>
                        <option value="iot & embedded systems" ${project.category === 'iot & embedded systems' ? 'selected' : ''}>IoT & Embedded Systems</option>
                        <option value="graphics design" ${project.category === 'graphics design' ? 'selected' : ''}>Graphics Design</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>URL</label>
                    <input type="url" value="${project.url || ''}" onchange="cms.updateProject(${index}, 'url', this.value)">
                </div>
                <div class="form-group">
                    <label>Image Path</label>
                    <input type="text" value="${project.image || ''}" onchange="cms.updateProject(${index}, 'image', this.value)">
                </div>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea onchange="cms.updateProject(${index}, 'description', this.value)">${project.description || ''}</textarea>
            </div>
            <div class="checkbox-group">
                <input type="checkbox" id="featured-${index}" ${project.featured ? 'checked' : ''} onchange="cms.updateProject(${index}, 'featured', this.checked)">
                <label for="featured-${index}">Featured Project</label>
            </div>
        `;
        return div;
    }

    // Update Methods
    updatePersonalInfo(field, value) {
        if (field === 'bio-1') {
            if (!this.data.personal.bio) this.data.personal.bio = ['', ''];
            this.data.personal.bio[0] = value;
        } else if (field === 'bio-2') {
            if (!this.data.personal.bio) this.data.personal.bio = ['', ''];
            this.data.personal.bio[1] = value;
        } else {
            this.data.personal[field] = value;
        }
    }

    updateSocialLink(index, field, value) {
        if (!this.data.personal.socialLinks) this.data.personal.socialLinks = [];
        if (!this.data.personal.socialLinks[index]) this.data.personal.socialLinks[index] = {};
        this.data.personal.socialLinks[index][field] = value;
    }

    updateService(index, field, value) {
        if (!this.data.services[index]) return;
        this.data.services[index][field] = value;
    }

    updateAward(index, field, value) {
        if (!this.data.awards[index]) return;
        this.data.awards[index][field] = value;
    }

    updateSkill(type, index, value) {
        const skillsArray = type === 'about' ? this.data.skills.aboutSkills : this.data.skills.resumeSkills;
        if (skillsArray[index] !== undefined) {
            skillsArray[index] = value;
        }
    }

    updateExperience(index, field, value) {
        if (!this.data.experience[index]) return;
        this.data.experience[index][field] = value;
    }

    updateAchievement(expIndex, achIndex, value) {
        if (!this.data.experience[expIndex] || !this.data.experience[expIndex].achievements) return;
        this.data.experience[expIndex].achievements[achIndex] = value;
    }

    updateEducation(index, field, value) {
        if (!this.data.education[index]) return;
        this.data.education[index][field] = value;
    }

    updateCourse(eduIndex, courseIndex, value) {
        if (!this.data.education[eduIndex] || !this.data.education[eduIndex].courses) return;
        this.data.education[eduIndex].courses[courseIndex] = value;
    }

    updateCertification(index, field, value) {
        if (!this.data.certifications[index]) return;
        this.data.certifications[index][field] = value;
    }

    updateProject(index, field, value) {
        if (!this.data.projects[index]) return;
        this.data.projects[index][field] = value;
        
        // Update the card's data-category if category changed
        if (field === 'category') {
            const card = document.querySelectorAll('.card')[index];
            if (card) card.dataset.category = value;
        }
    }

    // Add Methods
    addSocialLink() {
        if (!this.data.personal.socialLinks) this.data.personal.socialLinks = [];
        this.data.personal.socialLinks.push({ platform: '', url: '', icon: '' });
        this.renderSocialLinks();
    }

    addService() {
        this.data.services.push({
            id: Date.now(),
            title: '',
            description: '',
            icon: ''
        });
        this.renderServices();
    }

    addAward() {
        this.data.awards.push({
            id: Date.now(),
            title: '',
            description: '',
            image: '',
            imageClass: ''
        });
        this.renderAwards();
    }

    addSkill(type) {
        if (type === 'about') {
            this.data.skills.aboutSkills.push('');
            this.renderSkillsList('about', 'about-skills-container');
        } else {
            this.data.skills.resumeSkills.push('');
            this.renderSkillsList('resume', 'resume-skills-container');
        }
    }

    addExperience() {
        this.data.experience.push({
            id: Date.now(),
            position: '',
            company: '',
            startDate: '',
            endDate: '',
            achievements: []
        });
        this.renderExperience();
    }

    addAchievement(expIndex) {
        if (!this.data.experience[expIndex].achievements) {
            this.data.experience[expIndex].achievements = [];
        }
        this.data.experience[expIndex].achievements.push('');
        this.renderExperience();
    }

    addEducation() {
        this.data.education.push({
            id: Date.now(),
            institution: '',
            degree: '',
            period: '',
            courses: []
        });
        this.renderEducation();
    }

    addCourse(eduIndex) {
        if (!this.data.education[eduIndex].courses) {
            this.data.education[eduIndex].courses = [];
        }
        this.data.education[eduIndex].courses.push('');
        this.renderEducation();
    }

    addCertification() {
        this.data.certifications.push({
            id: Date.now(),
            name: '',
            issuer: '',
            issueDate: '',
            credentialId: '',
            image: '',
            imageClass: ''
        });
        this.renderCertifications();
    }

    addProject() {
        this.data.projects.push({
            id: Date.now(),
            title: '',
            category: 'web2',
            description: '',
            image: '',
            url: '',
            featured: false
        });
        this.renderProjects();
    }

    // Remove Methods
    removeSocialLink(index) {
        this.data.personal.socialLinks.splice(index, 1);
        this.renderSocialLinks();
    }

    removeService(index) {
        this.data.services.splice(index, 1);
        this.renderServices();
    }

    removeAward(index) {
        this.data.awards.splice(index, 1);
        this.renderAwards();
    }

    removeSkill(type, index) {
        if (type === 'about') {
            this.data.skills.aboutSkills.splice(index, 1);
            this.renderSkillsList('about', 'about-skills-container');
        } else {
            this.data.skills.resumeSkills.splice(index, 1);
            this.renderSkillsList('resume', 'resume-skills-container');
        }
    }

    removeExperience(index) {
        this.data.experience.splice(index, 1);
        this.renderExperience();
    }

    removeAchievement(expIndex, achIndex) {
        this.data.experience[expIndex].achievements.splice(achIndex, 1);
        this.renderExperience();
    }

    removeEducation(index) {
        this.data.education.splice(index, 1);
        this.renderEducation();
    }

    removeCourse(eduIndex, courseIndex) {
        this.data.education[eduIndex].courses.splice(courseIndex, 1);
        this.renderEducation();
    }

    removeCertification(index) {
        this.data.certifications.splice(index, 1);
        this.renderCertifications();
    }

    removeProject(index) {
        this.data.projects.splice(index, 1);
        this.renderProjects();
    }

    renderBlog() {
        const container = document.getElementById('blog-container');
        container.innerHTML = '';

        this.data.blog.forEach((post, index) => {
            container.appendChild(this.createBlogElement(post, index));
        });
    }

    createBlogElement(post, index) {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">${post.title || `Blog Post ${index + 1}`}</h3>
                <div class="card-actions">
                    <button class="btn btn-danger btn-small" onclick="cms.removeBlogPost(${index})">Remove</button>
                </div>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" value="${post.title || ''}" onchange="cms.updateBlogPost(${index}, 'title', this.value)">
                </div>
                <div class="form-group">
                    <label>Category</label>
                    <input type="text" value="${post.category || 'Blog'}" onchange="cms.updateBlogPost(${index}, 'category', this.value)">
                </div>
                <div class="form-group">
                    <label>Date</label>
                    <input type="date" value="${post.date || ''}" onchange="cms.updateBlogPost(${index}, 'date', this.value)">
                </div>
                <div class="form-group">
                    <label>URL</label>
                    <input type="url" value="${post.url || ''}" onchange="cms.updateBlogPost(${index}, 'url', this.value)">
                </div>
                <div class="form-group">
                    <label>Image Path</label>
                    <input type="text" value="${post.image || ''}" onchange="cms.updateBlogPost(${index}, 'image', this.value)">
                </div>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea onchange="cms.updateBlogPost(${index}, 'description', this.value)">${post.description || ''}</textarea>
            </div>
            <div class="checkbox-group">
                <input type="checkbox" id="blog-featured-${index}" ${post.featured ? 'checked' : ''} onchange="cms.updateBlogPost(${index}, 'featured', this.checked)">
                <label for="blog-featured-${index}">Featured Post</label>
            </div>
        `;
        return div;
    }

    updateBlogPost(index, field, value) {
        if (!this.data.blog[index]) return;
        this.data.blog[index][field] = value;
    }

    addBlogPost() {
        this.data.blog.push({
            id: Date.now(),
            title: '',
            category: 'Blog',
            date: new Date().toISOString().split('T')[0],
            description: '',
            image: '',
            url: '',
            featured: false
        });
        this.renderBlog();
    }

    removeBlogPost(index) {
        this.data.blog.splice(index, 1);
        this.renderBlog();
    }

    // Filter Projects
    filterProjects(category) {
        const cards = document.querySelectorAll('#projects-container .card');
        cards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Settings Modal
    showSettingsModal() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            // Populate form with current config
            document.getElementById('github-owner').value = this.githubConfig.owner || '';
            document.getElementById('github-repo').value = this.githubConfig.repo || '';
            document.getElementById('github-branch').value = this.githubConfig.branch || 'main';
            document.getElementById('github-token').value = this.githubConfig.token || '';
            document.getElementById('api-endpoint').value = this.githubConfig.apiEndpoint || '';
            
            modal.style.display = 'flex';
        }
    }

    hideSettingsModal() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    saveSettings() {
        this.githubConfig.owner = document.getElementById('github-owner').value.trim();
        this.githubConfig.repo = document.getElementById('github-repo').value.trim();
        this.githubConfig.branch = document.getElementById('github-branch').value.trim() || 'main';
        this.githubConfig.token = document.getElementById('github-token').value.trim();
        this.githubConfig.apiEndpoint = document.getElementById('api-endpoint').value.trim();
        
        this.saveGitHubConfig();
        this.showToast('Settings saved!', 'success');
        this.hideSettingsModal();
    }

    async testGitHubConnection() {
        if (!this.githubConfig.owner || !this.githubConfig.repo || !this.githubConfig.token) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        this.showToast('Testing connection...', 'warning');
        
        try {
            const success = await this.updateFileViaGitHub('personal.json', this.data.personal, true);
            if (success) {
                this.showToast('✅ Connection successful!', 'success');
            } else {
                this.showToast('❌ Connection failed. Check your settings.', 'error');
            }
        } catch (error) {
            this.showToast('❌ Error: ' + error.message, 'error');
        }
    }

    // Save Data - Update files via GitHub API
    async saveAllData() {
        // Check if GitHub is configured
        if (!this.githubConfig.owner || !this.githubConfig.repo || !this.githubConfig.token) {
            this.showToast('⚠️ Please configure GitHub settings first', 'warning');
            this.showSettingsModal();
            return;
        }

        try {
            this.showToast('Saving JSON files to GitHub...', 'warning');
            
            const files = {
                'personal': this.data.personal,
                'services': this.data.services,
                'awards': this.data.awards,
                'skills': this.data.skills,
                'experience': this.data.experience,
                'education': this.data.education,
                'certifications': this.data.certifications,
                'projects': this.data.projects,
                'blog': this.data.blog
            };

            let savedCount = 0;
            let failedFiles = [];
            
            for (const [filename, data] of Object.entries(files)) {
                const success = await this.updateFileViaGitHub(`${filename}.json`, data);
                if (success) {
                    savedCount++;
                } else {
                    failedFiles.push(filename);
                }
            }
            
            if (savedCount === Object.keys(files).length) {
                this.showToast(`✅ Successfully saved all ${savedCount} JSON files to GitHub!`, 'success');
            } else if (savedCount > 0) {
                this.showToast(`⚠️ Saved ${savedCount}/${Object.keys(files).length} files. Some files failed.`, 'warning');
                console.warn('Failed files:', failedFiles);
            } else {
                this.showToast('❌ Failed to save files. Check your GitHub settings.', 'error');
            }
        } catch (error) {
            console.error('Error saving files:', error);
            this.showToast('Error: ' + error.message, 'error');
        }
    }

    async updateFileViaGitHub(filename, content, testMode = false) {
        try {
            const apiEndpoint = this.githubConfig.apiEndpoint;
            
            if (apiEndpoint) {
                // Use custom API endpoint (serverless function)
                return await this.updateViaAPI(apiEndpoint, filename, content);
            } else {
                // Use GitHub API directly
                return await this.updateViaGitHubAPI(filename, content, testMode);
            }
        } catch (error) {
            console.error(`Failed to update ${filename}:`, error);
            return false;
        }
    }

    async updateViaAPI(endpoint, filename, content) {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filename,
                content,
                token: this.githubConfig.token,
                repo: this.githubConfig.repo,
                owner: this.githubConfig.owner,
                branch: this.githubConfig.branch
            })
        });

        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log(`✅ ${filename} updated via API`);
            return true;
        } else {
            console.error(`❌ Failed to update ${filename}:`, result.error);
            return false;
        }
    }

    async updateViaGitHubAPI(filename, content, testMode = false) {
        // Get current file SHA
        const filePath = `data/${filename}`;
        const getFileUrl = `https://api.github.com/repos/${this.githubConfig.owner}/${this.githubConfig.repo}/contents/${filePath}?ref=${this.githubConfig.branch}`;
        
        let fileSha = null;
        try {
            const getFileResponse = await fetch(getFileUrl, {
                headers: {
                    'Authorization': `token ${this.githubConfig.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (getFileResponse.ok) {
                const fileData = await getFileResponse.json();
                fileSha = fileData.sha;
            }
        } catch (error) {
            // File might not exist, that's okay
            console.log('File does not exist or error fetching:', error.message);
        }

        // Prepare content
        const jsonContent = JSON.stringify(content, null, 2);
        const base64Content = btoa(unescape(encodeURIComponent(jsonContent)));

        // Update file
        const updateUrl = `https://api.github.com/repos/${this.githubConfig.owner}/${this.githubConfig.repo}/contents/${filePath}`;
        
        const updatePayload = {
            message: testMode ? `Test update ${filename} via CMS` : `Update ${filename} via CMS`,
            content: base64Content,
            branch: this.githubConfig.branch
        };

        if (fileSha) {
            updatePayload.sha = fileSha;
        }

        const updateResponse = await fetch(updateUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${this.githubConfig.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatePayload)
        });

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData.message || 'Failed to update file');
        }

        const result = await updateResponse.json();
        console.log(`✅ ${filename} updated on GitHub`);
        return true;
    }

    // Fallback: Save via downloads
    saveViaDownloads() {
        const files = {
            'personal': this.data.personal,
            'services': this.data.services,
            'awards': this.data.awards,
            'skills': this.data.skills,
            'experience': this.data.experience,
            'education': this.data.education,
            'certifications': this.data.certifications,
            'projects': this.data.projects,
            'blog': this.data.blog
        };

        this.showToast('Downloading JSON files... Please save them to the data/ folder.', 'warning');
        
        // Small delay to ensure toast is visible
        setTimeout(() => {
            for (const [filename, data] of Object.entries(files)) {
                this.downloadJSONFile(filename, data);
            }
            this.showToast(`✅ Downloaded ${Object.keys(files).length} JSON files. Please replace files in data/ folder.`, 'success');
        }, 500);
    }
    
    downloadJSONFile(filename, data) {
        const jsonContent = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.json`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Toast Notifications
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize CMS
let cms;
document.addEventListener('DOMContentLoaded', () => {
    cms = new PortfolioCMS();
});