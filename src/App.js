import React from "react";
import Game from "./Game";
import "./App.css";

function App() {
  let [needsConfig, setNeedsConfig] = React.useState(false);
  let [players, setPlayers] = React.useState([]);
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

  return (
    <div className="App">
      {needsConfig ? (
        <Config configPlayers={configPlayers} />
      ) : (
        <Game players={players} />
      )}
    </div>
  );
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
