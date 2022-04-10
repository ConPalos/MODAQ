import * as React from "react";
import { observer } from "mobx-react-lite";

import * as FormattedTextParser from "src/parser/FormattedTextParser";
import { IFormattedText } from "src/parser/IFormattedText";
import { FormattedText } from "./FormattedText";
import { StateContext } from "src/contexts/StateContext";
import { AppState } from "src/state/AppState";

export const Answer = observer(
    function Answer(props: IAnswerProps): JSX.Element  {
        const appState: AppState = React.useContext(StateContext);
        const formattedText: IFormattedText[] = FormattedTextParser.parseFormattedText(
            props.text.trimLeft(),
            appState.game.gameFormat.pronunciationGuideMarkers
        );

        return (
            <div>
                <span className={props.className}>ANSWER:&nbsp;</span>
                <FormattedText segments={formattedText} className={props.className} />
            </div>
        );
    }
);

export interface IAnswerProps {
    text: string;
    className?: string;
}
