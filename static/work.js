var c;
var BPM;
var peakArray;
var interval;

self.addEventListener('message', function(e) {
    console.log("Got the data ABCDEF");
    // self.postMessage("Another message");
    console.log(e.data);
    c = e.data[0];
    BPM = e.data[1];
    peakArray = e.data[2];
    //interval = ((60 * 44100) / BPM);
    interval = e.data[1];
    console.log("WORKER INTERVAL IS ", interval);
    self.postMessage(helper());
    self.close();
})


var topScore = 0;
var m = 0;

var counter = 0;

// console.log("IT IS I ", counter);

function findDistanceToNearestInArray(int, arr) {
    // GIVEN AN ARRAY, FIND THE DIFFERENCE BETWEEN THE INT AND
    // THE MEMBER OF THE ARRAY THAT IS CLOSEST TO IT
//    var lower = arr.filter(function(a) {return a < int}).slice(-1)[0];
//    var higher = arr.filter(function(a) {return a > int})[0];
    for (var i = 0; i < arr.length; i++) {
        var current = arr[i];
        if (current > int) {
            var higher = current,
                lower = arr[i-1];
            break;
        }
    }
    // console.log(lower, higher);
    var result = Math.min(int-lower, higher-int);
    //console.log(result);
    if (isNaN(result)) {
        // console.log("NOT A NUMBER");
    }
    return result
}

function helper() {
    for (var q = 0; q < interval; q++) {

        var score;
        // GO THROUGH EVERY FRAME WITHIN THE DURATION OF ONE BEAT
        if (q%100 === 0) {
            console.log("WORKER ", q);
            console.log(topScore);
        }
        var score = 0;
        var n = 0;
        var result;
        var temp = [];
        var peakArrayDict = {};
        peakArray.forEach(function(obj) {peakArrayDict[obj] = true});
        var j, k;
        // console.log("A ", Date.now())
        for (j = q; j < c.length; j += interval) {
            // BY FINDING WHICH BEATGRID HAS THE LOUDEST AVERAGE VOLUME
            // score += c[Math.round(j)];
//            var d = findDistanceToNearestInArray(Math.round(j), peakArray);
//            temp.push(j);
//            if (isNaN(d) || d > interval) {
//                continue;
//            }
//            score += d;
            // console.log('score ', score);
            
            var sizeOfBucket = 20;
            var a = Math.floor(sizeOfBucket * 0.5);
            for (k = -a; k <= a; k++) {
                // if (peakArray.indexOf(j+k) > -1) {
                if (peakArrayDict[Math.round(j+k)] === true) {
                    score++;
                    break;
                }
            }
            temp.push(Math.round(j));
            n++;
        };
        // console.log("B ", Date.now());
        // console.log(score);
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
        if (isNaN(score)) {
            console.log("NOOOO");
        }
        if (score > topScore) {
            console.log("NEW TOPSCORE");
            console.log("score", topScore, score, temp, n, m);
            temp = temp.map(Math.round);
            topScore = score;
            result = temp;
        };
        // console.log("C ", Date.now());
    };
    var temp2 = [];
    for (var j = result[0]; j < c.length; j += interval) {
        temp2.push(Math.round(j));
    };
    result = temp2;
    var temp3 = result;
    for (var k = -a; k < a; k++) {
        var newScore = 0;
        for (var j = 0; j < result.length; j++) {
            newScore += findDistanceToNearestInArray(result[j] + k, peakArray);
        }
        if (k === -a) {
            var newTopScore = newScore;
        }
        if (newScore < newTopScore) {
            console.log("NEW NEWTOPSCORE ", newScore);
            newTopScore = newScore;
            temp3 = result.map(function(el) {return el - k});
        }
    };
    console.log("I'M DONE!!!!!!")
    return temp3;
};