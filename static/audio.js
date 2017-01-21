'use strict'

var masterTempo = 140;
var knobArray = [];
var autoDJ = 0;
var drawPeaks = false;


$(function() {
    console.log(wsArray.length);
    for (var i=0; i < wsArray.length; i++) {
        var DRspans = $(wsArray[i].HTMLtable).find(".dialRow").find('span');
        console.log(i, wsArray[i].HTMLtable, DRspans);
        for (var j=0; j < DRspans.length; j++) {
          DRspans[j].style.padding = "7px";
            var button = $(DRspans[j]).find('input')[0];
            console.log(button.value);
        };
        $(DRspans[0]).closest("td")[0].style.paddingTop = "20px";
    };
});


// SET UP CROSSFADER
var xFader;
$(function() {
    xFader = $('#xFader').slider({
        handle: "custom",
        tooltip: 'hide',
        min: 0,
        max: 100,
        step: 0.1,
        value: 0,
        id: "xFaderSlider"
    });
});

// CALL THE XFADE() FUNCTION ON CHANGING SLIDER VALUE
$("#xFader").on('change', function(){xFade()});

// STYLE KNOBS
$(function() {
    $(".slider").each(function(idx, el) {el.style['width']= "400px"; el.style["marginTop"] = "2px"})
});


// SET THE BACKGROUND COLOR OF THE EQ METERS
$(function(){
    for (var i in wsArray) {
        var ws = wsArray[i];
        $($(ws.HTMLtable).find('canvas')[7]).css('background-color', 'black');
        $($(ws.HTMLtable).find('canvas')[5]).css('background-color', 'black');
    }
});



function autoXFadeHelper(fromWS, toWS) {
    // AUTOMATES AN X-FADE FROM ONE DECK TO THE OTHER
    autoXFade(50, (60 / masterTempo) * 32000);
    // GET THE TARGET LOCATION
    // LEFT DECK = 0; RIGHT DECK = 100
    var t;
    (toWS === wsRight)? t = 100 : t = 0;
    
    // SET A TIMEOUT CALL TO AUTOXFADE
    setTimeout(function() {console.log("WILL XFADE TO ",t, " IN ", (60 / masterTempo) * 48000); autoXFade(t, (60 / masterTempo) * 32000)}, (60 / masterTempo) * 48000);
}


function autoXFade(target, duration) {
    // AUTOMATE X-FADE TO THE TARGET POSITION (0-100) IN THE DURATION
    
    // THE NUMBER OF STEPS FOR THE TRANSITION
    var nSteps1 = 1000;
    // GET THE CURRENT VALUE
    var currentVal = xFader.slider('getValue');
    // DETERMINE THE LENGTH OF EACH STEP
    var step1 = (target - currentVal) / nSteps1;
    // DETERMINE THE DURATION OF EACH STEP
    var stepTime = duration / nSteps1;
    
    for (var i = 0; i < nSteps1; i++) {
        // FOR EACH TIME-STEP, SET A TIMEOUT TO MOVE THE SLIDER AN EXTRA STEP
        setTimeout(function() {
            currentVal = currentVal + step1;
            xFader.slider('setValue', currentVal);
            xFade();
        }, stepTime * i);
    }
}


function autoLPHelper(fromWS, toWS) {
    // AUTOMATE AN LP SWEEP TRANSITION WITH AN X-FADE
    
    // IF THE LP OF THE TARGET IS OFF, TURN IT ON
    if (toWS.onFilterArray.indexOf(toWS.LP) === -1) {
        toggleLP(toWS);
    }
    // X-FADE TO THE MIDDLE
    autoXFade(50, 5000);
    // LP SWEEP UP FOR 8 BARS
    var d = (60/masterTempo) * 32000;
    autoLPSweepUp(toWS, d);
    // FIND THE TARGET X-FADER VALUE
    var t = (toWS === wsRight)? 100 : 0;
    // TURN OFF THE LP AFTER THE LP SWEEP
    setTimeout(function() {toggleLP(toWS)}, d);
    // X-FADE TO THE TARGET
    setTimeout(function() {console.log("WILL XFADE TO ",t, " IN ", (60 / masterTempo) * 48000); autoXFade(t, (60 / masterTempo) * 32000)}, (60 / masterTempo) * 48000);
    
}

function autoLPSweepUp(ws, duration) {
    // AUTOMATE AN LP SWEEP UP
    
    console.log("AUTOLPSWEEPUP", ws.onFilterArray);
    console.log(ws.onFilterArray);
    ws.LP.frequency.value = 0;
    
    var nSteps2 = 1000;
    var stepTime = duration / nSteps2;
    
    var currentVal2 = 0;
    var stepTime = duration / nSteps2;
    console.log(nSteps2, duration, stepTime);
    
    for (var i = 0; i < nSteps2; i++) {
        // AT EACH STEP, INCREMENT THE LP CUTOFF BY THE CORRECT AMOUNT
        setTimeout(function() {
            currentVal2 = currentVal2 + (2000 / nSteps2);
            ws.LP.frequency.value = currentVal2;
            knobArray[wsArray.indexOf(ws)].val(currentVal2);
        }, stepTime * i);
    };
};


function autoHPHelper(fromWS, toWS) {
    // AUTOMATE AN HP SWEEP TRANSITION WITH X-FADE
    
    // IF THE HP FILTER IS OFF ON THE TARGET DECK, ACTIVATE IT
    if (toWS.onFilterArray.indexOf(toWS.HP) === -1) {
        toggleHP(toWS);
    }
    // X-FADE TO THE MIDPOINT
    autoXFade(50, 5000);
    var d = (60/masterTempo) * 32000;
    autoHPSweepDown(toWS, d);
    var t = (toWS === wsRight)? 100 : 0;
    // TURN OFF THE HP AFTER THE SWEEP
    setTimeout(function() {toggleHP(toWS)}, d);
    setTimeout(function() {console.log("WILL XFADE TO ",t, " IN ", (60 / masterTempo) * 48000); autoXFade(t, (60 / masterTempo) * 32000)}, (60 / masterTempo) * 48000);
    
}

function autoHPSweepDown(ws, duration) {
    // AUTOMATE AN HP SWEEP DOWN
    
    console.log("AUTOHPSWEEPDOWN", ws.onFilterArray);
    ws.HP.frequency.value = 10000;
    
    nSteps3 = 1000;
    var stepTime = duration / nSteps3;
    
    var currentVal3 = 10000;
    var stepTime = duration / nSteps3;
    console.log(nSteps3, duration, stepTime);
    for (var i = 0; i < nSteps3; i++) {
        setTimeout(function() {
            
            currentVal3 = currentVal3 - (10000 / nSteps3);
            console.log(currentVal3)
            // console.log(i, currentVal, stepTime);
            ws.HP.frequency.value = currentVal3;
            knobArray[wsArray.indexOf(ws)+4].val(currentVal3);
            // $(".LPdial")[wsArray.indexOf(ws)].value = currentVal.toString();

        }, stepTime * i);
    };
}


function autoLoopTransition(fromWS, toWS) {
    // AUTOMATE A LOOP TRANSITION
    autoXFade(50, 8000);
}

// TESTING THE LOOP FUNCTIONALITY
document.querySelector("#loopButton").addEventListener("click", loop);

function loop(ws=wsLeft) {
    //var ws = wsLeft;
    var elapsed = ws.ws.backend.getCurrentTime();
    var loopLength = (60 / masterTempo) * 8;
    var loop = ws.ws.addRegion({start: elapsed, 
                     end: elapsed + loopLength,
                    loop: true});
    setTimeout(function() {loop.loop = false}, (60 / masterTempo) * 8);
}


// SET UP THE LP KNOBS
var LPKnobs = $(".LPdial").knob({
    fgColor: "#d6eaff",
    bgColor: "#404040",
    thickness: 0.4,
    width: 40,
    height: 40,
    max: 2000,
    step: 10,
    'change' : function (v) {
        var currentWS = wsArray[knobArray.indexOf(this)%2];
        currentWS.LP.frequency.value = v;
        console.log(currentWS, this, v);
    }
});

// SET UP THE BP KNOBS
var BPKnobs = $(".BPdial").knob({
    fgColor: "#d6eaff",
    bgColor: "#404040",
    thickness: 0.4,
    width: 40,
    height: 40,
    min: 500,
    max: 1500,
    step: 10,
    'change' : function (v) {
        var currentWS = wsArray[knobArray.indexOf(this)%2];
        currentWS.BP.frequency.value = v;
        console.log(currentWS, this, v);
    }
});

// SET UP THE HP KNOBS
var HPKnobs = $(".HPdial").knob({
    fgColor: "#d6eaff",
    bgColor: "#404040",
    thickness: 0.4,
    width: 40,
    height: 40,
    max: 10000,
    step: 100,
    'change' : function (v) {
        var currentWS = wsArray[knobArray.indexOf(this)%2];
        currentWS.HP.frequency.value = v;
        console.log(currentWS, this, v);
    }
});


// CREATE THE "HIDDEN" WAVESURFER FOR BPM ANALYSIS
var hiddenWS,
    BPMTestResults = [];
    
var hiddenWS = WaveSurfer.create({
    container: '#hiddenDiv',
    normalize: true,
    scrollParent: true
});

hiddenWS.load("static/audio/metronome.wav");




// SET EVENT HANDLER FOR PLAY/PAUSE BUTTONS
$("#playButtonL").on("click", playPauseLeft);
$("#playButtonR").on("click", playPauseRight);
$("#hiddenPlayPause").on("click", playPauseHidden);

// SET EVENT HANDLERS FOR THE FILTERS
$("#LPLeft").on("click", LPLeft);
$("#BPLeft").on("click", BPLeft);
$("#HPLeft").on("click", HPLeft);

$("#LPRight").on("click", LPRight);
$("#BPRight").on("click", BPRight);
$("#HPRight").on("click", HPRight);



function play(ws) {
    // START THE DECK
    ws.play()
}

function findNextHighestInArray(arr, int) {
    // GIVEN AN ARRAY OF INTEGERS, FIND THE LOWEST INTEGER
    // THAT'S HIGHER THAN THE INPUT INT
    var arr2 = arr.slice();
    return arr2.filter(function(a) {return a >= int}).sort(function(a,b) {return a-b})[0]
}

function getPreviousHighestInArray(arr, int) {
    // GIVEN AN ARRAY OF INTEGERS, FIND THE GREATEST INTEGER
    // LOWER THAN THE INPUT INT
    var arr2 = arr.slice();
    return arr2.filter(function(a) {return a <= int}).sort(function(a,b) {return b-a})[0];
}

function playPause(ws) {
    // FUNCTIONALITY FOR THE PLAY/PAUSE BUTTON
    console.log("PLAYPAUSE");
    // wsOther IS THE OTHER WS THAT WAS NOT CLICKED
    var wsOther = wsArray.slice().filter(function(a) {return a!== ws})[0];
    var currentPlayer = $(ws.HTMLtable).parents('div')[1];
    
    if (ws.isLoaded) {
        // IF THE WS HAS LOADED A TRACK...
        console.log("ISLOADED");
        if (ws.isRunning) {
            // IF THE DECK IS RUNNING, JUST STOP IT
            console.log("IS RUNNING, WILL STOP");
            ws.isRunning = false;
            ws.ws.pause();
            // CLEAR THE METRONOME INTERVAL FUNCTION
            clearInterval(setIntervalFunc);
            currentPlayer.className = "column2";
            // $($(ws.HTMLtable).parents('div')[0]).css("box-shadow", "0px 0px 0px 0px #fff");
            // RESET THE CSS FOR THE DECK
            $(ws.HTMLtable).parents('div')[1].className = "column2";
        } else {
            // IF THE DECK IS NOT RUNNING, START IT
            if (wsOther.isRunning) {
                // IF THE OTHER DECK IS RUNNING, START THIS DECK IN SYNC
                beatMaster = ws;
                
                // SET THE PLAYBACKRATE SO THAT THE SELECTED WS 
                // WILL BE AT SAME TEMPO AS RUNNING WS
                ws.playbackSpeed = masterTempo / ws.BPM;
                ws.ws.backend.playbackRate = ws.playbackSpeed;
                console.log(ws.playbackSpeed);
                // IF THE OTHER DECK IS RUNNING, FIND THE OFFSET AND
                // THEN START THE DECK WHEN SYNCED UP
                
                startTime = Date.now();
                beatsElapsed += currentBeat;
                
                var startTime2 = Date.now();
                // GET THE TIME UNTIL THE OTHER DECK HITS THE NEXT BEAT
                var currentTimeOther = wsOther.ws.backend.getCurrentTime();
                var currentFrameOther = Math.round(currentTimeOther * 44100);
                var nextBeatOther = findNextHighestInArray(wsOther.realBeatGrid, currentFrameOther);
                var diffOther = nextBeatOther - currentFrameOther
                
                // GET THE DISTANCE BETWEEN THE LEFT DECK AND THE LAST BEAT
                var currentTime = ws.ws.backend.getCurrentTime();
                var currentFrame = Math.round(currentTime * 44100);
                var previousBeat = getPreviousHighestInArray(ws.realBeatGrid, currentFrame);
                var diff = currentFrame - previousBeat;
                console.log("DIFF ", diffOther, diff);
                // ws.ws.seekTo(previousBeat / ws.ws.backend.buffer.length);
                
                var delay = (diffOther/44100)*1000 + ((diff/44100)*1000);
                //if (delay < 0) {delay += BPMToInterval(wsLeft.bpm, 44100)}
                console.log("GONNA START IN ", delay);
                
                var endTime = Date.now();
                console.log("THIS TOOK ", endTime - startTime2);
                setTimeout(function() {console.log(wsOther.ws.backend.getCurrentTime()*44100); ws.ws.play(); ws.isRunning = true; currentPlayer.className = "columnSelected";}, delay * (1/ws.playbackSpeed));
                
                // ws.ws.play();
                // ws.isRunning = true;
                
            } else {
                // IF NO DECK IS PLAYING, JUST START THIS ONE
                beatMaster = ws;
                ws.ws.backend.playbackRate = 1;
                ws.isRunning = true;
                masterTempo = ws.BPM;
                ws.ws.play();
                startMetronome();
                currentPlayer.className = "columnSelected";
            }
        }
    }
}

function playPauseLeft() {
    // PLAY/PAUSE THE LEFT WS
    playPause(wsLeft);
}

function playPauseRight() {
    // PLAY/PAUSE THE RIGHT WS
    playPause(wsRight);
}

function toggleLP(ws) {
    // TURN THE LP ON/OFF
    console.log("toggleLP");
    console.log(ws.onFilterArray);
    if (ws.onFilterArray.indexOf(ws.LP) > -1) {
        // IF THE LP IS ON, TURN IT OFF
        console.log("turn LP off");
        // REMOVE THE LP FROM THE ONFILTER ARRAY
        ws.onFilterArray = ws.onFilterArray.filter(function(a) {return a !== ws.LP});
        // UPDATE THE ACTIVE FILTERS
        ws.ws.backend.setFilters(ws.onFilterArray);
        // UPDATE THE LP CSS
        ws.LPbutton.className = "filter buttonDeselected";
    } else {
        // ELSE IF IT'S OFF, TURN IT ON
        console.log("turn LP on")
        // ADD THE LP TO THE ONFILTERARRAY
        ws.onFilterArray.push(ws.LP);
        console.log(ws.LP,ws.gainNode,ws.ws.backend);
        // UPDATE THE ACTIVE FILTERS
        ws.ws.backend.setFilters(ws.onFilterArray);
        // UPDATE THE LP CSS
        ws.LPbutton.className = "filter buttonSelected";
    }
}

function toggleBP(ws) {
    // TURN THE BP ON/OFF
    console.log("toggleBP");
    console.log(ws.onFilterArray);
    if (ws.onFilterArray.indexOf(ws.BP) > -1) {
        // IF THE BP IS ON, TURN IT OFF
        console.log("turn BP off");
        // REMOVE THE BP FROM THE ONFILTERARRAY
        ws.onFilterArray = ws.onFilterArray.filter(function(a) {return a !== ws.BP});
        ws.ws.backend.setFilters(ws.onFilterArray);
        ws.BPbutton.className = "filter buttonDeselected";
    } else {
        // ELSE IF THE BP IS OFF, TURN IT ON
        console.log("turn BP on")
        // ADD THE BP TO THE ONFILTERARRAY
        ws.onFilterArray.push(ws.BP);
        console.log(ws.BP,ws.gainNode,ws.ws.backend);
        // UPDATE THE ACTIVE FILTERS
        ws.ws.backend.setFilters(ws.onFilterArray);
        ws.BPbutton.className = "filter buttonSelected";
    }
}

function toggleHP(ws) {
    // TURN THE HP ON/OFF
    console.log("toggleHP");
    console.log(ws.onFilterArray);
    if (ws.onFilterArray.indexOf(ws.HP) > -1) {
        console.log("turn HP off");
        ws.onFilterArray = ws.onFilterArray.filter(function(a) {return a !== ws.HP});
        ws.ws.backend.setFilters(ws.onFilterArray);
        ws.HPbutton.className = "filter buttonDeselected";
    } else {
        console.log("turn HP on")
        ws.onFilterArray.push(ws.HP);
        console.log(ws.HP,ws.gainNode,ws.ws.backend);
        ws.ws.backend.setFilters(ws.onFilterArray);
        ws.HPbutton.className = "filter buttonSelected";
    }
}

function LPLeft() {
    toggleLP(wsLeft);
}

function BPLeft() {
    toggleBP(wsLeft);
}

function HPLeft() {
    toggleHP(wsLeft);
}

function LPRight() {
    toggleLP(wsRight);
}

function BPRight() {
    toggleBP(wsRight);
}

function HPRight() {
    toggleHP(wsRight);
}

// SET UP THE METRONOME
var setIntervalFunc;
var metronomeOn = false;
document.querySelector("#metronomeButton").addEventListener("click", function() {if (metronomeOn) {metronomeOn=false; this.className="buttonDeselected"} else {metronomeOn=true; this.className="buttonSelected"}});

/*
this.className = this.className.replace( /(?:^|\s)buttonDeselected(?!\S)/g , '' ); this.classname += "buttonSelected";
*/

var currentBeat;
var beatsElapsed;
var beatMaster;
var startTime;
function startMetronome() {
    // START THE METRONOME IN TIME WITH THE BEAT
    console.log(metronomeOn);
    if (metronomeOn) {
        startTime = new Date().getTime();
        currentBeat = 0;
        var x = function() {
            if (hiddenWS.isPlaying()) {hiddenWS.stop()};
            if (currentBeat > 0) {
                hiddenWS.play();
            };
            var y = new Date().getTime(); 
            var timeShouldBe = startTime + (beatMaster.realBeatGrid[currentBeat]/44100)*1000;
            var delay = timeShouldBe - y;
            console.log(currentBeat, startTime, y, timeShouldBe, delay); 
            // current = y; hiddenWS.play();
            setIntervalFunc = setTimeout(x, delay);
            currentBeat++;
        };
        x();
    };
}



function playPauseHidden() {
    // PLAY/PAUSE THE HIDDEN DECK
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


// ***** CREATE THE WAVESURFER INSTANCES *****

// CREATE LEFT DECK WAVESURFER INSTANCE
var wavesurferLeft = WaveSurfer.create({
    container: '#waveformL',
    normalize: true,
    scrollParent: true,
    cursorColor: "yellow"
});
console.log("CREATED WS INSTANCE");
console.log(wavesurferLeft)

var wsLeft = new wsObject(wavesurferLeft);


// CREATE RIGHT DECK WAVESURFER INSTANCE
var wavesurferRight = WaveSurfer.create({
    container: '#waveformR',
    normalize: true,
    scrollParent: true,
    cursorColor: "yellow"
});

var wsRight = new wsObject(wavesurferRight);


// THE CLASS FOR EACH WAVESURFER AND ITS PROPERTIES
function wsObject(ws) {
    this.ws = ws;
    this.canvas = this.ws.container;
    this.context = this.ws.backend.ac;
    this.gainNode = this.context.createGain();
    this.ws.backend.setFilter(this.gainNode);
    this.analyser = this.context.createAnalyser();
    this.gainNode.connect(this.analyser);
    this.RMS_array = [];
    this.waveformCanvas = $(this.ws.container).find("wave canvas")[0];
    this.waveformCtx = this.waveformCanvas.getContext("2d");
    this.isRunning = false;
    this.isLoaded = false;
    this.playbackSpeed = 1;
    this.HTMLtable = $(this.ws.container).closest("table")[0];
    
    this.filterButtons = $(this.HTMLtable).find(".filter");
    this.LPbutton = this.filterButtons[0];
    this.BPbutton = this.filterButtons[1];
    this.HPbutton = this.filterButtons[2];
    
    // SET UP AND INITIALIZE THE FILTERS
    this.LP = this.ws.backend.ac.createBiquadFilter();
    this.LP.type = "lowpass";
    this.LP.frequency.value = 500;
    
    this.BP = this.ws.backend.ac.createBiquadFilter();
    this.BP.type = "bandpass";
    this.BP.frequency.value = 1000;
    
    this.HP = this.ws.backend.ac.createBiquadFilter();
    this.HP.type = "highpass";
    this.HP.frequency.value = 2000;
    
    this.filters = [this.gainNode, this.analyser, this.LP, this.BP, this.HP];
    this.onFilterArray = [this.gainNode, this.analyser];
    
    /*
    this.volAnalyser = this.context.createAnalyser();
    this.volAnalyser.smoothingTimeConstant = 0.3;
    this.volAnalyser.fftSize = 1024;
    
    this.javascriptNode = this.context.createScriptProcessor(2048, 1, 1);
    */
}


function setupAudioNodes(ws) {
    console.log("SETUPAUDIONODES");
    
    ws.volCanvasL = $(ws.HTMLtable).find('.volMeter')[0];
    ws.volCanvasR = $(ws.HTMLtable).find('.volMeter')[1];

    ws.volCtxL = ws.volCanvasL.getContext('2d');
    ws.volCtxR = ws.volCanvasR.getContext('2d');
    
 
    // setup a javascript node
    ws.javascriptNode = ws.context.createScriptProcessor(512, 1, 1);
    // connect to destination, else it isn't called
    ws.javascriptNode.connect(ws.context.destination);

    // setup a analyzer
    ws.volAnalyser = ws.context.createAnalyser();
    // ws.volAnalyser.smoothingTimeConstant = 0.3;
    ws.volAnalyser.fftSize = 1024;

    // create a buffer source node
    // ws.sourceNode = ws.context.createBufferSource();

    // connect the source to the analyser
    ws.ws.backend.source.connect(ws.volAnalyser);

    // we use the javascript node to draw at a specific interval.
    ws.analyser.connect(ws.javascriptNode);

    // and connect to destination, if you want audio
    // ws.sourceNode.connect(ws.context.destination);
    // console.log(ws, ws.volAnalyser, ws.javascriptNode);
    // console.log(ws.volCanvas.height, ws.volCanvas.width);
    getLastSegment(ws);
    ws.hasTransitioned = false;
    var counter = 0
    ws.javascriptNode.onaudioprocess = function() {
        // THIS PROCESS RUNS JAVASCRIPT ON THE STREAMING AUDIO
        // console.log("now processing", ws.ws.getCurrentTime());
        counter += 1
        // console.log(counter);
        var wsOther = wsArray.slice().filter(function(a) {return a!== ws})[0];
        if ( (ws.realBeatGrid[ws.lastSeg] - (ws.ws.getCurrentTime() * 44100)) < ws.realInterval && !ws.hasTransitioned && wsOther.isLoaded) {
            // IF THE CURRENT TIME IS LESS THAN AN INTERVAL AWAY FROM THE 
            // LAST SEG, START THE TRANSITION
            
            playPause(wsOther);
            
            // DO A RANDOMLY SELECTED TRANSITION IF AUTO-DJ SELECTED (DEFAULT OFF)
            if (autoDJ) {
                doTransition(ws, wsOther, (60 / ws.BPM) * 112000);
            };
            // ws.hasTransitioned = true;
            
            console.log("WILL XFADE TO 50 in ", (60 / ws.BPM) * 32000)
            // autoXFadeHelper(ws, wsOther);
            /*
            autoXFade(50, (60 / ws.BPM) * 32000);
            var t;
            (ws === wsLeft)? t = 100 : t = 0;
            setTimeout(function() {console.log("WILL XFADE TO ",t, " IN ", (60 / ws.BPM) * 48000); autoXFade(t, (60 / ws.BPM) * 32000)}, (60 / ws.BPM) * 48000);
            */
        }
        
 
        // get the average, bincount is fftsize / 2
        var array =  new Uint8Array(ws.analyser.frequencyBinCount);
        ws.analyser.getByteFrequencyData(array);
        
        var average = getAverageVolume(array);
        // console.log('AVERAGE ', average);
        
        // clear the current state
        ws.volCtxL.clearRect(0, 0, 20, 50);
        ws.volCtxR.clearRect(0, 0, 20, 50);

        // set the fill style
        
        
        var gradient = ws.volCtxR.createLinearGradient(0,0,20,50);
        gradient.addColorStop(0,"red");
        gradient.addColorStop(1,"yellow");
        ws.volCtxR.fillStyle=gradient;
        ws.volCtxL.fillStyle=gradient;
        

        // create the meters
        ws.volCtxL.fillRect(0,ws.volCanvasL.height,20,-(average/150)*50);
        ws.volCtxR.fillRect(0,ws.volCanvasR.height,20,-(average/150)*50);
        
        // $($(ws.HTMLtable).parents('div')[1]).css("border", "8px solid red")
        
        // UNCOMMENT THE FOLLOWING LINE TO UPDATE SHADOW RADIUS WITH VOLUME
//        var shadowSize = (average/150) * 20;
        var shadowSize = 10;
        var secondParam = "0 0 "+shadowSize.toString()+"px "+shadowSize.toString()+"px rgba(81, 203, 238, 1)";
        // console.log(average, shadowSize, secondParam);
        if (ws.isRunning) {
            if (counter % 1 == 0) {
                // console.log("COUNTER ", counter, secondParam);
                $($(ws.HTMLtable).parents('div')[1]).css("box-shadow", secondParam);
            };
        } else {
            // $($(ws.HTMLtable).parents('div')[1]).css("box-shadow", "0px 0px 0px 0px #fff")
            $($(wsLeft.HTMLtable).parents("div")[1]).removeAttr('style');
        }
        
        
    };
}

// AN ARRAY CONTAINING THE LIST OF POSSIBLE TRANSITIONS
var transitionArray = [autoXFadeHelper, autoLPHelper, autoHPHelper];

function doTransition(fromWS, toWS, duration) {
    // RANDOMLY SELECT A TRANSITION AND PERFORM IT
    
    fromWS.hasTransitioned = true;
    console.log("DO TRANSITION");
    // RANDOMLY SELECT TRANSITION
    var transition = transitionArray[Math.floor(Math.random()*transitionArray.length)];
    console.log(transition);
    // PERFORM THE TRANSITION
    transition(fromWS, toWS, duration);
}


function getAverageVolume(array) {
    var values = 0;
    var average;

    var length = array.length;

    // get all the frequency amplitudes
    for (var i = 0; i < length; i++) {
        values += array[i];
    }

    average = values / length;
    return average;
}

var rms_step = 2.5;


// ADD GRAPH AND CANVAS TO WAVESURFER INSTANCES
$(function() {
    wsRight.RMSgraph = document.querySelector("#graphRight");
    wsRight.EQCanvas = document.querySelector("canvasRight")
    wsLeft.RMSgraph = document.querySelector("#graphLeft");
    wsLeft.EQCanvas = document.querySelector("#canvasLeft");
})

// AN ARRAY CONTAINING THE WS OBJECTS
var wsArray = [wsLeft, wsRight];


function drawEQBars(ws) {
    // DRAW THE EQ BARS
    
    var cnvs = $('.visualizer')[wsArray.indexOf(ws)];
    var ctx = cnvs.getContext("2d");

    var drawVisual;
    
    var an = ws.analyser;

    console.log(ws.bufferLength);

    ctx.clearRect(0, 0, cnvs.width, cnvs.height);
    console.log("EQ", ctx, an)
    console.log(cnvs.width, ws.bufferLength, ws.dataArray);
    function draw() {
      drawVisual = requestAnimationFrame(draw);

      an.getByteFrequencyData(ws.dataArray);

      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, cnvs.width, cnvs.height);
      
         var barWidth = (cnvs.width / ws.bufferLength) * 2.5;
      var barHeight;
      var x = 0;

      for(var i = 0; i < ws.bufferLength; i++) {
        barHeight = ws.dataArray[i];

        ctx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
        ctx.fillRect(x,cnvs.height-barHeight/2,barWidth,barHeight/2);

        x += barWidth + 1;
      }
    };

    draw();
};


function draw2() {
    // DRAW THE OSCILLOSCOPE

    drawVisual = requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArrayL);
    canvasCtx = canvasCtxL

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, canvasL.width, canvasL.height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    var sliceWidth = canvasL.width * 1.0 / ws.bufferLengthL;
    var x = 0;

    for(var i = 0; i < ws.bufferLengthL; i++) {

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
    // FUNCTION TO CALL ONCE THE WAVESURFER TRACK HAS BEEN LOADED
    console.log("IS READY");
    
    // HELPER FUNCTION FOR DECK-IS-READY
    // var context = ws.backend.ac
    console.log(ws)
    ws.analysisDone = false;
    //console.log(context)
    /*
    // CONNECT GAIN NODE
    gainNode = context.createGain();
    console.log(gainNode)
    console.log(ws.backend.source)
    ws.backend.setFilter(gainNode)
    */
    // CONNECT ANALYSER
    ws.analyser.fftSize = 256;
    ws.bufferLength = ws.analyser.frequencyBinCount;
    console.log(ws.bufferLength);
    
    // FEED THE AUDIO DATA INTO THE BUFFER
    ws.dataArray = new Uint8Array(ws.bufferLength);
    ws.analyser.getByteTimeDomainData(ws.dataArray);
    ws.buffer = new Uint8Array(ws.analyser.fftSize);
    console.log(ws.bufferLength)

    // GET AN AVERAGE RMS ARRAY FOR GRAPHING PURPOSES
    // getRMS2(ws, 2.5 * 44100);
    /*
    // DRAW THE LOUDNESS GRAPH
    if (ws.ws === wavesurferLeft) {
        // draw()
        drawGraphL();
    } else {
        drawGraphR();
    }
    */
    
    // GET THE BEAT GRID
    
    analysisModule.getBPM(ws);
    getBeatArrayWorker(ws);
    var s = setInterval(function() {
        // console.log("SETINTERVAL THING", ws.analysisDone);
        if (ws.analysisDone) {
    findSegments(ws);
    
    setupAudioNodes(ws);
    
    getFirstSegment(ws);
    
    var wsOther = wsArray.slice().filter(function(a) {return a!== ws})[0];
    if (wsOther.isLoaded) {
        goToBeat(ws, ws.firstSeg - 16);
    }
    ws.hasTransitioned = false;
    
    
    
    ws.ws.on('finish', function() {
        console.log("TRACK ENDED");
        playPause(ws);
        ws.isRunning = false;
        if (playlist.length > 0) {
            var nextTrack = playlist.shift();
            loadBlobToDeck(ws, nextTrack);
        };
    });
            clearInterval(s);
            drawEQBars(ws);
        }
    }, 1000);
};


function loadBlobToDeck(ws, blob) {
    // LOAD A FILE INTO A DECK AND CHANGE THE TEXT OF THE <INPUT>
    //clearGraph(ws);
    
    // CLEAR THE WAVEFORM DISPLAY
    ws.waveformCtx.clearRect(0,0,ws.waveformCanvas.width, ws.waveformCanvas.height);
    // LOAD THE BLOB
    ws.ws.loadBlob(blob);
    // SET THE TRACK TITLE
    var trackTitle = blob['name'];
    trackTitle = trackTitle.replace(".mp3", "");
    // SET BUTTON TEXT TO TRACK TITLE
    setLoadBtnText(ws, trackTitle);
    // SEND BLOB TO CURRENT TRACK
    ws.currentTrack = blob;
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
    // FUNCTIONALITY FOR THE X-FADER
    // UPDATES THE VOLUME OF THE DECKS BASED ON THE X-FADER POSITION
    
    // X-FADER INPUT RANGE IS 0 TO 100
    // SO WE CONVERT TO VALUE BETWEEN -1 AND 1
    var xFadeValue = (document.querySelector("#xFader").value-50) / 50.0;
    
    // UPDATE THE DECK VOLUMES BASED ON CROSSOVER FUNCTION
    var leftVal = Math.sqrt(0.5 * (1 - xFadeValue));
    var rightVal = Math.sqrt(0.5 * (1 + xFadeValue));
    wsLeft.gainNode.gain.value = leftVal;
    wsRight.gainNode.gain.value = rightVal;
    console.log(leftVal, rightVal);
}

// BIND CHANGES IN THE X-FADER TO THE XFADE FUNCTION
document.querySelector("#xFader").addEventListener("change", xFade);
document.querySelector("#xFader").addEventListener("input", xFade);

$('.form-group').on('click','input[type=radio]',function() {
    $(this).closest('.form-group').find('.radio-inline, .radio').removeClass('checked');
    $(this).closest('.radio-inline, .radio').addClass('checked');
});


// FUNCTIONALITY FOR UPLOADING TO LEFT DECK
var leftDeckUpload = document.querySelector("#leftDeckUpload");
leftDeckUpload.addEventListener("change", function() {
    if (leftDeckUpload.files.length > 0) {
        //clearGraph(wsLeft)
        var track = leftDeckUpload.files[0];
        loadBlobToDeck(wsLeft, track);
    }
});

// FUNCTIONALITY FOR UPLOADING TO RIGHT DECK
var rightDeckUpload = document.querySelector("#rightDeckUpload");
rightDeckUpload.addEventListener("change", function() {
    if (rightDeckUpload.files.length > 0) {
        clearGraph(wsRight);
        var track = rightDeckUpload.files[0];
        loadBlobToDeck(wsRight, track);
    }
});

var autoMixUpload = document.querySelector("#autoMixUpload");
var playlist = [];
var f = function() {
    console.log("SET INTERVAL", wsLeft.analysisDone);
    if (wsLeft.analysisDone) {
        playPause(wsLeft);
        if (playlist.length > 0) {
            wsRight.ws.loadBlob(playlist.shift());
        };  
        wsLeft.ws.un("ready", f);
    };
};
var fTIMEOUT = function() {
    var g = setInterval(function(playlist) {
        console.log("SET INTERVAL", wsLeft.analysisDone);
        if (wsLeft.analysisDone) {
            playPause(wsLeft);
            if (playlist.length > 0) {
                wsRight.ws.loadBlob(playlist.shift());
            };  
            wsLeft.ws.un("ready", fTIMEOUT);
            clearInterval(g);
        };
    }, 2000, playlist);
};

autoMixUpload.addEventListener("change", function() {
    console.log("AUTOMIXUPLOAD");
    // $(".startButton").each(function(idx, obj) {obj.disabled = true;});
    if (autoMixUpload.files.length > 0) {
        for (var i = 0; i < autoMixUpload.files.length; i++) {
            playlist.push(autoMixUpload.files[i]);
        }
    };
    
    if (playlist.length > 0) {
        wsLeft.ws.loadBlob(playlist.shift());
        wsLeft.ws.on("ready", fTIMEOUT);
    }
    
});



function playMix() {
    // LOAD AND PLAY THE SONGS IN THE PLAYLIST
    
    $(".startButton").each(function(idx, obj) {obj.disabled = true;});
    xFader.slider('setValue', 0);
    xFade();
    if (playlist.length > 0) {        
        var nextTrack = playlist.pop();
        loadBlobToDeck(nextTrack);
    };
    if (playlist.length > 0) {
        var nextTrack = playlist.pop();
        loadBlobToDeck(nextTrack);
    };
    
}


function setLoadBtnText(ws, text) {
    
    var currentUploader = $(ws.HTMLtable).find('.custom-file-input')[0];
    var rule = '#' + currentUploader.id + '::before' + " {"  + 'content: "' + text + '"}';
    document.styleSheets[4].insertRule(rule, document.styleSheets[4].cssRules.length);
}


/*

function clearGraph(ws) {
    ws.RMS_array = [];
    ws.RMSgraph.width = ws.RMSgraph.width
}




function drawGraphL() {
    // Wrapper for drawing the left graph
    d = requestAnimationFrame(drawGraphL)
    drawGraph(wsLeft, document.querySelector("#graphLeft"))
}

function drawGraphR() {
    // Wrapper for drawing the left graph
    d = requestAnimationFrame(drawGraphR)
    drawGraph(wsRight, document.querySelector("#graphRight"))
}


function drawGraph(ws, canvas) {
    // var canvas = document.getElementById("graphLeft");
    var context = canvas.getContext("2d");
    var rms_array = ws.RMS_array;
    
    /*
    for (var x = 0.5; x < canvas.width; x += canvas.width / (ws.ws.backend.buffer.duration / rms_step) ) {
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
    }
    */
/*
    
    context.strokeStyle = "#eee";
    context.stroke();
    
    context.beginPath();
    for (var i=0; i<rms_array.length; i++) {
        var rms_pair = rms_array[i]
        var scale = canvas.width / ws.ws.backend.buffer.duration
        if (i == 0) {
            context.moveTo(scale * rms_pair[0], rms_pair[1]*-1)
        } else {
            context.lineTo(scale * rms_pair[0], rms_pair[1]*-1)
        }
    }
    context.strokeStyle = "#000";
    context.stroke();
    
    context.beginPath();
    var currentTime = ws.ws.backend.getCurrentTime();
    
    context.moveTo(currentTime * scale, 0);
    context.lineTo(currentTime * scale, canvas.height);
    
    context.stroke()
    
    
    
}

*/




// ********************************************** //
// BPM DETECTION



/*
PARAMETERS:
- THRESHOLD         [0.9]
- NEIGHBORRANGE     [25]
- ROUNDING          [100]
*/













    


var round = 1;




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


function getLastSegment(ws) {
    // FIND THE LAST SEGMENT POINT AT LEAST 8 BARS BEFORE THE END
    var bar32 = ws.realInterval * 32;
    var last = ws.ws.backend.buffer.length - bar32;
    console.log(last);
    var x = ws.segments.map(function(a) {return a[0]});
    console.log(x);
    var y = x.filter(function(b) {console.log(b); return b*ws.realInterval < last})
    console.log(y);
    ws.lastSeg = y.slice(y.length-1)[0];
    console.log(ws.lastSeg);
}

function getFirstSegment(ws) {
    // FIND THE FIRST SEGMENT POINT AT LEAST 8 BARS AFTER THE BEGINNING
    var bar32 = ws.realInterval * 32;
    var first = bar32;
    console.log(first);
    var x = ws.segments.map(function(a) {return a[0]});
    console.log(x);
    var y = x.filter(function(b) {console.log(b); return b*ws.realInterval > first})
    console.log(y);
    ws.firstSeg = y[0];
    console.log(ws.firstSeg);
}

var topScore;
var temp = [];
var counter = 0;
var peakArray;
var zoom = 0;

function setZoom(ws) {
    zoom = 0;
    // FIND AND SET MAXIMUM ZOOM
    // CANVAS APPARENTLY CANNOT EXCEED ~32400
    // KEEP ZOOMING UNTIL LIMIT IS REACHED
    console.log("SET ZOOM");
    while (ws.waveformCanvas.width < 32400) {
        console.log(zoom);
        ws.ws.zoom(zoom);
        zoom++;
    }
}

var zoomDone = false;
function setZoomTimeout(ws) {
    // FIND AND SET MAXIMUM ZOOM
    // CANVAS APPARENTLY CANNOT EXCEED ~32400
    // KEEP ZOOMING UNTIL LIMIT IS REACHED
    console.log("SET ZOOM");
    console.log(zoom);
    if (ws.waveformCanvas.width > 32400) {
        zoomDone = true;
        console.log("ZOOMDONE!!!!");
        return
    } else {
        ws.ws.zoom(zoom);
        zoom++
        setTimeout(setZoomTimeout, 0);
    }
}

function getBeatArrayWorker(ws) {
    // RETURN AN ARRAY WITH THE SAMPLE LOCATION OF EACH BEAT
    
    console.log("GET BEAT ARRAY")
    
    // FIND MAXIMUM ZOOM
    // CANVAS APPARENTLY CANNOT EXCEED ~32400
    // KEEP ZOOMING UNTIL LIMIT IS REACHED
    console.log("STEP 1");
    
    setZoom(ws);
    /*
    setZoomTimeout(ws);
    
    
    while (true) {
        if (zoomDone) {
            break
        }
    }
    */
    /*
    while (ws.waveformCanvas.width < 32400) {
        console.log(zoom);
        ws.ws.zoom(zoom);
        setTimeout(function() {zoom++;}, 0);
    }
    */
    console.log("STEP 2");
    ws.ws.zoom(zoom-2);
    
    
    ws.peakArray = analysisModule.getPeaksAtThreshold(ws);
    console.log("STEP 3");
    peakArray = ws.peakArray.filter(function(a) {return a < ws.ws.backend.buffer.length/4});
    console.log("STEP 4");
    // var peakArray = ws.peakArray.slice(0,Math.floor(ws.peakArray.length/2));
    // peakArray = peakArray.slice(Math.floor(peakArray.length/2), Math.floor(peakArray.length/2 + peakArray.length/10));

    var interval = analysisModule.BPMToInterval(ws.BPM, ws.ws.backend.buffer.sampleRate);
    ws.realInterval = interval;
    console.log(interval);
    
    var result = [];
    var c = ws.ws.backend.buffer.getChannelData(0);
    
    var worker = new Worker("static/work.js");
    worker.postMessage([c, ws.BPM, ws.peakArray]);

    worker.addEventListener('message', function(e) {
        ws.realBeatGrid = e.data;
        console.log(e.data);
        ws.analysisDone = true;
        console.log(getAverageRMS(ws));
        ws.realFirstPeak = temp[0];
        drawStuff(ws);
    }, false);
    
    // return result;
}


function drawStuff(ws) {
    var ctx = ws.waveformCtx;
    ctx.beginPath();
    //var scale = ws.waveformCanvas.width / ws.ws.backend.buffer.length;
    if (drawPeaks) {
        for (var i=0; i< ws.peakArray.length; i++) {
            var x = ws.peakArray[i];
            var y = (x / ws.ws.backend.buffer.length) * ws.waveformCanvas.width
            // console.log(i,peaksArray[i],i*scale);
            ctx.moveTo(y, 0);
            ctx.lineTo(y, ws.waveformCanvas.height);
            // Round the interval
            // peaksArray[i] = Math.floor(peaksArray[i]/100) * 100   
        }
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#fff";
        ctx.stroke();
    };

    ctx.beginPath();
    var scale = ws.waveformCanvas.width / ws.ws.backend.buffer.length;
    for (var i=0; i< ws.realBeatGrid.length; i++) {
        var x = ws.realBeatGrid[i];
        var y = (x / ws.ws.backend.buffer.length) * ws.waveformCanvas.width
        // console.log(i,peaksArray[i],i*scale);
        ctx.moveTo(y, 0);
        ctx.lineTo(y, ws.waveformCanvas.height);
        // Round the interval
        // peaksArray[i] = Math.floor(peaksArray[i]/100) * 100   
    }
    ctx.strokeStyle = "#000";
    ctx.stroke();
}

function getBeatArrayTIMEOUT(ws) {
    // RETURN AN ARRAY WITH THE SAMPLE LOCATION OF EACH BEAT
    
    console.log("GET BEAT ARRAY")
    
    // FIND MAXIMUM ZOOM
    var zoom = 0;
    ws.ws.zoom(0);
    // CANVAS APPARENTLY CANNOT EXCEED ~32400
    // KEEP ZOOMING UNTIL LIMIT IS REACHED
    while (ws.waveformCanvas.width < 32400) {
        ws.ws.zoom(zoom);
        zoom++;
    }
    ws.ws.zoom(zoom-2);
    
    
    ws.peakArray = analysisModule.getPeaksAtThreshold(ws);
    var peakArray = ws.peakArray.filter(function(a) {return a < ws.ws.backend.buffer.length/4});
    // var peakArray = ws.peakArray.slice(0,Math.floor(ws.peakArray.length/2));
    // peakArray = peakArray.slice(Math.floor(peakArray.length/2), Math.floor(peakArray.length/2 + peakArray.length/10));

    var interval = analysisModule.BPMToInterval(ws.BPM, ws.ws.backend.buffer.sampleRate);
    console.log(interval);
    
    var result = [];
    var c = ws.ws.backend.buffer.getChannelData(0);
    topScore = 0;
    var m = 0;
    
    for (var a = 0; a < (60/ws.BPM)*44100; a+=2) {
        // $('body').hide().show(0);
        for (var b = 0; b < 2; b++) {
            
            var i = a+b;
        setTimeout(function(i, ws, peakArray, interval) {
            // console.log("SET TIMEOUT THINGY", i);
        // GO THROUGH EVERY FRAME WITHIN THE DURATION OF ONE BEAT
        if (i%100 === 0) {
            console.log(i);
        }
        var score = 0;
        var n = 0;
        var temp = [];
        for (var j = i; j < ws.ws.backend.buffer.length/4; j += interval) {
            // BY FINDING WHICH BEATGRID HAS THE LOUDEST AVERAGE VOLUME
            //score += c[Math.round(j)];
            // score += findDistanceToNearestInArray(Math.round(j), peakArray)
            for (var k = -20; k < 20; k++) {
                if (peakArray.indexOf(j+k) > -1) {
                    score++;
                    break;
                }
            }
            temp.push(Math.round(j));
            n++;
        }
        score /= n;
        /*
        score = temp.filter(function(obj) {
            for (var k = -100; k < 100;) {
                if (peakArray.indexOf(obj+k) > -1) {
                    return obj
                }
            }
        }).length;
        */
        if (score > topScore) {
            console.log("NEW TOPSCORE");
            console.log("score", topScore, score, temp, n, m);
            topScore = score;
            result = temp;
        };
        m++;
            if (i + 1 > (60/ws.BPM)*44100) {
                var temp2 = [];
    for (var j = result[0]; j < ws.ws.backend.buffer.length; j += interval) {
        temp2.push(Math.round(j));
    };
    result = temp2;
    ws.realBeatGrid = result;
    ws.realInterval = interval;
    ws.realFirstPeak = result[0];
    
    var ctx = ws.waveformCtx
    ctx.beginPath();
    var scale = ws.waveformCanvas.width / ws.ws.backend.buffer.length;
    for (var i=0; i< peakArray.length; i++) {
        var x = peakArray[i];
        var y = (x / ws.ws.backend.buffer.length) * ws.waveformCanvas.width
        // console.log(i,peaksArray[i],i*scale);
        ctx.moveTo(y, 0);
        ctx.lineTo(y, ws.waveformCanvas.height);
        // Round the interval
        // peaksArray[i] = Math.floor(peaksArray[i]/100) * 100   
    }
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    
    ctx.beginPath();
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
                ws.analysisDone = true;
        }}, i*5, i, ws, peakArray, interval);
        };
    };
    
    
    // return result;
}

function findDistanceToNearestInArray(int, arr) {
    // GIVEN AN ARRAY, FIND THE DIFFERENCE BETWEEN THE INT AND
    // THE MEMBER OF THE ARRAY THAT IS CLOSEST TO IT
    var lower = arr.filter(function(a) {return a < int}).slice(-1)[0];
    var higher = arr.filter(function(a) {return a > int})[0];
    // console.log(lower, higher);
    return Math.min(int-lower, higher-int);
}

function getBeatArray2(ws) {
    console.log("GET BEAT ARRAY")
    var peakArray = analysisModule.getPeaksAtThreshold(ws);
    // NOT SURE IF THIS VALUE SHOULD BE ROUNDED OR NOT
    // INTERVAL IS THE SAMPLE DISTANCE BETWEEN BEATS
    
    //var interval = Math.round(BPMToInterval(ws.BPM, ws.ws.backend.buffer.sampleRate));
    var interval = analysisModule.BPMToInterval(ws.BPM, ws.ws.backend.buffer.sampleRate);
    console.log(interval);
    
    // FIND MAXIMUM ZOOM
    var zoom = 0;
    while (ws.waveformCanvas.width < 34000) {
        ws.ws.zoom(zoom);
        zoom++;
    }
    console.log("ZOOM", zoom);
    ws.ws.zoom(zoom-2);
    
    var result = [];
    var topScore = 0;
    var c = ws.ws.backend.buffer.getChannelData(0);
    
    for (var i=0; i < 30; i++) {
        // GO THROUGH THE FIRST 30 PEAKS, MAKE A BEATGRID,
        // AND SEE WHICH PEAK HAS THE MOST "HITS"
        var firstPeak = peakArray[i];
        // console.log(i, firstPeak);
        var peakGrid = [];
        var peakGrid2 = [];
        
        for (var j = firstPeak; j < ws.ws.backend.buffer.length; j += interval) {
            peakGrid2.push(j)
            for (var k = -10; k < 10; k++) {
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
    console.log("HI THERE");
    console.log(result);
    
    /*
    var w = 0
    var t;
    for (var i=-1000; i<1000; i++) {
        var beatArrayTemp = result.map(function(a) {return a+i});
        var s = beatArrayTemp.map(function(a) {return c[Math.round(a)]}).reduce(function(a,b) {return a+b});
        if (s > w) {
            w = s;
            t = beatArrayTemp;
        }
    }
    result = t;
    
    
    
    console.log(result, w);
    */
    
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
    var RMS = analysisModule.getRMS2(ws, ws.realInterval);
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
    var result = [];
    for (var i = N/2; i < arr.length-(N*2); i++) {
        result.push([i+N-1, Math.abs(arr[i][1]-arr[i+N][1]),
                    arr[i][1], arr[i+N][1]]);
    }
    console.log(result);
    return result;
}

function smoothArray(arr, shift) {
    var result = 1000000000;
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
        //console.log(i, arr[i]);
        var temp = [];
        temp.push(arr[i]);
        while (i < arr.length-1 && Math.abs(arr[i+1][0] - arr[i][0]) === 1) {
            // console.log(arr[i], arr[i+1]);
            i += 1;
            temp.push(arr[i])
        }
        // console.log("TEMP ", temp);
        result.push(temp);
    }
    return result;
}

function toggleAutoDJ() {
    autoDJ = !autoDJ
}

$("#autoDJButton").click(function() {
    toggleAutoDJ();
    $("#autoDJp").html("Auto-DJ is " + String(autoDJ? "ON" : "OFF"));
})

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
    var result = grouped.map(function(a) {return a[0][0]})
    result = smoothArray(result);
    
    var loudest = 0;
    var arr1 = [];
    ws.segVolArray = [];
    console.log(result);
    for (var i = 0; i < result.length; i++) {
        var r = (ws.RMSAverages[result[i]][1] - ws.RMSAverages[result[i]-N][1]);
        // console.log("THIS ", i, result[i], r);
        ws.segVolArray.push(r);
        console.log(r, ws.loudestSeg);
        if (r !== Infinity && r > loudest) {
            // console.log("r is now ", r);
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
    
    // DRAW SEGMENTS ON BOTTOM GRAPH
    var cnvs = ws.RMSgraph;
    var ctx = cnvs.getContext("2d")
    var scale = cnvs.width / ws.ws.backend.buffer.length;
    ctx.beginPath();
    // ctx.lineWidth = 10;
    for (var i = 0; i < result.length; i++) {
        console.log(i,( (ws.realBeatGrid[result[i]]) / ws.ws.backend.buffer.length) * ws.waveformCanvas.width)
        ctx.moveTo( ( (ws.realBeatGrid[result[i]]) / ws.ws.backend.buffer.length) * cnvs.width, 0);
        ctx.lineTo( ( (ws.realBeatGrid[result[i]]) / ws.ws.backend.buffer.length) * cnvs.width, cnvs.height);
    }
    ctx.strokeStyle = "#000";
    // ctx.lineWidth = 2;
    console.log("STROKE");
    ctx.stroke();
    
    ws.segments = result.map(function(obj, idx) {return [obj,ws.segVolArray[idx]]}).sort(function(a,b) {return a[0]-b[0]});
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



function goToBeat(ws, n) {
    // SEEK-AND-CENTER TO THE GIVEN BEAT IN THE TRACK
    ws.ws.seekAndCenter(ws.realBeatGrid[n] / ws.ws.backend.buffer.length);
}


$('.dial').each(function(a, obj) {console.log('yup',obj); var cnvs = $(obj).siblings('canvas')[0]; console.log(cnvs); $(cnvs).css('border', '3px solid #1c2f2f'); $(cnvs).css('border-radius', '20px')})
