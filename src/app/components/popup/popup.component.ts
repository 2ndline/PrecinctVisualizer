import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { Precinct } from '../../models/precinct-voter-data.model';

@Component({
  selector: 'popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css'],
})
export class PopupComponent {
  @Input() precinct: Precinct;
}
