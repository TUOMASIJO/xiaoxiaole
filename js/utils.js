import DataBus from './databus.js';

export const lerp = (a, b, t) => a + (b - a) * t;

export const playSound = (name) => {
  const databus = new DataBus();
  if (databus.isMuted) return;
  // 占位音效播放
  console.log(`Playing sound: ${name}`);
  // if (typeof wx !== 'undefined') {
  //   const audio = wx.createInnerAudioContext();
  //   audio.src = `audio/${name}.wav`;
  //   audio.play();
  // }
};

export const vibrate = () => {
  const databus = new DataBus();
  if (databus.isMuted) return;
  if (typeof wx !== 'undefined' && wx.vibrateShort) {
    wx.vibrateShort({ type: 'light' });
  }
};

export const drawPanel = (ctx, x, y, w, h, radius, bgColor) => {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.arcTo(x + w, y, x + w, y + radius, radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
  ctx.lineTo(x + radius, y + h);
  ctx.arcTo(x, y + h, x, y + h - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
  
  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetY = 5;
  
  ctx.fillStyle = bgColor || 'rgba(255, 255, 255, 0.15)';
  ctx.fill();
  
  ctx.shadowColor = 'transparent';
  
  const borderGrad = ctx.createLinearGradient(x, y, x + w, y + h);
  borderGrad.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
  borderGrad.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = borderGrad;
  ctx.stroke();
  
  ctx.restore();
};

export const drawButton = (ctx, x, y, w, h, radius, bgColor, bottomColor) => {
  ctx.save();
  
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.arcTo(x + w, y, x + w, y + radius, radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
  ctx.lineTo(x + radius, y + h);
  ctx.arcTo(x, y + h, x, y + h - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
  
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, bgColor || 'rgba(255, 255, 255, 0.25)');
  grad.addColorStop(1, bottomColor || 'rgba(255, 255, 255, 0.1)');
  
  ctx.fillStyle = grad;
  ctx.fill();
  
  ctx.shadowColor = 'transparent';
  
  const borderGrad = ctx.createLinearGradient(x, y, x + w, y + h);
  borderGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
  borderGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
  borderGrad.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
  
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = borderGrad;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + radius, y + 1.5);
  ctx.lineTo(x + w - radius, y + 1.5);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  
  ctx.restore();
};

export const drawIcon = (ctx, type, x, y, size, color) => {
  ctx.save();
  ctx.translate(x, y);
  
  const s = size / 2;
  
  // Default style
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (type) {
    case 'game':
      // Colorful Game Controller
      const ctrlGrad = ctx.createLinearGradient(-s, -s, s, s);
      ctrlGrad.addColorStop(0, '#FF6B6B');
      ctrlGrad.addColorStop(1, '#4ECDC4');
      
      ctx.fillStyle = ctrlGrad;
      ctx.beginPath();
      ctx.moveTo(-s*0.8, -s*0.3);
      ctx.lineTo(s*0.8, -s*0.3);
      ctx.arcTo(s, -s*0.3, s, s*0.5, s*0.4);
      ctx.arcTo(s, s*0.5, s*0.4, s*0.5, s*0.4);
      ctx.lineTo(-s*0.4, s*0.5);
      ctx.arcTo(-s, s*0.5, -s, -s*0.3, s*0.4);
      ctx.closePath();
      ctx.fill();
      
      // D-Pad
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillRect(-s*0.6, s*0.05, s*0.3, s*0.1);
      ctx.fillRect(-s*0.55, -s*0.05, s*0.1, s*0.3);
      
      // Buttons
      ctx.beginPath(); ctx.arc(s*0.4, -s*0.05, s*0.12, 0, Math.PI*2); ctx.fillStyle = '#FFE66D'; ctx.fill();
      ctx.beginPath(); ctx.arc(s*0.65, s*0.2, s*0.12, 0, Math.PI*2); ctx.fillStyle = '#FF6B6B'; ctx.fill();
      break;

    case 'home':
      ctx.fillStyle = color || '#FFF';
      ctx.beginPath();
      ctx.moveTo(0, -s*0.7);
      ctx.lineTo(s*0.7, -s*0.1);
      ctx.lineTo(s*0.5, -s*0.1);
      ctx.lineTo(s*0.5, s*0.6);
      ctx.lineTo(-s*0.5, s*0.6);
      ctx.lineTo(-s*0.5, -s*0.1);
      ctx.lineTo(-s*0.7, -s*0.1);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(-s*0.2, s*0.2, s*0.4, s*0.4);
      break;

    case 'sound':
      ctx.fillStyle = color || '#FFF';
      ctx.beginPath();
      ctx.moveTo(-s*0.4, -s*0.2);
      ctx.lineTo(-s*0.1, -s*0.2);
      ctx.lineTo(s*0.3, -s*0.6);
      ctx.lineTo(s*0.3, s*0.6);
      ctx.lineTo(-s*0.1, s*0.2);
      ctx.lineTo(-s*0.4, s*0.2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = color || '#FFF';
      ctx.lineWidth = s*0.15;
      ctx.beginPath(); ctx.arc(s*0.2, 0, s*0.4, -Math.PI/3, Math.PI/3); ctx.stroke();
      ctx.beginPath(); ctx.arc(s*0.2, 0, s*0.7, -Math.PI/3, Math.PI/3); ctx.stroke();
      break;

    case 'mute':
      ctx.fillStyle = color || '#FFF';
      ctx.beginPath();
      ctx.moveTo(-s*0.4, -s*0.2);
      ctx.lineTo(-s*0.1, -s*0.2);
      ctx.lineTo(s*0.3, -s*0.6);
      ctx.lineTo(s*0.3, s*0.6);
      ctx.lineTo(-s*0.1, s*0.2);
      ctx.lineTo(-s*0.4, s*0.2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#FF6B6B';
      ctx.lineWidth = s*0.2;
      ctx.beginPath(); ctx.moveTo(s*0.4, -s*0.3); ctx.lineTo(s*0.9, s*0.3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s*0.9, -s*0.3); ctx.lineTo(s*0.4, s*0.3); ctx.stroke();
      break;

    case 'shuffle':
      ctx.strokeStyle = color || '#FFF';
      ctx.lineWidth = s*0.2;
      ctx.beginPath();
      ctx.moveTo(-s*0.6, -s*0.3); ctx.lineTo(-s*0.2, -s*0.3);
      ctx.bezierCurveTo(s*0.2, -s*0.3, -s*0.2, s*0.4, s*0.4, s*0.4);
      ctx.lineTo(s*0.6, s*0.4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s*0.3, s*0.1); ctx.lineTo(s*0.6, s*0.4); ctx.lineTo(s*0.3, s*0.7); ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(-s*0.6, s*0.4); ctx.lineTo(-s*0.2, s*0.4);
      ctx.bezierCurveTo(s*0.2, s*0.4, -s*0.2, -s*0.3, s*0.4, -s*0.3);
      ctx.lineTo(s*0.6, -s*0.3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s*0.3, -s*0.6); ctx.lineTo(s*0.6, -s*0.3); ctx.lineTo(s*0.3, 0); ctx.stroke();
      break;

    case 'undo':
      ctx.strokeStyle = color || '#FFF';
      ctx.lineWidth = s*0.2;
      ctx.beginPath();
      ctx.arc(0, s*0.1, s*0.5, Math.PI*0.8, Math.PI * 2.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s*0.8, -s*0.1); ctx.lineTo(-s*0.4, s*0.2); ctx.lineTo(0, -s*0.1);
      ctx.stroke();
      break;

    case 'hint':
      // Lightbulb
      ctx.fillStyle = '#FFE66D';
      ctx.beginPath();
      ctx.arc(0, -s*0.2, s*0.4, Math.PI*0.8, Math.PI*2.2);
      ctx.lineTo(s*0.2, s*0.4);
      ctx.lineTo(-s*0.2, s*0.4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#4ECDC4';
      ctx.fillRect(-s*0.2, s*0.45, s*0.4, s*0.15);
      ctx.beginPath(); ctx.arc(0, s*0.6, s*0.15, 0, Math.PI*2); ctx.fill();
      break;

    case 'book':
      ctx.fillStyle = color || '#FFF';
      ctx.beginPath();
      ctx.moveTo(-s*0.7, -s*0.5);
      ctx.lineTo(-s*0.1, -s*0.4);
      ctx.lineTo(-s*0.1, s*0.6);
      ctx.lineTo(-s*0.7, s*0.5);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s*0.7, -s*0.5);
      ctx.lineTo(s*0.1, -s*0.4);
      ctx.lineTo(s*0.1, s*0.6);
      ctx.lineTo(s*0.7, s*0.5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = s*0.05;
      ctx.beginPath(); ctx.moveTo(-s*0.5, -s*0.2); ctx.lineTo(-s*0.2, -s*0.15); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.5, 0); ctx.lineTo(-s*0.2, s*0.05); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s*0.5, -s*0.2); ctx.lineTo(s*0.2, -s*0.15); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s*0.5, 0); ctx.lineTo(s*0.2, s*0.05); ctx.stroke();
      break;

    case 'shop':
      ctx.fillStyle = color || '#FFF';
      ctx.beginPath();
      ctx.moveTo(-s*0.6, -s*0.4);
      ctx.lineTo(s*0.6, -s*0.4);
      ctx.lineTo(s*0.4, s*0.3);
      ctx.lineTo(-s*0.4, s*0.3);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = color || '#FFF';
      ctx.lineWidth = s*0.15;
      ctx.beginPath(); ctx.moveTo(-s*0.3, -s*0.4); ctx.lineTo(-s*0.3, -s*0.6); ctx.arc(0, -s*0.6, s*0.3, Math.PI, 0); ctx.lineTo(s*0.3, -s*0.4); ctx.stroke();
      ctx.fillStyle = '#FF6B6B';
      ctx.beginPath(); ctx.arc(-s*0.2, s*0.5, s*0.15, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(s*0.2, s*0.5, s*0.15, 0, Math.PI*2); ctx.fill();
      break;

    case 'refresh':
      ctx.strokeStyle = color || '#FFF';
      ctx.lineWidth = s*0.2;
      ctx.beginPath();
      ctx.arc(0, 0, s*0.5, -Math.PI*0.8, Math.PI * 1.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s*0.2, -s*0.8); ctx.lineTo(s*0.2, -s*0.5); ctx.lineTo(-s*0.2, -s*0.2);
      ctx.stroke();
      break;
  }
  ctx.restore();
};
