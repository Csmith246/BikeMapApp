import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { County } from '../models/county';
import { Region } from '../models/region';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private searchResultsSource = new BehaviorSubject([]);
  currentSearchResults = this.searchResultsSource.asObservable();

  private searchDataSource = new BehaviorSubject({});
  currentSearchData = this.searchDataSource.asObservable();


  constructor() { }


  setSearchData(data){
    this.searchDataSource.next(data);
  }

  setSearchResults(res){
    // Process results first to handle duplicates and sort
    let resFinal = this._removeDuplicates(res);
    resFinal = resFinal.sort((a,b)=>{
      if(a.attributes["TRAIL_NAME"] < b.attributes["TRAIL_NAME"]) return -1;
      else if (a.attributes["TRAIL_NAME"] > b.attributes["TRAIL_NAME"]) return 1;
      else return 0;
    });
    // broadcast results
    this.searchResultsSource.next(resFinal);
  }

  setNullResult(){
    this.searchResultsSource.next(null);
  }

  _removeDuplicates(res){
    console.log("RES in DUP: ", res);
    let dict = {};
    for (let x=0; x<res.length; x++){
      if(dict[res[x].attributes["TRAIL_NAME"]] === undefined){
        dict[res[x].attributes["TRAIL_NAME"]] = res[x];
      }
    }
    let resArr = [];
    for(let key in dict){
      if(dict.hasOwnProperty(key)){
        resArr.push(dict[key]);
      }
    }
    console.log("RESARR: ", resArr);
    return resArr;
  }

  region_county_mapping = {
    "Capital Region" : ["Albany", "Columbia", "Greene", "Rensselaer", "Saratoga", "Schenectady", "Warren", "Washington"],
    "Mohawk Valley" : ["Fulton", "Herkimer", "Montgomery", "Oneida", "Otsego", "Schoharie"],
    "Central NY": ["Cayuga", "Cortland", "Onondaga", "Oswego", "Madison"],
    "Finger Lakes": ["Genesee", "Livingston", "Monroe", "Ontario", "Orleans", "Seneca", "Yates", "Wayne", "Wyoming"],
    "Western NY": ["Cattaraugus", "Chautauqua", "Erie", "Niagara", "Allegany"],
    "Southern Tier": ["Chemung", "Schuyler", "Steuben", "Tompkins", "Tioga", "Broome", "Chenango", "Delaware"],
    "North Country": ["Clinton", "Franklin", "Hamilton", "Jefferson", "Lewis", "St Lawrence", "Essex"],
    "Mid-Hudson": ["Ulster", "Sullivan", "Orange", "Dutchess", "Putnam", "Rockland", "Westchester"],
    "New York City": ["Bronx", "New York", "Queens", "Kings", "Richmond"],
    "Long Island": ["Nassau", "Suffolk"]
  }

  getCountiesForRegion(region): String[]{
    return this.region_county_mapping[region];
  }

  getRegionForCounty(county): String{
    for (let region in this.region_county_mapping){
      if(this.region_county_mapping.hasOwnProperty(region)){
        if(this.region_county_mapping[region].indexOf(county) !== -1){
          return region;
        }
      }
    }
    return "Error: No Region Found";
  }
}
