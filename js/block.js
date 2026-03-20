import { lerp } from './utils.js';

const TYPES = [
  { id: 1, name: 'Ruby', color: '#FF1744', gradient: ['#FF8A80', '#D50000'] },
  { id: 2, name: 'Sapphire', color: '#2979FF', gradient: ['#82B1FF', '#2962FF'] },
  { id: 3, name: 'Emerald', color: '#00E676', gradient: ['#B9F6CA', '#00C853'] },
  { id: 4, name: 'Amethyst', color: '#D500F9', gradient: ['#EA80FC', '#AA00FF'] },
  { id: 5, name: 'Topaz', color: '#FFEA00', gradient: ['#FFFF8D', '#FFD600'] },
  { id: 6, name: 'Candy', color: '#F50057', gradient: ['#FF80AB', '#C51162'] }
];

// Cache for pre-rendered blocks to improve performance
const blockCache = {};

function getCachedBlockCanvas(type, size) {
  const key = `${type.id}_${size}`;
  if (blockCache[key]) return blockCache[key];

  let canvas;
  if (typeof wx !== 'undefined' && wx.createOffscreenCanvas) {
    canvas = wx.createOffscreenCanvas({type: '2d', width: size, height: size});
  } else if (typeof document !== 'undefined') {
    canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
  } else {
    return null; // Fallback if no canvas creation method is available
  }

  const ctx = canvas.getContext('2d');
  const r = size / 2;
  const padding = size * 0.15;
  const drawSize = size - padding * 2;
  const dr = drawSize / 2;

  ctx.translate(r, r);

  const grad = ctx.createLinearGradient(-dr, -dr, dr, dr);
  grad.addColorStop(0, type.gradient[0]);
  grad.addColorStop(1, type.gradient[1]);

  ctx.beginPath();
  const sr = dr * 0.85;
  const rr = sr * 0.25;
  ctx.moveTo(-sr + rr, -sr);
  ctx.lineTo(sr - rr, -sr);
  ctx.arcTo(sr, -sr, sr, -sr + rr, rr);
  ctx.lineTo(sr, sr - rr);
  ctx.arcTo(sr, sr, sr - rr, sr, rr);
  ctx.lineTo(-sr + rr, sr);
  ctx.arcTo(-sr, sr, -sr, sr - rr, rr);
  ctx.lineTo(-sr, -sr + rr);
  ctx.arcTo(-sr, -sr, -sr + rr, -sr, rr);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  const hr = dr * 0.55;
  const hrr = hr * 0.2;
  ctx.moveTo(-hr + hrr, -hr);
  ctx.lineTo(hr - hrr, -hr);
  ctx.arcTo(hr, -hr, hr, -hr + hrr, hrr);
  ctx.lineTo(hr, hr - hrr);
  ctx.arcTo(hr, hr, hr - hrr, hr, hrr);
  ctx.lineTo(-hr + hrr, hr);
  ctx.arcTo(-hr, hr, -hr, hr - hrr, hrr);
  ctx.lineTo(-hr, -hr + hrr);
  ctx.arcTo(-hr, -hr, -hr + hrr, -hr, hrr);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fill();

  blockCache[key] = canvas;
  return canvas;
}

export default class Block {
  constructor(row, col, size, typeId = null) {
    this.row = row;
    this.col = col;
    this.size = size;
    
    this.type = typeId ? TYPES.find(t => t.id === typeId) : TYPES[Math.floor(Math.random() * TYPES.length)];
    
    this.x = col * size;
    this.y = row * size;
    this.targetX = this.x;
    this.targetY = this.y;
    
    this.scale = 0.1; // 初始缩放用于入场动画
    this.targetScale = 1.0;
    
    this.isClearing = false;
    this.selected = false;
  }

  update(dt) {
    // 平滑移动
    this.x = lerp(this.x, this.targetX, dt * 15);
    this.y = lerp(this.y, this.targetY, dt * 15);
    
    // 平滑缩放
    this.scale = lerp(this.scale, this.targetScale, dt * 15);
  }

  draw(ctx, offsetX, offsetY) {
    if (this.scale < 0.05) return;

    ctx.save();
    ctx.translate(offsetX + this.x + this.size / 2, offsetY + this.y + this.size / 2);
    ctx.scale(this.scale, this.scale);

    const cachedCanvas = getCachedBlockCanvas(this.type, this.size);
    if (cachedCanvas) {
      ctx.drawImage(cachedCanvas, -this.size / 2, -this.size / 2);
    } else {
      // Fallback if caching fails
      const padding = this.size * 0.15;
      const drawSize = this.size - padding * 2;
      const r = drawSize / 2;

      const grad = ctx.createLinearGradient(-r, -r, r, r);
      grad.addColorStop(0, this.type.gradient[0]);
      grad.addColorStop(1, this.type.gradient[1]);

      ctx.beginPath();
      const sr = r * 0.85;
      const rr = sr * 0.25;
      ctx.moveTo(-sr + rr, -sr);
      ctx.lineTo(sr - rr, -sr);
      ctx.arcTo(sr, -sr, sr, -sr + rr, rr);
      ctx.lineTo(sr, sr - rr);
      ctx.arcTo(sr, sr, sr - rr, sr, rr);
      ctx.lineTo(-sr + rr, sr);
      ctx.arcTo(-sr, sr, -sr, sr - rr, rr);
      ctx.lineTo(-sr, -sr + rr);
      ctx.arcTo(-sr, -sr, -sr + rr, -sr, rr);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      const hr = r * 0.55;
      const hrr = hr * 0.2;
      ctx.moveTo(-hr + hrr, -hr);
      ctx.lineTo(hr - hrr, -hr);
      ctx.arcTo(hr, -hr, hr, -hr + hrr, hrr);
      ctx.lineTo(hr, hr - hrr);
      ctx.arcTo(hr, hr, hr - hrr, hr, hrr);
      ctx.lineTo(-hr + hrr, hr);
      ctx.arcTo(-hr, hr, -hr, hr - hrr, hrr);
      ctx.lineTo(-hr, -hr + hrr);
      ctx.arcTo(-hr, -hr, -hr + hrr, -hr, hrr);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fill();
    }

    // 选中态高亮
    if (this.selected) {
      const time = Date.now() / 150;
      const pulse = (Math.sin(time) + 1) / 2; // 0 to 1
      
      const padding = this.size * 0.15;
      const drawSize = this.size - padding * 2;
      const r = drawSize / 2;
      const sr = r * 0.85;
      const rr = sr * 0.25;

      ctx.beginPath();
      ctx.moveTo(-sr + rr, -sr);
      ctx.lineTo(sr - rr, -sr);
      ctx.arcTo(sr, -sr, sr, -sr + rr, rr);
      ctx.lineTo(sr, sr - rr);
      ctx.arcTo(sr, sr, sr - rr, sr, rr);
      ctx.lineTo(-sr + rr, sr);
      ctx.arcTo(-sr, sr, -sr, sr - rr, rr);
      ctx.lineTo(-sr, -sr + rr);
      ctx.arcTo(-sr, -sr, -sr + rr, -sr, rr);
      ctx.closePath();

      ctx.lineWidth = 4;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 + pulse * 0.4})`;
      ctx.stroke();
      
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();
    }

    ctx.restore();
  }
}
