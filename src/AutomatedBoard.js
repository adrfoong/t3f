import React from "react";
import Board from "./Board";

const AutomatedBoard = ({ manager, setGame }) => {
  let [started, setStarted] = React.useState(false);
  return (
    <div>
      <Board board={manager.game.board} />
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
