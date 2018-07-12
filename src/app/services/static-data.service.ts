import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StaticDataService {

  // Stuff to get WebMap
  private mapPortalId: String = "0f19d832827948b7b8f8d647a2bdeb35"; // THIS IS THE WEB MAP!! If you need to change it, change here
  private portalURL: String = "https://nysdot.maps.arcgis.com";

  // ArcGIS REST services
  private bikeService: String = "https://gistest3.dot.ny.gov/arcgis/rest/services/Portal_NYSBikeMap/MapServer/8";
  private placeLocator: String = "https://gisservices.its.ny.gov/arcgis/rest/services/Locators/NYPlace/GeocodeServer";
  private streetAddressLocator: String = "https://gisservices.its.ny.gov/arcgis/rest/services/Locators/Street_and_Address_Composite/GeocodeServer";

  constructor() { }

  // geeters. geet 'em boys

  getMapPortalId():String{
    return this.mapPortalId;
  }
  getPortalURL():String{
    return this.portalURL;
  }


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
