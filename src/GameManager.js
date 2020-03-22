function InvalidMoveError({ player, position } = {}) {
  this.player = player;
  this.position = position;
  this.message = "Cell is already occupied";
}

const BoardController = {
  state: { cells: [] },
  isMoveValid(state, position) {
    return !state.cells[position].owner;
  },
  //   place(position, process) {
  //     if (!BoardController.isMoveValid(BoardController.state, position)) {
  //       throw new InvalidMoveError({ position });
  //     }

  //     BoardController.state = BoardController.state.cells.map(cell => {
  //       if (cell.position === position) {
  //         return process(cell)
  //       } else {
  //         return cell;
  //       }
  //     });
  //   },
  playMove(state, position, currentPlayer) {
    if (!BoardController.isMoveValid(state, position)) {
      throw new InvalidMoveError({ player: currentPlayer, position });
    }

    let newState = {
      ...state,
      cells: state.cells.map(cell => {
        if (cell.position === position) {
          return {
            ...cell,
            owner: currentPlayer
          };
        } else {
          return cell;
        }
      })
    };

    return newState;
  }
};

export default class GameManager {
  static CELL_COUNT = 3;
  think = url => state => {
    return fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json"
      },
      body: JSON.stringify(state)
    });
  };

  constructor(players) {
    this.players = players.map(({ url, ...others }) => ({
      ...others,
      fouls: [],
      moves: [],
      think: this.think(url)
    }));
    // this.turnCount = 0;
    // this.currentPlayer = this.getNextPlayer();
  }

  initGameState = () => {
    document.documentElement.style.setProperty(
      "--cell-count",
      GameManager.CELL_COUNT
    );

    let state = {
      cells: Array(GameManager.CELL_COUNT * GameManager.CELL_COUNT)
        .fill()
        .map((_, i) => ({ position: i, owner: null })),
      winner: null,
      status: "active",
      players: this.players
    };
    // state = this.updateCurrentPlayer(state);
    // return state;
    this.turnCount = 0;
    this.currentPlayer = this.getNextPlayer();
    this.game = state;
  };

  getNextPlayer = () => {
    return this.players[this.turnCount++ % this.players.length];
  };

  _onSuccessfulPlay(position) {
    this.currentPlayer.moves.push(position);
    this.checkEndgame();
    this.currentPlayer = this.getNextPlayer();
  }

  _onFailedPlay(e) {
    this.currentPlayer.fouls.push(e);
  }

  playMove = position => {
    try {
      let newState = BoardController.playMove(
        this.game,
        position,
        this.currentPlayer
      );
      this.game = newState;
      this._onSuccessfulPlay(position);
    } catch (e) {
      this._onFailedPlay(e);
      console.error(e);
    }
  };

  groupByPosition = (cells, currentPlayer, groupKeyFn) => {
    return cells.reduce((acc, cell) => {
      let group = groupKeyFn(cell);
      if (cell.owner === currentPlayer) {
        if (acc[group]) {
          acc[group].count++;
        } else {
          acc[group] = { count: 1 };
        }
      }
      return acc;
    }, {});
  };

  verticalWin = (cells, currentPlayer) => {
    return this.groupByPosition(
      cells,
      currentPlayer,
      ({ position }) => "COLUMN_" + (position % GameManager.CELL_COUNT)
    );
  };

  backdiagonalWin = (cells, currentPlayer) => {
    let { DIAG } = this.groupByPosition(
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
  };

  frontdiagonalWin = (cells, currentPlayer) => {
    let { DIAG } = this.groupByPosition(
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
  };

  horizontalWin = (cells, currentPlayer) => {
    return this.groupByPosition(
      cells,
      currentPlayer,
      ({ position }) => "ROW_" + Math.floor(position / GameManager.CELL_COUNT)
    );
  };

  checkEndgame = () => {
    let state = this.game;
    let winConditionMet = [
      this.horizontalWin,
      this.verticalWin,
      this.frontdiagonalWin,
      this.backdiagonalWin
    ].some(fn => {
      let groups = fn(state.cells, this.currentPlayer);
      return Object.entries(groups).some(
        ([key, group]) => group && group.count === GameManager.CELL_COUNT
      );
    });

    if (winConditionMet) {
      this.game.status = "inactive";
      this.game.winner = this.currentPlayer;
    }
  };

  runPlayerMove = async () => {
    // const res = await this.game.currentPlayer.think(this.game).then(res => res.json());
    let state = { players: this.players, cells: this.game.cells };
    let { position } = await this.currentPlayer
      .think(state)
      .then(res => res.json());
    this.playMove(position);
  };

  async run(updateView) {
    while (!this.game.winner) {
      await this.runPlayerMove();
      updateView(this.game);

      // sleep
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}
