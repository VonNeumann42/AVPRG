// add room-sound
loadImpulseResponse("room");

// function taken from Jakob Sudau
function loadImpulseResponse(name){
    var request = new XMLHttpRequest();
    request.open("GET",  ("sounds/impulseResponses/" + name + ".wav"), true);
    request.responseType = "arraybuffer";

    request.onload = function () {
        var undecodedAudio = request.response;
        context.decodeAudioData(undecodedAudio, function (buffer) {
            if (convolver) {convolver.disconnect(); }
            convolver = context.createConvolver();
            convolver.buffer = buffer;
            convolver.normalize = true;

            filter.connect(convolver);
            convolver.connect(context.destination);
        });
    };
    request.send();
}