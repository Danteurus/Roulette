// Allow closing popup with Esc or Enter key
window.addEventListener('keydown', function(event) {
    if (!resultPopup.classList.contains('hidden') && (event.key === 'Escape' || event.key === 'Enter')) {
        resultPopup.classList.add('hidden');
    }
});

// --- DOM Elements ---
const canvas = document.getElementById('rouletteCanvas');
const ctx = canvas.getContext('2d');
const optionInput = document.getElementById('optionInput');
const addOptionBtn = document.getElementById('addOptionBtn');
const optionsList = document.getElementById('optionsList');
const spinBtn = document.getElementById('spinBtn');
const resultPopup = document.getElementById('resultPopup');
const winnerText = document.getElementById('winnerText');
const closePopup = document.getElementById('closePopup');

// --- State ---
let options = [];
let spinning = false;
let angle = 0;
let spinTimeout = null;
let spinAngleStart = 0;
let spinTime = 0;
let spinTimeTotal = 0;
let spinRotations = 0;

// Save options to localStorage
function saveOptions() {
    localStorage.setItem('rouletteOptions', JSON.stringify(options));
}

// Load options from localStorage
function loadOptions() {
    const stored = localStorage.getItem('rouletteOptions');
    if (stored) {
        options = JSON.parse(stored);
    } else {
        options = [];
    }
}

// Draw the roulette wheel
function drawRoulette() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    const numOptions = options.length;
    if (numOptions === 0) {
        // Draw fallback message and faded wheel
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#e1e8ed';
        ctx.fill();
        ctx.strokeStyle = '#bbb';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#888';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('¡Sin opciones!', centerX, centerY - 10);
        ctx.font = '14px Arial';
        ctx.fillStyle = '#aaa';
        ctx.fillText('Agrega opciones abajo', centerX, centerY + 16);
        // Draw pointer (top, pointing downwards)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(centerX - 15, centerY - radius - 10); // left base
        ctx.lineTo(centerX + 15, centerY - radius - 10); // right base
        ctx.lineTo(centerX, centerY - radius + 15); // tip (down)
        ctx.closePath();
        ctx.fillStyle = '#e74c3c';
        ctx.fill();
        ctx.restore();
        return;
    }
    const arc = 2 * Math.PI / numOptions;
    for (let i = 0; i < numOptions; i++) {
        const startAngle = angle + i * arc;
        const endAngle = startAngle + arc;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = getColor(i, numOptions);
        ctx.fill();
        ctx.save();
        ctx.translate(centerX, centerY);
        let label = options[i];
        if (numOptions === 1) {
            // Special case: one option, center and upright
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 20px Arial';
            let maxLabelLength = 18;
            if (label.length > maxLabelLength) label = label.slice(0, maxLabelLength) + '…';
            ctx.fillText(label, 0, 0);
        } else {
            ctx.rotate(startAngle + arc / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px Arial';
            // Truncate long options for mobile
            if (canvas.width < 300 && label.length > 10) label = label.slice(0, 10) + '…';
            ctx.fillText(label, radius - 10, 6);
        }
        ctx.restore();
    }
    // Draw pointer (top, pointing downwards)
    ctx.save();
    ctx.beginPath();
    // Base of triangle on top, tip on bottom (points down)
    ctx.moveTo(centerX - 15, centerY - radius - 10); // left base
    ctx.lineTo(centerX + 15, centerY - radius - 10); // right base
    ctx.lineTo(centerX, centerY - radius + 15); // tip (down)
    ctx.closePath();
    ctx.fillStyle = '#e74c3c';
    ctx.fill();
    ctx.restore();
}

// Generate visually distinct colors for wheel slices
function getColor(i, total) {
    const hue = i * 360 / total;
    return `hsl(${hue}, 70%, 55%)`;
}

// Update the list of options in the UI
function updateOptionsList() {
    optionsList.innerHTML = '';
    if (options.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Sin opciones. ¡Agrega alguna!';
        li.style.color = '#888';
        li.style.textAlign = 'center';
        optionsList.appendChild(li);
        spinBtn.disabled = true;
    } else {
        spinBtn.disabled = options.length < 2 || spinning;
        options.forEach((opt, idx) => {
            const li = document.createElement('li');
            li.textContent = opt;
            const btn = document.createElement('button');
            btn.textContent = 'Eliminar';
            btn.className = 'remove-btn';
            btn.disabled = spinning;
            btn.onclick = () => {
                if (spinning) return;
                options.splice(idx, 1);
                saveOptions();
                updateOptionsList();
                drawRoulette();
            };
            li.appendChild(btn);
            optionsList.appendChild(li);
        });
    }
}

// Add option event
addOptionBtn.onclick = () => {
    if (spinning) return;
    const val = optionInput.value.trim();
    if (val && !options.includes(val)) {
        options.push(val);
        saveOptions();
        updateOptionsList();
        drawRoulette();
        optionInput.value = '';
    }
};

// Add option on Enter key
optionInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        addOptionBtn.click();
    }
});

// Spin the wheel
function spinWheel() {
    if (spinning || options.length < 2) return;
    spinning = true;
    spinBtn.disabled = true;
    // Disable remove buttons
    Array.from(document.getElementsByClassName('remove-btn')).forEach(btn => btn.disabled = true);
    addOptionBtn.disabled = true;
    optionInput.disabled = true;
    // Scroll to the wheel
    canvas.scrollIntoView({ behavior: 'smooth', block: 'center' });
    spinAngleStart = angle;
    spinTime = 0;
    spinTimeTotal = 3000 + Math.random() * 2000; // 3-5 seconds
    spinRotations = 4 + Math.floor(Math.random() * 3); // 4-6 full spins
    // Add a random offset to the final angle so the wheel lands on a random option
    const numOptions = options.length;
    if (numOptions > 0) {
        const randomSlice = Math.floor(Math.random() * numOptions);
        const arc = 2 * Math.PI / numOptions;
        // The pointer is at -90deg (top), so offset by -Math.PI/2
        const targetAngle = randomSlice * arc - Math.PI / 2 + arc / 2;
        window.spinTargetOffset = ((targetAngle - angle) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    } else {
        window.spinTargetOffset = 0;
    }
    rotateWheel();
}

// Animate the wheel rotation
function rotateWheel() {
    spinTime += 16;
    if (spinTime >= spinTimeTotal) {
        stopRotateWheel();
        return;
    }
    // Use easeOutCubic for smooth deceleration
    const t = spinTime / spinTimeTotal;
    // Ease from 0 to 1
    const ease = t < 1 ? 1 - Math.pow(1 - t, 3) : 1;
    // Total angle: start + (full spins + 1) * 2PI * ease + random offset
    const totalSpins = spinRotations + 1;
    const offset = typeof window.spinTargetOffset === 'number' ? window.spinTargetOffset : 0;
    angle = spinAngleStart + (totalSpins * 2 * Math.PI + offset) * ease;
    drawRoulette();
    spinTimeout = setTimeout(rotateWheel, 16);
}

// Stop the wheel and show the winner
function stopRotateWheel() {
    clearTimeout(spinTimeout);
    const numOptions = options.length;
    const arc = 2 * Math.PI / numOptions;
    let degrees = angle * 180 / Math.PI + 90;
    degrees = degrees % 360;
    const index = numOptions - Math.floor(degrees / (360 / numOptions)) - 1;
    const winner = options[(index + numOptions) % numOptions];
    setTimeout(() => {
        showResult(winner);
        spinning = false;
        spinBtn.disabled = false;
        addOptionBtn.disabled = false;
        optionInput.disabled = false;
        updateOptionsList();
    }, 500);
}

// Easing function for smooth spin
function easeOut(t, b, c, d) {
    t /= d;
    t--;
    return c * (t * t * t + 1) + b;
}

// Show the winner popup
function showResult(winner) {
    winnerText.textContent = winner;
    resultPopup.classList.remove('hidden');
}

// Close popup event
closePopup.onclick = () => {
    resultPopup.classList.add('hidden');
};

// Spin button event
spinBtn.onclick = spinWheel;

// Close popup when clicking outside
window.onclick = function(event) {
    if (event.target === resultPopup) {
        resultPopup.classList.add('hidden');
    }
};

// Responsive canvas resizing
function resizeCanvas() {
    let size = Math.min(window.innerWidth * 0.9, 350);
    if (window.innerWidth < 500) {
        size = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.45);
    }
    canvas.width = size;
    canvas.height = size;
    drawRoulette();
}
window.addEventListener('resize', resizeCanvas);

// --- Initialization ---
loadOptions();
resizeCanvas();
updateOptionsList();
