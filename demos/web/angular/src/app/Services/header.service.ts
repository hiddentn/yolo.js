import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {

  private state = new BehaviorSubject(false);
  currentState = this.state.asObservable();

  constructor() {
  }
  public collapse(){
    this.state.next(true)
  };
  public expand() {
    this.state.next(false)
  };
}
