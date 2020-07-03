import { ITeam, IPlayer } from "./TeamState";
import { IBuzzMarker } from "./IBuzzMarker";

// TODO: Consider folding IBonusAnswerEvent into ITossupAnswerEvent, so we don't need to keep two events in sync. We
// could do a union type where the bonusAnswer only exists if marker.correct is true. We'd probably have to fold the
// IBuzzMarker interface into ITossupAnswerEvent, which should be fine.
export interface ITossupAnswerEvent {
    tossupIndex: number;
    marker: IBuzzMarker;
}

export interface IBonusAnswerEvent {
    bonusIndex: number;
    correctParts: ICorrectBonusAnswerPart[];
    receivingTeam: ITeam;
}

export interface ICorrectBonusAnswerPart {
    index: number;
    points: number;
}

export interface ITossupProtestEvent extends IProtestEvent {
    position: number;
}

export interface IBonusProtestEvent extends IProtestEvent {
    partIndex: number;
}

export interface ISubstitutionEvent {
    inPlayer: IPlayer;
    outPlayer: IPlayer;
}

export interface IThrowOutQuestionEvent {
    questionIndex: number;
}

// TODO: Consider adding a "note" or "free" event, that can tell the TD something special about this cycle

interface IProtestEvent {
    questionIndex: number;
    reason: string;
    team: ITeam;
}
