import React from "react";
import Game from "./Game";
import { ReactComponent as Logo } from "./t3.svg";
import "./App.css";
import Bots from "./Bots";
import Select from "react-select";

function App() {
  let [needsConfig, setNeedsConfig] = React.useState(true);
  let [players, setPlayers] = React.useState([]);

  function configPlayers(players) {
    setPlayers(players);
  }

  React.useEffect(() => {
    if (players.length === 2) {
      setNeedsConfig(false);
    }
  }, [players]);

  let Component;
  if (needsConfig) {
    Component = <Config configPlayers={configPlayers} />;
  } else {
    Component = <Game players={players} />;
  }

  return (
    <div className="App">
      <div className="header">
        <Logo className="logo" />
      </div>
      {Component}
    </div>
  );
}

const LandingPage = ({ setMode }) => {
  return (
    <div className="landing">
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
        <Form submit={props.configPlayers} mode={props.mode} />
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

const Label = ({ align, className, children }) => (
  <label
    className={`label${align === "horizontal" ? " horizontal" : ""}${
      className ? " " + className : ""
    }`}
  >
    {children}
  </label>
);
const PlayerForm = ({ id, label, mode, player, dispatch }) => {
  const styles = {
    option: (provided, state) => ({
      ...provided,
      fontFamily: '"gaegu", cursive'
    }),
    control: (provided, state) => ({
      ...provided,
      borderWidth: "1px",
      borderStyle: "dashed",
      borderColor: id === "p1" ? "#ff8d00" : "#e88f0c",
      boxShadow: "none",
      "&:hover": { borderColor: "none" },
      fontFamily: '"gaegu", cursive'
    })
  };

  const options = [
    ...Object.entries(Bots).map(([k, v]) => ({
      value: k,
      label: v.label
    })),
    { value: "custom", label: "Custom" }
  ];

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
      <>
        <Label>Type</Label>
        <div className="checkbox-group">
          <div>
            <input
              name="type"
              type="checkbox"
              checked={player.type === "human"}
              onChange={e => dispatch({ type: "type", value: "human" })}
            />
            <Label align="horizontal">Human</Label>
          </div>
          <div>
            <input
              name="type"
              type="checkbox"
              checked={player.type === "bot"}
              onChange={e => dispatch({ type: "type", value: "bot" })}
            />
            <Label align="horizontal">Robot</Label>
          </div>
        </div>
      </>
      {player.type === "bot" ? (
        <>
          <Label>Algorithm</Label>
          <Select
            styles={styles}
            onChange={selected =>
              dispatch({ type: "bot", value: selected.value })
            }
            value={options.find(o => o.value === player.bot)}
            options={options}
          />
        </>
      ) : null}
      {player.bot === "custom" ? (
        <>
          <Label>URL</Label>
          <TextField
            className="dashed"
            value={player.url}
            onChange={e => dispatch({ type: "url", value: e.target.value })}
            name="url"
          />
        </>
      ) : null}
    </div>
  );
};

let reducer = (state, action) => {
  return { ...state, [action.type]: action.value };
};

const Form = props => {
  let [player1, dispatch1] = React.useReducer(reducer, {
    id: "p1",
    name: "Player 1",
    mark: "X",
    url: "",
    type: "human",
    bot: "nextAvailable"
  });
  let [player2, dispatch2] = React.useReducer(reducer, {
    id: "p2",
    name: "Player 2",
    mark: "O",
    url: "",
    type: "human",
    bot: "nextAvailable"
  });

  const submit = e => {
    e.preventDefault();
    props.submit([player1, player2]);
  };

  return (
    <form className="config-form" onSubmit={submit}>
      <PlayerForm
        id="p1"
        label="#1"
        mode={props.mode}
        player={player1}
        dispatch={dispatch1}
      />
      <PlayerForm
        id="p2"
        label="#2"
        mode={props.mode}
        player={player2}
        dispatch={dispatch2}
      />

      <button className="btn submit-button" onClick={submit}>
        Done
      </button>
    </form>
  );
};

export default App;
