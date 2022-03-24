const videoElement = document.getElementsByClassName("input_video")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");
const question_label = document.getElementById("question_label");
const question_no = document.getElementById("question_no");
const verdict = document.getElementById("verdict");
const verdict_box = document.getElementById("verdict_box");
const question_box_id = document.getElementById("question_box_id");
const start_btn = document.getElementById("start_btn");
const re_run = document.getElementById("re_run");
const qstn_ans_checklist = document.getElementById("qstn_ans_checklist");


// question_box_id.classList.remove("question_box");
  // question_box_id.classList.add("invisible");
re_run.classList.add("invisible");


// defining variable
var count = 0;
var start = false;
var face_orientation = "font";
var question_bank = ["right", "left", "up"];
var status = "undefined";
var counter_start = new Date().getTime();
var count_for_call = 0;
var countdown = 0;
var question_count = 1;
var question_index;
var question;
var final_result_for_all_qstn = [];
var buffer_result_for_single_qstn = [];



console.log("start", start)

start_btn.addEventListener('click', function(e) {
  if (start == false){
    start = true;
    start_btn.classList.add("invisible");
    re_run.classList.remove("invisible");
  }
  else{
    start = false;
  }
  question_index = Math.floor(Math.random() * 3);
  question = question_bank[question_index];
  question_label.innerHTML = question;
  question_no.innerHTML = question_count;
  console.log('Click happened for: ', start);
  interval();
});

// Match question answer
const match_q_a = (given_face_orientation) => {
  buffer_result_for_single_qstn.push(given_face_orientation);
};

// make decision for every question
const make_single_decision = (question) => {
  let false_count = 0;
  var uniques = [...new Set(buffer_result_for_single_qstn)];
  if (uniques.includes(question)) {
    for (let step = 0; step < uniques.length; step++) {
      if (uniques[step] != question) {
        if (uniques[step] != "font") {
          false_count = false_count + 1;
        }
      }
    }
  } else {
    false_count = false_count + 1;
  }

  if (false_count > 0) {
    final_result_for_all_qstn.push(0);
    const div = document.createElement("div");
    div.innerHTML = `<div class="single_qstn_ans"> <span>${question}</span> <span class="wrong">Unmatched</span></div>`
    qstn_ans_checklist.appendChild (div);


  } else {
    final_result_for_all_qstn.push(1);
    const div = document.createElement("div");
    div.innerHTML = `<div class="single_qstn_ans"> <span>${question}</span> <span class="right">Matched</span></div>`
    qstn_ans_checklist.appendChild (div);
  }

  buffer_result_for_single_qstn.length = 0;
};

function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );
  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      // console.log('landmarks', landmarks)
      // find face_orientation
      if (start == true){
        find_orientation(landmarks);
      }

      // drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, {
      //   color: "#C0C0C070",
      //   lineWidth: 1,
      // });

    }
  }
  canvasCtx.restore();
}

// find face_orientation
const find_orientation = (landmark) => {
  if (landmark[1].x >= landmark[323].x) {
    count = count + 1;
    face_orientation = "left";
    // console.log("left", count)
  } else if (landmark[1].x <= landmark[93].x) {
    count = count + 1;
    face_orientation = "right";
    // console.log("right", count)
  } else if (landmark[134].y <= landmark[127].y) {
    count = count + 1;
    face_orientation = "up";
    // console.log("up", count)
  } else {
    face_orientation = "font";
    // console.log("font")
  }

  match_q_a(face_orientation);
};

const faceMesh = new FaceMesh({
  locateFile: (file) => {
    console.log("file", file);
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
  },
});
faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});
faceMesh.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({ image: videoElement });
  },
  width: 1280,
  height: 720,
});
camera.start();

// make final verdict
const final_verdict = () => {
  const right_ans = final_result_for_all_qstn.filter((x) => x == 1).length;
  if (right_ans >= 3) {
    console.log("Real");
    verdict.innerHTML = "Real";
  } else {
    console.log("Fake");
    verdict.innerHTML = "Fake";
  }
  question_box_id.classList.remove("question_box");
  question_box_id.classList.add("invisible");
  verdict_box.classList.add("question_box");
};

// generating question
const generate_qstn = () => {
  let new_index = Math.floor(Math.random() * 3);
  if (new_index == question_index) {
    if (new_index < 2) {
      new_index = new_index + 1;
    } else {
      new_index = new_index - 1;
    }
  }

  make_single_decision(question);
  question_index = new_index;
  question = question_bank[question_index];
  question_label.innerHTML = question;
  question_count = question_count + 1;
  question_no.innerHTML = question_count;
  console.log(question);
};

const interval = () => {

const checkInterval = setInterval(function () {
  if(start == true){
    if (question_count > 3){
      clearInterval(checkInterval);
      make_single_decision(question);
      final_verdict();
      return;
    }
    generate_qstn();
  }
}, 3500);
}
