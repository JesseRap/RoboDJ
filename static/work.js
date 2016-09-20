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
    interval = ((60 * 44100) / BPM);
    console.log("WORKER INTERVAL IS ", interval);
    self.postMessage(helper());
    self.close();
})


var topScore = 0;
var m = 0;

var counter = 0;

// console.log("IT IS I ", counter);

function helper() {
    for (var q = 0; q < interval; q++) {

        
        // GO THROUGH EVERY FRAME WITHIN THE DURATION OF ONE BEAT
        if (q%100 === 0) {
            console.log("WORKER ", q);
        }
        var score = 0;
        var n = 0;
        temp = [];
        peakArrayDict = {};
        peakArray.forEach(function(obj) {peakArrayDict[obj] = true});
        var j, k;
        // console.log("A ", Date.now())
        for (j = q; j < c.length / 4; j += interval) {
            // BY FINDING WHICH BEATGRID HAS THE LOUDEST AVERAGE VOLUME
            //score += c[Math.round(j)];
            // score += findDistanceToNearestInArray(Math.round(j), peakArray)
            for (k = -5; k <= 5; k++) {
                // if (peakArray.indexOf(j+k) > -1) {
                if (peakArrayDict[j+k] === true) {
                    score++;
                    break;
                }
            }
            // temp.push(Math.round(j));
            temp.push(j);
            n++;
        };
        // console.log("B ", Date.now());
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
    console.log("I'M DONE!!!!!!")
    return result;
};