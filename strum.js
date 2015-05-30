var touches = [];
var stringLocations = s('.string').map(function(el) {
  return { x: el.offsetLeft, y: el.offsetTop };
});

var context = new (window.AudioContext || window.webkitAudioContext)();

function copyTouch(touch) {
  return {
    pageX: touch.pageX,
    pageY: touch.pageY
  };
}

var frequencies = [261, 294, 329, 349, 392, 440, 490, 523];
function playNoteForIndex(index) {
  if (!frequencies[index]) {
    return;
  }
  
  var oscillator = context.createOscillator();
  oscillator.type = 'triangle';
  oscillator.frequency.value = frequencies[index];
  oscillator.connect(context.destination);

  oscillator.start(0);
  setTimeout(function() {
    oscillator.stop(0);
  }, 50);

  oscillator.onended = function() {
    oscillator.disconnect(context.destination);
  };
}

window.addEventListener('touchmove', function(e) {
  Array.prototype.forEach.call(e.changedTouches, function(touch) {
    var x = touch.pageX,
        y = touch.pageY,
        identifier = touch.identifier;

    if (!touches[identifier]) {
      touches[identifier] = copyTouch(touch);
      return;
    }


    var lastTouch = touches[identifier];
    if (!lastTouch) {
      return;
    }

    var deltaX = x - lastTouch.pageX;

    stringLocations.forEach(function(loc, index) {
      if (Math.abs(x - loc.x) < 20) {
        loc.inRange = true;
      } else if (loc.inRange) {  
        playNoteForIndex(index);
        loc.inRange = false; 
      } else {
        loc.inRange = false;
      }
    });

    touches[identifier] = copyTouch(touch);
  });
});

function s(selector) {
  return Array.prototype.slice.call(document.querySelectorAll(selector));
}
