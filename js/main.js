import DataBus from './databus.js';
import Board from './board.js';
import GameInfo from './gameinfo.js';
import { playSound } from './utils.js';

const databus = new DataBus();

export default class Main {
  constructor() {
    const dpr = (typeof wx !== 'undefined' && wx.getSystemInfoSync) ? wx.getSystemInfoSync().pixelRatio : (window.devicePixelRatio || 1);
    
    if (typeof wx !== 'undefined') {
      this.canvas = wx.createCanvas();
      databus.screenWidth = this.canvas.width;
      databus.screenHeight = this.canvas.height;
      this.canvas.width = databus.screenWidth * dpr;
      this.canvas.height = databus.screenHeight * dpr;
    } else {
      this.canvas = document.createElement('canvas');
      document.body.appendChild(this.canvas);
      databus.screenWidth = window.innerWidth;
      databus.screenHeight = window.innerHeight;
      this.canvas.width = databus.screenWidth * dpr;
      this.canvas.height = databus.screenHeight * dpr;
      this.canvas.style.width = `${databus.screenWidth}px`;
      this.canvas.style.height = `${databus.screenHeight}px`;
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.ctx.scale(dpr, dpr);
    
    this.gameinfo = new GameInfo();
    this.board = null;

    this.lastTime = Date.now();
    this.touchStartX = 0;
    this.touchStartY = 0;
    
    this.bindEvents();
    this.loop();
  }

  initGame() {
    databus.reset();
    databus.gameState = 'playing';
    const boardWidth = databus.screenWidth - 40;
    const boardY = (databus.screenHeight - boardWidth) / 2;
    this.board = new Board(20, boardY, boardWidth);
  }

  bindEvents() {
    const handleTouchStart = (e) => {
      if (e.preventDefault) e.preventDefault();
      const touch = e.touches ? e.touches[0] : e;
      const x = touch.clientX;
      const y = touch.clientY;
      const w = databus.screenWidth;
      const h = databus.screenHeight;
      this.touchStartX = x;
      this.touchStartY = y;

      if (databus.gameState === 'lobby') {
        const safeTop = databus.safeArea ? databus.safeArea.top : 44;
        const menuBottom = databus.menuButtonInfo ? databus.menuButtonInfo.bottom : 76;
        const topMargin = Math.max(safeTop, menuBottom) + 20;
        const cardY = topMargin + 220;
        const modeY = cardY + 48;
        const diffY = modeY + 90;
        const btnY = cardY + 230;
        const subY = btnY + 90;

        // 模式选择
        if (y >= modeY && y <= modeY + 48 && x >= w/2 - 140 && x <= w/2 + 140) {
          playSound('click');
          databus.mode = x < w/2 ? 'classic' : 'zen';
          return;
        }
        // 难度选择
        if (y >= diffY && y <= diffY + 48 && x >= w/2 - 140 && x <= w/2 + 140) {
          playSound('click');
          if (x < w/2 - 46) databus.difficulty = 'easy';
          else if (x > w/2 + 46) databus.difficulty = 'hard';
          else databus.difficulty = 'normal';
          return;
        }
        // 开始游戏
        if (y >= btnY && y <= btnY + 64 && x >= w/2 - 160 && x <= w/2 + 160) {
          playSound('click');
          this.initGame();
          return;
        }
        // 游戏说明 & 商城
        if (y >= subY && y <= subY + 54) {
          if (x >= w/2 - 160 && x <= w/2 - 10) {
            playSound('click');
            databus.gameState = 'help';
          } else if (x >= w/2 + 10 && x <= w/2 + 160) {
            playSound('click');
            databus.gameState = 'shop';
          }
          return;
        }
      } else if (databus.gameState === 'shop') {
        const py = h/2 - 210;
        // 关闭按钮
        if (y >= py + 340 && y <= py + 390 && x >= w/2 - 70 && x <= w/2 + 70) {
          playSound('click');
          databus.gameState = 'lobby';
          return;
        }
        // 购买 打乱
        if (y >= py + 110 && y <= py + 160 && x >= w/2 - 130 && x <= w/2 + 130) {
          if (databus.points >= 3) { databus.points -= 3; databus.items.shuffle++; playSound('match'); } else { playSound('error'); }
        }
        // 购买 撤销
        if (y >= py + 180 && y <= py + 230 && x >= w/2 - 130 && x <= w/2 + 130) {
          if (databus.points >= 2) { databus.points -= 2; databus.items.undo++; playSound('match'); } else { playSound('error'); }
        }
        // 购买 提示
        if (y >= py + 250 && y <= py + 300 && x >= w/2 - 130 && x <= w/2 + 130) {
          if (databus.points >= 1) { databus.points -= 1; databus.items.hint++; playSound('match'); } else { playSound('error'); }
        }
      } else if (databus.gameState === 'help') {
        const py = h/2 - 210;
        // 关闭按钮
        if (y >= py + 340 && y <= py + 390 && x >= w/2 - 70 && x <= w/2 + 70) {
          playSound('click');
          databus.gameState = 'lobby';
          return;
        }
      } else if (databus.gameState === 'playing') {
        const safeTop = databus.safeArea ? databus.safeArea.top : 44;
        const menuTop = databus.menuButtonInfo ? databus.menuButtonInfo.top : safeTop;
        const btnSize = databus.menuButtonInfo ? databus.menuButtonInfo.height : 32;
        
        // Back Button
        if (y >= menuTop && y <= menuTop + btnSize && x >= 20 && x <= 20 + btnSize) {
          playSound('click');
          databus.gameState = 'lobby';
          return;
        }
        // Mute Button
        if (y >= menuTop && y <= menuTop + btnSize && x >= 20 + btnSize + 10 && x <= 20 + btnSize * 2 + 10) {
          playSound('click');
          databus.isMuted = !databus.isMuted;
          return;
        }

        // Footer Actions
        const actionW = (w - 80) / 3;
        const safeBottom = databus.safeArea ? databus.safeArea.bottom : databus.screenHeight - 34;
        const actionY = safeBottom - 90;
        
        if (y >= actionY && y <= actionY + 60) {
          if (x >= 20 && x <= 20 + actionW) {
            // Shuffle
            if (databus.items.shuffle > 0 && this.board && !this.board.isAnimating) {
              databus.items.shuffle--;
              this.board.shuffle();
              playSound('click');
            } else {
              playSound('error');
            }
            return;
          } else if (x >= 40 + actionW && x <= 40 + actionW * 2) {
            // Undo
            if (databus.items.undo > 0 && this.board && !this.board.isAnimating && databus.lastSnapshot) {
              databus.items.undo--;
              this.board.restoreSnapshot();
              playSound('click');
            } else {
              playSound('error');
            }
            return;
          } else if (x >= 60 + actionW * 2 && x <= 60 + actionW * 3) {
            // Hint
            if (databus.items.hint > 0 && this.board && !this.board.isAnimating) {
              if (this.board.hint()) {
                databus.items.hint--;
                playSound('click');
              } else {
                playSound('error');
              }
            } else {
              playSound('error');
            }
            return;
          }
        }

        if (this.board) {
          this.board.handleTouchStart(x, y);
        }
      } else if (databus.gameState === 'gameover') {
        const py = h/2 - 160;
        
        // 返回大厅
        if (y >= py + 230 && y <= py + 284 && x >= w/2 - 130 && x <= w/2 - 10) {
          playSound('click');
          databus.points += Math.floor(databus.score / 50);
          if (databus.score > databus.bestScore) databus.bestScore = databus.score;
          databus.gameState = 'lobby';
          return;
        }
        
        // 再来一局
        if (y >= py + 230 && y <= py + 284 && x >= w/2 + 10 && x <= w/2 + 130) {
          playSound('click');
          databus.points += Math.floor(databus.score / 50);
          if (databus.score > databus.bestScore) databus.bestScore = databus.score;
          this.initGame();
          return;
        }
      }
    };

    const handleTouchEnd = (e) => {
      if (e.preventDefault) e.preventDefault();
      const touch = e.changedTouches ? e.changedTouches[0] : e;
      const x = touch.clientX;
      const y = touch.clientY;
      
      if (databus.gameState === 'playing' && this.board) {
        this.board.handleSwipe(this.touchStartX, this.touchStartY, x, y);
      }
    };

    if (typeof wx !== 'undefined') {
      wx.onTouchStart(handleTouchStart);
      wx.onTouchEnd(handleTouchEnd);
    } else {
      this.canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      this.canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
      this.canvas.addEventListener('mousedown', handleTouchStart);
      this.canvas.addEventListener('mouseup', handleTouchEnd);
    }
  }

  update(dt) {
    if (databus.gameState === 'playing' && this.board) {
      this.board.update(dt);
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.gameinfo.draw(this.ctx);
    
    if (databus.gameState === 'playing' && this.board) {
      this.board.draw(this.ctx);
    }
  }

  loop() {
    const now = Date.now();
    const dt = (now - this.lastTime) / 1000.0;
    this.lastTime = now;

    this.update(dt);
    this.render();

    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(this.loop.bind(this));
    } else if (typeof wx !== 'undefined') {
      wx.requestAnimationFrame(this.loop.bind(this));
    }
  }
}
