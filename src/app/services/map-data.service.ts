import { HttpClient } from '@angular/common/http';
import { Component, Injectable, OnInit } from '@angular/core';
import { GoogleSheetsDbService } from 'ng-google-sheets-db';
import { Observable } from 'rxjs';
import {
  characterAttributesMapping,
  PrecinctVoterData,
} from '../models/precinct-voter-data.model';

@Injectable({
  providedIn: 'root',
})
export class MapDataService {
  constructor(
    private http: HttpClient,
    private googleSheetsDbService: GoogleSheetsDbService
  ) {}

  public fetchDataFromSheet(sheetId: string): Observable<PrecinctVoterData[]> {
    return this.googleSheetsDbService.get<PrecinctVoterData>(
      sheetId,
      '2021 Results',
      characterAttributesMapping
    );
  }

  public fetchDataFromSoS() {
    //TODO
    /***
     * 1) fetch from SOS static page the results
     * 2) format results to match PrecinctVoterData
     */
  }
}
