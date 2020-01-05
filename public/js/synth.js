// all used frequencies
var allFrequencies = [
    261,
    293,
    329,
    349,
    391,
    440,                
    493,
    
    523, 
    587,
    659,
    698,
    783,
    880,                
    987,

    277,
    311,
    369,
    415,
    466, 
    554,
    622,
    739,
    830,
    932
]

var context = new AudioContext();

// set up the audio nodes
var masterGain = context.createGain();
var convolver = context.createConvolver();
var distortion = context.createWaveShaper();
var filter = context.createBiquadFilter();

// connecting the nodes together
distortion.connect(filter);
filter.connect(convolver);
convolver.connect(masterGain);
masterGain.connect(context.destination);

// main volume
masterGain.gain.value = 10;

// 2 dimensional oscillator- and volume-arrays
var oscillators = [[], []];
var velocityVolumes = [[], []];

// fade-times
var attack = 0.0;
var hold0 = 2.0;
var hold1 = 1.25;
var release0 = 0.1;
var release1 = 0.75;

// control elements: Marker 1, Marker 2 and the piano-keys
var key1, key2;
var buttons = document.getElementsByClassName("keys");

// last pressed keys
var lastKey1 = 0;
var lastKey2 = 0;

// add an event listener to every key and create a gain for every oscillator
for (let i = 0; i < buttons.length; i++)
{
    // add eventlisteners to key i to start and stop the key-sound
    buttons[i].addEventListener('mouseover', function()
    {
        // play sounds
        startNote(i, 127)

        // colorize the pressed keys: white keys to light grey / black keys to dark grey
        if (i < 14) document.getElementById("whiteRectangle"+(i+1)).style.backgroundColor = "rgb(200,200,200)";
        else document.getElementById("blackRectangle"+(i-13)).style.backgroundColor = "rgb(50,50,50)";
    });
    buttons[i].addEventListener('mouseout', function()
    {
        // stop sounds
        stopNote(i, 127)

        // colorize the keys to default values
        if (i < 14) document.getElementById("whiteRectangle"+(i+1)).style.backgroundColor = "white";
        else document.getElementById("blackRectangle"+(i-13)).style.backgroundColor = "black";
    });
    
    // create the gains for each key-sound twice and connect them (for better piano sound)
    for (let j = 0; j < 2; j++) {
        velocityVolumes[j][i] = context.createGain();
        velocityVolumes[j][i].connect(distortion);
    }
}

function initialize()
{
    // connect with server
    var socket = io.connect();
    
    // listen on server at key marker1
    socket.on("marker1", function(data)
    {
        // get the data
        key1 = data.key;
        
        // handle sound play and stop: 0 = no key is pressed
        // if any key is pressed and actual key 1 does not match last key 1
        if (key1 != 0 && key1 != lastKey1) 
        {
            // start sound from key key1
            startNote(key1, 127);
            
            // colorize the pressed key: white keys to light grey / black keys to dark grey
            if (key1 < 15) document.getElementById("whiteRectangle"+key1).style.backgroundColor = "rgb(200,200,200)";
            else document.getElementById("blackRectangle"+(key1-14)).style.backgroundColor = "rgb(50,50,50)";
        }
        else if (key1 != 0)
        {
            // stop sound from key key1
            stopNote(key1, 127);
            
            // colorize the keys to default values
            if (key1 < 15) document.getElementById("whiteRectangle"+key1).style.backgroundColor = "white";
            else document.getElementById("blackRectangle"+(key1-14)).style.backgroundColor = "black";
        }
        
        // last key becomes actual key
        lastKey1 = key1;

        // move marker 1
        translateMarker1(data);
    });

     // listen on server at key marker1
    socket.on("marker2", function(data)
    {
        // get the data
        key2 = data.key;
        
        // handle sound play and stop: 0 = no key is pressed
        // if any key is pressed and actual key 2 does not match last key 2
        if (key2 != 0 && key2 != lastKey2) 
        {
            // start sound from key key2
            startNote(key2, 127);
            // colorize the pressed keys: white keys to light grey / black keys to dark grey
            if (key2 < 15) document.getElementById("whiteRectangle"+key2).style.backgroundColor = "rgb(200,200,200)";
            else document.getElementById("blackRectangle"+(key2-14)).style.backgroundColor = "rgb(50,50,50)";
        }
        else if (key2 != 0)
        {
            // stop sound from key key2
            stopNote(key2, 127);
            // colorize the keys to default values
            if (key2 < 15) document.getElementById("whiteRectangle"+key2).style.backgroundColor = "white";
            else document.getElementById("blackRectangle"+(key2-14)).style.backgroundColor = "black";
        }

        // last key becomes actual key
        lastKey2 = key2;
        
        // move marker 1
        translateMarker2(data);
    });

    // listen on server at key color1
    socket.on("color1", function(data)
    {
        // get the data
        r = data.R;
        g = data.G;
        b = data.B;
        
        // colorize marker 1
        marker1.style.backgroundColor = "rgb("+r+","+g+","+b+")";
    })
    
    // listen on server at key color1
    socket.on("color2", function(data)
    {
        // get the data
        r = data.R;
        g = data.G;
        b = data.B;
        
        // colorize marker 2
        marker2.style.backgroundColor = "rgb("+r+","+g+","+b+")";
    })
}

// start function to start key-sound
function startNote(note, velocity)
{   
    // create 2 osciallators for better piano sound
    for (let i = 0; i < 2; i++)
    {
        // create or replace oscillator
        oscillators[i][note] = context.createOscillator();
        oscillators[i][note].type = "sawtooth";
        
        // get the frequency from array
        oscillators[i][note].frequency.value = allFrequencies[note];
        
        // reset gain values
        velocityVolumes[i][note].gain.cancelScheduledValues(0);
        velocityVolumes[i][note].gain.setValueAtTime(0, context.currentTime);
        
        // connect the oscillator with the audio-pipeline and start the oscillator
        oscillators[i][note].connect(velocityVolumes[i][note]);
        oscillators[i][note].start();

        // fade in key-sound
        envelopeOn(velocityVolumes[i][note], velocity, attack);
    }
    // if key is still pressed, both sounds will slowly fade out at different times
    envelopeHold(velocityVolumes[0][note], velocity, attack, hold0);
    envelopeHold(velocityVolumes[1][note], velocity, attack, hold1);
}

// stop function to stop key-sound
function stopNote(note, velocity)
{
    // fade out and stop both sounds with different times
    envelopeOff(velocityVolumes[0][note], velocity, attack, release0);
    oscillators[0][note].stop(context.currentTime + attack + release0);
    envelopeOff(velocityVolumes[1][note], velocity, attack, release1);
    oscillators[1][note].stop(context.currentTime + attack + release1);
}