import { Component, OnInit } from '@angular/core';
// @ts-ignore
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { PrecinctVoterData } from './models/precinct-voter-data.model';
import { Precinct } from './models/precinct.model';
import { MapDataService } from './services/map-data.service';
import { MapColumn } from './models/mapColumn';
import { DistrictAPrecincts } from './models/districtAprecincts';

/***
 * TODO:
 * 1) prompt for date of election, race, pull results from sec of state office static pages
 * 2) refactor logic, cleanup
 * 3) remove API key (don't really care)
 * 4)
 */

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  map: L.Map;
  markers: L.Marker[] = [];
  total: PrecinctVoterData;
  public selectedColumn: MapColumn;
  public selectedColumnOption: string;
  constructor(private http: HttpClient, private dataService: MapDataService) {}
  public precincts: Precinct[] = [];
  precintGeoJson: L.GeoJSON<any>;

  private dataLoaded: BehaviorSubject<boolean> = new BehaviorSubject(false);
  ngOnInit() {
    this.init();
  }

  init() {
    this.dataLoaded.subscribe((e) => {
      if (e) {
        this.map = new L.Map('map', {
          layers: [
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              subdomains: ['a', 'b', 'c'],
              maxZoom: 19,
            }),
          ],
          center: new L.LatLng(29.97, -90.06),
          zoomControl: false,
          zoom: 12,
        });
        this.setPrecinctLayers();
      }
    });
    this.loadPrecinctData();
  }

  public precinctUrl: string =
    'https://opendata.arcgis.com/datasets/ca0f4261673541d798551f5cddc54bd6_0.geojson';

  //TODO remove
  public sheetUrl = '1syXU60xTSCtHoePb7Yobh892SfdNTlYp1zuxyLPOtQg';

  drawMap() {
    var selectedColumn = this.selectedColumn;
    var prs = this.precincts;
    let eachFunc = function (f: any, l: any) {
      const precinctId = f.properties.PRECINCTID;
      let pr = {} as Precinct;
      if (prs[precinctId] != null) {
        pr = prs[precinctId];
      }
      pr.feature = f;
      pr.layer = l;
      if (DistrictAPrecincts.includes(precinctId)) {
        //style layer & bind popup
        pr.layer['options'].weight = 1;
        let amount: any = pr.data[selectedColumn.id];
        if (selectedColumn.columnType === 'header') {
          return;
        }

        let red = 255;
        let green = 0;
        let value: number = amount;
        if (selectedColumn.columnType === 'total') {
          value = amount / selectedColumn.max;
          if (value > 1) {
            value = 1;
          }
        } else if (selectedColumn.columnType === 'average') {
          value = +amount.slice(0, -1) / 100;
        }
        if (value >= 0.5) {
          let diff = 1 - value;
          red = 510 * diff;
          green = 255;
        } else {
          green = 510 * value;
          red = 255;
        }
        console.log('Precint val:' + value);
        pr.layer['options'].fillColor =
          'rgb(' + Math.round(red) + ',' + Math.round(green) + ',0)';
        pr.layer['options'].fillOpacity = 0.8;
        pr.layer.bindPopup(`<pre>${JSON.stringify(pr.data, null, 2)}</pre>`);
      } else {
        pr.layer['options'].weight = 0;
      }
    };

    if (this.precintGeoJson) {
      this.precintGeoJson.remove();
    }

    this.precintGeoJson = L.geoJSON(this.json, {
      onEachFeature: eachFunc,
    });
    this.precintGeoJson.setStyle({
      color: 'black',
    });
    this.precincts = prs;
    this.precintGeoJson.addTo(this.map);
  }

  json: any;

  setPrecinctLayers() {
    // Load geojson file
    this.http.get(this.precinctUrl).subscribe((json: any) => {
      this.json = json;
      this.drawMap();
    });
  }

  precinctVoterData: PrecinctVoterData[];
  columns: MapColumn[] = [];

  loadPrecinctData() {
    this.dataService.fetchDataFromSheet(this.sheetUrl).subscribe((results) => {
      this.precinctVoterData = results;
      for (let i = 0; i < this.precinctVoterData.length; ++i) {
        let voterData = this.precinctVoterData[i];
        if (voterData.precinct == 'Total') {
          this.total = voterData;
          this.columns = [];
          Object.keys(voterData).forEach((column) => {
            let percent = false;
            if (typeof voterData[column] === 'string') {
              percent = true;
            }

            var col: MapColumn = {
              id: column,
              columnType:
                voterData[column] === 'Total'
                  ? 'header'
                  : percent
                  ? 'average'
                  : 'total',
              average: percent ? +voterData[column].slice(0, -1) / 100 : 0.0,
              total: voterData[column] > 1 ? voterData[column] : null,
              min: percent ? 0 : null,
              max: percent ? 0 : null,
            };
            this.columns.push(col);
          });
          this.selectedColumn = this.columns[0];
          continue;
        }
        //make sure precinct values have no leading 0s
        let precinctNumbers: string[] = voterData.precinct.split(' ');
        let suffix = precinctNumbers[1].includes('A') ? 'A' : '';
        let id =
          Number(precinctNumbers[0]) +
          '-' +
          Number(precinctNumbers[1].replaceAll('A', '')) +
          suffix;

        this.precincts[id] = { id: id, data: voterData };
        var columnNames = Object.keys(voterData);
        for (let i = 0; i < columnNames.length; ++i) {
          let column = this.columns[i];
          if (column.columnType === 'total') {
            var total: number = parseInt(voterData[column.id]);
            if (column.min === null || column.min > total) {
              column.min = total;
            }
            if (column.min === null || column.max < total) {
              column.max = total;
            }
          } else if (column.columnType === 'average') {
            var avg: number = parseInt(voterData[column.id]) / 100;
            console.log('Avg val:' + avg);
            if (column.min === null || column.min > avg) {
              column.min = avg;
            }
            if (column.min === null || column.max < avg) {
              column.max = avg;
            }
          }
        }
        console.log(this.columns);
      }
      this.dataLoaded.next(true);
    });
  }

  public valueSelected() {
    this.selectedColumn = this.columns.find(
      (x) => x.id === this.selectedColumnOption
    );
    this.drawMap();
  }
}
