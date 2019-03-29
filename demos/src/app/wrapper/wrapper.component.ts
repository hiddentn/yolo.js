import { Component, OnInit } from '@angular/core';
import { HeaderService } from '../Services/header.service';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-wrapper',
  templateUrl: './wrapper.component.html',
  styleUrls: ['./wrapper.component.css']
})
export class WrapperComponent implements OnInit {


  constructor(private router: Router, private route: ActivatedRoute,private headerService: HeaderService ) {
    this.router.events.pipe(filter(event => event instanceof NavigationStart))
    .subscribe((event:NavigationStart) => {
      // You only receive NavigationStart events
      if (event.url === "/") {
       this.headerService.expand();
      } else {
        this.headerService.collapse();
      }
    });
  }
  ngOnInit() {
    
  }

}
