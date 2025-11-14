// TAME Presentation JavaScript

class PresentationController {
    constructor() {
        this.currentSlide = 0;
        this.slides = document.querySelectorAll('.slide');
        this.totalSlides = this.slides.length;
        this.slideMenu = document.getElementById('slideMenu');

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateSlideCounter();
        this.updateProgressBar();
        this.setupKeyboardNavigation();
    }

    setupEventListeners() {
        // Navigation buttons
        document.getElementById('prevBtn').addEventListener('click', () => this.previousSlide());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextSlide());

        // Menu buttons
        document.getElementById('menuBtn').addEventListener('click', () => this.toggleMenu());
        document.getElementById('closeMenu').addEventListener('click', () => this.toggleMenu());

        // Fullscreen button
        document.getElementById('fullscreenBtn').addEventListener('click', () => this.toggleFullscreen());

        // Menu items
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const slideIndex = parseInt(e.target.dataset.slide);
                this.goToSlide(slideIndex);
                this.toggleMenu();
            });
        });

        // Close menu when clicking outside
        this.slideMenu.addEventListener('click', (e) => {
            if (e.target === this.slideMenu) {
                this.toggleMenu();
            }
        });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowRight':
                case 'PageDown':
                case ' ':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'ArrowLeft':
                case 'PageUp':
                    e.preventDefault();
                    this.previousSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(0);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.totalSlides - 1);
                    break;
                case 'Escape':
                    if (this.slideMenu.classList.contains('active')) {
                        this.toggleMenu();
                    }
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    }
                    break;
            }
        });
    }

    nextSlide() {
        if (this.currentSlide < this.totalSlides - 1) {
            this.goToSlide(this.currentSlide + 1);
        }
    }

    previousSlide() {
        if (this.currentSlide > 0) {
            this.goToSlide(this.currentSlide - 1);
        }
    }

    goToSlide(index) {
        if (index >= 0 && index < this.totalSlides) {
            // Remove active class from current slide
            this.slides[this.currentSlide].classList.remove('active');

            // Update current slide index
            this.currentSlide = index;

            // Add active class to new slide
            this.slides[this.currentSlide].classList.add('active');

            // Update UI
            this.updateSlideCounter();
            this.updateProgressBar();
            this.updateNavigationButtons();
        }
    }

    updateSlideCounter() {
        const counter = document.getElementById('slideCounter');
        counter.textContent = `${this.currentSlide + 1} / ${this.totalSlides}`;
    }

    updateProgressBar() {
        const progressFill = document.getElementById('progressFill');
        const progress = ((this.currentSlide + 1) / this.totalSlides) * 100;
        progressFill.style.width = `${progress}%`;
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        prevBtn.disabled = this.currentSlide === 0;
        nextBtn.disabled = this.currentSlide === this.totalSlides - 1;
    }

    toggleMenu() {
        this.slideMenu.classList.toggle('active');
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }
}

// Initialize presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const presentation = new PresentationController();

    // Add smooth scroll behavior
    document.querySelectorAll('.slide').forEach(slide => {
        slide.style.scrollBehavior = 'smooth';
    });

    // Add swipe support for touch devices
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swipe left - next slide
            presentation.nextSlide();
        }
        if (touchEndX > touchStartX + swipeThreshold) {
            // Swipe right - previous slide
            presentation.previousSlide();
        }
    }

    // Print handling
    window.addEventListener('beforeprint', () => {
        // Show all slides for printing
        document.querySelectorAll('.slide').forEach(slide => {
            slide.style.position = 'relative';
            slide.style.opacity = '1';
            slide.style.visibility = 'visible';
            slide.style.pageBreakAfter = 'always';
        });
    });

    window.addEventListener('afterprint', () => {
        // Restore slide behavior
        document.querySelectorAll('.slide').forEach((slide, index) => {
            slide.style.position = 'absolute';
            if (index !== presentation.currentSlide) {
                slide.style.opacity = '0';
                slide.style.visibility = 'hidden';
            }
            slide.style.pageBreakAfter = '';
        });
    });

    // Auto-save progress in localStorage
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('tame-presentation-slide', presentation.currentSlide);
    });

    // Restore last viewed slide
    const lastSlide = localStorage.getItem('tame-presentation-slide');
    if (lastSlide) {
        const shouldRestore = confirm('Resume from where you left off?');
        if (shouldRestore) {
            presentation.goToSlide(parseInt(lastSlide));
        }
    }

    // Add animation observer for slide transitions
    const observerOptions = {
        threshold: 0.5
    };

    const slideObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideIn 0.5s ease forwards';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.slide').forEach(slide => {
        slideObserver.observe(slide);
    });
});

// Add CSS animation keyframes dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(50px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .slide.active {
        animation: fadeIn 0.5s ease forwards;
    }
`;
document.head.appendChild(style);

// Export for potential extensions
window.PresentationController = PresentationController;
