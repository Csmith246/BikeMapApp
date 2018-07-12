import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StaticDataService {

  bikeService: String = "https://gistest3.dot.ny.gov/arcgis/rest/services/Portal_NYSBikeMap/MapServer/8";

  constructor() { }

  getBikeServiceURL(): String{
    return this.bikeService;
  }

}
