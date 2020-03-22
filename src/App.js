import React from "react";
import "./App.css";

import player1 from "./";

function App() {
  return (
    <div className="App">
      <Game />
    </div>
  );
}

class GameManager {
  static CELL_COUNT = 3;

  players = [
    {
      name: "Player 1",
      mark: "X",
      moves: [],
      fouls: [],
      think: state => {
        return state.cells.findIndex(cell => !cell.mark);
      }
    },
    {
      name: "Player 2",
      mark: "O",
      moves: [],
      fouls: [],
      think: state => {
        return state.cells.findIndex(cell => !cell.mark);
      }
    }
  ];
  playerStack = [...this.players];

  initGameState() {
    document.documentElement.style.setProperty(
      "--cell-count",
      GameManager.CELL_COUNT
    );

    let state = {
      cells: Array(GameManager.CELL_COUNT * GameManager.CELL_COUNT)
        .fill()
        .map((_, i) => ({ position: i, mark: "" })),
      winner: null,
      status: "active",
      players: this.players
    };
    state = this.updateCurrentPlayer(state);
    return state;
  }

  updateCurrentPlayer(state) {
    let currentPlayer = this.playerStack.shift();
    this.playerStack.push(currentPlayer);

    return { ...state, currentPlayer };
  }

  groupByPosition(state, groupKeyFn) {
    return state.cells.reduce((acc, cell) => {
      let group = groupKeyFn(cell);
      if (cell.mark === state.currentPlayer.mark) {
        if (acc[group]) {
          acc[group].count++;
        } else {
          acc[group] = { count: 1 };
        }
      }
      return acc;
    }, {});
  }

  verticalWin = state => {
    return this.groupByPosition(
      state,
      ({ position }) => "COLUMN_" + (position % GameManager.CELL_COUNT)
    );
  };

  backdiagonalWin = state => {
    let { DIAG } = this.groupByPosition(state, ({ position }) => {
      let group = position % (GameManager.CELL_COUNT + 1);
      if (group !== 0) {
        return "INVALID";
      } else {
        return "DIAG";
      }
    });
    return { DIAG };
  };

  frontdiagonalWin = state => {
    let { DIAG } = this.groupByPosition(state, ({ position }) => {
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
    });
    return { DIAG };
  };

  horizontalWin = state => {
    return this.groupByPosition(
      state,
      ({ position }) => "ROW_" + Math.floor(position / GameManager.CELL_COUNT)
    );
  };

  checkEndgame(state) {
    let winConditionMet = [
      this.horizontalWin,
      this.verticalWin,
      this.frontdiagonalWin,
      this.backdiagonalWin
    ].some(fn => {
      let groups = fn(state);
      return Object.entries(groups).some(
        ([key, group]) => group && group.count === GameManager.CELL_COUNT
      );
    });

    if (winConditionMet) {
      // this.state = "inactive";
      // this.winner = this.currentPlayer;
      return { ...state, status: "inactive", winner: state.currentPlayer };
    }

    return state;
  }

  isMoveValid(state, position) {
    return !state.cells[position].mark;
  }

  playMove(state, position) {
    if (!this.isMoveValid(state, position)) {
      state.currentPlayer.fouls.push({ type: "INVALID_MOVE", position });
      return state;
    }

    state.currentPlayer.moves.push(position);
    let newState = {
      ...state,
      cells: state.cells.map(cell => {
        if (cell.position === position) {
          return {
            ...cell,
            mark: state.currentPlayer.mark
          };
        } else {
          return cell;
        }
      })
    };

    newState = this.checkEndgame(newState);
    newState = this.updateCurrentPlayer(newState);
    return newState;
  }

  getReducer() {
    return (state, action) => {
      switch (action.type) {
        // case "winner":
        //   return { ...state, winner: action.payload.winner };
        case "move": {
          return this.playMove(state, action.payload.position);
        }
        default:
          throw new Error();
      }
    };
  }
}

const Cell = ({ cell, onClick = () => {} }) => {
  return (
    <div className="cell" onClick={() => onClick(cell)}>
      <div>{cell.position}</div>
      <div>{cell.mark}</div>
    </div>
  );
};

const Game = props => {
  let manager = new GameManager();
  let automate = true;
  window.manager = manager;

  if (automate) {
    let automata = new Coordinator(manager);
    return (
      <div className="board-container">
        <AutomatedBoard automata={automata} />
      </div>
    );
  }

  let reducer = manager.getReducer();
  let initialState = manager.initGameState();
  return (
    <div className="board-container">
      <Board reducer={reducer} initialState={initialState} />
    </div>
  );
};

class Coordinator {
  constructor(manager, setGame) {
    this.manager = manager;
    this.game = manager.initGameState();
    this.updateView = setGame;
  }

  runPlay = () => {
    let selectedNum = this.game.currentPlayer.think(this.game);
    // let selectCell = this.game.cells[selectedNum];

    this.game = this.manager.playMove(this.game, selectedNum);
    this.updateView(this.game);
  };

  run() {
    let interval = setInterval(() => {
      this.runPlay();

      if (this.game.winner) {
        clearInterval(interval);
      }
    }, 1000);
  }
}

const AutomatedBoard = ({ automata }) => {
  let [game, setGame] = React.useState(automata.game);
  automata.updateView = setGame;
  window.automata = automata;
  window.game = automata.game;
  React.useEffect(() => {
    automata.run();
  }, []);

  return (
    <div className="board">
      {game.cells.map(cell => (
        <Cell key={cell.position} cell={cell} />
      ))}
      {game.winner ? <div>`{game.winner.name} wins!`</div> : null}
    </div>
  );
};

const Board = props => {
  let { initialState, reducer } = props;

  const [game, dispatch] = React.useReducer(reducer, initialState);

  function selectCell(cell) {
    if (game.status === "inactive") {
      return;
    }

    dispatch({ type: "move", payload: cell });
  }
  window.game = game;
  return (
    <div className="board">
      {game.cells.map(cell => (
        <Cell key={cell.position} cell={cell} onClick={selectCell} />
      ))}
      {game.winner ? <div>`{game.winner.name} wins!`</div> : null}
    </div>
  );
};

export default App;
