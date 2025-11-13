// ==========================================================
// *** THEME TOGGLE LOGIC (NEW) ***
// ==========================================================
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
// const infoButton = document.querySelector('.info-button'); // Not needed for glitch text change, as the content attr is static.

// 1. Check for saved preference or use system preference
const savedTheme = localStorage.getItem('theme');
const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

function applyTheme(theme) {
    if (theme === 'light') {
        body.classList.add('light-theme');
        themeToggle.innerHTML = '<i class="fa fa-moon-o" aria-hidden="true"></i>'; // Moon icon for light theme
    } else {
        body.classList.remove('light-theme');
        themeToggle.innerHTML = '<i class="fa fa-sun-o" aria-hidden="true"></i>'; // Sun icon for dark theme
    }
}

// Initial application
// Default to 'dark' if no preference, but check system for a preference.
if (savedTheme) {
    applyTheme(savedTheme);
} else if (systemDark) {
    applyTheme('dark');
} else {
    // If no preference found, apply dark theme (as it's the default style)
    applyTheme('dark'); 
}


// 2. Add event listener for the toggle button
themeToggle.addEventListener('click', () => {
    // Check for the class on the body to determine the current theme
    let currentTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
    let newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
});


// ==========================================================
// *** PARTICLE NETWORK JAVASCRIPT LOGIC (FINALIZED) ***
// ==========================================================

const canvas = document.getElementById('particle-canvas');
// Check if canvas element and context were successfully retrieved
if (!canvas || !canvas.getContext) {
    console.error("Canvas element not found or context could not be created.");
}
const ctx = canvas.getContext('2d');

let particles = [];
let mouse = { x: null, y: null };
let maxDistance = 100; // Max distance for lines to connect
let interactionRadius = 100; // Radius for mouse interaction (size and repel)
let maxZoomSize = 5; // The maximum size a particle can reach near the cursor

// Set Canvas Size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();


// --- Particle Class ---
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.baseSize = Math.random() * 1.5 + 0.5; // Store initial size (small)
        this.size = this.baseSize; // Dynamic size
        this.baseVelocity = { x: Math.random() * 0.5 - 0.25, y: Math.random() * 0.5 - 0.25 };
        this.velocity = { ...this.baseVelocity };
    }

    // Draw the particle
    draw() {
        const colors = getParticleColor();
        ctx.fillStyle = colors.dot; // Use dynamic dot color
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); 
        ctx.fill();
    }

    // Update position and handle edges and mouse interaction
    update() {
        // Reverse direction if hitting edge
        if (this.x > canvas.width || this.x < 0) this.velocity.x = -this.velocity.x;
        if (this.y > canvas.height || this.y < 0) this.velocity.y = -this.velocity.y;

        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // --- Mouse Interaction (Zoom In/Repel) ---
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < interactionRadius) {
            // 1. ZOOM IN (Size Change)
            // Closeness is a value from ~0 (far) to 1 (near)
            const closeness = 1 - (distance / interactionRadius); 
            // The size smoothly interpolates to the maximum size when close
            this.size = this.baseSize + (closeness * (maxZoomSize - this.baseSize)); 
            
            // 2. REPEL (Velocity Change)
            // Apply a small force away from the cursor
            const force = 1 / distance; 
            this.velocity.x -= force * dx * 0.05;
            this.velocity.y -= force * dy * 0.05;

        } else {
            // 3. RESET (Gradually return to base size and base velocity)
            this.size = this.size * 0.9 + this.baseSize * 0.1; // Smoothly shrink back
            if (this.size < this.baseSize) this.size = this.baseSize; // Prevent undershooting

            this.velocity.x = this.velocity.x * 0.99 + this.baseVelocity.x * 0.01;
            this.velocity.y = this.velocity.y * 0.99 + this.baseVelocity.y * 0.01;
        }
    }
}

// --- Initialization ---
function initParticles() {
    particles = [];
    const particleCount = (canvas.width * canvas.height) / 10000; // Density calculation (approx 1 particle per 100x100 area)
    for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particles.push(new Particle(x, y));
    }
}

function getParticleColor() {
    // Check if the body has the 'light-theme' class
    if (document.body.classList.contains('light-theme')) {
        // Darker color for light mode (almost black, semi-transparent)
        return { dot: 'rgba(69, 50, 92, 1)', line: 'rgba(43, 25, 66, 1)' };
    } else {
        // Original pastel color for dark mode
        return { dot: 'rgba(223, 196, 255, 1)', line: 'rgba(194, 182, 209, 1)' };
    }
}

// --- Draw Lines Between Nearby Particles ---
function connectParticles() {
    const colors = getParticleColor(); // Get current colors
    
    for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
            const dist = Math.sqrt(Math.pow(particles[a].x - particles[b].x, 2) + Math.pow(particles[a].y - particles[b].y, 2));

            if (dist < maxDistance) {
                const opacity = 1 - (dist / maxDistance);
                ctx.strokeStyle = `${colors.line.slice(0, -2)}${opacity * 0.2})`; // Use dynamic line color string
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[a].x, particles[a].y);
                ctx.lineTo(particles[b].x, particles[b].y);
                ctx.stroke();
            }
        }
    }
}

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the frame

    connectParticles();

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }
}

// --- Event Handlers ---
canvas.addEventListener('mousemove', function(e) {
    // Offset mouse position relative to the viewport
    mouse.x = e.clientX; 
    mouse.y = e.clientY;
});

// SCROLL EFFECT: Temporarily disrupts the network
window.addEventListener('scroll', function() {
    // Apply a short, powerful burst of random velocity to all particles
    particles.forEach(p => {
        p.velocity.x += (Math.random() - 0.5) * 10; // Stronger jitter on scroll
        p.velocity.y += (Math.random() - 0.5) * 10;
    });
    // The 'update' logic will smoothly return the velocity back to normal
});

// --- GSAP Anchor Scroll Logic (Using GSAP's ScrollToPlugin) ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault(); 
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            gsap.to(window, {
                duration: 1.0, 
                scrollTo: targetId,
                ease: "power2.inOut"
            });
        }
    });
});


// Start everything up
initParticles();
animate();

// ==========================================================