import { ChangeDetectorRef, Component, OnInit, Renderer2 } from '@angular/core';
// @ts-ignore
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import {
  Choice,
  Election,
  Precincts,
  Race,
} from './models/precinct-voter-data.model';
import { SOSDataService } from './services/sos-data.service';
import { formatDate } from '@angular/common';
import { MapPrecinct } from './models/precinct.model';
import { PopupComponent } from './components/popup/popup.component';

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
  precinctResults: Precincts;
  constructor(
    private http: HttpClient,
    private dataService: SOSDataService,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2
  ) {}
  public precincts: MapPrecinct[] = [];
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
        if (this.map) {
          this.map.remove();
        }
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
        if (!this.json) {
          this.setPrecinctLayers();
        } else {
          this.drawMap();
        }
      }
    });
    this.dataLoaded.next(true);
  }

  public precinctUrl: string =
    'https://opendata.arcgis.com/datasets/ca0f4261673541d798551f5cddc54bd6_0.geojson';

  //with precincts loaded, draw on the map the precinct geo
  drawMap() {
    var prs = this.precincts;
    var pResults = this.precinctResults;
    let eachFunc = function (f: any, l: any) {
      const precinctId = f.properties.PRECINCTID;
      let pr = {} as MapPrecinct;
      if (prs[precinctId] != null) {
        pr = prs[precinctId];
      }
      pr.feature = f;
      pr.layer = l;
      let popupComponent = '';
      if (pResults) {
        let p = pResults.Precinct.find(
          (precinct) => precinct.Precinct == precinctId
        );
        if (p && p.Choice) {
          popupComponent = `
          <div>
  <table>
    <tr>
      <td>
        <div>
          ${p.Precinct}
        </div>
      </td>
      <td>
          <div>${+p.VoterCountVoted} votes</div>
      </td>
      <td>
        <div>
          ${((+p.VoterCountVoted / +p.VoterCountQualified) * 100).toFixed(
            1
          )} % turnout
        </div>
      </td>
    </tr>`;
          //write each choice in as a row
          p.Choice.forEach((choice) => {
            let val = `
      <tr style="background-color: #${choice.Color.slice(2).padStart(6, '0')}">
        <td>
          <div>
            ${choice.Desc}
          </div>
        </td>
        <td>
          <div>
            ${choice.VoteTotal}
          </div>
        </td>
        <td>
          <div>
          ${((+choice.VoteTotal / +p.VoterCountVoted) * 100).toFixed(1)}%
          </div>
        </td>
      </tr>
      `;
            popupComponent = popupComponent.concat(val);
          });
          popupComponent = popupComponent.concat('</table></div>');
          console.log(popupComponent);
          pr.layer.bindPopup(popupComponent);
          let choice = p.Choice.reduce((max: Choice, current: Choice) => {
            return +current.VoteTotal > +max.VoteTotal ? current : max;
          });
          if (choice) {
            console.log(choice);
            pr.layer['options'].fillColor =
              '#' + choice.Color.slice(2).padStart(6, '0');
            pr.layer['options'].fillOpacity =
              +choice.VoteTotal / +p.VoterCountVoted;
          }
        }
      }
    };

    if (this.precintGeoJson) {
      this.precintGeoJson.clearLayers();
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
    console.log(precincts);
    this.precinctResults = precincts;
    this.dataLoaded.next(true);
  }
}
