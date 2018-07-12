import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TabNavigationService {
  private tabSource = new BehaviorSubject(-1);
  currentTab = this.tabSource.asObservable();
  
  private trailNameSource = new BehaviorSubject("");
  currentTrailName = this.trailNameSource.asObservable();

  constructor() { }

  setCurrentTab(tab:number){
    this.tabSource.next(tab);
    console.log(tab);
  }

  setTrailName(trailName:string){
    this.trailNameSource.next(trailName);
    console.log(trailName);
  }

}
