var touches = [];
var stringLocations = $('.string').map(function(idx, el) {
  return { x: $(el).offset().left, y: $(el).offset().top };
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
  console.log('strum', index);
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

$(document.body).on('touchmove', function(e) {
  var changed = e.originalEvent.changedTouches;
  for (var i = 0; i < changed.length; i ++) {
    var touch = changed[i],
        x = touch.pageX,
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

    stringLocations.each(function(index, loc) {
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
  };
});