let x;
let y;
let ix;
let iy;
let emotionColor;
let emotionResults = [];


var socket;
var isConnected;

function setup() {
  createCanvas(windowWidth,windowHeight);
  noStroke();
  background(0);
}

function draw() {


  fill(255,0,0,2);

  if(emotionResults.length > 0){
      if(emotionColor == 0){  // happy
        fill(0,255,0,2);
      }else if(emotionColor == 1){
        fill(255,0,255,2);
      }else if(emotionColor == 2){
        fill(0,0,255,2);
      }else if(emotionColor == 3){
        fill(255,255,0,2);
      }else if(emotionColor == 4){
        fill(0,255,255,2);
      }else if(emotionColor == 5){
        fill(255,255,255,2);
      }else if(emotionColor == 6){
        fill(255,0,0,2);
      }
  }

  x = mouseX;
  y = mouseY;
  ix = width - mouseX;
  iy = mouseY - height;
  circle(x,height/2,y);
  //fill(0,255,0,2);
  // circle(ix,height/2,iy);
  //fill(0,0,255,2);
  circle(y,height/2,x);
  //fill(255,255,0,2)
  // circle(iy,height/2,ix);

}

function touchStarted() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
}

function setoutEmotionData(emotions) {
  // send these over OSC to AbletonOSC after you've selected 8 parameters to modify

  if(emotions.length>0) 
  {
    console.log(emotions)
    emotionResults = emotions
    if(parseFloat(emotions[0])>0.6) emotionColor = 0;
    if(parseFloat(emotions[1])>0.6) emotionColor = 1;
    if(parseFloat(emotions[2])>0.6) emotionColor = 2;
    if(parseFloat(emotions[3])>0.6) emotionColor = 3;    
    if(parseFloat(emotions[4])>0.6) emotionColor = 4;    
    if(parseFloat(emotions[5])>0.6) emotionColor = 5;
    if(parseFloat(emotions[6])>0.6) emotionColor = 6;
  }

  if (isConnected) {
    if(emotions.length>0) 
    {
      socket.emit('message', ['happy', emotions[0]],'angry', emotions[1],'disgusted', emotions[2],'fear', emotions[3],'surprised', emotions[4],'neutral', emotions[5],'sad', emotions[6]);
    }


  }
}


function receiveOsc(address, value) {
  console.log("received OSC: " + address + ", " + value);
}

function sendOsc(address, value) {
  socket.emit('message', [address, value]);
}

function setupOsc(oscPortIn, oscPortOut) {
  socket = io.connect('http://127.0.0.1:8081', { port: 8081, rememberTransport: false });
  socket.on('connect', function() {
    socket.emit('config', { 
      server: { port: oscPortIn,  host: '127.0.0.1'},
      client: { port: oscPortOut, host: '127.0.0.1'}
    });
  });
  socket.on('connect', function() {
    isConnected = true;
  });
  socket.on('message', function(msg) {
    if (msg[0] == '#bundle') {
      for (var i=2; i<msg.length; i++) {
        receiveOsc(msg[i][0], msg[i].splice(1));
      }
    } else {
      receiveOsc(msg[0], msg.splice(1));
    }
  });
}