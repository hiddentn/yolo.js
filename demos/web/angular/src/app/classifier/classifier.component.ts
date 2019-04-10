import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DarknetClassifier } from '@hiddentn/yolo.js';
import { ModelsService } from '../Services/models.service';
import { ErrorService } from '../Services/error.service';
@Component({
  selector: 'app-classifier',
  templateUrl: './classifier.component.html',
  styleUrls: ['./classifier.component.css'],
})
export class ClassifierComponent implements OnInit , OnDestroy{

  @ViewChild('DetectionImage') imageRef: ElementRef;


  public colors = ['bg-primary', 'bg-secondary', 'bg-success', 'bg-danger', 'bg-warning', 'bg-info', 'bg-dark',];

  public classifier: DarknetClassifier;
  public imageToClassifiy: HTMLImageElement;

  //Sample images
  public selectedImageIndex: number;
  public images: any[];

  // misc 
  public modelName: string;
  public best: any;
  public classifications: any[];

  // state management stuff
  public isModelLoading: boolean;
  public isModelError: boolean;
  public isModelLoaded: boolean;

  public isModelReadyToDetect: boolean;
  public isClassifing: boolean;
  public classificationExists: boolean;

  constructor(private route: ActivatedRoute, private modelService: ModelsService, private errService: ErrorService) {
    this.modelName = '';

    this.selectedImageIndex = 0;
    this.images = [];
    this.images = this.modelService.getSampleImages()

    this.isModelLoading = false;
    this.isModelError = false;
    this.isModelLoaded = false;

    this.isModelReadyToDetect = false;
    this.isClassifing = false;
    this.classificationExists = false;
  }

  public ngOnInit() {

    const classifierName = this.route.snapshot.paramMap.get('name');
    this.modelName = classifierName;
    this.isModelReadyToDetect = false;
    this.isModelLoaded = false;
    this.isModelLoading = false;
    this.classificationExists = false;
      try {
        let config = this.modelService.getClassifierConfig(this.modelName);
        this.classifier = new DarknetClassifier(config);
      } catch (error) {
        this.errService.setError(error);
      }
     
    this.imageToClassifiy = this.imageRef.nativeElement as HTMLImageElement; 
    this.imageToClassifiy.src = this.images[this.selectedImageIndex].src;
  }
  public ngOnDestroy(): void {
    this.classifier.dispose();   
  }

  public changeSelectedImage(imgid: any) {
    if (imgid !== this.selectedImageIndex) {
      const selected = this.images.filter((img) => img.id === imgid);
      this.imageToClassifiy.src = selected[0].src;
      this.selectedImageIndex = selected[0].id;
      this.classificationExists = false;
    }
  }
  public readURL(imageInput) {
    const file: File = imageInput.files[0];
    const reader = new FileReader();
    reader.addEventListener('load', (event: any) => {
      this.imageToClassifiy.src = event.target.result;
      this.selectedImageIndex = -1;
    });
    reader.readAsDataURL(file);
  }

  public async classifiy() {
    if (this.isModelReadyToDetect) {
      this.isClassifing = true;
      const p1 = performance.now();
      this.classifier.classify(this.imageToClassifiy).then(
        // removing type just to add some new values to the array
        (classifications: any) => {
          const p2 = performance.now();
          if (classifications && classifications[0]) {
          classifications.forEach((item) => {
            item.score = (item.score * 100).toFixed(2);
            item.scoretext = `${item.score}%`;
          });
          this.best = classifications[0];
          this.best.time = ((p2 - p1) / 1000).toFixed(3);
          this.classifications = classifications;
          this.isClassifing = false;
          this.classificationExists = true;
        }
      },
      (err) =>{
        this.errService.setError(`Error Classifing image : ${err}`);
      }
      );
    }
  }

  public async loadModel() {
    this.isModelLoading = true;
    this.classifier.load().then(
      (loaded) => {
        // model successfully loaded
        this.isModelLoading = false;
        this.isModelError = !loaded;
        if (loaded) {
          this.classifier.cache().then(
            () => {
              this.isModelLoaded = true;
              this.isModelReadyToDetect = true;
            },
            (err) => {
              this.errService.setError(err)
            }
          );
        }
      },
      (err) => {
        this.errService.setError(err)
      });
  }
}
