import DataBus from './databus.js';
import { drawPanel, drawButton, drawIcon } from './utils.js';

const databus = new DataBus();

const orbCache = [];

function getCachedOrb(i) {
  if (orbCache[i]) return orbCache[i];
  
  let canvas;
  if (typeof wx !== 'undefined' && wx.createOffscreenCanvas) {
    canvas = wx.createOffscreenCanvas({type: '2d', width: 200, height: 200});
  } else if (typeof document !== 'undefined') {
    canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
  } else {
    return null;
  }

  const ctx = canvas.getContext('2d');
  const orbGrad = ctx.createRadialGradient(100, 100, 0, 100, 100, 100);
  orbGrad.addColorStop(0, `rgba(76, 175, 80, ${0.1 + i*0.02})`);
  orbGrad.addColorStop(1, 'rgba(76, 175, 80, 0)');
  
  ctx.fillStyle = orbGrad;
  ctx.beginPath();
  ctx.arc(100, 100, 100, 0, Math.PI * 2);
  ctx.fill();

  orbCache[i] = canvas;
  return canvas;
}

export default class GameInfo {
  constructor() {
    this.orbTime = 0;
  }

  draw(ctx) {
    this.orbTime += 0.01;
    this.drawBackground(ctx);

    if (databus.gameState === 'lobby') {
      this.drawLobby(ctx);
    } else if (databus.gameState === 'playing') {
      this.drawPlayingUI(ctx);
    } else if (databus.gameState === 'shop') {
      this.drawShop(ctx);
    } else if (databus.gameState === 'help') {
      this.drawHelp(ctx);
    } else if (databus.gameState === 'gameover') {
      this.drawGameOver(ctx);
    }
  }

  drawBackground(ctx) {
    const w = databus.screenWidth;
    const h = databus.screenHeight;

    if (!this.bgGrad) {
      this.bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      this.bgGrad.addColorStop(0, '#0f2027');
      this.bgGrad.addColorStop(0.5, '#203a43');
      this.bgGrad.addColorStop(1, '#2c5364');
    }
    ctx.fillStyle = this.bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 漂浮光球
    for (let i = 0; i < 5; i++) {
      const ox = w/2 + Math.sin(this.orbTime + i) * 100 * (i%2==0?1:-1);
      const oy = h/2 + Math.cos(this.orbTime * 0.8 + i) * 150;
      
      const cachedOrb = getCachedOrb(i);
      if (cachedOrb) {
        ctx.drawImage(cachedOrb, ox - 100, oy - 100);
      } else {
        const orbGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, 100);
        orbGrad.addColorStop(0, `rgba(76, 175, 80, ${0.1 + i*0.02})`);
        orbGrad.addColorStop(1, 'rgba(76, 175, 80, 0)');
        
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(ox, oy, 100, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  drawLobby(ctx) {
    const w = databus.screenWidth;
    const h = databus.screenHeight;
    const safeTop = databus.safeArea ? databus.safeArea.top : 44;
    const menuBottom = databus.menuButtonInfo ? databus.menuButtonInfo.bottom : 76;
    const topMargin = Math.max(safeTop, menuBottom) + 20;

    // Title
    drawIcon(ctx, 'game', w / 2, topMargin + 40, 80, '#4ADE80');

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('森林消消乐', w / 2, topMargin + 140);

    ctx.font = '18px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText('现代扁平版', w / 2, topMargin + 170);

    const cardW = 320;
    const cardX = w / 2 - cardW / 2;

    // Main Settings Card
    const cardY = topMargin + 220;
    drawPanel(ctx, cardX, cardY, cardW, 200, 24, '#FFFFFF');

    // Mode Selection inside Card
    ctx.fillStyle = '#888888';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('游戏模式', cardX + 24, cardY + 34);

    const modeY = cardY + 48;
    drawPanel(ctx, cardX + 20, modeY, cardW - 40, 48, 14, '#F5F7FA');
    const isZen = databus.mode === 'zen';
    drawButton(ctx, isZen ? w/2 : cardX + 24, modeY + 4, (cardW - 48)/2, 40, 20, '#FFFFFF', '#F3F4F6');
    
    ctx.fillStyle = isZen ? '#A0AAB5' : '#2C3E50';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('经典模式', w/2 - (cardW - 40)/4, modeY + 30);
    ctx.fillStyle = isZen ? '#2C3E50' : '#A0AAB5';
    ctx.fillText('定量模式', w/2 + (cardW - 40)/4, modeY + 30);

    // Difficulty Selection inside Card
    ctx.fillStyle = '#888888';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('难度选择', cardX + 24, modeY + 76);

    const diffY = modeY + 90;
    drawPanel(ctx, cardX + 20, diffY, cardW - 40, 48, 14, '#F5F7FA');
    const diffW = (cardW - 48) / 3;
    let diffOffset = databus.difficulty === 'easy' ? cardX + 24 : (databus.difficulty === 'normal' ? cardX + 24 + diffW : cardX + 24 + diffW * 2);
    drawButton(ctx, diffOffset, diffY + 4, diffW, 40, 20, '#FFFFFF', '#F3F4F6');
    
    ctx.textAlign = 'center';
    ctx.fillStyle = databus.difficulty === 'easy' ? '#2C3E50' : '#A0AAB5';
    ctx.fillText('简单', cardX + 24 + diffW/2, diffY + 30);
    ctx.fillStyle = databus.difficulty === 'normal' ? '#2C3E50' : '#A0AAB5';
    ctx.fillText('普通', cardX + 24 + diffW * 1.5, diffY + 30);
    ctx.fillStyle = databus.difficulty === 'hard' ? '#2C3E50' : '#A0AAB5';
    ctx.fillText('困难', cardX + 24 + diffW * 2.5, diffY + 30);

    // Start Button (Prominent)
    const btnY = cardY + 230;
    drawButton(ctx, cardX, btnY, cardW, 64, 32, '#34D399', '#059669');
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('开始游戏', w / 2, btnY + 40);

    // Sub Buttons
    const subY = btnY + 90;
    drawButton(ctx, cardX, subY, cardW/2 - 10, 54, 27, '#60A5FA', '#2563EB');
    drawButton(ctx, w/2 + 10, subY, cardW/2 - 10, 54, 27, '#FBBF24', '#D97706');
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 18px sans-serif';
    drawIcon(ctx, 'book', w/2 - cardW/4 - 20, subY + 27, 20, '#FFF');
    ctx.fillText('说明', w/2 - cardW/4 + 10, subY + 34);
    drawIcon(ctx, 'shop', w/2 + cardW/4 - 20, subY + 27, 20, '#FFF');
    ctx.fillText('商城', w/2 + cardW/4 + 10, subY + 34);

    // Points
    const pointsY = h * 0.92;
    drawPanel(ctx, w / 2 - 80, pointsY - 24, 160, 36, 18, 'rgba(255, 255, 255, 0.2)');
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`当前积分: ${databus.points}`, w / 2, pointsY);
  }

  drawPlayingUI(ctx) {
    const w = databus.screenWidth;
    const safeTop = databus.safeArea ? databus.safeArea.top : 44;
    const menuBottom = databus.menuButtonInfo ? databus.menuButtonInfo.bottom : 76;
    const menuTop = databus.menuButtonInfo ? databus.menuButtonInfo.top : safeTop;
    
    // Top Bar (Back & Mute)
    // Align with the menu button vertically if possible
    const topY = menuTop;
    const btnSize = databus.menuButtonInfo ? databus.menuButtonInfo.height : 32;
    
    drawButton(ctx, 20, topY, btnSize, btnSize, btnSize / 2, '#FFFFFF', '#F3F4F6');
    drawIcon(ctx, 'home', 20 + btnSize / 2, topY + btnSize / 2, btnSize * 0.5, '#4B5563');

    drawButton(ctx, 20 + btnSize + 10, topY, btnSize, btnSize, btnSize / 2, '#FFFFFF', '#F3F4F6');
    drawIcon(ctx, databus.isMuted ? 'mute' : 'sound', 20 + btnSize + 10 + btnSize / 2, topY + btnSize / 2, btnSize * 0.5, '#4B5563');

    // Header
    const headerY = menuBottom + 20;
    drawPanel(ctx, 20, headerY, w/2 - 30, 64, 16, '#FFFFFF');
    drawPanel(ctx, w/2 + 10, headerY, w/2 - 30, 64, 16, '#FFFFFF');

    ctx.fillStyle = '#888888';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('得分', 20 + (w/2-30)/2, headerY + 22);
    ctx.fillStyle = '#2C3E50';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(databus.score, 20 + (w/2-30)/2, headerY + 48);

    ctx.fillStyle = '#888888';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(databus.mode === 'classic' ? '步数' : '剩余', w/2 + 10 + (w/2-30)/2, headerY + 22);
    ctx.fillStyle = '#2C3E50';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(databus.mode === 'classic' ? databus.moves : databus.zenRemaining, w/2 + 10 + (w/2-30)/2, headerY + 48);

    // Footer Actions
    const actionW = (w - 80) / 3;
    const safeBottom = databus.safeArea ? databus.safeArea.bottom : databus.screenHeight - 34;
    const actionY = safeBottom - 90;
    
    const items = [
      { text: '打乱', icon: 'shuffle', count: databus.items.shuffle, color: '#A78BFA', bottom: '#7C3AED' },
      { text: '撤销', icon: 'undo', count: databus.items.undo, color: '#38BDF8', bottom: '#0284C7' },
      { text: '提示', icon: 'hint', count: databus.items.hint, color: '#FBBF24', bottom: '#D97706' }
    ];

    items.forEach((item, i) => {
      const ax = 20 + i * (actionW + 20);
      drawButton(ctx, ax, actionY, actionW, 60, 30, item.color, item.bottom);
      drawIcon(ctx, item.icon, ax + actionW/2, actionY + 22, 24, '#FFF');
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(item.text, ax + actionW/2, actionY + 48);

      // Badge
      if (item.count > 0) {
        ctx.fillStyle = '#F50057';
        ctx.beginPath();
        ctx.arc(ax + actionW - 5, actionY + 5, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(item.count, ax + actionW - 5, actionY + 9);
      } else {
        ctx.fillStyle = '#757575';
        ctx.beginPath();
        ctx.arc(ax + actionW - 5, actionY + 5, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('+', ax + actionW - 5, actionY + 9);
      }
    });
  }

  drawGameOver(ctx) {
    const w = databus.screenWidth;
    const h = databus.screenHeight;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, w, h);

    const py = h/2 - 160;
    drawPanel(ctx, w/2 - 150, py, 300, 320, 24, '#FFFFFF');
    
    ctx.fillStyle = '#2C3E50';
    ctx.textAlign = 'center';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('游戏结束', w/2, py + 56);

    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#888888';
    ctx.fillText('本次得分', w/2, py + 96);
    
    ctx.font = 'bold 54px sans-serif';
    ctx.fillStyle = '#00C853';
    ctx.fillText(databus.score, w/2, py + 146);

    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#FF9100';
    ctx.fillText(`获得积分: +${Math.floor(databus.score / 50)}`, w/2, py + 176);
    
    ctx.fillStyle = '#888888';
    const best = Math.max(databus.score, databus.bestScore || 0);
    ctx.fillText(`最佳记录: ${best}`, w/2, py + 200);

    // Buttons
    drawButton(ctx, w/2 - 130, py + 230, 120, 54, 27, '#F3F4F6', '#D1D5DB');
    drawIcon(ctx, 'home', w/2 - 90, py + 257, 20, '#4B5563');
    ctx.fillStyle = '#4B5563';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('大厅', w/2 - 50, py + 263);

    drawButton(ctx, w/2 + 10, py + 230, 120, 54, 27, '#34D399', '#059669');
    drawIcon(ctx, 'refresh', w/2 + 50, py + 257, 20, '#FFF');
    ctx.fillStyle = '#FFF';
    ctx.fillText('再来', w/2 + 90, py + 263);
  }

  drawShop(ctx) {
    const w = databus.screenWidth;
    const h = databus.screenHeight;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, w, h);

    const py = h/2 - 210;
    drawPanel(ctx, w/2 - 150, py, 300, 420, 24, '#FFFFFF');
    
    ctx.fillStyle = '#2C3E50';
    ctx.textAlign = 'center';
    ctx.font = 'bold 26px sans-serif';
    drawIcon(ctx, 'shop', w/2 - 60, py + 42, 24, '#2C3E50');
    ctx.fillText('积分商城', w/2 + 15, py + 50);
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#FF9100';
    ctx.fillText(`拥有积分: ${databus.points}`, w/2, py + 80);

    const items = [
      { text: `打乱 (3积分) 拥有:${databus.items.shuffle}`, icon: 'shuffle' },
      { text: `撤销 (2积分) 拥有:${databus.items.undo}`, icon: 'undo' },
      { text: `提示 (1积分) 拥有:${databus.items.hint}`, icon: 'hint' }
    ];
    items.forEach((item, i) => {
      drawButton(ctx, w/2 - 130, py + 110 + i * 70, 260, 50, 25, '#F3F4F6', '#D1D5DB');
      drawIcon(ctx, item.icon, w/2 - 100, py + 135 + i * 70, 20, '#4B5563');
      ctx.fillStyle = '#4B5563';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.text, w/2 - 70, py + 141 + i * 70);
    });

    drawButton(ctx, w/2 - 70, py + 340, 140, 50, 25, '#F87171', '#DC2626');
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('关闭', w/2, py + 370);
  }

  drawHelp(ctx) {
    const w = databus.screenWidth;
    const h = databus.screenHeight;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, w, h);

    const py = h/2 - 210;
    drawPanel(ctx, w/2 - 150, py, 300, 420, 24, '#FFFFFF');
    
    ctx.fillStyle = '#2C3E50';
    ctx.textAlign = 'center';
    ctx.font = 'bold 26px sans-serif';
    drawIcon(ctx, 'book', w/2 - 60, py + 42, 24, '#2C3E50');
    ctx.fillText('游戏说明', w/2 + 15, py + 50);

    ctx.fillStyle = '#546E7A';
    ctx.font = '15px sans-serif';
    ctx.textAlign = 'left';
    const lines = [
      '1. 滑动相邻方块进行交换。',
      '2. 3个或以上同色方块连线即可消除。',
      '3. 经典模式：限制步数，挑战高分。',
      '4. 定量模式：方块数量有限，消除完为止。',
      '5. 消除得分 = 个数 x 10 x 连击数。',
      '6. 游戏得分与积分按 50:1 转换。',
      '7. 积分可在商城兑换强力道具！'
    ];
    lines.forEach((line, i) => {
      ctx.fillText(line, w/2 - 130, py + 100 + i * 32);
    });

    ctx.textAlign = 'center';
    drawButton(ctx, w/2 - 70, py + 340, 140, 50, 25, '#FF5252', '#D32F2F');
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('关闭', w/2, py + 370);
  }
}
