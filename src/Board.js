import React from "react";
import Cell from "./Cell";

const Board = ({ board, boardClassName, onCellClick }) => {
  return (
    <div className={`board ${boardClassName}`}>
      {board.cells.map(cell => (
        <Cell key={cell.position} cell={cell} onClick={onCellClick} />
      ))}
    </div>
  );
};

export default Board;
