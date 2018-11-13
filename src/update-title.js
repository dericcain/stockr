const electron = require('electron');
const path = require('path');

const assetsDirectory = path.join(__dirname, '../public/assets');

module.exports = (title) => {

  tray.setTitle(title);
  return tray;
};
