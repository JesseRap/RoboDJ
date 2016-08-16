
// THESE VARIABLES DEFINE WHETHER A DECK IS RUNNING
var leftIsRunning = false,
    rightIsRunning = false;

// SET EVENT HANDLER FOR PLAY/PAUSE BUTTON
$("#playButton").on("click", playPauseLeft)

function play(ws) {
    // START THE DECK
    ws.play()
}



function playPauseLeft() {
    // PLAY/PAUSE THE LEFT DECK
    if (leftIsRunning) {
        leftIsRunning = false
        stop(wavesurferLeft)
    } else {
        leftIsRunning = true
        play(wavesurferLeft)
    }
}

function playPauseRight() {
    // PLAY/PAUSE THE RIGHT DECK
    if (rightIsRunning) {
        rightIsRunning = false
        stop(wavesurferRight)
    } else {
        rightIsRunning = false
        play(wavesurferRight)
    }
}

function stop(ws) {
    // STOP THE DECK
    ws.pause()
}


// CREATE LEFT DECK WAVESURFER INSTANCE
var wavesurferLeft = WaveSurfer.create({
    container: '#waveformL',
});
console.log("CREATED WS INSTANCE");
console.log(wavesurferLeft)
// LOAD INITIAL AUDIO TRACK
wavesurferLeft.load('WaveRacer.mp3')

// DEFINE LEFT DECK VARIABLES
var gainNodeL,
    analyserL,
    dataArrayL,
    canvasL = document.querySelector('#canvasLeft'),
    canvasCtxL = canvasL.getContext("2d"),
    bufferLengthL,
    bufferL,
    RMS_ArrayL = [],
    rms_step = 2.5;



function draw() {
    // DRAW THE OSCILLOSCOPE

    drawVisual = requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArrayL);
    canvasCtx = canvasCtxL

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, canvasL.width, canvasL.height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    var sliceWidth = canvasL.width * 1.0 / bufferLengthL;
    var x = 0;

    for(var i = 0; i < bufferLengthL; i++) {

        var v = dataArrayL[i] / 128.0;
        var y = v * canvasL.height/2;

        if(i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    canvasCtx.lineTo(canvasL.width, canvasL.height/2);
    canvasCtx.stroke();
};


function isReady(ws) {
    // HELPER FUNCTION FOR DECK-IS-READY
    var context = ws.backend.ac
    console.log(ws.backend)
    console.log(context)
    gainNodeL = context.createGain();
    console.log(gainNodeL)
    console.log(ws.backend.source)
    ws.backend.setFilter(gainNodeL)
    
    analyser = context.createAnalyser();

    gainNodeL.connect(analyser)

    bufferLengthL = analyser.frequencyBinCount;
    console.log(bufferLengthL);
    
    dataArrayL = new Uint8Array(bufferLengthL);
    analyser.getByteTimeDomainData(dataArrayL);
    bufferL = new Uint8Array(analyser.fftSize);

    console.log(bufferLengthL)
    draw();
    getRMS(ws);
    console.log("HERE")
    console.log(ws)
    if (ws === wavesurferLeft) {
        drawGraphL();
    } else {
        
    }
}

wavesurferLeft.on('ready', function () {
    // ACTION ONCE THE TRACK IS LOADED INTO WAVESURFER INSTANCE
    console.log("WHAT")
    console.log(wavesurferLeft)
    isReady(wavesurferLeft)
});



function getRMS(ws) {
    // Calculate the RMS of each nms_step interval
    var rms = 0;
    var n = 0;
    var c = ws.backend.source.buffer.getChannelData(0);

    for (var i=0; i < c.length; i++) {
        rms += c[i] * c[i]
        if (i % (44100 * rms_step) == 0) {
            rms /= ws.backend.source.buffer.length;
            rms = Math.sqrt(rms);
            // console.log("RMS ", n, i, 20*Math.log10(Math.abs(rms)))
            RMS_ArrayL.push( [i / 44100, 20*Math.log10(Math.abs(rms))] )
            rms = 0
            n++
        }
    }
}

function changeVolumeLeft() {
    // THE LEFT VOLUME SLIDER
    console.log("CHANGE")
    var sliderValue = document.getElementById("VolSliderL").value
    console.log(sliderValue)
    gainNodeL.gain.value = sliderValue / 100
}

document.querySelector("#VolSliderL").addEventListener("change", changeVolumeLeft)



function drawGraphL() {
    // Wrapper for drawing the left graph
    d = requestAnimationFrame(drawGraphL)
    drawGraph(wavesurferLeft)
}


function drawGraph(ws) {
    var canvas = document.getElementById("graphLeft");
    var context = canvas.getContext("2d");
    
    for (var x = 0.5; x < canvas.width; x += canvas.width / (ws.backend.buffer.duration / rms_step) ) {
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
    }
    
    context.strokeStyle = "#eee";
    context.stroke();
    
    context.beginPath();
    for (var i=0; i<RMS_ArrayL.length; i++) {
        var rms_pair = RMS_ArrayL[i]
        var scale = canvas.width / ws.backend.buffer.duration
        if (i == 0) {
            context.moveTo(scale * rms_pair[0], rms_pair[1]*-1)
        } else {
            context.lineTo(scale * rms_pair[0], rms_pair[1]*-1)
        }
    }
    context.strokeStyle = "#000";
    context.stroke();
    
    context.beginPath();
    var currentTime = ws.backend.getCurrentTime();
    
    context.moveTo(currentTime * scale, 0);
    context.lineTo(currentTime * scale, canvas.height)
    
    context.stroke()
    
}


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




/*
function playSample() {
    // FUNCTION TO PLAY A SAMPLE FROM THE TRACK (for testing)
    
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
*/

/*
// MY ATTEMPT TO EXTRACT AUDIO DATA FROM AN EXTERNAL URL
// DOESN'T WORK(?)
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
*/
