"use strict";

var challenge = []; //holds the current list of notes
var working = [];
var gameOn = false;
var barsDisabled = false;
var death = false;
var infoPanelisUp = false;
var volume = 0;

function volumeAdjust(amount) {
  var current = Number(document.getElementById("volumeMeter").innerHTML);
  current += amount;
  document.getElementById("volumeMeter").innerHTML = current
  var actual = current *.1;
  for (var i = 0; i < channel_max; i++) {
    audiochannels[i]['channel'].volume = actual;
  }
  if (current == 10) {document.getElementById("volUpKnob").classList.add('hide');}
  else if (current == 0) {document.getElementById("volDownKnob").classList.add('hide');}
  else if ((current == 1) && (amount == 1)) {document.getElementById("volDownKnob").classList.remove('hide');}
  else if ((current == 9) && (amount == -1)) {document.getElementById("volUpKnob").classList.remove('hide');}
}

function slidePanel(direction) {
  var elem = document.getElementById("infoPanel");
  var height = Number(window.getComputedStyle(elem).getPropertyValue("height").slice(0,-2));
  var duration = .3;
  if (direction == "in") {
    infoPanelisUp = true;
    var change = 1.3*height;
    var currentValue = -1.2*height;
    var jitCount = 0;
    elem.style.bottom = currentValue + "px";
    document.getElementById("panelButton").style.visibility = "hidden";
    elem.style.visibility = "visible";
  }
  else {
    infoPanelisUp = false;
    var change = -1.3*height;
    var currentValue = .1 * height;
    var jitCount = 0;
    document.getElementById("panelButton").style.visibility = "visible";
  }
  var fps = 60;
  var totalFrames = duration*fps;
  var velocity = change/totalFrames;
  totalFrames += jitCount;
  (function animate() {
    var loop = setInterval(frame, 1000/fps);
    var currentFrame = 0;
    function frame() {
      currentFrame++;
      currentValue += velocity;
      elem.style.bottom = currentValue + "px";
      if (currentFrame == totalFrames) {
        clearInterval(loop);
        if (direction != "in") {
          elem.style.visibility = "hidden";
        }
        if (jitCount != 0) {
          jitCount--;
          velocity = -velocity;
          totalFrames = ((jitCount*2) + 1);
          animate();
        }
      }
    }
  })();
}

function listener(btnNum) {
  if ((barsDisabled == true) || ((infoPanelisUp == true) && (gameOn == true))) {return;}
  if (gameOn === true) {
    if (btnNum == working[0]) {
      working.splice(0, 1);
      if (working.length == 0) {
        barsDisabled = true;
        setTimeout(positiveReinforcement, 850);
        setTimeout(next, 2500);
      }
    } else {
      playSound("stab");
      document.body.classList.add("red");
      var barList = document.getElementsByClassName("bar");
      var len = barList.length;
      for (var i = 0; i < len; i++) {
        barList[i].classList.add("black");
      }
      document.getElementById("startButton").classList.remove('darkerGrey','notClicky');
      document.getElementById("score").innerHTML = '';
      gameOn = false;
      death = true;
      return;
    }
  }
  playSound(("s").concat(btnNum));
  if (death == true) {resetDisplay();}
}

function positiveReinforcement() {
  document.getElementById("score").innerHTML = challenge.length;
  autoPlay([1,3,5,7,8], 30, false);
}

function begin(self) {
  if ((gameOn == false) && (infoPanelisUp == false)) {
    self.classList.add('darkerGrey','notClicky');
    if (death == true) {resetDisplay();}
    challenge = [];
    gameOn = true;
    setTimeout(next,500)
  }
}

function resetDisplay() {
  death = false;
  document.body.classList.remove("red")
  var barList = document.getElementsByClassName("bar");
  var len = barList.length;
  for (var i = 0; i < len; i++) {
    barList[i].classList.remove("black");
  }
}

function next() {
  challenge.push(Math.floor((Math.random() * 8) + 1))
  autoPlay(challenge, 800, true);
  working = challenge.slice();
}

function autoPlay(arr, speed, resetBars) {
  var ray = arr.slice();
  var x = ray[0];
  playSound("s" + x);
  document.getElementById("b" + x).classList.add('pressed');
  setTimeout(unpress, 300, ("b" + x));
  ray.splice(0, 1);
  if (ray[0]) {
    setTimeout(autoPlay, speed, ray, speed, resetBars);
  } else if (resetBars == true) {barsDisabled = false;}
}

function unpress(btn) {
  document.getElementById(btn).classList.remove('pressed');
}

function music() {
  setInterval(playRandom, 250)
}

window.onkeyup = function(e) {
  var key = e.keyCode;
  switch (key) {
    case 65:
      listener(1);
      document.getElementById("b1").classList.add('pressed');
      setTimeout(unpress, 200, ("b1"));
      break;
    case 83:
      listener(2);
      document.getElementById("b2").classList.add('pressed');
      setTimeout(unpress, 200, ("b2"));
      break;
    case 68:
      listener(3);
      document.getElementById("b3").classList.add('pressed');
      setTimeout(unpress, 200, ("b3"));
      break;
    case 70:
      listener(4);
      document.getElementById("b4").classList.add('pressed');
      setTimeout(unpress, 200, ("b4"));
      break;
    case 74:
      listener(5);
      document.getElementById("b5").classList.add('pressed');
      setTimeout(unpress, 200, ("b5"));
      break;
    case 75:
      listener(6);
      document.getElementById("b6").classList.add('pressed');
      setTimeout(unpress, 200, ("b6"));
      break;
    case 76:
      listener(7);
      document.getElementById("b7").classList.add('pressed');
      setTimeout(unpress, 200, ("b7"));
      break;
    case 186:
    case 59:
      listener(8);
      document.getElementById("b8").classList.add('pressed');
      setTimeout(unpress, 200, ("b8"));
      break;
  }
}


////////**************** sound player stuff**********///////////////
var channel_max = 10; // number of channels
var audiochannels = [];
for (var a = 0; a < channel_max; a++) { // prepare the channels
  audiochannels[a] = [];
  audiochannels[a]['channel'] = new Audio(); // create a new audio object
  audiochannels[a]['channel'].volume = .5;
  audiochannels[a]['finished'] = -1; // expected end time for this channel
}

function playSound(s) {
  for (var a = 0; a < audiochannels.length; a++) {
    var thistime = new Date();
    if (audiochannels[a]['finished'] < thistime.getTime()) { // is this channel finished?
      audiochannels[a]['finished'] = thistime.getTime() + document.getElementById(s).duration * 1000;
      audiochannels[a]['channel'].src = document.getElementById(s).src;
      audiochannels[a]['channel'].load();
      audiochannels[a]['channel'].play();
      break;
    }
  }
}
