const video = document.getElementById('video')

// function startVideo() {
//   navigator.mediaDevices.getUserMedia(
//     { video: {} },
//     stream => video.srcObject = stream,
//     err => console.error(err)
//   )
// }

function startVideo() {

var constraints = {audio: false, video: true};

function successCallback(stream) {
  video.srcObject = stream;
}

function errorCallback(error) {
  console.log("navigator.getUserMedia error: ", error);
}

navigator.mediaDevices.getUserMedia(constraints)
  .then(successCallback)
  .catch(errorCallback);
}

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('models'),
  faceapi.nets.faceExpressionNet.loadFromUri('models')
]).then(startVideo)


video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height}

  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()

    let emotionResult = ""
    let emotionValue = 0.0
    if(detections.length > 0){
      detections.forEach(element => {
        for(const [key, value] of Object.entries(element.expressions)){
          if (value > emotionValue){
            emotionResult = key
            emotionValue = value
          }
        }
      })
    }
    getEmotionData(emotionResult, emotionValue)
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    //faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    //faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 100)
})
