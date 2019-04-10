import { Component, OnInit } from '@angular/core';
import { HeaderService } from '../Services/header.service';
import { ModelsService } from '../Services/models.service';

@Component({
  selector: 'app-demos-list',
  templateUrl: './demos-list.component.html',
  styleUrls: ['./demos-list.component.css']
})
export class DemosListComponent implements OnInit {

  cards: any[];
  constructor(private headerService: HeaderService,private modelService: ModelsService) {
    this.cards = [];
  }

  ngOnInit() {
    this.cards = this.modelService.getAvailableDemos();
  }
}
