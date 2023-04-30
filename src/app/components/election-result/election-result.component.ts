import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Race, Precincts, Precinct } from '../../models/precinct-voter-data.model';
import { SOSDataService } from '../../services/sos-data.service';

@Component({
  selector: 'election-result',
  templateUrl: './election-result.component.html',
  styleUrls: ['./election-result.component.css'],
})
export class ElectionResultComponent implements OnInit, OnChanges {
  @Input() value: Race;
  @Output() precinctsLoaded = new EventEmitter<Precincts>();
  public earlyVoting: Precinct;
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
          //we'll need to clean up results to match map precinct keys
          result.Precinct.forEach((precinct) => {
            if (precinct.Precinct.startsWith('Early')) {
              this.earlyVoting = precinct;
            }else{
              //replace slash with hyphen, leading zero
              precinct.Precinct =
                parseInt(precinct.Precinct.split('/')[0]).toString() +
                '-' +
                parseInt(precinct.Precinct.split('/')[1]).toString();
            }
            console.log(precinct);
          });
          this.precinctsLoaded.emit(result);
        });
    }
  }
  ngOnInit(): void {}
}
