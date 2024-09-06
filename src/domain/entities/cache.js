export default class Cache {
  constructor() {
    this.trending = {
      head: {
        time: 0,
        length: 0,
      },
      data: [],
    };
    this.stats = {
      last60sRequestTrends: 0,
      last30sRequestTrends: 0,
    };
    this.settings = {
      blacklist: {
        trends: [],
        words: [],
        users: [],
      },
      pinWord: {
        enabled: false,
        word: "",
        count: 0,
        position: 0,
      },
    };

    this.resetLast30sRequestCount = () => {
      this.stats.last30sRequestTrends = 0;
    };

    this.resetLast60sRequestCount = () => {
      this.stats.last60sRequestTrends = 0;
    };

    this.updateTrendingData = (data) => {
      this.trending.data = data;
      this.trending.head.time = Date.now();
      this.trending.head.length = this.trending.data.length;
    };
  }
}
