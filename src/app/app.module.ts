import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { API_KEY, GoogleSheetsDbService } from 'ng-google-sheets-db';

import { AppComponent } from './app.component';
import { PopupComponent } from './components/popup/popup.component';
import { ElectionResultComponent } from './components/election-result/election-result.component';

@NgModule({
  imports: [BrowserModule, FormsModule, HttpClientModule],
  declarations: [AppComponent, PopupComponent, ElectionResultComponent],
  providers: [
    {
      provide: API_KEY,
      useValue: 'AIzaSyAdH606fOsgI-_u69LJEV0b5R_OSmHlQJY',
    },
    GoogleSheetsDbService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
