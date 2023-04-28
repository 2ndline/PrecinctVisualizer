import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Race } from '../../models/precinct-voter-data.model';

@Component({
  selector: 'election-result',
  templateUrl: './election-result.component.html',
  styleUrls: ['./election-result.component.css'],
})
export class ElectionResultComponent implements OnInit, OnChanges {
  @Input() value: Race;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.value && changes.value.currentValue) {
      // Do something with the new value of highlightedRace
      console.log('change to election result');
    }
  }
  ngOnInit(): void {
    //
  }
}
