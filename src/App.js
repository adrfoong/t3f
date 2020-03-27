import React from "react";
import Game from "./Game";
import { ReactComponent as Logo } from "./t3.svg";
import "./App.css";

function App() {
  let [needsConfig, setNeedsConfig] = React.useState(true);
  let [players, setPlayers] = React.useState([]);
  let [mode, setMode] = React.useState("unset");
  // let players = [];
  function configPlayers(players) {
    // players = [...players, player];
    setPlayers(players);
  }

  React.useEffect(() => {
    if (players.length === 2) {
      setNeedsConfig(false);
    }
  }, [players]);

  let _players = [
    {
      id: "p1",
      name: players.length && players[0].name,
      mark: players.length && players[0].mark,
      url: ""
    },
    {
      id: "p2",
      name: players.length && players[1].name,
      mark: players.length && players[1].mark,
      url: ""
    }
  ];

  let Component;
  if (mode === "unset") {
    Component = <LandingPage setMode={setMode} />;
  } else if (needsConfig) {
    Component = <Config configPlayers={configPlayers} />;
  } else {
    Component = <Game players={players} mode={mode} />;
  }

  return <div className="App">{Component}</div>;
}

const LandingPage = ({ setMode }) => {
  return (
    <div className="landing">
      <div className="header">
        <Logo className="logo" />
      </div>
      <div className="main-menu">
        <button
          className="btn btn-interactive"
          onClick={() => setMode("interactive")}
        >
          Interactive
        </button>
        <button
          className="btn btn-automated"
          onClick={() => setMode("automated")}
        >
          Automated
        </button>
      </div>
    </div>
  );
};

const Config = props => {
  return (
    <div className="config-container">
      <div className="config-label">Player Setup</div>
      <div className="config-form-container">
        <Form submit={props.configPlayers} />
      </div>
    </div>
  );
};

const TextField = ({ value, onChange, className, ...otherProps }) => {
  return (
    <input
      type="text"
      className={`textfield ${className}`}
      value={value}
      onChange={onChange}
      {...otherProps}
    />
  );
};

const Label = ({ children }) => <label className="label">{children}</label>;
const PlayerForm = ({ id, label, player, dispatch }) => {
  return (
    <div id={id} className="player-form">
      <div className="config-form-label">{label}</div>
      <Label>Name</Label>
      <TextField
        className="dashed"
        value={player.name}
        onChange={e => dispatch({ type: "name", value: e.target.value })}
        name="name"
      />
      <Label>Mark</Label>
      <TextField
        className="dashed"
        value={player.mark}
        onChange={e => dispatch({ type: "mark", value: e.target.value })}
        name="mark"
      />
      <Label>URL</Label>
      <TextField
        className="dashed"
        value={player.url}
        onChange={e => dispatch({ type: "url", value: e.target.value })}
        name="url"
      />
    </div>
  );
};

let reducer = (state, action) => {
  return { ...state, [action.type]: action.value };
};

const Form = props => {
  let [player1, dispatch1] = React.useReducer(reducer, {
    name: "Player 1",
    mark: "X",
    url: ""
  });
  let [player2, dispatch2] = React.useReducer(reducer, {
    name: "Player 2",
    mark: "O",
    url: ""
  });

  const submit = e => {
    e.preventDefault();
    props.submit([player1, player2]);
  };

  return (
    <form className="config-form" onSubmit={submit}>
      <PlayerForm id="p1" label="#1" player={player1} dispatch={dispatch1} />
      <PlayerForm id="p2" label="#2" player={player2} dispatch={dispatch2} />

      <button className="btn submit-button" onClick={submit}>
        Done
      </button>
    </form>
  );
};

export default App;
