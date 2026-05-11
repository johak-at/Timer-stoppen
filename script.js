// DOM Elements
const timeDisplay = document.getElementById('time');
const targetTimeSelect = document.getElementById('target-time');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const resetBtn = document.getElementById('reset-btn');

const resultsPanel = document.getElementById('results');
const feedbackTitle = document.getElementById('feedback-title');
const feedbackDesc = document.getElementById('feedback-desc');
const resTarget = document.getElementById('res-target');
const resActual = document.getElementById('res-actual');
const resDiff = document.getElementById('res-diff');

// Game State
let animationFrameId = null;
let startTime = 0;
let isRunning = false;
let currentElapsedTime = 0;

// Format time in seconds with 3 decimal places
function formatTime(ms) {
    return (ms / 1000).toFixed(3);
}

// Update the timer display
function updateDisplay(timeMs) {
    timeDisplay.textContent = formatTime(timeMs);
}

// Game Loop
function gameLoop(timestamp) {
    if (!startTime) {
        startTime = timestamp;
    }
    
    currentElapsedTime = timestamp - startTime;
    updateDisplay(currentElapsedTime);
    
    if (isRunning) {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

// Start Timer
function startTimer() {
    if (isRunning) return;
    
    isRunning = true;
    startTime = 0; // Reset so the loop picks up the exact timestamp
    currentElapsedTime = 0;
    
    // UI Updates
    startBtn.disabled = true;
    stopBtn.disabled = false;
    targetTimeSelect.disabled = true;
    resultsPanel.classList.add('hidden');
    
    // Add subtle visual cue that timer is running
    timeDisplay.style.color = 'var(--text-main)';
    timeDisplay.style.textShadow = '0 0 15px rgba(255, 255, 255, 0.3)';
    
    animationFrameId = requestAnimationFrame(gameLoop);
}

// Stop Timer
function stopTimer() {
    if (!isRunning) return;
    
    isRunning = false;
    cancelAnimationFrame(animationFrameId);
    
    // UI Updates
    startBtn.disabled = true;
    stopBtn.disabled = true;
    
    // Revert visual cue
    timeDisplay.style.color = 'var(--timer-color)';
    timeDisplay.style.textShadow = '0 0 20px rgba(34, 211, 238, 0.4)';
    
    calculateResults();
}

// Reset Timer
function resetTimer() {
    isRunning = false;
    cancelAnimationFrame(animationFrameId);
    
    currentElapsedTime = 0;
    updateDisplay(0);
    
    // UI Updates
    startBtn.disabled = false;
    stopBtn.disabled = true;
    targetTimeSelect.disabled = false;
    resultsPanel.classList.add('hidden');
    
    // Revert visual cue
    timeDisplay.style.color = 'var(--timer-color)';
    timeDisplay.style.textShadow = '0 0 20px rgba(34, 211, 238, 0.4)';
}

// Calculate and Display Results
function calculateResults() {
    const targetSeconds = parseFloat(targetTimeSelect.value);
    const actualSeconds = currentElapsedTime / 1000;
    const difference = actualSeconds - targetSeconds;
    const absDifference = Math.abs(difference);
    
    // Update Stats UI
    resTarget.textContent = targetSeconds.toFixed(3) + 's';
    resActual.textContent = actualSeconds.toFixed(3) + 's';
    
    const sign = difference > 0 ? '+' : '';
    resDiff.textContent = sign + difference.toFixed(3) + 's';
    
    // Determine Feedback based on absolute difference
    let feedback = "";
    let desc = "";
    let colorClass = "";
    
    if (absDifference <= 0.05) {
        feedback = "Perfect!";
        desc = "Incredible timing! You have lightning fast reflexes.";
        colorClass = "feedback-perfect";
    } else if (absDifference <= 0.2) {
        feedback = "Very Close!";
        desc = "Almost had it. Just a split second off.";
        colorClass = "feedback-close";
    } else if (absDifference <= 0.5) {
        feedback = "Not Bad";
        desc = difference > 0 ? "A little bit too late." : "A little bit too early.";
        colorClass = "feedback-okay";
    } else {
        feedback = "Missed!";
        desc = difference > 0 ? "Way too late! Try to anticipate the time better." : "Way too early! Wait for it.";
        colorClass = "feedback-bad";
    }
    
    // Apply Feedback UI
    feedbackTitle.className = ''; // Reset classes
    feedbackTitle.classList.add(colorClass);
    feedbackTitle.textContent = feedback;
    feedbackDesc.textContent = desc;
    resDiff.style.color = `var(--${colorClass.split('-')[1]}-color)`;
    
    // Show Results
    resultsPanel.classList.remove('hidden');
}

// Event Listeners
startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopTimer);
resetBtn.addEventListener('click', resetTimer);

// Initialize display
updateDisplay(0);
