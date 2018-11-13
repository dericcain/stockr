import React from 'react';

import './stock.styles.scss';

// const icon = isFavorite

const Stock = ({ symbol, price, change, chooseAsFavorite }) => (
  <li className="list-group-item">
    <div className="stock">
      <div className="left">
        <i className="icon icon-star-empty" onClick={() => chooseAsFavorite(symbol)} />
      </div>
      <div className="middle">
        {symbol}
      </div>
      <div className="right">
        {price} ({change})
      </div>
    </div>
  </li>
);

export default Stock;
