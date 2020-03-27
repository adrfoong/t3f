import React from "react";

const Cell = ({ cell, onClick = () => {} }) => {
  return (
    <div
      className={`cell ${cell.mark ? "occupied" : ""}`}
      onClick={() => onClick(cell)}
    >
      <div className="cell-label">{cell.position}</div>
      <div className="cell-mark">{cell.mark}</div>
    </div>
  );
};

export default Cell;
