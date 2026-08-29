// Navigation menu toggle for mobile
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    // Change icon based on state
    const icon = hamburger.querySelector('i');
    if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// Close menu when a link is clicked
document.querySelectorAll('.nav-links li a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = hamburger.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Active nav link highlighting based on scroll position
const sections = document.querySelectorAll('section');
const navItems = document.querySelectorAll('.nav-links li a');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - sectionHeight / 3)) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${current}`) {
            item.classList.add('active');
        }
    });
});

// Reveal animations on scroll
const fadeElements = document.querySelectorAll('.fade-in, .fade-up');

const revealElements = () => {
    fadeElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        // Element is visible when its top is within window height - offset
        if (elementTop < windowHeight - 100) {
            element.classList.add('visible');
        }
    });
};

// Initial check on load
window.addEventListener('load', revealElements);
// Check on scroll
window.addEventListener('scroll', revealElements);

// Real-time Contact Form Submission to Gmail
const form = document.querySelector('.contact-form');
const formStatus = document.querySelector('.form-status');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('.btn-submit');
        const originalText = btn.textContent;
        
        const nameInput = form.querySelector('input[name="name"]');
        const emailInput = form.querySelector('input[name="email"]');
        const subjectInput = form.querySelector('input[name="subject"]');
        const messageInput = form.querySelector('textarea[name="message"]');

        btn.disabled = true;
        btn.textContent = 'Sending...';
        btn.style.opacity = '0.7';

        if (formStatus) {
            formStatus.style.display = 'none';
        }
        
        try {
            const response = await fetch('https://formsubmit.co/ajax/aadithyasivasankar10@gmail.com', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: nameInput.value,
                    email: emailInput.value,
                    _subject: `Portfolio Contact from ${nameInput.value}: ${subjectInput.value}`,
                    subject: subjectInput.value,
                    message: messageInput.value
                })
            });
            
            const result = await response.json();
            
            if (response.ok || result.success === "true" || result.success === true) {
                btn.textContent = 'Message Sent! ✓';
                btn.style.background = '#10b981';
                
                if (formStatus) {
                    formStatus.style.display = 'block';
                    formStatus.style.color = '#10b981';
                    formStatus.textContent = 'Thank you! Your message has been sent directly to Aadithya\'s inbox.';
                }
                
                form.reset();
            } else {
                throw new Error(result.message || 'Failed to deliver message');
            }
        } catch (error) {
            console.error('Submission error:', error);
            btn.textContent = 'Opening Mail...';
            
            if (formStatus) {
                formStatus.style.display = 'block';
                formStatus.style.color = '#38bdf8';
                formStatus.textContent = 'Redirecting to your default mail client...';
            }

            // Reliable fallback: launch mail client directly
            setTimeout(() => {
                const mailtoUrl = `mailto:aadithyasivasankar10@gmail.com?subject=${encodeURIComponent(subjectInput.value)}&body=${encodeURIComponent("Name: " + nameInput.value + "\nEmail: " + emailInput.value + "\n\n" + messageInput.value)}`;
                window.location.href = mailtoUrl;
            }, 600);
        } finally {
            setTimeout(() => {
                btn.disabled = false;
                btn.textContent = originalText;
                btn.style.background = '';
                btn.style.opacity = '1';
                
                setTimeout(() => {
                    if (formStatus) {
                        formStatus.style.display = 'none';
                    }
                }, 5000);
            }, 3500);
        }
    });
}

/* =========================================================================
   Interactive Cyberpunk Robot Avatar: Face & Eye Mouse Tracking
   ========================================================================= */
const characterContainer = document.getElementById('character-container');
const charHead = document.getElementById('char-head');
const charEyes = document.getElementById('char-eyes');
const heroVisualArea = document.getElementById('hero-visual-area');

if (characterContainer && charHead && charEyes) {
    // Current animated values for smooth linear interpolation (Lerp)
    let currentEyeX = 0, currentEyeY = 0;
    let targetEyeX = 0, targetEyeY = 0;

    let currentHeadRotY = 0, currentHeadRotX = 0, currentHeadRotZ = 0;
    let targetHeadRotY = 0, targetHeadRotX = 0, targetHeadRotZ = 0;

    let currentHeadTransX = 0, currentHeadTransY = 0;
    let targetHeadTransX = 0, targetHeadTransY = 0;

    let isMouseActive = false;

    // Calculate mouse position relative to the character's head center
    function handlePointerMove(clientX, clientY) {
        isMouseActive = true;
        const rect = characterContainer.getBoundingClientRect();
        
        // Center point at the character's head (approx 33% from top of character box)
        const charCenterX = rect.left + rect.width * 0.49;
        const charCenterY = rect.top + rect.height * 0.33;

        const deltaX = clientX - charCenterX;
        const deltaY = clientY - charCenterY;

        // Normalized offset with viewport bounds
        const maxDistX = Math.max(window.innerWidth * 0.4, 250);
        const maxDistY = Math.max(window.innerHeight * 0.4, 250);

        const normX = Math.max(-1, Math.min(1, deltaX / maxDistX));
        const normY = Math.max(-1, Math.min(1, deltaY / maxDistY));

        // Targets for Eye tracking (px inside visor)
        targetEyeX = normX * 24;
        targetEyeY = normY * 18;

        // Targets for 3D Head rotation (degrees)
        targetHeadRotY = normX * 18;
        targetHeadRotX = -normY * 14;
        targetHeadRotZ = normX * 3.5;

        // Targets for Head translation
        targetHeadTransX = normX * 8;
        targetHeadTransY = normY * 6;
    }

    // Global window mouse movement
    window.addEventListener('mousemove', (e) => {
        handlePointerMove(e.clientX, e.clientY);
    });

    // Touch support for mobile & tablet screens
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    // When mouse leaves the window, smoothly return character to rest position
    document.addEventListener('mouseleave', () => {
        isMouseActive = false;
        targetEyeX = 0;
        targetEyeY = 0;
        targetHeadRotY = 0;
        targetHeadRotX = 0;
        targetHeadRotZ = 0;
        targetHeadTransX = 0;
        targetHeadTransY = 0;
    });

    // Render loop using requestAnimationFrame for buttery-smooth 60fps tracking
    function animateCharacter() {
        const lerpEye = 0.1;
        const lerpHead = 0.08;

        // Smoothly interpolate eye position
        currentEyeX += (targetEyeX - currentEyeX) * lerpEye;
        currentEyeY += (targetEyeY - currentEyeY) * lerpEye;

        // Smoothly interpolate head 3D rotation & translation
        currentHeadRotY += (targetHeadRotY - currentHeadRotY) * lerpHead;
        currentHeadRotX += (targetHeadRotX - currentHeadRotX) * lerpHead;
        currentHeadRotZ += (targetHeadRotZ - currentHeadRotZ) * lerpHead;

        currentHeadTransX += (targetHeadTransX - currentHeadTransX) * lerpHead;
        currentHeadTransY += (targetHeadTransY - currentHeadTransY) * lerpHead;

        // Apply transforms to SVG elements
        charEyes.style.transform = `translate(${currentEyeX.toFixed(2)}px, ${currentEyeY.toFixed(2)}px)`;
        charHead.style.transform = `translate(${currentHeadTransX.toFixed(2)}px, ${currentHeadTransY.toFixed(2)}px) rotateY(${currentHeadRotY.toFixed(2)}deg) rotateX(${currentHeadRotX.toFixed(2)}deg) rotateZ(${currentHeadRotZ.toFixed(2)}deg)`;

        requestAnimationFrame(animateCharacter);
    }

    animateCharacter();

    // Natural Eye Blinking cycle
    function triggerRandomBlink() {
        characterContainer.classList.add('is-blinking');
        setTimeout(() => {
            characterContainer.classList.remove('is-blinking');
            
            // Random interval between 3 to 6.5 seconds
            const nextBlinkDelay = 3000 + Math.random() * 3500;
            setTimeout(triggerRandomBlink, nextBlinkDelay);
        }, 160);
    }

    setTimeout(triggerRandomBlink, 2500);

    // Interactive Click Celebration
    characterContainer.addEventListener('click', () => {
        characterContainer.classList.add('is-celebrating');
        
        // Trigger quick double blink
        characterContainer.classList.add('is-blinking');
        setTimeout(() => {
            characterContainer.classList.remove('is-blinking');
            setTimeout(() => {
                characterContainer.classList.add('is-blinking');
                setTimeout(() => {
                    characterContainer.classList.remove('is-blinking');
                }, 120);
            }, 100);
        }, 120);

        setTimeout(() => {
            characterContainer.classList.remove('is-celebrating');
        }, 900);
    });
}

