import React from "react";
import AutomatedBoard from "./AutomatedBoard";
import InteractiveBoard from "./InteractiveBoard";

const Game = ({ manager, mode }) => {
  let [game, setGame] = React.useState(manager.game);

  return (
    <div className="board-container">
      {mode === "automated" ? (
        <AutomatedBoard manager={manager} setGame={setGame} />
      ) : (
        <InteractiveBoard manager={manager} setGame={setGame} />
      )}
      <div>
        {manager.currentPlayer.name}
        --
        {manager.currentPlayer.mark}
      </div>
      {game.winner ? <div>{game.winner.name} wins!</div> : null}
      {game.message ? <div>{game.message}</div> : null}
      {game.error ? (
        <div>
          {game.error.message}{" "}
          {manager.currentPlayer.fouls.map(e => e.position).join(",")}
        </div>
      ) : null}
    </div>
  );
};

export default Game;
