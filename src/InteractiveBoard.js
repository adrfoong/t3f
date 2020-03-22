import React from "react";
import Board from "./Board";
const InteractiveBoard = ({ manager }) => {
  const [game, setGame] = React.useState(manager.game);

  function selectCell(cell) {
    if (manager.status === "inactive") {
      return;
    }

    manager.playMove(cell.position);
    setGame(manager.game);
  }

  return <Board game={game} onCellClick={selectCell} />;
};

export default InteractiveBoard;
