'use strict';
// CONSTS
const FLAG = '🚩';
const MINE = '💣';
const CLEAN = ' ';

// GLOBAL VARS
var gBoard;
var gStateHistory = [];
// gLevel
var gLevelName = 'Beginner';
var gLevel = {
  SIZE: 4,
  MINES: 2,
};
// gGame
var gGame = {
  isOn: false,
  isHint: false,
  shownCount: 0,
  markedCount: 0,
  winCount: gLevel.SIZE ** 2,
  LIVES: 3,
  HINTS: 3,
  SAFES: 3,
};
// Mines locations
var gMinesCords = [];
// timers
var gTimerInterval;
var gStartTime;
var gHighscore;
// double check for board
var gGameFinished;
var gIsManual;
var gIsPlacedMines;
// last cellclicked
var gLastCell = {
  i: 0,
  j: 0,
};
// positions of safe clicks
var gSafeCells = [];
// string of lives
var gLiveStr = '❤ ❤ ❤';
// states of last games
var gStates;

// FUNCTIONS
// disables the automatic right click response on a mouse.
document.addEventListener('contextmenu', (event) => event.preventDefault());
// first function that runs
function initGame() {
  // gStates = [];
  renderScore(gLevelName);
  gGameFinished = false;
  gIsManual = false;
  gIsPlacedMines = false;
  buildBoard();
  // addState();
  renderBoard(gBoard);
}
// SINGLE CELL Creation
function buildCell() {
  return {
    minesAroundCount: 0,
    isShown: false,
    isMine: false,
    isMarked: false,
  };
}
// MODEL CONSTRUCTOR
function buildBoard() {
  gBoard = [];
  for (var i = 0; i < gLevel.SIZE; i++) {
    gBoard[i] = [];
    for (var j = 0; j < gLevel.SIZE; j++) {
      gBoard[i][j] = buildCell();
    }
  }
  return gBoard;
}
// places random mines on MODEL
function placeMines(cellI, cellJ) {
  var count = 0;
  while (count < gLevel.MINES) {
    var rndI = getRandomInteger(0, gLevel.SIZE);
    var rndJ = getRandomInteger(0, gLevel.SIZE);
    if (gBoard[rndI][rndJ].isMine) {
      continue;
    }
    if (rndI === cellI && rndJ === cellJ) {
      continue;
    }
    gBoard[rndI][rndJ].isMine = true;
    gMinesCords.push({ rndI, rndJ });
    count++;
  }
}

// sets the numbers for tiles(negs.length) to be rendered later
function setMinesNegsCount(board) {
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      var currPos = { i, j };
      var currMines = getAllNegs(currPos);
      board[i][j].minesAroundCount = currMines.length;
    }
  }
}
// if on mine => gameOver / if not on a mine => if no neighbors => sends pos to expandShown
// each click checks if game won or lost
function cellClicked(elCell, i, j) {
  // if manual mode is on
  if (gIsManual) {
    var currCell = gBoard[i][j];
    currCell.isMine = true;
    renderCell({ i, j }, MINE);
    gIsPlacedMines = true;
    return;
  }
  // update gGame to ON and place mines
  if (!gGameFinished) {
    if (!gGame.isOn) {
      gGame.isOn = true;
      startTimer();
      // if didnt place any bombs
      if (!gIsPlacedMines) {
        placeMines(i, j);
      } else {
        renderBoard(gBoard);
      }
      setMinesNegsCount(gBoard);
    }
    gLastCell.i = i;
    gLastCell.j = j;
    var currCell = gBoard[i][j];
    if (currCell.isMarked) return;
    if (currCell.isShown) return;
    // if HINT is not-active
    if (!gGame.isHint) {
      // IF NOT ON A MINE
      if (!currCell.isMine) {
        if (currCell.minesAroundCount === 0) {
          expandShown({ i, j });
        } else {
          currCell.isShown = true;
          gGame.shownCount++;
        }
        // addState();
        renderBoard(gBoard);
        renderStats();
      }
      // IF ON A MINE
      else {
        gGame.LIVES--;
        // if DEAD
        if (gGame.LIVES === 0) {
          isGameOver(true);
          return;
          //
        } else {
          
          renderStats(); 
          renderCell({ i, j }, MINE);
          elCell.style.backgroundColor = 'red';
          document.querySelector('.smile').innerHTML = '😢';
          setTimeout(() => {
            if (gGame.LIVES !== 0) {
              document.querySelector('.smile').innerHTML = '😄';
              renderCell({ i, j }, CLEAN);
              renderBoard(gBoard);
            }
          }, 1000);
        }
      }
      isGameOver(false);
      // if HINT is used
    } else {
      gGame.HINTS--;
      // get all unshown positions
      var hintedNegs = getAllNegsHinted({ i, j });
      renderBoard(gBoard);
      gGame.isHint = false;
      // after 1 sec unrender them
      setTimeout(() => {
        hideAllNegsHinted(hintedNegs);
        renderBoard(gBoard);
      }, 1000);
    }
  }
  saveState();
}

// marks a cell(FLAG)
function cellMarked(elCell, i, j) {
  if (!gIsManual) {
    if (!gGameFinished) {
      if (!gGame.isOn) {
        gGame.isOn = true;
        startTimer();
        placeMines(i, j);
        setMinesNegsCount(gBoard);
      }
      var currCell = gBoard[i][j];
      if (currCell.isShown) {
        return;
      }
      if (gGame.markedCount < gLevel.MINES && !currCell.isMarked) {
        currCell.isMarked = true;
        gGame.markedCount++;
      } else if (currCell.isMarked) {
        currCell.isMarked = false;
        gGame.markedCount--;
      }
      renderStats();
      isGameOver(false);
      renderBoard(gBoard);
    }
  }
}

// if not mine or marked and got negs show only it
function expandShownRecursion(i, j) {
  var currCell = gBoard[i][j];
  // the stop case
  if (!currCell.isMine && !currCell.isShown && !currCell.isMarked) {
    currCell.isShown = true;
    gGame.shownCount++;
    return true;
  }
  return false;
}

// expands the clean cells around a called pos
function expandShown(pos) {
  for (var i = pos.i - 1; i <= pos.i + 1 && i < gLevel.SIZE; i++) {
    if (i < 0) continue;
    for (var j = pos.j - 1; j <= pos.j + 1 && j < gLevel.SIZE; j++) {
      if (j < 0) continue;
     var currCell = gBoard[i][j];
      // RECURSION TEST STOP CASE
      if (currCell.minesAroundCount > 0) {
        expandShownRecursion(i, j);
      }
      // RECURSION TEST
      else {
        if (currCell.isMarked) continue;
        if (currCell.isShown) continue;
        if (!currCell.isMine) {
          var currCords = {
            i,
            j,
          };
          currCell.isShown = true;
          expandShown(currCords);
          gGame.shownCount++;
        }
      }
    }
  }
  renderStats();
  renderBoard(gBoard);
}

// MANUAL functions
function setManual() {
  if (!gGameFinished) {
    if (!gGame.isOn) {
      // switch manual to TRUE/FALSE
      gIsManual = !gIsManual;
      if (gIsManual) {
        document.querySelector('.timer').innerHTML = 'Manual mode ON!';
      } else {
        document.querySelector('.timer').innerHTML = 'Manual mode OFF!';
      }
    }
  }
}

// GETS rnd clean SINGLE CELL #3
function getCleanCells() {
  var counter = 0;
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) {
        gSafeCells.push({ i, j });
        counter++;
      }
    }
  }
}
// GETS rnd clean CELLS^^^ #2
function getCleanCell() {
  var rndNum = getRandomInteger(0, gSafeCells.length);
  var rndPos = gSafeCells.splice(rndNum, 1)[0];
  return rndPos;
}

// SAFE CLICK functions^^^ #1
function safeClicked(elBtn) {
  if (!gGame.isOn) return;
  if (gGame.SAFES < 1) return;
  getCleanCells();
  if (gSafeCells.length === 0) return;
  gGame.SAFES--;
  var rndPos = getCleanCell();
  gBoard[rndPos.i][rndPos.j].isShown = true;
  renderBoard(gBoard);
  setTimeout(() => {
    gBoard[rndPos.i][rndPos.j].isShown = false;
    renderBoard(gBoard);
  }, 2000);
  isCellFound = true;
  if (gGame.SAFES === 0) {
    // elBtn.style.background = 'lightcoral';
    elBtn.style.cursor = 'not-allowed';
    elBtn.innerText = 'Out of safe clicks';
  } else {
    elBtn.innerText = `${gGame.SAFES} Safe clicks`;
  }
}

// HINT IMG functions
function clickedHint(elHint) {
  if (gGame.isHint || gGameFinished || gIsManual) {
    return;
  }
  gGame.isHint = true;
  elHint.src = 'img/on.png';
  elHint.removeAttribute('onclick');
  elHint.style.cursor = 'not-allowed';
  return;
}

// (isShown to all bombs if lost or won)
function getAllBombs() {
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      var currCell = gBoard[i][j];
      if (currCell.isMine) {
        currCell.isShown = true;
      }
      if (currCell.isMarked && currCell.isMine) {
        currCell.isMarked = false;
      } else {
        continue;
      }
    }
  }
  renderBoard(gBoard);
}
// LIVES switch case
function getLivesString() {
  switch (gGame.LIVES) {
    case 3:
      gLiveStr = '❤ ❤ ❤';
      break;
    case 2:
      gLiveStr = '❤ ❤';
      break;
    case 1:
      gLiveStr = '❤';
      break;
    case 0:
      gLiveStr = ' ';
      break;
  }
}
// LEVEL BUTTON fuctions
function setLevel(elBtn) {
  gLevelName = elBtn.innerText;
  switch (gLevelName) {
    case 'Beginner':
      gLevel.SIZE = 4;
      gLevel.MINES = 2;
      gGame.winCount = gLevel.SIZE ** 2;
      break;
    case 'Medium':
      gLevel.SIZE = 8;
      gLevel.MINES = 12;
      gGame.winCount = gLevel.SIZE ** 2;
      break;
    case 'Expert':
      gLevel.SIZE = 12;
      gLevel.MINES = 30;
      gGame.winCount = gLevel.SIZE ** 2;
      break;
  }
  forceReset();
}

// SMILE functions
function forceReset() {
  resetGame();
  initGame();
}

// resets all params
function resetGame() {
  gGame.LIVES = 3;
  gGame.HINTS = 3;
  gGame.SAFES = 3;
  gGame.isHint = false;
  gIsManual = false;
  gIsPlacedMines = false;
  gGame.shownCount = 0;
  gGame.markedCount = 0;
  gMinesCords = [];
  gSafeCells = [];
  clearInterval(gTimerInterval);
  gGame.isOn = false;
  gStartTime = 0;
  renderFreshStats();
}
// clears intervals and gGame playing state
function updateGameEnd() {
  gGame.isOn = false;
  clearInterval(gTimerInterval);
  getAllBombs();
  gGameFinished = true;
}

// checks if landed on a mine or won the game
function isGameOver(isOnMine) {
  // LOST
  if (isOnMine) {
    renderLost();
    updateGameEnd();
    renderBoard(gBoard);
    // render last mine clicked
    var lastCell = document.querySelector(
      '.cell' + gLastCell.i + '-' + gLastCell.j
    );
    lastCell.style.background = 'red';
    return;
  }
  // WON
  if (gGame.shownCount + gGame.markedCount === gGame.winCount) {
    gHighscore = Date.now() - gStartTime;
    setHighscore(gHighscore);
    playSound('win-theme')
    renderWon();
    updateGameEnd();
    return;
  }
}

// change the highscore in LOCALSTORAGE
function setHighscore(score) {
  if (!gIsPlacedMines) {
    var prevHighScore = localStorage.getItem(gLevelName);
    var newHighScore = score / 1000;
    if (
      localStorage.getItem(gLevelName) === null ||
      newHighScore < prevHighScore
    ) {
      localStorage.setItem(gLevelName, newHighScore);
      var elHighScore = document.querySelector('.highscore');
      elHighScore.innerText =
        'Current Highscore: ' + newHighScore + ' seconds!';
    }
  }
}

function saveState() {
  var state = JSON.stringify({ // static method converts a JavaScript value to a JSON string.
    board: gBoard,
    game: gGame,
    minesCords: gMinesCords,
  });
  gStateHistory.push(state);
}

function undoMove() {
  if (gStateHistory.length > 1) { // only if the player made moves.
    gStateHistory.pop(); // remove the current state
    var prevState = JSON.parse(gStateHistory[gStateHistory.length - 1]);
    gBoard = prevState.board;
    gGame = prevState.game;
    gMinesCords = prevState.minesCords;
    renderBoard(gBoard);
    renderStats();
  }
}

function toggleDarkMode() {
  var element = document.body;
  element.classList.toggle("dark-mode");
}