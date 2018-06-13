import { Component, OnInit } from '@angular/core';
import esriLoader from 'esri-loader';

@Component({
  selector: 'bike-map',
  templateUrl: './bike-map.component.html',
  styleUrls: ['./bike-map.component.css']
})
export class BikeMapComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    esriLoader.loadCss('https://js.arcgis.com/4.7/esri/css/main.css');

    // first, we use Dojo's loader to require the map class
    esriLoader.loadModules(["esri/config", 'esri/WebMap', 'esri/views/MapView', 'dojo/domReady!'])
      .then(([esriConfig, WebMap, MapView]) => {
        esriConfig.portalUrl = "https://nysdot.maps.arcgis.com";
        console.log("In Promise then");
        // then we load a web map from an id
        var webMap = new WebMap({
          portalItem: {
            id: "0f19d832827948b7b8f8d647a2bdeb35"
          }
        });
        // and we show that map in a container w/ id #viewDiv
        var view = new MapView({
          map: webMap,
          container: 'viewDiv'
        });
      })
      .catch(err => {
        // handle any errors
        console.error(err);
      });
  }

}
