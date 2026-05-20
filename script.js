// DOM Elements
const timeDisplay = document.getElementById('time');
const targetTimeSelect = document.getElementById('target-time');
const customTimeContainer = document.getElementById('custom-time-container');
const customTimeInput = document.getElementById('custom-time-input');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const resetBtn = document.getElementById('reset-btn');

const resultsPanel = document.getElementById('results');
const feedbackTitle = document.getElementById('feedback-title');
const feedbackDesc = document.getElementById('feedback-desc');
const resTarget = document.getElementById('res-target');
const resActual = document.getElementById('res-actual');
const resDiff = document.getElementById('res-diff');

// New Mode Switcher Elements
const modeSingleBtn = document.getElementById('mode-single');
const modeVersusBtn = document.getElementById('mode-versus');
const singlePlayerSettings = document.getElementById('single-player-settings');
const versusSettings = document.getElementById('versus-settings');
const versusTargetVal = document.getElementById('versus-target-val');
const versusRerollBtn = document.getElementById('versus-reroll-btn');

// Player Turn Cards
const p1Card = document.getElementById('p1-card');
const p2Card = document.getElementById('p2-card');
const p1Status = document.getElementById('p1-status');
const p2Status = document.getElementById('p2-status');

// Versus Results Panel Elements
const versusResultsPanel = document.getElementById('versus-results');
const vsFeedbackTitle = document.getElementById('vs-feedback-title');
const vsFeedbackDesc = document.getElementById('vs-feedback-desc');
const vsResTarget = document.getElementById('vs-res-target');
const vsP1Actual = document.getElementById('vs-p1-actual');
const vsP1Diff = document.getElementById('vs-p1-diff');
const vsP2Actual = document.getElementById('vs-p2-actual');
const vsP2Diff = document.getElementById('vs-p2-diff');
const vsResP1Card = document.getElementById('vs-res-p1');
const vsResP2Card = document.getElementById('vs-res-p2');

// Game State
let animationFrameId = null;
let startTime = 0;
let isRunning = false;
let currentElapsedTime = 0;

// Versus Mode Game State
let gameMode = 'single'; // 'single' or 'versus'
let versusTargetTime = 0;
let versusPhase = 'p1-ready'; // 'p1-ready', 'p1-running', 'p2-ready', 'p2-running', 'round-over'
let p1ElapsedTime = 0;
let p2ElapsedTime = 0;

// Format time in seconds with 3 decimal places
function formatTime(ms) {
    return (ms / 1000).toFixed(3);
}

// Update the timer display
function updateDisplay(timeMs) {
    timeDisplay.textContent = formatTime(timeMs);
}

// Generate a random number from 0.5 to 10.0 with 3 decimal places for precision
function generateRandomTarget() {
    return Math.round((Math.random() * (10 - 0.5) + 0.5) * 1000) / 1000;
}

// Switch between Single and Versus Modes
function setGameMode(mode) {
    gameMode = mode;

    // UI Reset
    resetTimer();

    if (gameMode === 'single') {
        modeSingleBtn.classList.add('active');
        modeVersusBtn.classList.remove('active');
        singlePlayerSettings.classList.remove('hidden');
        versusSettings.classList.add('hidden');
        versusResultsPanel.classList.add('hidden');
        resultsPanel.classList.add('hidden');

        // Restore default button text and styles
        startBtn.textContent = 'Start';
        startBtn.className = 'btn primary';
        startBtn.style = '';
        stopBtn.textContent = 'Stop';
        resetBtn.textContent = 'Reset';
        resetBtn.className = 'btn secondary';
    } else {
        modeSingleBtn.classList.remove('active');
        modeVersusBtn.classList.add('active');
        singlePlayerSettings.classList.add('hidden');
        versusSettings.classList.remove('hidden');
        versusResultsPanel.classList.add('hidden');
        resultsPanel.classList.add('hidden');

        // Initialize Versus Match
        resetVersusMatch();
    }
}

// Reset the Versus Match State
function resetVersusMatch() {
    versusPhase = 'p1-ready';
    p1ElapsedTime = 0;
    p2ElapsedTime = 0;

    // Generate new random target
    versusTargetTime = generateRandomTarget();
    versusTargetVal.textContent = versusTargetTime.toFixed(3) + 's';

    // Update Turn Dashboard UI
    p1Card.className = 'player-card active';
    p2Card.className = 'player-card';
    p1Status.textContent = 'Ready';
    p1Status.className = 'player-status';
    p2Status.textContent = 'Waiting';
    p2Status.className = 'player-status';

    // Update controls
    startBtn.disabled = false;
    startBtn.textContent = 'Player 1: Start';
    startBtn.className = 'btn primary';
    startBtn.style = '';

    stopBtn.disabled = true;
    stopBtn.textContent = 'Stop';

    resetBtn.disabled = false;
    resetBtn.textContent = 'Reset Match';
    resetBtn.className = 'btn secondary';

    versusRerollBtn.disabled = false;

    // Clear timer display
    updateDisplay(0);
    versusResultsPanel.classList.add('hidden');
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
    if (gameMode === 'single') {
        startBtn.disabled = true;
        stopBtn.disabled = false;
        stopBtn.textContent = 'Stop';
        targetTimeSelect.disabled = true;
        customTimeInput.disabled = true;
        resultsPanel.classList.add('hidden');
    } else {
        versusRerollBtn.disabled = true;

        if (versusPhase === 'p1-ready') {
            versusPhase = 'p1-running';
            p1Card.className = 'player-card active';
            p1Status.textContent = 'Running...';
            startBtn.disabled = true;
            stopBtn.disabled = false;
            stopBtn.textContent = 'Player 1: Stop';
        } else if (versusPhase === 'p2-ready') {
            versusPhase = 'p2-running';
            p2Card.className = 'player-card active';
            p2Status.textContent = 'Running...';
            startBtn.disabled = true;
            stopBtn.disabled = false;
            stopBtn.textContent = 'Player 2: Stop';
        }
    }

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

    // Revert visual cue
    timeDisplay.style.color = 'var(--timer-color)';
    timeDisplay.style.textShadow = '0 0 20px rgba(34, 211, 238, 0.4)';

    if (gameMode === 'single') {
        startBtn.disabled = true;
        stopBtn.disabled = true;
        calculateResults();
    } else {
        // Versus Mode Turn Stopping
        if (versusPhase === 'p1-running') {
            p1ElapsedTime = currentElapsedTime;

            p1Status.textContent = formatTime(p1ElapsedTime) + 's';
            p1Status.className = 'player-status stopped';
            p1Card.className = 'player-card'; // deactivate P1 card

            // Advance to Player 2 Ready
            versusPhase = 'p2-ready';

            // Prepare P2 card
            p2Card.className = 'player-card active';
            p2Status.textContent = 'Ready';

            // Update control buttons for Player 2
            startBtn.disabled = false;
            startBtn.textContent = 'Player 2: Start';
            startBtn.className = 'btn primary';
            startBtn.style.backgroundColor = '#8b5cf6'; // Violet theme for Player 2
            startBtn.style.boxShadow = '0 4px 14px rgba(139, 92, 246, 0.4)';

            stopBtn.disabled = true;
            stopBtn.textContent = 'Stop';
        } else if (versusPhase === 'p2-running') {
            p2ElapsedTime = currentElapsedTime;

            p2Status.textContent = formatTime(p2ElapsedTime) + 's';
            p2Status.className = 'player-status stopped';

            // Advance to Round Over
            versusPhase = 'round-over';

            // Update control buttons
            startBtn.disabled = true;
            stopBtn.disabled = true;

            calculateVersusResults();
        }
    }
}

// Reset Timer
function resetTimer() {
    isRunning = false;
    cancelAnimationFrame(animationFrameId);

    currentElapsedTime = 0;
    updateDisplay(0);

    // Revert visual cue
    timeDisplay.style.color = 'var(--timer-color)';
    timeDisplay.style.textShadow = '0 0 20px rgba(34, 211, 238, 0.4)';

    if (gameMode === 'single') {
        startBtn.disabled = false;
        stopBtn.disabled = true;
        stopBtn.textContent = 'Stop';
        targetTimeSelect.disabled = false;
        customTimeInput.disabled = false;
        resultsPanel.classList.add('hidden');

        startBtn.textContent = 'Start';
        startBtn.className = 'btn primary';
        startBtn.style = '';
    } else {
        resetVersusMatch();
    }
}

// Calculate and Display Results for Single Player
function calculateResults() {
    let targetSeconds = 0;
    if (targetTimeSelect.value === 'custom') {
        targetSeconds = parseFloat(customTimeInput.value);
        if (isNaN(targetSeconds) || targetSeconds <= 0) {
            targetSeconds = 5.500;
            customTimeInput.value = '5.500';
        }
    } else {
        targetSeconds = parseFloat(targetTimeSelect.value);
    }
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

// Calculate and Display Results for 2-Player Versus
function calculateVersusResults() {
    const p1Seconds = p1ElapsedTime / 1000;
    const p2Seconds = p2ElapsedTime / 1000;

    const p1Diff = p1Seconds - versusTargetTime;
    const p2Diff = p2Seconds - versusTargetTime;

    const p1AbsDiff = Math.abs(p1Diff);
    const p2AbsDiff = Math.abs(p2Diff);

    // Update Versus Result Panel Stats
    vsResTarget.textContent = versusTargetTime.toFixed(3) + 's';

    vsP1Actual.textContent = p1Seconds.toFixed(3) + 's';
    const p1Sign = p1Diff > 0 ? '+' : '';
    vsP1Diff.textContent = p1Sign + p1Diff.toFixed(3) + 's';

    vsP2Actual.textContent = p2Seconds.toFixed(3) + 's';
    const p2Sign = p2Diff > 0 ? '+' : '';
    vsP2Diff.textContent = p2Sign + p2Diff.toFixed(3) + 's';

    // Apply styling based on who is closer
    let winnerTitle = '';
    let winnerDesc = '';

    // Reset winner/loser classes
    vsResP1Card.className = 'vs-player-result';
    vsResP2Card.className = 'vs-player-result';

    const p1Color = 'var(--primary-color)';
    const p2Color = '#a78bfa';
    const drawColor = 'var(--okay-color)';

    if (p1AbsDiff < p2AbsDiff) {
        // Player 1 Wins!
        vsResP1Card.classList.add('winner');
        vsResP2Card.classList.add('loser');

        winnerTitle = "🏆 Player 1 Wins!";
        winnerDesc = `Player 1 stopped the timer just ${p1AbsDiff.toFixed(3)}s away from the target, beating Player 2 by ${(p2AbsDiff - p1AbsDiff).toFixed(3)}s!`;

        vsFeedbackTitle.style.color = p1Color;
        vsFeedbackTitle.style.textShadow = '0 0 15px rgba(59, 130, 246, 0.4)';

        vsP1Diff.style.color = 'var(--perfect-color)';
        vsP2Diff.style.color = 'var(--bad-color)';
    } else if (p2AbsDiff < p1AbsDiff) {
        // Player 2 Wins!
        vsResP2Card.classList.add('winner');
        vsResP1Card.classList.add('loser');

        winnerTitle = "🏆 Player 2 Wins!";
        winnerDesc = `Player 2 stopped the timer just ${p2AbsDiff.toFixed(3)}s away from the target, beating Player 1 by ${(p1AbsDiff - p2AbsDiff).toFixed(3)}s!`;

        vsFeedbackTitle.style.color = '#c084fc';
        vsFeedbackTitle.style.textShadow = '0 0 15px rgba(192, 132, 252, 0.4)';

        vsP2Diff.style.color = 'var(--perfect-color)';
        vsP1Diff.style.color = 'var(--bad-color)';
    } else {
        // Tie!
        vsResP1Card.classList.add('winner');
        vsResP2Card.classList.add('winner');

        winnerTitle = "🤝 It's a Tie!";
        winnerDesc = `Remarkable precision! Both players stopped exactly ${p1AbsDiff.toFixed(3)}s away from the target.`;

        vsFeedbackTitle.style.color = drawColor;
        vsFeedbackTitle.style.textShadow = '0 0 15px rgba(234, 179, 8, 0.4)';

        vsP1Diff.style.color = 'var(--perfect-color)';
        vsP2Diff.style.color = 'var(--perfect-color)';
    }

    vsFeedbackTitle.textContent = winnerTitle;
    vsFeedbackDesc.textContent = winnerDesc;

    // Change reset button text to play again
    resetBtn.textContent = 'Play Again';
    resetBtn.className = 'btn primary';

    // Show Results Panel
    versusResultsPanel.classList.remove('hidden');
}

// Event Listeners
startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopTimer);
resetBtn.addEventListener('click', resetTimer);

// Mode Toggle Button Listeners
modeSingleBtn.addEventListener('click', () => setGameMode('single'));
modeVersusBtn.addEventListener('click', () => setGameMode('versus'));

// Reroll Target listener (Versus)
versusRerollBtn.addEventListener('click', () => {
    if (versusPhase === 'p1-ready') {
        versusTargetTime = generateRandomTarget();
        versusTargetVal.textContent = versusTargetTime.toFixed(3) + 's';

        // Add rapid rotation visual effect to the roll svg
        const svg = versusRerollBtn.querySelector('svg');
        svg.style.transition = 'transform 0.4s ease';
        svg.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            svg.style.transition = 'none';
            svg.style.transform = 'rotate(0deg)';
        }, 400);
    }
});

// Toggle custom time input display based on selection
targetTimeSelect.addEventListener('change', () => {
    if (targetTimeSelect.value === 'custom') {
        customTimeContainer.classList.remove('hidden');
        customTimeInput.focus();
    } else {
        customTimeContainer.classList.add('hidden');
    }
});

// Format/validate custom time on blur
customTimeInput.addEventListener('blur', () => {
    let value = parseFloat(customTimeInput.value);
    if (isNaN(value) || value <= 0) {
        customTimeInput.value = '5.500';
    } else {
        customTimeInput.value = value.toFixed(3);
    }
});

// Initialize display
updateDisplay(0);
