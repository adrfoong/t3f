import React from "react";

const Cell = ({ cell, onClick = () => {} }) => {
  return (
    <div className="cell" onClick={() => onClick(cell)}>
      <div className="cell-label">{cell.position}</div>
      <div className="cell-mark-container">
        <div className="cell-mark">{cell.mark}</div>
      </div>
    </div>
  );
};

export default Cell;
