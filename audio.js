// define variables

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var source;
var songLength;

console.log("JS")

/*
var pre = document.querySelector('pre');
var myScript = document.querySelector('script');
var play = document.querySelector('.play');
var stop = document.querySelector('.stop');

var playbackControl = document.querySelector('.playback-rate-control');
var playbackValue = document.querySelector('.playback-rate-value');
playbackControl.setAttribute('disabled', 'disabled');

var loopstartControl = document.querySelector('.loopstart-control');
var loopstartValue = document.querySelector('.loopstart-value');
loopstartControl.setAttribute('disabled', 'disabled');

var loopendControl = document.querySelector('.loopend-control');
var loopendValue = document.querySelector('.loopend-value');
loopendControl.setAttribute('disabled', 'disabled');
*/
// use XHR to load an audio track, and
// decodeAudioData to decode it and stick it in a buffer.
// Then we put the buffer into the source

function getData() {
  source = audioCtx.createBufferSource();
  request = new XMLHttpRequest();

  request.open('GET', 'localhost/~Jrap/audio/sax.mp3', true);

  request.responseType = 'arraybuffer';


  request.onload = function() {
    var audioData = request.response;

    audioCtx.decodeAudioData(audioData, function(buffer) {
        myBuffer = buffer;
        songLength = buffer.duration;
        source.buffer = myBuffer;
        source.playbackRate.value = playbackControl.value;
        source.connect(audioCtx.destination);
        //source.loop = true;

        // loopstartControl.setAttribute('max', Math.floor(songLength));
        // loopendControl.setAttribute('max', Math.floor(songLength));
      },

      function(e){"Error with decoding audio data" + e.err});

  }

  request.send();
}

// wire up buttons to stop and play audio, and range slider control

getData()
source.start(0);
/*
play.onclick = function() {
  getData();
  source.start(0);
  play.setAttribute('disabled', 'disabled');
  playbackControl.removeAttribute('disabled');
  loopstartControl.removeAttribute('disabled');
  loopendControl.removeAttribute('disabled');
}

stop.onclick = function() {
  source.stop(0);
  play.removeAttribute('disabled');
  playbackControl.setAttribute('disabled', 'disabled');
  loopstartControl.setAttribute('disabled', 'disabled');
  loopendControl.setAttribute('disabled', 'disabled');
}

playbackControl.oninput = function() {
  source.playbackRate.value = playbackControl.value;
  playbackValue.innerHTML = playbackControl.value;
}

loopstartControl.oninput = function() {
  source.loopStart = loopstartControl.value;
  loopstartValue.innerHTML = loopstartControl.value;
}

loopendControl.oninput = function() {
  source.loopEnd = loopendControl.value;
  loopendValue.innerHTML = loopendControl.value;
}

*/
// dump script to pre element

// pre.innerHTML = myScript.innerHTML;