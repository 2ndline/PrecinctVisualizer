import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
} from '@angular/core';
// @ts-ignore
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import {
  Choice,
  Dates,
  Election,
  Precincts,
  Race,
} from './models/precinct-voter-data.model';
import { Precinct } from './models/precinct.model';
import { SOSDataService } from './services/sos-data.service';
import { formatDate } from '@angular/common';

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
  public selectedElection: string = '';
  public electionDates: Election[] = [];
  public electionRaces: Race[] = [];
  public selectedRace: string = '';
  public highlightedRace: Race;
  constructor(
    private http: HttpClient,
    private dataService: SOSDataService,
    private cdr: ChangeDetectorRef
  ) {}
  public precincts: Precinct[] = [];
  precintGeoJson: L.GeoJSON<any>;
  private dataLoaded: BehaviorSubject<boolean> = new BehaviorSubject(true);

  ngOnInit() {
    this.init();
  }

  init() {
    //get the election dates
    this.dataService.fetchDatesFromSOS().subscribe(
      (results) => {
        console.log(results);
        console.log(results.DefaultElectionDate);
        console.log(results.Date);
        this.selectedElection = results.DefaultElectionDate;
        this.electionDates = results.Date;
      },
      (error) => {
        console.log(error);
      }
    );
    //create subscription for dataLoaded to fire up the map
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
  }

  public precinctUrl: string =
    'https://opendata.arcgis.com/datasets/ca0f4261673541d798551f5cddc54bd6_0.geojson';

  //with precincts loaded, draw on the map the precinct geo
  drawMap() {
    var prs = this.precincts;
    let eachFunc = function (f: any, l: any) {
      const precinctId = f.properties.PRECINCTID;
      let pr = {} as Precinct;
      if (prs[precinctId] != null) {
        pr = prs[precinctId];
      }
      pr.feature = f;
      pr.layer = l;
    };

    //TODO - display precinct data
    /*
From restored code
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
*/

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

  //fetch precinct definition from City of New Orleans
  setPrecinctLayers() {
    // Load geojson file
    this.http.get(this.precinctUrl).subscribe((json: any) => {
      this.json = json;
      this.drawMap();
    });
  }

  dateFormat = 'yyyyMMdd';
  public dateValueSelected(value: Election) {
    console.log(value);
    let se = this.electionDates.find(
      (x) => x.ElectionDate === value.ElectionDate
    ).ElectionDate;
    if (se) {
      this.selectedElection = se;
      let d = formatDate(this.selectedElection, this.dateFormat, 'en-US');
      this.dataService.fetchCandidatesFromSOS(d).subscribe((results) => {
        this.electionRaces = results.Race;
      });
    }
  }

  public raceValueSelected(value: string) {
    console.log('selecting race');
    console.log(value);
    let sr = this.electionRaces.find((x) => x.SpecificTitle === value);
    if (sr) {
      this.selectedRace = value;

      //FIXME: below sucks - either load in all results when we load in a selected election, or optimize the selected race
      this.dataService
        .fetchOrleansElectionsFromSOS(this.selectedElection)
        .subscribe((result) => {
          let raceResults = result.Race.find((r) => r.ID == sr.ID);
          console.log('find results');

          if (raceResults) {
            console.log(raceResults);
            let mergedRace: Race = {
              ...sr,
              ...raceResults,
            };
            const mergedChoices = [...sr.Choice];
            raceResults.Choice.forEach((choice2) => {
              const index = mergedChoices.findIndex(
                (choice1) => choice1.ID === choice2.ID
              );
              if (index >= 0) {
                // merge the two choices based on ID
                mergedChoices[index] = { ...mergedChoices[index], ...choice2 };
              } else {
                // add choice2 to the mergedChoices array
                mergedChoices.push(choice2);
              }
            });
            mergedRace.Choice = mergedChoices;
            mergedRace.ElectionDate = this.selectedElection;
            this.highlightedRace = mergedRace;
          }
          console.log(this.highlightedRace);
          this.cdr.detectChanges();
          console.log('highlighted race');
        });
    }
  }

  onPrecinctsLoaded(precincts: Precincts) {
    console.log('Precincts loaded');
    // Do something when the precincts are loaded
    this.drawMap();
  }
}
