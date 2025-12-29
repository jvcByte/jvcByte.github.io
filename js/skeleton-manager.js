/**
 * Skeleton State Manager
 * Manages the display and hiding of skeleton loading components with accessibility support
 */
class SkeletonStateManager {
    constructor(config = {}) {
        this.config = {
            sections: {
                about: {
                    textLines: 3,
                    enabled: true,
                    animationDelay: 0
                },
                services: {
                    cardCount: 4,
                    enabled: true,
                    animationDelay: 100
                },
                awards: {
                    cardCount: 4,
                    enabled: true,
                    animationDelay: 200
                },
                skills: {
                    itemCount: 8,
                    enabled: true,
                    animationDelay: 150
                },
                timeline: {
                    itemCount: 4,
                    enabled: true,
                    animationDelay: 250
                },
                projects: {
                    cardCount: 6,
                    enabled: true,
                    animationDelay: 300
                },
                blog: {
                    cardCount: 3,
                    enabled: true,
                    animationDelay: 400
                }
            },
            animations: {
                shimmerDuration: '1.5s',
                fadeTransition: '0.3s',
                staggerDelay: '0.1s'
            },
            accessibility: {
                announceLoading: true,
                announceComplete: true,
                respectReducedMotion: true,
                provideFocusManagement: true
            },
            ...config
        };
        
        this.activeSkeletons = new Set();
        this.loadingAnnouncements = new Map();
        this.init();
    }

    init() {
        // Check for accessibility preferences
        this.respectsReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
        this.prefersReducedTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)').matches;
        
        // Check for performance-related preferences
        this.isLowEndDevice = this.detectLowEndDevice();
        this.hasLimitedMemory = this.detectLimitedMemory();
        this.supportsBatteryAPI = 'getBattery' in navigator;
        
        // Listen for preference changes
        this.setupAccessibilityListeners();
        
        // Setup performance monitoring
        this.setupPerformanceOptimizations();
        
        // Create skeleton containers for each section
        this.createSkeletonContainers();
        
        // Setup ARIA live region for announcements
        this.setupAriaLiveRegion();
        
        // Setup intersection observer for performance
        this.setupIntersectionObserver();
    }

    detectLowEndDevice() {
        // Detect low-end devices based on various factors
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const memory = navigator.deviceMemory || 4; // Default to 4GB if not available
        const hardwareConcurrency = navigator.hardwareConcurrency || 4;
        
        // Consider device low-end if:
        // - Memory is less than 2GB
        // - CPU cores are less than 4
        // - Connection is slow (2G/3G)
        const isLowMemory = memory < 2;
        const isLowCPU = hardwareConcurrency < 4;
        const isSlowConnection = connection && (connection.effectiveType === '2g' || connection.effectiveType === '3g');
        
        return isLowMemory || isLowCPU || isSlowConnection;
    }

    detectLimitedMemory() {
        // Detect devices with limited memory
        const memory = navigator.deviceMemory || 4;
        return memory <= 2;
    }

    setupPerformanceOptimizations() {
        // Monitor battery status if available
        if (this.supportsBatteryAPI) {
            navigator.getBattery().then(battery => {
                this.batteryLevel = battery.level;
                this.isCharging = battery.charging;
                
                // Reduce animations if battery is low
                if (this.batteryLevel < 0.2 && !this.isCharging) {
                    this.enableBatterySavingMode();
                }
                
                // Listen for battery changes
                battery.addEventListener('levelchange', () => {
                    this.batteryLevel = battery.level;
                    if (this.batteryLevel < 0.2 && !battery.charging) {
                        this.enableBatterySavingMode();
                    } else if (this.batteryLevel > 0.3 || battery.charging) {
                        this.disableBatterySavingMode();
                    }
                });
                
                battery.addEventListener('chargingchange', () => {
                    this.isCharging = battery.charging;
                    if (this.isCharging) {
                        this.disableBatterySavingMode();
                    }
                });
            }).catch(() => {
                // Battery API not supported or failed
                console.log('Battery API not available');
            });
        }
        
        // Monitor page visibility for performance
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
    }

    enableBatterySavingMode() {
        document.body.classList.add('battery-saving-mode');
        this.batteryOptimized = true;
        
        // Disable complex animations
        document.querySelectorAll('.skeleton-shimmer').forEach(element => {
            element.classList.remove('skeleton-shimmer');
            element.classList.add('skeleton-pulse');
        });
        
        this.announceToScreenReader('Battery saving mode enabled, animations reduced');
    }

    disableBatterySavingMode() {
        document.body.classList.remove('battery-saving-mode');
        this.batteryOptimized = false;
        
        // Re-enable animations if motion is not reduced
        if (!this.respectsReducedMotion) {
            document.querySelectorAll('.skeleton-pulse').forEach(element => {
                element.classList.remove('skeleton-pulse');
                element.classList.add('skeleton-shimmer');
            });
        }
    }

    pauseAnimations() {
        document.querySelectorAll('.skeleton-shimmer, .skeleton-pulse').forEach(element => {
            element.style.animationPlayState = 'paused';
        });
    }

    resumeAnimations() {
        document.querySelectorAll('.skeleton-shimmer, .skeleton-pulse').forEach(element => {
            element.style.animationPlayState = 'running';
        });
    }

    setupIntersectionObserver() {
        // Only animate skeletons that are visible
        if ('IntersectionObserver' in window) {
            this.intersectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const skeletonElements = entry.target.querySelectorAll('.skeleton-shimmer, .skeleton-pulse');
                    if (entry.isIntersecting) {
                        // Start animations when skeleton comes into view
                        skeletonElements.forEach(element => {
                            element.style.animationPlayState = 'running';
                        });
                    } else {
                        // Pause animations when skeleton is out of view
                        skeletonElements.forEach(element => {
                            element.style.animationPlayState = 'paused';
                        });
                    }
                });
            }, {
                rootMargin: '50px',
                threshold: 0.1
            });
        }
    }

    setupAccessibilityListeners() {
        // Listen for reduced motion preference changes
        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        reducedMotionQuery.addEventListener('change', (e) => {
            this.respectsReducedMotion = e.matches;
            this.updateAnimationsForMotionPreference();
        });

        // Listen for high contrast preference changes
        const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
        highContrastQuery.addEventListener('change', (e) => {
            this.prefersHighContrast = e.matches;
            this.updateSkeletonsForContrastPreference();
        });
    }

    setupAriaLiveRegion() {
        // Create or find existing ARIA live region for announcements
        this.ariaLiveRegion = document.getElementById('skeleton-announcements');
        if (!this.ariaLiveRegion) {
            this.ariaLiveRegion = document.createElement('div');
            this.ariaLiveRegion.id = 'skeleton-announcements';
            this.ariaLiveRegion.setAttribute('aria-live', 'polite');
            this.ariaLiveRegion.setAttribute('aria-atomic', 'true');
            this.ariaLiveRegion.setAttribute('role', 'status');
            this.ariaLiveRegion.className = 'sr-only';
            document.body.appendChild(this.ariaLiveRegion);
        }
        
        // Create additional live region for assertive announcements
        this.assertiveLiveRegion = document.getElementById('skeleton-announcements-assertive');
        if (!this.assertiveLiveRegion) {
            this.assertiveLiveRegion = document.createElement('div');
            this.assertiveLiveRegion.id = 'skeleton-announcements-assertive';
            this.assertiveLiveRegion.setAttribute('aria-live', 'assertive');
            this.assertiveLiveRegion.setAttribute('aria-atomic', 'true');
            this.assertiveLiveRegion.setAttribute('role', 'alert');
            this.assertiveLiveRegion.className = 'sr-only';
            document.body.appendChild(this.assertiveLiveRegion);
        }
        
        // Create progress announcements region
        this.progressRegion = document.getElementById('skeleton-progress');
        if (!this.progressRegion) {
            this.progressRegion = document.createElement('div');
            this.progressRegion.id = 'skeleton-progress';
            this.progressRegion.setAttribute('aria-live', 'polite');
            this.progressRegion.setAttribute('aria-atomic', 'false');
            this.progressRegion.setAttribute('role', 'progressbar');
            this.progressRegion.setAttribute('aria-valuemin', '0');
            this.progressRegion.setAttribute('aria-valuemax', '100');
            this.progressRegion.className = 'sr-only';
            document.body.appendChild(this.progressRegion);
        }
    }

    announceToScreenReader(message, priority = 'polite', includeProgress = false) {
        if (!this.config.accessibility.announceLoading) return;
        
        const targetRegion = priority === 'assertive' ? this.assertiveLiveRegion : this.ariaLiveRegion;
        
        // Clear previous announcement
        targetRegion.textContent = '';
        
        // Use setTimeout to ensure screen readers pick up the change
        setTimeout(() => {
            targetRegion.textContent = message;
            
            // Add progress information if requested
            if (includeProgress && this.activeSkeletons.size > 0) {
                const totalSections = Object.keys(this.config.sections).length;
                const loadedSections = totalSections - this.activeSkeletons.size;
                const progressPercent = Math.round((loadedSections / totalSections) * 100);
                
                this.progressRegion.setAttribute('aria-valuenow', progressPercent.toString());
                this.progressRegion.textContent = `Loading progress: ${progressPercent}% complete`;
            }
        }, 100);
        
        // Clear the announcement after a delay to allow for new announcements
        setTimeout(() => {
            if (targetRegion.textContent === message) {
                targetRegion.textContent = '';
            }
        }, 3000);
    }

    announceLoadingProgress() {
        if (!this.config.accessibility.announceLoading) return;
        
        const totalSections = Object.keys(this.config.sections).filter(key => this.config.sections[key].enabled).length;
        const loadedSections = totalSections - this.activeSkeletons.size;
        const progressPercent = Math.round((loadedSections / totalSections) * 100);
        
        this.progressRegion.setAttribute('aria-valuenow', progressPercent.toString());
        
        if (progressPercent === 100) {
            this.announceToScreenReader('All content loaded successfully', 'polite');
            this.progressRegion.setAttribute('aria-valuenow', '100');
            this.progressRegion.textContent = 'Loading complete';
        } else {
            this.progressRegion.textContent = `Loading progress: ${progressPercent}% complete, ${this.activeSkeletons.size} sections remaining`;
        }
    }

    createSkeletonContainers() {
        // Create skeleton containers that will be inserted into the DOM
        this.skeletonContainers = {
            about: this.createAboutSkeleton(),
            services: this.createServicesSkeleton(),
            awards: this.createAwardsSkeleton(),
            skills: this.createSkillsSkeleton(),
            timeline: this.createTimelineSkeleton(),
            projects: this.createProjectsSkeleton(),
            blog: this.createBlogSkeleton()
        };
    }

    createAboutSkeleton() {
        const container = document.createElement('div');
        container.className = 'skeleton-container skeleton-about';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-label', 'Loading about section content');
        container.setAttribute('role', 'status');
        container.setAttribute('data-loading-state', 'loading');
        container.setAttribute('tabindex', '0');
        
        const srText = document.createElement('span');
        srText.className = 'sr-only';
        srText.textContent = 'Loading about section, please wait...';
        srText.id = `about-loading-${Date.now()}`;
        container.appendChild(srText);
        
        // Add skip link for keyboard users
        const skipLink = document.createElement('a');
        skipLink.href = '#about-content';
        skipLink.className = 'skeleton-skip-link sr-only';
        skipLink.textContent = 'Skip to about content when loaded';
        container.appendChild(skipLink);
        
        for (let i = 0; i < 3; i++) {
            const textSkeleton = document.createElement('div');
            textSkeleton.className = 'skeleton skeleton-shimmer skeleton-text skeleton-text-body';
            textSkeleton.setAttribute('aria-hidden', 'true');
            textSkeleton.setAttribute('aria-label', `Loading paragraph ${i + 1} of about text`);
            textSkeleton.setAttribute('role', 'presentation');
            container.appendChild(textSkeleton);
        }
        
        // Apply performance optimizations
        if (this.isLowEndDevice) {
            this.applyLowEndOptimizations(container);
        }
        
        return container;
    }

    createServicesSkeleton() {
        const container = document.createElement('div');
        container.className = 'skeleton-container skeleton-services';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-label', 'Loading services content');
        container.setAttribute('role', 'status');
        container.setAttribute('data-loading-state', 'loading');
        container.setAttribute('tabindex', '0');
        
        const srText = document.createElement('span');
        srText.className = 'sr-only';
        srText.textContent = `Loading ${this.config.sections.services.cardCount} service items, please wait...`;
        srText.id = `services-loading-${Date.now()}`;
        container.appendChild(srText);
        
        // Add skip link
        const skipLink = document.createElement('a');
        skipLink.href = '#services-content';
        skipLink.className = 'skeleton-skip-link sr-only';
        skipLink.textContent = 'Skip to services content when loaded';
        container.appendChild(skipLink);
        
        for (let i = 0; i < this.config.sections.services.cardCount; i++) {
            const serviceCard = document.createElement('li');
            serviceCard.className = `skeleton-card skeleton-service-card`;
            serviceCard.setAttribute('aria-hidden', 'true');
            serviceCard.setAttribute('aria-label', `Loading service ${i + 1} of ${this.config.sections.services.cardCount}`);
            serviceCard.setAttribute('role', 'presentation');
            serviceCard.innerHTML = `
                <div class="skeleton skeleton-shimmer skeleton-image skeleton-service-icon" 
                     aria-label="Loading service icon" role="presentation"></div>
                <div class="skeleton-content">
                    <div class="skeleton skeleton-shimmer skeleton-text skeleton-text-h4" 
                         aria-label="Loading service title" role="presentation"></div>
                    <div class="skeleton skeleton-shimmer skeleton-text skeleton-text-body" 
                         aria-label="Loading service description line 1" role="presentation"></div>
                    <div class="skeleton skeleton-shimmer skeleton-text skeleton-text-body" 
                         aria-label="Loading service description line 2" role="presentation"></div>
                </div>
            `;
            container.appendChild(serviceCard);
        }
        
        // Apply performance optimizations
        if (this.isLowEndDevice) {
            this.applyLowEndOptimizations(container);
        }
        
        return container;
    }

    createAwardsSkeleton() {
        const container = document.createElement('div');
        container.className = 'skeleton-container skeleton-awards';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-label', 'Loading awards content');
        container.setAttribute('role', 'status');
        
        const srText = document.createElement('span');
        srText.className = 'sr-only';
        srText.textContent = 'Loading awards section, please wait...';
        container.appendChild(srText);
        
        for (let i = 0; i < this.config.sections.awards.cardCount; i++) {
            const awardItem = document.createElement('li');
            awardItem.className = `skeleton-award-item`;
            awardItem.setAttribute('aria-hidden', 'true');
            awardItem.innerHTML = `
                <div class="skeleton-award-icon-box">
                    <div class="skeleton skeleton-shimmer skeleton-award-image"></div>
                </div>
                <div class="skeleton-award-content-box">
                    <div class="skeleton skeleton-shimmer skeleton-text skeleton-text-h4"></div>
                    <div class="skeleton skeleton-shimmer skeleton-text skeleton-text-body"></div>
                </div>
            `;
            container.appendChild(awardItem);
        }
        
        return container;
    }

    createSkillsSkeleton() {
        const container = document.createElement('div');
        container.className = 'skeleton-container skeleton-skills';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-label', 'Loading skills content');
        container.setAttribute('role', 'status');
        
        const srText = document.createElement('span');
        srText.className = 'sr-only';
        srText.textContent = 'Loading skills section, please wait...';
        container.appendChild(srText);
        
        for (let i = 0; i < this.config.sections.skills.itemCount; i++) {
            const skillItem = document.createElement('li');
            skillItem.className = `skeleton skeleton-shimmer skeleton-skills-item`;
            skillItem.setAttribute('aria-hidden', 'true');
            container.appendChild(skillItem);
        }
        
        return container;
    }

    createTimelineSkeleton() {
        const container = document.createElement('div');
        container.className = 'skeleton-container skeleton-timeline';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-label', 'Loading timeline content');
        container.setAttribute('role', 'status');
        
        const srText = document.createElement('span');
        srText.className = 'sr-only';
        srText.textContent = 'Loading timeline section, please wait...';
        container.appendChild(srText);
        
        for (let i = 0; i < this.config.sections.timeline.itemCount; i++) {
            const timelineItem = document.createElement('li');
            timelineItem.className = `skeleton-timeline-item`;
            timelineItem.setAttribute('aria-hidden', 'true');
            timelineItem.innerHTML = `
                <div class="skeleton skeleton-shimmer skeleton-text skeleton-text-h4"></div>
                <div class="skeleton skeleton-shimmer skeleton-text skeleton-text-body"></div>
                <div class="skeleton skeleton-shimmer skeleton-text skeleton-text-body"></div>
            `;
            container.appendChild(timelineItem);
        }
        
        return container;
    }

    createProjectsSkeleton() {
        const container = document.createElement('div');
        container.className = 'skeleton-container skeleton-projects';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-label', 'Loading projects content');
        container.setAttribute('role', 'status');
        
        const srText = document.createElement('span');
        srText.className = 'sr-only';
        srText.textContent = 'Loading projects section, please wait...';
        container.appendChild(srText);
        
        for (let i = 0; i < this.config.sections.projects.cardCount; i++) {
            const projectCard = document.createElement('li');
            projectCard.className = `skeleton-card skeleton-project-card`;
            projectCard.setAttribute('aria-hidden', 'true');
            projectCard.innerHTML = `
                <div class="skeleton skeleton-shimmer skeleton-image skeleton-project-image"></div>
                <div class="skeleton-content">
                    <div class="skeleton skeleton-shimmer skeleton-text skeleton-text-h4"></div>
                    <div class="skeleton skeleton-shimmer skeleton-text skeleton-text-body"></div>
                    <div class="skeleton skeleton-shimmer skeleton-text skeleton-text-body"></div>
                    <div class="skeleton skeleton-shimmer skeleton-text skeleton-text-body"></div>
                </div>
            `;
            container.appendChild(projectCard);
        }
        
        return container;
    }

    createBlogSkeleton() {
        const container = document.createElement('div');
        container.className = 'skeleton-container skeleton-blog';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-label', 'Loading blog posts content');
        container.setAttribute('role', 'status');
        
        const srText = document.createElement('span');
        srText.className = 'sr-only';
        srText.textContent = 'Loading blog posts section, please wait...';
        container.appendChild(srText);
        
        for (let i = 0; i < this.config.sections.blog.cardCount; i++) {
            const blogCard = document.createElement('li');
            blogCard.className = `skeleton-card skeleton-blog-card`;
            blogCard.setAttribute('aria-hidden', 'true');
            blogCard.innerHTML = `
                <div class="skeleton skeleton-shimmer skeleton-image skeleton-blog-image"></div>
                <div class="skeleton-content">
                    <div class="skeleton-meta">
                        <div class="skeleton skeleton-shimmer skeleton-text"></div>
                        <div class="skeleton-dot"></div>
                        <div class="skeleton skeleton-shimmer skeleton-text"></div>
                    </div>
                    <div class="skeleton skeleton-shimmer skeleton-text skeleton-text-h4"></div>
                    <div class="skeleton skeleton-shimmer skeleton-text skeleton-text-body"></div>
                    <div class="skeleton skeleton-shimmer skeleton-text skeleton-text-body"></div>
                </div>
            `;
            container.appendChild(blogCard);
        }
        
        return container;
    }

    showSkeleton(sectionName) {
        if (!this.config.sections[sectionName]?.enabled) {
            return;
        }

        const targetElement = this.getTargetElement(sectionName);
        if (!targetElement) {
            console.warn(`Target element for section "${sectionName}" not found`);
            return;
        }

        // Announce loading to screen readers with progress
        this.announceToScreenReader(`Loading ${sectionName} content`, 'polite', true);

        // Hide actual content
        targetElement.style.display = 'none';
        targetElement.setAttribute('aria-hidden', 'true');
        targetElement.setAttribute('aria-busy', 'true');

        // Insert skeleton if not already present
        const existingSkeleton = targetElement.parentNode.querySelector('.skeleton-container');
        if (!existingSkeleton) {
            const skeletonContainer = this.skeletonContainers[sectionName];
            if (skeletonContainer) {
                // Apply accessibility preferences and performance optimizations
                this.applyAccessibilityPreferences(skeletonContainer);
                
                // Set up intersection observer for performance
                if (this.intersectionObserver) {
                    this.intersectionObserver.observe(skeletonContainer);
                }
                
                // Add loading state attributes
                skeletonContainer.setAttribute('data-section', sectionName);
                skeletonContainer.setAttribute('data-loading-start', Date.now().toString());
                
                targetElement.parentNode.insertBefore(skeletonContainer, targetElement);
                
                // Focus management for accessibility
                if (this.config.accessibility.provideFocusManagement) {
                    skeletonContainer.focus();
                }
            }
        }

        this.activeSkeletons.add(sectionName);
        
        // Add loading class to body for global skeleton state
        document.body.classList.add('loading-skeleton');
        document.body.setAttribute('aria-busy', 'true');
        
        // Update progress
        this.announceLoadingProgress();
    }

    hideSkeleton(sectionName) {
        const targetElement = this.getTargetElement(sectionName);
        if (!targetElement) {
            return;
        }

        const skeletonContainer = targetElement.parentNode.querySelector('.skeleton-container');
        
        if (skeletonContainer) {
            // Calculate loading time for performance monitoring
            const loadingStart = parseInt(skeletonContainer.getAttribute('data-loading-start') || '0');
            const loadingTime = Date.now() - loadingStart;
            
            // Log performance metrics (could be sent to analytics)
            if (loadingTime > 0) {
                console.log(`Section ${sectionName} loaded in ${loadingTime}ms`);
            }
            
            // Update ARIA live region to announce completion
            if (this.config.accessibility.announceComplete) {
                this.announceToScreenReader(`${sectionName} content loaded successfully`, 'polite', true);
            }
            
            // Enhanced smooth transition out with better timing
            skeletonContainer.classList.add('skeleton-transition', 'fade-out');
            skeletonContainer.setAttribute('aria-hidden', 'true');
            skeletonContainer.setAttribute('data-loading-state', 'complete');
            
            // Disconnect intersection observer
            if (this.intersectionObserver) {
                this.intersectionObserver.unobserve(skeletonContainer);
            }
            
            // Use longer timeout for smoother transition
            setTimeout(() => {
                if (skeletonContainer.parentNode) {
                    skeletonContainer.parentNode.removeChild(skeletonContainer);
                }
                
                // Show actual content with enhanced fade in and staggered animations
                targetElement.style.display = '';
                targetElement.removeAttribute('aria-hidden');
                targetElement.removeAttribute('aria-busy');
                targetElement.classList.add('content-transition', 'fade-in', 'content-fade-in');
                
                // Apply staggered animations to child elements
                this.applyStaggeredAnimations(targetElement, sectionName);
                
                // Manage focus if needed
                if (this.config.accessibility.provideFocusManagement) {
                    this.manageFocusTransition(targetElement, sectionName);
                }
                
                // Clean up transition classes after animation completes
                setTimeout(() => {
                    targetElement.classList.remove('content-transition', 'fade-in', 'content-fade-in');
                    this.cleanupStaggeredAnimations(targetElement);
                }, 800); // Longer timeout to account for staggered animations
                
            }, this.respectsReducedMotion ? 100 : 400); // Faster transition for reduced motion
        } else {
            // No skeleton to hide, just show content with fade in
            targetElement.style.display = '';
            targetElement.removeAttribute('aria-hidden');
            targetElement.removeAttribute('aria-busy');
            
            if (!this.respectsReducedMotion) {
                targetElement.classList.add('content-transition', 'fade-in', 'content-fade-in');
                this.applyStaggeredAnimations(targetElement, sectionName);
            }
            
            // Announce completion
            if (this.config.accessibility.announceComplete) {
                this.announceToScreenReader(`${sectionName} content loaded successfully`, 'polite', true);
            }
            
            if (!this.respectsReducedMotion) {
                setTimeout(() => {
                    targetElement.classList.remove('content-transition', 'fade-in', 'content-fade-in');
                    this.cleanupStaggeredAnimations(targetElement);
                }, 800);
            }
        }

        this.activeSkeletons.delete(sectionName);
        
        // Remove loading class if no skeletons are active
        if (this.activeSkeletons.size === 0) {
            document.body.classList.remove('loading-skeleton');
            document.body.classList.add('content-loaded');
            document.body.removeAttribute('aria-busy');
            
            // Final announcement when all content is loaded
            if (this.config.accessibility.announceComplete) {
                this.announceToScreenReader('All content loaded successfully', 'polite');
            }
            
            // Update progress to 100%
            this.announceLoadingProgress();
        } else {
            // Update progress for remaining sections
            this.announceLoadingProgress();
        }
    }

    applyLowEndOptimizations(container) {
        // Remove shimmer animations on low-end devices
        const shimmerElements = container.querySelectorAll('.skeleton-shimmer');
        shimmerElements.forEach(element => {
            element.classList.remove('skeleton-shimmer');
            element.classList.add('skeleton-pulse');
        });
        
        // Simplify complex elements
        const complexElements = container.querySelectorAll('.skeleton-card::before, .skeleton-project-card::before, .skeleton-blog-card::before');
        complexElements.forEach(element => {
            element.style.display = 'none';
        });
        
        // Add low-end device class
        container.classList.add('low-end-device');
    }

    applyAccessibilityPreferences(container) {
        // Apply reduced motion if needed
        if (this.respectsReducedMotion) {
            this.applyReducedMotion(container);
        }
        
        // Apply high contrast adjustments
        if (this.prefersHighContrast) {
            container.classList.add('high-contrast');
        }
        
        // Apply reduced transparency adjustments
        if (this.prefersReducedTransparency) {
            container.classList.add('reduced-transparency');
        }
        
        // Apply low-end device optimizations
        if (this.isLowEndDevice) {
            this.applyLowEndOptimizations(container);
        }
        
        // Apply battery saving optimizations
        if (this.batteryOptimized) {
            container.classList.add('battery-optimized');
            this.applyReducedMotion(container);
        }
    }

    updateAnimationsForMotionPreference() {
        // Update all active skeletons based on motion preference
        document.querySelectorAll('.skeleton-container').forEach(container => {
            if (this.respectsReducedMotion) {
                this.applyReducedMotion(container);
            } else {
                this.restoreFullMotion(container);
            }
        });
    }

    updateSkeletonsForContrastPreference() {
        // Update all active skeletons based on contrast preference
        document.querySelectorAll('.skeleton-container').forEach(container => {
            if (this.prefersHighContrast) {
                container.classList.add('high-contrast');
            } else {
                container.classList.remove('high-contrast');
            }
        });
    }

    manageFocusTransition(targetElement, sectionName) {
        // If there was a focused element in the skeleton, try to focus the corresponding real element
        const focusableElements = targetElement.querySelectorAll(
            'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            // Focus the first focusable element with a slight delay to ensure it's visible
            setTimeout(() => {
                focusableElements[0].focus();
            }, 100);
        }
    }

    hideAllSkeletons() {
        const sectionsToHide = Array.from(this.activeSkeletons);
        sectionsToHide.forEach(sectionName => {
            this.hideSkeleton(sectionName);
        });
    }

    isSkeletonActive(sectionName) {
        return this.activeSkeletons.has(sectionName);
    }

    getTargetElement(sectionName) {
        const selectors = {
            about: '.about-text',
            services: '.service-list',
            awards: '.award-list',
            skills: '.skills-list',
            timeline: '.timeline-list',
            projects: '.project-list',
            blog: '.blog-posts-list'
        };

        const selector = selectors[sectionName];
        if (!selector) {
            console.warn(`No selector defined for section "${sectionName}"`);
            return null;
        }

        // For skills, we need to handle both about and resume sections
        if (sectionName === 'skills') {
            // Try to find the currently active page's skills section
            const activeArticle = document.querySelector('article.active');
            if (activeArticle) {
                return activeArticle.querySelector(selector);
            }
            // Fallback to about page skills
            return document.querySelector('.about .skills-list');
        }

        // For timeline, we need to handle both education and experience
        if (sectionName === 'timeline') {
            // Try experience timeline first, then education
            return document.querySelector('#experience-timeline') || 
                   document.querySelector('.resume .timeline-list');
        }

        return document.querySelector(selector);
    }

    applyReducedMotion(container) {
        const shimmerElements = container.querySelectorAll('.skeleton-shimmer');
        shimmerElements.forEach(element => {
            element.classList.remove('skeleton-shimmer');
            element.classList.add('skeleton-pulse');
        });
    }

    restoreFullMotion(container) {
        const pulseElements = container.querySelectorAll('.skeleton-pulse');
        pulseElements.forEach(element => {
            element.classList.remove('skeleton-pulse');
            element.classList.add('skeleton-shimmer');
        });
    }

    // Apply staggered animations to child elements for smooth content reveal
    applyStaggeredAnimations(targetElement, sectionName) {
        // Skip staggered animations if reduced motion is preferred
        if (this.respectsReducedMotion) {
            return;
        }
        
        const childSelectors = {
            services: '.service-item',
            awards: '.award-item',
            skills: '.skills-item',
            timeline: '.timeline-item',
            projects: '.project-item',
            blog: '.blog-post-item'
        };

        const selector = childSelectors[sectionName];
        if (selector) {
            const childElements = targetElement.querySelectorAll(selector);
            childElements.forEach((element, index) => {
                // Reset any existing animations
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px) scale(0.95)';
                
                // Apply staggered animation class
                element.classList.add('staggered-fade-in');
                
                // Set animation delay based on index
                const delay = (index + 1) * 0.1; // 100ms stagger
                element.style.animationDelay = `${delay}s`;
            });
        }
    }

    // Clean up staggered animation classes and styles
    cleanupStaggeredAnimations(targetElement) {
        const staggeredElements = targetElement.querySelectorAll('.staggered-fade-in');
        staggeredElements.forEach(element => {
            element.classList.remove('staggered-fade-in');
            element.style.opacity = '';
            element.style.transform = '';
            element.style.animationDelay = '';
        });
    }

    // Method to show skeletons for specific sections with staggered timing
    showSkeletonsWithDelay(sections) {
        sections.forEach((sectionName, index) => {
            setTimeout(() => {
                this.showSkeleton(sectionName);
            }, index * 50); // 50ms stagger between sections
        });
    }

    // Method to hide skeletons for specific sections with staggered timing
    hideSkeletonsWithDelay(sections) {
        sections.forEach((sectionName, index) => {
            setTimeout(() => {
                this.hideSkeleton(sectionName);
            }, index * 50); // 50ms stagger between sections
        });
    }

    // Method to update accessibility configuration
    updateAccessibilityConfig(newConfig) {
        this.config.accessibility = { ...this.config.accessibility, ...newConfig };
    }

    // Method to get current accessibility status
    getAccessibilityStatus() {
        return {
            respectsReducedMotion: this.respectsReducedMotion,
            prefersHighContrast: this.prefersHighContrast,
            prefersReducedTransparency: this.prefersReducedTransparency,
            activeSkeletons: Array.from(this.activeSkeletons),
            config: this.config.accessibility
        };
    }

    // Error handling methods for skeleton states
    showErrorSkeleton(sectionName, errorType = 'generic') {
        const targetElement = this.getTargetElement(sectionName);
        if (!targetElement) {
            console.warn(`Target element for section "${sectionName}" not found`);
            return;
        }

        // Hide normal skeleton if present
        this.hideSkeleton(sectionName);

        // Create error skeleton
        const errorSkeleton = this.createErrorSkeleton(sectionName, errorType);
        
        // Hide actual content
        targetElement.style.display = 'none';
        targetElement.setAttribute('aria-hidden', 'true');
        
        // Insert error skeleton
        targetElement.parentNode.insertBefore(errorSkeleton, targetElement);
        
        // Announce error to screen readers
        this.announceToScreenReader(
            `Error loading ${sectionName} content. Retry options available.`, 
            'assertive'
        );
    }

    createErrorSkeleton(sectionName, errorType) {
        const container = document.createElement('div');
        container.className = `skeleton-error skeleton-error-${sectionName}`;
        container.setAttribute('role', 'alert');
        container.setAttribute('aria-live', 'assertive');
        container.setAttribute('data-section', sectionName);
        container.setAttribute('data-error-type', errorType);
        
        const errorMessages = {
            timeout: 'Loading timeout',
            network: 'Connection error',
            generic: 'Loading failed'
        };
        
        const message = errorMessages[errorType] || errorMessages.generic;
        
        container.innerHTML = `
            <div class="skeleton-error-content">
                <div class="skeleton-error-icon">
                    <ion-icon name="alert-circle-outline"></ion-icon>
                </div>
                <p class="skeleton-error-message">${message}</p>
                <button class="skeleton-retry-btn" onclick="portfolioDataLoader.retrySectionLoading('${sectionName}')">
                    <ion-icon name="refresh-outline"></ion-icon>
                    Retry
                </button>
            </div>
        `;
        
        return container;
    }

    hideErrorSkeleton(sectionName) {
        const errorSkeletons = document.querySelectorAll(`.skeleton-error-${sectionName}`);
        errorSkeletons.forEach(skeleton => {
            if (skeleton.parentNode) {
                skeleton.parentNode.removeChild(skeleton);
            }
        });
    }

    // Method to handle section-specific retry
    retrySectionLoading(sectionName) {
        // Hide error skeleton
        this.hideErrorSkeleton(sectionName);
        
        // Show loading skeleton again
        this.showSkeleton(sectionName);
        
        // Announce retry to screen readers
        this.announceToScreenReader(`Retrying to load ${sectionName} content`, 'polite');
    }

    // Method to show skeleton with timeout
    showSkeletonWithTimeout(sectionName, timeout = 30000) {
        this.showSkeleton(sectionName);
        
        // Set timeout for this specific section
        const timeoutId = setTimeout(() => {
            if (this.isSkeletonActive(sectionName)) {
                this.showErrorSkeleton(sectionName, 'timeout');
            }
        }, timeout);
        
        // Store timeout ID for potential cleanup
        if (!this.sectionTimeouts) {
            this.sectionTimeouts = new Map();
        }
        this.sectionTimeouts.set(sectionName, timeoutId);
    }

    // Method to clear section timeout
    clearSectionTimeout(sectionName) {
        if (this.sectionTimeouts && this.sectionTimeouts.has(sectionName)) {
            clearTimeout(this.sectionTimeouts.get(sectionName));
            this.sectionTimeouts.delete(sectionName);
        }
    }

    // Enhanced hide skeleton that clears timeouts
    hideSkeleton(sectionName) {
        // Clear any pending timeouts for this section
        this.clearSectionTimeout(sectionName);
        
        const targetElement = this.getTargetElement(sectionName);
        if (!targetElement) {
            return;
        }

        const skeletonContainer = targetElement.parentNode.querySelector('.skeleton-container');
        
        if (skeletonContainer) {
            // Calculate loading time for performance monitoring
            const loadingStart = parseInt(skeletonContainer.getAttribute('data-loading-start') || '0');
            const loadingTime = Date.now() - loadingStart;
            
            // Log performance metrics (could be sent to analytics)
            if (loadingTime > 0) {
                console.log(`Section ${sectionName} loaded in ${loadingTime}ms`);
            }
            
            // Update ARIA live region to announce completion
            if (this.config.accessibility.announceComplete) {
                this.announceToScreenReader(`${sectionName} content loaded successfully`, 'polite', true);
            }
            
            // Enhanced smooth transition out with better timing
            skeletonContainer.classList.add('skeleton-transition', 'fade-out');
            skeletonContainer.setAttribute('aria-hidden', 'true');
            skeletonContainer.setAttribute('data-loading-state', 'complete');
            
            // Disconnect intersection observer
            if (this.intersectionObserver) {
                this.intersectionObserver.unobserve(skeletonContainer);
            }
            
            // Use longer timeout for smoother transition
            setTimeout(() => {
                if (skeletonContainer.parentNode) {
                    skeletonContainer.parentNode.removeChild(skeletonContainer);
                }
                
                // Show actual content with enhanced fade in and staggered animations
                targetElement.style.display = '';
                targetElement.removeAttribute('aria-hidden');
                targetElement.removeAttribute('aria-busy');
                targetElement.classList.add('content-transition', 'fade-in', 'content-fade-in');
                
                // Apply staggered animations to child elements
                this.applyStaggeredAnimations(targetElement, sectionName);
                
                // Manage focus if needed
                if (this.config.accessibility.provideFocusManagement) {
                    this.manageFocusTransition(targetElement, sectionName);
                }
                
                // Clean up transition classes after animation completes
                setTimeout(() => {
                    targetElement.classList.remove('content-transition', 'fade-in', 'content-fade-in');
                    this.cleanupStaggeredAnimations(targetElement);
                }, 800);
                
            }, this.respectsReducedMotion ? 100 : 400); // Faster transition for reduced motion
        } else {
            // No skeleton to hide, just show content with fade in
            targetElement.style.display = '';
            targetElement.removeAttribute('aria-hidden');
            targetElement.removeAttribute('aria-busy');
            
            if (!this.respectsReducedMotion) {
                targetElement.classList.add('content-transition', 'fade-in', 'content-fade-in');
                this.applyStaggeredAnimations(targetElement, sectionName);
            }
            
            // Announce completion
            if (this.config.accessibility.announceComplete) {
                this.announceToScreenReader(`${sectionName} content loaded successfully`, 'polite', true);
            }
            
            if (!this.respectsReducedMotion) {
                setTimeout(() => {
                    targetElement.classList.remove('content-transition', 'fade-in', 'content-fade-in');
                    this.cleanupStaggeredAnimations(targetElement);
                }, 800);
            }
        }

        this.activeSkeletons.delete(sectionName);
        
        // Remove loading class if no skeletons are active
        if (this.activeSkeletons.size === 0) {
            document.body.classList.remove('loading-skeleton');
            document.body.classList.add('content-loaded');
            document.body.removeAttribute('aria-busy');
            
            // Final announcement when all content is loaded
            if (this.config.accessibility.announceComplete) {
                this.announceToScreenReader('All content loaded successfully', 'polite');
            }
            
            // Update progress to 100%
            this.announceLoadingProgress();
        } else {
            // Update progress for remaining sections
            this.announceLoadingProgress();
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkeletonStateManager;
}