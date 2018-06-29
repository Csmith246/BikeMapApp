import { Component, OnInit } from '@angular/core';
import { TabNavigationService } from '../tab-navigation.service';

import {MatTabsModule} from '@angular/material/tabs';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.css']
})
export class TabsComponent implements OnInit {

  selectedIndex: number = 1; //MAP FIRST

  constructor(
    private tabNavigationService: TabNavigationService
  ) { }

  ngOnInit() {
    this.tabNavigationService.currentTab.subscribe((tabNumber)=>{
      if(tabNumber !==-1){this.selectedIndex = tabNumber; console.log(tabNumber, "IN TABS COMPONENT");}
    });
  }



}
