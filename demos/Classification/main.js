let READY_TO_CLASSIFIY = false;
let calssifier = null;
function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function(e) {
      let img = document.getElementById("classification-image");
      img.src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function loadModel() {
  let loadBtn = document.getElementById("loadBtn");

  loadBtn.innerHTML = "Loading...";
  calssifier.load().then(
    //success
    () => {
      loadBtn.innerHTML = "Caching....";
      loadBtn.setAttribute("class", "btn btn-danger");
      calssifier.cache();
      console.log('yyea')
      loadBtn.innerHTML = "Loaded";
      loadBtn.setAttribute("class", "btn btn-success");
      loadBtn.disabled = true;
      READY_TO_CLASSIFIY = true
    }
  );
}



function classifiy() {
    if (READY_TO_CLASSIFIY) {
        let resulttxt = document.getElementById("result-text")
        resulttxt.innerHTML = 'Thinking'
        let img = document.getElementById('classification-image')
        let p1 = performance.now(); 
        const data = calssifier.Classify(img)
        let p2 = performance.now(); 
        const best = data[0]
        if (best) {
            let resulttxt = document.getElementById("result-text")
            resulttxt.innerHTML = `- I think this is a <kbd>${best.label}</kbd> with a confidence score of <kbd>${(best.score * 100).toFixed(2)}%</kbd> and it took me <kbd>${((p2-p1)/1000).toFixed(3)} second(s)</kbd> to do it. my name is <kbd>${calssifier.modelName}</kbd> and i see in <kbd>${calssifier.modelSize}x${calssifier.modelSize}</kbd>`
            }
        
    } else {
        alert("You should Load the model first")
        
    }
   
}

(async () => {
  const darknet19 = {
    ...YOLO.darknet19,
    modelSize: 448,
    topK:1,
    modelURL: "../../models/Classifiers/darknet19_448/model.json"
  };
const tinydarknet = {
    ...YOLO.tinydarknet,
    modelSize: 224,
    topK:3,
    modelURL: "../../models/Classifiers/darknet_tiny_224/model.json"
  };
  const darknetRefrence = {
    ...YOLO.darknetRefrence,
    modelSize: 256,
    topK:3,
    modelURL: "../../models/Classifiers/darknetreference-nobn/model.json"
  };
  calssifier = new YOLO.DarknetClassifier(darknet19);
})();
