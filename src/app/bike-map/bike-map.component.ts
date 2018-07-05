import { Component, OnInit, ViewChild } from '@angular/core';
import esriLoader from 'esri-loader';
import { TabNavigationService } from '../tab-navigation.service';

@Component({
  selector: 'bike-map',
  templateUrl: './bike-map.component.html',
  styleUrls: ['./bike-map.component.css']
})
export class BikeMapComponent implements OnInit {
  // @ViewChild('onScreenDiv') onScreenDiv;
  // @ViewChild('legendWidgetDiv') legendWidgetDiv;
  // @ViewChild('basemapWid') basemapWid;

  bikeService: String = 'https://gistest3.dot.ny.gov/arcgis/rest/services/Portal_NYSBikeMap/MapServer/8';


  accordionData = [{
    title: "Legend",
    id: "legendWid",
    imgSrc: "../../assets/legend-icon.png"
  }, {
    title: "Basemap Gallery",
    id: "basemapWid",
    imgSrc: "../../assets/basemap-icon.png"
  }];

  accordianSelectedIndex: number;

  constructor(private tabNavigationService: TabNavigationService) { }


  ngAfterViewInit() {

  }


  ngOnInit() {
    esriLoader.loadCss('https://js.arcgis.com/4.7/esri/css/main.css');


    // first, we use Dojo's loader to require the map class
    esriLoader.loadModules(["esri/config", 'esri/WebMap', 'esri/views/MapView',
      "esri/widgets/Legend", "esri/widgets/BasemapGallery", "esri/widgets/Search",
      "esri/tasks/Locator", 'esri/tasks/QueryTask', 'esri/layers/FeatureLayer', 'dojo/domReady!']) // , '../HelloWorldWidget/app/HelloWorld.js'
      .then(([esriConfig, WebMap, MapView, Legend, BasemapGallery, Search, Locator, QueryTask, FeatureLayer]) => { //, HelloWorld
        esriConfig.portalUrl = "https://nysdot.maps.arcgis.com";
        console.log("In Promise then");

        // then we load a web map from an id
        var webMap = new WebMap({
          portalItem: {
            id: "0f19d832827948b7b8f8d647a2bdeb35"
          }
        });

        console.log(webMap);


        // and we show that map in a container w/ id #viewDiv
        var view = new MapView({
          map: webMap,
          container: 'viewDiv'
        });

        view.ui.move("zoom", "bottom-right");


        let sources = [{
          locator: new Locator({ url: "https://gisservices.its.ny.gov/arcgis/rest/services/Locators/Street_and_Address_Composite/GeocodeServer" }),
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
        }, {
          locator: new Locator({ url: "https://gisservices.its.ny.gov/arcgis/rest/services/Locators/NYPlace/GeocodeServer" }),
          singleLineFieldName: "SingleLineFieldName",
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
        }]


        var searchWidget = new Search({
          view: view,
          sources: sources,
          suggestionsEnabled: true,

        });
        
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

        // watch for selected trail update
        var savedLyr = null;
        this.tabNavigationService.currentTrailName.subscribe((trailName) => {
          if(savedLyr){
            webMap.remove(savedLyr);
          }

          console.log(trailName, "IN BIKE MAPPPP");
          if (trailName !== "") {
            let queryTask = QueryTask(this.bikeService);
            console.log("in good val for trailname");
            queryTask.execute({
              where: `TRAIL_NAME='${trailName}'`,
              returnGeometry: true,
              outFields: ["*"]
            }).then(res => {
              console.log(res);
              var selectedLyr = new FeatureLayer({
                source: res.features,
                geometryType: "polyline",
                objectIdField: "ObjectID",
                fields: res.fields,
                spatialReference: res.spatialReference,
                legendEnabled: false,
                renderer: {
                  type: "simple",  // autocasts as new SimpleRenderer()
                  symbol: {
                    type: "simple-line",  // autocasts as new SimpleMarkerSymbol()
                    width: "7px",
                    color: "#fff842"
                  }
                }
              });

              webMap.add(selectedLyr);
              savedLyr = selectedLyr;

              console.log(webMap);

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

  setActiveAccord(i: number) {
    console.log(i);
    if (this.accordianSelectedIndex !== i) {
      this.accordianSelectedIndex = i;
    } else {
      this.accordianSelectedIndex = null;
    }
  }

}
