import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as YOLO from '@hiddentn/yolo.js';
@Component({
  selector: 'app-classifier',
  templateUrl: './classifier.component.html',
  styleUrls: ['./classifier.component.css'],
})
export class ClassifierComponent implements OnInit {

  public images: any[];
  public selectedImageIndex: number;
  public imageToClassifiy: HTMLImageElement;
  public modelName:string;
  public classifier:any;

  constructor( private router: Router, private route: ActivatedRoute) {
    this.images = [];
    this.images.push({id: 0, src: 'assets/img/bird.jpg', name: 'bird' });
    this.images.push({id: 1, src: 'assets/img/cat.jpg', name: 'cat' });
    this.images.push({id: 2, src: 'assets/img/cat2.png', name: 'cat2' });
    this.images.push({id: 3, src: 'assets/img/citron-jardin.jpg', name: 'citron' });
    this.images.push({id: 4, src: 'assets/img/dog.jpg', name: 'dog' });
    this.images.push({id: 5, src: 'assets/img/eagle.jpg', name: 'eagle' });
    this.images.push({id: 6, src: 'assets/img/horses.jpg', name: 'horses' });
  }

  public ngOnInit() {
    this.route.url.subscribe((url) => {
      const classifierName = this.route.snapshot.paramMap.get('name');
      if(this.modelName === this.classifier)
      {

      }
    });
    this.imageToClassifiy = document.getElementById('classification-image') as HTMLImageElement;
    this.selectedImageIndex = 0;
    this.imageToClassifiy.src = this.images[0].src;
  }

  public changeSelectedImage(img_id: any) {
    if (img_id !== this.selectedImageIndex) {
      const selected = this.images.filter((img) => img.id === img_id);
      this.imageToClassifiy.src = selected[0].src;
      this.selectedImageIndex = selected[0].id;
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

}
