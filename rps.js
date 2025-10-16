let userScore = 0;
let cpuScore = 0;
let playerLives = 5;
let cpuLives = 5;
let soundEnabled = true;
let difficulty = 'medium'

// DOM Elements
const playerHand = document.getElementById('player-hand');
const cpuHand = document.getElementById('cpu-hand');
const resultDiv = document.getElementById('result');
const scoreDiv = document.getElementById('score');
const playerHearts = document.querySelectorAll('#player-lives .heart');
const cpuHearts = document.querySelectorAll('#cpu-lives .heart');
const actionOverlay = document.getElementById('action-overlay');
const actionText = document.getElementById('action-text');

// Image paths
const images = {
  player: {
    rock: 'player_rock.png',
    paper: 'player_paper.png',
    scissors: 'player_scissors.png'
  },
  cpu: {
    rock: 'cpu_rock.png',
    paper: 'cpu_paper.png',
    scissors: 'cpu_scissors.png'
  }
};

// Sound effects
const sounds = {
  click: new Audio('sounds/click.mp3'),
  win: new Audio('sounds/win.mp3'),
  lose: new Audio('sounds/lose.mp3'),
  draw: new Audio('sounds/draw.mp3')
};

const difficultySettings = {
  easy: { winRate: 0.2, reactionDelay: 1000 },
  medium: { winRate: 0.5, reactionDelay: 600 },
  hard: { winRate: 0.8, reactionDelay: 300 }
};

const avatars = {
  player: document.getElementById('player-avatar'),
  cpu: document.getElementById('cpu-avatar')
};

// Set sound volumes
sounds.click.volume = 0.3;
sounds.win.volume = 0.7;
sounds.lose.volume = 0.7;
sounds.draw.volume = 0.5;

// Initialize sound preference
if (localStorage.getItem('rpsSoundPref') === 'false') {
  soundEnabled = false;
  const soundBtn = document.querySelector('.menu-content button:nth-of-type(1)');
  soundBtn.innerHTML = '<span class="sound-icon">🔇</span> Sound OFF';
}

// Menu toggle function
function toggleMenu() {
  const menu = document.querySelector('.menu-dropdown');
  menu.classList.toggle('open');
}

// Sound toggle function
function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem('rpsSoundPref', soundEnabled);
  
  const soundBtn = document.querySelector('.menu-content button:nth-of-type(1)');
  soundBtn.innerHTML = soundEnabled 
    ? '<span class="sound-icon">🔊</span> Sound ON' 
    : '<span class="sound-icon">🔇</span> Sound OFF';

  if (soundEnabled) sounds.click.play().catch(e => {});
}

function setDifficulty(level) {
  difficulty = level;
  localStorage.setItem('rpsDifficulty', level);
}

// Initialize from storage
if (localStorage.getItem('rpsDifficulty')) {
  difficulty = localStorage.getItem('rpsDifficulty');
  document.getElementById('difficulty-selector').value = difficulty;
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.menu-container')) {
    document.querySelector('.menu-dropdown').classList.remove('open');
  }
});

// Game functions
function startGame(userChoice) {
  if (playerLives === 0 || cpuLives === 0) return;
  if (soundEnabled) sounds.click.play().catch(e => {});

  // Get CPU choice early (for difficulty system)
  const cpuChoice = getCpuChoice(userChoice);

  // Original shaking animation
  playerHand.src = images.player.rock;
  cpuHand.src = images.cpu.rock;
  playerHand.classList.add('shake');
  cpuHand.classList.add('shake');
  toggleButtons(true);

  setTimeout(() => {
    // Original animation removal
    playerHand.classList.remove('shake');
    cpuHand.classList.remove('shake');

    // Use pre-determined CPU choice (for difficulty)
    playerHand.src = images.player[userChoice];
    cpuHand.src = images.cpu[cpuChoice];

    // Original game logic
    const resultObj = getResult(userChoice, cpuChoice);
    updateGame(resultObj);
    toggleButtons(false);

    // Original hand reset
    setTimeout(() => {
      playerHand.src = images.player.rock;
      cpuHand.src = images.cpu.rock;
    }, 1200);
    
  }, difficultySettings[difficulty].reactionDelay); // Dynamic delay based on difficulty

  // Add to startGame()
  function showCpuThinking() {
    const thinking = ['rock', 'paper', 'scissors'];
    let i = 0;
    const interval = setInterval(() => {
      cpuHand.src = images.cpu[thinking[i % 3]];
      i++;
    },  200);
  
    setTimeout(() => clearInterval(interval), difficultySettings[difficulty].reactionDelay);
  }
}

// Modified getCpuChoice() function
function getCpuChoice(userChoice) {
  const choices = ['rock', 'paper', 'scissors'];
  const shouldCounter = Math.random() < difficultySettings[difficulty].winRate;
  
  if (shouldCounter && userChoice) {
    // Counter the player's move
    return {
      'rock': 'paper',
      'paper': 'scissors',
      'scissors': 'rock'
    }[userChoice];
  }
  
  // Random choice
  return choices[Math.floor(Math.random() * choices.length)];
}

function getResult(player, cpu) {
  const actions = {
    rock: { scissors: 'Rock smashes Scissors' },
    paper: { rock: 'Paper wraps Rock' },
    scissors: { paper: 'Scissors cuts Paper' }
  };

  if (player === cpu) {
    return {
      result: `It's a draw! You both chose ${player}.`,
      action: '',
      winner: 'none'
    };
  }

  if (actions[player] && actions[player][cpu]) {
    return {
      result: `You win! ${actions[player][cpu]}.`,
      action: actions[player][cpu],
      winner: 'player'
    };
  } else {
    return {
      result: `You lose! ${actions[cpu][player]}.`,
      action: actions[cpu][player],
      winner: 'cpu'
    };
  }
}

function updateGame({ result, action, winner }) {
  // Score and lives logic (unchanged)
  if (winner === 'player') {
    userScore++;
    cpuLives--;
    updateHearts(cpuHearts, cpuLives);
  } else if (winner === 'cpu') {
    cpuScore++;
    playerLives--;
    updateHearts(playerHearts, playerLives);
  }

  // DOM updates (unchanged)
  scoreDiv.textContent = `You: ${userScore} | CPU: ${cpuScore}`;
  resultDiv.textContent = result;

  // Sound effects (unchanged)
  if (soundEnabled) {
    if (winner === 'player') sounds.win.play().catch(e => {});
    else if (winner === 'cpu') sounds.lose.play().catch(e => {});
    else sounds.draw.play().catch(e => {});
  }

  // Action overlay (unchanged)
  if (action) {
    actionText.textContent = action;
    actionOverlay.style.opacity = 1;
    setTimeout(() => actionOverlay.style.opacity = 0, 1500);
  }

  // Avatar states (new addition)
  const playerAvatar = document.getElementById('player-avatar');
  const cpuAvatar = document.getElementById('cpu-avatar');
  
  // Reset previous states
  playerAvatar.className = 'avatar';
  cpuAvatar.className = 'avatar';

  if (winner === 'player') {
    playerAvatar.classList.add('avatar-win');
    cpuAvatar.classList.add('avatar-lose');
  } else if (winner === 'cpu') {
    cpuAvatar.classList.add('avatar-win');
    playerAvatar.classList.add('avatar-lose');
  } else {
    playerAvatar.classList.add('avatar-draw');
    cpuAvatar.classList.add('avatar-draw');
  }

  // Game over logic (unchanged)
  if (playerLives === 0 || cpuLives === 0) {
    document.body.classList.add('is-game-over');
    toggleButtons(true);
    setTimeout(() => {
      resultDiv.textContent = playerLives === 0 ? "Game Over! CPU wins!" : "You win the game!";
    }, 1000);
  } else {
    document.body.classList.remove('is-game-over');
  }
}

function updateHearts(hearts, lives) {
  hearts.forEach((heart, index) => {
    heart.style.opacity = index < lives ? '1' : '0.2';
  });
}

function toggleButtons(disabled) {
  document.querySelectorAll('button').forEach(btn => {
    btn.disabled = disabled;
  });
}

function resetGame() {
  playerLives = 5;
  cpuLives = 5;
  userScore = 0;
  cpuScore = 0;
  updateHearts(playerHearts, playerLives);
  updateHearts(cpuHearts, cpuLives);
  scoreDiv.textContent = `You: 0 | CPU: 0`;
  resultDiv.textContent = 'Make your move!';
  toggleButtons(false);
  document.body.classList.remove('is-game-over');
}

// Image error handling
playerHand.onerror = () => console.error("Player hand image failed to load");
cpuHand.onerror = () => console.error("CPU hand image failed to load");

// Sound error handling
Object.values(sounds).forEach(sound => {
  sound.onerror = () => console.error("Sound failed to load");
});