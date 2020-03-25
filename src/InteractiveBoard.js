import React from "react";
import Board from "./Board";
const InteractiveBoard = ({ manager, setGame }) => {
  function selectCell(cell) {
    if (manager.game.status === "inactive") {
      return;
    }

    manager.playMove(cell.position);
    setGame(manager.game);
  }
  return <Board board={manager.game.board} onCellClick={selectCell} />;
};

export default InteractiveBoard;
