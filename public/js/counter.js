function initialize()
{
    // connect with server
    var socket = io.connect();

    // listen on server at key countdown1
    socket.on("countdown1", function(data){
        
        // update the countdownText
        if (data.countdown >= 0)
            document.getElementById("countdownText").innerHTML = "time left: " + data.countdown;
    });

    // listen to server at key countdown2
    socket.on("countdown2", function(data){
        
        // update the instructionText
        document.getElementById("instructionText").innerHTML = "Please scan your second marker.";
        
        // update the countdownText
        if (data.countdown > 0)
            document.getElementById("countdownText").innerHTML = "time left: " + data.countdown;
        // if count down load mainpage piano.html
        else if (data.countdown == 0)
        {
            document.getElementById("countdownText").innerHTML = "time left: 0";
            window.location.href = "/piano.html";
        }
    });

    // listen to server at key colorCurrent to colorize the colorbox
    socket.on("colorCurrent", function(data)
    {
        document.getElementById("colorbox").style.backgroundColor = "rgb("+ data.R + ","+ data.G +","+ data.B +")";
    });
}