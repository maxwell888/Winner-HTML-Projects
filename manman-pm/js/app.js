// ============================================
// 设计师妈妈的服装实验室 · PM 主逻辑
// 9 屏 / 角色过滤 / 声音档 toggle / 数据 fetch
// ============================================

(function() {
  'use strict';

  // ============ 状态 ============
  const state = {
    role: localStorage.getItem('manman-pm.role') || 'yangke',  // yangke/manman/both
    audioMode: localStorage.getItem('manman-pm.audio') === '1',
    currentView: 'home',
    currentWeek: 1,  // M1 周次
    topicFilter: 'all',  // 选题筛选
    docFilter: 'all',   // 资料筛选
    reviews: JSON.parse(localStorage.getItem('manman-pm.reviews') || '[]'),
    checklist: JSON.parse(localStorage.getItem('manman-pm.checklist') || '{}'),
  };

  // ============ 角色定义 ============
  const ROLES = {
    yangke: { icon: '🔧', label: '杨珂', color: 'yangke' },
    manman: { icon: '📸', label: '曼曼', color: 'manman' },
    both:   { icon: '👫', label: '共同', color: 'both' }
  };

  // ============ 文档清单（数据层）============
  const DOCS = [
    { id: 'home',          file: null,                    name: '🏠 主页',           desc: '倒计时 + 本周 3 件事',     role: 'both' },
    { id: 'calendar',      file: null,                    name: '📅 M1 内容日历',     desc: 'M1 4 周 17 条排期',       role: 'both' },
    { id: 'topics',        file: null,                    name: '🔬 选题库',         desc: '反种草 10 + 焦虑 20 条',  role: 'both' },
    { id: 'review',        file: null,                    name: '📊 周复盘',         desc: '周日 22:00 数据记录',      role: 'both' },
    { id: 'gear',          file: null,                    name: '🛒 设备采购',       desc: '7 件 + 进度勾选',         role: 'yangke' },
    { id: 'finance',       file: null,                    name: '💰 财务沙盘',       desc: '12 月三档预测',           role: 'yangke' },
    { id: 'moat',          file: null,                    name: '🛡️ 护城河',         desc: '9 条进度 + 时间轴',       role: 'both' },
    { id: 'scripts',       file: null,                    name: '💬 声音档脚本',      desc: '5 条视频脚本（v2.0）',     role: 'both' },
    { id: 'docs',          file: null,                    name: '📚 资料库',         desc: '10 份 Phase + 计划书',     role: 'both' },
    // 实际文件
    { id: 'overview',      file: 'README.md',                    name: '📖 README 总览',     desc: '10 份文档使用优先级',       role: 'both' },
    { id: 'plan',          file: 'plan-v2.0.md',                  name: '📋 项目计划书 v2.0', desc: '33KB / 12 章 / 附录 ABCD', role: 'both' },
    { id: 'phase1',        file: 'phase1-account.md',             name: '🎯 Phase 1 账号定位', desc: '简介 5 选 1 + 标签',         role: 'both' },
    { id: 'phase2',        file: 'phase2-script-voice-v2.md',     name: '🎬 Phase 2 声音档 v2', desc: '5 条脚本（声音档专用）',     role: 'both' },
    { id: 'phase3',        file: 'phase3-anti-grass-10.md',       name: '💣 Phase 3 反种草 10 集', desc: 'M1-M3 选题',         role: 'both' },
    { id: 'phase4',        file: 'phase4-first-video-script.md',  name: '🎥 Phase 4 显微镜头条', desc: '完整分镜',          role: 'both' },
    { id: 'phase5',        file: 'phase5-anxiety-20.md',          name: '😰 Phase 5 焦虑 20 条', desc: 'TOP 8 + 关键词',     role: 'both' },
    { id: 'phase6',        file: 'phase6-three-platforms.md',     name: '🌐 Phase 6 三平台', desc: '小/抖/B 三版本',          role: 'yangke' },
    { id: 'phase7',        file: 'phase7-finance-12mo.md',        name: '💰 Phase 7 财务',   desc: '三档预测 + 决策',           role: 'yangke' },
    { id: 'phase8',        file: 'phase8-own-brand-mvp.md',       name: '👕 Phase 8 自有品牌', desc: '首批 200 件 T 恤',         role: 'both' },
    { id: 'phase9',        file: 'phase9-phase0-countdown.md',    name: '⏰ Phase 9 倒计时表', desc: '6.6-6.20 每日行动',     role: 'yangke' },
    { id: 'phase10',       file: 'phase10-m1-calendar.md',        name: '📅 Phase 10 M1 日历', desc: '4 周 17 条排期',         role: 'both' },
    { id: 'matrix',        file: 'matrix-2026-06-06.md',         name: '🛡️ 06-06 护城河矩阵', desc: '9 条 × 5 路径',              role: 'yangke' },
    { id: 'audioChanges',  file: 'audio-mode-changes.md',         name: '🎙️ 声音档调整记录',   desc: '11:22 重大决定',            role: 'both' },
  ];

  // ============ 倒计时计算 ============
  function getCountdown() {
    const target = new Date('2026-06-20T00:00:00+08:00');
    const now = new Date();
    const diff = target - now;
    if (diff < 0) return { days: 0, passed: true };
    return { days: Math.ceil(diff / (1000 * 60 * 60 * 24)), passed: false };
  }

  function getTodayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  // ============ 路由 ============
  function navigate(viewId) {
    state.currentView = viewId;
    document.querySelectorAll('.nav-item').forEach(n => {
      n.classList.toggle('active', n.dataset.view === viewId);
    });
    render();
    window.scrollTo(0, 0);
  }

  // ============ 渲染分发 ============
  function render() {
    const main = document.getElementById('main');
    const view = state.currentView;
    let html = '';
    switch (view) {
      case 'home':     html = renderHome(); break;
      case 'calendar': html = renderCalendar(); break;
      case 'topics':   html = renderTopics(); break;
      case 'review':   html = renderReview(); break;
      case 'gear':     html = renderGear(); break;
      case 'finance':  html = renderFinance(); break;
      case 'moat':     html = renderMoat(); break;
      case 'scripts':  html = renderScripts(); break;
      case 'docs':     html = renderDocs(); break;
      default:         html = renderHome();
    }
    main.innerHTML = html;
    bindViewEvents();
  }

  // ============ 主页 ============
  function renderHome() {
    const cd = getCountdown();
    const today = getTodayStr();
    const passed = cd.passed;
    const days = cd.days;

    // 今日 Phase 9 任务
    const todayTasks = {
      '2026-06-08': { title: '今天要做的 3 件事', tasks: [
        { text: '✅ 通读 10 份 Phase 文档（2-3 小时）', done: false, who: '杨珂' },
        { text: '✅ 标记需要曼曼拍板的项', done: false, who: '杨珂' },
        { text: '⏰ Phase 9 第一周按倒计时表执行（设备采购优先）', done: false, who: '共同' }
      ]},
      '2026-06-09': { title: '明天要做的 3 件事', tasks: [
        { text: '下单 7 件检测设备（闲鱼 + 淘宝分单）', done: false, who: '杨珂' },
        { text: '曼曼选 1 个简介（5 选 1）', done: false, who: '曼曼' },
        { text: '决定头像 + 标签组合', done: false, who: '曼曼' }
      ]}
    };

    const taskData = todayTasks[today] || { title: 'M1 启动期', tasks: [
      { text: '查看 M1 内容日历 → 选本周选题', done: false, who: '曼曼' },
      { text: '按 Phase 9 倒计时表推进', done: false, who: '共同' }
    ]};

    // 进度
    const phase0Done = state.checklist.phase0 || 0;
    const phase0Total = 5;
    const phase0Pct = Math.round((phase0Done / phase0Total) * 100);

    return `
      <div class="countdown">
        <div class="countdown-days">${passed ? '🚀' : days}</div>
        <div class="countdown-label">
          ${passed ? 'M1 已启动！' : '天 距 6/20 启动日'}
        </div>
      </div>

      <div class="card">
        <div class="card-title">📋 ${taskData.title}</div>
        ${taskData.tasks.map(t => `
          <div class="card-row">
            <span><span class="tag ${t.who === '杨珂' ? 'yangke' : t.who === '曼曼' ? 'manman' : 'both'}">${t.who}</span> ${t.text}</span>
          </div>
        `).join('')}
      </div>

      <div class="card">
        <div class="card-title">🎯 Phase 0 进度</div>
        <div class="card-row">
          <span class="label">完成项</span>
          <span class="value">${phase0Done} / ${phase0Total}</span>
        </div>
        <div class="progress"><div class="progress-bar" style="width: ${phase0Pct}%"></div></div>
        <div class="card-row" style="margin-top: 10px;">
          <button class="btn btn-2" onclick="window.__pm__.incPhase0()">+ 完成一项</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title">📌 9 屏速览</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 4px;">
          <button class="btn btn-2" onclick="window.__pm__.navigate('calendar')">📅 内容日历</button>
          <button class="btn btn-2" onclick="window.__pm__.navigate('topics')">🔬 选题库</button>
          <button class="btn btn-2" onclick="window.__pm__.navigate('review')">📊 周复盘</button>
          <button class="btn btn-2" onclick="window.__pm__.navigate('gear')">🛒 设备采购</button>
          <button class="btn btn-2" onclick="window.__pm__.navigate('finance')">💰 财务沙盘</button>
          <button class="btn btn-2" onclick="window.__pm__.navigate('moat')">🛡️ 护城河</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title">🎙️ 声音档小贴士</div>
        <p style="font-size: 13px; color: var(--text-2); line-height: 1.6;">
          ${state.audioMode ? '当前为 <strong>声音档模式</strong>，所有"老公"会标紫色 🎙️' : '点击右上 🎙️ 开启声音档模式'}
        </p>
        <p style="font-size: 13px; color: var(--text-2); line-height: 1.6; margin-top: 8px;">
          拍摄时杨珂<strong>只出声音</strong>、不出镜。曼曼是画面唯一主角。
        </p>
      </div>
    `;
  }

  // ============ M1 内容日历（4 周 17 条）============
  // 内嵌简化版数据（基于 phase10，但精简到手机能看）
  const M1_CALENDAR = [
    // W1 (6/20-6/26) - 3 条
    { date: '6/20 周六', category: '🏠 生活碎片', title: '自我介绍（声音档首发）', tag: ['manman', 'voice'], time: '10:00' },
    { date: '6/22 周一', category: '🔬 硬核检测', title: '显微镜下的真相：99 vs 999 白 T（声音档）', tag: ['manman', 'voice', 'detect'], time: '19:30' },
    { date: '6/24 周三', category: '👗 母女穿搭', title: '初夏母女白 T 5 套', tag: ['manman'], time: '19:00' },
    { date: '6/26 周五', category: '📐 面料课', title: '克重、支数、织法：3 个数字读懂 T 恤', tag: ['manman', 'voice'], time: '19:30' },
    // W2 (6/27-7/3) - 4 条
    { date: '6/27 周六', category: '🏠 生活碎片', title: '实验室日常 vlog', tag: ['both'], time: '10:00' },
    { date: '6/29 周一', category: '🔬 硬核检测', title: 'UV 灯下 10 件白衣服：这件亮成灯泡', tag: ['manman', 'voice', 'detect'], time: '19:30' },
    { date: '7/1 周三', category: '👜 柜姐揭秘', title: '前柜姐才知道的 3 件事', tag: ['manman'], time: '19:00' },
    { date: '7/3 周五', category: '👗 母女穿搭', title: 'Mini-Me 周末出游 3 套', tag: ['manman'], time: '19:30' },
    // W3 (7/4-7/10) - 4 条
    { date: '7/4 周六', category: '🏠 生活碎片', title: 'M1 半月复盘', tag: ['both'], time: '10:00' },
    { date: '7/6 周一', category: '🔬 硬核检测', title: '燃烧法鉴真丝：这件"100% 桑蚕丝"烧一下', tag: ['manman', 'voice', 'detect'], time: '19:30' },
    { date: '7/8 周三', category: '📐 面料课', title: '亚麻 vs 棉麻 vs 仿麻：3 件白 T 横评', tag: ['manman'], time: '19:00' },
    { date: '7/10 周五', category: '👗 母女穿搭', title: '夏日出行母女防晒穿搭', tag: ['manman'], time: '19:30' },
    // W4 (7/11-7/17) - 4 条
    { date: '7/11 周六', category: '🏠 生活碎片', title: '周日 22:00 复盘 Script 5', tag: ['both', 'voice'], time: '22:00' },
    { date: '7/13 周一', category: '🔬 硬核检测', title: '甲醛检测：童装 5 件横评', tag: ['manman', 'voice', 'detect'], time: '19:30' },
    { date: '7/15 周三', category: '📐 面料课', title: '版型课：直筒 / 微宽松 / oversize', tag: ['manman'], time: '19:00' },
    { date: '7/17 周五', category: '👜 柜姐揭秘', title: '奢侈品 logo 价值 vs 工艺价值', tag: ['manman'], time: '19:30' },
    { date: '7/18 周六', category: '🏠 生活碎片', title: 'M1 收官复盘', tag: ['both', 'voice'], time: '22:00' },
  ];

  function renderCalendar() {
    const weeks = [1, 2, 3, 4];
    const items = M1_CALENDAR.filter(item => {
      const day = parseInt(item.date.split(' ')[0].split('/')[1]);
      if (state.currentWeek === 1) return day >= 20 || day <= 26;
      if (state.currentWeek === 2) return day >= 27;
      if (state.currentWeek === 3) return day >= 4 && day <= 10;
      if (state.currentWeek === 4) return day >= 11 && day <= 18;
      return true;
    });

    return `
      <div class="card">
        <div class="card-title">📅 M1 内容日历</div>
        <div class="card-subtitle">4 周 17 条 · 全部 18:00-20:00 黄金时段</div>
        <div class="week-bar">
          ${weeks.map(w => `<button class="week-pill ${state.currentWeek === w ? 'active' : ''}" data-week="${w}">第 ${w} 周</button>`).join('')}
        </div>
      </div>

      ${items.map(item => {
        const voice = item.tag.includes('voice');
        return `
          <div class="day-card">
            <div class="day-date">
              <strong>${item.date}</strong>
              <span class="day-tag">${item.time}</span>
              <span class="day-tag">${item.category}</span>
            </div>
            <div class="day-title">${item.title}</div>
            <div class="day-meta">
              ${voice ? '<span class="day-meta voice-mark">🎙️ 声音档</span>' : ''}
              ${item.tag.includes('detect') ? '<span class="tag detect">检测</span>' : ''}
              ${item.tag.includes('yangke') ? '<span class="tag yangke">杨珂</span>' : ''}
              ${item.tag.includes('manman') ? '<span class="tag manman">曼曼</span>' : ''}
              ${item.tag.includes('both') ? '<span class="tag both">共同</span>' : ''}
            </div>
          </div>
        `;
      }).join('')}

      <div class="card">
        <div class="card-title">📌 备注</div>
        <p style="font-size: 12px; color: var(--text-2); line-height: 1.6;">
          • 完整排期见 <code>Phase 10 M1 日历</code>（点击底部"资料"查看）<br>
          • 每周日 22:00 固定复盘（声音档 Script 5）<br>
          • 4 条检测类全在周一 19:30（流量高峰 + 实验周期）
        </p>
      </div>
    `;
  }

  // ============ 选题库（反种草 10 + 焦虑 20）============
  const TOPICS = [
    // 反种草 10 集（精选）
    { id: 1, title: '前柜姐揭秘 logo 价值', category: '反种草', cat: 'fanzhongcao', tier: 5, angle: '人设反差', source: 'phase3' },
    { id: 2, title: '儿童防晒衣 99% 是坑', category: '反种草', cat: 'fanzhongcao', tier: 5, angle: '妈妈刚需', source: 'phase3' },
    { id: 3, title: '水光肌打底裤 UV 灯实测', category: '反种草', cat: 'fanzhongcao', tier: 5, angle: '检测壁垒', source: 'phase3' },
    { id: 4, title: '家庭 1 分钟检测：在家也能测', category: '反种草', cat: 'fanzhongcao', tier: 5, angle: '易收藏', source: 'phase3' },
    { id: 5, title: '贵 = 对？999 元 T 恤显微镜下真相', category: '反种草', cat: 'fanzhongcao', tier: 4, angle: '价格反差', source: 'phase3' },
    // 焦虑型 20 条（TOP 8）
    { id: 'A1', title: '新买的白 T 千万别直接穿！', category: '安全焦虑', cat: 'anxiety', tier: 4, angle: '甲醛警告', source: 'phase5' },
    { id: 'A2', title: 'UV 灯下我女儿的 10 件白衣服：这件亮成灯泡', category: '安全焦虑', cat: 'anxiety', tier: 5, angle: '检测爆款', source: 'phase5 TOP1' },
    { id: 'B1', title: '99 元 vs 999 元白 T：怎么选？', category: '决策焦虑', cat: 'anxiety', tier: 4, angle: '价格决策', source: 'phase5' },
    { id: 'B2', title: '设计师品牌值不值？', category: '决策焦虑', cat: 'anxiety', tier: 3, angle: '身份决策', source: 'phase5' },
    { id: 'C1', title: '贵的 T 恤真的显贵吗？', category: '身份焦虑', cat: 'anxiety', tier: 4, angle: '显贵穿搭', source: 'phase5' },
    { id: 'C2', title: '奢侈品 logo 价值 vs 工艺价值', category: '身份焦虑', cat: 'anxiety', tier: 3, angle: '行业内幕', source: 'phase5' },
    { id: 'D1', title: '二孩妈妈的衣橱：15 件穿 30 天', category: '妈妈焦虑', cat: 'anxiety', tier: 4, angle: '胶囊衣橱', source: 'phase5' },
    { id: 'D2', title: '妈妈穿亲子装怎么不土？', category: '妈妈焦虑', cat: 'anxiety', tier: 4, angle: '亲子穿搭', source: 'phase5' },
  ];

  function renderTopics() {
    const filters = [
      { id: 'all', label: '全部 8' },
      { id: 'fanzhongcao', label: '💣 反种草 5' },
      { id: 'anxiety', label: '😰 焦虑型 3' },
      { id: 'tier5', label: '⭐⭐⭐⭐⭐ 5 星' },
      { id: 'tier4', label: '⭐⭐⭐⭐ 4 星' }
    ];
    const items = TOPICS.filter(t => {
      if (state.topicFilter === 'all') return true;
      if (state.topicFilter === 'fanzhongcao') return t.cat === 'fanzhongcao';
      if (state.topicFilter === 'anxiety') return t.cat === 'anxiety';
      if (state.topicFilter === 'tier5') return t.tier === 5;
      if (state.topicFilter === 'tier4') return t.tier === 4;
      return true;
    });

    return `
      <div class="card">
        <div class="card-title">🔬 选题库</div>
        <div class="card-subtitle">M1-M3 弹药库 · TOP 8 高价值</div>
        <div class="filter-bar">
          ${filters.map(f => `<button class="filter-btn ${state.topicFilter === f.id ? 'active' : ''}" data-filter="${f.id}">${f.label}</button>`).join('')}
        </div>
      </div>

      ${items.map(t => `
        <div class="topic-card tier-${t.tier}">
          <div class="topic-title">${t.title}</div>
          <div class="topic-meta">
            <span class="tag">${t.category}</span>
            <span class="tag">${'⭐'.repeat(t.tier)}</span>
            <span class="tag">${t.angle}</span>
            <span class="tag">${t.source}</span>
          </div>
        </div>
      `).join('')}

      <div class="card">
        <div class="card-title">📌 完整选题</div>
        <p style="font-size: 12px; color: var(--text-2);">
          反种草 10 集见 <code>Phase 3</code> · 焦虑型 20 条见 <code>Phase 5</code><br>
          点击底部"资料"查看完整版
        </p>
      </div>
    `;
  }

  // ============ 周复盘 ============
  function renderReview() {
    const last = state.reviews[state.reviews.length - 1];
    return `
      <div class="card">
        <div class="card-title">📊 周复盘</div>
        <div class="card-subtitle">每周日 22:00 · 30 分钟 · 自动算比率</div>
      </div>

      <div class="card">
        <div class="card-title">✍️ 本周数据录入</div>
        <div class="input-row">
          <label>发布条数</label>
          <input type="number" id="r_count" placeholder="4" value="${last?.count || ''}">
        </div>
        <div class="input-row">
          <label>总阅读</label>
          <input type="number" id="r_views" placeholder="3000" value="${last?.views || ''}">
        </div>
        <div class="input-row">
          <label>总点赞</label>
          <input type="number" id="r_likes" placeholder="200" value="${last?.likes || ''}">
        </div>
        <div class="input-row">
          <label>总收藏</label>
          <input type="number" id="r_saves" placeholder="80" value="${last?.saves || ''}">
        </div>
        <div class="input-row">
          <label>总评论</label>
          <input type="number" id="r_comments" placeholder="40" value="${last?.comments || ''}">
        </div>
        <div class="input-row">
          <label>新增粉丝</label>
          <input type="number" id="r_follows" placeholder="50" value="${last?.follows || ''}">
        </div>
        <div class="input-row">
          <label>检测条数</label>
          <input type="number" id="r_detect" placeholder="1" value="${last?.detect || ''}">
        </div>
        <button class="btn" id="saveReviewBtn">💾 保存本周复盘</button>
      </div>

      ${last ? `
        <div class="card">
          <div class="card-title">📈 上周自动算</div>
          <div class="card-row"><span class="label">互动率</span><span class="value ${(last.likes+last.comments+last.saves)/last.views > 0.05 ? 'ok' : 'warn'}">${((last.likes+last.comments+last.saves)/last.views*100).toFixed(2)}%</span></div>
          <div class="card-row"><span class="label">收藏率（检测核心）</span><span class="value ${last.saves/last.views > 0.05 ? 'ok' : 'warn'}">${(last.saves/last.views*100).toFixed(2)}%</span></div>
          <div class="card-row"><span class="label">评论率</span><span class="value">${(last.comments/last.views*100).toFixed(2)}%</span></div>
          <div class="card-row"><span class="label">新增粉丝</span><span class="value ok">+${last.follows}</span></div>
        </div>
      ` : ''}

      <div class="card">
        <div class="card-title">📌 健康线</div>
        <p style="font-size: 12px; color: var(--text-2); line-height: 1.7;">
          • 图文点击率 <code>&gt; 5%</code><br>
          • 互动率 <code>&gt; 3%</code><br>
          • 收藏率（检测核心） <code>&gt; 5%</code><br>
          • 关注转化率 <code>&gt; 20%</code>
        </p>
      </div>
    `;
  }

  // ============ 设备采购 ============
  const GEAR = [
    { name: 'USB 数码显微镜', model: 'Andonstar AD106S', price: '250-350', source: '闲鱼 / 淘宝', key: 'g_microscope' },
    { name: 'UV365 伍德灯手电筒', model: '魔铁 MOTIE', price: '12-100', source: '淘宝 / 拼多多', key: 'g_uvlamp' },
    { name: '甲醛检测试剂盒', model: '绿之源 纺织品专用', price: '25-60', source: '淘宝', key: 'g_formaldehyde' },
    { name: '燃烧法实验套装', model: '酒精灯+镊子+石棉网', price: '66-115', source: '淘宝', key: 'g_burner' },
    { name: '照布镜', model: 'SFY241 + SFY264', price: '40-65', source: '闲鱼 / 淘宝', key: 'g_fabriclens' },
    { name: '电子克重秤 0.01g', model: 'Yueping YP202N', price: '40-80', source: '闲鱼 / 淘宝', key: 'g_scale' },
    { name: '不锈钢尺 30cm', model: '任意品牌', price: '8-20', source: '淘宝', key: 'g_ruler' },
  ];

  function renderGear() {
    const doneCount = GEAR.filter(g => state.checklist[g.key]).length;
    const pct = Math.round((doneCount / GEAR.length) * 100);
    return `
      <div class="card">
        <div class="card-title">🛒 7 件检测设备</div>
        <div class="card-row">
          <span class="label">已购</span>
          <span class="value">${doneCount} / ${GEAR.length}</span>
        </div>
        <div class="progress"><div class="progress-bar" style="width: ${pct}%"></div></div>
        <div class="card-row" style="margin-top: 8px;">
          <span class="label">预算</span>
          <span class="value ok">¥150-790</span>
        </div>
      </div>

      ${GEAR.map(g => `
        <div class="card">
          <div class="card-title" style="cursor: pointer;" data-gear="${g.key}">
            <span>${state.checklist[g.key] ? '✅' : '⬜'}</span> ${g.name}
          </div>
          <div class="card-row"><span class="label">型号</span><span class="value">${g.model}</span></div>
          <div class="card-row"><span class="label">价格</span><span class="value ok">¥${g.price}</span></div>
          <div class="card-row"><span class="label">渠道</span><span class="value">${g.source}</span></div>
        </div>
      `).join('')}

      <div class="card">
        <div class="card-title">💡 采购建议</div>
        <p style="font-size: 12px; color: var(--text-2); line-height: 1.6;">
          • 闲鱼优先买显微镜、照布镜、克重秤（<strong>箱说全</strong>）<br>
          • 拼多多百亿补贴买 UV 灯<br>
          • 6/6 下单，6/9-6/12 到货<br>
          • **必须跑通 7 项实验流程**才能发第一条
        </p>
      </div>
    `;
  }

  // ============ 财务沙盘 ============
  function renderFinance() {
    return `
      <div class="card">
        <div class="card-title">💰 12 月财务沙盘（基准档）</div>
        <div class="card-subtitle">完整版见 Phase 7 · 这里是速览</div>
      </div>

      <div class="card">
        <div class="card-title">🚀 启动投入</div>
        <div class="finance-big ok">¥1,100</div>
        <div class="card-subtitle" style="text-align: center;">设备 + 应急 + 杂项</div>
      </div>

      <div class="card">
        <div class="card-title">📈 三档预测</div>
        <div class="card-row"><span class="label">乐观档 · 12 月总收入</span><span class="value ok">¥105,600</span></div>
        <div class="card-row"><span class="label">基准档 · 12 月总收入</span><span class="value">¥60,700</span></div>
        <div class="card-row"><span class="label">保守档 · 12 月总收入</span><span class="value warn">¥18,800</span></div>
        <div class="card-row"><span class="label">盈亏平衡月</span><span class="value">M3</span></div>
        <div class="card-row"><span class="label">累计回本月</span><span class="value ok">M4</span></div>
        <div class="card-row"><span class="label">第二曲线启动</span><span class="value">M9-M11</span></div>
      </div>

      <div class="card">
        <div class="card-title">🎙️ 声音档净影响</div>
        <div class="card-row">
          <span class="label">净影响</span>
          <span class="value ok">-0.5% ~ -2%</span>
        </div>
        <p style="font-size: 12px; color: var(--text-2); line-height: 1.6;">
          三个对冲策略（金句密度 / 曼曼个人 IP / 检测深度）可挽回大部分损失。
        </p>
      </div>

      <div class="card">
        <div class="card-title">💡 决策建议</div>
        <p style="font-size: 13px; color: var(--text-2); line-height: 1.7;">
          1. <strong>第一年不投广告</strong>，先把内容跑通<br>
          2. <strong>M3 决策点</strong>：粉丝 &gt; 1k = 进 Phase 3<br>
          3. <strong>M6 决策点</strong>：月入 &gt; 3k = 考虑投流<br>
          4. <strong>M9 启动自有品牌</strong>，首批 200 件 T 恤（Phase 8）
        </p>
      </div>

      <div class="card">
        <div class="card-title">📖 完整版</div>
        <p style="font-size: 12px; color: var(--text-2);">查看 <code>Phase 7 12 月财务沙盘</code>（45.8KB / 1036 行）</p>
      </div>
    `;
  }

  // ============ 护城河 ============
  const MOATS = [
    { id: 1, name: '母婴用品安全检测', stars: 5, status: 'urgent', phase: 'M1-' },
    { id: 2, name: '化妆品 / 护肤品', stars: 3, status: 'pending', phase: '穿插' },
    { id: 3, name: '家居纺织品检测', stars: 4, status: 'upcoming', phase: 'M3' },
    { id: 4, name: '儿童食品/零食测评', stars: 4, status: 'upcoming', phase: 'M4' },
    { id: 5, name: '学习用品/文具', stars: 3, status: 'upcoming', phase: 'M6' },
    { id: 6, name: '儿童家具/学习桌椅', stars: 3, status: 'pending', phase: '第二年' },
    { id: 7, name: '家用电器/小家电', stars: 3, status: 'pending', phase: '第二年' },
    { id: 8, name: '声音档 IP 化', stars: 4, status: 'urgent', phase: 'M1-', note: '原 ⭐⭐⭐⭐⭐ 降一档' },
    { id: 9, name: '反种草标签', stars: 5, status: 'urgent', phase: 'M1-' },
  ];

  function renderMoat() {
    return `
      <div class="card">
        <div class="card-title">🛡️ 9 条护城河</div>
        <div class="card-subtitle">⭐ = 护城河强度 · 颜色 = 状态</div>
      </div>

      <div class="moat-grid">
        ${MOATS.map(m => `
          <div class="moat-cell ${m.status === 'urgent' ? 'urgent' : m.status === 'upcoming' ? 'upcoming' : ''}">
            <div class="status">${m.phase}</div>
            <div class="stars">${'⭐'.repeat(m.stars)}</div>
            <div class="name">${m.name}</div>
            ${m.note ? `<div style="font-size: 10px; color: var(--text-3); margin-top: 4px;">${m.note}</div>` : ''}
          </div>
        `).join('')}
      </div>

      <div class="card">
        <div class="card-title">📌 M1 立即投</div>
        <p style="font-size: 13px; color: var(--text-2); line-height: 1.7;">
          • <strong>声音档 IP 化</strong>（护城河 #8）<br>
          • <strong>反种草标签</strong>（护城河 #9）<br>
          • <strong>母婴安全检测</strong>（护城河 #1）<br>
          <br>
          这 3 条是放大器，<strong>给所有其他护城河加成 30-50%</strong>。
        </p>
      </div>

      <div class="card">
        <div class="card-title">📊 护城河 × 变现路径</div>
        <p style="font-size: 12px; color: var(--text-2);">
          5 条护城河是自有品牌金矿：<br>
          <strong>母婴选品 / 儿童食品 / 反种草选品 / 服装 / 家居</strong>
        </p>
      </div>
    `;
  }

  // ============ 声音档脚本 ============
  function renderScripts() {
    return `
      <div class="card">
        <div class="card-title">💬 声音档 5 条脚本</div>
        <div class="card-subtitle">杨珂只出声音、不出镜 · v2.0</div>
      </div>

      <div class="topic-card">
        <div class="topic-title">Script 1 · 反差破冰型（账号介绍）</div>
        <div class="topic-meta">
          <span class="tag voice">声音档</span>
          <span class="tag manman">曼曼画面</span>
          <span class="tag detect">快问快答</span>
        </div>
        <p style="font-size: 12px; color: var(--text-2); margin-top: 8px;">
          曼曼画面 + <span class="voice-mark">老公</span>画外音 · 金句："同样的钱，能买两台"
        </p>
      </div>

      <div class="topic-card">
        <div class="topic-title">Script 2 · 理工男答非所问型</div>
        <div class="topic-meta">
          <span class="tag voice">声音档</span>
          <span class="tag voice">金句</span>
        </div>
        <p style="font-size: 12px; color: var(--text-2); margin-top: 8px;">
          曼曼问"好看吗" → <span class="voice-mark">老公</span>答"克重 180g、纱支 32 支"
        </p>
      </div>

      <div class="topic-card">
        <div class="topic-title">Script 3 · 闲鱼买设备日记</div>
        <div class="topic-meta">
          <span class="tag voice">声音档</span>
          <span class="tag yangke">技术</span>
        </div>
        <p style="font-size: 12px; color: var(--text-2); margin-top: 8px;">
          <span class="voice-mark">老公</span>在闲鱼挑显微镜 · 曼曼吐槽"工程师砍价"
        </p>
      </div>

      <div class="topic-card">
        <div class="topic-title">Script 4 · 实验过程型</div>
        <div class="topic-meta">
          <span class="tag voice">声音档</span>
          <span class="tag detect">检测</span>
        </div>
        <p style="font-size: 12px; color: var(--text-2); margin-top: 8px;">
          <span class="voice-mark">老公</span>操作 + 曼曼实时反应 · 金句："不是为了上镜，是为了她"
        </p>
      </div>

      <div class="topic-card">
        <div class="topic-title">Script 5 · 深夜收尾型</div>
        <div class="topic-meta">
          <span class="tag voice">声音档</span>
          <span class="tag both">周日 22:00</span>
        </div>
        <p style="font-size: 12px; color: var(--text-2); margin-top: 8px;">
          22:30 实验室暖光 · <span class="voice-mark">老公</span> + 曼曼低语 · "工程师智慧"
        </p>
      </div>

      <div class="card">
        <div class="card-title">🎙️ 拍摄守则</div>
        <p style="font-size: 12px; color: var(--text-2); line-height: 1.7;">
          • 杨珂<strong>不露脸</strong>，手部特写 OK<br>
          • 声音<strong>不修音</strong>，原声最好<br>
          • NG 痕迹保留（停顿、口误、卡壳）<br>
          • 杨珂的话用 <code>[老公]</code> 标记
        </p>
      </div>

      <div class="card">
        <div class="card-title">📖 完整版</div>
        <p style="font-size: 12px; color: var(--text-2);">查看 <code>Phase 2 声音档 v2.0</code>（26.4KB）</p>
      </div>
    `;
  }

  // ============ 资料库 ============
  function renderDocs() {
    const filtered = DOCS.filter(d => {
      if (state.docFilter === 'all') return true;
      if (state.docFilter === 'yangke') return d.role === 'yangke' || d.role === 'both';
      if (state.docFilter === 'manman') return d.role === 'manman' || d.role === 'both';
      if (state.docFilter === 'core') return ['home','calendar','topics','review','docs','overview','plan','phase1','phase2','phase10'].includes(d.id);
      return true;
    });
    return `
      <div class="card">
        <div class="card-title">📚 资料库</div>
        <div class="card-subtitle">10 份 Phase + 计划书 + 总览 + 06-06 矩阵</div>
        <div class="filter-bar">
          <button class="filter-btn ${state.docFilter === 'all' ? 'active' : ''}" data-docfilter="all">全部</button>
          <button class="filter-btn ${state.docFilter === 'core' ? 'active' : ''}" data-docfilter="core">⭐ 核心</button>
          <button class="filter-btn ${state.docFilter === 'yangke' ? 'active' : ''}" data-docfilter="yangke">🔧 杨珂用</button>
          <button class="filter-btn ${state.docFilter === 'manman' ? 'active' : ''}" data-docfilter="manman">📸 曼曼用</button>
        </div>
      </div>

      <ul class="docs-list">
        ${filtered.map(d => `
          <li class="docs-item" data-doc="${d.id}">
            <span class="icon">${d.name.split(' ')[0]}</span>
            <div class="info">
              <div class="name">${d.name.split(' ').slice(1).join(' ')}</div>
              <div class="desc">${d.desc}</div>
            </div>
            <span class="arrow">›</span>
          </li>
        `).join('')}
      </ul>
    `;
  }

  // ============ 文档详情（模态框）============
  function openDoc(id) {
    const doc = DOCS.find(d => d.id === id);
    if (!doc) return;
    if (!doc.file) {
      // 内嵌视图（home/calendar/...）
      navigate(id);
      return;
    }
    // 加载 markdown 文件
    fetch('data/' + doc.file)
      .then(r => {
        if (!r.ok) throw new Error('Not found: ' + doc.file);
        return r.text();
      })
      .then(md => {
        const modal = document.createElement('div');
        modal.className = 'modal-bg show';
        modal.innerHTML = `
          <div class="modal">
            <div class="modal-header">
              <div class="modal-title">${doc.name}</div>
              <button class="modal-close">×</button>
            </div>
            <div class="markdown">${window.Markdown.parse(md)}</div>
          </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', e => {
          if (e.target === modal || e.target.classList.contains('modal-close')) {
            document.body.removeChild(modal);
          }
        });
      })
      .catch(err => {
        showToast('❌ 加载失败：' + err.message);
      });
  }

  // ============ 事件绑定 ============
  function bindViewEvents() {
    // 周次切换
    document.querySelectorAll('.week-pill').forEach(el => {
      el.addEventListener('click', () => {
        state.currentWeek = parseInt(el.dataset.week);
        render();
      });
    });
    // 选题筛选
    document.querySelectorAll('.filter-btn[data-filter]').forEach(el => {
      el.addEventListener('click', () => {
        state.topicFilter = el.dataset.filter;
        render();
      });
    });
    // 资料筛选
    document.querySelectorAll('.filter-btn[data-docfilter]').forEach(el => {
      el.addEventListener('click', () => {
        state.docFilter = el.dataset.docfilter;
        render();
      });
    });
    // 设备勾选
    document.querySelectorAll('[data-gear]').forEach(el => {
      el.addEventListener('click', () => {
        const k = el.dataset.gear;
        state.checklist[k] = !state.checklist[k];
        localStorage.setItem('manman-pm.checklist', JSON.stringify(state.checklist));
        render();
      });
    });
    // 文档点击
    document.querySelectorAll('.docs-item').forEach(el => {
      el.addEventListener('click', () => {
        openDoc(el.dataset.doc);
      });
    });
    // 周复盘保存
    const saveBtn = document.getElementById('saveReviewBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const data = {
          week: state.reviews.length + 1,
          date: getTodayStr(),
          count: parseInt(document.getElementById('r_count').value) || 0,
          views: parseInt(document.getElementById('r_views').value) || 0,
          likes: parseInt(document.getElementById('r_likes').value) || 0,
          saves: parseInt(document.getElementById('r_saves').value) || 0,
          comments: parseInt(document.getElementById('r_comments').value) || 0,
          follows: parseInt(document.getElementById('r_follows').value) || 0,
          detect: parseInt(document.getElementById('r_detect').value) || 0,
        };
        if (data.count === 0) {
          showToast('❌ 发布条数不能为 0');
          return;
        }
        state.reviews.push(data);
        localStorage.setItem('manman-pm.reviews', JSON.stringify(state.reviews));
        showToast('✅ 周复盘已保存');
        render();
      });
    }
  }

  // ============ 角色切换 ============
  function setRole(role) {
    state.role = role;
    localStorage.setItem('manman-pm.role', role);
    document.body.className = `role-${role}${state.audioMode ? ' audio-mode' : ''}`;
    document.getElementById('roleLabel').textContent = ROLES[role].label;
    document.querySelector('.role-icon').textContent = ROLES[role].icon;
    showToast(`切换到 ${ROLES[role].label} 视角`);
    render();
  }

  function toggleRole() {
    const next = { yangke: 'manman', manman: 'both', both: 'yangke' };
    setRole(next[state.role]);
  }

  // ============ 声音档 toggle ============
  function toggleAudio() {
    state.audioMode = !state.audioMode;
    localStorage.setItem('manman-pm.audio', state.audioMode ? '1' : '0');
    document.body.classList.toggle('audio-mode', state.audioMode);
    document.getElementById('audioToggle').classList.toggle('active', state.audioMode);
    showToast(state.audioMode ? '🎙️ 声音档模式已开启' : '🔇 声音档模式已关闭');
  }

  // ============ Toast ============
  function showToast(text) {
    let t = document.querySelector('.toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = text;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
  }

  // ============ 倒计时副标题 ============
  function updateSubtitle() {
    const cd = getCountdown();
    const sub = document.getElementById('subtitle');
    if (sub) {
      if (cd.passed) sub.textContent = '🚀 M1 已启动！';
      else sub.textContent = `M1 破冰期 · 启动倒计时 ${cd.days} 天`;
    }
  }

  // ============ Phase 0 进度 ============
  function incPhase0() {
    state.checklist.phase0 = Math.min((state.checklist.phase0 || 0) + 1, 5);
    localStorage.setItem('manman-pm.checklist', JSON.stringify(state.checklist));
    showToast(`✅ Phase 0 完成 ${state.checklist.phase0}/5`);
    render();
  }

  // ============ 初始化 ============
  function init() {
    // 角色
    document.body.className = `role-${state.role}${state.audioMode ? ' audio-mode' : ''}`;
    document.getElementById('roleLabel').textContent = ROLES[state.role].label;
    document.querySelector('.role-icon').textContent = ROLES[state.role].icon;
    document.getElementById('audioToggle').classList.toggle('active', state.audioMode);

    // 顶栏事件
    document.getElementById('roleToggle').addEventListener('click', toggleRole);
    document.getElementById('audioToggle').addEventListener('click', toggleAudio);

    // 底部导航
    document.querySelectorAll('.nav-item').forEach(n => {
      n.addEventListener('click', () => navigate(n.dataset.view));
    });

    // 暴露 API
    window.__pm__ = {
      navigate,
      incPhase0,
      toggleRole,
      toggleAudio,
    };

    updateSubtitle();
    render();
  }

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
