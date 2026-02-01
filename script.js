/* Initial Setup */
document.addEventListener('DOMContentLoaded', () => {
    initHearts();

    // Add event listener for window resize to fix canvas sizing
    window.addEventListener('resize', resizeCanvas);
});

/* --- Screen Navigation --- */
function showScreen(screenId) {
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
        // Reset scroll position for letter
        const scrollable = screen.querySelector('.letter, .note-container');
        if (scrollable) {
            scrollable.scrollTop = 0;
        }
    });

    // Show the target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

function showModal() {
    document.getElementById('modal-overlay').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}


/* --- Flying Hearts Engine --- */
const canvas = document.getElementById('hearts-canvas');
const ctx = canvas.getContext('2d');

let hearts = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();

class Heart {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 100; // Start below screen
        this.size = Math.random() * 20 + 10; // Varied sizes
        this.speedY = Math.random() * 2 + 1; // Different speeds
        this.speedX = (Math.random() - 0.5) * 1.5; // Slight drift
        this.color = `rgba(255, ${Math.random() * 100 + 100}, ${Math.random() * 100 + 150}, ${Math.random() * 0.5 + 0.3})`;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
    }

    update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;

        // Reset if off top or side
        if (this.y < -50) {
            this.y = canvas.height + 50;
            this.x = Math.random() * canvas.width;
        }
        if (this.x < -50) this.x = canvas.width + 50;
        if (this.x > canvas.width + 50) this.x = -50;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;

        // Draw Heart Shape
        ctx.beginPath();
        const topCurveHeight = this.size * 0.3;
        ctx.moveTo(0, topCurveHeight);
        // top left curve
        ctx.bezierCurveTo(
            0, 0,
            -this.size / 2, 0,
            -this.size / 2, topCurveHeight
        );
        // bottom left curve
        ctx.bezierCurveTo(
            -this.size / 2, (this.size + topCurveHeight) / 2,
            0, (this.size + topCurveHeight) / 2,
            0, this.size
        );
        // bottom right curve
        ctx.bezierCurveTo(
            0, (this.size + topCurveHeight) / 2,
            this.size / 2, (this.size + topCurveHeight) / 2,
            this.size / 2, topCurveHeight
        );
        // top right curve
        ctx.bezierCurveTo(
            this.size / 2, 0,
            0, 0,
            0, topCurveHeight
        );
        ctx.fill();
        ctx.restore();
    }
}

function initHearts() {
    // Create initial hearts
    const heartCount = window.innerWidth < 600 ? 30 : 60; // Less on mobile
    for (let i = 0; i < heartCount; i++) {
        const heart = new Heart();
        heart.y = Math.random() * canvas.height; // Scatter initially
        hearts.push(heart);
    }
    animate();
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    hearts.forEach(heart => {
        heart.update();
        heart.draw();
    });

    requestAnimationFrame(animate);
}


/* --- Music Widget Logic --- */
const music = document.getElementById('bg-music');
const musicControl = document.getElementById('music-control');
let isPlaying = false;

function toggleMusic() {
    if (isPlaying) {
        music.pause();
        musicControl.classList.remove('playing');
        isPlaying = false;
    } else {
        music.play().then(() => {
            musicControl.classList.add('playing');
            isPlaying = true;
        }).catch(err => {
            console.log("Audio play failed (user interaction required):", err);
        });
    }
}

// Optional: Try to auto-play on first click anywhere if not already playing
document.body.addEventListener('click', () => {
    if (!isPlaying) {
        // Uncomment below if you want aggressive auto-play attempt on interaction
        // toggleMusic(); 
    }
}, { once: true });

/* --- Password Protection --- */
const SECRET_PASSWORD = "laddoo";
const COMMON_MISSPELLINGS = ["laaddo", "laadoo", "laaddoo", "laddo", "ladoo"];

function checkPassword() {
    const input = document.getElementById('password-input');
    const errorMessage = document.getElementById('error-message');
    // Normalize input to lowercase
    const value = input.value.trim().toLowerCase();

    if (value === SECRET_PASSWORD) {
        showScreen('screen1');
        startFloatingPhotos();
        // Optional: Start music on successful login
        // toggleMusic(); 
    } else {
        errorMessage.style.display = 'block';
        input.classList.add('error');

        if (COMMON_MISSPELLINGS.includes(value)) {
            errorMessage.textContent = "Spelling is incorrect!";
        } else {
            errorMessage.textContent = "Incorrect Password!";
        }

        // Shake animation
        input.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(0)' }
        ], {
            duration: 300,
            iterations: 1
        });
    }
}

// Allow pressing Enter to submit password
document.getElementById('password-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        checkPassword();
    }
});


/* --- Floating Photos Logic --- */
const photoImages = [
    '1.JPG',
    '5.HEIC',
    '6.HEIC',
    '7.HEIC'
];

// Define 4 distinct "lanes" to prevent overlap
// Left side: 5-15% and 20-30%
// Right side: 70-80% and 85-95%
const lanes = [
    { min: 5, max: 15 },
    { min: 20, max: 30 },
    { min: 70, max: 80 },
    { min: 85, max: 95 }
];

// Shuffle lanes so they appear in random order
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
shuffle(lanes);

let photosSpawned = 0;

function spawnPhoto() {
    if (photosSpawned >= photoImages.length) return;

    const container = document.createElement('div');
    container.classList.add('photo-container');

    // Pick a lane for this photo
    const lane = lanes[photosSpawned];
    const randomLeft = lane.min + Math.random() * (lane.max - lane.min);

    container.style.left = `${randomLeft}%`;

    // Random rotation for the frame
    const randomRotation = (Math.random() - 0.5) * 30; // -15 to +15 deg

    const imgFrame = document.createElement('div');
    imgFrame.classList.add('photo-frame');
    imgFrame.style.setProperty('--rotation', `${randomRotation}deg`);

    const img = document.createElement('img');
    img.src = photoImages[photosSpawned];
    img.alt = "Memory";

    const stick = document.createElement('div');
    stick.classList.add('photo-stick');

    imgFrame.appendChild(img);
    container.appendChild(imgFrame);
    container.appendChild(stick);

    document.body.appendChild(container); // Append to body to be background-like

    photosSpawned++;
}

// Function to start spawning photos (called after login)
function startFloatingPhotos() {
    // Spawn one every 3 seconds to space them out nicely
    setTimeout(() => {
        setInterval(() => {
            spawnPhoto();
        }, 2500); // Slightly slower pace for 4 photos
    }, 500);
}
