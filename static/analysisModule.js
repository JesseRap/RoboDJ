var analysisModule = (function() {
    
    var getRMS = function(ws, rms_array) {
        // CALCULATE THE RMS AT EACH RMS_STEP (SECONDS) INTERVAL
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
        var rms_step1 = Math.round(rms_step1);
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
    
    var threshold;

    var getPeaksAtThreshold = function(ws) {
        // RETURNS AN ARRAY OF THE INDICES OF ALL THE PEAKS ABOVE THE THRESHOLD
        console.log("UP HERE");
        console.log(ws);

        var data1 = ws.ws.backend.buffer.getChannelData(0);
        var data2 = ws.ws.backend.buffer.getChannelData(1);

        // SET THE THRESHOLD VERY HIGH
        threshold = 0.99;    

        do {
            // TRY TO GET THE PEAKS; IF THERE AREN'T ENOUGH, LOWER THE THRESHOLD
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
        } while (peaksArray.length < ws.ws.backend.buffer.duration*2);
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
    
    var countIntervalsBetweenNearbyPeaks = function(peaks) {
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
    
    var intervalToBPM = function(interval, samplerate) {
        // CONVERT A SAMPLE INTERVAL TO CORRESPONDING BPM
        var result = 60 / (interval / samplerate)
        // COERCE THE RESULT TO A VALUE BETWEEN 80 AND 160
        while (result < 80) {
            result *= 2
        }
        while (result > 160) {
            result /= 2
        }
        // ROUND INTERVALS TO NEAREST 0.1
        return Math.round(result*10) / 10
    }

    var BPMToInterval = function(BPM, samplerate) {
        // CONVERT A BPM TO THE INTERVAL BETWEEN BEATS
        return (60 * samplerate) / BPM
    }
    
    
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
    
    
    return {
        getRMS: getRMS,
        getRMS2: getRMS2,
        getPeaksAtThreshold: getPeaksAtThreshold,
        getBPM: getBPM,
        countIntervalsBetweenNearbyPeaks: countIntervalsBetweenNearbyPeaks,
        BPMToInterval: BPMToInterval
    }
    
})();