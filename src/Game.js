import React from "react";
import AutomatedBoard from "./AutomatedBoard";
import Board from "./InteractiveBoard";
import GameManager from "./GameManager";

const Game = props => {
  let players = [
    {
      name: (props.players.length && props.players[0].name) || "Player 1",
      mark: (props.players.length && props.players[0].mark) || "🥳",
      url: "https://jolly-yalow-bf3247.netlify.com/.netlify/functions/index"
    },
    {
      name: (props.players.length && props.players[1].name) || "Player 2",
      mark: (props.players.length && props.players[1].mark) || "O",
      url: "https://jolly-yalow-bf3247.netlify.com/.netlify/functions/index"
    }
  ];

  let manager = new GameManager(players);
  manager.initGameState();
  let automate = true;
  return (
    <div className="board-container">
      {automate ? (
        <AutomatedBoard manager={manager} />
      ) : (
        <Board manager={manager} />
      )}
    </div>
  );
};

export default Game;
