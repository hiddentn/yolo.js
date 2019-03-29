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
  classifier.load().then(
    //success
    () => {
      loadBtn.innerHTML = "Caching....";
      loadBtn.setAttribute("class", "btn btn-danger");
      classifier.cache();
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
        const data = classifier.classify(img).then(()=>{
          let p2 = performance.now(); 
          const best = data[0]
          if (best) {
              let resulttxt = document.getElementById("result-text")
              resulttxt.innerHTML = `- I think this is a <kbd class="shadow-lg" >${best.label}</kbd> with a confidence score of <kbd class="shadow-lg">${(best.score * 100).toFixed(2)}%</kbd> and it took me <kbd class="shadow-lg">${((p2-p1)/1000).toFixed(3)} second(s)</kbd> to do it. my name is <kbd class="shadow-lg">${classifier.modelName}</kbd> and i see in <kbd class="shadow-lg">${classifier.modelSize}x${classifier.modelSize}</kbd>`
              }
          console.log(data)
        })  
    } else {
        alert("You should Load the model first")

    }
   
}

(async () => {
  const darknet19 = {
    ...YOLO.darknet19Config,
    modelSize: 224,
    topK:3,
    modelURL: "../../models/Classifiers/darknet19/model.json"
  };
const tinydarknet = {
    ...YOLO.tinydarknetConfig,
    modelSize: 224,
    topK:3,
    modelURL: "../../models/Classifiers/darknettiny/model.json"
  };
  const darknetRefrence = {
    ...YOLO.darknetRefrenceConfig,
    modelSize: 256,
    topK:3,
    modelURL: "../../models/Classifiers/darknetreference/model.json"
  };
  classifier = YOLO.Classifier(darknetRefrence);
})();
