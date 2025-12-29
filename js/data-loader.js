// Portfolio Data Loader
class PortfolioDataLoader {
    constructor() {
        this.data = {};
        this.skeletonManager = new SkeletonStateManager();
        this.init();
    }

    async init() {
        // Show loading state
        this.showLoadingState();
        
        try {
            await this.loadDataWithTimeout();
            this.populatePortfolio();
        } catch (error) {
            console.error('Failed to initialize portfolio data:', error);
            this.handleLoadingError(error);
        } finally {
            // Always hide loading state
            this.hideLoadingState();
        }
    }

    async loadDataWithTimeout() {
        const LOADING_TIMEOUT = 15000; // 15 seconds
        const WARNING_TIMEOUT = 8000; // 8 seconds warning
        
        let warningTimeout;
        let loadingTimeout;
        
        try {
            // Set warning timeout
            warningTimeout = setTimeout(() => {
                this.showLoadingWarning();
            }, WARNING_TIMEOUT);
            
            // Set loading timeout
            const timeoutPromise = new Promise((_, reject) => {
                loadingTimeout = setTimeout(() => {
                    reject(new Error('Loading timeout: Data loading took too long'));
                }, LOADING_TIMEOUT);
            });
            
            // Race between data loading and timeout
            await Promise.race([
                this.loadAllData(),
                timeoutPromise
            ]);
            
            // Clear timeouts if successful
            clearTimeout(warningTimeout);
            clearTimeout(loadingTimeout);
            
        } catch (error) {
            // Clear timeouts
            clearTimeout(warningTimeout);
            clearTimeout(loadingTimeout);
            
            // Re-throw error to be handled by init()
            throw error;
        }
    }

    showLoadingWarning() {
        // Show warning message to user
        this.showUserMessage('Loading is taking longer than expected...', 'warning');
        
        // Announce to screen readers
        if (this.skeletonManager) {
            this.skeletonManager.announceToScreenReader(
                'Loading is taking longer than expected, please wait', 
                'assertive'
            );
        }
    }

    handleLoadingError(error) {
        console.error('Loading error:', error);
        
        // Determine error type and show appropriate fallback
        if (error.message.includes('timeout')) {
            this.showTimeoutFallback();
        } else if (error.message.includes('network') || error.name === 'TypeError') {
            this.showNetworkErrorFallback();
        } else {
            this.showGenericErrorFallback();
        }
        
        // Announce error to screen readers
        if (this.skeletonManager) {
            this.skeletonManager.announceToScreenReader(
                'Content loading failed. Retry options are available.', 
                'assertive'
            );
        }
    }

    showTimeoutFallback() {
        this.showErrorFallback({
            title: 'Loading Timeout',
            message: 'The content is taking longer than expected to load.',
            type: 'timeout',
            showRetry: true,
            showOfflineContent: true
        });
    }

    showNetworkErrorFallback() {
        this.showErrorFallback({
            title: 'Connection Error',
            message: 'Unable to load content. Please check your internet connection.',
            type: 'network',
            showRetry: true,
            showOfflineContent: true
        });
    }

    showGenericErrorFallback() {
        this.showErrorFallback({
            title: 'Loading Error',
            message: 'Something went wrong while loading the content.',
            type: 'generic',
            showRetry: true,
            showOfflineContent: false
        });
    }

    showErrorFallback(options) {
        const {
            title = 'Loading Error',
            message = 'Unable to load content',
            type = 'generic',
            showRetry = true,
            showOfflineContent = false
        } = options;

        // Create error fallback container
        const errorContainer = document.createElement('div');
        errorContainer.className = `error-fallback error-fallback-${type}`;
        errorContainer.setAttribute('role', 'alert');
        errorContainer.setAttribute('aria-live', 'assertive');
        
        errorContainer.innerHTML = `
            <div class="error-content">
                <div class="error-icon">
                    <ion-icon name="${this.getErrorIcon(type)}"></ion-icon>
                </div>
                <h3 class="error-title">${title}</h3>
                <p class="error-message">${message}</p>
                <div class="error-actions">
                    ${showRetry ? `
                        <button class="btn-retry" onclick="portfolioDataLoader.retryLoading()">
                            <ion-icon name="refresh-outline"></ion-icon>
                            Retry Loading
                        </button>
                    ` : ''}
                    ${showOfflineContent ? `
                        <button class="btn-offline" onclick="portfolioDataLoader.showOfflineContent()">
                            <ion-icon name="document-outline"></ion-icon>
                            View Offline Content
                        </button>
                    ` : ''}
                    <button class="btn-contact" onclick="portfolioDataLoader.showContactInfo()">
                        <ion-icon name="mail-outline"></ion-icon>
                        Contact Info
                    </button>
                </div>
            </div>
        `;

        // Insert error fallback into main content area
        const mainContent = document.querySelector('main') || document.body;
        
        // Remove existing error fallbacks
        const existingErrors = mainContent.querySelectorAll('.error-fallback');
        existingErrors.forEach(error => error.remove());
        
        // Insert new error fallback
        mainContent.insertBefore(errorContainer, mainContent.firstChild);
        
        // Focus the error container for accessibility
        errorContainer.focus();
        
        // Show user message
        this.showUserMessage(message, 'error');
    }

    getErrorIcon(type) {
        const icons = {
            timeout: 'time-outline',
            network: 'wifi-outline',
            generic: 'alert-circle-outline'
        };
        return icons[type] || 'alert-circle-outline';
    }

    showUserMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.user-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `user-message user-message-${type}`;
        messageElement.setAttribute('role', type === 'error' ? 'alert' : 'status');
        messageElement.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
        
        messageElement.innerHTML = `
            <div class="message-content">
                <ion-icon name="${this.getMessageIcon(type)}"></ion-icon>
                <span class="message-text">${message}</span>
                <button class="message-close" onclick="this.parentElement.parentElement.remove()" aria-label="Close message">
                    <ion-icon name="close-outline"></ion-icon>
                </button>
            </div>
        `;
        
        // Insert at top of page
        document.body.insertBefore(messageElement, document.body.firstChild);
        
        // Auto-remove after delay (except for errors)
        if (type !== 'error') {
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.remove();
                }
            }, 5000);
        }
    }

    getMessageIcon(type) {
        const icons = {
            info: 'information-circle-outline',
            warning: 'warning-outline',
            error: 'alert-circle-outline',
            success: 'checkmark-circle-outline'
        };
        return icons[type] || 'information-circle-outline';
    }

    async retryLoading() {
        // Remove error fallbacks
        const errorFallbacks = document.querySelectorAll('.error-fallback');
        errorFallbacks.forEach(error => error.remove());
        
        // Remove user messages
        const userMessages = document.querySelectorAll('.user-message');
        userMessages.forEach(msg => msg.remove());
        
        // Show loading message
        this.showUserMessage('Retrying to load content...', 'info');
        
        // Show skeletons again
        this.showLoadingState();
        
        try {
            await this.loadDataWithTimeout();
            this.populatePortfolio();
            this.showUserMessage('Content loaded successfully!', 'success');
        } catch (error) {
            console.error('Retry failed:', error);
            this.handleLoadingError(error);
        } finally {
            this.hideLoadingState();
        }
    }

    showOfflineContent() {
        // Remove error fallbacks
        const errorFallbacks = document.querySelectorAll('.error-fallback');
        errorFallbacks.forEach(error => error.remove());
        
        // Load basic offline content
        this.loadOfflineContent();
        this.showUserMessage('Showing offline content', 'info');
    }

    loadOfflineContent() {
        // Populate with basic static content when data loading fails
        const offlineData = {
            personal: {
                name: 'Portfolio Owner',
                title: 'Developer & Designer',
                bio: ['Welcome to my portfolio. Content is currently unavailable, but you can still contact me using the information below.'],
                email: 'contact@example.com',
                location: 'Available for remote work'
            },
            services: [
                {
                    title: 'Web Development',
                    description: 'Full-stack web development services',
                    icon: './assets/images/icon-dev.svg'
                },
                {
                    title: 'UI/UX Design',
                    description: 'User interface and experience design',
                    icon: './assets/images/icon-design.svg'
                }
            ]
        };
        
        // Store offline data and populate
        this.data = offlineData;
        this.populatePersonalInfo();
        this.populateServices();
        
        // Hide skeletons for populated sections
        this.hideSectionSkeleton('about');
        this.hideSectionSkeleton('services');
    }

    showContactInfo() {
        // Remove error fallbacks
        const errorFallbacks = document.querySelectorAll('.error-fallback');
        errorFallbacks.forEach(error => error.remove());
        
        // Show contact information
        const contactInfo = document.createElement('div');
        contactInfo.className = 'contact-fallback';
        contactInfo.setAttribute('role', 'main');
        contactInfo.innerHTML = `
            <div class="contact-content">
                <h2>Contact Information</h2>
                <p>While the full portfolio content is unavailable, you can still reach out:</p>
                <div class="contact-methods">
                    <div class="contact-item">
                        <ion-icon name="mail-outline"></ion-icon>
                        <a href="mailto:contact@example.com">contact@example.com</a>
                    </div>
                    <div class="contact-item">
                        <ion-icon name="location-outline"></ion-icon>
                        <span>Available for remote work</span>
                    </div>
                </div>
                <button class="btn-retry" onclick="portfolioDataLoader.retryLoading()">
                    <ion-icon name="refresh-outline"></ion-icon>
                    Try Loading Again
                </button>
            </div>
        `;
        
        const mainContent = document.querySelector('main') || document.body;
        mainContent.insertBefore(contactInfo, mainContent.firstChild);
        
        this.showUserMessage('Showing contact information', 'info');
    }

    async retrySectionLoading(sectionName) {
        console.log(`Retrying loading for section: ${sectionName}`);
        
        // Hide any error skeletons for this section
        if (this.skeletonManager) {
            this.skeletonManager.hideErrorSkeleton(sectionName);
        }
        
        // Show loading skeleton
        this.showSectionSkeleton(sectionName);
        
        // Map section names to data files
        const sectionToFileMap = {
            about: 'personal',
            services: 'services',
            awards: 'awards',
            skills: 'skills',
            timeline: ['experience', 'education'],
            projects: 'projects',
            blog: 'blog'
        };
        
        const filesToLoad = sectionToFileMap[sectionName];
        if (!filesToLoad) {
            console.warn(`No data files mapped for section: ${sectionName}`);
            return;
        }
        
        const files = Array.isArray(filesToLoad) ? filesToLoad : [filesToLoad];
        
        try {
            // Retry loading the specific files for this section
            for (const file of files) {
                const cacheBuster = `?v=${Date.now()}`;
                const response = await fetch(`./data/${file}.json${cacheBuster}`, {
                    cache: 'no-cache',
                    headers: {
                        'Cache-Control': 'no-cache'
                    },
                    signal: AbortSignal.timeout(5000)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                this.data[file] = await response.json();
            }
            
            // Populate the specific section
            this.populateSection(sectionName);
            
            // Hide skeleton for this section
            this.hideSectionSkeleton(sectionName);
            
            // Show success message
            this.showUserMessage(`${sectionName} content loaded successfully!`, 'success');
            
        } catch (error) {
            console.error(`Failed to retry loading ${sectionName}:`, error);
            
            // Show error skeleton instead of regular skeleton
            if (this.skeletonManager) {
                this.skeletonManager.showErrorSkeleton(sectionName, 
                    error.message.includes('timeout') ? 'timeout' : 'network'
                );
            }
            
            // Show error message
            this.showUserMessage(`Failed to load ${sectionName} content`, 'error');
        }
    }

    populateSection(sectionName) {
        // Populate specific section based on section name
        switch (sectionName) {
            case 'about':
                this.populatePersonalInfo();
                break;
            case 'services':
                this.populateServices();
                break;
            case 'awards':
                this.populateAwards();
                break;
            case 'skills':
                this.populateSkills();
                break;
            case 'timeline':
                this.populateExperience();
                this.populateEducation();
                break;
            case 'projects':
                this.populateProjects();
                break;
            case 'blog':
                this.populateBlog();
                break;
            default:
                console.warn(`Unknown section: ${sectionName}`);
        }
    }

    showLoadingState() {
        // Show skeleton loading states for all sections using SkeletonStateManager with timeout
        const sectionsToLoad = ['about', 'services', 'awards', 'skills', 'timeline', 'projects', 'blog'];
        
        // Use enhanced skeleton display with timeout support
        sectionsToLoad.forEach((sectionName, index) => {
            setTimeout(() => {
                this.skeletonManager.showSkeletonWithTimeout(sectionName, 30000); // 30 second timeout per section
            }, index * 50); // 50ms stagger between sections
        });
        
        // Add loading class to body for global skeleton state
        document.body.classList.add('loading-skeleton');
        document.body.classList.remove('content-loaded');
    }

    hideLoadingState() {
        // Hide all skeleton loading states using SkeletonStateManager
        this.skeletonManager.hideAllSkeletons();
        
        // Update body classes to reflect content loaded state with enhanced timing
        setTimeout(() => {
            document.body.classList.remove('loading-skeleton');
            document.body.classList.add('content-loaded');
        }, 400); // Increased from 300ms to match enhanced skeleton transition timing
    }

    // Methods for controlling individual section skeleton states
    showSectionSkeleton(sectionName) {
        this.skeletonManager.showSkeleton(sectionName);
    }

    hideSectionSkeleton(sectionName) {
        this.skeletonManager.hideSkeleton(sectionName);
    }

    isSectionSkeletonActive(sectionName) {
        return this.skeletonManager.isSkeletonActive(sectionName);
    }

    async loadAllData() {
        const dataFiles = [
            'personal', 'services', 'awards', 'skills', 
            'experience', 'education', 'certifications', 'projects', 'blog'
        ];

        const loadingPromises = dataFiles.map(async (file) => {
            try {
                // Add cache-busting parameter to prevent stale data
                const cacheBuster = `?v=${Date.now()}`;
                const response = await fetch(`./data/${file}.json${cacheBuster}`, {
                    cache: 'no-cache',
                    headers: {
                        'Cache-Control': 'no-cache'
                    },
                    // Add timeout for individual file requests
                    signal: AbortSignal.timeout(5000) // 5 second timeout per file
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                this.data[file] = data;
                
                return { file, success: true, data };
            } catch (error) {
                console.warn(`Could not load ${file}.json:`, error);
                
                // Store error information for potential retry
                this.data[file] = null;
                
                return { file, success: false, error: error.message };
            }
        });

        // Wait for all files to complete (successful or failed)
        const results = await Promise.allSettled(loadingPromises);
        
        // Process results and determine if we have enough data to proceed
        const successfulLoads = results.filter(result => 
            result.status === 'fulfilled' && result.value.success
        );
        
        const failedLoads = results.filter(result => 
            result.status === 'rejected' || 
            (result.status === 'fulfilled' && !result.value.success)
        );
        
        // Log loading statistics
        console.log(`Data loading complete: ${successfulLoads.length}/${dataFiles.length} files loaded successfully`);
        
        if (failedLoads.length > 0) {
            console.warn('Failed to load files:', failedLoads.map(result => 
                result.status === 'fulfilled' ? result.value.file : 'unknown'
            ));
        }
        
        // If critical files failed to load, throw an error
        const criticalFiles = ['personal'];
        const failedCriticalFiles = failedLoads.filter(result => {
            const fileName = result.status === 'fulfilled' ? result.value.file : 'unknown';
            return criticalFiles.includes(fileName);
        });
        
        if (failedCriticalFiles.length > 0) {
            throw new Error(`Critical files failed to load: ${failedCriticalFiles.map(result => 
                result.status === 'fulfilled' ? result.value.file : 'unknown'
            ).join(', ')}`);
        }
        
        // If more than half the files failed, consider it a network error
        if (failedLoads.length > dataFiles.length / 2) {
            throw new Error('network: Too many files failed to load, possible network issue');
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

        // Update bio and hide about section skeleton
        if (personal.bio && Array.isArray(personal.bio)) {
            const aboutTextSection = document.querySelector('.about-text');
            if (aboutTextSection) {
                // Clear existing content and add new bio content
                aboutTextSection.innerHTML = personal.bio.map(paragraph => 
                    `<p>${paragraph}</p>`
                ).join('');
                
                // Hide about section skeleton after content is populated
                this.hideSectionSkeleton('about');
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

        // Clear existing content
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

        // Hide services section skeleton after content is populated
        this.hideSectionSkeleton('services');
    }

    populateAwards() {
        const awards = this.data.awards;
        if (!awards || !Array.isArray(awards)) return;

        const awardList = document.querySelector('.award-list');
        if (!awardList) return;

        // Clear existing content
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

        // Hide awards section skeleton after content is populated
        this.hideSectionSkeleton('awards');
    }

    populateSkills() {
        const skills = this.data.skills;
        if (!skills) return;

        // About page skills
        if (skills.aboutSkills) {
            const aboutSkillsList = document.querySelector('.about .skills-list');
            if (aboutSkillsList) {
                // Clear existing content
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
                // Clear existing content
                resumeSkillsList.innerHTML = '';

                skills.resumeSkills.forEach(skill => {
                    const li = document.createElement('li');
                    li.className = 'skills-item';
                    li.innerHTML = `<h5 class="h5">${skill}</h5>`;
                    resumeSkillsList.appendChild(li);
                });
            }
        }

        // Hide skills section skeleton after content is populated
        this.hideSectionSkeleton('skills');
    }

    populateExperience() {
        const experience = this.data.experience;
        if (!experience || !Array.isArray(experience)) return;

        const timelineList = document.getElementById('experience-timeline');
        if (!timelineList) return;

        // Clear existing content
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

        // Hide timeline section skeleton after content is populated
        this.hideSectionSkeleton('timeline');
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

        // Clear existing content
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

        // Hide projects section skeleton after content is populated
        this.hideSectionSkeleton('projects');
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

        // Clear existing content
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

        // Hide blog section skeleton after content is populated
        this.hideSectionSkeleton('blog');
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
    // Create global reference for error handling
    window.portfolioDataLoader = new PortfolioDataLoader();
});