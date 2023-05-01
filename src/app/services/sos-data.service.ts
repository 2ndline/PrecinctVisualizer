import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map } from 'rxjs';
import {
  ElectionResponse,
  CandidatesResponse,
  PrecinctsResponse,
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
    'https://voterportal.sos.la.gov/ElectionResults/ElectionResults/Data?blob=XX/VotesRaceByPrecinct/Votes_YY_36.htm';

  orleans2021Url = './assets/2021/elections-results.json';
  candidates2021Url = './assets/2021/candidates-results.json';
  precincts2021Url = './assets/2021/precincts-results-districta.json';
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

  public fetchPrecinctResultsFromSOS(electionDate: string, raceId: string) {
    let url = this.precinctsOrleansUrl
      .replace('XX', electionDate)
      .replace('YY', raceId);
    url = this.precincts2021Url;
    return this.http
      .get(url)
      .pipe(map((response: PrecinctsResponse) => response.Precincts));
  }
}
