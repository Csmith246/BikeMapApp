import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import esriLoader from 'esri-loader';
import { Subject } from 'rxjs';
// Material
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
// Classes 
import { County } from '../../models/county';
import { Region } from '../../models/region';
// Services
import { DataService } from '../../services/data.service';
import { StaticDataService } from '../../services/static-data.service';


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
  stateService: String ='https://gisservices.its.ny.gov/arcgis/rest/services/NYS_Civil_Boundaries/FeatureServer/0';
  bikeService: String;

  surfaceTypes: string[] = ["Paved", "Gravel", "StoneDust", "Dirt", "Boardwalk"];
  useTypes: string[][] = [["Walking", "../../assets/walk-icon.png"],
    ["Biking", "../../assets/bike-icon.png"], ["Skating", "../../assets/skate-icon.png"],
    ["ATV", "../../assets/atv-icon.png"], ["Horse", "../../assets/horse-icon.png"],
    ["Skiing", "../../assets/ski-icon.png"], ["Snowmobile", "../../assets/snow-mobile-icon.png"]];

  SQLFromCheckboxes = {};

  resetTrigger: Subject<string> = new Subject();

  trailName: String = '';

  searching: Boolean = false;

  constructor(
    private dataService: DataService,
    private staticDataService: StaticDataService
  ) {
    // Get bike service URL
    this.bikeService = staticDataService.getBikeServiceURL();
    // Initialize SQL holding object
    this.initializeSQLHolder();
  }

  ngOnInit() {
    this.loadSelects();
  }

  initializeSQLHolder(){
    this.SQLFromCheckboxes = this.surfaceTypes.reduce((acc, currVal) => {
      acc[currVal] = "";
      return acc;
    }, {});
    this.SQLFromCheckboxes = this.useTypes.reduce((acc, currVal) => {
      acc[currVal[0]] = "";
      return acc;
    }, this.SQLFromCheckboxes);
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
            // console.log(res);
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
            // console.log(res);
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
    esriLoader.loadModules(['esri/tasks/QueryTask', "esri/tasks/support/Query"])
      .then(([QueryTask, Query]) => {

        this.searching = true; // display searching gif
        this.dataService.setSearchResults([]); // causes previous results to go away
        this.dataService.setSearchData({"region" : this.selectedRegion, "county" : this.selectedCounty}); // pass search info to the data service

        let queryTask; //= new QueryTask({ url: this.countyService });
        let query;

        let baseWhereClause: String = this.buildWhereQuery();

        

        // console.log("in Search");
        if (this.selectedCounty !== 'All') {
          queryTask = new QueryTask({ url: this.countyService });
          query = {
            outFields: ['*'],
            where: `NAME='${this.selectedCounty}'`,
            returnGeometry: true,
          };
        } else if (this.selectedCounty === 'All' && this.selectedRegion !== 'All') {
          queryTask = new QueryTask({ url: this.regionService });
          query = {
            outFields: ['*'],
            where: `DED_REGION='${this.selectedRegion}'`,
            returnGeometry: true
          };
        } else {
          queryTask = new QueryTask({ url: this.stateService });
          query = {
            outFields: ['*'],
            where: `1=1`,
            returnGeometry: true
          };
        }
        
        queryTask.execute(query)
          .then(res => {
            // console.log('GEOM', res);
            console.log('In Promise', baseWhereClause);
            let geom = res.features["0"].geometry.extent;//geoEngine.generalize(res.features["0"].geometry, 1000000000, true, "feet");
            let bikeTask = new QueryTask({ url: this.bikeService });
            let bikeQuery = {
              outFields: ['*'],
              geometry: geom,
              where: baseWhereClause,
              spatialRelationship: Query.SPATIAL_REL_CONTAINS,
              returnGeometry: true
            }
            bikeTask.execute(bikeQuery)
              .then(bikeRes => {
                // console.log(bikeRes);
                this.searching = false; // hide searching gif
                if(bikeRes.features.length !== 0){
                  this.dataService.setSearchResults(bikeRes.features);
                }else{
                  this.dataService.setNullResult();
                }

              });
          }).catch(err => console.log(err));

      });
  }


  buildWhereQuery(): String {

    let vehicles: String = '';
    let surfaces: String = '';
    let where: String = '';

    // Get SQL from CheckBox Components HERE
    let vehicleTypes = this.useTypes.map((elem)=>{ return elem[0]; });
    vehicles = vehicleTypes
      .map(elem=>{return this.SQLFromCheckboxes[elem]})
      .filter(elem=>{return elem === '' ? false: true})
      .join(' OR ');
    
    console.log("vehicle SQL", vehicles);

    surfaces = this.surfaceTypes
      .map(elem=>{return this.SQLFromCheckboxes[elem]})
      .filter(elem=>{return elem === '' ? false: true})
      .join(' OR ');
    
    console.log("surface SQL", surfaces);

    where = vehicles !== '' && surfaces !== '' ? `(${vehicles}) AND (${surfaces})` : `(${vehicles.concat(String(surfaces))})`;

    if (this.trailName !== '') {
      console.log("IN TRAILNAMEEEEEEEEEEEEEEE");
      where = where === '' ? `TRAIL_NAME='${this.trailName}'` : where + ` AND (TRAIL_NAME='${this.trailName}')`
    }

    console.log('vehicles', vehicles, '\nsurfaces', surfaces, '\nwhere', where);


    return where!=='()' ? where : ""; //need to return "" if where is "()"
  }


  onRegionChange() {
    if (this.selectedRegion === "All") {
      this.counties = this.allCounties;
    } else {
      let countiesForRegion: String[] = this.dataService.getCountiesForRegion(this.selectedRegion).sort();
      if (countiesForRegion.indexOf(this.selectedCounty) === -1) { // Check to see if currently selected county is in new county options
        this.selectedCounty = 'All';
      }
      let countiesForRegionProper: County[] = countiesForRegion.map((county) => {
        return new County(county);
      });
      this.counties = countiesForRegionProper;
    }
  }


  onCountyChange() {
    if (this.counties.length === this.allCounties.length && this.selectedCounty !== 'All') {
      this.selectedRegion = this.dataService.getRegionForCounty(this.selectedCounty);
      this.onRegionChange();
    }
  }

  resetForm(){
    this.regions = this.allRegions;  // set to all, so that all are displayed
    this.counties = this.allCounties;

    this.selectedRegion = 'All';
    this.selectedCounty = 'All';

    //Trigger reset mechanism HERE
    this.resetTrigger.next("Reset")

    this.trailName = '';
  }

  updateSQL(updateInfo){
    this.SQLFromCheckboxes[updateInfo[0]] = updateInfo[1]; //Update SQL for checkbox that emitted the event
  }

}
