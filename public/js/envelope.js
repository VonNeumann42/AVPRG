// fade in sound
function envelopeOn(gainNode, velocity){
    gainNode.gain.linearRampToValueAtTime(
        0.05 + (0.33 * (velocity/127)),
        context.currentTime + attack);
}
// slow fade out
function envelopeHold(gainNode, velocity, attack, hold){
    gainNode.gain.linearRampToValueAtTime(
        0, 
        context.currentTime + attack + hold);
}
// fast fade out
function envelopeOff(gainNode, velocity, attack, release){
    gainNode.gain.cancelScheduledValues(0);
    gainNode.gain.linearRampToValueAtTime(
        0, 
        context.currentTime + attack + release);
}