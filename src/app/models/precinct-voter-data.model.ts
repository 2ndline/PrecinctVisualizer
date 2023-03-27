// https://voterportal.sos.la.gov/ElectionResults/ElectionResults/Data?blob=ElectionDates.htm
export interface IDates {
  DefaultElectionDate: string;
  Date: IDate[];
}

export interface IDate {
  ElectionDate: string;
  PKElectionID: string;
}

//  https://voterportal.sos.la.gov/ElectionResults/ElectionResults/Data?blob=20230325/RacesCandidates_Multiparish
// https://voterportal.sos.la.gov/ElectionResults/ElectionResults/Data?blob=20230325/VotesParish/Votes_36.htm
export interface IElection {
  Races: IRaces;
}

export interface IRaces {
  WriteTime: string;
  Race: IRace[];
}

export interface IRace {
  SpecificTitle: string;
  ID: string;
  Choice: IChoice[];
  VoterCountQualified: number;
}

export interface IChoice {
  Color: string;
  ID: string;
  Desc: string;
  Outcome: string;
  VoteTotal: number;
}

//https://voterportal.sos.la.gov/ElectionResults/ElectionResults/Data?blob=20230325/VotesRaceByPrecinct/Votes_64495_36.htm

export interface IPrecincts {
  Precinct: IPrecinct[];
}

export interface IPrecinct {
  HasReported: number;
  Precinct: string;
  VoterCountQualified: number;
  Choice: IChoice[];
}

export interface PrecinctVoterData {
  precinct: string;
}
