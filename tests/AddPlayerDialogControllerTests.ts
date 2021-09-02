import { assert, expect } from "chai";

import * as AddPlayerDialogController from "src/components/dialogs/AddPlayerDialogController";
import { AppState } from "src/state/AppState";
import { IPlayerJoinsEvent } from "src/state/Events";
import { GameState } from "src/state/GameState";
import { PacketState, Tossup } from "src/state/PacketState";
import { Player } from "src/state/TeamState";

const defaultPacket: PacketState = new PacketState();
defaultPacket.setTossups([new Tossup("first q", "first a"), new Tossup("second q", "second a")]);

const defaultTeamNames: string[] = ["First Team", "Team2"];

function createApp(): AppState {
    const gameState: GameState = new GameState();
    gameState.loadPacket(defaultPacket);

    const defaultExistingPlayers: Player[] = [
        new Player("Frank", defaultTeamNames[0], true),
        new Player("Faye", defaultTeamNames[0], true),
        new Player("Saul", defaultTeamNames[1], true),
    ];
    gameState.addPlayers(defaultExistingPlayers);

    const appState: AppState = new AppState();
    appState.game = gameState;
    appState.uiState.createPendingNewPlayer(defaultTeamNames[0]);
    return appState;
}

function getPendingNewPlayer(appState: AppState): Player {
    if (appState.uiState.pendingNewPlayer == undefined) {
        assert.fail("PendingNewPlayer should not be undefined");
    }

    return appState.uiState.pendingNewPlayer;
}

describe("AddPlayerDialogControllerTests", () => {
    it("changePlayerName", () => {
        const name = "New player name";
        const appState: AppState = createApp();
        AddPlayerDialogController.changePlayerName(appState, name);
        const player: Player = getPendingNewPlayer(appState);

        expect(player.name).to.equal(name);
        expect(player.teamName).to.equal(defaultTeamNames[0]);
        expect(player.isStarter).to.be.false;
    });
    it("changeTeamName", () => {
        const name = defaultTeamNames[1];
        const appState: AppState = createApp();
        AddPlayerDialogController.changePlayerName(appState, "Player");
        AddPlayerDialogController.changeTeamName(appState, name);
        const player: Player = getPendingNewPlayer(appState);

        expect(player.name).to.equal("Player");
        expect(player.teamName).to.equal(name);
        expect(player.isStarter).to.be.false;
    });
    it("hideDialog", () => {
        const appState: AppState = createApp();
        AddPlayerDialogController.hideDialog(appState);

        expect(appState.uiState.pendingNewPlayer).to.be.undefined;
    });
    describe("validatePlayer", () => {
        it("validatePlayer - non-empty name", () => {
            const appState: AppState = createApp();
            AddPlayerDialogController.changePlayerName(appState, " ");
            const errorMessage: string | undefined = AddPlayerDialogController.validatePlayer(appState);
            expect(errorMessage).to.not.be.undefined;
        });
        it("validatePlayer - non-existent team", () => {
            const appState: AppState = createApp();
            AddPlayerDialogController.changeTeamName(appState, defaultTeamNames[0] + defaultTeamNames[1]);
            const errorMessage: string | undefined = AddPlayerDialogController.validatePlayer(appState);
            expect(errorMessage).to.not.be.undefined;
        });
        it("validatePlayer - valid player (no team change)", () => {
            const appState: AppState = createApp();
            AddPlayerDialogController.changePlayerName(appState, "Newbie");
            const errorMessage: string | undefined = AddPlayerDialogController.validatePlayer(appState);
            expect(errorMessage).to.be.undefined;
        });
        it("validatePlayer - valid player (with team change)", () => {
            const appState: AppState = createApp();
            AddPlayerDialogController.changeTeamName(appState, defaultTeamNames[1]);
            AddPlayerDialogController.changePlayerName(appState, "Newbie");
            const errorMessage: string | undefined = AddPlayerDialogController.validatePlayer(appState);
            expect(errorMessage).to.be.undefined;
        });
    });
    describe("addPlayer", () => {
        it("addPlayer succeeds", () => {
            const appState: AppState = createApp();
            appState.uiState.setCycleIndex(1);
            AddPlayerDialogController.changeTeamName(appState, defaultTeamNames[1]);
            AddPlayerDialogController.changePlayerName(appState, "Newbie");
            AddPlayerDialogController.addPlayer(appState);

            // Verify - dialog hidden, player is in game, add player event in cycle
            expect(appState.uiState.pendingNewPlayer).to.be.undefined;

            const newPlayer: Player | undefined = appState.game.players.find(
                (player) => player.name === "Newbie" && player.teamName === defaultTeamNames[1]
            );
            if (newPlayer == undefined) {
                assert.fail(`Couldn't find new player in players: ${JSON.stringify(appState.game.players)}`);
            }

            expect(appState.game.cycles[0].playerJoins).to.be.undefined;

            const playerJoins: IPlayerJoinsEvent[] | undefined = appState.game.cycles[1].playerJoins;
            if (playerJoins === undefined) {
                assert.fail("Expected joinPlayer event in the first cycle");
            }

            expect(playerJoins.length).to.equal(1);
            expect(playerJoins[0].inPlayer).to.equal(newPlayer);
        });
        it("addPlayer fails (empty name)", () => {
            const appState: AppState = createApp();
            AddPlayerDialogController.changeTeamName(appState, defaultTeamNames[1]);
            AddPlayerDialogController.changePlayerName(appState, " ");
            AddPlayerDialogController.addPlayer(appState);

            // Verify - dialog hidden, player is in game, add player event in cycle
            expect(appState.uiState.pendingNewPlayer).to.not.be.undefined;

            const newPlayer: Player | undefined = appState.game.players.find(
                (player) => player.name === " " && player.teamName === defaultTeamNames[1]
            );
            expect(newPlayer).to.be.undefined;

            expect(appState.game.cycles[0].playerJoins).to.be.undefined;
        });
        it("addPlayer fails (non-existent team)", () => {
            const appState: AppState = createApp();
            AddPlayerDialogController.changeTeamName(appState, defaultTeamNames[0] + defaultTeamNames[1]);
            AddPlayerDialogController.changePlayerName(appState, "Newbie");
            AddPlayerDialogController.addPlayer(appState);

            // Verify - dialog hidden, player is in game, add player event in cycle
            expect(appState.uiState.pendingNewPlayer).to.not.be.undefined;

            const newPlayer: Player | undefined = appState.game.players.find((player) => player.name === "Newbie");
            expect(newPlayer).to.be.undefined;

            expect(appState.game.cycles[0].playerJoins).to.be.undefined;
        });
    });
});
