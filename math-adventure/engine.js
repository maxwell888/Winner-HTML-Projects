/**
 * math-adventure/engine.js
 * 核心引擎：音效 + SVG动画 + 题目渲染
 */

/* ================================================================
 * 一、音效引擎 (SoundEngine) — 基于 Web Audio API
 * ================================================================ */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this._initOnInteraction = () => {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
    };
    if (typeof window !== 'undefined') {
      ['click', 'touchstart', 'keydown'].forEach(e =>
        document.addEventListener(e, this._initOnInteraction, { once: true })
      );
    }
  }

  _play(freq, type, duration, vol = 0.15, rampDown = true) {
    if (!this.enabled) return;
    try {
      this._initOnInteraction();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      if (rampDown) gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) { /* 静默忽略音频错误 */ }
  }

  correct() {
    this._play(523, 'sine', 0.15, 0.15);
    setTimeout(() => this._play(659, 'sine', 0.15, 0.15), 100);
    setTimeout(() => this._play(784, 'sine', 0.2, 0.15), 200);
  }

  incorrect() {
    this._play(200, 'triangle', 0.3, 0.08, false);
  }

  click() {
    this._play(880, 'sine', 0.06, 0.05);
  }

  complete() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => setTimeout(() => this._play(f, 'sine', 0.2, 0.12), i * 120));
  }

  celebration() {
    const notes = [523, 587, 659, 698, 784, 880, 988, 1047];
    notes.forEach((f, i) => setTimeout(() => this._play(f, 'triangle', 0.25, 0.08), i * 80));
  }
}

/* ================================================================
 * 二、缓动函数集
 * ================================================================ */
const Easing = {
  linear: t => t,
  easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeOutBounce: t => {
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    else if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    else return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
  easeOutElastic: t => t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1,
  easeOutBack: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  easeInBack: t => { const c1 = 1.70158; return (c1 + 1) * t * t * t - c1 * t * t; }
};

/* ================================================================
 * 三、SVG 动画引擎 (AnimationEngine)
 * ================================================================ */
class AnimationEngine {
  constructor() {
    this.animations = [];
    this.running = false;
    this.rafId = null;
  }

  /** 单个属性补间 */
  tween(svgEl, props, duration = 800, easing = 'easeOutBounce') {
    return new Promise(resolve => {
      const easingFn = typeof easing === 'function' ? easing : (Easing[easing] || Easing.linear);
      const startTime = performance.now();
      const initial = {};

      // 记录初始值
      for (const [prop, targetVal] of Object.entries(props)) {
        if (prop === 'transform') {
          initial[prop] = this._getTransform(svgEl);
        } else if (prop === 'opacity') {
          initial[prop] = parseFloat(svgEl.getAttribute('opacity') ?? 1);
        } else {
          initial[prop] = parseFloat(svgEl.getAttribute(prop) ?? 0);
        }
      }

      const animate = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easingFn(progress);

        for (const [prop, targetVal] of Object.entries(props)) {
          if (prop === 'transform') {
            this._setTransform(svgEl, initial[prop], targetVal, eased);
          } else if (prop === 'opacity') {
            const val = initial[prop] + (targetVal - initial[prop]) * eased;
            svgEl.setAttribute('opacity', val);
          } else if (prop === 'fill') {
            if (progress >= 0.5) svgEl.setAttribute('fill', targetVal);
          } else {
            const val = initial[prop] + (targetVal - initial[prop]) * eased;
            svgEl.setAttribute(prop, val);
          }
        }

        if (progress < 1) {
          this.rafId = requestAnimationFrame(animate);
        } else {
          // 确保最终值精确
          for (const [prop, targetVal] of Object.entries(props)) {
            if (prop === 'fill') { svgEl.setAttribute('fill', targetVal); }
            else if (prop !== 'transform') { svgEl.setAttribute(prop, targetVal); }
          }
          resolve();
        }
      };

      this.rafId = requestAnimationFrame(animate);
    });
  }

  /** 序列动画 */
  async sequence(steps) {
    for (const step of steps) {
      if (step.delay) await this._wait(step.delay);
      const el = typeof step.el === 'string' ? document.querySelector(step.el) : step.el;
      if (!el) continue;
      await this.tween(el, step.props, step.duration || 600, step.easing || 'easeOutBounce');
    }
  }

  /** 并行动画 */
  async parallel(anims) {
    await Promise.all(anims.map(a => {
      const el = typeof a.el === 'string' ? document.querySelector(a.el) : a.el;
      if (!el) return Promise.resolve();
      return this.tween(el, a.props, a.duration || 600, a.easing || 'easeOutBounce');
    }));
  }

  /** 停止所有动画 */
  stop() {
    if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = null; }
    this.running = false;
  }

  _wait(ms) { return new Promise(r => setTimeout(r, ms)); }

  _getTransform(el) {
    const t = el.getAttribute('transform');
    if (!t) return { tx: 0, ty: 0, sx: 1, sy: 1, rot: 0 };
    const tx = (t.match(/translate\(([^,]+),?\s*([^)]+)?\)/) || []).slice(1).map(Number);
    const sc = (t.match(/scale\(([^,]+),?\s*([^)]+)?\)/) || []).slice(1).map(Number);
    const rt = (t.match(/rotate\(([^)]+)\)/) || [])[1];
    return {
      tx: tx[0] || 0, ty: tx[1] || 0,
      sx: sc[0] || 1, sy: sc[1] || sc[0] || 1,
      rot: parseFloat(rt) || 0
    };
  }

  _setTransform(el, from, to, t) {
    const tx = from.tx + (to.tx - from.tx) * t;
    const ty = from.ty + (to.ty - from.ty) * t;
    const sx = from.sx + (to.sx - from.sx) * t;
    const sy = from.sy + (to.sy - from.sy) * t;
    const rot = from.rot + (to.rot - from.rot) * t;
    el.setAttribute('transform', `translate(${tx},${ty}) scale(${sx},${sy}) rotate(${rot})`);
  }
}

/* ================================================================
 * 四、SVG 场景渲染器
 * ================================================================ */
class SVGSceneRenderer {
  constructor() {
    this.engine = new AnimationEngine();
    this.onComplete = null;
  }

  /** 根据场景类型渲染 */
  render(container, sceneType, config, onComplete) {
    this.onComplete = onComplete;
    container.innerHTML = '';
    this.engine.stop();

    switch (sceneType) {
      case 'sticks-addition': return this._renderSticksAddition(container, config);
      case 'sticks-subtraction': return this._renderSticksSubtraction(container, config);
      case 'ruler-measure': return this._renderRulerMeasure(container, config);
      case 'angle-explorer': return this._renderAngleExplorer(container, config);
      case 'multiplication-array': return this._renderMultiplicationArray(container, config);
      case 'clock-reader': return this._renderClockReader(container, config);
      case 'division-sharing': return this._renderDivisionSharing(container, config);
      case 'bar-chart': return this._renderBarChart(container, config);
      default: container.innerHTML = '<p class="text-gray-500">未知场景类型</p>';
    }
  }

  /** 清空 */
  destroy() {
    this.engine.stop();
  }

  /* ---------- 小棒加法场景 ---------- */
  _renderSticksAddition(container, config) {
    const { num1, num2, hasCarry, steps } = config;
    const tens1 = Math.floor(num1 / 10), ones1 = num1 % 10;
    const tens2 = Math.floor(num2 / 10), ones2 = num2 % 10;
    const totalOnes = ones1 + ones2;
    const carry = hasCarry ? Math.floor(totalOnes / 10) : 0;
    const finalOnes = totalOnes % 10;
    const finalTens = tens1 + tens2 + carry;
    const W = 660, H = 440;

    const svg = this._mkSVG(container, W, H);

    // 分隔线
    this._addLine(svg, W/2, 60, W/2, H-40, '#E5E7EB', 2, 'dashed');

    // 左侧：数字1的表示
    this._addText(svg, W/4, 30, `${num1}`, 'text-2xl font-bold', '#374151');
    this._addBundles(svg, tens1, 50, 110, 'orange', 'g1-tens');
    this._addSingles(svg, ones1, 50 + tens1 * 45, 110, 'emerald', 'g1-ones');

    // 右侧：数字2的表示
    this._addText(svg, W*3/4, 30, `${num2}`, 'text-2xl font-bold', '#374151');
    this._addBundles(svg, tens2, W/2 + 40, 110, 'orange', 'g2-tens');
    this._addSingles(svg, ones2, W/2 + 40 + tens2 * 45, 110, 'emerald', 'g2-ones');

    // 加号
    this._addText(svg, W/2, 140, '+', 'text-3xl font-bold', '#F97316');

    // 底部结果区
    const resultY = 320;
    this._addLine(svg, 30, resultY - 40, W - 30, resultY - 40, '#D1D5DB', 1);
    this._addText(svg, W/2, resultY - 20, '=', 'text-2xl', '#9CA3AF');

    // 结果占位
    const resultText = this._addText(svg, W/2, resultY + 35, '?', 'text-4xl font-bold', '#F97316', 'result-text');
    resultText.setAttribute('opacity', '0');

    // 进位标记区
    let carryText, carryBundle;
    if (hasCarry) {
      carryText = this._addText(svg, W/2, 95, '', 'text-sm font-bold', '#EF4444', 'carry-text');
      carryText.setAttribute('opacity', '0');
      carryBundle = this._addBundle(svg, W/2 - 22, resultY - 10, 'orange', '#carry-bundle');
      carryBundle.setAttribute('opacity', '0');
    }

    // 描述文本
    const narrationEl = this._addText(svg, W/2, H - 25, '', 'text-sm', '#6B7280', 'narration-text');
    const formulaEl = this._addText(svg, W/2, H - 55, '', 'text-lg font-bold', '#374151', 'formula-text');
    formulaEl.setAttribute('opacity', '0');

    // 动画步骤
    let stepIdx = 0;
    const totalSteps = steps.length;

    const runStep = () => {
      if (stepIdx >= totalSteps) {
        if (this.onComplete) this.onComplete();
        return;
      }
      const step = steps[stepIdx];
      narrationEl.textContent = step.narration;
      formulaEl.textContent = step.resultText;
      formulaEl.setAttribute('opacity', '1');

      if (step.highlight === 'ones') {
        // 高亮单根棒
        this._highlightGroup(svg, 'g1-ones', '#34D399');
        this._highlightGroup(svg, 'g2-ones', '#34D399');
      } else if (step.highlight === 'carry' && hasCarry) {
        // 显示进位
        carryText.textContent = `进 ${carry}`;
        carryText.setAttribute('opacity', '1');
        this._highlightGroup(svg, 'g1-ones', '#FCA5A5');
        this._highlightGroup(svg, 'g2-ones', '#FCA5A5');
      } else if (step.highlight === 'tens') {
        this._highlightGroup(svg, 'g1-tens', '#FB923C');
        this._highlightGroup(svg, 'g2-tens', '#FB923C');
        if (carryBundle) carryBundle.setAttribute('opacity', '1');
      } else if (step.highlight === 'result') {
        resultText.textContent = `${num1 + num2}`;
        resultText.setAttribute('opacity', '1');
        this.engine.tween(resultText, { transform: { tx: 0, ty: 0, sx: 0.3, sy: 0.3, rot: 0 } }, 600, 'easeOutBack')
          .then(() => {
            // 重置scale
            resultText.setAttribute('transform', '');
          });
        if (step.celebration && window.confetti) {
          window.confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        }
      }
      stepIdx++;
    };

    // 将步骤控制暴露出去
    container._animController = {
      runStep,
      totalSteps,
      getCurrentStep: () => stepIdx,
      reset: () => { stepIdx = 0; resultText.setAttribute('opacity', '0'); formulaEl.setAttribute('opacity', '0'); if (carryText) carryText.setAttribute('opacity', '0'); if (carryBundle) carryBundle.setAttribute('opacity', '0'); narrationEl.textContent = ''; formulaEl.textContent = ''; },
      isDone: () => stepIdx >= totalSteps
    };

    return container._animController;
  }

  /* ---------- 小棒减法场景 ---------- */
  _renderSticksSubtraction(container, config) {
    const { num1, num2, hasBorrow, steps } = config;
    const tens1 = Math.floor(num1 / 10), ones1 = num1 % 10;
    const tens2 = Math.floor(num2 / 10), ones2 = num2 % 10;
    const W = 660, H = 440;

    const svg = this._mkSVG(container, W, H);

    // 被减数
    this._addText(svg, W/2, 28, `${num1}`, 'text-2xl font-bold', '#374151');
    this._addBundles(svg, tens1, 60, 100, 'orange', 'g-tens');
    this._addSingles(svg, ones1, 60 + tens1 * 45, 100, 'emerald', 'g-ones');

    // 减号
    this._addText(svg, W/2, 155, '−', 'text-3xl font-bold', '#EF4444');

    // 要拿走的部分（右侧虚线框）
    this._addText(svg, W - 80, 28, `拿走 ${num2}`, 'text-sm', '#EF4444');
    const takeX = W - 160;
    this._addBundles(svg, tens2, takeX, 100, 'red', 'g-take-tens');
    this._addSingles(svg, ones2, takeX + tens2 * 45, 100, 'red', 'g-take-ones');

    // 结果线
    const resultY = 320;
    this._addLine(svg, 30, resultY - 40, W - 30, resultY - 40, '#D1D5DB', 1);
    this._addText(svg, W/2, resultY - 20, '=', 'text-2xl', '#9CA3AF');
    const resultText = this._addText(svg, W/2, resultY + 35, '?', 'text-4xl font-bold', '#8B5CF6', 'result-text');
    resultText.setAttribute('opacity', '0');

    // 借位标记
    let borrowText;
    if (hasBorrow) {
      borrowText = this._addText(svg, 50 + tens1 * 45 - 20, 65, '', 'text-xs font-bold', '#EF4444', 'borrow-text');
      borrowText.setAttribute('opacity', '0');
    }

    const narrationEl = this._addText(svg, W/2, H - 25, '', 'text-sm', '#6B7280', 'narration-text');
    const formulaEl = this._addText(svg, W/2, H - 55, '', 'text-lg font-bold', '#374151', 'formula-text');
    formulaEl.setAttribute('opacity', '0');

    let stepIdx = 0;
    const totalSteps = steps.length;

    const runStep = () => {
      if (stepIdx >= totalSteps) {
        if (this.onComplete) this.onComplete();
        return;
      }
      const step = steps[stepIdx];
      narrationEl.textContent = step.narration;
      formulaEl.textContent = step.resultText;
      formulaEl.setAttribute('opacity', '1');

      if (step.highlight === 'ones') {
        this._highlightGroup(svg, 'g-ones', '#6EE7B7');
        this._highlightGroup(svg, 'g-take-ones', '#FCA5A5');
      } else if (step.highlight === 'borrow' && hasBorrow) {
        borrowText.textContent = '退1→10';
        borrowText.setAttribute('opacity', '1');
        this.engine.tween(borrowText, { transform: { tx: 0, ty: -15, sx: 1.2, sy: 1.2, rot: 0 } }, 500, 'easeOutBack');
      } else if (step.highlight === 'tens') {
        this._highlightGroup(svg, 'g-tens', '#FB923C');
        this._highlightGroup(svg, 'g-take-tens', '#FCA5A5');
      } else if (step.highlight === 'result') {
        const finalResult = num1 - num2;
        resultText.textContent = `${finalResult}`;
        resultText.setAttribute('opacity', '1');
        this.engine.tween(resultText, { transform: { tx: 0, ty: 0, sx: 0.3, sy: 0.3, rot: 0 } }, 600, 'easeOutBack')
          .then(() => { resultText.setAttribute('transform', ''); });
        if (step.celebration && window.confetti) {
          window.confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        }
      }
      stepIdx++;
    };

    container._animController = {
      runStep,
      totalSteps,
      getCurrentStep: () => stepIdx,
      reset: () => {
        stepIdx = 0;
        resultText.setAttribute('opacity', '0');
        formulaEl.setAttribute('opacity', '0');
        if (borrowText) borrowText.setAttribute('opacity', '0');
        narrationEl.textContent = '';
        formulaEl.textContent = '';
      },
      isDone: () => stepIdx >= totalSteps
    };

    return container._animController;
  }

  /* ---------- 辅助绘图方法 ---------- */
  _mkSVG(container, w, h) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.classList.add('w-full', 'h-auto');
    container.appendChild(svg);
    return svg;
  }

  _addLine(svg, x1, y1, x2, y2, stroke, width, dash) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x2); line.setAttribute('y2', y2);
    line.setAttribute('stroke', stroke); line.setAttribute('stroke-width', width);
    if (dash) line.setAttribute('stroke-dasharray', '6,4');
    svg.appendChild(line);
    return line;
  }

  _addText(svg, x, y, text, cls, fill, id) {
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', x); t.setAttribute('y', y);
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('dominant-baseline', 'central');
    t.setAttribute('fill', fill);
    t.setAttribute('font-size', cls.includes('4xl') ? '36' : cls.includes('3xl') ? '30' : cls.includes('2xl') ? '24' : cls.includes('xl') ? '20' : cls.includes('lg') ? '18' : '14');
    t.setAttribute('font-family', 'system-ui, sans-serif');
    if (cls.includes('bold')) t.setAttribute('font-weight', 'bold');
    if (id) t.setAttribute('id', id);
    t.textContent = text;
    svg.appendChild(t);
    return t;
  }

  _addRect(svg, x, y, w, h, fill, stroke, rx, groupId) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x); rect.setAttribute('y', y);
    rect.setAttribute('width', w); rect.setAttribute('height', h);
    rect.setAttribute('fill', fill); rect.setAttribute('stroke', stroke || '#D1D5DB');
    rect.setAttribute('stroke-width', '1.5');
    rect.setAttribute('rx', rx || '3');
    if (groupId) rect.setAttribute('data-group', groupId);
    svg.appendChild(rect);
    return rect;
  }

  _addCircle(svg, cx, cy, r, fill, stroke, groupId) {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('r', r);
    c.setAttribute('fill', fill); c.setAttribute('stroke', stroke || '#9CA3AF');
    c.setAttribute('stroke-width', '1');
    if (groupId) c.setAttribute('data-group', groupId);
    svg.appendChild(c);
    return c;
  }

  /** 绘制一捆小棒（10根） */
  _addBundle(svg, x, y, color, id) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const colors = { orange: '#FB923C', red: '#F87171' };
    const fill = colors[color] || '#FB923C';
    const tieColor = '#FBBF24';

    // 10根小棒
    for (let i = 0; i < 10; i++) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x + i * 3.5); line.setAttribute('y1', y);
      line.setAttribute('x2', x + i * 3.5); line.setAttribute('y2', y + 55);
      line.setAttribute('stroke', fill); line.setAttribute('stroke-width', '2.5');
      line.setAttribute('stroke-linecap', 'round');
      g.appendChild(line);
    }
    // 捆绳
    const tie = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    tie.setAttribute('x', x - 3); tie.setAttribute('y', y + 22);
    tie.setAttribute('width', 38); tie.setAttribute('height', 10);
    tie.setAttribute('fill', tieColor); tie.setAttribute('rx', '4');
    tie.setAttribute('stroke', '#D97706'); tie.setAttribute('stroke-width', '1');
    g.appendChild(tie);

    // 标签
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', x + 17); label.setAttribute('y', y + 70);
    label.setAttribute('text-anchor', 'middle'); label.setAttribute('font-size', '12');
    label.setAttribute('fill', '#6B7280');
    label.textContent = '1捆(10根)';
    g.appendChild(label);

    if (id) g.setAttribute('id', id);
    svg.appendChild(g);
    return g;
  }

  /** 批量画捆 */
  _addBundles(svg, count, startX, y, color, groupId) {
    for (let i = 0; i < count; i++) {
      const bundle = this._addBundle(svg, startX + i * 46, y, color);
      if (groupId) bundle.setAttribute('data-group', groupId);
    }
  }

  /** 画一根小棒 */
  _addStick(svg, x, y, color, groupId) {
    const colors = { emerald: '#34D399', red: '#F87171' };
    const fill = colors[color] || '#34D399';
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x + 4); line.setAttribute('y1', y + 12);
    line.setAttribute('x2', x + 4); line.setAttribute('y2', y + 62);
    line.setAttribute('stroke', fill); line.setAttribute('stroke-width', '2.5');
    line.setAttribute('stroke-linecap', 'round');
    if (groupId) line.setAttribute('data-group', groupId);
    svg.appendChild(line);
    return line;
  }

  /** 批量画单根 */
  _addSingles(svg, count, startX, y, color, groupId) {
    for (let i = 0; i < count; i++) {
      this._addStick(svg, startX + i * 12, y, color, groupId);
    }
  }

  /** 高亮某组元素 */
  _highlightGroup(svg, groupId, color) {
    const els = svg.querySelectorAll(`[data-group="${groupId}"]`);
    els.forEach(el => {
      // 递归修改元素及其所有后代的 stroke
      this._setStrokeRecursive(el, color, '3');
    });
    // 800ms 后恢复
    setTimeout(() => {
      els.forEach(el => {
        const origStroke = groupId.includes('take') || groupId.includes('2-ones') ? null : null;
        this._setStrokeRecursive(el, null, null); // 移除临时 stroke 让原始值恢复
      });
    }, 800);
  }

  /** 递归设置元素及其后代的 stroke */
  _setStrokeRecursive(el, color, width) {
    if (color) {
      // 保存原始值（如果还没保存过）
      if (!el.dataset.origStroke) {
        el.dataset.origStroke = el.getAttribute('stroke') || '';
        el.dataset.origStrokeWidth = el.getAttribute('stroke-width') || '';
      }
      el.setAttribute('stroke', color);
      if (width) el.setAttribute('stroke-width', width);
    } else {
      // 恢复原始值
      if (el.dataset.origStroke !== undefined) {
        if (el.dataset.origStroke) el.setAttribute('stroke', el.dataset.origStroke);
        else el.removeAttribute('stroke');
        if (el.dataset.origStrokeWidth) el.setAttribute('stroke-width', el.dataset.origStrokeWidth);
        else el.removeAttribute('stroke-width');
        delete el.dataset.origStroke;
        delete el.dataset.origStrokeWidth;
      }
    }
    // 递归处理子元素
    for (const child of el.children) {
      this._setStrokeRecursive(child, color, width);
    }
  }

  /* ================================================================
   * 场景渲染 — 尺子测量 (ruler-measure)
   * ================================================================ */
  _renderRulerMeasure(container, config) {
    const { objects, steps } = config;
    const W = 660, H = 400;
    const svg = this._mkSVG(container, W, H);
    const narrationEl = this._addText(svg, W/2, H-25, '', 'text-sm', '#6B7280', 'nar-text');
    const formulaEl = this._addText(svg, W/2, H-55, '', 'text-lg font-bold', '#374151', 'form-text');
    formulaEl.setAttribute('opacity', '0');

    // 画尺子
    const rulerY = 200;
    this._addRect(svg, 40, rulerY, 560, 30, '#FFF7ED', '#FB923C', 5);
    for (let cm = 0; cm <= 18; cm++) {
      const x = 40 + cm * 30;
      const h = cm % 5 === 0 ? 20 : 12;
      this._addLine(svg, x, rulerY, x, rulerY + h, '#FB923C', cm % 5 === 0 ? 2 : 1);
      if (cm % 5 === 0) this._addText(svg, x, rulerY + 28, `${cm}`, 'text-xs', '#F97316');
    }
    this._addText(svg, 320, rulerY - 15, 'cm (厘米)', 'text-sm font-bold', '#F97316');

    // 画待测物体 (矩形)
    const objY = rulerY - 70;
    objects.forEach((obj, i) => {
      const w = obj.length * 30;
      this._addRect(svg, 40, objY + i * 45 - 40, w, 24, obj.color, '#D1D5DB', 4, `obj-${i}`);
      this._addText(svg, 40 + w/2, objY + i * 45 - 28, obj.name, 'text-xs font-bold', '#FFF');
      this._addText(svg, 40 + w + 10, objY + i * 45 - 28, '', 'text-sm', '#6B7280', `obj-${i}-label`);
    });
    // 只显示第一个
    for (let i = 1; i < objects.length; i++) {
      svg.querySelectorAll(`[data-group="obj-${i}"]`).forEach(el => el.setAttribute('opacity', '0.3'));
    }

    let stepIdx = 0;
    const totalSteps = steps.length;
    const runStep = () => {
      if (stepIdx >= totalSteps) { if (this.onComplete) this.onComplete(); return; }
      const s = steps[stepIdx];
      narrationEl.textContent = s.narration;
      formulaEl.textContent = s.resultText;
      formulaEl.setAttribute('opacity', '1');

      if (s.highlight === 'zero') {
        const z = svg.querySelector(`[data-group="obj-0"]`);
        if (z) z.setAttribute('stroke', '#10B981');
        this._addCircle(svg, 40, rulerY + 15, 6, '#EF4444', '#EF4444');
        this._addText(svg, 40, rulerY - 10, '0刻度', 'text-xs font-bold', '#EF4444');
      } else if (s.highlight === 'measure') {
        const len = objects[0].length;
        this._addCircle(svg, 40 + len * 30, rulerY + 15, 6, '#EF4444', '#EF4444');
        this._addText(svg, 40 + len * 30, rulerY - 10, `${len}cm`, 'text-xs font-bold', '#10B981');
        svg.querySelector(`[data-group="obj-0-label"]`).textContent = `${len}cm`;
        // 画标注线
        this._addLine(svg, 40, rulerY + 45, 40 + len * 30, rulerY + 45, '#10B981', 2);
        this._addText(svg, 40 + len * 15, rulerY + 58, `${len}厘米`, 'text-sm font-bold', '#10B981');
      } else if (s.highlight === 'unit') {
        svg.querySelector(`[data-group="obj-0-label"]`).textContent = `${objects[0].length}cm`;
      } else if (s.highlight === 'relation') {
        // 1米=100厘米 展示
      } else if (s.highlight === 'body') {
        // 手臂张开示意
      } else if (s.highlight === 'examples') {
        if (stepIdx === totalSteps - 1 && s.celebration && window.confetti) {
          window.confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        }
      }
      stepIdx++;
    };

    container._animController = { runStep, totalSteps, getCurrentStep: () => stepIdx, reset: () => { stepIdx = 0; formulaEl.setAttribute('opacity','0'); narrationEl.textContent=''; formulaEl.textContent=''; }, isDone: () => stepIdx >= totalSteps };
    return container._animController;
  }

  /* ================================================================
   * 场景渲染 — 角度探索 (angle-explorer)
   * ================================================================ */
  _renderAngleExplorer(container, config) {
    const { angles, steps } = config;
    const W = 660, H = 400;
    const svg = this._mkSVG(container, W, H);
    const cx = W/2, cy = H/2 - 20;
    const r = 120;

    // 画所有预设角度（半透明）
    const angleDefs = { right: { deg: 90, color: '#3B82F6', name: '直角' },
                        acute: { deg: 45, color: '#10B981', name: '锐角' },
                        obtuse: { deg: 135, color: '#EF4444', name: '钝角' } };

    // 当前高亮的角度
    let highlightId = null;

    // 画水平基线
    this._addLine(svg, cx - r, cy, cx + r, cy, '#D1D5DB', 1);

    Object.entries(angleDefs).forEach(([key, def]) => {
      const rad = (def.deg * Math.PI) / 180;
      const x2 = cx + r * Math.cos(rad);
      const y2 = cy - r * Math.sin(rad);
      const arcEndX = cx + 30 * Math.cos(rad);
      const arcEndY = cy - 30 * Math.sin(rad);
      const largeArc = def.deg > 90 ? 1 : 0;

      const line = this._addLine(svg, cx, cy, x2, y2, def.color, 2.5);
      line.setAttribute('data-group', `angle-${key}`);
      line.setAttribute('opacity', '0.3');

      const arcPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      arcPath.setAttribute('d', `M ${cx+25} ${cy} A 25 25 0 ${largeArc} 0 ${arcEndX} ${arcEndY}`);
      arcPath.setAttribute('fill', 'none');
      arcPath.setAttribute('stroke', def.color);
      arcPath.setAttribute('stroke-width', '2');
      arcPath.setAttribute('opacity', '0.3');
      arcPath.setAttribute('data-group', `angle-${key}`);
      svg.appendChild(arcPath);

      const labelX = cx + (r + 30) * Math.cos(rad);
      const labelY = cy - (r + 30) * Math.sin(rad);
      const label = this._addText(svg, labelX, labelY, `${def.deg}°`, 'text-sm font-bold', def.color);
      label.setAttribute('data-group', `angle-${key}`);
      label.setAttribute('opacity', '0.3');
    });

    // 顶点
    this._addCircle(svg, cx, cy, 5, '#374151', '#374151');
    this._addText(svg, cx, cy + 18, '顶点', 'text-xs', '#6B7280');

    const narrationEl = this._addText(svg, W/2, H-25, '', 'text-sm', '#6B7280', 'nar-text');
    const formulaEl = this._addText(svg, W/2, H-55, '', 'text-lg font-bold', '#374151', 'form-text');
    formulaEl.setAttribute('opacity', '0');

    const highlightAngle = (key) => {
      svg.querySelectorAll('[data-group^="angle-"]').forEach(el => el.setAttribute('opacity', '0.15'));
      svg.querySelectorAll(`[data-group="angle-${key}"]`).forEach(el => {
        el.setAttribute('opacity', '1');
        el.setAttribute('stroke-width', '3');
      });
    };

    let stepIdx = 0;
    const totalSteps = steps.length;
    const runStep = () => {
      if (stepIdx >= totalSteps) { if (this.onComplete) this.onComplete(); return; }
      const s = steps[stepIdx];
      narrationEl.textContent = s.narration;
      formulaEl.textContent = s.resultText;
      formulaEl.setAttribute('opacity', '1');

      if (s.highlight === 'parts') highlightAngle('acute');
      else if (s.highlight === 'size') highlightAngle('right');
      else if (s.highlight === 'draw') highlightAngle('obtuse');
      else if (s.highlight === 'right') highlightAngle('right');
      else if (s.highlight === 'acute') highlightAngle('acute');
      else if (s.highlight === 'obtuse') highlightAngle('obtuse');
      else if (s.highlight === 'compare') {
        ['right','acute','obtuse'].forEach(k => {
          svg.querySelectorAll(`[data-group="angle-${k}"]`).forEach(el => el.setAttribute('opacity', '1'));
        });
      }
      if (stepIdx === totalSteps - 1 && s.celebration && window.confetti) {
        window.confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      }
      stepIdx++;
    };
    container._animController = { runStep, totalSteps, getCurrentStep: () => stepIdx, reset: () => { stepIdx=0; formulaEl.setAttribute('opacity','0'); narrationEl.textContent=''; formulaEl.textContent=''; ['right','acute','obtuse'].forEach(k => svg.querySelectorAll(`[data-group="angle-${k}"]`).forEach(el => el.setAttribute('opacity','0.3'))); }, isDone: () => stepIdx >= totalSteps };
    return container._animController;
  }

  /* ================================================================
   * 场景渲染 — 乘法阵列 (multiplication-array)
   * ================================================================ */
  _renderMultiplicationArray(container, config) {
    const { rows, cols, item, steps } = config;
    const W = 660, H = 400;
    const svg = this._mkSVG(container, W, H);
    const cellSize = 40, startX = (W - cols * (cellSize+6)) / 2, startY = 60;

    // 画阵列
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = startX + c * (cellSize+6) + cellSize/2;
        const cy = startY + r * (cellSize+6) + cellSize/2;
        const el = this._addText(svg, cx, cy+2, item, 'text-2xl', '#374151');
        el.setAttribute('text-anchor', 'middle');
        el.setAttribute('dominant-baseline', 'central');
        el.setAttribute('data-group', `cell-r${r}`);
        if (r >= 2) el.setAttribute('opacity', '0.25');
      }
    }

    // 行列标注
    for (let r = 0; r < rows; r++) {
      this._addText(svg, startX - 20, startY + r*(cellSize+6)+cellSize/2+2, `第${r+1}行`, 'text-xs', '#F97316');
    }
    for (let c = 0; c < cols; c++) {
      this._addText(svg, startX + c*(cellSize+6)+cellSize/2, startY + rows*(cellSize+6)+15, `${c+1}`, 'text-xs', '#3B82F6');
    }

    const narrationEl = this._addText(svg, W/2, H-25, '', 'text-sm', '#6B7280', 'nar-text');
    const formulaEl = this._addText(svg, W/2, H-55, '', 'text-lg font-bold', '#374151', 'form-text');
    formulaEl.setAttribute('opacity', '0');

    let stepIdx = 0;
    const totalSteps = steps.length;
    const runStep = () => {
      if (stepIdx >= totalSteps) { if (this.onComplete) this.onComplete(); return; }
      const s = steps[stepIdx];
      narrationEl.textContent = s.narration;
      formulaEl.textContent = s.resultText;
      formulaEl.setAttribute('opacity', '1');

      if (s.highlight === 'addition') {
        svg.querySelectorAll('[data-group^="cell-r"]').forEach(el => el.setAttribute('opacity', '1'));
      } else if (s.highlight === 'multiplication' || s.highlight === 'symbol') {
        svg.querySelectorAll('[data-group^="cell-r"]').forEach(el => el.setAttribute('opacity', '1'));
      } else if (s.highlight === '2table' || s.highlight === '3table' || s.highlight === 'table') {
        svg.querySelectorAll('[data-group^="cell-r"]').forEach(el => el.setAttribute('opacity', '1'));
      } else if (s.highlight === 'pattern') {
        for (let i = 0; i < rows; i++) {
          svg.querySelectorAll(`[data-group="cell-r${i}"]`).forEach(el => el.setAttribute('fill', i % 2 === 0 ? '#F97316' : '#3B82F6'));
        }
      } else if (s.highlight === 'hint' || s.highlight === 'recite') {
        // 口诀背诵 — 按行高亮
        svg.querySelectorAll('[data-group^="cell-r"]').forEach(el => el.setAttribute('opacity', '1'));
      } else if (s.highlight === 'symmetry' || s.highlight === 'fun' || s.highlight === 'fingers') {
        svg.querySelectorAll('[data-group^="cell-r"]').forEach(el => el.setAttribute('opacity', '1'));
      }

      if (stepIdx === totalSteps - 1 && s.celebration && window.confetti) {
        window.confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      }
      stepIdx++;
    };
    container._animController = { runStep, totalSteps, getCurrentStep: () => stepIdx, reset: () => { stepIdx=0; formulaEl.setAttribute('opacity','0'); narrationEl.textContent=''; formulaEl.textContent=''; svg.querySelectorAll('[data-group^="cell-r"]').forEach(el => { if (el.getAttribute('data-group')?.includes('r2')||el.getAttribute('data-group')?.includes('r3')||el.getAttribute('data-group')?.includes('r4')||el.getAttribute('data-group')?.includes('r5')) el.setAttribute('opacity','0.25'); else el.setAttribute('opacity','1'); el.setAttribute('fill','#374151'); }); }, isDone: () => stepIdx >= totalSteps };
    return container._animController;
  }

  /* ================================================================
   * 场景渲染 — 时钟 (clock-reader)
   * ================================================================ */
  _renderClockReader(container, config) {
    const { times, steps } = config;
    const W = 660, H = 400;
    const svg = this._mkSVG(container, W, H);
    const cx = W/2, cy = H/2 - 10, r = 130;

    // 表盘
    this._addCircle(svg, cx, cy, r, '#FFF', '#374151');
    this._addCircle(svg, cx, cy, r + 5, 'none', '#D1D5DB');

    // 12个数字
    for (let i = 1; i <= 12; i++) {
      const angle = (i * 30 - 90) * Math.PI / 180;
      const nx = cx + (r - 22) * Math.cos(angle);
      const ny = cy + (r - 22) * Math.sin(angle);
      this._addText(svg, nx, ny+2, `${i}`, 'text-lg font-bold', '#374151');
    }

    // 刻度线
    for (let i = 0; i < 60; i++) {
      const angle = (i * 6 - 90) * Math.PI / 180;
      const inner = i % 5 === 0 ? r - 18 : r - 10;
      this._addLine(svg, cx + inner * Math.cos(angle), cy + inner * Math.sin(angle),
                    cx + (r-5) * Math.cos(angle), cy + (r-5) * Math.sin(angle), '#9CA3AF', i%5===0?1.5:0.5);
    }

    // 时针、分针
    const hourHand = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    hourHand.setAttribute('id', 'hour-hand');
    hourHand.setAttribute('stroke', '#374151'); hourHand.setAttribute('stroke-width', '5');
    hourHand.setAttribute('stroke-linecap', 'round');
    svg.appendChild(hourHand);

    const minHand = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    minHand.setAttribute('id', 'min-hand');
    minHand.setAttribute('stroke', '#3B82F6'); minHand.setAttribute('stroke-width', '3');
    minHand.setAttribute('stroke-linecap', 'round');
    svg.appendChild(minHand);

    const centerDot = this._addCircle(svg, cx, cy, 6, '#EF4444', '#EF4444');

    const setClock = (h, m) => {
      const hAngle = ((h % 12) * 30 + m * 0.5 - 90) * Math.PI / 180;
      const mAngle = (m * 6 - 90) * Math.PI / 180;
      hourHand.setAttribute('x1', cx); hourHand.setAttribute('y1', cy);
      hourHand.setAttribute('x2', cx + r*0.5*Math.cos(hAngle));
      hourHand.setAttribute('y2', cy + r*0.5*Math.sin(hAngle));
      minHand.setAttribute('x1', cx); minHand.setAttribute('y1', cy);
      minHand.setAttribute('x2', cx + r*0.75*Math.cos(mAngle));
      minHand.setAttribute('y2', cy + r*0.75*Math.sin(mAngle));
    };

    const timeLabel = this._addText(svg, cx, cy + r + 30, '', 'text-xl font-bold', '#374151', 'time-label');
    const narrationEl = this._addText(svg, W/2, H-20, '', 'text-sm', '#6B7280', 'nar-text');
    const formulaEl = this._addText(svg, W/2, H-50, '', 'text-lg font-bold', '#374151', 'form-text');
    formulaEl.setAttribute('opacity', '0');

    let stepIdx = 0;
    const totalSteps = steps.length;
    const runStep = () => {
      if (stepIdx >= totalSteps) { if (this.onComplete) this.onComplete(); return; }
      const s = steps[stepIdx];
      narrationEl.textContent = s.narration;
      formulaEl.textContent = s.resultText;
      formulaEl.setAttribute('opacity', '1');

      const tIdx = Math.min(stepIdx, times.length - 1);
      if (times[tIdx]) {
        setClock(times[tIdx].hour, times[tIdx].minute);
        timeLabel.textContent = times[tIdx].label || `${times[tIdx].hour}:${String(times[tIdx].minute).padStart(2,'0')}`;
      }

      if (stepIdx === totalSteps - 1 && s.celebration && window.confetti) {
        window.confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      }
      stepIdx++;
    };

    // 初始状态
    setClock(times[0]?.hour || 12, times[0]?.minute || 0);
    timeLabel.textContent = times[0]?.label || '';

    container._animController = { runStep, totalSteps, getCurrentStep: () => stepIdx, reset: () => { stepIdx=0; formulaEl.setAttribute('opacity','0'); narrationEl.textContent=''; formulaEl.textContent=''; setClock(times[0]?.hour||12,times[0]?.minute||0); timeLabel.textContent=times[0]?.label||''; }, isDone: () => stepIdx >= totalSteps };
    return container._animController;
  }

  /* ================================================================
   * 场景渲染 — 除法分物 (division-sharing)
   * ================================================================ */
  _renderDivisionSharing(container, config) {
    const { total, groups, item, steps } = config;
    const perGroup = Math.floor(total / groups);
    const W = 660, H = 400;
    const svg = this._mkSVG(container, W, H);

    // 顶部：总数
    let totalItems = '';
    for (let i = 0; i < total; i++) totalItems += item;
    this._addText(svg, W/2, 30, `总数: ${totalItems}`, 'text-lg', '#374151');

    // 分组框
    const boxW = 100, boxH = 200, gap = 30;
    const totalBoxW = groups * boxW + (groups - 1) * gap;
    const startBX = (W - totalBoxW) / 2, boxY = 60;

    for (let g = 0; g < groups; g++) {
      const bx = startBX + g * (boxW + gap);
      this._addRect(svg, bx, boxY, boxW, boxH, '#F9FAFB', '#D1D5DB', 8, `box-${g}`);
      this._addText(svg, bx + boxW/2, boxY + boxH + 15, `第${g+1}份`, 'text-xs', '#6B7280');

      // 初始每份放几个示意
      for (let i = 0; i < Math.min(perGroup, 4); i++) {
        const ix = bx + 15 + (i % 2) * 35;
        const iy = boxY + 18 + Math.floor(i/2) * 35;
        const t = this._addText(svg, ix, iy, item, 'text-lg', '#374151');
      }
    }

    const narrationEl = this._addText(svg, W/2, H-25, '', 'text-sm', '#6B7280', 'nar-text');
    const formulaEl = this._addText(svg, W/2, H-55, '', 'text-lg font-bold', '#374151', 'form-text');
    formulaEl.setAttribute('opacity', '0');

    let stepIdx = 0;
    const totalSteps = steps.length;
    const runStep = () => {
      if (stepIdx >= totalSteps) { if (this.onComplete) this.onComplete(); return; }
      const s = steps[stepIdx];
      narrationEl.textContent = s.narration;
      formulaEl.textContent = s.resultText;
      formulaEl.setAttribute('opacity', '1');

      if (s.highlight === 'distribute' || s.highlight === 'result') {
        // 所有分组框高亮
        for (let g = 0; g < groups; g++) {
          const box = svg.querySelector(`[data-group="box-${g}"]`);
          if (box) box.setAttribute('stroke', '#10B981');
        }
      }
      if (stepIdx === totalSteps - 1 && s.celebration && window.confetti) {
        window.confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      }
      stepIdx++;
    };
    container._animController = { runStep, totalSteps, getCurrentStep: () => stepIdx, reset: () => { stepIdx=0; formulaEl.setAttribute('opacity','0'); narrationEl.textContent=''; formulaEl.textContent=''; for (let g=0;g<groups;g++){const b=svg.querySelector(`[data-group="box-${g}"]`);if(b)b.setAttribute('stroke','#D1D5DB');} }, isDone: () => stepIdx >= totalSteps };
    return container._animController;
  }

  /* ================================================================
   * 场景渲染 — 条形统计图 (bar-chart)
   * ================================================================ */
  _renderBarChart(container, config) {
    const { data, steps } = config;
    const W = 660, H = 400;
    const svg = this._mkSVG(container, W, H);
    const maxVal = Math.max(...data.map(d => d.value));
    const chartL = 80, chartR = W - 30, chartT = 50, chartB = H - 80;
    const chartW = chartR - chartL, chartH = chartB - chartT;

    // 纵轴
    this._addLine(svg, chartL, chartT, chartL, chartB, '#D1D5DB', 2);
    this._addLine(svg, chartL, chartB, chartR, chartB, '#D1D5DB', 2);

    // 刻度
    for (let v = 0; v <= maxVal; v += 2) {
      const y = chartB - (v / maxVal) * chartH;
      this._addLine(svg, chartL - 3, y, chartL, y, '#D1D5DB', 1);
      this._addText(svg, chartL - 15, y + 1, `${v}`, 'text-xs', '#9CA3AF');
      if (v > 0) this._addLine(svg, chartL, y, chartR, y, '#F3F4F6', 0.5);
    }

    // 柱子
    const barGap = 20;
    const barW = Math.min(60, (chartW - (data.length + 1) * barGap) / data.length);
    data.forEach((d, i) => {
      const barH = (d.value / maxVal) * chartH;
      const bx = chartL + barGap + i * (barW + barGap);
      const by = chartB - barH;
      const bar = this._addRect(svg, bx, by, barW, barH, d.color, d.color, 4, `bar-${i}`);
      bar.setAttribute('opacity', '0.6');

      // 标签
      this._addText(svg, bx + barW/2, chartB + 18, d.label, 'text-sm font-bold', '#374151');
      const valLabel = this._addText(svg, bx + barW/2, by - 12, '', 'text-sm font-bold', d.color);
      valLabel.setAttribute('id', `bar-val-${i}`);
      valLabel.setAttribute('opacity', '0');
    });

    // "正"字计数展示
    const tallyY = 30;
    this._addText(svg, chartL + 20, tallyY, '正正', 'text-sm', '#9CA3AF');
    this._addText(svg, chartL + 20, tallyY + 16, '(每笔=1票)', 'text-xs', '#D1D5DB');

    const narrationEl = this._addText(svg, W/2, H-15, '', 'text-sm', '#6B7280', 'nar-text');
    const formulaEl = this._addText(svg, W/2, H-42, '', 'text-lg font-bold', '#374151', 'form-text');
    formulaEl.setAttribute('opacity', '0');

    let stepIdx = 0;
    const totalSteps = steps.length;
    const runStep = () => {
      if (stepIdx >= totalSteps) { if (this.onComplete) this.onComplete(); return; }
      const s = steps[stepIdx];
      narrationEl.textContent = s.narration;
      formulaEl.textContent = s.resultText;
      formulaEl.setAttribute('opacity', '1');

      if (s.highlight === 'collect') {
        // 展示"正"字计数
      } else if (s.highlight === 'chart') {
        data.forEach((d, i) => {
          const bar = svg.querySelector(`[data-group="bar-${i}"]`);
          if (bar) bar.setAttribute('opacity', '1');
          const vl = svg.getElementById(`bar-val-${i}`);
          if (vl) { vl.textContent = `${d.value}票`; vl.setAttribute('opacity', '1'); }
        });
      } else if (s.highlight === 'analyze') {
        const maxIdx = data.findIndex(d => d.value === maxVal);
        const bar = svg.querySelector(`[data-group="bar-${maxIdx}"]`);
        if (bar) { bar.setAttribute('stroke', '#F59E0B'); bar.setAttribute('stroke-width', '4'); }
      }

      if (stepIdx === totalSteps - 1 && s.celebration && window.confetti) {
        window.confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      }
      stepIdx++;
    };
    container._animController = { runStep, totalSteps, getCurrentStep: () => stepIdx, reset: () => { stepIdx=0; formulaEl.setAttribute('opacity','0'); narrationEl.textContent=''; formulaEl.textContent=''; data.forEach((d,i)=>{const bar=svg.querySelector(`[data-group="bar-${i}"]`);if(bar)bar.setAttribute('opacity','0.6');const vl=svg.getElementById(`bar-val-${i}`);if(vl)vl.setAttribute('opacity','0');}); }, isDone: () => stepIdx >= totalSteps };
    return container._animController;
  }
}

/* ================================================================
 * 五、题目引擎 (QuizEngine)
 * ================================================================ */
class QuizEngine {
  constructor() {
    this.sound = new SoundEngine();
    this.currentQuestion = 0;
    this.score = 0;
    this.questions = [];
    this.onFinish = null;
  }

  /** 加载题目集 */
  load(questions) {
    this.questions = questions;
    this.currentQuestion = 0;
    this.score = 0;
  }

  /** 渲染当前题目到容器 */
  renderQuestion(container, onAnswer) {
    if (this.currentQuestion >= this.questions.length) {
      this._renderComplete(container);
      if (this.onFinish) this.onFinish(this.score, this.questions.length);
      return;
    }

    const q = this.questions[this.currentQuestion];
    container.innerHTML = '';

    // 题目卡片
    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl p-6 shadow-lg';

    // 进度条
    const progressDiv = document.createElement('div');
    progressDiv.className = 'flex items-center gap-2 mb-4';
    progressDiv.innerHTML = `
      <span class="text-sm text-gray-400">第 ${this.currentQuestion + 1}/${this.questions.length} 题</span>
      <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div class="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-500"
             style="width:${(this.currentQuestion / this.questions.length) * 100}%"></div>
      </div>
      <span class="text-sm text-amber-500 font-bold">⭐ ${this.score}</span>
    `;
    card.appendChild(progressDiv);

    // 题目文字
    const qTitle = document.createElement('h3');
    qTitle.className = 'text-xl font-bold text-gray-700 mb-6';
    qTitle.textContent = q.question;
    card.appendChild(qTitle);

    // 选项区域
    const optionsDiv = document.createElement('div');

    if (q.type === 'choice') {
      optionsDiv.className = 'grid grid-cols-2 gap-3';
      q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option p-4 text-lg font-bold rounded-xl border-2 border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-200 active:scale-95';
        btn.textContent = opt;
        btn.addEventListener('click', () => {
          this._handleAnswer(idx, q, optionsDiv, onAnswer);
        });
        optionsDiv.appendChild(btn);
      });
    } else if (q.type === 'fill') {
      optionsDiv.className = 'flex flex-col items-center gap-4';
      const input = document.createElement('input');
      input.type = 'number';
      input.className = 'w-40 text-center text-3xl font-bold p-4 rounded-xl border-2 border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all';
      input.placeholder = '?';
      const submitBtn = document.createElement('button');
      submitBtn.className = 'px-8 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all active:scale-95';
      submitBtn.textContent = '确认答案 ✓';
      submitBtn.addEventListener('click', () => {
        const val = parseInt(input.value);
        if (!isNaN(val)) {
          this._handleFillAnswer(val, q, optionsDiv, onAnswer);
        }
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submitBtn.click();
      });
      optionsDiv.appendChild(input);
      optionsDiv.appendChild(submitBtn);
    }

    card.appendChild(optionsDiv);

    // 提示区域
    const hintDiv = document.createElement('div');
    hintDiv.className = 'mt-4 text-center';
    hintDiv.id = 'hint-area';
    const hintBtn = document.createElement('button');
    hintBtn.className = 'text-sm text-gray-400 hover:text-amber-500 transition-colors';
    hintBtn.innerHTML = '<i class="fa fa-lightbulb-o mr-1"></i>需要提示吗?';
    hintBtn.addEventListener('click', () => {
      hintDiv.innerHTML = `<p class="text-sm text-amber-600 bg-amber-50 rounded-lg p-3 mt-2">💡 ${q.hint}</p>`;
    });
    hintDiv.appendChild(hintBtn);
    card.appendChild(hintDiv);

    container.appendChild(card);
  }

  _handleAnswer(selectedIdx, question, container, onAnswer) {
    const buttons = container.querySelectorAll('.quiz-option');
    buttons.forEach(b => b.disabled = true);

    const isCorrect = selectedIdx === question.answer;
    if (isCorrect) {
      this.score++;
      this.sound.correct();
      buttons[selectedIdx].classList.add('bg-emerald-100', 'border-emerald-500', 'text-emerald-700');
      buttons[selectedIdx].classList.remove('border-gray-200');
    } else {
      this.sound.incorrect();
      buttons[selectedIdx].classList.add('bg-red-100', 'border-red-500', 'text-red-700');
      buttons[selectedIdx].classList.remove('border-gray-200');
      buttons[question.answer].classList.add('bg-emerald-100', 'border-emerald-500', 'text-emerald-700');
      buttons[question.answer].classList.remove('border-gray-200');
    }

    // 解释
    const explainDiv = document.createElement('div');
    explainDiv.className = `mt-4 p-3 rounded-lg text-sm ${isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`;
    explainDiv.textContent = (isCorrect ? '✅ 答对了！' : '❌ 再想想哦～') + ' ' + question.explanation;
    container.appendChild(explainDiv);

    // 继续按钮
    const nextBtn = document.createElement('button');
    nextBtn.className = 'mt-4 w-full py-2 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all';
    nextBtn.textContent = this.currentQuestion + 1 >= this.questions.length ? '查看结果 →' : '下一题 →';
    nextBtn.addEventListener('click', () => {
      this.currentQuestion++;
      if (onAnswer) onAnswer();
    });
    container.appendChild(nextBtn);
  }

  _handleFillAnswer(val, question, container, onAnswer) {
    const correctAnswer = parseInt(question.answer);
    const isCorrect = val === correctAnswer;

    if (isCorrect) {
      this.score++;
      this.sound.correct();
    } else {
      this.sound.incorrect();
    }

    const resultDiv = document.createElement('div');
    resultDiv.className = `mt-3 p-3 rounded-lg text-center text-sm ${isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`;
    resultDiv.innerHTML = isCorrect
      ? `✅ 答对了！${question.explanation}`
      : `❌ 答案是 <b>${correctAnswer}</b>。${question.explanation}`;
    container.appendChild(resultDiv);

    // 禁用输入和按钮
    const input = container.querySelector('input');
    const submitBtn = container.querySelector('button');
    if (input) input.disabled = true;
    if (submitBtn) submitBtn.style.display = 'none';

    // 继续按钮
    const nextBtn = document.createElement('button');
    nextBtn.className = 'mt-3 w-full py-2 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all';
    nextBtn.textContent = this.currentQuestion + 1 >= this.questions.length ? '查看结果 →' : '下一题 →';
    nextBtn.addEventListener('click', () => {
      this.currentQuestion++;
      if (onAnswer) onAnswer();
    });
    container.appendChild(nextBtn);
  }

  _renderComplete(container) {
    const pct = Math.round((this.score / this.questions.length) * 100);
    const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : 1;
    const messages = {
      3: { title: '太棒了！🌟', desc: '你全部掌握了！', color: 'emerald' },
      2: { title: '做得不错！👍', desc: '再加把劲就更好了！', color: 'amber' },
      1: { title: '继续加油！💪', desc: '多练习几次就会了！', color: 'orange' }
    };
    const m = messages[stars];

    container.innerHTML = `
      <div class="text-center py-8">
        <div class="text-6xl mb-4">${stars === 3 ? '🏆' : stars === 2 ? '🌟' : '💪'}</div>
        <h2 class="text-2xl font-bold text-${m.color}-600 mb-2">${m.title}</h2>
        <p class="text-gray-500 mb-2">${m.desc}</p>
        <div class="flex justify-center gap-1 mb-4">
          ${[1,2,3].map(i => `<span class="text-3xl ${i <= stars ? '' : 'opacity-30'}">⭐</span>`).join('')}
        </div>
        <p class="text-lg font-bold text-gray-700">正确率: <span class="text-${m.color}-500">${pct}%</span> (${this.score}/${this.questions.length})</p>
        ${stars === 3 ? '<p class="text-sm text-amber-500 mt-2">🎉 满分通关！获得3颗星！</p>' : ''}
      </div>
    `;

    if (stars >= 2) this.sound.complete();
    if (stars === 3 && window.confetti) {
      window.confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
    }
  }

  getScore() { return this.score; }
  getTotal() { return this.questions.length; }
  getStars() {
    const pct = Math.round((this.score / this.questions.length) * 100);
    return pct >= 90 ? 3 : pct >= 60 ? 2 : 1;
  }
  reset() { this.currentQuestion = 0; this.score = 0; }
}

/* ================================================================
 * 导出到全局
 * ================================================================ */
if (typeof window !== 'undefined') {
  window.SoundEngine = SoundEngine;
  window.AnimationEngine = AnimationEngine;
  window.SVGSceneRenderer = SVGSceneRenderer;
  window.QuizEngine = QuizEngine;
  window.Easing = Easing;
}
