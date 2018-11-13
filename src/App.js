import React, { Component, Fragment } from 'react';

import Stock from './components/Stock';
import Search from './search';

const electron = window.require('electron').remote;
const settings = window.require('electron-settings');
const get = symbol => `https://api.iextrading.com/1.0/stock/${symbol}/quote`;

const getStock = async (symbol) => {
  try {
    const res = await fetch(get(symbol));
    return res.json();
  } catch (e) {
    throw new Error(e);
  }
};

class App extends Component {

  search;

  state = {
    search: '',
    watchList: [],
    searchResults: []
  };

  componentDidMount() {
    this.fetchWatchList();
    this.search = new Search();
  }

  get favoriteStock() {
    const favorite = settings.get('stocks.favorite');
    return this.state.watchList.find(s => s.symbol === favorite);
  }

  fetchWatchList() {
    const watchList = settings.get('stocks.watchList');
    const p = [];
    if (watchList) {
      watchList.forEach(s => {
        p.push(getStock(s));
      });
    }
    Promise.all(p).then(v => {
      if (typeof v === 'object') {
        this.setState({
          watchList: v.map(stock => ({
            symbol: stock.symbol,
            price: Number(stock.latestPrice).toFixed(2),
            change: stock.change
          }))
        }, () => {
          this.updateTrayTitle();
        });
      }
    });
  }

  updateTrayTitle = () => {
    const { symbol, price, change } = this.favoriteStock;
    const tray = electron.getGlobal('tray');
    tray.setTitle(`${symbol} ${price} (${change})`);
  };

  addStock = symbol => {
    const s = settings.get('stocks');
    s.watchList.push(symbol);
    s.watchList = Array.from(new Set(s.watchList));
    settings.set('stocks', s);
    this.fetchWatchList();
    this.setState({ search: '', searchResults: [] });
  };

  searchStock = e => {
    this.setState({ search: e.target.value }, () => {
      this.setState({ searchResults: this.search.find(this.state.search) });
    });
  };

  chooseAsFavorite = symbol => {
    const s = settings.get('stocks');
    s.favorite = symbol;
    settings.set('stocks', s);
    this.updateTrayTitle();
  };

  isFavorite = symbol => this.favoriteStock.symbol === symbol;

  render() {
    return (
      <Fragment>
        <div className="header-arrow"/>
        <div className="window">
          <header className="toolbar toolbar-header">
            <h1 className="title">Stockr</h1>
          </header>
          <div className="window-content">
            <div className="pane">
              <div>
                <div className="list-group">
                  <li className="list-group-header">
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Search for stocks..."
                      onChange={this.searchStock}
                      value={this.state.search}/>
                  </li>
                  {!this.state.search && this.state.watchList.map(({ symbol, price, change }) => (
                    <Stock
                      key={symbol}
                      symbol={symbol}
                      price={price}
                      change={change}
                      chooseAsFavorite={this.chooseAsFavorite}
                      isFavorite={this.isFavorite(symbol)}
                    />
                  ))}
                  {this.state.search && this.state.searchResults.map(result => (
                    <li className="list-group-item" key={result.symbol}>
                      <span className="media-object pull-left">{result.symbol}</span>
                      <div className="media-body">
                        <p>{result.name}</p>
                      </div>
                      <div className="pull-right">
                        <span className="icon icon-plus" onClick={() => this.addStock(result.symbol)} />
                      </div>
                    </li>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default App;
