
// returns all positions of mines arround called position
function getAllNegs(pos) {
  var negs = [];
  for (var i = pos.i - 1; i <= pos.i + 1 && i < gLevel.SIZE; i++) {
    if (i < 0) continue;
    for (var j = pos.j - 1; j <= pos.j + 1 && j < gLevel.SIZE; j++) {
      if (j < 0 || (i === pos.i && j === pos.j)) continue;
      if (gBoard[i][j].isMine) {
        negs.push({ i, j });
      }
    }
  }
  return negs;
}

// shows all negs if hinted and then hides them
function getAllNegsHinted(pos) {
  var negs = [];
  for (var i = pos.i - 1; i <= pos.i + 1 && i < gLevel.SIZE; i++) {
    if (i < 0) continue;
    for (var j = pos.j - 1; j <= pos.j + 1 && j < gLevel.SIZE; j++) {
      if (j < 0) continue;
      if (gBoard[i][j].isMarked || gBoard[i][j].isShown) {
        continue;
      }
      negs.push({ i, j });
      gBoard[i][j].isShown = true;
    }
  }
  return negs;
}

function hideAllNegsHinted(negs) {
  for (var i = 0; i < negs.length; i++) {
    currPos = negs[i];
    currCell = gBoard[currPos.i][currPos.j];
    currCell.isShown = false;
  }
}

// TIMER START
function startTimer() {
  gStartTime = Date.now();
  gTimerInterval = setInterval(function () {
    var msDiff = Date.now() - gStartTime;
    var secs = '' + parseInt((msDiff / 1000) % 60);
    if (secs.length === 1) {
      secs = '0' + secs;
    }

    var min = '' + parseInt(msDiff / 1000 / 60);
    if (min.length === 1) min = '0' + min;

    var passedTime = `${min}:${secs}`;
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = passedTime;
  }, 10);
}

// random number inclusive max
function getRandomIntegerInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
// random number NOT inclusive max
function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

// different colors switch case for CSS
function numberColor(num) {
  switch (num) {
    case 0:
      return null;
    case 1:
      return 'one';
    case 2:
      return 'two';
    case 3:
      return 'three';
    case 4:
      return 'four';
    case 5:
      return 'five';
    case 6:
      return 'six';
    case 7:
      return 'seven';
    case 8:
      return 'eight';
    default:
      return null;
  }
}

function playSound(fileName) {
  var sound = new Audio(`sounds/${fileName}.mp3`);
  sound.play();
}