
// RENDER DOM
function renderBoard(board) {
  var strHTML = '<table border="1"><tbody>';
  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>';
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j];
      // basic class name
      var className = 'cell cell' + i + '-' + j;
      // if not clicked any cells show a CLEAN board
      if (!gGame.isOn && gGame.shownCount === 0) {
        currCell = CLEAN;
        strHTML += `<td class="${className}" 
                oncontextmenu="cellMarked(this,${i},${j})" 
                onclick="cellClicked(this,${i},${j})">${currCell}</td>`;
        continue;
      }
      // if marked show a FLAG
      if (currCell.isMarked) {
        currCell = FLAG;
      }
      // else if the cells isShown = true =>
      else if (currCell.isShown) {
        // if isMine show MINE, if not show the minesAroundCount(max 8)
        if (currCell.isMine) {
          currCell = MINE;
        } else {
          currCell = currCell.minesAroundCount;
          // dynamic className (0-8 = different colors)
          className += ` shown ${numberColor(currCell)}`;
          if (currCell === 0) {
            currCell = CLEAN;
          }
        }
      } else {
        currCell = CLEAN;
      }
      strHTML += `<td class="${className}" 
            oncontextmenu="cellMarked(this,${i},${j})" 
            onclick="cellClicked(this,${i},${j})">${currCell}</td>`;
    }
    strHTML += '</tr>';
  }
  strHTML += '</tbody></table>';
  var elContainer = document.querySelector('.board');
  elContainer.innerHTML = strHTML;
}

// location such as: {i: 2, j: 7}
function renderCell(location, value) {
  // Select the elCell and set the value
  var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
  elCell.innerHTML = value;
}

// renders stats on top of board
function renderStats() {
  getLivesString();
  var elFlags = document.querySelector('.flags');
  var elLives = document.querySelector('.lives');
  elFlags.innerHTML = `You have ${
    gLevel.MINES - gGame.markedCount
  } flags remaining`;
  elLives.innerHTML = `${gLiveStr}`;
}

// new game new stats
function renderFreshStats() {
  document.querySelector('.timer').innerHTML = 'Click a tile to start';
  document.querySelector('.flags').innerHTML = 'Good luck!';
  document.querySelector('.lives').innerHTML = '❤ ❤ ❤';
  document.querySelector('.smile').innerHTML = '😄';
  var elHints = document.querySelectorAll('.hints img');
  for (var i = 0; i < elHints.length; i++) {
    elHint = elHints[i];
    elHint.style.cursor = 'help';
    elHint.src = 'img/off.png';
    elHint.setAttribute('onclick', 'clickedHint(this)');
  }
  document.querySelector('.safe').innerHTML = '3 Safe clicks';
  // document.querySelector('.safe').style.backgroundColor = 'lightblue';
  document.querySelector('.safe').style.cursor = 'pointer';
}

function renderWon() {
  document.querySelector('.flags').innerHTML = 'Click a level to restart';
  document.querySelector('.smile').innerHTML = '😎';
  document.querySelector('.lives').innerHTML = `${gLiveStr}`;
}

function renderLost() {
  document.querySelector('.flags').innerHTML = 'Click a level to try again';
  document.querySelector('.lives').innerHTML = 'BOOM!';
  document.querySelector('.smile').innerHTML = '🤯';
}

// render current highscore
function renderScore(level) {
  var elHighScore = document.querySelector('.highscore');
  if (localStorage.getItem(level) !== null) {
    elHighScore.innerText =
      'Current Highscore: ' + localStorage.getItem(level) + ' seconds!';
  } else {
    elHighScore.innerText = 'No highscore set';
  }
}
