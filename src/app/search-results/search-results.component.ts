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

  offsets: number[]; // offsets to add by
  currentPage: number; // offset to multiply by
  lastPage: number; // max pagination page
  paginationOptions: number[]; // used to create the pagination buttons
  resultsPerPage: number = 20;

  currentIndexBase: number; // 0 Initially


  constructor(
    private dataService: DataService,
    private tabNavigationService: TabNavigationService
  ) { }

  ngOnInit() {
    this.dataService.currentSearchResults.subscribe((res) => {
      this.results = res;
      if(this.results !== null && this.results.length > 0){
        this.setPagination();  
      }
    });
    this.dataService.currentSearchData.subscribe((data) => { this.currentCounty = data["county"]; this.currentRegion = data["region"]; });
  }

  highlightTrail(trailName) {
    this.tabNavigationService.setCurrentTab(1); // goto map tab
    this.tabNavigationService.setTrailName(trailName); // highlight trail
  }

  setPagination() {
    this.currentPage = 1; // set initial page to 1
    this.lastPage = Math.ceil(this.results.length / this.resultsPerPage);
    this.paginationOptions = [];
    for (let x = 1; x <= this.lastPage; x++) {
      this.paginationOptions.push(x);
    }

    this.calcNewBaseIndex()
    this.calcOffsetArr();
  }

  handlePageChange(newPage) {
    this.currentPage = newPage;
    this.calcNewBaseIndex();
    this.calcOffsetArr();
  }

  pageDown() {
    this.currentPage = Math.max(this.currentPage - 1, 1);
    this.calcNewBaseIndex();
    this.calcOffsetArr();
  }

  pageUp() {
    this.currentPage = Math.min(this.currentPage + 1, this.lastPage);
    this.calcNewBaseIndex();
    this.calcOffsetArr();
  }

  calcNewBaseIndex() {
    this.currentIndexBase = (this.currentPage - 1) * this.resultsPerPage;
  }

  calcOffsetArr(){
    console.log("In offset Arr generator");
    let maxOffsetForCurrPage:number;

    let difference = (this.currentPage * this.resultsPerPage) - this.results.length;
    if(difference < 0){ // is Negative
      maxOffsetForCurrPage = this.resultsPerPage; // full offsetArr for this page
    }else{ // is positive
      maxOffsetForCurrPage = this.resultsPerPage - difference;
    }

    this.offsets = [];
    for (let x = 0; x < maxOffsetForCurrPage; x++) {
      this.offsets.push(x);
    }
  }

}
