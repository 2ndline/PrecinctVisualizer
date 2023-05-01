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
import {
  Race,
  Precincts,
  Precinct,
} from '../../models/precinct-voter-data.model';
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
  constructor(private dataService: SOSDataService) {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log('change');
    if (changes.value && changes.value.currentValue) {
      // Do something with the new value of highlightedRace
      console.log('change to election result');
      let choices = this.value.Choice;
      //fetch the election results
      this.dataService
        .fetchPrecinctResultsFromSOS(this.value.ElectionDate, this.value.ID)
        .subscribe((result) => {
          //we'll need to clean up results to match map precinct keys
          result.Precinct.forEach((precinct) => {
            if (precinct.Precinct.startsWith('Early')) {
              this.earlyVoting = precinct;
            } else {
              //replace slash with hyphen, leading zero
              precinct.Precinct = this.formatPrecinct(precinct.Precinct);
            }
            precinct.Choice.forEach((precinctChoice) => {
              const raceChoice = choices.find(
                (rc) => rc.ID == precinctChoice.ID
              );
              if (raceChoice) {
                let total = precinctChoice.VoteTotal;
                let mergedRace = { ...precinctChoice, ...raceChoice };
                Object.assign(precinctChoice, mergedRace);
                precinctChoice.VoteTotal = total;
              }
            });
          });
          console.log('emit precincts');
          this.precinctsLoaded.emit(result);
        });
    }
  }
  formatPrecinct(precinct: string): string {
    const parts = precinct.split('/');
    let firstPart = parts[0].replace(/^0+/, ''); // remove leading zeros
    let secondPart = parts[1].replace(/^0+/, ''); // remove leading zeros
    if (secondPart.endsWith('A')) {
      secondPart = secondPart.slice(0, -1) + 'A'; // keep the A at the end
    }
    return `${firstPart}-${secondPart}`;
  }

  ngOnInit(): void {}
}
