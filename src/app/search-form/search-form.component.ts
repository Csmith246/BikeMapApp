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
  allRegions: Region[];
  allCounties: County[];
  selectedRegion: String = 'All';
  selectedCounty: String = 'All';

  countyService: String = 'https://gisservices.its.ny.gov/arcgis/rest/services/NYS_Civil_Boundaries/FeatureServer/3';
  regionService: String = 'https://gistest3.dot.ny.gov/arcgis/rest/services/BroadbandAvailability_REDC/MapServer/0';
  bikeService: String = 'https://gistest3.dot.ny.gov/arcgis/rest/services/Portal_NYSBikeMap/MapServer/8';

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
            this.counties = res.features.map(resItem => {
              return { name: resItem.attributes.NAME };
            });

            this.counties.sort((a: County, b: County) => {
              if (a.name < b.name)
                return -1;
              if (a.name > b.name)
                return 1;
              return 0;
            });

            this.allCounties = this.counties; // Store full county data

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

            this.allRegions = this.regions; // Store full region data

          }).catch(err => console.log(err));

      }).catch(err => {
        console.log(err);
      });
  }

  search() {
    console.log("in Search");
    esriLoader.loadModules(['esri/tasks/QueryTask', 'esri/config', 'esri/geometry/geometryEngine', "esri/tasks/support/Query"])
      .then(([QueryTask, esriConfig, geoEngine, Query]) => {
        //esriConfig.request.corsEnabledServers.push("https://gistest3.dot.ny.gov");
        // esriConfig.request.proxyUrl = "https://gistest3.dot.ny.gov/CSmith/DotNetProxy/proxy.ashx";
        // esriConfig.request.forceProxy = true;

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
            let bikeTask = new QueryTask({ url: this.bikeService });
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


  onRegionChange() {
    if (this.selectedRegion === "All") {
      this.counties = this.allCounties;
    } else {
      let countiesForRegion: String[] = this.dataService.getCountiesForRegion(this.selectedRegion).sort();

      if(countiesForRegion.indexOf(this.selectedCounty) === -1){ // Check to see if currently selected county is in new county options
        this.selectedCounty = 'All';
      }

      let countiesForRegionProper: County[] = countiesForRegion.map((county) => {
        return new County(county);
      });
      this.counties = countiesForRegionProper;
      
    }
  }


  onCountyChange() {
    if (this.counties.length === this.allCounties.length && this.selectedCounty!=='All') {
      this.selectedRegion = this.dataService.getRegionForCounty(this.selectedCounty);
      this.onRegionChange();
    }
  }

}
