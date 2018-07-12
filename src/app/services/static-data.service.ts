import { Injectable } from '@angular/core';
import { StringifyOptions } from 'querystring';

@Injectable({
  providedIn: 'root'
})
export class StaticDataService {

  bikeService: String = "https://gistest3.dot.ny.gov/arcgis/rest/services/Portal_NYSBikeMap/MapServer/8";
  placeLocator: String = "https://gisservices.its.ny.gov/arcgis/rest/services/Locators/NYPlace/GeocodeServer";
  streetAddressLocator: String = "https://gisservices.its.ny.gov/arcgis/rest/services/Locators/Street_and_Address_Composite/GeocodeServer";

  constructor() { }

  getBikeServiceURL(): String{
    return this.bikeService;
  }
  getPlaceLocURL():String{
    return this.placeLocator;
  }
  getAddressLocURL():String{
    return this.streetAddressLocator;
  }

}
