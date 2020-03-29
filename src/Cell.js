import React from "react";

const Cell = ({ cell, onClick = () => {} }) => {
  return (
    <div
      className={`cell ${cell.mark ? "occupied" : ""}`}
      onClick={e => onClick(cell, e)}
      tabIndex="0"
    >
      <div className="cell-label">{cell.position}</div>
      <div className="cell-mark">{cell.mark}</div>
    </div>
  );
};

export default Cell;
