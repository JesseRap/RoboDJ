var c;
var BPM;
var peakArray;
var interval;

self.addEventListener('message', function(e) {
    self.postMessage("Got the data ABCDEF");
    self.postMessage("Another message");
    self.postMessage(e.data);
    c = e.data[0];
    BPM = e.data[1];
    peakArray = e.data[2];
    interval = ((60 * 44100) / BPM);
    self.postMessage(helper());
})


var topScore = 0;
var m = 0;

var counter = 0;

// console.log("IT IS I ", counter);

function helper() {
    for (var q = 0; q < interval; q++) {

        /*
        var progress = Math.round( (counter / ((60/ws.BPM)*44100)) * 100);
        // console.log("HM", i / (((60/ws.BPM)*44100) * 100));
        var progressMeter = (ws === wsLeft)? $(".progressMeter")[0] : $(".progressMeter")[1];
        $(progressMeter).css('visibility', 'visible');
        if (counter % 100 === 0) {
            console.log(counter, (60/ws.BPM)*44100, progress);
            progressMeter.innerHTML = "LOADING : " + progress.toString() + "%";
        };
        */
        // $($(".progressMeter")[0]).parent()[0].hide().show(0);
        // $($(progressMeter).parent()[0]).hide().show(0);
        // $($(".progressMeter")[0]).hide().show(0)

            // console.log("SET TIMEOUT THINGY", i);
        // GO THROUGH EVERY FRAME WITHIN THE DURATION OF ONE BEAT
        if (q%1000 === 0) {
            console.log("WORKER ", q);
        }
        var score = 0;
        var n = 0;
        temp = [];
        for (var j = q; j < c.length / 4; j += interval) {
            // BY FINDING WHICH BEATGRID HAS THE LOUDEST AVERAGE VOLUME
            //score += c[Math.round(j)];
            // score += findDistanceToNearestInArray(Math.round(j), peakArray)
            for (var k = -10; k <= 10; k++) {
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
    };
    return [result, "I'M DONE!!!!!!!"];
};