
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const effectSelect = document.getElementById('effectSelect');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// Color palettes
const palettes = {
    colorSmoke: [
        { r: 255, g: 0, b: 128 },    // Pink
        { r: 64, g: 224, b: 208 },    // Turquoise
        { r: 148, g: 0, b: 211 },     // Purple
        { r: 0, g: 191, b: 255 },     // Sky Blue
        { r: 255, g: 140, b: 0 }      // Orange
    ],
    galaxySpiral: [
        { r: 147, g: 51, b: 234 },    // Purple
        { r: 59, g: 130, b: 246 },    // Blue
        { r: 236, g: 72, b: 153 },    // Pink
        { r: 52, g: 211, b: 153 }     // Teal
    ],
    neon: [
        { r: 255, g: 0, b: 0 },       // Red
        { r: 0, g: 255, b: 0 },       // Green
        { r: 0, g: 0, b: 255 },       // Blue
        { r: 255, g: 255, b: 0 }      // Yellow
    ],
    fireflies: [
        { r: 255, g: 223, b: 0 },     // Gold
        { r: 255, g: 180, b: 0 },     // Orange
        { r: 255, g: 200, b: 100 },   // Light Orange
        { r: 255, g: 240, b: 150 }    // Light Yellow
    ]
};

class Particle {
    constructor(x, y, effect) {
        this.x = x;
        this.y = y;
        this.effect = effect;
        this.reset();
    }

    reset() {
        const effectColors = palettes[this.effect];
        this.color = effectColors[Math.floor(Math.random() * effectColors.length)];
        this.life = 1;

        switch (this.effect) {
            case 'colorSmoke':
                this.size = Math.random() * 20 + 10;
                this.vx = (Math.random() - 0.5) * 2;
                this.vy = (Math.random() - 0.5) * 2;
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.02;
                break;

            case 'galaxySpiral':
                this.size = Math.random() * 2 + 1;
                this.angle = Math.random() * Math.PI * 2;
                this.radius = Math.random() * 20;
                this.angleSpeed = (Math.random() * 0.2 - 0.1) * 0.1;
                this.radiusGrowth = Math.random() * 0.5 + 0.2;
                break;

            case 'neon':
                this.size = Math.random() * 3 + 2;
                this.vx = (Math.random() - 0.5) * 4;
                this.vy = (Math.random() - 0.5) * 4;
                this.trail = [];
                break;

            case 'fireflies':
                this.size = Math.random() * 4 + 2;
                this.vx = (Math.random() - 0.5) * 1;
                this.vy = (Math.random() - 0.5) * 1;
                this.pulse = 0;
                this.pulseSpeed = Math.random() * 0.1 + 0.05;
                break;
        }
    }

    update() {
        switch (this.effect) {
            case 'colorSmoke':
                this.x += this.vx;
                this.y += this.vy;
                this.vx *= 0.99;
                this.vy *= 0.99;
                this.life -= 0.01;
                this.size += 0.2;
                this.rotation += this.rotationSpeed;
                break;

            case 'galaxySpiral':
                this.angle += this.angleSpeed;
                this.radius += this.radiusGrowth;
                this.x = mouseX + Math.cos(this.angle) * this.radius;
                this.y = mouseY + Math.sin(this.angle) * this.radius;
                this.life -= 0.01;
                break;

            case 'neon':
                this.x += this.vx;
                this.y += this.vy;
                this.trail.push({ x: this.x, y: this.y });
                if (this.trail.length > 20) this.trail.shift();
                this.life -= 0.02;
                break;

            case 'fireflies':
                this.x += this.vx;
                this.y += this.vy;
                this.pulse += this.pulseSpeed;
                this.life -= 0.005;
                break;
        }
    }

    draw() {
        ctx.save();

        switch (this.effect) {
            case 'colorSmoke':
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
                gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.life * 0.5})`);
                gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'galaxySpiral':
                ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.life})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'neon':
                if (this.trail.length > 1) {
                    ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.life})`;
                    ctx.lineWidth = this.size;
                    ctx.beginPath();
                    ctx.moveTo(this.trail[0].x, this.trail[0].y);
                    for (let i = 1; i < this.trail.length; i++) {
                        ctx.lineTo(this.trail[i].x, this.trail[i].y);
                    }
                    ctx.stroke();
                }
                break;

            case 'fireflies':
                const brightness = 0.5 + Math.sin(this.pulse) * 0.3;
                ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.life * brightness})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                break;
        }

        ctx.restore();
    }
}

const particles = [];
let mouseX = 0;
let mouseY = 0;
let lastX = 0;
let lastY = 0;

canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    const dx = mouseX - lastX;
    const dy = mouseY - lastY;
    const speed = Math.sqrt(dx * dx + dy * dy);
    const currentEffect = effectSelect.value;

    const particleCount = Math.min(Math.floor(speed / 2) + 1, 5);

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(
            mouseX + (Math.random() - 0.5) * 10,
            mouseY + (Math.random() - 0.5) * 10,
            currentEffect
        ));
    }

    lastX = mouseX;
    lastY = mouseY;
});

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();

        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }

    requestAnimationFrame(animate);
}
animate();
