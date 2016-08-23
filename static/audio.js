var hash;
var token = null;
var masterSpeed = 0;

// CREATE THE "HIDDEN" WAVESURFER FOR BPM ANALYSIS
var hiddenWS,
    BPMTestResults = [];
    
var hiddenWS = WaveSurfer.create({
    container: '#hiddenDiv',
    normalize: true,
    scrollParent: true
});


// THESE VARIABLES DEFINE WHETHER A DECK IS RUNNING
var leftIsRunning = false,
    rightIsRunning = false,
    hiddenIsRunning = false,
    leftIsLoaded = false,
    rightIsLoaded = false;

// SET EVENT HANDLER FOR PLAY/PAUSE BUTTONS
$("#playButton").on("click", playPauseLeft)
$("#playButtonR").on("click", playPauseRight)
$("#hiddenPlayPause").on("click", playPauseHidden)



function play(ws) {
    // START THE DECK
    ws.play()
}

function findNextHighestInArray(arr, int) {
    var arr2 = arr.slice();
    return arr2.filter(function(a) {return a >= int}).sort(function(a,b) {return a-b})[0]
}

function getPreviousHighestInArray(arr, int) {
    var arr2 = arr.slice();
    return arr2.filter(function(a) {return a <= int}).sort(function(a,b) {return b-a})[0];
}

function playPause(ws) {
    var wsOther = wsBoth.slice().filter(function(a) {return a!== ws})[0];
    console.log(wsOther);
    if (ws.isLoaded) {
        console.log("ISLOADED");
        if (ws.isRunning) {
            console.log("IS RUNNING, WILL STOP");
            ws.isRunning = false;
            ws.ws.pause();
        } else {
            if (wsOther.isRunning) {
                // IF THE OTHER DECK IS RUNNING, FIND THE OFFSET AND
                // THEN START THE DECK WHEN SYNCED UP
                var startTime = Date.now();
                // GET THE TIME UNTIL THE RIGHT DECK HITS THE NEXT BEAT
                var currentTimeOther = wsOther.ws.backend.getCurrentTime();
                var currentFrameOther = Math.round(currentTimeOther * 44100);
                var nextBeatOther = findNextHighestInArray(wsOther.realBeatGrid, currentFrameOther);
                var diffOther = nextBeatOther - currentFrameOther
                
                // GET THE DISTANCE BETWEEN THE LEFT DECK AND THE LAST BEAT
                var currentTime = wsLeft.ws.backend.getCurrentTime();
                var currentFrame = Math.round(currentTime * 44100);
                var previousBeat = getPreviousHighestInArray(ws.realBeatGrid, currentFrame);
                var diff = currentFrame - previousBeat;
                
                var delay = (diffOther/44100)*1000 + ((diff/44100)*1000) - 5;
                //if (delay < 0) {delay += BPMToInterval(wsLeft.bpm, 44100)}
                console.log("GONNA START IN ", delay);
                
                var endTime = Date.now();
                console.log("THIS TOOK ", endTime - startTime);
                setTimeout(function() {console.log(wsOther.ws.backend.getCurrentTime()*44100), ws.ws.play(); ws.isRunning = true}, delay);
            } else {
                ws.isRunning = true
                ws.ws.play();
            }
        }
    }
}

function playPauseLeft() {
    playPause(wsLeft);
}

function playPauseRight() {
    playPause(wsRight);
}

function playPauseLeft2() {
    // PLAY/PAUSE THE LEFT DECK
    if (leftIsLoaded) {
        if (leftIsRunning) {
            leftIsRunning = false
            stop(wavesurferLeft)
        } else {
            if (rightIsRunning) {
                console.log("RIGHT IS RUNNING")
                
                var startTime = Date.now();
                // GET THE TIME UNTIL THE RIGHT DECK HITS THE NEXT BEAT
                var currentTimeR = wsRight.ws.backend.getCurrentTime();
                var currentFrameR = Math.round(currentTimeR * 44100);
                var nextBeatR = findNextHighestInArray(wsRight.realBeatGrid, currentFrameR);
                var diffR = nextBeatR - currentFrameR
                
                // GET THE DISTANCE BETWEEN THE LEFT DECK AND THE LAST BEAT
                var currentTimeL = wsLeft.ws.backend.getCurrentTime();
                var currentFrameL = Math.round(currentTimeL * 44100);
                var previousBeatL = getPreviousHighestInArray(wsLeft.realBeatGrid, currentFrameL);
                var diffL = currentFrameL - previousBeatL;
                
                //wsLeft.ws.seekTo(previousBeatL/wsLeft.ws.backend.buffer.length);
                
                console.log("RIGHT", wsRight.realBeatGrid, currentTimeR,currentFrameR,nextBeatR,diffR, (diffR/44100)*1000);
                console.log("LEFT",wsLeft.realBeatGrid, currentTimeL,currentFrameL,previousBeatL,diffL, (diffL/44100)*1000);
                
                var delay = (diffR/44100)*1000 + ((diffL/44100)*1000) - 5;
                if (delay < 0) {delay += BPMToInterval(wsLeft.bpm, 44100)}
                console.log("GONNA START IN ", delay);
                
                var endTime = Date.now();
                console.log("THIS TOOK ", endTime - startTime);
                setTimeout(function() {console.log(wsRight.ws.backend.getCurrentTime()*44100), wsLeft.ws.play(); leftIsRunning = true}, delay);
                

            } else {
                leftIsRunning = true
                play(wavesurferLeft)
            }
        }
    }
}

function playPauseRight2() {
    // PLAY/PAUSE THE RIGHT DECK
    if (rightIsLoaded) {
        if (rightIsRunning) {
            rightIsRunning = false
            stop(wavesurferRight)
        } else {
            rightIsRunning = true
            play(wavesurferRight)
        }
    }
}


function playPauseHidden() {
    // PLAY/PAUSE THE RIGHT DECK
    if (hiddenIsRunning) {
        hiddenIsRunning = false
        stop(hiddenWS)
    } else {
        hiddenIsRunning = true
        play(hiddenWS)
    }
}

function stop(ws) {
    // STOP THE DECK
    ws.pause()
}


// CREATE LEFT DECK WAVESURFER INSTANCE
var wavesurferLeft = WaveSurfer.create({
    container: '#waveformL',
    normalize: true,
    scrollParent: true
});
console.log("CREATED WS INSTANCE");
console.log(wavesurferLeft)

var wsLeft = new wsObject(wavesurferLeft);

function wsObject(ws) {
    this.ws = ws;
    this.canvas = this.ws.container;
    this.context = this.ws.backend.ac;
    this.gainNode = this.context.createGain();
    this.ws.backend.setFilter(this.gainNode);
    this.RMS_array = [];
    this.waveformCanvas = $(this.ws.container).find("wave canvas")[0];
    this.waveformCtx = this.waveformCanvas.getContext("2d");
    this.isRunning = false;
    this.isLoaded = false;
}

/*
// DEFINE LEFT DECK VARIABLES
var gainNodeL,
    analyserL,
    dataArrayL,
    canvasL = document.querySelector('#canvasLeft'),
    canvasCtxL = canvasL.getContext("2d"),
    bufferLengthL,
    bufferL,
    RMS_ArrayL = [],
    beatGridL = [],
    currentTrackL = "",
    bpmL;
   */ 
var rms_step = 2.5;

/*
// CONNECT GAIN NODE
var contextL = wavesurferLeft.backend.ac
gainNodeL = contextL.createGain();
console.log(gainNodeL);
wavesurferLeft.backend.setFilter(gainNodeL);
*/

// CREATE RIGHT DECK WAVESURFER INSTANCE
var wavesurferRight = WaveSurfer.create({
    container: '#waveformR',
    normalize: true,
    scrollParent: true
});

var wsRight = new wsObject(wavesurferRight);

var wsBoth = [wsLeft, wsRight];

    

/*
// DEFINE RIGHT DECK VARIABLES
var gainNodeR,
    analyserR,
    dataArrayR,
    canvasR = document.querySelector('#canvasRight'),
    canvasCtxR = canvasR.getContext("2d"),
    bufferLengthR,
    bufferR,
    RMS_ArrayR = [],
    beatGridR = [],
    currentTrackR = "",
    bpmR;


// CONNECT GAIN NODE
var contextR = wavesurferRight.backend.ac
gainNodeR = contextR.createGain();
console.log(gainNodeR);
wavesurferRight.backend.setFilter(gainNodeR);
*/

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


// FUNCTION TO CALL ONCE THE WAVESURFER TRACK HAS BEEN LOADED
function isReady(ws) {
    console.log("IS READY");
    // HELPER FUNCTION FOR DECK-IS-READY
    // var context = ws.backend.ac
    console.log(ws)
    //console.log(context)
    /*
    // CONNECT GAIN NODE
    gainNode = context.createGain();
    console.log(gainNode)
    console.log(ws.backend.source)
    ws.backend.setFilter(gainNode)
    */
    // CONNECT ANALYSER
    ws.analyser = ws.context.createAnalyser();
    ws.gainNode.connect(ws.analyser)
    ws.bufferLength = ws.analyser.frequencyBinCount;
    console.log(ws.bufferLength);
    
    // FEED THE AUDIO DATA INTO THE BUFFER
    ws.dataArray = new Uint8Array(ws.bufferLength);
    ws.analyser.getByteTimeDomainData(ws.dataArray);
    ws.buffer = new Uint8Array(ws.analyser.fftSize);
    console.log(ws.bufferLength)

    // GET AN AVERAGE RMS ARRAY FOR GRAPHING PURPOSES
    // getRMS2(ws, 2.5 * 44100);
    // DRAW THE LOUDNESS GRAPH
    if (ws.ws === wavesurferLeft) {
        // draw()
        // drawGraphL();
    } else {
        // drawGraphR();
    }
    
    // GET THE BEAT GRID
    getBPM(ws);
    getBeatArray(ws);
    findSegments(ws);
}

wavesurferLeft.on('ready', function () {
    // ACTION ONCE THE TRACK IS LOADED INTO WAVESURFER INSTANCE
    console.log("Wavesurfer LEFT")
    console.log(wavesurferLeft)
   
    isReady(wsLeft);
    wsLeft.isLoaded = true;
});

wavesurferRight.on('ready', function () {
    // ACTION ONCE THE TRACK IS LOADED INTO WAVESURFER INSTANCE
    console.log("Wavesurfer RIGHT")
    console.log(wavesurferRight)
    isReady(wsRight);
    wsRight.isLoaded = true;
});


function getRMS(ws, rms_array) {
    // CALCULATE THE RMS AT EACH NMS_STEP (SECONDS) INTERVAL
    var rms1 = 0;
    var rms = 0;
    var rms2 = 0;
    // GET THE L AND R CHANNEL
    var c = ws.backend.source.buffer.getChannelData(0);
    var d = ws.backend.source.buffer.getChannelData(1);

    // GO THROUGH THE CHANNEL FRAMES AND GET THE RMS OF THE AVERAGE 
    // LEVEL BETWEEN THE TWO CHANNELS
    for (var i=0; i < c.length; i++) {
        // AVERAGE THE TWO CHANNELS
        rms += c[i] * c[i];
        rms2 += d[i] * d[i];
        rms = (rms + rms2) / 2;
        if (i % (44100 * rms_step) == 0) {
            // RECORD THE RMS EVERY (RMS_STEP * SAMPLERATE) FRAMES
            rms /= ws.backend.source.buffer.length;
            rms = Math.sqrt(rms);
            // PUSH THE RMS IN DECIBELS ONTO THE RMS_ARRAY
            rms_array.push( [i / 44100, 20*Math.log10(Math.abs(rms))] )
            rms = 0
        }
    }
}

function getRMS2(ws, rms_step1) {
    // CALCULATE THE RMS OF EACH RMS_STEP (FRAMES) INTERVAL
    console.log("getRMS2");
    // ROUND THE INTERVAL TO A WHOLE NUMBER
    rms_step1 = Math.round(rms_step1);
    var rms = 0;
    // GET THE L AND R CHANNEL DATA
    var c = ws.ws.backend.source.buffer.getChannelData(0);
    var d = ws.ws.backend.source.buffer.getChannelData(1);
    console.log("HERRRE");
    console.log(c,d,rms_step1,ws.RMS_array);

    for (var i=0; i < c.length; i++) {
        // GO THROUGH THE CHANNEL DATA AND GET THE RMS OF 
        // AVERAGE OF THE TWO SIGNALS EVERY RMS_STEP1 FRAMES
        rms += ((c[i]+d[i])/2) * ((c[i]+d[i])/2)
        if (i % rms_step1 === 0) {
            // rms /= ws.backend.source.buffer.length;
            rms /=rms_step1;
            rms = Math.sqrt(rms);
            // CONVERT THE RESULT TO DECIBELS AND PUSH TO THE ARRAY,
            // ALONG WITH THE SECONDS AT WHICH THE RMS IS TAKEN
            ws.RMS_array.push( [i / 44100, 20*Math.log10(Math.abs(rms))] )
            rms = 0;
        }
    }
    console.log("RMS_ARRAY ", ws.RMS_array)
    return ws.RMS_array;
}

function changeVolumeLeft() {
    // THE LEFT VOLUME SLIDER
    console.log("CHANGE")
    var sliderValue = document.getElementById("VolSliderL").value
    console.log(sliderValue)
    wsLeft.gainNode.gain.value = sliderValue / 100
}

function changeVolumeRight() {
    // THE RIGHT VOLUME SLIDER
    console.log("CHANGE")
    var sliderValue = document.getElementById("VolSliderR").value
    console.log(sliderValue)
    wsRight.gainNode.gain.value = sliderValue / 100
}

function xFade() {
    var xFadeValue = (document.querySelector("#xFader").value-50) / 50.0;
    console.log(xFadeValue);
    var leftVal = Math.sqrt(0.5 * (1 - xFadeValue));
    var rightVal = Math.sqrt(0.5 * (1 + xFadeValue));
    console.log(leftVal, rightVal);
    wsLeft.gainNode.gain.value = leftVal;
    wsRight.gainNode.gain.value = rightVal;
}

$('.form-group').on('click','input[type=radio]',function() {
    $(this).closest('.form-group').find('.radio-inline, .radio').removeClass('checked');
    $(this).closest('.radio-inline, .radio').addClass('checked');
});

document.querySelector("#VolSliderL").addEventListener("change", changeVolumeLeft);
document.querySelector("#VolSliderR").addEventListener("change", changeVolumeRight);
document.querySelector("#xFader").addEventListener("change", xFade);

document.querySelector("#VolSliderL").addEventListener("input", changeVolumeLeft);
document.querySelector("#VolSliderR").addEventListener("input", changeVolumeRight);
document.querySelector("#xFader").addEventListener("input", xFade);

var leftDeckUpload = document.querySelector("#leftDeckUpload");
leftDeckUpload.addEventListener("change", function() {
    if (leftDeckUpload.files.length > 0) {
        clearGraphLeft();
        var track = leftDeckUpload.files[0];
        wavesurferLeft.loadBlob(track);
        wsLeft.currentTrack = track;
    }
});

var rightDeckUpload = document.querySelector("#rightDeckUpload");
rightDeckUpload.addEventListener("change", function() {
    if (rightDeckUpload.files.length > 0) {
        clearGraphRight();
        var track = rightDeckUpload.files[0];
        wavesurferRight.loadBlob(track);
        currentTrackR = track;
        wsRight.currentTrack = track;
    }
});

function clearGraphLeft() {
    wsLeft.RMS_array = [];
    var canvas = document.querySelector("#graphLeft")
    canvas.width = canvas.width
}

function clearGraphRight() {
    wsRight.RMS_array = [];
    var canvas = document.querySelector("#graphRight")
    canvas.width = canvas.width
}



function drawGraphL() {
    // Wrapper for drawing the left graph
    d = requestAnimationFrame(drawGraphL)
    drawGraph(wavesurferLeft, document.querySelector("#graphLeft"), wsLeft.RMS_array)
}

function drawGraphR() {
    // Wrapper for drawing the left graph
    d = requestAnimationFrame(drawGraphR)
    drawGraph(wavesurferRight, document.querySelector("#graphRight"), wsRight.RMS_array)
}


function drawGraph(ws, canvas) {
    // var canvas = document.getElementById("graphLeft");
    var context = canvas.getContext("2d");
    var rms_array = ws.RMS_array;
    
    for (var x = 0.5; x < canvas.width; x += canvas.width / (ws.backend.buffer.duration / rms_step) ) {
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
    }
    
    context.strokeStyle = "#eee";
    context.stroke();
    
    context.beginPath();
    for (var i=0; i<rms_array.length; i++) {
        var rms_pair = rms_array[i]
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
    context.lineTo(currentTime * scale, canvas.height);
    
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





/* ************* */

// SPOTIFY AUTHENTICATION - WORKING BUT UNNECESSARY FOR NOW

/*
document.getElementById('login-button').addEventListener('click', function() {

    var client_id = '65fe5dec0aaa47e8ab365e51137a9ef9'; // Your client id
    var redirect_uri = 'http://localhost:3000/'; // Your redirect uri

    // var state = generateRandomString(16);

    // localStorage.setItem(stateKey, state);
    var scope = 'user-read-private user-read-email';

    var url = 'https://accounts.spotify.com/authorize';
    url += '?response_type=token';
    url += '&client_id=' + encodeURIComponent(client_id);
    //url += '&scope=' + encodeURIComponent(scope);
    url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
    // url += '&state=' + encodeURIComponent(state);

    window.location = url;
    token = window.location.hash

    }, false);

// document.querySelector("#token-button").addEventListener('click', getToken, false)
*/

// THIS RETRIEVES AN ACCESS TOKEN UPON OPENING THE PAGE
/*
$(function() {
    getToken()
    if (token === null) {

        var client_id = '65fe5dec0aaa47e8ab365e51137a9ef9'; // Your client id
        var redirect_uri = 'http://localhost:3000/'; // Your redirect uri

        var url = 'https://accounts.spotify.com/authorize';
        url += '?response_type=token';
        url += '&client_id=' + encodeURIComponent(client_id);
        url += '&redirect_uri=' + encodeURIComponent(redirect_uri);

        window.location = url;
        // token = window.location.hash
    }
})
*/



function getToken() {
    var h = window.location.hash
    console.log("HASH!")
    console.log(h)
    if (h!="") {
        console.log(h.match(/^#[^&]*/))
        token = h.match(/^#[^&]*/)
    }
}


/*
function getSpotifyBPMLeft() {
    $.ajax({
        url: 'https://api.spotify.com/v1/me',
        headers: {
          'Authorization': 'Bearer ' + access_token
        },
        success: function(response) {
}
*/


// ********************************************** //
// BPM DETECTION

/* TO TEST THE BPM OF A TRACK, LOAD THE PAGE, AND TYPE 'getBPM(X)'
INTO THE CONSOLE, WHERE X = FILE1/FILE2/ETC. */

/*

Hoodboi_By_Ur_Side: 140,                :)
Wave_Racer_Streamers: 140,              X (132.5, 131, 129.5, 140)
Wave_Racer_Flash_Drive: 134,     
Giraffage_Be_With_You: 140,             :)
Hi_Tom_Summer_Plants: 142,              :)
Bear_Face_Taste_My_Sad: 142,     
LWiz_Girl_From_Codeine_City: 141,
Village_Dive: 140 ,
OZZIE_YOUSHOULDKNOW: 140                X (93.5, 140])

PARAMETERS:
- THRESHOLD         [0.9]
- NEIGHBORRANGE     [25]
- ROUNDING          [100]

*/

var threshold;

function getPeaksAtThreshold(ws) {
    // RETURNS AN ARRAY OF THE INDICES OF ALL THE PEAKS ABOVE THE THRESHOLD
    console.log("UP HERE");
    console.log(ws);
    
    var data1 = ws.ws.backend.buffer.getChannelData(0);
    var data2 = ws.ws.backend.buffer.getChannelData(0);
    
    
    threshold = 0.95;
    // var threshold = 0.95;
    
    
    do {
        var peaksArray = [];
        
        for(var i = 0; i < data1.length; i++) {
            var d = (data1[i]+data2[i])/2;
            if (d > threshold) {
              peaksArray.push(i);
              // Skip forward ~ 1/4s to get past this peak.
              i += 10000;
            }
            i++;
        }
        threshold -= 0.05;
        console.log("THRESHOLD NOW", threshold, peaksArray.length);
    } while (peaksArray.length < ws.ws.backend.buffer.duration / 2);
    /*
    console.log("THRESHOLD NOW", threshold);
    for(var i = 0; i < data.length; i++) {
        if (data[i] > threshold) {
          peaksArray.push(i);
          // Skip forward ~ 1/4s to get past this peak.
          i += 10000;
        }
        i++;
    }
    */
    console.log("PEAKS ARRAY");
    //console.log(peaksArray);
    //var canvasH = $("#hiddenContainer wave canvas")[0];
    //var contextH = canvasH.getContext("2d");
    /*
    var scale = canvasH.width / hiddenWS.backend.buffer.length;
    for (var i=0; i< peaksArray.length; i++) {
        var x = peaksArray[i];
        var y = (x / hiddenWS.backend.buffer.length) * canvasH.width
        // console.log(i,peaksArray[i],i*scale);
        contextH.moveTo(y, 0);
        contextH.lineTo(y, canvasH.height);
        // Round the interval
        // peaksArray[i] = Math.floor(peaksArray[i]/100) * 100   
    }
    contextH.strokeStyle = "#000";
    contextH.stroke();
    */
    console.log(peaksArray);
    console.log(peaksArray.length);
    console.log("RETURNING")
    return peaksArray;
}

var confidence = 0;

function countIntervalsBetweenNearbyPeaks(peaks) {
    // RETURNS A LIST OF DICTS WHICH COUNT 
    // EACH INTERVAL BETWEEN NEARBY PEAKS AND HOW MANY TIMES IT APPEARS
    var intervalCounts = [];
    // NeighborRange = how many neighboring peaks to look at when counting
    var neighborRange = 5;
    peaks.forEach(function(peak, index) {
    for (var i = 1; i <= neighborRange; i++) {
        // FOR EACH PEAK, GET THE INTERVALS TO THE NEXT NEIGHBORRANGE PEAKS
        var interval = peaks[index + i] - peak;
        interval = intervalToBPM(interval, 44100);
        // ROUND THE INTERVAL DOWN A LITTLE IN ORDER TO GROUP
        // INTERVALS THAT ARE REALLY SIMILAR
        // interval = Math.floor(interval / 10) * 10;
        var foundInterval = intervalCounts.some(function(intervalCount) {
            if (intervalCount.interval === interval) {
                return intervalCount.count++;
            }
          });
          if (!foundInterval) {
                intervalCounts.push({
                    interval: interval,
                    count: 1
                });
            }
        }
    });
    // SORT THE RESULTS BY COUNT DESCENDING
    intervalCounts.sort(function(a,b) {return b.count - a.count})
    // confidence = intervalCounts[0].count - intervalCounts[1].count;
    return intervalCounts;
}



function intervalToBPM(interval, samplerate) {
    result = 60 / (interval / samplerate)
    while (result < 80) {
        result *= 2
    }
    while (result > 160) {
        result /= 2
    }
    // ROUND INTERVALS TO NEAREST 0.1
    return Math.round(result*10) / 10
}

function BPMToInterval(BPM, samplerate) {
    return (60 * samplerate) / BPM
}

// var hipass = hiddenWS.backend.ac.createBiquadFilter();
// hipass.type = "highpass";
// hipass.frequency.value = 40000;
// hiddenWS.backend.setFilter(hipass);

    
    
function getBPM(ws) {
    // RETURN THE BPM OF THE TRACK WITH THE GIVEN TITLE

    var sr = ws.ws.backend.buffer.sampleRate;
    console.log("NOW GETTING BPM FOR ", ws.ws)
    var peaks = getPeaksAtThreshold(ws);
    console.log("GOT PEAKS BACK")
    var counts = countIntervalsBetweenNearbyPeaks(peaks);
    console.log(counts)
    var intervalGuess = counts[0].interval
    console.log("INTERVAL GUESS = ", intervalGuess)
  
    console.log("RUNNERS UP: ")
  
    console.log(counts[1].interval, counts[2].interval, counts[3].interval)

    ws.BPM = intervalGuess;
    return intervalGuess

}

var round = 1;


function getBPMTest() {
    // RETURN THE BPM OF THE TRACK WITH THE GIVEN TITLE
    /*
    var ws = WaveSurfer.create({
        container: '#hiddenDiv',
        // scrollParent: true
    });
    */
    testArray = fileArray
    console.log("TEST # ",round)
    console.log(testArray)
    var currentTrack = fileArray.shift();
    
    // var currentTrack = 'static/' + 'EpicHouse/' + testArray.shift();
    console.log(currentTrack);
    var ws = hiddenWS;
    // $("#hiddenWS").unbind("ready");
    // ws.on("ready", false);
    ws.unAll();
    ws.load(currentTrack);
    ws.on("ready", function() {
        var sr = ws.backend.buffer.sampleRate;
        console.log("NOW GETTING BPM FOR ", ws)
        var peaks = getPeaksAtThreshold(ws);
        var counts = countIntervalsBetweenNearbyPeaks(peaks);
        console.log(counts)
        var intervalGuess = counts[0].interval
        console.log("INTERVAL GUESS = ", intervalGuess)
        // var result = 60 / (intervalGuess / ws.backend.buffer.sampleRate)
        // GET THE RESULT BETWEEN 80 AND 160 BY DOUBLING/HALVING
        /*
        while (result < 80) {
            result *= 2
        }
        while (result > 160) {
            result /= 2
        }
        */
        // ROUND THE RESULT TO THE NEAREST 0.5
        // result = Math.round(result*2) / 2
        // console.log("BPM GUESS = ", result)
        console.log("RUNNERS UP: ")
        /*
        console.log(60 / (counts[1].interval / ws.backend.buffer.sampleRate), 
                    60 / (counts[2].interval / ws.backend.buffer.sampleRate),
                    60 / (counts[3].interval / ws.backend.buffer.sampleRate));
                    */
        console.log(counts[1].interval, 
                    counts[2].interval,
                    counts[2].interval);
        BPMTestResults.push(intervalGuess);
        console.log(BPMTestResults);
        if (testArray.length > 0) {
            round++;
            // $("#hiddenWS").unbind();
            // ws.on("ready", false);
            console.log("DOWN HERE");
            getBPMTest();
        } else{
            console.log("DONE TESTING!")
            console.log(compareResults(fileArrayAnswers))
            return compareResults(fileArrayAnswers)
        }
    })
    return;
    // .push(result);
    // return result
}

// var delay = 5000
// var n = 1

var missed = [];

function compareResults(correctAnswerArr) {
    // var correctAnswerArr = album3BPMList;
    var result = 0
    for (var i=0; i < BPMTestResults.length; i++) {
        if (BPMTestResults[i] === correctAnswerArr[i]) {
            result ++;
        } else {
            missed.push(i);
        }
    }
    return result;
}



function getBeatArray(ws) {
    console.log("GET BEAT ARRAY")
    var peakArray = getPeaksAtThreshold(ws);
    // NOT SURE IF THIS VALUE SHOULD BE ROUNDED OR NOT
    // INTERVAL IS THE SAMPLE DISTANCE BETWEEN BEATS
    var interval = Math.round(BPMToInterval(ws.BPM, ws.ws.backend.buffer.sampleRate));
    console.log(interval);
    
    var result = [];
    var topScore = 0;
    
    for (var i=0; i < 30; i++) {
        // GO THROUGH THE FIRST 30 PEAKS, MAKE A BEATGRID,
        // AND SEE WHICH PEAK HAS THE MOST "HITS"
        var firstPeak = peakArray[i];
        // console.log(i, firstPeak);
        var peakGrid = [];
        var peakGrid2 = [];
        var c = ws.ws.backend.buffer.getChannelData(0);
        for (var j = firstPeak; j < ws.ws.backend.buffer.length; j += interval) {
            peakGrid2.push(j)
            for (var k = -100; k < 100; k++) {
                if (peakArray.indexOf(Math.round(j+k)) > -1) {
                    peakGrid.push(j);
                    break
                }
            }
        }
        if (peakGrid.length > topScore) {
            result = peakGrid2;
            ws.realInterval = interval;
            ws.realFirstPeak = firstPeak;
        }
    }
    
    for (var i = ws.realFirstPeak - interval; i > 0; i -= interval) {
        result.unshift(i)
    }
    
    
    
    console.log(result);
    var ctx = ws.waveformCtx
    var scale = ws.waveformCanvas.width / ws.ws.backend.buffer.length;
    for (var i=0; i< result.length; i++) {
        var x = result[i];
        var y = (x / ws.ws.backend.buffer.length) * ws.waveformCanvas.width
        // console.log(i,peaksArray[i],i*scale);
        ctx.moveTo(y, 0);
        ctx.lineTo(y, ws.waveformCanvas.height);
        // Round the interval
        // peaksArray[i] = Math.floor(peaksArray[i]/100) * 100   
    }
    ctx.strokeStyle = "#000";
    ctx.stroke();
    console.log("REALFIRSTPEAK", ws.realFirstPeak);
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.moveTo((ws.realFirstPeak / ws.ws.backend.buffer.length)*ws.waveformCanvas.width, 0);
    ctx.lineTo((ws.realFirstPeak / ws.ws.backend.buffer.length)*ws.waveformCanvas.width, ctx.height);
    // contextH.stroke();
    
    console.log(getAverageRMS(ws));
    ws.realBeatGrid = result;
    return result
}

var N = 8;
// var RMSAverages;
// var RMSAveragesArray;
function getAverageRMS(ws) {
    // RETURNS A LIST OF THE AVERAGE RMS'S EVERY N BEATS
    // EACH ENTRY TELLS YOU THE AVERAGE RMS UP TO THE NEXT N BEATS
    console.log("getAverageRMS");
    var result = [];
    var rmsArr = [];
    // var n = 32
    console.log(ws.realInterval,ws.ws);
    var RMS = getRMS2(ws, ws.realInterval);
    ws.RMSAveragesArray = RMS;
    for (var i=0; i < ws.RMS_array.length-N; i++) {
        // console.log("NOW AT ", i);
        var average = 0;
        for (var j=0; j < N; j++) {
            // console.log("step ",j)
            if (i+j < ws.RMS_array.length) {
                // console.log(rmsArr[i+j][1]);
                average += ws.RMS_array[i+j][1];
            } else {
                console.log("Last section");
                // console.log(average, n);
                average /= j;
                result.push([i * ws.realInterval, average])
                // result.push(average);
                ws.RMSAverages = result;
                return result;
            }
            
        }
        average /= N;
        // console.log(average, n);
        result.push([i * ws.realInterval, average]);
    }
    ws.RMSAverages = result;
    console.log(getDifferences(result));
    return result;
}

function getDifferences(arr) {
    // RETURNS A LIST OF THE DIFFERENCES BETWEEN THE RMS OF ONE 
    // N-BEAT SECTION AND ANOTHER
    console.log("GET DIFFERENCES");
    result = [];
    for (var i = N/2; i < arr.length-(N*2); i++) {
        result.push([i+N-1, Math.abs(arr[i][1]-arr[i+N][1]),
                    arr[i][1], arr[i+N][1]]);
    }
    console.log(result);
    return result;
}

function smoothArray(arr, shift) {
    result = 1000000000;
    var correctX = 0
    var costArray = []
    for (var i = 0; i < 4; i++) {
        var sumOfCosts = arr.map(function(a) {
            if ( (a-i)%4 === 3) {
                return 1
            } else {
                return (a-i)%4
            }
        }).reduce(function(a,b) {return a + b}, 0);
        console.log(sumOfCosts);
        costArray.push(sumOfCosts)
        if (sumOfCosts < result) {
            result = sumOfCosts
            console.log("NOW ", result, i);
            correctX = i;
        }
    }
    return arr.map(function(a) {
        return ( (Math.round( (a - correctX) / 4 )*4) + correctX);
    });
}

function groupByConsecutiveIntegers(arr) {
    console.log("GROUP BY CONSECUTIVE");
    console.log(arr);
    var result = [];
    for (var i=0; i < arr.length - 1; i++) {
        console.log(i, arr[i]);
        var temp = [];
        temp.push(arr[i]);
        while (i < arr.length-1 && Math.abs(arr[i+1][0] - arr[i][0]) === 1) {
            console.log(arr[i], arr[i+1]);
            i += 1;
            temp.push(arr[i])
        }
        console.log("TEMP ", temp);
        result.push(temp);
    }
    return result;
}

/*
function getSegments(ws) {
    return findSegments(getDifferences(ws.RMSAverages));
}
*/

// WORKING WELL:
// "static/EpicHouse/Ultra Nate - Free (Teo Moss & Danie Shems Remix)_www.dj-case.com.mp3"
// "static/EpicHouse/Zoe Badwi - Release Me (Niels Van Gogh Remix)_www.dj-case.com.mp3"
// "static/EpicHouse/Tv Rock ft Rudy - In The Air (Axwell Remix)_www.dj-case.com.mp3"
// var loudestSeg = 0;
// var segVolArray = [];
function findSegments(ws) {
    var differencesArray = getDifferences(ws.RMSAverages);
    differencesArray = differencesArray.sort(function(a,b) {return b[1] - a[1]}).slice(0,100).sort(function(a,b) {return b[0] - a[0]});
    console.log("DIFF", differencesArray);
    var grouped = groupByConsecutiveIntegers(differencesArray);
    console.log(grouped);
    
    for (var i = 0; i < grouped.length; i++) {
        grouped[i].sort(function(a,b) {return b[1] - a[1]})
    }
    console.log(grouped);
    result = grouped.map(function(a) {return a[0][0]})
    result = smoothArray(result);
    
    var loudest = 0;
    var arr1 = [];
    ws.segVolArray = [];
    console.log(result);
    for (var i = 0; i < result.length; i++) {
        var r = (ws.RMSAverages[result[i]][1] - ws.RMSAverages[result[i]-N][1]);
        console.log("THIS ", i, result[i], r);
        ws.segVolArray.push(r);
        console.log(r, ws.loudestSeg);
        if (r !== Infinity && r > loudest) {
            console.log("r is now ", r);
            loudest = r;
            ws.loudestSeg = result[i];
        }
    }
    console.log(result);
    result.sort(function(a,b) {
        console.log(a,b);
        var rA = ws.RMSAverages[a][1] - ws.RMSAverages[a-N][1];
        var rB = ws.RMSAverages[b][1] - ws.RMSAverages[b-N][1];
        return rB - rA;
    });
    console.log("SORTED ",result);
    
    
    // var canvasH = $("#hiddenContainer wave canvas")[0];
    // var contextH = canvasH.getContext("2d");
    var scale = ws.waveformCanvas.width / ws.ws.backend.buffer.length;
    ws.waveformCtx.beginPath();
    ws.waveformCtx.lineWidth = 10;
    for (var i = 0; i < result.length; i++) {
        console.log(i,( (ws.realBeatGrid[result[i]]) / ws.ws.backend.buffer.length) * ws.waveformCanvas.width)
        ws.waveformCtx.moveTo( ( (ws.realBeatGrid[result[i]]) / ws.ws.backend.buffer.length) * ws.waveformCanvas.width, 0);
        ws.waveformCtx.lineTo( ( (ws.realBeatGrid[result[i]]) / ws.ws.backend.buffer.length) * ws.waveformCanvas.width, ws.waveformCanvas.height);
    }
    ws.waveformCtx.strokeStyle = "#090";
    console.log("STROKE");
    ws.waveformCtx.stroke();
    
    return result

}

var hiPass;
function hiBeats(ws, bpm) {
    
    /*
    hiPass = hiddenWS.backend.ac.createBiquadFilter();
    hiPass.type = "highpass";
    hiPass.frequency.value = 6000;
    hiddenWS.backend.setFilter(hiPass);
    */
    
    // Create offline context
    var buffer = hiddenWS.backend.buffer;
    var offlineContext = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);

    // Create buffer source
    var source = offlineContext.createBufferSource();
    source.buffer = buffer;

    // Create filter
    var filter = offlineContext.createBiquadFilter();
    filter.type = "highpass";

    // Pipe the song into the filter, and the filter into the offline context
    source.connect(filter);
    filter.connect(offlineContext.destination);

    // Schedule the song to start playing at time:0
    source.start(0);

    // Render the song
    offlineContext.startRendering()

    // Act on the result
    offlineContext.oncomplete = function(e) {
      // Filtered buffer!
      var filteredBuffer = e.renderedBuffer;
        console.log("DOING THIS NOW");
        
        hiPassBeats = []
    
        hiddenWS.backend.buffer = filteredBuffer;
        var f = hiddenWS.backend.buffer.getChannelData(0);
        for (var i = 0; i < realBeatGrid.length; i++) {
            if (f[realBeatGrid[i]] > threshold) {
                hiPassBeats.push(realBeatGrid[i])
            }
        }
        
        var canvasH = $("#hiddenContainer wave canvas")[0];
        var contextH = canvasH.getContext("2d");
        var scale = canvasH.width / hiddenWS.backend.buffer.length;
        for (var i=0; i< hiPassBeats.length; i++) {
            var x = hiPassBeats[i];
            var y = (x / hiddenWS.backend.buffer.length) * canvasH.width
            // console.log(i,peaksArray[i],i*scale);
            contextH.moveTo(y, 0);
            contextH.lineTo(y, canvasH.height);
            // Round the interval
            // peaksArray[i] = Math.floor(peaksArray[i]/100) * 100   
        }
        contextH.strokeStyle = "#890";
        contextH.lineWidth = 3;
        contextH.stroke();
        
        return hiPassBeats;
        
    }
        
}



function goToBeat(ws, beatgrid, n) {
    ws.seekTo(beatgrid[n] / ws.backend.buffer.length);
}