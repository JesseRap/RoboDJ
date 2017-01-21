# RoboDJ
Two-deck DJ mixer with crossfader and FX, with experimental "automatic DJ" functionality.

If Auto-DJ is ON, when one deck gets near the end of the track, the other deck will start in sync, and the mixer will randomly select from a set of transitions+FX and perform a natural-sounding DJ transition.

**Auto-DJ**

DJs do not play music at random, but instead carefully craft their DJ sets and preview the blending of two tracks for aesthetic quality. Our mixer can at best only make guesses as to how to create a pleasing mix. Nevertheless, the problem of automatic mix creation breaks down into the following sub-problems:

<ol>
<li>Finding the BPM</li>
<li>Finding the placement of beats, given (1)</li>
<li>Finding the placement of measures, given (2)</li>
<li>Finding the placement of sections, given (3)</li>
<li>Modeling a realistic DJ transition, given all of the above</li>
</ol>

With this information, the mixer can start one deck in sync with the other (at the start of a new measure), and can select the placement of transitions based on information about the sections (e.g. start one track when the other track hits a breakdown/quiet section).

Each of these steps presents significant challenges. In its current state, the application is relatively successful with certain types of dance music/EDM (e.g. house), and some hip-hop - i.e., music with very clear and strong beat placement. Its performance drops off quickly with other genres, but we would be content to achieve full functionality even for only a few genres, in particular those that tend to feature in DJ mixes (EDM and hip-hop).