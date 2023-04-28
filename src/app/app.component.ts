import { Component, OnInit } from '@angular/core';
// @ts-ignore
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import {
  Choice,
  Dates,
  Election,
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
  constructor(private http: HttpClient, private dataService: SOSDataService) {}
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
    console.log(value);
    let sr = this.electionRaces.find((x) => x.SpecificTitle === value);
    if (sr) {
      this.selectedRace = value;
      console.log(sr);
      this.highlightedRace = sr;
      //TODO load precinct results, load map
    }
  }
}
