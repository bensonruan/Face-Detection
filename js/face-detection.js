const camera = document.getElementById('webcam');
const modelPath = 'models';
let currentStream;
let displaySize;
let convas;
let faceDetection;
let deviceIds = [];
let selectedDevice;


$("#webcam-switch").change(function () {
  if(this.checked){
    if (navigator.mediaDevices) {
      navigator.mediaDevices.enumerateDevices().then(function(devices){
        if(getDevices(devices)){
          if(deviceIds.length>1){
            selectedDevice = deviceIds[1];
          }else{
            selectedDevice = deviceIds[0];
          }
          startCamera();
        }else{
          alert('No camera detected');
        }
      });
    }else{
      alert("Fail to start webcam");
    }  
  }
  else {
    stopMediaTracks(currentStream);
    toggleContrl("model-switch", false);
    $("#cameraFlip").addClass('d-none');
  }        
});

$('#cameraFlip').click(function() {
  $.each(deviceIds, function( index, value ) {
    if(value!=selectedDevice){
      selectedDevice = value;
      startCamera();
      return false;
    }
  });
});

$("#webcam").bind("loadedmetadata", function () {
  displaySize = { width:this.scrollWidth, height: this.scrollHeight }
});

$("#model-switch").change(function () {
  if(this.checked){
    $(".progress-bar").removeClass('d-none');
    Promise.all([
      faceapi.nets.tinyFaceDetector.load(modelPath),
      faceapi.nets.faceLandmark68TinyNet.load(modelPath),
      faceapi.nets.faceRecognitionNet.load(modelPath),
      faceapi.nets.faceExpressionNet.load(modelPath),
      faceapi.nets.ageGenderNet.load(modelPath)
    ]).then(function(){
      $(".progress-bar").addClass('d-none');
      toggleContrl("detection-switch", true);
    })
  }
  else {
    toggleContrl("detection-switch", false);
  }        
});

$("#detection-switch").change(function () {
  if(this.checked){
    createCanvas();
    toggleContrl("box-switch", true);
    toggleContrl("landmarks-switch", true);
    toggleContrl("expression-switch", true);
    toggleContrl("age-gender-switch", true);
    $("#box-switch").prop('checked', true);
    $(".spinner-border").removeClass('d-none');
    startDetection();
  }
  else {
    clearInterval(faceDetection);
    toggleContrl("box-switch", false);
    toggleContrl("landmarks-switch", false);
    toggleContrl("expression-switch", false);
    toggleContrl("age-gender-switch", false);
    if(typeof canvas !== "undefined"){
      setTimeout(function() {
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
      }, 1000);
    }
  }        
});

function createCanvas(){
  if( document.getElementsByTagName("canvas").length == 0 )
  {
    canvas = faceapi.createCanvasFromMedia(camera)
    document.getElementById('webcam-container').append(canvas)
    faceapi.matchDimensions(canvas, displaySize)
  }
}

function toggleContrl(id, show){
  if(show){
    $("#"+id).prop('disabled', false);
    $("#"+id).parent().removeClass('disabled');
  }else{
    $("#"+id).prop('checked', false).change();
    $("#"+id).prop('disabled', true);
    $("#"+id).parent().addClass('disabled');
  }
}

function getDevices(mediaDevices) {
  deviceIds = [];
  let count = 0;
  mediaDevices.forEach(mediaDevice => {
    if (mediaDevice.kind === 'videoinput') {
      deviceIds.push(mediaDevice.deviceId);
      count = count + 1;
    }
  });
  if(count>1){
    $("#cameraFlip").removeClass('d-none');
  }
  return (count>0);
}

function startCamera(){
  if (typeof currentStream !== 'undefined') {
    stopMediaTracks(currentStream);
  }
  const videoConstraints = {};
  if (selectedDevice === '') {
    videoConstraints.facingMode = 'user';
  } else {
    videoConstraints.deviceId = { exact: selectedDevice};
  }
  const constraints = {
    video: videoConstraints,
    audio: false
  };
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(stream => {
      currentStream = stream;
      camera.srcObject = stream;
      toggleContrl("model-switch", true);
      return navigator.mediaDevices.enumerateDevices();
    })
    .then(getDevices)
    .catch(error => {
        alert("Fail to start webcam");
    });
}

function stopMediaTracks(stream) {
  stream.getTracks().forEach(track => {
    track.stop();
  });
}

function startDetection(){
  faceDetection = setInterval(async () => {
    const detections = await faceapi.detectAllFaces(camera, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks(true).withFaceExpressions().withAgeAndGender()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    if($("#box-switch").is(":checked")){
      faceapi.draw.drawDetections(canvas, resizedDetections)
    }
    if($("#landmarks-switch").is(":checked")){
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    }
    if($("#expression-switch").is(":checked")){
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    }
    if($("#age-gender-switch").is(":checked")){
      resizedDetections.forEach(result => {
        const { age, gender, genderProbability } = result
        new faceapi.draw.DrawTextField(
          [
            `${faceapi.round(age, 0)} years`,
            `${gender} (${faceapi.round(genderProbability)})`
          ],
          result.detection.box.bottomRight
        ).draw(canvas)
      })
    }
    if(!$(".spinner-border").hasClass('d-none')){
      $(".spinner-border").addClass('d-none')
    }
  }, 300)
}