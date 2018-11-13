import React from 'react';

import './stock.styles.scss';

const Stock = ({ symbol, price, change, chooseAsFavorite, isFavorite }) => (
  <li className="list-group-item">
    <div className="stock">
      <div className="left">
        <i className={`icon ${isFavorite ? 'icon-star' : 'icon-star-empty'}`} onClick={() => chooseAsFavorite(symbol)} />
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
