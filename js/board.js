import Block from './block.js';
import DataBus from './databus.js';
import { playSound, vibrate } from './utils.js';

const databus = new DataBus();

export default class Board {
  constructor(x, y, width) {
    this.rows = 8;
    this.cols = 8;
    this.x = x;
    this.y = y;
    this.width = width;
    this.blockSize = width / this.cols;
    
    this.grid = [];
    this.particles = [];
    this.scorePopups = [];
    
    this.selectedBlock = null;
    this.isAnimating = false;
    
    this.initGrid();
  }

  initGrid() {
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      let row = [];
      for (let c = 0; c < this.cols; c++) {
        let block;
        do {
          block = new Block(r, c, this.blockSize);
        } while (this.checkMatchForType(r, c, block.type.id));
        block.y = -this.blockSize * (this.rows - r); // 从上方掉落
        block.targetY = r * this.blockSize;
        row.push(block);
      }
      this.grid.push(row);
    }
  }

  checkMatchForType(r, c, typeId) {
    if (c >= 2 && this.grid[r] && this.grid[r][c-1] && this.grid[r][c-1].type.id === typeId && this.grid[r][c-2] && this.grid[r][c-2].type.id === typeId) return true;
    if (r >= 2 && this.grid[r-1] && this.grid[r-1][c] && this.grid[r-1][c].type.id === typeId && this.grid[r-2] && this.grid[r-2][c] && this.grid[r-2][c].type.id === typeId) return true;
    return false;
  }

  update(dt) {
    let moving = false;
    
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c]) {
          this.grid[r][c].update(dt);
          if (Math.abs(this.grid[r][c].x - this.grid[r][c].targetX) > 1 || 
              Math.abs(this.grid[r][c].y - this.grid[r][c].targetY) > 1 ||
              Math.abs(this.grid[r][c].scale - this.grid[r][c].targetScale) > 0.05) {
            moving = true;
          }
        }
      }
    }

    // 粒子动画
    this.particles.forEach(p => {
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.life -= dt;
    });
    this.particles = this.particles.filter(p => p.life > 0);

    // 得分弹字动画
    this.scorePopups.forEach(p => {
      p.y -= dt * 50;
      p.life -= dt;
    });
    this.scorePopups = this.scorePopups.filter(p => p.life > 0);

    if (!moving && this.isAnimating) {
      this.isAnimating = false;
      this.handleMatches();
    }
  }

  draw(ctx) {
    // 绘制底板
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Custom roundRect implementation
    const r = 20;
    const w = this.width;
    const h = this.width;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(w - r, 0);
    ctx.arcTo(w, 0, w, r, r);
    ctx.lineTo(w, h - r);
    ctx.arcTo(w, h, w - r, h, r);
    ctx.lineTo(r, h);
    ctx.arcTo(0, h, 0, h - r, r);
    ctx.lineTo(0, r);
    ctx.arcTo(0, 0, r, 0, r);
    ctx.closePath();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fill();

    // 裁剪区域，防止方块掉落时溢出
    ctx.save();
    ctx.clip();

    // 绘制方块
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.grid[row][col]) {
          this.grid[row][col].draw(ctx, 0, 0);
        }
      }
    }
    
    ctx.restore(); // 恢复裁剪

    // 绘制边框（在方块之上，形成方块在棋盘下方的视觉效果）
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.stroke();

    // 绘制粒子
    this.particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // 绘制得分弹字
    this.scorePopups.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`+${p.score}`, p.x, p.y);
    });
    ctx.globalAlpha = 1.0;

    ctx.restore(); // 恢复 translate
  }

  handleSwipe(startX, startY, endX, endY) {
    if (this.isAnimating || databus.gameState !== 'playing' || !this.selectedBlock) return;

    const dx = endX - startX;
    const dy = endY - startY;
    
    if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;

    const r1 = this.selectedBlock.row;
    const c1 = this.selectedBlock.col;
    let r2 = r1, c2 = c1;

    if (Math.abs(dx) > Math.abs(dy)) {
      c2 += dx > 0 ? 1 : -1;
    } else {
      r2 += dy > 0 ? 1 : -1;
    }

    if (r2 >= 0 && r2 < this.rows && c2 >= 0 && c2 < this.cols) {
      if (this.grid[r2][c2]) {
        this.swapBlocks(r1, c1, r2, c2);
      }
    }
  }

  handleTouchStart(x, y) {
    if (this.isAnimating || databus.gameState !== 'playing') return;

    const localX = x - this.x;
    const localY = y - this.y;

    if (localX < 0 || localX > this.width || localY < 0 || localY > this.width) return;

    const col = Math.floor(localX / this.blockSize);
    const row = Math.floor(localY / this.blockSize);

    if (this.selectedBlock) {
      const r1 = this.selectedBlock.row;
      const c1 = this.selectedBlock.col;
      
      if (Math.abs(r1 - row) + Math.abs(c1 - col) === 1) {
        if (this.grid[row][col]) {
          this.swapBlocks(r1, c1, row, col);
        } else {
          this.selectedBlock.selected = false;
          this.selectedBlock = null;
        }
      } else {
        this.selectedBlock.selected = false;
        if (this.grid[row][col]) {
          this.selectedBlock = this.grid[row][col];
          this.selectedBlock.selected = true;
          playSound('click');
        } else {
          this.selectedBlock = null;
        }
      }
    } else {
      if (this.grid[row][col]) {
        this.selectedBlock = this.grid[row][col];
        this.selectedBlock.selected = true;
        playSound('click');
      }
    }
  }

  swapBlocks(r1, c1, r2, c2) {
    this.saveSnapshot();
    this.isAnimating = true;
    this.selectedBlock.selected = false;
    this.selectedBlock = null;

    const b1 = this.grid[r1][c1];
    const b2 = this.grid[r2][c2];

    this.grid[r1][c1] = b2;
    this.grid[r2][c2] = b1;

    b1.row = r2; b1.col = c2;
    b2.row = r1; b2.col = c1;

    b1.targetX = c2 * this.blockSize; b1.targetY = r2 * this.blockSize;
    b2.targetX = c1 * this.blockSize; b2.targetY = r1 * this.blockSize;

    playSound('swap');

    // 检查是否匹配
    setTimeout(() => {
      const matches = this.findMatches();
      if (matches.length === 0) {
        // 退回
        this.grid[r1][c1] = b1;
        this.grid[r2][c2] = b2;
        b1.row = r1; b1.col = c1;
        b2.row = r2; b2.col = c2;
        b1.targetX = c1 * this.blockSize; b1.targetY = r1 * this.blockSize;
        b2.targetX = c2 * this.blockSize; b2.targetY = r2 * this.blockSize;
        playSound('error');
        this.isAnimating = true;
      } else {
        databus.moves--;
        databus.combo = 1;
        this.handleMatches(matches);
      }
    }, 300);
  }

  saveSnapshot() {
    databus.lastSnapshot = {
      grid: this.grid.map(row => row.map(b => b ? { typeId: b.type.id } : null)),
      score: databus.score,
      moves: databus.moves,
      zenRemaining: databus.zenRemaining
    };
  }

  restoreSnapshot() {
    if (!databus.lastSnapshot || this.isAnimating) return false;
    const snap = databus.lastSnapshot;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const bData = snap.grid[r][c];
        if (bData) {
          let b = new Block(r, c, this.blockSize, bData.typeId);
          b.targetX = c * this.blockSize;
          b.targetY = r * this.blockSize;
          b.x = b.targetX;
          b.y = b.targetY;
          b.scale = 1.0;
          this.grid[r][c] = b;
        } else {
          this.grid[r][c] = null;
        }
      }
    }
    databus.score = snap.score;
    databus.moves = snap.moves;
    databus.zenRemaining = snap.zenRemaining;
    databus.lastSnapshot = null;
    return true;
  }

  shuffle() {
    if (this.isAnimating) return false;
    let blocks = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c]) blocks.push(this.grid[r][c]);
      }
    }
    // Fisher-Yates shuffle
    for (let i = blocks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
    }
    
    let idx = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c]) {
          let b = blocks[idx++];
          this.grid[r][c] = b;
          b.row = r;
          b.col = c;
          b.targetX = c * this.blockSize;
          b.targetY = r * this.blockSize;
        }
      }
    }
    
    setTimeout(() => {
      this.handleMatches();
    }, 300);
    return true;
  }

  hint() {
    if (this.isAnimating) return false;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (c < this.cols - 1 && this.grid[r][c] && this.grid[r][c+1]) {
          this.swapBlocksVirtual(r, c, r, c+1);
          if (this.findMatches().length > 0) {
            this.swapBlocksVirtual(r, c, r, c+1);
            this.grid[r][c].selected = true;
            this.grid[r][c+1].selected = true;
            setTimeout(() => {
              if (this.grid[r][c]) this.grid[r][c].selected = false;
              if (this.grid[r][c+1]) this.grid[r][c+1].selected = false;
            }, 1000);
            return true;
          }
          this.swapBlocksVirtual(r, c, r, c+1);
        }
        if (r < this.rows - 1 && this.grid[r][c] && this.grid[r+1][c]) {
          this.swapBlocksVirtual(r, c, r+1, c);
          if (this.findMatches().length > 0) {
            this.swapBlocksVirtual(r, c, r+1, c);
            this.grid[r][c].selected = true;
            this.grid[r+1][c].selected = true;
            setTimeout(() => {
              if (this.grid[r][c]) this.grid[r][c].selected = false;
              if (this.grid[r+1][c]) this.grid[r+1][c].selected = false;
            }, 1000);
            return true;
          }
          this.swapBlocksVirtual(r, c, r+1, c);
        }
      }
    }
    return false;
  }

  swapBlocksVirtual(r1, c1, r2, c2) {
    const b1 = this.grid[r1][c1];
    const b2 = this.grid[r2][c2];
    this.grid[r1][c1] = b2;
    this.grid[r2][c2] = b1;
    if (b1) { b1.row = r2; b1.col = c2; }
    if (b2) { b2.row = r1; b2.col = c1; }
  }

  findMatches() {
    let matches = new Set();

    // 水平
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols - 2; c++) {
        let type = this.grid[r][c]?.type.id;
        if (!type) continue;
        if (this.grid[r][c+1]?.type.id === type && this.grid[r][c+2]?.type.id === type) {
          matches.add(this.grid[r][c]);
          matches.add(this.grid[r][c+1]);
          matches.add(this.grid[r][c+2]);
        }
      }
    }

    // 垂直
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows - 2; r++) {
        let type = this.grid[r][c]?.type.id;
        if (!type) continue;
        if (this.grid[r+1][c]?.type.id === type && this.grid[r+2][c]?.type.id === type) {
          matches.add(this.grid[r][c]);
          matches.add(this.grid[r+1][c]);
          matches.add(this.grid[r+2][c]);
        }
      }
    }

    return Array.from(matches);
  }

  handleMatches(matches = null) {
    if (!matches) matches = this.findMatches();
    
    if (matches.length > 0) {
      this.isAnimating = true;
      playSound('match');
      vibrate();

      let scoreAdd = matches.length * 10 * databus.combo;
      databus.score += scoreAdd;
      
      if (matches.length > 0) {
        const centerMatch = matches[Math.floor(matches.length / 2)];
        this.scorePopups.push({
          x: centerMatch.x + this.blockSize / 2,
          y: centerMatch.y,
          score: scoreAdd,
          life: 1.0
        });
      }

      matches.forEach(b => {
        b.isClearing = true;
        b.targetScale = 0.18;
        
        // 生成粒子
        for(let i=0; i<5; i++) {
          this.particles.push({
            x: b.x + this.blockSize/2,
            y: b.y + this.blockSize/2,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 1.0,
            color: b.type.color,
            size: Math.random() * 4 + 2
          });
        }
      });

      setTimeout(() => {
        this.removeAndCollapse(matches);
      }, 300);
    } else {
      databus.combo = 0;
      if (databus.moves <= 0 && databus.mode === 'classic') {
        databus.gameState = 'gameover';
      } else if (databus.mode === 'zen') {
        // Check if there are any possible moves left in zen mode
        if (!this.hasPossibleMoves()) {
          databus.gameState = 'gameover';
        }
      }
    }
  }

  hasPossibleMoves() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (!this.grid[r][c]) continue;
        
        // Check right swap
        if (c < this.cols - 1 && this.grid[r][c+1]) {
          this.swapBlocksVirtual(r, c, r, c+1);
          const matches = this.findMatches();
          this.swapBlocksVirtual(r, c, r, c+1); // swap back
          if (matches.length > 0) return true;
        }
        
        // Check down swap
        if (r < this.rows - 1 && this.grid[r+1][c]) {
          this.swapBlocksVirtual(r, c, r+1, c);
          const matches = this.findMatches();
          this.swapBlocksVirtual(r, c, r+1, c); // swap back
          if (matches.length > 0) return true;
        }
      }
    }
    return false;
  }

  removeAndCollapse(matches) {
    matches.forEach(b => {
      this.grid[b.row][b.col] = null;
      if (databus.mode === 'zen') databus.zenRemaining--;
    });

    for (let c = 0; c < this.cols; c++) {
      let emptySlots = 0;
      for (let r = this.rows - 1; r >= 0; r--) {
        if (this.grid[r][c] === null) {
          emptySlots++;
        } else if (emptySlots > 0) {
          let b = this.grid[r][c];
          this.grid[r + emptySlots][c] = b;
          this.grid[r][c] = null;
          b.row = r + emptySlots;
          b.targetY = b.row * this.blockSize;
        }
      }

      if (databus.mode === 'classic') {
        for (let i = 0; i < emptySlots; i++) {
          let b = new Block(i, c, this.blockSize);
          b.y = -(emptySlots - i) * this.blockSize;
          b.targetY = i * this.blockSize;
          b.scale = 0.7;
          b.targetScale = 1.0;
          this.grid[i][c] = b;
        }
      } else if (databus.mode === 'zen') {
        for (let i = emptySlots - 1; i >= 0; i--) {
          if (databus.blocksToSpawn > 0) {
            databus.blocksToSpawn--;
            let b = new Block(i, c, this.blockSize);
            b.y = -(emptySlots - i) * this.blockSize;
            b.targetY = i * this.blockSize;
            b.scale = 0.7;
            b.targetScale = 1.0;
            this.grid[i][c] = b;
          }
        }
      }
    }

    databus.combo++;
    this.isAnimating = true;
  }
}
