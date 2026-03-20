let instance;

export default class DataBus {
  constructor() {
    if (instance) return instance;
    instance = this;
    this.isMuted = false;
    this.points = 100; // 初始积分
    this.items = {
      shuffle: 3,
      undo: 3,
      hint: 3
    };
    this.bestScore = 0;
    this.reset();
  }

  reset() {
    this.gameState = 'lobby'; // lobby, playing, shop, help, gameover
    this.mode = 'classic'; // classic, zen
    this.difficulty = 'normal'; // easy, normal, hard
    
    this.score = 0;
    this.moves = 30; // 经典模式步数
    this.zenRemaining = 100; // 定量模式剩余方块数
    this.blocksToSpawn = 100 - 64; // 定量模式待生成的方块数 (总数100 - 初始棋盘64)
    
    this.combo = 0;
    this.lastSnapshot = null;
    
    if (typeof wx !== 'undefined') {
      const info = wx.getSystemInfoSync();
      this.screenWidth = info.windowWidth;
      this.screenHeight = info.windowHeight;
      this.safeArea = info.safeArea || { top: 44, bottom: info.windowHeight - 34, left: 0, right: info.windowWidth };
      try {
        this.menuButtonInfo = wx.getMenuButtonBoundingClientRect();
      } catch (e) {
        this.menuButtonInfo = { top: 44, bottom: 76, left: 278, right: 365, width: 87, height: 32 };
      }
    } else {
      this.screenWidth = 375;
      this.screenHeight = 812;
      this.safeArea = { top: 44, bottom: 778, left: 0, right: 375 };
      this.menuButtonInfo = { top: 44, bottom: 76, left: 278, right: 365, width: 87, height: 32 };
    }
  }
}
