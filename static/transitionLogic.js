var transitionLogicModule = (function() {
    
    var nSteps1, nSteps2, nSteps3;
    
    // AN ARRAY CONTAINING THE LIST OF POSSIBLE TRANSITIONS
    var transitionArray = [autoXFadeHelper, autoLPHelper, autoHPSweepDown];
    
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
    
    var autoXFadeHelper = function(fromWS, toWS) {
        // AUTOMATES AN X-FADE FROM ONE DECK TO THE OTHER
        autoXFade(50, (60 / masterTempo) * 32000);
        // GET THE TARGET LOCATION
        // LEFT DECK = 0; RIGHT DECK = 100
        var t;
        (toWS === wsRight)? t = 100 : t = 0;

        // SET A TIMEOUT CALL TO AUTOXFADE
        setTimeout(function() {console.log("WILL XFADE TO ",t, " IN ", (60 / masterTempo) * 48000); autoXFade(t, (60 / masterTempo) * 32000)}, (60 / masterTempo) * 48000);
    }
    
    var autoHPHelper = function(fromWS, toWS) {
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

        var nSteps3 = 1000;
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
    
    return {
        doTransition: doTransition,
        autoXFade: autoXFade,
        autoHPSweepDown: autoHPSweepDown,
        autoLPSweepUp: autoLPSweepUP;
    }
    
})();