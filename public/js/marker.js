var marker1 = document.getElementById("marker1");
var marker2 = document.getElementById("marker2");

// translate function to move marker 1
function translateMarker1(data)
{
    // check if marker is offscreen
    if(data.cx >= 95)
    {
        // if offscreen align left and hide marker to prevent scrollbar
        marker1.style.left = "0%";
        marker1.style.visibility = "hidden";
    }
    else 
    {
        // else: move and show marker
        marker1.style.left = data.cx+"%"; 
        marker1.style.visibility = "visible";
    }
    marker1.style.top = data.cy+"%";
}

// translate function to move marker 2
function translateMarker2(data)
{
    // check if marker is offscreen
    if(data.cx >= 98)
    {
        // if offscreen align left and hide marker to prevent scrollbar
        marker2.style.left = "0%"; 
        marker2.style.visibility = "hidden";
    }
    else 
    {
        // else: move and show marker
        marker2.style.left = data.cx+"%"; 
        marker2.style.visibility = "visible";
    }
    marker2.style.top = data.cy+"%";
}