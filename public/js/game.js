const board = document.getElementById('game-board');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const powerupBtn = document.getElementById('powerup-btn');
const diffSelect = document.getElementById('difficulty');
const themeSelect = document.getElementById('theme');
const messageEl = document.getElementById('game-message');


let timerInterval;
let firstCard, secondCard;
let clicks = 0, matched = 0, totalPairs = 0;
let timeLeft = 0, isBusy = false;
let powerupsUsed = 0, maxPowerups = 0;
let gameActive = false;

const clicksEl = document.getElementById('clicks');
const matchedEl = document.getElementById('matched');
const totalPairsEl = document.getElementById('total-pairs');
const remainingEl = document.getElementById('remaining');
const timerEl = document.getElementById('timer');

// Fetch all Pokémon names (limit 1500)
async function fetchAllPokemon() {
  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1500');
  const data = await res.json();
  return data.results.map(p => p.name);
}

// Get best sprite or fallback 
async function getSprite(name) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const data = await res.json();
    const art = data.sprites.other?.['official-artwork']?.front_default;
    if (art) return art;
    if (data.sprites.front_default) return data.sprites.front_default;
  } catch (e) {
    console.warn(`Error fetching ${name}`, e);
  }
  return '/images/poke-ball.png';
}

// Shuffle function
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Set up the Board
async function setupBoard() {
  messageEl.innerHTML = '';
  clearInterval(timerInterval);
  isBusy = false;
  gameActive = false;
  board.innerHTML = '';
  clicks = matched = 0;
  clicksEl.textContent = 0;
  matchedEl.textContent = 0;
  powerupsUsed = 0;
  powerupBtn.disabled = false;

  // difficulty → cols, rows, time, powerups
  const diff = diffSelect.value;
  let cols, rows;
  if (diff === 'easy') {
    cols = 3; rows = 2; timeLeft = 60; maxPowerups = 1;
  } else if (diff === 'medium') {
    cols = 4; rows = 3; timeLeft = 90; maxPowerups = 2;
  } else {
    cols = 6; rows = 3; timeLeft = 120; maxPowerups = 3;
  }

  totalPairs = (rows * cols) / 2;
  totalPairsEl.textContent = totalPairs;
  remainingEl.textContent = totalPairs - matched;
  board.className = '';
  board.style.display = 'grid';
  board.style.gridTemplateColumns = `repeat(${cols}, var(--card-size))`;
  board.style.rowGap = '0.5rem';
  board.style.columnGap = '0.25rem';
  board.style.justifyContent = 'center';
  updateTimerDisplay();

  // Gather valid picks
  const allNames = await fetchAllPokemon();
  shuffle(allNames);
  const picks = [];
  for (const name of allNames) {
    const url = await getSprite(name);
    if (url !== '/images/poke-ball.png') {
      picks.push({ name, url });
      if (picks.length === totalPairs) break;
    }
  }

  // Duplicate & shuffle for pairs
  const pairList = shuffle([...picks, ...picks]);

  // Create cards
  for (const { name, url } of pairList) {
    const col = document.createElement('div');
    col.className = 'col d-flex justify-content-center';
    const card = document.createElement('div');
    card.className = 'card';
    card.style.width = 'var(--card-size)';
    card.style.height = 'var(--card-size)';
    card.innerHTML = `
      <div class="card-inner">
        <img class="card-front" src="${url}" alt="${name}">
        <div class="card-back"></div>
      </div>
    `;
    card.onclick = () => onCardClick(card);
    col.appendChild(card);
    board.appendChild(col);
  }

  startTimer();
  gameActive = true;
}

// Handle flip logic 
function onCardClick(card) {
  if (!gameActive || isBusy || card.classList.contains('flipped') || matched === totalPairs) return;
  card.classList.add('flipped');
  if (!firstCard) firstCard = card;
  else {
    secondCard = card;
    clicksEl.textContent = ++clicks;
    checkForMatch();
  }
}

function checkForMatch() {
  isBusy = true;
  const img1 = firstCard.querySelector('.card-front').src;
  const img2 = secondCard.querySelector('.card-front').src;
  if (img1 === img2) {
    matchedEl.textContent = ++matched;
    remainingEl.textContent = totalPairs - matched;
    firstCard.onclick = secondCard.onclick = null;
    resetSelection();
    if (matched === totalPairs) endGame(true);
  } else {
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      resetSelection();
    }, 1000);
  }
}

function resetSelection() {
  [firstCard, secondCard] = [null, null];
  isBusy = false;
}

// Timer & endgame 
function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (--timeLeft <= 0) endGame(false);
    updateTimerDisplay();
  }, 1000);
}
function updateTimerDisplay() {
  const m = String(Math.floor(timeLeft / 60)).padStart(2, '0'),
    s = String(timeLeft % 60).padStart(2, '0');
  timerEl.textContent = `${m}:${s}`;
}

function endGame(win) {
  clearInterval(timerInterval);
  isBusy = true;
  gameActive = false;

  // Build a Bootstrap alert
  const type = win ? 'success' : 'danger';
  const icon = win ? '🎉' : '⏰';
  const heading = win ? 'Congratulations!' : "Oh no!";
  const text = win
    ? 'You matched all the cards! Great job!'
    : 'Time’s up! Better luck next time.';

  messageEl.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      <strong>${icon} ${heading}</strong> ${text}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}


// Power-up 
powerupBtn.addEventListener('click', () => {
  if (!gameActive || powerupsUsed >= maxPowerups) return;
  powerupsUsed++;
  powerupBtn.disabled = true;
  isBusy = true;
  document.querySelectorAll('.card').forEach(c => c.classList.add('flipped'));
  setTimeout(() => {
    document.querySelectorAll('.card').forEach(c => {
      if (c.onclick) c.classList.remove('flipped');
    });
    isBusy = false;
    if (powerupsUsed < maxPowerups) powerupBtn.disabled = false;
  }, 2000);
});

// Theme switch 
themeSelect.addEventListener('change', () => {
  document.body.className = `${themeSelect.value}-theme`;
});

// Controls
startBtn.addEventListener('click', setupBoard);
resetBtn.addEventListener('click', setupBoard);
diffSelect.addEventListener('change', setupBoard);

// No auto-start; user must click “Start”
