export const responseWrapper = bot => async state => {
  return {
    json() {
      return bot.think(state);
    }
  };
};

const Bots = {
  nextAvailable: {
    label: "Next Available",
    think: state => ({
      position: state.cells.findIndex(cell => !cell.playerId)
    })
  }
};

export default Bots;
