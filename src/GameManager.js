import produce from "immer";
import Bots, { responseWrapper } from "./Bots";

function InvalidMoveError({ player, position } = {}) {
  this.player = player;
  this.position = position;
  this.message = "Cell is already occupied";
}

function MoveError({ playerName }) {
  this.message = `Something went wrong while trying to get ${playerName}'s next move`;
}

function InvalidMovesThresholdExceeded() {
  this.message = "Too many failed moves attempted";
}

const BoardController = {
  history: [],
  isMoveValid(state, position) {
    return !state.cells[position].playerId;
  },
  markCell(state, position, processFn) {
    if (!BoardController.isMoveValid(state, position)) {
      throw new InvalidMoveError({ position });
    }

    let newState = produce(state, draft => {
      draft.cells[position] = processFn(draft.cells[position]);
    });
    BoardController.history.push(newState);
    return newState;
  }
};

const GameController = {
  groupByPosition(cells, currentPlayer, groupKeyFn) {
    return cells.reduce((acc, cell) => {
      let group = groupKeyFn(cell);
      if (cell.playerId === currentPlayer.id) {
        if (acc[group]) {
          acc[group].count++;
        } else {
          acc[group] = { count: 1 };
        }
      }
      return acc;
    }, {});
  },

  verticalWin(cells, currentPlayer) {
    return GameController.groupByPosition(
      cells,
      currentPlayer,
      ({ position }) => "COLUMN_" + (position % GameManager.CELL_COUNT)
    );
  },

  backdiagonalWin(cells, currentPlayer) {
    let { DIAG } = GameController.groupByPosition(
      cells,
      currentPlayer,
      ({ position }) => {
        let group = position % (GameManager.CELL_COUNT + 1);
        if (group !== 0) {
          return "INVALID";
        } else {
          return "DIAG";
        }
      }
    );
    return { DIAG };
  },

  frontdiagonalWin(cells, currentPlayer) {
    let { DIAG } = GameController.groupByPosition(
      cells,
      currentPlayer,
      ({ position }) => {
        let group = position % (GameManager.CELL_COUNT - 1);
        if (
          group !== 0 ||
          position === GameManager.CELL_COUNT * GameManager.CELL_COUNT - 1 ||
          position === 0
        ) {
          return "INVALID";
        } else {
          return "DIAG";
        }
      }
    );
    return { DIAG };
  },

  horizontalWin(cells, currentPlayer) {
    return GameController.groupByPosition(
      cells,
      currentPlayer,
      ({ position }) => "ROW_" + Math.floor(position / GameManager.CELL_COUNT)
    );
  },

  checkWin(board, currentPlayer) {
    let winConditionMet = [
      GameController.horizontalWin,
      GameController.verticalWin,
      GameController.frontdiagonalWin,
      GameController.backdiagonalWin
    ].some(fn => {
      let groups = fn(board.cells, currentPlayer);
      return Object.entries(groups).some(
        ([key, group]) => group && group.count === GameManager.CELL_COUNT
      );
    });

    return winConditionMet;
  },

  checkBoardFull(board) {
    return board.cells.every(cell => cell.playerId);
  }
};

export default class GameManager {
  static CELL_COUNT = 3;
  thinkGenerator = url => state => {
    return fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json"
      },
      body: JSON.stringify(state)
    });
  };

  constructor(players, updateView) {
    this.players = players.map(({ url, type, bot, ...others }) => ({
      ...others,
      fouls: [],
      moves: [],
      type,
      ...(type === "bot" && {
        think: url
          ? this.thinkGenerator(url)
          : responseWrapper(Bots[bot] || Bots.nextAvailable)
      })
    }));

    this.updateView = updateView;

    let types = players.map(p => p.type);

    if (types.every(t => t === "human")) {
      this.mode = "interactive";
    } else if (types.includes("human")) {
      this.mode = "semi-automated";
    } else {
      this.mode = "automated";
    }
  }

  get winner() {
    return this.players.find(p => p.id === this.game.winner);
  }

  initGameState = () => {
    let state = {
      board: {
        cells: Array(GameManager.CELL_COUNT * GameManager.CELL_COUNT)
          .fill()
          .map((_, i) => ({ position: i, mark: null, playerId: null }))
      },
      winner: null,
      status: "inactive"
    };
    this.players.forEach(p => {
      p.fouls = [];
      p.moves = [];
    });

    // not game status
    this.status = null;
    this.error = null;
    // this.winner = null;

    this.turnCount = 0;
    this.currentPlayer = this.getNextPlayer();
    this.game = state;
  };

  startGame = () => {
    this.game = produce(this.game, draft => {
      draft.status = "active";
    });
  };

  swapPlayers = () => {
    this.currentPlayer = this.getNextPlayer();
  };

  getNextPlayer = () => {
    return this.players[this.turnCount++ % this.players.length];
  };

  _checkGameEnd() {
    let isWinner = GameController.checkWin(this.game.board, this.currentPlayer);
    if (isWinner) {
      this.game = produce(this.game, draft => {
        draft.status = "complete";
        draft.winner = this.currentPlayer.id;
      });
      return true;
    } else if (GameController.checkBoardFull(this.game.board)) {
      this.game = produce(this.game, draft => {
        draft.status = "complete";
        draft.message = "Stalemate!";
      });
      return true;
    }

    return false;
  }

  _onSuccessfulPlay = position => {
    this.currentPlayer.moves.push(position);
    let gameHasEnded = this._checkGameEnd();
    if (!gameHasEnded) {
      this.currentPlayer = this.getNextPlayer();
    }
  };

  _onFailedPlay = e => {
    this.currentPlayer.fouls.push(e);

    if (this.currentPlayer.type === "bot") {
      if (this.currentPlayer.fouls.length > 2) {
        this.error = new InvalidMovesThresholdExceeded();
        throw this.error;
      } else {
        this.error = e;
      }
    }
  };

  _processCell = cell => {
    return {
      ...cell,
      mark: this.currentPlayer.mark,
      playerId: this.currentPlayer.id
    };
  };

  playMove = position => {
    try {
      this.game = produce(this.game, draft => {
        draft.board = BoardController.markCell(
          this.game.board,
          position,
          this._processCell
        );
      });
      this._onSuccessfulPlay(position);
    } catch (e) {
      this._onFailedPlay(e);
      console.error(e);
    }
  };

  runAutomatedMove = async () => {
    if (this.status === "busy") {
      return;
    }
    let previousStatus = this.status;
    this.status = "busy";
    let state = {
      players: this.players,
      cells: this.game.board.cells.map(({ position, playerId }) => ({
        position,
        playerId
      }))
    };
    let { position } = await this.currentPlayer
      .think(state)
      .then(res => res.json())
      .catch(e => {
        throw new MoveError({ playerName: this.currentPlayer.name });
      });

    let cell = document.querySelectorAll(".cell")[position];
    cell.classList.add("hover");
    await new Promise(r => setTimeout(r, 500));
    this.playMove(position);
    cell.classList.remove("hover");
    this.updateView();
    this.status = previousStatus;
  };

  async runWhile(evalCond) {
    while (evalCond()) {
      try {
        await this.runAutomatedMove();
        // sleep
        await new Promise(r => setTimeout(r, 500));
      } catch (e) {
        console.warn(e);
        // this.game = { ...this.game, error: e.message };
        this.updateView();
        break;
      }
    }
  }

  runFullyAutomatedGame() {
    this.runWhile(() => !this.game.winner && this.game.status === "active");
  }

  runSemiAutomatedGame() {
    this.runWhile(
      () => this.currentPlayer.type === "bot" && this.game.status === "active"
    );
  }
}
