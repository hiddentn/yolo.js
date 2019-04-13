import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  public gotEerror: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }
  setError(err:any) {
    this.gotEerror.emit(err);
  }
}
