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
  },
  always1: {
    label: "Always Cell #1",
    think: state => ({
      position: 1
    })
  }
};

export default Bots;
