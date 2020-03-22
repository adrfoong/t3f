import React from "react";
import Board from "./Board";

const AutomatedBoard = ({ manager }) => {
  let [game, setGame] = React.useState(manager.game);
  let [started, setStarted] = React.useState(false);
  return (
    <div>
      <Board game={game} />
      <button
        disabled={started}
        onClick={() => {
          setStarted(true);
          manager.run(setGame);
        }}
      >
        Start
      </button>
    </div>
  );
};

export default AutomatedBoard;
