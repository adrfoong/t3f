import React from "react";

const Cell = ({ cell, onClick = () => {} }) => {
  return (
    <div className="cell" onClick={() => onClick(cell)}>
      <div>{cell.position}</div>
      <div>{cell.owner && cell.owner.mark}</div>
    </div>
  );
};

export default Cell;
