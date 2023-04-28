import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map } from 'rxjs';
import {
  ElectionResponse,
  CandidatesResponse,
} from '../models/precinct-voter-data.model';

@Injectable({
  providedIn: 'root',
})
export class SOSDataService {
  constructor(private http: HttpClient) {}

  datesUrl = '/resources/election-dates.json';

  racesMultiparishUrl =
    'https://voterportal.sos.la.gov/ElectionResults/ElectionResults/Data?blob=XX/RacesCandidates_ByParish_36.htm';

  electionsOrleansUrl =
    'https://voterportal.sos.la.gov/ElectionResults/ElectionResults/Data?blob=XX/VotesParish/Votes_36.htm';

  electionDatesUrl = './assets/2021/2021-election-date.json'; // './assets/election-dates.json'

  precinctsOrleansUrl =
    'https://voterportal.sos.la.gov/ElectionResults/ElectionResults/Data?blob=20211113/VotesRaceByPrecinct/Votes_XX_YY.htm';

  orleans2021Url = './assets/2021/elections-results.json';
  candidates2021Url = './assets/2021/candidates-results.json';
  public fetchDatesFromSOS() {
    return this.http
      .get(this.electionDatesUrl)
      .pipe(map((response: ElectionResponse) => response.Dates));
  }

  public fetchCandidatesFromSOS(electionDate: string) {
    let url = this.racesMultiparishUrl.replace('XX', electionDate);
    url = this.candidates2021Url;
    return this.http
      .get(url)
      .pipe(map((response: CandidatesResponse) => response.Races));
  }

  public fetchOrleansElectionsFromSOS(electionDate: string) {
    let orleansUrl = this.electionsOrleansUrl.replace('XX', electionDate);
    orleansUrl = this.orleans2021Url;
    return this.http
      .get(orleansUrl)
      .pipe(map((response: CandidatesResponse) => response.Races));
  }

  public fetchCandidateResults(electionDate: string) {
    return forkJoin([
      this.fetchCandidatesFromSOS(electionDate),
      this.fetchOrleansElectionsFromSOS(electionDate),
    ]).pipe(
      map(([candidates, results]) => {
        candidates.Race.forEach((race) => {
          let rr = results.Race.find((x) => x.ID == race.ID);
          race = { ...race, ...rr };
          race.Choice.forEach((choice) => {
            let rc = rr.Choice.find((y) => y.ID == choice.ID);
            choice = { ...choice, ...rc };
          });
        });
        return { Races: { Race: candidates } };
      })
    );
  }
}
