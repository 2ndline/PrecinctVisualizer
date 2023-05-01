import { Component, OnInit, Input } from '@angular/core';
import { Precinct } from '../../models/precinct-voter-data.model';

@Component({
  selector: 'popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css'],
})
export class PopupComponent implements OnInit {
  @Input() precinct: Precinct;

  constructor() {}

  ngOnInit() {}
}
