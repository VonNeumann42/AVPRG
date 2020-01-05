var marker1 = document.getElementById("marker1");
var marker2 = document.getElementById("marker2");

function translateMarker1(data)
{
    //console.log("marker1: " + data.cx + "x" + data.cy);
    if(data.cx >= 95)
    {
        //console.log("marker1 hidden");
        marker1.style.left = "0%";
        marker1.style.visibility = "hidden";
    }
    else 
    {
        //console.log("marker1 visible");
        marker1.style.left = data.cx+"%"; 
        marker1.style.visibility = "visible";
    }
    marker1.style.top = data.cy+"%";
}

function translateMarker2(data)
{
    //console.log("marker2: " + data.cx + "x" + data.cy);
    if(data.cx >= 98)
    {
        //console.log("marker2 hidden");
        marker2.style.left = "0%"; 
        marker2.style.visibility = "hidden";
    }
    else 
    {
        //console.log("marker2 visible");
        marker2.style.left = data.cx+"%"; 
        marker2.style.visibility = "visible";
    }
    marker2.style.top = data.cy+"%";
}