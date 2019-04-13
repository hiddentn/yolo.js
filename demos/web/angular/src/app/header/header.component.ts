import { Component, OnInit } from '@angular/core';
import { HeaderService } from '../Services/header.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {

  public isHeaderCollapsed: boolean;
  constructor(private headerService: HeaderService ) {
    
  }

  public ngOnInit() {
    this.headerService.currentState.subscribe((state) => {
      this.isHeaderCollapsed = state;
    });
  }
}
