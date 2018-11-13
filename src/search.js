import * as JsSearch from 'js-search';

export default class Search {
  list = [];

  searcher;

  constructor() {
    this.buildList();
  }

  buildList() {
    this.searcher = new JsSearch.Search('symbol');
    this.searcher.addIndex('symbol');
    this.searcher.addIndex('name');

    fetch('https://api.iextrading.com/1.0/ref-data/symbols')
      .then(json => json.json())
      .then(result => {
        this.searcher.addDocuments(result);
      });

  }

  find(query) {
    return this.searcher.search(query);
  }
}
