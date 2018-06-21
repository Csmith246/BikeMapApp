import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit {

  results: Object[] = [];

  constructor(
    private dataService: DataService
  ) { }

  ngOnInit() {
    this.dataService.currentSearchResults.subscribe((res)=>{this.results = res; console.log("IN SEARCH RESULTS", this.results);})
  }

}
