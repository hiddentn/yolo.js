import { Component, OnInit } from '@angular/core';
import { HeaderService } from '../Services/header.service';

@Component({
  selector: 'app-demos-list',
  templateUrl: './demos-list.component.html',
  styleUrls: ['./demos-list.component.css']
})
export class DemosListComponent implements OnInit {

  cards: any[];
  constructor(private headerService: HeaderService) {
    this.cards = [];
  }

  ngOnInit() {
    this.cards.push({
      title: 'Darknet Tiny',
      imgsrc: 'assets/img/yolo.jfif',
      description: "is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
      type: 'Classifier',
      name: 'darknet-tiny',
    });
    this.cards.push({
      title: 'Tiny YOLO v2',
      imgsrc: 'assets/img/yolo.jfif',
      description: "is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
      type: 'Detector',
      name: 'tiny-yolo-v2',
    });
    this.cards.push({
      title: 'Darknet Refrence',
      imgsrc: 'assets/img/yolo.jfif',
      description: "is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
      type: 'Classifier',
      name: 'darknet-refrence',
    });
    this.cards.push({
      title: 'Tiny YOLO Lite',
      imgsrc: 'assets/img/yolo.jfif',
      description: "is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
      type: 'Detector',
      name: 'tiny-yolo-lght',
    });
    this.cards.push({
      title: 'Darknet19',
      imgsrc: 'assets/img/yolo.jfif',
      description: "is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
      type: 'Classifier',
      name: 'darknet-19',
    });
  
    this.cards.push({
      title: 'Tiny YOLO v3',
      imgsrc: 'assets/img/yolo.jfif',
      description: "is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
      type: 'Detector',
      name: 'tiny-yolo-v3',
    });
 
    this.cards.push({
      title: 'YOLO v3',
      imgsrc: 'assets/img/yolo.jfif',
      description: "is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
      type: 'Detector',
      name: 'yolo-v3',
    });
  }
}
