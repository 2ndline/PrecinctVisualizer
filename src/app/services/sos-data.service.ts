import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { IDates, IElection } from '../models/precinct-voter-data.model';

@Injectable({
  providedIn: 'root',
})
export class SOSDataService {
  constructor(private http: HttpClient) {}

  datesUrl =
    'https://voterportal.sos.la.gov/ElectionResults/ElectionResults/Data?blob=ElectionDates.htm';

  electionsMultiparishUrl =
    'https://voterportal.sos.la.gov/ElectionResults/ElectionResults/Data?blob=XX/RacesCandidates_Multiparish';

  electionsOrleansUrl =
    'https://voterportal.sos.la.gov/ElectionResults/ElectionResults/Data?blob=XX/VotesParish/Votes_36.htm';

  public fetchDatesFromSOS(): Observable<IDates> {
    const headerDict = {
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Allow-Origin': '*',
    };
    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };
    return this.http.get<IDates>(this.datesUrl, requestOptions);
  }

  public fetchCandidatesFromSOS(electionDate: string): Observable<IElection> {
    let url = this.electionsMultiparishUrl.replace('XX', electionDate);
    return this.http.get<IElection>(url);
  }

  public fetchOrleansElectionsFromSOS(
    electionDate: string
  ): Observable<IElection> {
    let orleansUrl = this.electionsOrleansUrl.replace('XX', electionDate);
    return this.http.get<IElection>(orleansUrl);
  }
}
