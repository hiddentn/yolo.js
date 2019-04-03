import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ErrorComponent } from './error/error.component';
import { DemosListComponent } from "./demos-list/demos-list.component";
import { ClassifierComponent } from './classifier/classifier.component';
import { DetectorComponent } from './detector/detector.component';

const routes: Routes = [
  { path: '', component: DemosListComponent },
  { path: 'Classifier/:name', component: ClassifierComponent },
  { path: 'Detector/:name', component: DetectorComponent },

  { path: '**', component: ErrorComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
