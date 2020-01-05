import numpy as np
import cv2

import time
import server
server.start()

cap = cv2.VideoCapture(0)
currentFrame = 0

# Kernel used for error correction.

kernel = np.ones((5,5),np.uint8)

frameWidth = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
frameHeight = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)

global hueLow1
hueLow1 = 0
global hueHigh1
hueHigh1 = 0
global satLow1 
satLow1 = 0
global satHigh1
satHigh1 = 0
oneCalibrated = False

global hueLow2
hueLow2 = 0
global hueHigh2
hueHigh2 = 0
global satLow2
satLow2 = 0
global satHigh2
satHigh2 = 0
twoCalibrated = False

global b1
b1 = 0
global g1
g1 = 0
global r1
r1 = 0
global b2
b2 = 0
global g2
g2 = 0
global r2
r2 = 0

# The last positions of the markers. Used for error correction.

global lastCX1
lastCX1 = 0
global lastCY1
lastCY1 = 0
global lastCX2
lastCX2 = 0
global lastCY2
lastCY2 = 0


# Positions of the black and white keys 
whiteTop = 50
whiteBot = 100
blackTop = 50
blackBot = 70

whiteArray = np.array([1,8,15,22,29,36,43,50,57,64,71,78,85,92,99])
blackArray = np.array([5,9,13,17,26,30,34,38,42,46,54,58,62,66,75,79,83,87,91,95])

countdown = 15

# Find the Centre of the the marker with the given number. The coordinates can be read and will then be used as a controll element. 
def findCentre(frame, number):
    # Converts the color value to HSV
    hsvFrame = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsvFrame)

    # Create a bit mask to find the marker and search for the centre of it. 
    if(number == 1):
        ret, sMask = cv2.threshold(s, satLow1, satHigh1, cv2.THRESH_BINARY)
        ret, hMask = cv2.threshold(h, hueLow1, hueHigh1, cv2.THRESH_BINARY)

    if(number == 2):
        ret, sMask = cv2.threshold(s, satLow2, satHigh2, cv2.THRESH_BINARY)
        ret, hMask = cv2.threshold(h, hueLow2, hueHigh2, cv2.THRESH_BINARY)

    cMask = hMask & sMask

    opening = cv2.morphologyEx(cMask, cv2.MORPH_OPEN, kernel)
    closed = cv2.morphologyEx(opening, cv2.MORPH_CLOSE, kernel)


    M = cv2.moments(closed)
    
    cx = 0
    cy = 0
    if M["m00"]:
        cx = int(M["m10"]/M["m00"])
        cy = int(M["m01"]/M["m00"])

    # Error correction. This prevents the marker from moving too far in one frame. 
    if(number == 1):
        global lastCY1
        if (cy > 10 + lastCY1):
            cy = lastCY1 + 10
        elif (cy < lastCY1 - 10):
            cy = lastCY1 - 10
        global lastCX1
        if (cx > 10 + lastCX1):
            cx = lastCX1 + 10
        elif (cx < lastCX1 - 10):
            cx = lastCX1 - 10
        lastCY1 = cy
        lastCX1 = cx
    if(number == 2):
        global lastCY2
        if (cy > 10 + lastCY2):
            cy = lastCY2 + 10
        elif (cy < lastCY2 - 10):
            cy = lastCY2 - 10
        global lastCX2
        if (cx > 10 + lastCX2):
            cx = lastCX2 + 10
        elif (cx < lastCX2 - 10):
            cx = lastCX2- 10
        lastCY2 = cy
        lastCX2 = cx

    cx = frameWidth - cx
    
    return cx, cy

#Check the centre of the current frame and use the given colour, within set deviations, as a marker color. 
def calibrate(frame, satDev, hueDev):
    frame = np.array(frame, dtype=np.uint8)
    hsvFrame = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    baseHue = hsvFrame[(int) (frameWidth / 2),(int) (frameHeight / 2),0]
    baseSat = hsvFrame[(int) (frameWidth / 2),(int) (frameHeight / 2),1]

    # RGB color values of the markers are saved and later sent to the web application for them to color the visible markers. 
    if oneCalibrated:
        global b2
        b2 = (int) (frame[(int) (frameWidth / 2),(int) (frameHeight / 2),0])
        global g2
        g2 = (int) (frame[(int) (frameWidth / 2),(int) (frameHeight / 2),1])
        global r2
        r2 = (int) (frame[(int) (frameWidth / 2),(int) (frameHeight / 2),2])
    else:
        global b1
        b1 = (int) (frame[(int) (frameWidth / 2),(int) (frameHeight / 2),0])
        global g1
        g1 = (int) (frame[(int) (frameWidth / 2),(int) (frameHeight / 2),1])
        global r1
        r1 = (int) (frame[(int) (frameWidth / 2),(int) (frameHeight / 2),2])

    hueLow = baseHue - hueDev
    hueHigh = baseHue + hueDev
    satLow = baseSat - satDev
    satHigh = baseSat + satDev

    if(hueHigh > 255):
        hueHigh = 255
    if(satHigh > 255):
        satHigh = 255

    return hueLow, hueHigh, satLow, satHigh

#Calibrate the first Marker
def setFirstMarker(satDev, hueDev, currentFrame): 
    global hueLow1
    global hueHigh1
    global satHigh1
    global satLow1
    hueLow1, hueHigh1, satLow1, satHigh1 = calibrate(currentFrame, satDev, hueDev)
    global oneCalibrated
    oneCalibrated = True
    
#Calibrate the second Marker
def setSecondMarker(satDev, hueDev, currentFrame): 
    global hueLow2
    global hueHigh2
    global satHigh2
    global satLow2
    hueLow2, hueHigh2, satLow2, satHigh2 = calibrate(currentFrame, satDev, hueDev)
    global twoCalibrated
    
    twoCalibrated = True
 
def checkWhite(cy, cx):
    # This method checks if the markers coordinates are on a black key
    v0 = 0
    if(cy < whiteBot and cy > whiteTop):
        for i, v in enumerate(whiteArray):
            if (cx <= v and cx > v0): 
                return i
            v0 = v
    return 0

def checkBlack(cy, cx, key):
    # This method checks if the markers coordinates are on a black key
    if(cy < blackBot and cy > blackTop):
        for i in range(0,20,2):
            black = blackArray[i]
            v = blackArray[i + 1]
            if (cx < v and cx > black):
                return (i // 2) + 14
    return key

while cap.isOpened():
    # This is the Main loop of the programm. This first part is the countdown, during which the markers are scanned.
    ret, frame = cap.read()
    if(countdown >= -12):
        if countdown >= 0 and (not oneCalibrated):
            server.send(message='countdown1', data={'countdown': countdown})
        if(countdown == 0):
            setFirstMarker(7, 7, frame)
        if countdown >= -11 and countdown < 0:
            server.send(message='countdown2', data={'countdown': countdown + 11})
        if countdown == -12:
            setSecondMarker(7, 7, frame)


            time.sleep(3)
            server.send(message='color1', data={'R': r1, 'G': g1, 'B': b1})
            server.send(message='color2', data={'R': r2, 'G': g2, 'B': b2})

        # Potential marker colors are read from the current camera frame. 
        b = (int) (frame[(int) (frameWidth / 2),(int) (frameHeight / 2),0])
        g = (int) (frame[(int) (frameWidth / 2),(int) (frameHeight / 2),1])
        r = (int) (frame[(int) (frameWidth / 2),(int) (frameHeight / 2),2])


        server.send(message='colorCurrent', data={'R': r, 'G': g, 'B': b})
        countdown -= 1
        time.sleep(1)
    # This is the main loop after the markers were scanned. Here the marker positions are analyzed, keys inputs are checked and the data is sent.
    else:
        currentFrame = frame
        cx, cy = findCentre(currentFrame, 1)
        cx = (int)((cx * 100) / frameWidth)
        cy = (int)((cy * 100) / frameHeight)
        key = checkBlack(cy, cx, checkWhite(cy, cx))

        server.send(message='marker1', data={'key': key, 'cx': cx, 'cy':cy})
        cx, cy = findCentre(currentFrame, 2)
        cx = (int)((cx * 100) / frameWidth)
        cy = (int)((cy * 100) / frameHeight)
        key = checkBlack(cy, cx, checkWhite(cy, cx))
        
        server.send(message='marker2', data={'key': key, 'cx': cx, 'cy':cy})

cap.release()
cv2.destroyAllWindows()

