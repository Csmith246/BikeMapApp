import { Component, OnInit, ViewChild } from '@angular/core';
import esriLoader from 'esri-loader';

@Component({
  selector: 'bike-map',
  templateUrl: './bike-map.component.html',
  styleUrls: ['./bike-map.component.css']
})
export class BikeMapComponent implements OnInit {
  // @ViewChild('onScreenDiv') onScreenDiv;
  // @ViewChild('legendWidgetDiv') legendWidgetDiv;
  // @ViewChild('basemapWid') basemapWid;

  zeeMapYo;
  myView;

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

  constructor() { }


  ngAfterViewInit() {

  }


  ngOnInit() {
    esriLoader.loadCss('https://js.arcgis.com/4.7/esri/css/main.css');


    // first, we use Dojo's loader to require the map class
    esriLoader.loadModules(["esri/config", 'esri/WebMap', 'esri/views/MapView',
      "esri/widgets/Legend", "esri/widgets/BasemapGallery", "esri/widgets/Search",
      "esri/tasks/Locator", 'dojo/domReady!']) // , '../HelloWorldWidget/app/HelloWorld.js'
      .then(([esriConfig, WebMap, MapView, Legend, BasemapGallery, Search, Locator]) => { //, HelloWorld
        esriConfig.portalUrl = "https://nysdot.maps.arcgis.com";
        console.log("In Promise then");

        // then we load a web map from an id
        var webMap = new WebMap({
          portalItem: {
            id: "0f19d832827948b7b8f8d647a2bdeb35"
          }
        });

        this.zeeMapYo = webMap;

        // and we show that map in a container w/ id #viewDiv
        var view = new MapView({
          map: webMap,
          container: 'viewDiv'
        });

        view.ui.move("zoom", "bottom-right");

        this.myView = view;

        // var basemapGallery = new BasemapGallery({
        //   container: this.onScreenDiv.nativeElement
        // });

        // Add widget to the top right corner of the view
        // view.ui.add(basemapGallery, {
        //   position: "top-right"
        // });

        // var legend = new Legend({
        //   view: view,
        //   layerInfos: [{
        //     layer: webMap,
        //     title: "Legend"
        //   }]
        // });

        // view.ui.add(legend, "bottom-right");

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
        },{
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
        // Adds the search widget below other elements in
        // the top left corner of the view
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
