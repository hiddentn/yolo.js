import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as YOLO from '@hiddentn/yolo.js';
@Component({
  selector: 'app-classifier',
  templateUrl: './classifier.component.html',
  styleUrls: ['./classifier.component.css'],
})
export class ClassifierComponent implements OnInit {
  public colors = [
    'bg-primary',
    'bg-secondary',
    'bg-success',
    'bg-danger',
    'bg-warning',
    'bg-info',
    'bg-dark',
  ];
  public error: any;

  public images: any[];
  public selectedImageIndex: number;
  public imageToClassifiy: HTMLImageElement;
  public modelName: string;
  public classifier: any;
  public best: any;

  public classifications: any[];

  public resultText: HTMLElement;

  public modelError: boolean;
  public isModelLoading: boolean;
  public isReadyToDetect: boolean;
  public isModelLoaded: boolean;
  public isClassifing: boolean;
  public classificationExists: boolean;

  constructor(private router: Router, private route: ActivatedRoute) {
    this.images = [];
    this.images.push({ id: 0, src: 'assets/img/bird.jpg', name: 'bird' });
    this.images.push({ id: 1, src: 'assets/img/cat.jpg', name: 'cat' });
    this.images.push({ id: 2, src: 'assets/img/cat2.png', name: 'cat2' });
    this.images.push({
      id: 3,
      src: 'assets/img/citron-jardin.jpg',
      name: 'citron',
    });
    this.images.push({ id: 4, src: 'assets/img/dog.jpg', name: 'dog' });
    this.images.push({ id: 5, src: 'assets/img/eagle.jpg', name: 'eagle' });
    this.images.push({ id: 6, src: 'assets/img/horses.jpg', name: 'horses' });

    this.modelError = false;
    this.isModelLoading = false;
    this.isModelLoaded = false;
    this.isReadyToDetect = false;
    this.isClassifing = false;
    this.classificationExists = false;
    this.modelName = '';
  }

  public ngOnInit() {
    this.route.url.subscribe(() => {
      window.scrollTo(0, 0);
      const classifierName = this.route.snapshot.paramMap.get('name');
      this.isReadyToDetect = false;
      this.isModelLoaded = false;
      this.isModelLoading = false;
      this.classificationExists = false;
      if (this.modelName !== classifierName) {
        this.modelName = classifierName;
        let config: YOLO.ClassifierConfig;
        if (classifierName === 'darknet-tiny') {
          config = {
            ...YOLO.darknetTinyConfig,
            modelURL: 'assets/models/classifiers/darknet-tiny/model.json',
          };
        } else if (classifierName === 'darknet-refrence') {
          config = {
            ...YOLO.darknetRefrenceConfig,
            modelURL: 'assets/models/classifiers/darknet-reference/model.json',
          };
        } else if (classifierName === 'darknet-19') {
          config = {
            ...YOLO.darknet19Config,
            modelURL: 'assets/models/classifiers/darknet-19/model.json',
          };
        } else if (classifierName === 'darknet-9000') {
          config = {
            ...YOLO.darknetRefrenceConfig,
            modelURL: 'assets/models/classifiers/darknet-9000/model.json',
          };
        } else {
          // jus to make load disappera
          this.isModelLoading = true;
          this.modelError = true;
        }
        this.classifier = new YOLO.DarknetClassifier(config);
      } else {
        this.isReadyToDetect = true;
        this.isModelLoaded = true;
      }
    });
    this.imageToClassifiy = document.getElementById('classification-image') as HTMLImageElement;
    this.resultText = document.getElementById('result-text');
    this.selectedImageIndex = 0;
    this.imageToClassifiy.src = this.images[0].src;
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
    if (this.isReadyToDetect) {
      this.isClassifing = true;
      const p1 = performance.now();
      this.classifier.classify(this.imageToClassifiy).then((classifications) => {
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
      });
    }
  }

  public loadModel() {
    this.isModelLoading = true;
    this.classifier.load().then((loaded) => {
      this.isModelLoading = false;
      this.modelError = !loaded;
      if (loaded) {
        this.classifier.cache().then(() => {
          this.isModelLoaded = true;
          this.isReadyToDetect = true;
        });
      }
    });
  }
}
