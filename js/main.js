/*
 * Main JavaScript file for Faturrachman's Portfolio Website
 * Handles navigation, animations, and interactive elements
 */

document.addEventListener('DOMContentLoaded', () => {
    // Global variables
    const navbar = document.getElementById('main-nav');
    const navToggle = document.querySelector('.navbar-toggle');
    const navLinks = document.querySelector('.navbar-links');
    const navLinksList = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    const skillBars = document.querySelectorAll('.skill-progress');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const projectDetailsBtns = document.querySelectorAll('.project-details-btn');
    const projectDetailsCloseBtns = document.querySelectorAll('.details-close-btn');
    const projectDetails = document.querySelectorAll('.project-details');

    // Performance optimization: Debounce function to limit function calls
    const debounce = (func, delay) => {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    };

    // ===== Navigation Functions =====
    
    // Toggle mobile navigation menu
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            
            // Toggle aria-hidden on the nav links when mobile menu is toggled
            navLinks.setAttribute('aria-hidden', isExpanded);
        });
    }

    // Close mobile menu when clicking a link
    navLinksList.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            navLinks.setAttribute('aria-hidden', 'true');
        });
    });

    // Navbar background on scroll
    window.addEventListener('scroll', debounce(() => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, 10));

    // Active navigation link based on scroll position
    function updateActiveNavLink() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100; // Adjust for navbar height
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinksList.forEach(link => {
            link.classList.remove('active');
            link.setAttribute('aria-current', 'false');
            
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });
    }

    // Add scroll event for active nav link update
    window.addEventListener('scroll', debounce(updateActiveNavLink, 100));

    // ===== Skills Section Functions =====
    
    // Animate skill bars when they come into view
    function animateSkillBars() {
        skillBars.forEach(bar => {
            const targetWidth = bar.style.width;
            bar.style.width = '0';
            
            // Set the width to the target value after a small delay (to allow for the transition)
            setTimeout(() => {
                bar.style.width = targetWidth;
            }, 100);
        });
    }

    // Tab functionality for skills section
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            
            tabContents.forEach(content => {
                content.classList.remove('active');
                content.setAttribute('aria-hidden', 'true');
            });
            
            // Add active class to selected tab and content
            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');
            
            const contentElement = document.getElementById(`${tabId}-tab`);
            contentElement.classList.add('active');
            contentElement.setAttribute('aria-hidden', 'false');
            
            // Re-animate the skill bars in the newly visible tab
            animateSkillBars();
        });
    });

    // ===== Project Details Functions =====
    
    // Open project details modal
    projectDetailsBtns.forEach(button => {
        button.addEventListener('click', (e) => {
            const projectCard = e.target.closest('.project-card');
            const projectDetails = projectCard.querySelector('.project-details');
            
            if (projectDetails) {
                projectDetails.style.display = 'flex';
                document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
                
                // Set focus on the close button for accessibility
                const closeBtn = projectDetails.querySelector('.details-close-btn');
                if (closeBtn) {
                    setTimeout(() => closeBtn.focus(), 100);
                }
                
                // For accessibility
                projectDetails.setAttribute('aria-hidden', 'false');
            }
        });
    });

    // Close project details modal
    projectDetailsCloseBtns.forEach(button => {
        button.addEventListener('click', (e) => {
            const projectDetails = e.target.closest('.project-details');
            if (projectDetails) {
                projectDetails.style.display = 'none';
                document.body.style.overflow = 'auto'; // Re-enable scrolling
                projectDetails.setAttribute('aria-hidden', 'true');
                
                // Return focus to the button that opened the modal
                const projectCard = projectDetails.closest('.project-card');
                const openButton = projectCard.querySelector('.project-details-btn');
                if (openButton) {
                    openButton.focus();
                }
            }
        });
    });

    // Close modal when clicking outside content
    projectDetails.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                modal.setAttribute('aria-hidden', 'true');
                
                // Return focus to the button that opened the modal
                const projectCard = modal.closest('.project-card');
                const openButton = projectCard.querySelector('.project-details-btn');
                if (openButton) {
                    openButton.focus();
                }
            }
        });
    });

    // Close modal on Escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            projectDetails.forEach(modal => {
                if (modal.style.display === 'flex') {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    modal.setAttribute('aria-hidden', 'true');
                    
                    // Return focus to the button that opened the modal
                    const projectCard = modal.closest('.project-card');
                    const openButton = projectCard.querySelector('.project-details-btn');
                    if (openButton) {
                        openButton.focus();
                    }
                }
            });
        }
    });

    // ===== Intersection Observer for Animation =====
    
    // Check if Intersection Observer is supported
    if ('IntersectionObserver' in window) {
        // Set up observer for elements that should animate when in view
        const animateOnScroll = () => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Check if it's the skills section
                        if (entry.target.classList.contains('skills-section')) {
                            animateSkillBars();
                        }
                        
                        entry.target.classList.add('animate');
                        observer.unobserve(entry.target); // Stop observing once animated
                    }
                });
            }, { threshold: 0.1 }); // Trigger when 10% of the element is visible
            
            // Observe all sections for animation
            sections.forEach(section => {
                observer.observe(section);
            });
        };

        // Initialize the animations
        animateOnScroll();
    } else {
        // Fallback for browsers that don't support Intersection Observer
        sections.forEach(section => {
            section.classList.add('animate');
        });
        
        // Animate skill bars immediately
        setTimeout(animateSkillBars, 500);
    }

    // Smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return; // Ignore links with just "#"
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Check if browser supports smooth scrolling
                if ('scrollBehavior' in document.documentElement.style) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                } else {
                    // Fallback for browsers that don't support smooth scrolling
                    window.scrollTo(0, targetElement.offsetTop - 70); // Account for fixed header
                }
            }
        });
    });
    
    // Initialize page
    updateActiveNavLink(); // Set the initial active nav link
}); 