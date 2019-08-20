# Face Detection
Face detection from webcam in browser using javascript library face-api.js

Streaming webcam on desktop computer or mobile, there is function to switch back or front cameras on mobile 

![faceapi](https://bensonruan.com/wp-content/uploads/2019/08/benson-face.gif)

## Live Demo
**[https://bensonruan.com/face-detection-using-your-webcam/](https://bensonruan.com/face-detection-using-your-webcam/)**

## Installing
Clone this repository to your local computer
``` bash
git https://github.com/bensonruan/Face-Detection.git
```
Point your localhost to the cloned root directory

Browse to http://localhost/face-detection.html 


## Start Detecting
* Turn on the Webcam switch and allowing the browser to access your webcam 
* Turn on the Load Model switch to load the face detection pre-trained models 
* Turn on the Detect Face switch to start detecting faces in your webcam

## Face Detection Features
* Bounding Box
* Face landmarks
* Face Expression
* Age
* Gender

## Notes
Please note that on iOS Safari, cameras can only be accessed via the https protocol 

## Library
* [jquery](https://code.jquery.com/jquery-3.3.1.min.js) - JQuery
* [face-api.js](https://github.com/justadudewhohacks/face-api.js) - JavaScript API for face detection and face recognition in the browser
