const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

const savedTheme = localStorage.getItem('theme');
const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

function applyTheme(theme) {
    if (theme === 'light') {
        body.classList.add('light-theme');
        themeToggle.innerHTML = '<i class="fa fa-moon-o" aria-hidden="true"></i>'; 
    } else {
        body.classList.remove('light-theme');
        themeToggle.innerHTML = '<i class="fa fa-sun-o" aria-hidden="true"></i>'; 
    }
}

if (savedTheme) {
    applyTheme(savedTheme);
} else if (systemDark) {
    applyTheme('dark');
} else {
    applyTheme('dark'); 
}


themeToggle.addEventListener('click', () => {
    let currentTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
    let newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
});

const canvas = document.getElementById('particle-canvas');


if (!canvas || !canvas.getContext) {
    console.error("Canvas element not found or context could not be created.");
}
const ctx = canvas.getContext('2d');

let particles = [];
let mouse = { x: null, y: null };
let maxDistance = 100; 
let interactionRadius = 100; 
let maxZoomSize = 5; 

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();


class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.baseSize = Math.random() * 1.5 + 0.5; 
        this.size = this.baseSize; 
        this.baseVelocity = { x: Math.random() * 0.5 - 0.25, y: Math.random() * 0.5 - 0.25 };
        this.velocity = { ...this.baseVelocity };
    }

    draw() {
        const colors = getParticleColor();
        ctx.fillStyle = colors.dot; 
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); 
        ctx.fill();
    }


    update() {
        if (this.x > canvas.width || this.x < 0) this.velocity.x = -this.velocity.x;
        if (this.y > canvas.height || this.y < 0) this.velocity.y = -this.velocity.y;

        this.x += this.velocity.x;
        this.y += this.velocity.y;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < interactionRadius) {
            const closeness = 1 - (distance / interactionRadius); 
            this.size = this.baseSize + (closeness * (maxZoomSize - this.baseSize)); 
            
            const force = 1 / distance; 
            this.velocity.x -= force * dx * 0.05;
            this.velocity.y -= force * dy * 0.05;

        } else {
            this.size = this.size * 0.9 + this.baseSize * 0.1; 
            if (this.size < this.baseSize) this.size = this.baseSize; 

            this.velocity.x = this.velocity.x * 0.99 + this.baseVelocity.x * 0.01;
            this.velocity.y = this.velocity.y * 0.99 + this.baseVelocity.y * 0.01;
        }
    }
}

function initParticles() {
    particles = [];
    const particleCount = (canvas.width * canvas.height) / 10000; 
    for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particles.push(new Particle(x, y));
    }
}

function getParticleColor() {
    if (document.body.classList.contains('light-theme')) {
        return { dot: 'rgba(69, 50, 92, 1)', line: 'rgba(43, 25, 66, 1)' };
    } else {
        return { dot: 'rgba(223, 196, 255, 1)', line: 'rgba(194, 182, 209, 1)' };
    }
}

function connectParticles() {
    const colors = getParticleColor(); 
    
    for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
            const dist = Math.sqrt(Math.pow(particles[a].x - particles[b].x, 2) + Math.pow(particles[a].y - particles[b].y, 2));

            if (dist < maxDistance) {
                const opacity = 1 - (dist / maxDistance);
                ctx.strokeStyle = `${colors.line.slice(0, -2)}${opacity * 0.2})`; 
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[a].x, particles[a].y);
                ctx.lineTo(particles[b].x, particles[b].y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height); 

    connectParticles();

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }
}

canvas.addEventListener('mousemove', function(e) {
    mouse.x = e.clientX; 
    mouse.y = e.clientY;
});

window.addEventListener('scroll', function() {
    particles.forEach(p => {
        p.velocity.x += (Math.random() - 0.5) * 10;
        p.velocity.y += (Math.random() - 0.5) * 10;
    });
});

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


initParticles();
animate();
