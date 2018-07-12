import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import esriLoader from 'esri-loader';
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

  trailName: String = '';

  searching: Boolean = false;

  constructor(
    private dataService: DataService,
    private staticDataService: StaticDataService
  ) {
    this.bikeService = staticDataService.getBikeServiceURL();
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

    function areNull(...isArgs: Boolean[]) {  // true-> 'y', false->null
      return !isArgs.reduce((acc, arg) => {
        return acc || arg;  // OR the falses until a true comes and chgs result to true
      });
    }

    function _prepTypes(myVar: Boolean, name: String) {
      if (myVar) {
        return name + "='Y'";
      } else {
        return "";
      }
    }
    let vehicles: String = '';
    let surfaces: String = '';
    let where: String = '';

    if (!areNull(this.isATV, this.isBiking, this.isHorse, this.isSkating, this.isSkiing, this.isSnowmoblie, this.isWalking)) {
      vehicles = [_prepTypes(this.isATV, 'ATV'), _prepTypes(this.isBiking, 'BIKING'),
      _prepTypes(this.isHorse, 'HORSERIDING'), _prepTypes(this.isSkating, 'SKATING'),
      _prepTypes(this.isSkiing, 'SKIING'), _prepTypes(this.isSnowmoblie, 'SNOWMOBILE'), _prepTypes(this.isWalking, 'WALKING')]
        .filter(elem => elem === '' ? false : true).join(' OR ');
      vehicles = '(' + vehicles + ')';
    }
    if (!areNull(this.isBoardwalk, this.isDirt, this.isGravel, this.isPaved, this.isStoneDust)) {
      surfaces = [_prepTypes(this.isBoardwalk, 'BOARDWALK'), _prepTypes(this.isDirt, 'DIRT'),
      _prepTypes(this.isGravel, 'GRAVEL'), _prepTypes(this.isPaved, 'PAVED'),
      _prepTypes(this.isStoneDust, 'STONEDUST')]
        .filter(elem => elem === '' ? false : true).join(' OR ');
      surfaces = '(' + surfaces + ')';
    }

    where = vehicles !== '' && surfaces !== '' ? vehicles + ' AND ' + surfaces : vehicles.concat(String(surfaces));

    if (this.trailName !== '') {
      console.log("IN TRAILNAMEEEEEEEEEEEEEEE");
      where = where === '' ? `TRAIL_NAME='${this.trailName}'` : where + ` AND (TRAIL_NAME='${this.trailName}')`
    }

    // console.log('vehicles', vehicles, '\nsurfaces', surfaces, '\nwhere', where);


    return where;
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
    this.isPaved= false;
    this.isGravel = false;
    this.isStoneDust = false;
    this.isDirt = false;
    this.isBoardwalk = false;

    this.isWalking = false;
    this.isBiking = false;
    this.isSkating = false;
    this.isATV = false;
    this.isHorse = false;
    this.isSkiing = false;
    this.isSnowmoblie = false;
    this.trailName = '';
  }

}
