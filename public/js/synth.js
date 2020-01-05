var _allFrequencies = [
    8.1757989156,       8.6619572180,       9.1770239974,
    9.7227182413,       10.3008611535,      10.9133822323,
    11.5623257097,      12.2498573744,      12.9782717994,
    13.7500000000,      14.5676175474,      15.4338531643,
    16.351597831287414, 17.323914436054505, 18.354047994837977,
    19.445436482630058, 20.601722307054366, 21.826764464562746,
    23.12465141947715,  24.499714748859326, 25.956543598746574,
    27.5,               29.13523509488062,  30.86770632850775,
    32.70319566257483,  34.64782887210901,  36.70809598967594,
    38.890872965260115, 41.20344461410875,  43.653528929125486,
    46.2493028389543,   48.999429497718666, 51.91308719749314,
    55,                 58.27047018976124,  61.7354126570155,
    65.40639132514966,  69.29565774421802,  73.41619197935188,
    77.78174593052023,  82.4068892282175,   87.30705785825097,
    92.4986056779086,   97.99885899543733,  103.82617439498628,
    110,                116.54094037952248, 123.47082531403103,
    130.8127826502993,  138.59131548843604, 146.8323839587038,
    155.56349186104046, 164.81377845643496, 174.61411571650194,
    184.9972113558172,  195.99771799087463, 207.65234878997256,
    220,                233.08188075904496, 246.94165062806206,
    261.6255653005986,  277.1826309768721,  293.6647679174076,
    311.1269837220809,  329.6275569128699,  349.2282314330039,
    369.9944227116344,  391.99543598174927, 415.3046975799451,
    440,                466.1637615180899,  493.8833012561241,
    523.2511306011972,  554.3652619537442,  587.3295358348151,
    622.2539674441618,  659.2551138257398,  698.4564628660078,
    739.9888454232688,  783.9908719634985,  830.6093951598903,
    880,                932.3275230361799,  987.7666025122483,
    1046.5022612023945, 1108.7305239074883, 1174.6590716696303,
    1244.5079348883237, 1318.5102276514797, 1396.9129257320155,
    1479.9776908465376, 1567.981743926997,  1661.2187903197805,
    1760,               1864.6550460723597, 1975.533205024496,
    2093.004522404789,  2217.4610478149766, 2349.31814333926,
    2489.0158697766,    2637.02045530296,   2793.825851464031,
    2959.955381693075,  3135.9634878539946, 3322.437580639561,
    3520,               3729.3100921447194, 3951.066410048992,
    4186.009044809578,  4434.922095629953,  4698.63628667852,
    4978.031739553295,  5274.04091060592,   5587.651702928062,
    5919.91076338615,   6271.926975707989,  6644.875161279122,
    7040,               7458.620184289437,  7902.132820097988,
    8372.018089619156,  8869.844191259906,  9397.272573357044,
    9956.06347910659,   10548.081821211836, 11175.303405856126,
    11839.8215267723,   12543.853951415975];

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