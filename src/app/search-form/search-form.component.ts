import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import esriLoader from 'esri-loader';

// Class Imports
import { County } from '../county';
import { Region } from '../region';

//Services
import { DataService } from '../data.service';

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.css']
})
export class SearchFormComponent implements OnInit {

  regions: Region[] = [];
  counties: County[] = [];
  selectedRegion: String = 'All';
  selectedCounty: String = 'All';

  countyService: String = 'https://gisservices.its.ny.gov/arcgis/rest/services/NYS_Civil_Boundaries/FeatureServer/3';
  regionService: String = 'https://gistest3.dot.ny.gov/arcgis/rest/services/BroadbandAvailability_REDC/MapServer/0';

  isPaved: Boolean = false;
  isGravel: Boolean = false;
  isStoneDust: Boolean = false;
  isDirt: Boolean = false;
  isBoardwalk: Boolean = false;

  isWalking: Boolean = false;
  isBiking: Boolean = false;
  isSkating: Boolean = false;
  isATV: Boolean = false;
  isHorse: Boolean = false;
  isSkiing: Boolean = false;
  isSnowmoblie: Boolean = false;

  constructor(
    private dataService: DataService
  ) {
    
  }

  ngOnInit() {
    this.loadSelects();
  }

  loadSelects() {
    esriLoader.loadModules(['esri/tasks/QueryTask'])
      .then(([QueryTask]) => {
        let countyTask = new QueryTask({ url: this.countyService });
        let countyQuery: Object = {
          outFields: ['NAME'],
          where: "1=1"
        };
        countyTask.execute(countyQuery)
          .then(res => {
            console.log(res);
            let countiesArr: County[] = res.features.map(resItem => {
              return { name: resItem.attributes.NAME };
            });

            countiesArr.sort((a: County, b: County) => {
              if (a.name < b.name)
                return -1;
              if (a.name > b.name)
                return 1;
              return 0;
            });

            this.counties = countiesArr;

          }).catch(err => console.log(err));

        let regionTask = new QueryTask({ url: this.regionService });
        let regionQuery: Object = {
          outFields: ['DED_REGION'],
          where: "1=1"
        };
        regionTask.execute(regionQuery)
          .then(res => {
            console.log(res);
            this.regions = res.features.map(resItem => {
              return { name: resItem.attributes.DED_REGION };
            });
            this.regions.sort((a: Region, b: Region) => {
              if (a.name < b.name)
                return -1;
              if (a.name > b.name)
                return 1;
              return 0;
            });
          }).catch(err => console.log(err));

      }).catch(err => {
        console.log(err);
      });
  }

  search(){
    console.log("in Search");
    esriLoader.loadModules(['esri/tasks/QueryTask', 'esri/config', 'esri/geometry/geometryEngine', "esri/tasks/support/Query"])
      .then(([QueryTask, esriConfig, geoEngine, Query]) => {
        //esriConfig.request.corsEnabledServers.push("https://gistest3.dot.ny.gov");


        let countyTask = new QueryTask({ url: this.countyService });
        let countyQuery: Object = {
          outFields: ['*'],
          where: `NAME='${this.selectedCounty}'`,
          returnGeometry: true,
        };
        countyTask.execute(countyQuery)
          .then(countyRes => {
            console.log('COUNTY GEOM', countyRes);
            let countyGeom = geoEngine.generalize(countyRes.features["0"].geometry, 10000, true, "feet");
            let bikeTask = new QueryTask({ url: "https://gistest3.dot.ny.gov/arcgis/rest/services/Portal_NYSBikeMap/MapServer/8" });
            let bikeQuery = {
              outFields: ['*'],
              geometry: countyGeom,
              spatialRelationship: Query.SPATIAL_REL_CONTAINS,
              returnGeometry: true
            }
            bikeTask.execute(bikeQuery)
              .then(bikeRes => {
                console.log(bikeRes);

                this.dataService.setSearchResults(bikeRes.features);
              });
          }).catch(err => console.log(err));

      });
  }

}
