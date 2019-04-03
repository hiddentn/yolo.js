import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { WrapperComponent } from './wrapper/wrapper.component';
import { ErrorComponent } from './error/error.component';
import { HeaderComponent } from './header/header.component';

import { HeaderService } from "./Services/header.service";
import { DemosListComponent } from './demos-list/demos-list.component';
import { ClassifierComponent } from './classifier/classifier.component';
import { DetectorComponent } from './detector/detector.component';


@NgModule({
  declarations: [
    WrapperComponent,
    ErrorComponent,
    HeaderComponent,
    DemosListComponent,
    ClassifierComponent,
    DetectorComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
  ],
  providers: [HeaderService],
  bootstrap: [WrapperComponent]
})
export class AppModule { }
