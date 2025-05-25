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
    const projectDetailsCloseBtn = document.querySelector('.details-close-btn');
    const projectDetails = document.querySelector('.project-details');

    // ===== Navigation Functions =====
    
    // Toggle mobile navigation menu
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
        });
    }

    // Close mobile menu when clicking a link
    navLinksList.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Navbar background on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

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
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    // Add scroll event for active nav link update
    window.addEventListener('scroll', updateActiveNavLink);

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
            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to selected tab and content
            button.classList.add('active');
            const tabId = `${button.getAttribute('data-tab')}-tab`;
            document.getElementById(tabId).classList.add('active');
            
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
            }
        });
    });

    // Close project details modal
    if (projectDetailsCloseBtn) {
        projectDetailsCloseBtn.addEventListener('click', () => {
            projectDetails.style.display = 'none';
            document.body.style.overflow = 'auto'; // Re-enable scrolling
        });
    }

    // Close modal when clicking outside content
    if (projectDetails) {
        projectDetails.addEventListener('click', (e) => {
            if (e.target === projectDetails) {
                projectDetails.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Close modal on Escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && projectDetails && projectDetails.style.display === 'flex') {
            projectDetails.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // ===== Intersection Observer for Animation =====
    
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

    // Smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}); 