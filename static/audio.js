var file1 = 'static/Wave_Racer_Streamers.mp3';
var file2 = 'static/Hi_Tom_Summer_Plants.mp3';
var file3 = 'static/Hoodboi_By_Ur_Side.mp3',
    hash,
    token = null;


// THESE VARIABLES DEFINE WHETHER A DECK IS RUNNING
var leftIsRunning = false,
    rightIsRunning = false;

// SET EVENT HANDLER FOR PLAY/PAUSE BUTTONS
$("#playButton").on("click", playPauseLeft)
$("#playButtonR").on("click", playPauseRight)

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
        rightIsRunning = true
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
//wavesurferLeft.load(file1)

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


var wavesurferRight = WaveSurfer.create({
    container: '#waveformR',
});

// DEFINE RIGHT DECK VARIABLES
var gainNodeR,
    analyserR,
    dataArrayR,
    canvasR = document.querySelector('#canvasRight'),
    canvasCtxR = canvasR.getContext("2d"),
    bufferLengthR,
    bufferR,
    RMS_ArrayR = [];

//wavesurferRight.load(file2)



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


function isReady(ws, gainNode, bufferLength, dataArray, buffer, rms_array) {
    // HELPER FUNCTION FOR DECK-IS-READY
    var context = ws.backend.ac
    console.log(ws.backend)
    console.log(context)
    gainNode = context.createGain();
    console.log(gainNode)
    console.log(ws.backend.source)
    ws.backend.setFilter(gainNode)
    
    analyser = context.createAnalyser();

    gainNode.connect(analyser)

    bufferLength = analyser.frequencyBinCount;
    console.log(bufferLength);
    
    dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);
    buffer = new Uint8Array(analyser.fftSize);

    console.log(bufferLength)

    getRMS(ws, rms_array);
    if (ws === wavesurferLeft) {
        // draw()
        drawGraphL();
    } else {
        drawGraphR();
    }
}

wavesurferLeft.on('ready', function () {
    // ACTION ONCE THE TRACK IS LOADED INTO WAVESURFER INSTANCE
    console.log("Wavesurfer LEFT")
    console.log(wavesurferLeft)
    isReady(wavesurferLeft, gainNodeL, bufferLengthL, dataArrayL, bufferL, RMS_ArrayL)
});

wavesurferRight.on('ready', function () {
    // ACTION ONCE THE TRACK IS LOADED INTO WAVESURFER INSTANCE
    console.log("Wavesurfer RIGHT")
    console.log(wavesurferRight)
    isReady(wavesurferRight, gainNodeR, bufferLengthR, dataArrayR, bufferR, RMS_ArrayR)
});



function getRMS(ws, rms_array) {
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
            rms_array.push( [i / 44100, 20*Math.log10(Math.abs(rms))] )
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

function changeVolumeRight() {
    // THE RIGHT VOLUME SLIDER
    console.log("CHANGE")
    var sliderValue = document.getElementById("VolSliderR").value
    console.log(sliderValue)
    gainNodeR.gain.value = sliderValue / 100
}

$('.form-group').on('click','input[type=radio]',function() {
    $(this).closest('.form-group').find('.radio-inline, .radio').removeClass('checked');
    $(this).closest('.radio-inline, .radio').addClass('checked');
});

document.querySelector("#VolSliderL").addEventListener("change", changeVolumeLeft)
document.querySelector("#VolSliderR").addEventListener("change", changeVolumeRight)

var leftDeckUpload = document.querySelector("#leftDeckUpload");
leftDeckUpload.addEventListener("change", function() {
    clearGraphLeft();
    wavesurferLeft.loadBlob(leftDeckUpload.files[0]);
});

var rightDeckUpload = document.querySelector("#rightDeckUpload");
rightDeckUpload.addEventListener("change", function() {
    clearGraphRight();
    wavesurferRight.loadBlob(rightDeckUpload.files[0]);
});

function clearGraphLeft() {
    RMS_ArrayL = [];
    var canvas = document.querySelector("#graphLeft")
    canvas.width = canvas.width
}

function clearGraphRight() {
    RMS_ArrayR = [];
    var canvas = document.querySelector("#graphRight")
    canvas.width = canvas.width
}



function drawGraphL() {
    // Wrapper for drawing the left graph
    d = requestAnimationFrame(drawGraphL)
    drawGraph(wavesurferLeft, document.querySelector("#graphLeft"), RMS_ArrayL)
}

function drawGraphR() {
    // Wrapper for drawing the left graph
    d = requestAnimationFrame(drawGraphR)
    drawGraph(wavesurferRight, document.querySelector("#graphRight"), RMS_ArrayR)
}


function drawGraph(ws, canvas, rms_array) {
    // var canvas = document.getElementById("graphLeft");
    var context = canvas.getContext("2d");
    
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


function getPeaksAtThreshold(ws) {
    // RETURNS AN ARRAY OF THE INDICES OF ALL THE PEAKS ABOVE THE THRESHOLD
    
    var data = ws.backend.source.buffer.getChannelData(0);
    var threshold = 0.8;
    var peaksArray = [];
    for(var i = 0; i < data.length; i++) {
        if (data[i] > threshold) {
          peaksArray.push(i);
          // Skip forward ~ 1/4s to get past this peak.
          i += 10000;
        }
        i++;
    }   
    for (var i=0; i< peaksArray.length; i++) {
        // Round the interval
        // peaksArray[i] = Math.floor(peaksArray[i]/100) * 100
    }
  return peaksArray;
}


function countIntervalsBetweenNearbyPeaks(peaks) {
    // RETURNS A LIST OF DICTS WHICH COUNT 
    // EACH INTERVAL BETWEEN NEARBY PEAKS AND HOW MANY TIMES IT APPEARS
    var intervalCounts = [];
    // NeighborRange = how many neighboring peaks to look at when counting intervals
    var neighborRange = 10
    peaks.forEach(function(peak, index) {
    for (var i = 1; i < neighborRange; i++) {
        // FOR EACH PEAK, GET THE INTERVALS TO THE NEXT NEIGHBORRANGE PEAKS
        var interval = peaks[index + i] - peak;
        // ROUND THE INTERVAL DOWN A LITTLE IN ORDER TO GROUP
        // INTERVALS THAT ARE REALLY SIMILAR
        interval = Math.floor(interval / 100) * 100
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
    return intervalCounts;
}



function intervalToBPM(interval, samplerate) {
    result =  60 / (interval / samplerate)
    while (result < 80) {
        result *= 2
    }
    while (result > 160) {
        result /= 2
    }
    return Math.round(result*2) / 2
}

function getBPM(title) {
    // RETURN THE BPM OF THE TRACK WITH THE GIVEN TITLE
    var ws = WaveSurfer.create({
        container: '#hiddenDiv',
        // scrollParent: true
    });
    
    ws.load(title)
    ws.on("ready", function() {
        var sr = ws.backend.buffer.sampleRate;
        console.log("NOW GETTING BPM FOR ", ws)
        var peaks = getPeaksAtThreshold(ws);
        var counts = countIntervalsBetweenNearbyPeaks(peaks);
        console.log(counts)
        var intervalGuess = counts[0].interval
        console.log("INTERVAL GUESS = ", intervalGuess)
        var result = 60 / (intervalGuess / ws.backend.buffer.sampleRate)
        // GET THE RESULT BETWEEN 80 AND 160 BY DOUBLING/HALVING
        while (result < 80) {
            result *= 2
        }
        while (result > 160) {
            result /= 2
        }
        // ROUND THE RESULT TO THE NEAREST 0.5
        result = Math.round(result*2) / 2
        console.log("BPM GUESS = ", result)
        console.log("RUNNERS UP: ")
        console.log(60 / (counts[1].interval / ws.backend.buffer.sampleRate), 
                    60 / (counts[2].interval / ws.backend.buffer.sampleRate),
                    60 / (counts[3].interval / ws.backend.buffer.sampleRate));
        console.log(intervalToBPM(counts[1].interval,sr), 
                    intervalToBPM(counts[2].interval,sr),
                    intervalToBPM(counts[3].interval,sr));
    })
}