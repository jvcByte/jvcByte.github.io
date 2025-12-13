// Portfolio Data Loader
class PortfolioDataLoader {
    constructor() {
        this.data = {};
        this.init();
    }

    async init() {
        // Show loading state
        this.showLoadingState();
        
        await this.loadAllData();
        this.populatePortfolio();
        
        // Hide loading state
        this.hideLoadingState();
    }

    showLoadingState() {
        // Add loading class to body
        document.body.classList.add('loading-data');
    }

    hideLoadingState() {
        // Remove loading class from body
        document.body.classList.remove('loading-data');
    }

    async loadAllData() {
        try {
            const dataFiles = [
                'personal', 'services', 'awards', 'skills', 
                'experience', 'education', 'certifications', 'projects', 'blog'
            ];

            for (const file of dataFiles) {
                try {
                    // Add cache-busting parameter to prevent stale data
                    const cacheBuster = `?v=${Date.now()}`;
                    const response = await fetch(`./data/${file}.json${cacheBuster}`, {
                        cache: 'no-cache',
                        headers: {
                            'Cache-Control': 'no-cache'
                        }
                    });
                    if (response.ok) {
                        this.data[file] = await response.json();
                    }
                } catch (error) {
                    console.warn(`Could not load ${file}.json:`, error);
                }
            }
        } catch (error) {
            console.error('Error loading portfolio data:', error);
        }
    }

    populatePortfolio() {
        this.populatePersonalInfo();
        this.populateServices();
        this.populateAwards();
        this.populateSkills();
        this.populateExperience();
        this.populateEducation();
        this.populateCertifications();
        this.populateProjects();
        this.populateBlog();
    }

    populatePersonalInfo() {
        const personal = this.data.personal;
        if (!personal) return;

        // Update name and title
        const nameElement = document.querySelector('.name');
        const titleElement = document.querySelector('.title');
        
        if (nameElement && personal.name) {
            nameElement.textContent = personal.name;
            nameElement.title = personal.name;
        }
        
        if (titleElement && personal.title) {
            // Keep the emoji part if it exists
            const emojiPart = titleElement.innerHTML.includes('<span') ? 
                titleElement.innerHTML.split('<span')[1] : '';
            titleElement.innerHTML = personal.title + (emojiPart ? '<span' + emojiPart : '');
        }

        // Update contact info
        if (personal.email) {
            const emailLink = document.querySelector('a[href^="mailto:"]');
            if (emailLink) {
                emailLink.href = `mailto:${personal.email}`;
                emailLink.textContent = personal.email;
            }
        }

        if (personal.phone) {
            const phoneLink = document.querySelector('a[href^="tel:"]');
            if (phoneLink) {
                phoneLink.href = `tel:${personal.phone}`;
                phoneLink.textContent = personal.phone;
            }
        }

        if (personal.location) {
            const locationElement = document.querySelector('address');
            if (locationElement) {
                locationElement.textContent = personal.location;
            }
        }

        // Update avatar
        if (personal.avatar) {
            const avatarImages = document.querySelectorAll('.avatar-box img, .thumbnail');
            avatarImages.forEach(img => {
                img.src = personal.avatar;
                img.alt = personal.name || 'Portfolio Owner';
            });
        }

        // Update bio
        if (personal.bio && Array.isArray(personal.bio)) {
            const aboutTextSection = document.querySelector('.about-text');
            if (aboutTextSection) {
                aboutTextSection.innerHTML = personal.bio.map(paragraph => 
                    `<p>${paragraph}</p>`
                ).join('');
            }
        }

        // Update social links
        if (personal.socialLinks) {
            this.updateSocialLinks(personal.socialLinks);
        }
    }

    updateSocialLinks(socialLinks) {
        const socialList = document.querySelector('.social-list');
        if (!socialList) return;

        socialList.innerHTML = '';
        
        socialLinks.forEach(link => {
            const li = document.createElement('li');
            li.className = 'social-item';
            li.innerHTML = `
                <a href="${link.url}" class="social-link" target="_blank" rel="noopener noreferrer">
                    <ion-icon name="${link.icon}"></ion-icon>
                </a>
            `;
            socialList.appendChild(li);
        });
    }

    populateServices() {
        const services = this.data.services;
        if (!services || !Array.isArray(services)) return;

        const serviceList = document.querySelector('.service-list');
        if (!serviceList) return;

        serviceList.innerHTML = '';

        services.forEach(service => {
            const li = document.createElement('li');
            li.className = 'service-item';
            li.innerHTML = `
                <div class="service-icon-box">
                    <img src="${service.icon}" alt="${service.title} icon" width="40">
                </div>
                <div class="service-content-box">
                    <h4 class="h4 service-item-title">${service.title}</h4>
                    <p class="service-item-text">${service.description}</p>
                </div>
            `;
            serviceList.appendChild(li);
        });
    }

    populateAwards() {
        const awards = this.data.awards;
        if (!awards || !Array.isArray(awards)) return;

        const awardList = document.querySelector('.award-list');
        if (!awardList) return;

        awardList.innerHTML = '';

        awards.forEach(award => {
            const li = document.createElement('li');
            li.className = 'award-item';
            li.innerHTML = `
                <div class="award-icon-box">
                    <img src="${award.image}" alt="${award.title}" width="370" 
                         class="zoomable-image ${award.imageClass || ''}">
                </div>
                <div class="award-content-box">
                    <h4 class="h4 award-item-title">${award.title}</h4>
                    <p class="award-item-text">${award.description}</p>
                </div>
            `;
            awardList.appendChild(li);
        });
    }

    populateSkills() {
        const skills = this.data.skills;
        if (!skills) return;

        // About page skills
        if (skills.aboutSkills) {
            const aboutSkillsList = document.querySelector('.about .skills-list');
            if (aboutSkillsList) {
                aboutSkillsList.innerHTML = '';
                skills.aboutSkills.forEach(skill => {
                    const li = document.createElement('li');
                    li.className = 'skills-item';
                    li.innerHTML = `<h5 class="h5">${skill}</h5>`;
                    aboutSkillsList.appendChild(li);
                });
            }
        }

        // Resume page skills
        if (skills.resumeSkills) {
            const resumeSkillsList = document.querySelector('.resume .skills-list');
            if (resumeSkillsList) {
                resumeSkillsList.innerHTML = '';
                skills.resumeSkills.forEach(skill => {
                    const li = document.createElement('li');
                    li.className = 'skills-item';
                    li.innerHTML = `<h5 class="h5">${skill}</h5>`;
                    resumeSkillsList.appendChild(li);
                });
            }
        }
    }

    populateExperience() {
        const experience = this.data.experience;
        if (!experience || !Array.isArray(experience)) return;

        const timelineList = document.getElementById('experience-timeline');
        if (!timelineList) return;

        timelineList.innerHTML = '';

        // Add experience items (most recent first)
        [...experience].reverse().forEach(exp => {
            const li = document.createElement('li');
            li.className = 'timeline-item';
            
            const achievements = exp.achievements ? exp.achievements.map(achievement => 
                `<li>${achievement}</li>`
            ).join('') : '';

            li.innerHTML = `
                <h4 class="h4 timeline-item-title">${exp.position}</h4>
                <p class="timeline-text">${exp.company}</p>
                <span data-start-date="${exp.startDate}" data-end-date="${exp.endDate}">
                    ${this.formatDateRange(exp.startDate, exp.endDate)} &nbsp; &#8226;
                    <span class="duration"></span>
                </span>
                ${achievements ? `
                    <p class="timeline-text"><i>Achievements/Tasks</i></p>
                    <ul class="timeline-text">${achievements}</ul>
                ` : ''}
            `;
            
            timelineList.appendChild(li);
        });
    }

    populateEducation() {
        const education = this.data.education;
        if (!education || !Array.isArray(education)) return;

        const timelineList = document.querySelector('.resume .timeline-list');
        if (!timelineList) return;

        // Add education items
        education.forEach(edu => {
            const li = document.createElement('li');
            li.className = 'timeline-item';
            
            const courses = edu.courses && edu.courses.length > 0 ? 
                edu.courses.map(course => `<li>${course}</li>`).join('') : '';

            li.innerHTML = `
                <h4 class="h4 timeline-item-title">${edu.institution}</h4>
                <p class="timeline-text">${edu.degree}</p>
                <span>${edu.period}</span>
                ${courses ? `
                    <p class="timeline-text"><i>Selected Courses</i></p>
                    <ul class="timeline-text">${courses}</ul>
                ` : ''}
            `;
            
            timelineList.appendChild(li);
        });
    }

    populateCertifications() {
        const certifications = this.data.certifications;
        if (!certifications || !Array.isArray(certifications)) return;

        // Find the certifications section in the resume
        const certificationsSection = document.querySelector('.resume .award-list');
        if (!certificationsSection) return;

        certificationsSection.innerHTML = '';

        certifications.forEach(cert => {
            const li = document.createElement('li');
            li.className = 'award-item';
            li.innerHTML = `
                <div class="award-icon-box">
                    <img src="${cert.image}" alt="${cert.name}" width="370" 
                         class="zoomable-image ${cert.imageClass || ''}">
                </div>
                <div class="award-content-box">
                    <h4 class="h4 award-item-title">${cert.name}</h4>
                    <p class="award-item-text"><strong>Issued by:</strong> ${cert.issuer}</p>
                    <p class="award-item-text"><strong>Issued:</strong> ${cert.issueDate}</p>
                    <p class="award-item-text"><strong>Credential ID:</strong> ${cert.credentialId}</p>
                </div>
            `;
            certificationsSection.appendChild(li);
        });
    }

    populateProjects() {
        const projects = this.data.projects;
        if (!projects || !Array.isArray(projects)) return;

        const projectList = document.querySelector('.project-list');
        if (!projectList) return;

        projectList.innerHTML = '';

        projects.forEach(project => {
            const li = document.createElement('li');
            li.className = 'project-item active';
            li.setAttribute('data-filter-item', '');
            li.setAttribute('data-category', project.category);
            
            li.innerHTML = `
                <a href="${project.url}" target="_blank">
                    <figure class="project-img">
                        <div class="project-item-icon-box">
                            <ion-icon name="eye-outline"></ion-icon>
                        </div>
                        <img src="${project.image}" alt="${project.title}" loading="lazy">
                    </figure>
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-category">${this.formatCategory(project.category)}</p>
                    <p class="project-description">${project.description}</p>
                </a>
            `;
            
            projectList.appendChild(li);
        });
    }

    formatCategory(category) {
        const categoryMap = {
            'web2': 'Web2',
            'web3': 'Web3',
            'iot & embedded systems': 'IoT & Embedded System',
            'graphics design': 'Graphics Design'
        };
        return categoryMap[category] || category;
    }

    populateBlog() {
        const blog = this.data.blog;
        if (!blog || !Array.isArray(blog)) return;

        const blogList = document.querySelector('.blog-posts-list');
        if (!blogList) return;

        blogList.innerHTML = '';

        blog.forEach(post => {
            const li = document.createElement('li');
            li.className = 'blog-post-item';
            
            const postDate = new Date(post.date);
            const formattedDate = postDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            li.innerHTML = `
                <a href="${post.url}" target="_blank">
                    <figure class="blog-banner-box">
                        <img src="${post.image}" alt="${post.title}" loading="lazy">
                    </figure>
                    <div class="blog-content">
                        <div class="blog-meta">
                            <p class="blog-category">${post.category}</p>
                            <span class="dot"></span>
                            <time datetime="${post.date}">${formattedDate}</time>
                        </div>
                        <h3 class="h3 blog-item-title">${post.title}</h3>
                        <p class="blog-text">${post.description}</p>
                    </div>
                </a>
            `;
            
            blogList.appendChild(li);
        });
    }

    formatDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const startFormatted = start.toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
        });
        
        if (endDate === 'present') {
            return `${startFormatted} — Present`;
        }
        
        const end = new Date(endDate);
        const endFormatted = end.toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
        });
        
        return `${startFormatted} — ${endFormatted}`;
    }
}

// Initialize data loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioDataLoader();
});