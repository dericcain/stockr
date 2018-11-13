const fetch = require('electron-fetch').default;

const get = symbol => `https://api.iextrading.com/1.0/stock/${symbol}/quote`;

module.exports = async (symbol) => {
  try {
    const res = await fetch(get(symbol));
    return res.json();
  } catch (e) {
    throw new Error(e);
  }
}
