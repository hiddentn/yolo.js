import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ErrorService } from '../Services/error.service';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit {

  @ViewChild('trigger') triggerBtn: ElementRef;
  public error:any;
  constructor(private errorSrvice:ErrorService) { }

  ngOnInit() {
    this.errorSrvice.gotEerror.subscribe((err) => {
      this.error = err;
      this.triggerBtn.nativeElement.click();
    });
  }

}
