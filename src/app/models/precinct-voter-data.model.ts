export const characterAttributesMapping = {
  precinct: 'Precinct',
  giarrussoPercent: 'Joe',
  giarrussoTotal: 'Giarrusso',
  murrellTotal: 'Murrell',
  murrellPercent: 'Bob',
  miskoTotal: 'Misko',
  totalVotes2021: 'Total',
  turnout2021: 'Turnout',
  registeredVoters2021: 'Tot Reg Voters',
  percentBlack: 'B%',
};

/**
 * TODO:
 * make this more dynaic to be precint, date, office, candidateIndex, candidateResult
 * candidateResult : number[];
 * candidateIndex : number;
 * office: string;
 *
 * Candidate 1 = candidateResult[1], etc.
 *
 */
export interface PrecinctVoterData {
  precinct: string;
  giarrussoPercent: number;
  giarrussoTotal: number;
  murrellTotal: number;
  murrellPercent: number;
  miskoTotal: number;
  totalVotes2021: number;
  turnout2021: number;
  registeredVoters2021: number;
  percentBlack: number;
}
