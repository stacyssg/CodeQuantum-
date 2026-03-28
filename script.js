const ROWS = 6;
const COLS = 7;
const HUMAN_RED = 1;
const HUMAN_YELLOW = 2;

const state = {
  board: createBoard(),
  currentPlayer: HUMAN_RED,
  gameOver: false,
  winningCells: [],
  mode: "pvp",
  scores: {
    red: 0,
    yellow: 0,
  },
  ambientOn: true,
};

const homeScreen = document.getElementById("homeScreen");
const gameScreen = document.getElementById("gameScreen");
const boardEl = document.getElementById("board");
const columnButtonsEl = document.getElementById("columnButtons");
const turnTextEl = document.getElementById("turnText");
const statusMessageEl = document.getElementById("statusMessage");
const redScoreEl = document.getElementById("redScore");
const yellowScoreEl = document.getElementById("yellowScore");
const yellowRoleLabelEl = document.getElementById("yellowRoleLabel");
const modeBadgeEl = document.getElementById("modeBadge");
const resultModal = document.getElementById("resultModal");
const resultTitleEl = document.getElementById("resultTitle");
const resultMessageEl = document.getElementById("resultMessage");
const howToPlayModal = document.getElementById("howToPlayModal");
const themeToggleBtn = document.getElementById("themeToggle");

const twoPlayerBtn = document.getElementById("twoPlayerBtn");
const cpuBtn = document.getElementById("cpuBtn");
const howToPlayBtn = document.getElementById("howToPlayBtn");
const closeHowToPlayBtn = document.getElementById("closeHowToPlayBtn");
const restartBtn = document.getElementById("restartBtn");
const newMatchBtn = document.getElementById("newMatchBtn");
const homeBtn = document.getElementById("homeBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const resultHomeBtn = document.getElementById("resultHomeBtn");

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function startGame(mode) {
  state.mode = mode;
  state.board = createBoard();
  state.currentPlayer = HUMAN_RED;
  state.gameOver = false;
  state.winningCells = [];

  yellowRoleLabelEl.textContent = mode === "cpu" ? "Computer" : "Player 2";
  modeBadgeEl.textContent = mode === "cpu" ? "Vs Computer" : "2 Players";

  showScreen("game");
  closeModal(resultModal);
  render();
}

function showScreen(screen) {
  const isHome = screen === "home";
  homeScreen.classList.toggle("active", isHome);
  homeScreen.hidden = !isHome;
  gameScreen.classList.toggle("active", !isHome);
  gameScreen.hidden = isHome;
}

function render() {
  renderBoard();
  renderColumnButtons();
  renderSidebar();
}

function renderBoard() {
  boardEl.innerHTML = "";

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const cellValue = state.board[row][col];
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.setAttribute("role", "gridcell");
      cell.dataset.row = String(row);
      cell.dataset.col = String(col);

      if (cellValue === HUMAN_RED) {
        cell.classList.add("red");
        cell.dataset.label = "R";
        cell.setAttribute("aria-label", `Red token at row ${row + 1}, column ${col + 1}`);
      } else if (cellValue === HUMAN_YELLOW) {
        cell.classList.add("yellow");
        cell.dataset.label = "Y";
        cell.setAttribute("aria-label", `Yellow token at row ${row + 1}, column ${col + 1}`);
      } else {
        cell.setAttribute("aria-label", `Empty slot at row ${row + 1}, column ${col + 1}`);
      }

      if (state.winningCells.some((pos) => pos.row === row && pos.col === col)) {
        cell.classList.add("winning");
      }

      boardEl.appendChild(cell);
    }
  }
}

function renderColumnButtons() {
  columnButtonsEl.innerHTML = "";

  for (let col = 0; col < COLS; col += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "column-button";
    button.textContent = String(col + 1);
    button.setAttribute("aria-label", `Drop token in column ${col + 1}`);

    const columnFull = state.board[0][col] !== 0;
    const cpuTurn = state.mode === "cpu" && state.currentPlayer === HUMAN_YELLOW;
    button.disabled = columnFull || state.gameOver || cpuTurn;

    button.addEventListener("click", () => handleColumnChoice(col));
    button.addEventListener("mouseenter", () => highlightColumn(col));
    button.addEventListener("mouseleave", clearColumnHighlight);
    button.addEventListener("focus", () => highlightColumn(col));
    button.addEventListener("blur", clearColumnHighlight);

    columnButtonsEl.appendChild(button);
  }
}

function renderSidebar() {
  turnTextEl.textContent = playerName(state.currentPlayer);
  statusMessageEl.textContent = buildStatusMessage();
  redScoreEl.textContent = String(state.scores.red);
  yellowScoreEl.textContent = String(state.scores.yellow);
}

function buildStatusMessage() {
  if (state.gameOver) {
    if (state.winningCells.length > 0) {
      return `${playerName(state.currentPlayer)} connected 4.`;
    }
    return "The round ended in a draw.";
  }

  if (state.mode === "cpu" && state.currentPlayer === HUMAN_YELLOW) {
    return "Computer is choosing a move...";
  }

  return `${playerName(state.currentPlayer)}: choose a column.`;
}

function handleColumnChoice(col) {
  if (state.gameOver) return;
  if (state.mode === "cpu" && state.currentPlayer === HUMAN_YELLOW) return;

  const row = getOpenRow(col, state.board);
  if (row === -1) return;

  dropToken(row, col, state.currentPlayer);

  if (!state.gameOver && state.mode === "cpu" && state.currentPlayer === HUMAN_YELLOW) {
    window.setTimeout(makeComputerMove, 500);
  }
}

function dropToken(row, col, player) {
  state.board[row][col] = player;
  const outcome = evaluateBoard(state.board, player);

  if (outcome.isWin) {
    state.gameOver = true;
    state.winningCells = outcome.winningCells;
    if (player === HUMAN_RED) {
      state.scores.red += 1;
    } else {
      state.scores.yellow += 1;
    }
    render();
    showResult(`${playerName(player)} Wins`, `${playerName(player)} connected 4 in a row.`);
    return;
  }

  if (boardIsFull(state.board)) {
    state.gameOver = true;
    state.winningCells = [];
    render();
    showResult("Draw Game", "The board is full. Start another round.");
    return;
  }

  state.currentPlayer = player === HUMAN_RED ? HUMAN_YELLOW : HUMAN_RED;
  render();
}

function getOpenRow(col, board) {
  for (let row = ROWS - 1; row >= 0; row -= 1) {
    if (board[row][col] === 0) {
      return row;
    }
  }
  return -1;
}

function boardIsFull(board) {
  return board[0].every((cell) => cell !== 0);
}

function evaluateBoard(board, player) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      if (board[row][col] !== player) continue;

      for (const [dr, dc] of directions) {
        const cells = [{ row, col }];

        for (let step = 1; step < 4; step += 1) {
          const nextRow = row + dr * step;
          const nextCol = col + dc * step;

          if (
            nextRow < 0 ||
            nextRow >= ROWS ||
            nextCol < 0 ||
            nextCol >= COLS ||
            board[nextRow][nextCol] !== player
          ) {
            break;
          }

          cells.push({ row: nextRow, col: nextCol });
        }

        if (cells.length === 4) {
          return { isWin: true, winningCells: cells };
        }
      }
    }
  }

  return { isWin: false, winningCells: [] };
}

function playerName(player) {
  if (player === HUMAN_RED) return "Red";
  return state.mode === "cpu" ? "Computer" : "Yellow";
}

function showResult(title, message) {
  resultTitleEl.textContent = title;
  resultMessageEl.textContent = message;
  openModal(resultModal);
}

function resetRound() {
  state.board = createBoard();
  state.currentPlayer = HUMAN_RED;
  state.gameOver = false;
  state.winningCells = [];
  closeModal(resultModal);
  render();
}

function resetMatch() {
  state.scores.red = 0;
  state.scores.yellow = 0;
  resetRound();
}

function openModal(modal) {
  modal.hidden = false;
}

function closeModal(modal) {
  modal.hidden = true;
}

function highlightColumn(col) {
  const buttons = [...columnButtonsEl.children];
  buttons.forEach((btn, index) => {
    btn.classList.toggle("active-column", index === col);
  });
}

function clearColumnHighlight() {
  [...columnButtonsEl.children].forEach((btn) => btn.classList.remove("active-column"));
}

function cloneBoard(board) {
  return board.map((row) => [...row]);
}

function makeComputerMove() {
  if (state.gameOver || state.currentPlayer !== HUMAN_YELLOW) return;

  const candidateColumn = chooseComputerColumn();
  const row = getOpenRow(candidateColumn, state.board);

  if (row !== -1) {
    dropToken(row, candidateColumn, HUMAN_YELLOW);
  }
}

function chooseComputerColumn() {
  const availableColumns = [];

  for (let col = 0; col < COLS; col += 1) {
    if (getOpenRow(col, state.board) !== -1) {
      availableColumns.push(col);
    }
  }

  for (const col of availableColumns) {
    const tempBoard = cloneBoard(state.board);
    const row = getOpenRow(col, tempBoard);
    tempBoard[row][col] = HUMAN_YELLOW;
    if (evaluateBoard(tempBoard, HUMAN_YELLOW).isWin) return col;
  }

  for (const col of availableColumns) {
    const tempBoard = cloneBoard(state.board);
    const row = getOpenRow(col, tempBoard);
    tempBoard[row][col] = HUMAN_RED;
    if (evaluateBoard(tempBoard, HUMAN_RED).isWin) return col;
  }

  const preferredOrder = [3, 2, 4, 1, 5, 0, 6];
  for (const col of preferredOrder) {
    if (availableColumns.includes(col)) {
      return col;
    }
  }

  return availableColumns[0] ?? 0;
}

/*function chooseComputerColumn() {
  const availableColumns = [];

  for (let col = 0; col < COLS; col++) {
    if (getOpenRow(col, state.board) !== -1) {
      availableColumns.push(col);
    }
  }

  let bestScore = -Infinity;
  let bestCol = availableColumns[0];

  for (const col of availableColumns) {
    const tempBoard = cloneBoard(state.board);
    const row = getOpenRow(col, tempBoard);
    tempBoard[row][col] = HUMAN_YELLOW;

    // WIN immediately
    if (evaluateBoard(tempBoard, HUMAN_YELLOW).isWin) {
      return col;
    }

    // Check opponent response
    let worstCaseScore = Infinity;

    for (const oppCol of availableColumns) {
      const oppBoard = cloneBoard(tempBoard);
      const oppRow = getOpenRow(oppCol, oppBoard);
      if (oppRow === -1) continue;

      oppBoard[oppRow][oppCol] = HUMAN_RED;

      if (evaluateBoard(oppBoard, HUMAN_RED).isWin) {
        worstCaseScore = -100; // BAD move
        break;
      }

      const score = scorePosition(oppBoard, HUMAN_YELLOW);
      worstCaseScore = Math.min(worstCaseScore, score);
    }

    if (worstCaseScore > bestScore) {
      bestScore = worstCaseScore;
      bestCol = col;
    }
  }

  return bestCol;
}*/

function toggleAmbient() {
  state.ambientOn = !state.ambientOn;
  document.body.classList.toggle("ambient-off", !state.ambientOn);
  themeToggleBtn.textContent = state.ambientOn ? "Ambient On" : "Ambient Off";
}

function bindEvents() {
  twoPlayerBtn.addEventListener("click", () => startGame("pvp"));
  cpuBtn.addEventListener("click", () => startGame("cpu"));
  howToPlayBtn.addEventListener("click", () => openModal(howToPlayModal));
  closeHowToPlayBtn.addEventListener("click", () => closeModal(howToPlayModal));
  restartBtn.addEventListener("click", resetRound);
  newMatchBtn.addEventListener("click", resetMatch);
  homeBtn.addEventListener("click", () => {
    closeModal(resultModal);
    showScreen("home");
  });
  playAgainBtn.addEventListener("click", resetRound);
  resultHomeBtn.addEventListener("click", () => {
    closeModal(resultModal);
    showScreen("home");
  });
  themeToggleBtn.addEventListener("click", toggleAmbient);

  [resultModal, howToPlayModal].forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal(resultModal);
      closeModal(howToPlayModal);
    }

    const numericKey = Number(event.key);
    if (
      numericKey >= 1 &&
      numericKey <= 7 &&
      gameScreen.classList.contains("active") &&
      !resultModal.hidden &&
      false
    ) {
      // Intentionally unreachable: preserved to avoid accidental key play when modal is open.
    }

    if (
      numericKey >= 1 &&
      numericKey <= 7 &&
      gameScreen.classList.contains("active") &&
      resultModal.hidden &&
      howToPlayModal.hidden
    ) {
      handleColumnChoice(numericKey - 1);
    }
  });
}

function init() {
  bindEvents();
  showScreen("home");
  render();
}

init();
