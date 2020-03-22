import React from "react";
import Cell from "./Cell";

const Board = ({ game, onCellClick }) => {
  //   const [game, setGame] = React.useState(manager.game);

  return (
    <div className="board">
      {game.cells.map(cell => (
        <Cell key={cell.position} cell={cell} onClick={onCellClick} />
      ))}
      {game.winner ? <div>{game.winner.name} wins!</div> : null}
    </div>
  );
};

export default Board;
