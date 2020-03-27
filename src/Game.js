import React from "react";
import GameManager from "./GameManager";
import Board from "./Board";
import { ReactComponent as Brush } from "./brush-stroke-banner-6.svg";
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
    if (this.manager.game.status === "active") {
      this.manager.playMove(cell.position);
      this.setState({});
    }

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
          boardClassName={this.manager.game.status}
          onCellClick={
            this.props.mode === "automated" ? undefined : this.selectCell
          }
        />
        <div className="game-controls">
          <button
            className={`btn start-button ${
              this.manager.game.status === "inactive" ? "" : "disabled"
            }`}
            disabled={this.manager.game.status !== "inactive"}
            onClick={this.startGame}
          >
            Start
          </button>
          <button
            className={`btn swap-button ${
              this.manager.game.status === "inactive" ? "" : "disabled"
            }`}
            disabled={this.manager.game.status !== "inactive"}
            onClick={this.swapPlayers}
          >
            Swap Players
          </button>
          <button className={`btn reset-button`} onClick={this.reset}>
            Reset
          </button>
        </div>

        <Info manager={this.manager} game={this.manager.game} />
      </div>
    );
  }
}

const Info = ({ manager, game }) => {
  return (
    <div className="info">
      <Brush className="brush" />
      {game.status !== "complete" ? (
        <div className="player-turn">
          {manager.currentPlayer.name} | {manager.currentPlayer.mark}
        </div>
      ) : null}
      {manager.winner ? <div>{manager.winner.name} wins!</div> : null}
      {game.message ? <div>{game.message}</div> : null}
      {manager.error ? (
        <div>
          {manager.error.message}{" "}
          {manager.currentPlayer.fouls.map(e => e.position).join(",")}
        </div>
      ) : null}
    </div>
  );
};

export default ManagedGame;
