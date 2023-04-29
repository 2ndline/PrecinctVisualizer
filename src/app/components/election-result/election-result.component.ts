import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Race } from '../../models/precinct-voter-data.model';
import { SOSDataService } from '../../services/sos-data.service';

@Component({
  selector: 'election-result',
  templateUrl: './election-result.component.html',
  styleUrls: ['./election-result.component.css'],
})
export class ElectionResultComponent implements OnInit, OnChanges {
  @Input() value: Race;
  constructor(
    private cdr: ChangeDetectorRef,
    private dataService: SOSDataService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log('change');
    if (changes.value && changes.value.currentValue) {
      // Do something with the new value of highlightedRace
      console.log('change to election result');
      //fetch the election results
      this.dataService
        .fetchPrecinctResultsFromSOS(this.value.ElectionDate, this.value.ID)
        .subscribe((result) => {
          result.Precinct.forEach((precinct) => {
            
          });
        });
    }
  }
  ngOnInit(): void {}
}
