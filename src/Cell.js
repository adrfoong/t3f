import React from "react";

const Cell = ({ cell, onClick = () => {} }) => {
  return (
    <div className="cell" onClick={() => onClick(cell)}>
      <div>{cell.position}</div>
      <div className="cell-mark">{cell.mark}</div>
    </div>
  );
};

export default Cell;
