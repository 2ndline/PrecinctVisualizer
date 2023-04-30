// https://voterportal.sos.la.gov/ElectionResults/ElectionResults/Data?blob=ElectionDates.htm
export class Election {
  pkElectionID: string;
  ElectionDate: string;
  order: string;
  resultsOfficial: string;
  postElectionStatsAvailable: string;
  displayTurnoutStats: string;
  raceStatsExist: string;
  pwpStatsExist: string;
  turnoutMessage: string;
  congMapName: string;
  senMapName: string;
  repMapName: string;
}

export class Dates {
  DefaultElectionDate: string;
  Date: Election[];
}

export class ElectionResponse {
  Dates: Dates;
}

//  https://voterportal.sos.la.gov/ElectionResults/ElectionResults/Data?blob=20230325/RacesCandidates_Multiparish
// https://voterportal.sos.la.gov/ElectionResults/ElectionResults/Data?blob=20230325/VotesParish/Votes_36.htm

export class CandidatesResponse {
  Races: Races;
}

export class PrecinctsResponse {
  Precincts: Precincts;
}

export interface Choice {
  ID: string;
  VoteTotal: string;
  Outcome: string;
  Color: string;
  Desc: string;
}

export interface Races {
  VersionDateTime: string;
  Race: Race[];
  WriteTime: string;
}

export interface Race {
  ID: string;
  SpecificTitle: string;
  GeneralTitle: string;
  OfficeLevel: string;
  IsMultiParish: string;
  IsPresidentialNominee: string;
  NumberToBeElected: string;
  SummaryText: null;
  FullText: null;
  IsClosedParty: string;
  Choice: Choice[];
  PrecinctsReporting: string;
  PrecinctsExpected: string;
  NumAbsenteeReporting: string;
  NumAbsenteeExpected: string;
  VoterCountQualified: string;
  VoterCountVoted: string;
  ElectionDate: string;
}

//https://voterportal.sos.la.gov/ElectionResults/ElectionResults/Data?blob=20230325/VotesRaceByPrecinct/Votes_64495_36.htm
interface PrecinctChoice {
  ID: string;
  VoteTotal: string;
}

export interface Precinct {
  Precinct: string;
  VoterCountQualified?: string;
  VoterCountVoted?: string;
  HasReported: string;
  Choice: PrecinctChoice[];
}

export interface Precincts {
  VersionDateTime: string;
  Precinct: Precinct[];
}
