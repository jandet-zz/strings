var touches = [];
var stringLocations = s('.string').map(function(el) {
  return { x: el.offsetLeft, y: el.offsetTop };
});

var context = new (window.AudioContext || window.webkitAudioContext)();
var audioData = [];
var frequencies = [261, 294, 329, 349, 392, 440, 490, 523];

var request = new XMLHttpRequest();
var file = './harp.mp3';
request.open('GET', file, true);
request.responseType = 'arraybuffer';

request.onload = function() {
  audioData = request.response;
};

request.send();

function copyTouch(touch) {
  return {
    pageX: touch.pageX,
    pageY: touch.pageY
  };
}

function playNoteForIndex(index) {
  if (!frequencies[index] || !audioData) {
    return;
  }
    
  context.decodeAudioData(audioData, function(buffer) {
    var source = context.createBufferSource();
    var sampleRate = index === 0 ? buffer.sampleRate : buffer.sampleRate * frequencies[index] / frequencies[0];
    var myArrayBuffer = context.createBuffer(buffer.numberOfChannels, buffer.length, sampleRate);

    for (var channel = 0; channel < buffer.numberOfChannels; channel++) {
      var nowBuffering = myArrayBuffer.getChannelData(channel);
      var bufferData = buffer.getChannelData(channel);
      for (var i = 0; i < buffer.length; i++) {
        nowBuffering[i] = bufferData[i];
      }
    }

    source.buffer = myArrayBuffer;
    source.connect(context.destination);
    
    source.onended = function() {
      source.disconnect();
    };

    source.start(0);
    setTimeout(function() {
      source.stop(0);
    }, 1000);
  }, function (err) {
    console.log('error decoding audio file', err);
  });
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
