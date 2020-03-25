import React from "react";
import Cell from "./Cell";

const Board = ({ board, onCellClick }) => {
  return (
    <div className="board">
      {board.cells.map(cell => (
        <Cell key={cell.position} cell={cell} onClick={onCellClick} />
      ))}
    </div>
  );
};

export default Board;
