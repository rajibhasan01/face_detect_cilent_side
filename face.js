
const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

// defining variable
var count = 0;
var face_orientation = "font";
const question_bank = [
  "right",
  "left",
  "up"            
               ];

var status = "undefined";
var counter_start = new Date().getTime();
var count_for_call = 0;
var countdown = 0;
var question_count = 0;
var question_index = Math.floor((Math.random() * 3));
var question = question_bank[question_index];
var final_result_for_all_qstn = [];
var buffer_result_for_single_qstn = [];

final_result_for_all_qstn=[]; 
buffer_result_for_single_qstn=[];

console.log(question);


// Match question answer
const match_q_a = (given_face_orientation) =>{
  buffer_result_for_single_qstn.push(given_face_orientation);
}


// make decision for every question
const make_single_decision = (question) =>{
  let false_count = 0;
  var uniques = [...new Set(buffer_result_for_single_qstn)];
  if (uniques.includes(question)){
    for (let step = 0; step < uniques.length; step++) {
      if (uniques[step] != question){
        if (uniques[step] != "font"){
          false_count = false_count + 1;
        }
      }
    }

  }
  else{
    false_count = false_count + 1;
  }

  if (false_count > 0){
    final_result_for_all_qstn.push(0);
    console.log("False");
  }
  else{
    final_result_for_all_qstn.push(1);
    console.log("True");
  }

  buffer_result_for_single_qstn.length = 0;

}

function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);
  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      // console.log('landmarks', landmarks)
      // find face_orientation
      find_orientation(landmarks);
    

      drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION,{color: '#C0C0C070', lineWidth: 1});
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {color: '#FF3030'});
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, {color: '#FF3030'});
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_IRIS, {color: '#FF3030'});
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {color: '#30FF30'});
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, {color: '#30FF30'});
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_IRIS, {color: '#30FF30'});
      drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {color: '#E0E0E0'});
      drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, {color: '#E0E0E0'});
    }
  }
  canvasCtx.restore();
}


// find face_orientation
const find_orientation = (landmark) =>{

  if (landmark[1].x >= landmark[323].x){
    count = count + 1;
    face_orientation = "left";
    // console.log("left", count)
  }
  
  else if (landmark[1].x <= landmark[93].x){
    count = count + 1;
    face_orientation = "right";
    // console.log("right", count)
  }

  else if (landmark[134].y <= landmark[127].y){
    count = count + 1;
    face_orientation = "up";
    // console.log("up", count)
  }
  else{
    face_orientation = "font";
    // console.log("font")
  }

  match_q_a(face_orientation);

}

const faceMesh = new FaceMesh({locateFile: (file) => {
  console.log('file', file)
  return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
}});
faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
faceMesh.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({image: videoElement});
  },
  width: 1280,
  height: 720
});
camera.start();


// make final verdict
const final_verdict = () =>{
  const right_ans = final_result_for_all_qstn.filter(x => x==1).length;
  if (right_ans >= 3){
    console.log("Real");
  }
  else{
    console.log("Fake")
  }
}



// generating question
const generate_qstn = () =>{
  if (question_count > 3){
    clearInterval(interval);
    final_verdict();
  }
  else{
    let new_index = Math.floor((Math.random() * 3));
    if (new_index == question_index){
      if (new_index < 2){
        new_index = new_index + 1;
      }
      else{
        new_index = new_index - 1;
      }
    }

    make_single_decision(question);
    question_index = new_index;
    question = question_bank[question_index];
    question_count = question_count + 1;
    console.log(question);
  }
}

const interval = setInterval(function() {
  generate_qstn();
}, 3500);

interval()

