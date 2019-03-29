import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {

  public onToogle: EventEmitter<null>;

  public isHeaderCollapsed: boolean;

  constructor() {
    this.isHeaderCollapsed = false;
    this.onToogle =  new EventEmitter<null>();
  }

  public toogle = () => {
    this.isHeaderCollapsed = ! this.isHeaderCollapsed;
    this.onToogle.emit();
  };
  public collapse = () => {
    this.isHeaderCollapsed = true;
    this.onToogle.emit();
  };
  public expand = () => {
    this.isHeaderCollapsed = false;
    this.onToogle.emit();
  };


}
