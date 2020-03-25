import React from "react";
import Game from "./Game";
import "./App.css";

import GameManager from "./GameManager";
function App() {
  let [needsConfig, setNeedsConfig] = React.useState(false);
  let [players, setPlayers] = React.useState([]);
  let [mode, setMode] = React.useState("unset");
  // let players = [];
  function configPlayers(player) {
    // players = [...players, player];
    setPlayers([...players, player]);
  }

  React.useEffect(() => {
    if (players.length === 2) {
      setNeedsConfig(false);
    }
  }, [players]);

  let _players = [
    {
      id: "p1",
      name: (players.length && players[0].name) || "Brian",
      mark: (players.length && players[0].mark) || "🦅",
      url:
        "https://sgc618u5qf.execute-api.us-east-1.amazonaws.com/Prod/TicTacToeBot"
      // url: "https://jolly-yalow-bf3247.netlify.com/.netlify/functions/index"
    },
    {
      id: "p2",
      name: (players.length && players[1].name) || "Adrian",
      mark: (players.length && players[1].mark) || "🥳",
      url: "https://jolly-yalow-bf3247.netlify.com/.netlify/functions/index"

      // url:
      // "https://hu9gakacp8.execute-api.us-east-1.amazonaws.com/prod/hawkeye/jobs"
    }
  ];

  let manager = new GameManager(_players);
  manager.initGameState();
  let Component;
  if (mode === "unset") {
    Component = (
      <>
        <div>Welcome To T3F</div>
        <button onClick={() => setMode("interactive")}>Interactive</button>
        <button onClick={() => setMode("automated")}>Automated</button>
      </>
    );
  } else if (mode === "automated" && needsConfig) {
    Component = <Config configPlayers={configPlayers} />;
  } else {
    Component = <Game manager={manager} mode={mode} />;
  }

  return <div className="App">{Component}</div>;
}

const Config = props => {
  // let [players, setPlayers] = React.useState([]);

  return (
    <div className="config-container">
      <div>Config</div>
      <div className="config-form-container">
        <Form label="Player 1" submit={props.configPlayers} />
        <Form label="Player 2" submit={props.configPlayers} />
      </div>
      {/* <button onClick={() => props.configPlayers(false)}>Done</button> */}
    </div>
  );
};

const Form = props => {
  let [name, setName] = React.useState("");
  let [mark, setMark] = React.useState("");
  let [url, setUrl] = React.useState("");
  let [completed, setCompleted] = React.useState(false);

  return (
    <form className="config-form">
      <div className="config-form-label">{props.label}</div>
      <fieldset disabled={completed}>
        <label>
          Name
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            name="name"
          />
        </label>
        <label>
          Mark
          <input
            type="text"
            value={mark}
            onChange={e => setMark(e.target.value)}
            name="mark"
          />
        </label>
        <label>
          URL
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            name="url"
          />
        </label>
      </fieldset>

      {/* <input type="submit" value="Submit" /> */}
      <button
        onClick={e => {
          e.preventDefault();
          setCompleted(true);
          props.submit({ name, mark, url });
        }}
      >
        Done
      </button>
    </form>
  );
};

export default App;
