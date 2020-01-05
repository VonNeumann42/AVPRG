// var color1, color2

function initialize()
{
    var socket = io.connect();

    socket.on("countdown1", function(data){
        
        if (data.countdown > 0)
            document.getElementById("countdownText").innerHTML = "time left: " + data.countdown;
        else if (data.countdown == 0)
            document.getElementById("countdownText").innerHTML = "time left: 0";

    });

    socket.on("countdown2", function(data){
        document.getElementById("instructionText").innerHTML = "Please scan your second marker.";
        
        if (data.countdown > 0)
            document.getElementById("countdownText").innerHTML = "time left: " + data.countdown;
        else if (data.countdown == 0)
        {
            document.getElementById("countdownText").innerHTML = "time left: 0";
            window.location.href = "/piano.html";
        }
    });

    socket.on("colorCurrent", function(data)
    {
        document.getElementById("colorbox").style.backgroundColor = "rgb("+ data.R + ","+ data.G +","+ data.B +")";
    });
}