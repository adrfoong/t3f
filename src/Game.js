import React from "react";
import GameManager from "./GameManager";
import Board from "./Board";

class ManagedGame extends React.Component {
  constructor(props) {
    super(props);
    this.manager = new GameManager(props.players, props.mode);
    this.manager.initGameState();
    document.documentElement.style.setProperty(
      "--cell-count",
      GameManager.CELL_COUNT
    );
  }

  updateGame = () => {
    this.setState({});
  };

  selectCell = cell => {
    if (this.manager.game.status === "inactive") {
      return;
    }

    this.manager.playMove(cell.position);
    this.setState({});
  };

  startGame = () => {
    this.manager.startGame();
    if (this.props.mode === "automated") {
      this.manager.run(this.updateGame);
    }
    this.setState({});
  };

  swapPlayers = () => {
    this.reset();
    this.manager.swapPlayers();
    this.setState({});
  };

  reset = () => {
    this.manager.initGameState();
    this.setState({});
  };

  render() {
    return (
      <div className="board-container">
        <Board
          board={this.manager.game.board}
          onCellClick={
            this.props.mode === "automated" ? undefined : this.selectCell
          }
        />
        <button
          disabled={this.manager.game.status === "active"}
          onClick={this.startGame}
        >
          Start
        </button>
        <button
          disabled={this.manager.game.status === "active"}
          onClick={this.swapPlayers}
        >
          Swap Players
        </button>
        <button
          disabled={this.manager.game.status === "active"}
          onClick={this.reset}
        >
          Reset
        </button>
        <Info manager={this.manager} game={this.manager.game} />
      </div>
    );
  }
}

const Info = ({ manager, game }) => {
  return (
    <>
      <div>
        {manager.currentPlayer.name}
        --
        {manager.currentPlayer.mark}
      </div>
      {manager.winner ? <div>{manager.winner.name} wins!</div> : null}
      {game.message ? <div>{game.message}</div> : null}
      {game.error ? (
        <div>
          {game.error.message}{" "}
          {manager.currentPlayer.fouls.map(e => e.position).join(",")}
        </div>
      ) : null}
    </>
  );
};

export default ManagedGame;
