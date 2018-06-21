import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private searchResultsSource = new BehaviorSubject([]);
  currentSearchResults = this.searchResultsSource.asObservable();

  constructor() { }

  setSearchResults(res){
    // Process results first to handle duplicates? then broadcast on Subject
    let resFinal = this._removeDuplicates(res);
    resFinal = resFinal.sort((a,b)=>{
      if(a.attributes["TRAIL_NAME"] < b.attributes["TRAIL_NAME"]) return -1;
      else if (a.attributes["TRAIL_NAME"] > b.attributes["TRAIL_NAME"]) return 1;
      else return 0;
    });
    this.searchResultsSource.next(resFinal);
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
}
