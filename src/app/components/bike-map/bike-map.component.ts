import { Component, OnInit, ViewChild } from '@angular/core';
import esriLoader from 'esri-loader';

import { TabNavigationService } from '../../services/tab-navigation.service';
import { StaticDataService } from '../../services/static-data.service';

@Component({
  selector: 'bike-map',
  templateUrl: './bike-map.component.html',
  styleUrls: ['./bike-map.component.css']
})
export class BikeMapComponent implements OnInit {

  mapPortalId: String;
  portalURL: String;

  bikeService: String;
  placeLocService: String;
  addressLocService: String;

  accordianSelectedIndex: number;
  accordionData = [{
    title: "Legend",
    id: "legendWid",
    imgSrc: "../../assets/legend-icon.png"
  }, {
    title: "Basemap Gallery",
    id: "basemapWid",
    imgSrc: "../../assets/basemap-icon.png"
  }];

  selectedTrail: string = '';
  savedLyr = null;
  webMap;
  isOnScreenInfoVisible: boolean = false;


  constructor(
    private tabNavigationService: TabNavigationService,
    private staticDataService: StaticDataService
  ) { 
    this.mapPortalId = staticDataService.getMapPortalId();
    this.portalURL = staticDataService.getPortalURL();

    this.bikeService = staticDataService.getBikeServiceURL();
    this.placeLocService = staticDataService.getPlaceLocURL();
    this.addressLocService = staticDataService.getAddressLocURL();
  }


  ngOnInit() {
    esriLoader.loadCss('https://js.arcgis.com/4.7/esri/css/main.css');

    esriLoader.loadModules(["esri/config", 'esri/WebMap', 'esri/views/MapView',
      "esri/widgets/Legend", "esri/widgets/BasemapGallery", "esri/widgets/Search",
      "esri/tasks/Locator", 'esri/tasks/QueryTask', 'esri/layers/FeatureLayer', 'dojo/domReady!']) 
      .then(([esriConfig, WebMap, MapView, Legend, BasemapGallery, Search, Locator, QueryTask, FeatureLayer]) => {

        esriConfig.portalUrl = this.portalURL;

        var webMap = new WebMap({
          portalItem: {
            id: this.mapPortalId
          }
        });

        this.webMap = webMap;

        var view = new MapView({
          map: webMap,
          container: 'viewDiv'
        });
        view.ui.move("zoom", "bottom-right");


        let sources = [{
            locator: new Locator({ url: this.placeLocService }),
            singleLineFieldName: "SingleLineCityName",
            name: "NYS Place Locator",
            localSearchOptions: {
              minScale: 300000,
              distance: 50000
            },
            placeholder: "Find Place",
            exactMatch: false,
            maxResults: 3,
            maxSuggestions: 6,
            suggestionsEnabled: true,
            minSuggestCharacters: 0
          }, {
          locator: new Locator({ url: this.addressLocService }),
          singleLineFieldName: "SingleLine",
          name: "NYS Address Locator",
          localSearchOptions: {
            minScale: 300000,
            distance: 50000
          },
          placeholder: "Find Address",
          maxResults: 3,
          exactMatch: false,
          maxSuggestions: 6,
          suggestionsEnabled: true,
          minSuggestCharacters: 0
        }];


        var searchWidget = new Search({
          view: view,
          sources: [],
          suggestionsEnabled: true,
        });
        searchWidget.sources = sources;
        view.ui.add(searchWidget, {
          position: "top-right"
        });


        var legend = new Legend({
          container: 'legendWid',
          view: view,
          layerInfos: [{
            layer: webMap,
            title: "Legend"
          }]
        });


        var basemapGallery = new BasemapGallery({
          view: view,
          container: 'basemapWid'
        });


        // watch for selected trail to be updated from the Search
        this.tabNavigationService.currentTrailName.subscribe((trailName) => { 
          if(this.savedLyr){ // if a selected Layer is still on the map, remove it
            webMap.remove(this.savedLyr);
          }

          if (trailName !== "") { // default value from BehaviorSubject is ""
            let queryTask = QueryTask(this.bikeService);

            queryTask.execute({
              where: `TRAIL_NAME='${trailName}'`,
              returnGeometry: true,
              outFields: ["*"]
            }).then(res => {
              // Add selected trail's geometry to the map
              var selectedLyr = new FeatureLayer({
                source: res.features,
                geometryType: "polyline",
                objectIdField: "ObjectID",
                fields: res.fields,
                spatialReference: res.spatialReference,
                legendEnabled: false,
                renderer: {
                  type: "simple",  
                  symbol: {
                    type: "simple-line",
                    width: "7px",
                    color: "#fff842"
                  }
                }
              });

              webMap.add(selectedLyr);
              this.savedLyr = selectedLyr;

              this.setupOnScreenInfo(trailName);

              // wait until lyr is loaded into map, then zoom to it
              view.whenLayerView(selectedLyr).then(function(lyrView){
                lyrView.watch("updating", function(val){
                  if(!val){  // wait for the layer view to finish updating
                    lyrView.queryExtent().then(function(results){
                      view.goTo(results.extent);  // go to the extent of all the graphics in the layer view
                    });
                  }
                });
              });
            });
          }
        });
      })
      .catch(err => {
        // handle any errors
        console.error(err);
      });
  }

// makes sure only 1 of the onScreen buttons is active at a time
  setActiveAccord(i: number) {
    if (this.accordianSelectedIndex !== i) {
      this.accordianSelectedIndex = i;
    } else {
      this.accordianSelectedIndex = null;
    }
  }

// initializes the onScreen display, which appears when a bike path is selected
  setupOnScreenInfo(trailName){
    this.selectedTrail = trailName;
    this.isOnScreenInfoVisible = true;
  }

// called when x button hit on onScreen Info Display
  x_clickHandler(){ 
    this.webMap.remove(this.savedLyr);
    this.savedLyr = null; // important - need to set to null value here
    
    this.isOnScreenInfoVisible = false;
  }

}
