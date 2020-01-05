distortion.curve = makeDistortionCurve(4);
distortion.oversample = "4x";

function makeDistortionCurve(amount) {
    var n_samples = 44100,
        curve = new Float32Array(n_samples);

    var test = [];

    for (i = 0; i < n_samples; i++ ) {
        var x = i * 2 / n_samples - 1;
        curve[i] = (Math.PI + amount) * x / (Math.PI + (amount * Math.abs(x)));
    }

    return curve;
};