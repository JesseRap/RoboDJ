// define variables

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var source;
var songLength;


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

  request.open('GET', 'http://localhost/~JRap/AudioProject/sax.mp3', true);

  request.responseType = 'arraybuffer';


  request.onload = function() {
    var audioData = request.response;

    audioCtx.decodeAudioData(audioData, function(buffer) {
        myBuffer = buffer;
        songLength = buffer.duration;
        source.buffer = myBuffer;
        source.playbackRate.value = 1.0
        //source.playbackRate.value = playbackControl.value;
        source.connect(audioCtx.destination);
        //source.loop = true;

        // loopstartControl.setAttribute('max', Math.floor(songLength));
        // loopendControl.setAttribute('max', Math.floor(songLength));
      },

      function(e){"Error with decoding audio data" + e.err});

  }

  request.send();
}

$("#playButton").on("click", play)
$("#stopButton").on("click", stop)

function play() {
    // getData()
    // source.start(0);
    wavesurfer.play()
}

function stop() {
    wavesurfer.pause()
}


var wavesurfer = WaveSurfer.create({
    container: '#waveform',
    // scrollParent: true
});

var mySong = document.querySelector("#au");
// mySong.addEventListener("canplaythrough", g)

// var source = wavesurfer.backend.ac.createMediaElementSource(mySong)
// console.log(source)
// source.connect(wavesurfer.backend.ac.destination)
// source.start()

// wavesurfer.load('../AudioProject/TrapQueen.wav')
wavesurfer.load('..WaveRacer.mp3')
// wavesurfer.load('http://www.stephaniequinn.com/Music/Allegro%20from%20Duet%20in%20C%20Major.mp3')

var gainNode;
var analyser;
var dataArray;
var canvas = document.querySelector('.visualizer');
console.log(canvas)
var canvasCtx = canvas.getContext("2d");
var bufferLength;
var bufferLength2;
var buffer;
var floatBuffer;
var floatArray;
var RMS_Array = []
var rms_step = 2.5

function f2() {
    result = []
    
    analyser.getByteTimeDomainData(buffer);
    /*
    for (var sec = 0; sec < buffer.length; sec += (wavesurfer.backend.ac.sampleRate * 30)) {
        console.log("section ",sec)
        var rms = 0;
        for (var i = sec; i < sec + (wavesurfer.backend.ac.sampleRate * 30); i++) {
            // console.log(i)
            try {
                rms += buffer[i] * buffer[i];
            } catch (e) {
                console.log("ERROR")
            }
            if (i%1000 == 0) {
                console.log(i, buffer[i])
            }
        }
        rms /= wavesurfer.backend.ac.sampleRate * 30
        rms = Math.sqrt(rms);
        // requestAnimationFrame(f);
        console.log(rms)
        result.push(rms)
    
    } */
    
    var rms = 0;
    for (var i = 0; i < buffer.length; i++) {
        rms += buffer[i] * buffer[i];
    }

    rms /= wavesurfer.backend.ac.sampleRate * 30
    rms = Math.sqrt(rms);
    // requestAnimationFrame(f);
    console.log(rms)
    // result.push(rms)
    // console.log(result)
  
}

function f() {
    
  analyser.getByteTimeDomainData(buffer);
  var rms = 0;
  for (var i = 0; i < bufferLength; i++) {
    rms += buffer[i] * buffer[i];
      //if (i % 100 == 0) {
          // console.log(buffer[i])
          // console.log(i, rms)
      //}
  }
  rms /= bufferLength;
  rms = Math.sqrt(rms);
  // requestAnimationFrame(f);
  console.log(rms)
}

function draw() {

    drawVisual = requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    var sliceWidth = canvas.width * 1.0 / bufferLength;
    var x = 0;

    for(var i = 0; i < bufferLength; i++) {

        var v = dataArray[i] / 128.0;
        var y = v * canvas.height/2;

        if(i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height/2);
    canvasCtx.stroke();
};

function drawProgress() {
    draw1 = requestAnimationFrame(drawProgress);
    var currentTime = wavesurfer.backend.getCurrentTime()
}

wavesurfer.on('ready', function () {
    // wavesurfer.play();
    // var source = wavesurfer.backend.ac.createMediaElementSource(mySong)

    var context = wavesurfer.backend.ac
    console.log(wavesurfer.backend)
    console.log(context)
    gainNode = context.createGain();
    console.log(gainNode)
    console.log(wavesurfer.backend.source)
    wavesurfer.backend.setFilter(gainNode)
    // Connect the gain node to the destination.
    // gainNode.connect(context.destination);
    
    analyser = context.createAnalyser();
    // analyser2 = context.createAnalyser();
    // wavesurfer.backend.source.connect(analyser)
    // wavesurfer.backend.analyser = analyser
    gainNode.connect(analyser)
    // gainNode.connect(analyser2)
    // analyser2.fftSize = 256;
    bufferLength = analyser.frequencyBinCount;
    // bufferLength2 = analyser2.frequencyBinCount;
    console.log(bufferLength);
    // console.log(bufferLength2);
    // floatArray = new Float32Array(bufferLength2);
    // console.log(typeof(floatArray))
    
    
    //bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);
    // dataArray = dataArray.slice(0, dataArray.length/100)
    console.log("HERE")
    buffer = new Uint8Array(analyser.fftSize);
    // floatBuffer = new Float32Array(bufferLength)
    // analyser.getFloatFrequencyData(floatBuffer)
    console.log(bufferLength)
    draw();
    getRMS();
    drawGraph();
    // requestAnimationFrame(f)
    
});

function playSample() {
    
    //analyser.getByteTimeDomainData(dataArray);
    
    /*
    rms = 0 
    for(var i = 0; i < bufferLength2; i++) {
        rms += floatArray[i] * floatArray[i]
        if (i % 2 == 0) {
            console.log(i, floatArray[i]+ 140)
        }
    }
    rms /= bufferLength2;
    rms = Math.sqrt(rms);
    console.log(rms)
    */
    
    // Stereo
    var channels = 2;

    var frameCount = wavesurfer.backend.ac.sampleRate * 5.0;
    console.log(frameCount)
    
    var myArrayBuffer = wavesurfer.backend.ac.createBuffer(channels, frameCount, wavesurfer.backend.ac.sampleRate);
    console.log(myArrayBuffer)
    // console.log(floatArray)
    
    var rms = 0;
    
    // Get a sample from the middle of the track
    for (var ch = 0; ch < channels; ch++) {
        var nowBuffering = myArrayBuffer.getChannelData(ch);
        // var ca = new Float32Array;
        var c = wavesurfer.backend.source.buffer.getChannelData(ch);
        // var n = dataArray.getChannelData(ch);
        j = 44100 * Math.floor(wavesurfer.backend.source.buffer.duration/2)
        for (var i=0; i < frameCount; i++) {
            nowBuffering[i] = c[i + 3748500]
            // nowBuffering[i] = c[i+ j]
            
            rms += nowBuffering[i] * nowBuffering[i]
            
            if (i % 1000000 == 0) {
                console.log(i, rms)
            }
            /*
            rms += nowBuffering[i] * nowBuffering[i];
            rms /= nowBuffering.length;
            rms = Math.sqrt(rms);
            */
        }
        rms /= nowBuffering.length;
        rms = Math.sqrt(rms);
    }
    // 20*Math.log10(Math.abs(0.5))
    console.log("RMS ", rms, 20*Math.log10(Math.abs(rms)))
    
    
    // Calculate the RMS of each 5 second interval
    var rms2 = 0;
    var n = 0;
    var c = wavesurfer.backend.source.buffer.getChannelData(0);

    for (var i=0; i < wavesurfer.backend.source.buffer.length; i++) {
        rms2 += c[i] * c[i]
        if (i % (44100 * rms_step) == 0) {
            rms2 /= nowBuffering.length;
            rms2 = Math.sqrt(rms2);
            console.log("RMS2 ", n, i, 20*Math.log10(Math.abs(rms2)))
            RMS_Array.push( [i / 44100, 20*Math.log10(Math.abs(rms2))] )
            rms2 = 0
            n++
        }
    }
    
    // Get an AudioBufferSourceNode.
    // This is the AudioNode to use when we want to play an AudioBuffer
    var source = wavesurfer.backend.ac.createBufferSource();
    // set the buffer in the AudioBufferSourceNode
    source.buffer = myArrayBuffer;
    // connect the AudioBufferSourceNode to the
    // destination so we can hear the sound
    source.connect(gainNode);
    // start the source playing
    source.start();
    drawGraph()

}

document.querySelector("#sampleButton").onclick = playSample




/*
var an = ac.createAnalyser();
source.connect(an);
// Get an array that will hold our values
var buffer = new Uint8Array(an.fftSize);

function f() {
  var rms = 0;
  for (var i = 0; i < buffer.length; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms /= buffer.length;
  rms = Math.sqrt(rms);
  // rms now has the value we want.
  requestAnimationFrame(f);
}

requestAnimationFrame(f);
// start our hypothetical source.
source.start(0);
*/


function getRMS() {
    // Calculate the RMS of each nms_step interval
    var rms2 = 0;
    var n = 0;
    var c = wavesurfer.backend.source.buffer.getChannelData(0);

    for (var i=0; i < c.length; i++) {
        rms2 += c[i] * c[i]
        if (i % (44100 * rms_step) == 0) {
            rms2 /= wavesurfer.backend.source.buffer.length;
            rms2 = Math.sqrt(rms2);
            console.log("RMS2 ", n, i, 20*Math.log10(Math.abs(rms2)))
            RMS_Array.push( [i / 44100, 20*Math.log10(Math.abs(rms2))] )
            rms2 = 0
            n++
        }
    }
}

function changeVolume() {
    console.log("CHANGE")
    var sliderValue = document.getElementById("volumeSlider").value
    console.log(sliderValue)
    gainNode.gain.value = sliderValue / 100
    console.log(gainNode.gain.value / 100)
}

var x = document.createElement("INPUT");
x.setAttribute("type", "range");
x.setAttribute("id", "volumeSlider")
x.value = 100
x.setAttribute("style", "width:200px")
document.body.appendChild(x)
x.addEventListener("change", changeVolume)

document.getElementById("graph").width = window.innerWidth

function drawGraph() {
    d = requestAnimationFrame(drawGraph)
    var canvas = document.getElementById("graph");
    var context = canvas.getContext("2d");
    context.canvas.width = window.innerWidth
    // context.fillRect(50, 25, 150, 100);
    // Resets the canvas to blank default
    // canvas.width = canvas.width
    
    for (var x = 0.5; x < canvas.width; x += canvas.width / (wavesurfer.backend.buffer.duration / rms_step) ) {
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
    }
    
    context.strokeStyle = "#eee";
    context.stroke();
    
    context.beginPath();
    for (var i=0; i<RMS_Array.length; i++) {
        var rms_pair = RMS_Array[i]
        // console.log(rms_pair)
        var scale = canvas.width / wavesurfer.backend.buffer.duration
        if (i == 0) {
            context.moveTo(scale * rms_pair[0], rms_pair[1]*-4)
        } else {
            context.lineTo(scale * rms_pair[0], rms_pair[1]*-4)
        }
    }
    context.strokeStyle = "#000";
    context.stroke();
    
    context.beginPath();
    var currentTime = wavesurfer.backend.getCurrentTime();
    
    context.moveTo(currentTime * scale, 0);
    context.lineTo(currentTime * scale, canvas.height)
    
    context.stroke()
    
}




// Create a gain node.



// Connect the source to the gain node.
// console.log(gainNode)
// wavesurfer.backend.source.connect(gainNode);
// Connect the gain node to the destination.
// gainNode.connect(context.destination);

// wire up buttons to stop and play audio, and range slider control




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
