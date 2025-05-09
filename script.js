// Material Design inspired animations and interactions

document.addEventListener('DOMContentLoaded', function() {
    // Set current year for copyright
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Hamburger menu functionality
    const hamburger = document.querySelector('.hamburger-menu');
    const navMenu = document.querySelector('.nav-menu');
    
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);
    
    function toggleMenu() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        
        // Prevent scrolling when menu is open
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
    
    hamburger.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
    
    // Close menu when clicking on a nav link (mobile)
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a, .footer-links a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Form submission handling
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real implementation, you would send the form data to a server
            // For now, we'll just show a success message
            const formElements = contactForm.elements;
            let isValid = true;
            
            // Simple validation
            for (let i = 0; i < formElements.length; i++) {
                if (formElements[i].hasAttribute('required') && !formElements[i].value) {
                    isValid = false;
                    formElements[i].classList.add('error');
                } else {
                    formElements[i].classList.remove('error');
                }
            }
            
            if (isValid) {
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'success-message';
                successMessage.textContent = 'Thank you for your message! I will get back to you soon.';
                
                // Replace form with success message
                contactForm.parentNode.replaceChild(successMessage, contactForm);
            }
        });
    }
    
    // Animate skill bars on scroll
    const skillBars = document.querySelectorAll('.skill-level');
    
    // Initial state - set width to 0
    skillBars.forEach(bar => {
        bar.style.transition = 'none';
        bar.dataset.width = bar.style.width;
        bar.style.width = '0';
    });
    
    // Function to check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0
        );
    }
    
    // Function to animate elements when they come into view
    function animateOnScroll() {
        // Animate skill bars
        skillBars.forEach(bar => {
            if (isInViewport(bar) && bar.style.width === '0px') {
                bar.style.transition = 'width 1s ease-in-out';
                bar.style.width = bar.dataset.width;
            }
        });
        
        // Animate timeline items
        document.querySelectorAll('.timeline-item').forEach((item, index) => {
            if (isInViewport(item) && !item.classList.contains('animated')) {
                item.classList.add('animated');
                item.style.animation = `fadeInSlide 0.5s ease-out ${index * 0.2}s forwards`;
            }
        });
        
        // Animate project cards
        document.querySelectorAll('.project-card').forEach((card, index) => {
            if (isInViewport(card) && !card.classList.contains('animated')) {
                card.classList.add('animated');
                card.style.animation = `fadeInUp 0.5s ease-out ${index * 0.1}s forwards`;
            }
        });
    }
    
    // Run on scroll and on page load
    window.addEventListener('scroll', animateOnScroll);
    // Slight delay to ensure DOM is fully loaded
    setTimeout(animateOnScroll, 300);
    
    // Video Modal Functionality
    const videoModal = document.getElementById('video-modal');
    const modalVideo = document.getElementById('modal-video');
    const videoSource = modalVideo.querySelector('source');
    const closeModal = document.querySelector('.close-modal');
    const videoLinks = document.querySelectorAll('.video-link');
    
    // Open modal when clicking on a video link
    videoLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const videoSrc = this.getAttribute('data-video');
            videoSource.setAttribute('src', videoSrc);
            modalVideo.load(); // Important: reload the video with new source
            
            // Show modal with animation
            videoModal.style.display = 'flex';
            setTimeout(() => {
                videoModal.classList.add('show');
            }, 10);
            
            // Start playing the video
            modalVideo.play();
            
            // Prevent body scrolling
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Close modal function
    function closeVideoModal() {
        modalVideo.pause();
        videoModal.classList.remove('show');
        
        // Wait for animation to complete before hiding
        setTimeout(() => {
            videoModal.style.display = 'none';
            videoSource.setAttribute('src', '');
            modalVideo.load();
        }, 300);
        
        // Re-enable body scrolling
        document.body.style.overflow = '';
    }
    
    // Close modal when clicking the close button
    closeModal.addEventListener('click', closeVideoModal);
    
    // Close modal when clicking outside the content
    videoModal.addEventListener('click', function(e) {
        if (e.target === videoModal) {
            closeVideoModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && videoModal.classList.contains('show')) {
            closeVideoModal();
        }
    });
});

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInSlide {
        from {
            opacity: 0;
            transform: translateX(${window.innerWidth > 768 ? '50px' : '20px'});
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .timeline-item, .project-card {
        opacity: 0;
    }
    
    .success-message {
        background-color: var(--primary-color);
        color: var(--text-on-primary);
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        animation: fadeIn 0.5s ease-out forwards;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .form-control.error {
        border-color: #f44336;
    }
`;
document.head.appendChild(style);
