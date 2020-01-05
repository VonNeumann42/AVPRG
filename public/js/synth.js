var allFrequencies = [
    261,//.6255653005986,  
    293,//.6647679174076,
    329,//.6275569128699,  
    349,//.2282314330039,
    391,//.99543598174927, 
    440,                
    493,//.8833012561241,
    
    523,//.2511306011972,  
    587,//.3295358348151,
    659,//.2551138257398,  
    698,//.4564628660078,
    783,//.9908719634985,  
    880,                
    987,//.7666025122483,

    277,//.1826309768721,  
    311,//.1269837220809,
    369,//.9944227116344,  
    415,//.3046975799451,
    466,//.1637615180899,  
    554,//.3652619537442,  
    622,//.2539674441618,  
    739,//.9888454232688,  
    830,//.6093951598903,
    932//.3275230361799
]

var key1, key2;
var buttons = document.getElementsByClassName("keys");

var context = new AudioContext();
var masterGain = context.createGain();

var convolver = context.createConvolver();
var distortion = context.createWaveShaper();
var filter = context.createBiquadFilter();

var lfo = context.createOscillator();
var lfoGain = context.createGain();

var oscillators = [[], []];
var velocityVolumes = [[], []];

var attack = 0.0;
var hold0 = 2.0;
var hold1 = 1.25;
var release0 = 0.1;
var release1 = 0.75;

var lastKey1 = 0;
var lastKey2 = 0;

lfoGain.gain.value = 0.0;
lfo.frequency.value = 0.0;
lfo.start();
lfo.connect(lfoGain);

masterGain.gain.value = 10;

distortion.connect(filter);
filter.connect(convolver);
convolver.connect(masterGain);
masterGain.connect(context.destination);

for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('mouseover', function()
    {
        startNote(i, 127)

        if (i < 14) document.getElementById("whiteRectangle"+(i+1)).style.backgroundColor = "rgb(200,200,200)";
        else document.getElementById("blackRectangle"+(i-13)).style.backgroundColor = "rgb(50,50,50)";
    });
    buttons[i].addEventListener('mouseout', function()
    {
        stopNote(i, 127)

        if (i < 14) document.getElementById("whiteRectangle"+(i+1)).style.backgroundColor = "white";
        else document.getElementById("blackRectangle"+(i-13)).style.backgroundColor = "black";
    });
    
    for (let j = 0; j < 2; j++) {
        velocityVolumes[j][i] = context.createGain();
        velocityVolumes[j][i].connect(distortion);
    }
}

function initialize()
{
    for (let i = 0; i < 25; i++)
    {
        for (let j = 0; j < 2; j++)
        {
            velocityVolumes[j][i] = context.createGain();
            velocityVolumes[j][i].connect(distortion);
        }
    }

    var socket = io.connect();
    
    socket.on("marker1", function(data)
    {
        key1 = data.key;
        if (key1 != 0 && key1 != lastKey1) 
        { 
            startNote(key1, 127);
            if (key1 < 15) document.getElementById("whiteRectangle"+key1).style.backgroundColor = "rgb(200,200,200)";
            else document.getElementById("blackRectangle"+(key1-14)).style.backgroundColor = "rgb(50,50,50)";
            //console.log("submitted Key1: " + data.key + ", Pressed key1: " + key1 + ", Freq: " + allFrequencies[key1]);
        }
        else if (key1 != 0)
        {
            stopNote(key1, 127);
            if (key1 < 15) document.getElementById("whiteRectangle"+key1).style.backgroundColor = "white";
            else document.getElementById("blackRectangle"+(key1-14)).style.backgroundColor = "black";
            //console.log("Stopped key1");
        }
        lastKey1 = key1;

        translateMarker1(data);
    });

    socket.on("marker2", function(data)
    {
		key2 = data.key;
        if (key2 != 0 && key2 != lastKey2) 
        { 
            startNote(key2, 127);
            //console.log("Pressed key2: " + key2 + ", Freq: " + allFrequencies[key2]);
            if (key2 < 15) document.getElementById("whiteRectangle"+key2).style.backgroundColor = "rgb(200,200,200)";
            else document.getElementById("blackRectangle"+(key2-14)).style.backgroundColor = "rgb(50,50,50)";
        }
        else if (key2 != 0)
        {
            stopNote(key2, 127);
            //console.log("Stopped key2");
            if (key2 < 15) document.getElementById("whiteRectangle"+key2).style.backgroundColor = "white";
            else document.getElementById("blackRectangle"+(key2-14)).style.backgroundColor = "black";
        }
        lastKey2 = key2;
        
        translateMarker2(data);
    });

    socket.on("color1", function(data)
    {
        // console.log("coloring Marker 1")
        r = data.R;
        g = data.G;
        b = data.B;
        marker1.style.backgroundColor = "rgb("+r+","+g+","+b+")";
    })
    socket.on("color2", function(data)
    {
        // console.log("coloring Marker 2")
        r = data.R;
        g = data.G;
        b = data.B;
        marker2.style.backgroundColor = "rgb("+r+","+g+","+b+")";
    })
}

function startNote(note, velocity)
{
    var oscTypes = ["sawtooth", "sawtooth"]; // sine, square, sawtooth, triangle

    for (let i = 0; i < 2; i++)
    {
        oscillators[i][note] = context.createOscillator();
        oscillators[i][note].type = oscTypes[i];
        oscillators[i][note].frequency.value = allFrequencies[note];
        if (i === 1) {oscillators[i][note].detune.value = 0; }

        velocityVolumes[i][note].gain.cancelScheduledValues(0);
        velocityVolumes[i][note].gain.setValueAtTime(0, context.currentTime);

        lfoGain.connect(velocityVolumes[i][note].gain);
        oscillators[i][note].connect(velocityVolumes[i][note]);
        oscillators[i][note].start();

        envelopeOn(velocityVolumes[i][note], velocity, attack);
    }
    
    envelopeHold(velocityVolumes[0][note], velocity, attack, hold0);
    // oscillators[0][note].stop(context.currentTime + attack + hold0);
    envelopeHold(velocityVolumes[1][note], velocity, attack, hold1);
    // oscillators[1][note].stop(context.currentTime + attack + hold1);

    console.log("started note: " + note)
}

function stopNote(note, velocity)
{
    envelopeOff(velocityVolumes[0][note], velocity, attack, release0);
    //if (oscillators[0][note])
        oscillators[0][note].stop(context.currentTime + attack + release0);
    envelopeOff(velocityVolumes[1][note], velocity, attack, release1);
    //if (oscillators[0][note])
        oscillators[1][note].stop(context.currentTime + attack + release1);
}
