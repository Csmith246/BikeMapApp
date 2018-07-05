import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { TabNavigationService } from '../tab-navigation.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit {

  results: Object[] = [];

  currentRegion: String = "None";
  currentCounty: String = "None";

  constructor(
    private dataService: DataService,
    private tabNavigationService: TabNavigationService
  ) { }

  ngOnInit() {
    this.dataService.currentSearchResults.subscribe((res)=>{this.results = res; console.log("IN SEARCH RESULTS", this.results);});
    this.dataService.currentSearchData.subscribe((data)=>{this.currentCounty = data["county"]; this.currentRegion = data["region"];});
  }

  highlightTrail(trailName){
    this.tabNavigationService.setCurrentTab(1);
    this.tabNavigationService.setTrailName(trailName);
  }

}
