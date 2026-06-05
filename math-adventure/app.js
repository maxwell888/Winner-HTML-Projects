/**
 * math-adventure/app.js
 * 应用主逻辑：路由、状态管理、页面渲染、进度持久化
 */

const App = {
  // 当前状态
  state: {
    gradeId: null,
    unitId: null,
    lessonId: null,
    mode: 'grades', // grades | units | animation | quiz | result
    currentStep: 0
  },

  // 组件实例
  sceneRenderer: null,
  quizEngine: null,
  animController: null,

  // 进度数据
  progress: null,

  /* ================================================================
   * 初始化
   * ================================================================ */
  init() {
    try {
      this.sceneRenderer = new SVGSceneRenderer();
      this.quizEngine = new QuizEngine();
      this.progress = this._loadProgress();

      // 路由监听
      window.addEventListener('hashchange', () => {
        try { this._route(); } catch(e) {
          console.error('Route error:', e);
          document.getElementById('main-content').innerHTML = '<div class="text-center p-8 text-red-500 text-xl">⚠️ 页面出错，<a href="#" class="underline">点此返回首页</a></div>';
        }
      });
      this._route();
    } catch(e) {
      console.error('App init error:', e);
      document.getElementById('main-content').innerHTML = '<div class="text-center p-8 text-red-500 text-xl">⚠️ 初始化失败：' + e.message + '</div>';
    }
  },

  /* ================================================================
   * 进度管理
   * ================================================================ */
  _loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* 忽略解析错误 */ }
    return JSON.parse(JSON.stringify(DEFAULT_PROGRESS));
  },

  _saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
    } catch (e) { /* 忽略存储错误 */ }
  },

  _markLessonComplete(lessonId, stars) {
    if (!this.progress.lessons[lessonId]) {
      this.progress.lessons[lessonId] = {};
    }
    const lesson = this.progress.lessons[lessonId];
    lesson.completed = true;
    lesson.stars = Math.max(lesson.stars || 0, stars);
    lesson.completedAt = new Date().toISOString().split('T')[0];

    // 更新连续天数
    const today = new Date().toISOString().split('T')[0];
    if (this.progress.lastStudyDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (this.progress.lastStudyDate === yesterday) {
        this.progress.streak = (this.progress.streak || 0) + 1;
      } else if (this.progress.lastStudyDate !== today) {
        this.progress.streak = 1;
      }
      this.progress.lastStudyDate = today;
    }
    this.progress.stars += stars;
    this._saveProgress();
  },

  /* ================================================================
   * 路由系统
   * ================================================================ */
  _route() {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    const parts = hash.split('/').filter(Boolean);

    if (parts.length === 0) {
      this.state.mode = 'grades';
      this._renderGrades();
    } else if (parts[0] === 'grade' && parts.length >= 2) {
      this.state.gradeId = parts[1];
      if (parts.length === 2) {
        this.state.mode = 'units';
        this._renderUnits();
      } else if (parts[2] === 'unit' && parts.length >= 4) {
        this.state.unitId = parts[3];
        if (parts.length === 4) {
          this._renderLessonList();
        } else if (parts[4] === 'lesson' && parts.length >= 6) {
          this.state.lessonId = parts[5];
          if (parts[6] === 'quiz') {
            this.state.mode = 'quiz';
            this._renderQuiz();
          } else {
            this.state.mode = 'animation';
            this._renderAnimation();
          }
        }
      }
    }
  },

  _navigate(path) {
    window.location.hash = '#' + path;
  },

  /* ================================================================
   * 页面渲染 — 年级选择
   * ================================================================ */
  _renderGrades() {
    this.state.mode = 'grades';
    const main = document.getElementById('main-content');

    const grades = MATH_DATA.grades;
    const cards = Object.entries(grades).map(([id, g]) => {
      const isUnlocked = parseInt(id) <= 3; // Phase 3: 二、三年级解锁
      const completedCount = Object.values(this.progress.lessons || {}).filter(l => l.completed).length;
      return `
        <div class="grade-card ${isUnlocked ? 'cursor-pointer hover:scale-105' : 'opacity-60 cursor-not-allowed'} bg-white rounded-3xl p-6 shadow-lg border-2 ${isUnlocked ? 'border-emerald-200 hover:border-emerald-400 hover:shadow-xl' : 'border-gray-200'} transition-all duration-300"
             ${isUnlocked ? `onclick="App._navigate('grade/${id}')"` : ''}>
          <div class="text-center">
            <div class="text-5xl mb-3">${g.mascot}</div>
            <div class="inline-block px-3 py-1 rounded-full text-sm font-bold text-${g.color}-600 bg-${g.color}-100 mb-2">${g.name}</div>
            <p class="text-sm text-gray-400">${g.subtitle}</p>
            ${!isUnlocked ? '<div class="mt-3"><i class="fa fa-lock text-gray-300 text-2xl"></i></div>' : ''}
            ${completedCount > 0 ? `<div class="mt-2 text-xs text-${g.color}-500">⭐ 已完成 ${completedCount} 课时</div>` : ''}
          </div>
        </div>`;
    }).join('');

    main.innerHTML = `
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-10">
          <h1 class="text-4xl font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 bg-clip-text text-transparent mb-2">🌟 数学探险之旅</h1>
          <p class="text-gray-400 text-lg">和吉祥物一起探索有趣的数学世界</p>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-5" id="grade-grid">
          ${cards}
        </div>
        ${this.progress.stars > 0 ? `
        <div class="mt-8 text-center">
          <div class="inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-3 shadow">
            <span class="text-2xl">⭐</span>
            <span class="text-lg font-bold text-gray-700">共获得 ${this.progress.stars} 颗星</span>
            ${this.progress.streak > 1 ? `<span class="text-amber-500 text-sm">🔥 连续 ${this.progress.streak} 天</span>` : ''}
          </div>
        </div>` : ''}
      </div>
    `;
  },

  /* ================================================================
   * 页面渲染 — 单元选择
   * ================================================================ */
  _renderUnits() {
    const main = document.getElementById('main-content');
    const grade = MATH_DATA.grades[this.state.gradeId];
    if (!grade) return this._renderGrades();

    const units = grade.units.map(u => {
      const isLocked = u.locked;
      return `
        <div class="unit-card bg-white rounded-2xl p-5 shadow border-2 ${isLocked ? 'border-gray-200 opacity-60 cursor-not-allowed' : 'border-orange-200 hover:border-orange-400 hover:shadow-lg cursor-pointer'} transition-all duration-300"
             ${!isLocked ? `onclick="App._navigate('grade/${this.state.gradeId}/unit/${u.id}')"` : ''}>
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-${u.color || 'orange'}-100 flex items-center justify-center text-${u.color || 'orange'}-500 text-xl">
              <i class="fa ${u.icon}"></i>
            </div>
            <div>
              <h3 class="font-bold text-gray-700">${u.name}</h3>
              <p class="text-xs text-gray-400">${isLocked ? '🔒 即将开放' : '点击进入学习'}</p>
            </div>
          </div>
        </div>`;
    }).join('');

    main.innerHTML = `
      <div class="max-w-2xl mx-auto">
        <div class="flex items-center gap-3 mb-6">
          <button onclick="App._navigate('')" class="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
            <i class="fa fa-arrow-left"></i>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-700">${grade.name} ${grade.mascot}</h1>
            <p class="text-sm text-gray-400">${grade.subtitle} · ${grade.mascotName}陪你学</p>
          </div>
        </div>
        <div class="space-y-3">${units}</div>
      </div>
    `;
  },

  /* ================================================================
   * 页面渲染 — 课时列表
   * ================================================================ */
  _renderLessonList() {
    const main = document.getElementById('main-content');
    const grade = MATH_DATA.grades[this.state.gradeId];
    const unit = grade?.units.find(u => u.id === this.state.unitId);
    if (!unit || unit.locked) return this._renderUnits();

    const lessons = unit.lessons.map((l, idx) => {
      const prog = this.progress.lessons[l.id];
      const completed = prog?.completed;
      const stars = prog?.stars || 0;
      return `
        <div class="bg-white rounded-2xl p-5 shadow border-2 border-gray-100 hover:border-emerald-300 hover:shadow-md cursor-pointer transition-all duration-300"
             onclick="App._navigate('grade/${this.state.gradeId}/unit/${this.state.unitId}/lesson/${l.id}')">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-full ${completed ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-500'} flex items-center justify-center font-bold text-sm">${idx + 1}</div>
            <div class="flex-1">
              <h3 class="font-bold text-gray-700">${l.title}</h3>
              <p class="text-sm text-gray-400">${l.subtitle}</p>
            </div>
            <div class="text-right">
              ${completed ? `<div class="flex gap-0.5">${[1,2,3].map(i => `<span class="${i <= stars ? '' : 'opacity-30'}">⭐</span>`).join('')}</div>` : '<span class="text-xs text-gray-300">未学习</span>'}
              <i class="fa fa-chevron-right text-gray-300 ml-2"></i>
            </div>
          </div>
        </div>`;
    }).join('');

    main.innerHTML = `
      <div class="max-w-2xl mx-auto">
        <div class="flex items-center gap-3 mb-6">
          <button onclick="App._navigate('grade/${this.state.gradeId}')" class="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
            <i class="fa fa-arrow-left"></i>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-700">${unit.name}</h1>
            <p class="text-sm text-gray-400">共 ${unit.lessons.length} 个课时</p>
          </div>
        </div>
        <div class="space-y-3">${lessons}</div>
      </div>
    `;
  },

  /* ================================================================
   * 页面渲染 — 动画讲解
   * ================================================================ */
  _renderAnimation() {
    const main = document.getElementById('main-content');
    const grade = MATH_DATA.grades[this.state.gradeId];
    const unit = grade?.units.find(u => u.id === this.state.unitId);
    const lesson = unit?.lessons.find(l => l.id === this.state.lessonId);
    if (!lesson) return this._renderLessonList();

    this.state.currentStep = 0;
    if (this.animController) this.animController.reset();

    main.innerHTML = `
      <div class="max-w-3xl mx-auto">
        <!-- 顶部导航 -->
        <div class="flex items-center justify-between mb-4">
          <button onclick="App._navigate('grade/${this.state.gradeId}/unit/${this.state.unitId}')" class="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
            <i class="fa fa-arrow-left"></i>
          </button>
          <div class="text-center">
            <h1 class="text-xl font-bold text-gray-700">${lesson.title}</h1>
            <p class="text-xs text-gray-400">${lesson.subtitle}</p>
          </div>
          <button id="btn-replay" class="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-gray-400 hover:text-amber-500 transition-colors" title="重播动画">
            <i class="fa fa-refresh"></i>
          </button>
        </div>

        <!-- 故事引入 -->
        <div class="bg-amber-50 rounded-2xl p-4 mb-4 text-center border border-amber-200">
          <p class="text-amber-700"><span class="text-2xl mr-2">📖</span>${lesson.sceneConfig.story}</p>
        </div>

        <!-- SVG 动画区域 -->
        <div id="svg-scene" class="bg-white rounded-2xl shadow-lg p-4 mb-4 border border-gray-100" style="min-height:360px">
          <div class="flex items-center justify-center h-full text-gray-300">
            <p>动画准备中...</p>
          </div>
        </div>

        <!-- 步骤说明 -->
        <div class="bg-white rounded-2xl p-4 shadow mb-4 border border-gray-100 text-center" id="step-info">
          <p class="text-lg text-gray-600" id="narration-display">点击"下一步"开始动画</p>
          <p class="text-xl font-bold text-orange-500 mt-1" id="formula-display"></p>
          <p class="text-xs text-gray-400 mt-2" id="step-counter">步骤 0/${lesson.sceneConfig.steps.length}</p>
        </div>

        <!-- 控制按钮 -->
        <div class="flex justify-center gap-3">
          <button id="btn-prev" class="px-6 py-3 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-all font-bold disabled:opacity-40" disabled>
            <i class="fa fa-step-backward mr-1"></i>上一步
          </button>
          <button id="btn-next" class="px-8 py-3 bg-gradient-to-r from-emerald-400 to-green-500 text-white rounded-xl hover:from-emerald-500 hover:to-green-600 transition-all font-bold shadow-lg shadow-emerald-200 active:scale-95">
            下一步 <i class="fa fa-step-forward ml-1"></i>
          </button>
        </div>

        <!-- 完成后跳转 -->
        <div id="post-animation-area" class="mt-6 text-center hidden">
          <button onclick="App._navigate('grade/${this.state.gradeId}/unit/${this.state.unitId}/lesson/${this.state.lessonId}/quiz')"
                  class="px-8 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl hover:from-amber-500 hover:to-orange-600 transition-all font-bold shadow-lg shadow-orange-200 active:scale-95 text-lg">
            ✨ 开始练习 ✨
          </button>
        </div>
      </div>
    `;

    // 初始化场景渲染
    const sceneContainer = document.getElementById('svg-scene');
    this.animController = this.sceneRenderer.render(
      sceneContainer,
      lesson.sceneType,
      lesson.sceneConfig,
      () => {
        // 动画全部完成
        document.getElementById('btn-next').disabled = true;
        document.getElementById('btn-prev').disabled = true;
        document.getElementById('post-animation-area').classList.remove('hidden');
        document.getElementById('step-counter').textContent = `🎉 讲解完成！`;
        document.getElementById('narration-display').textContent = '你已经理解了这个知识点，来做几道练习巩固一下吧！';
      }
    );

    // 更新 narration
    this._syncNarration(lesson);

    // 绑定按钮
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const btnReplay = document.getElementById('btn-replay');

    btnNext.addEventListener('click', () => {
      if (this.animController) {
        this.animController.runStep();
        this.state.currentStep++;
        this._syncNarration(lesson);
        if (this.state.currentStep > 0) btnPrev.disabled = false;
        if (this.state.currentStep >= this.animController.totalSteps) {
          btnNext.disabled = true;
        }
      }
    });

    btnPrev.addEventListener('click', () => {
      // 重置并重播到前一步
      if (this.animController) {
        this.animController.reset();
        this.state.currentStep = 0;
        for (let i = 0; i < Math.max(0, this.state.currentStep - 1); i++) {
          // 简化：直接重置场景，从步骤0重新开始
        }
        // 简化处理：重置整个场景
        const sc = document.getElementById('svg-scene');
        this.animController = this.sceneRenderer.render(
          sc, lesson.sceneType, lesson.sceneConfig,
          () => {
            document.getElementById('btn-next').disabled = true;
            document.getElementById('post-animation-area').classList.remove('hidden');
          }
        );
        this.state.currentStep = 0;
        btnPrev.disabled = true;
        btnNext.disabled = false;
        document.getElementById('post-animation-area').classList.add('hidden');
        this._syncNarration(lesson);
      }
    });

    btnReplay.addEventListener('click', () => {
      const sc = document.getElementById('svg-scene');
      this.sceneRenderer.destroy();
      this.animController = this.sceneRenderer.render(
        sc, lesson.sceneType, lesson.sceneConfig,
        () => {
          document.getElementById('btn-next').disabled = true;
          document.getElementById('post-animation-area').classList.remove('hidden');
          document.getElementById('step-counter').textContent = `🎉 讲解完成！`;
          document.getElementById('narration-display').textContent = '你已经理解了这个知识点，来做几道练习巩固一下吧！';
        }
      );
      this.state.currentStep = 0;
      btnPrev.disabled = true;
      btnNext.disabled = false;
      document.getElementById('post-animation-area').classList.add('hidden');
      this._syncNarration(lesson);
    });
  },

  _syncNarration(lesson) {
    const narrationEl = document.getElementById('narration-display');
    const formulaEl = document.getElementById('formula-display');
    const counterEl = document.getElementById('step-counter');
    if (!narrationEl || !counterEl) return;

    const totalSteps = lesson.sceneConfig.steps.length;
    if (this.state.currentStep === 0) {
      narrationEl.textContent = '点击"下一步"开始动画';
      if (formulaEl) formulaEl.textContent = '';
      counterEl.textContent = `步骤 0/${totalSteps}`;
    } else if (this.state.currentStep <= totalSteps) {
      const step = lesson.sceneConfig.steps[this.state.currentStep - 1];
      narrationEl.textContent = step.narration;
      if (formulaEl) formulaEl.textContent = step.resultText || '';
      counterEl.textContent = `步骤 ${this.state.currentStep}/${totalSteps}`;
    }
  },

  /* ================================================================
   * 页面渲染 — 练习
   * ================================================================ */
  _renderQuiz() {
    const main = document.getElementById('main-content');
    const grade = MATH_DATA.grades[this.state.gradeId];
    const unit = grade?.units.find(u => u.id === this.state.unitId);
    const lesson = unit?.lessons.find(l => l.id === this.state.lessonId);
    if (!lesson) return this._renderLessonList();

    this.quizEngine.load(lesson.exercises);
    this.quizEngine.onFinish = (score, total) => {
      const stars = this.quizEngine.getStars();
      this._markLessonComplete(this.state.lessonId, stars);

      // 显示返回按钮
      setTimeout(() => {
        const resultsDiv = document.getElementById('quiz-container');
        if (resultsDiv) {
          const backDiv = document.createElement('div');
          backDiv.className = 'text-center mt-6 space-y-3';
          backDiv.innerHTML = `
            <button onclick="App._navigate('grade/${this.state.gradeId}/unit/${this.state.unitId}')"
                    class="px-8 py-3 bg-gradient-to-r from-emerald-400 to-green-500 text-white rounded-xl hover:from-emerald-500 hover:to-green-600 transition-all font-bold shadow-lg shadow-emerald-200 active:scale-95">
              <i class="fa fa-arrow-left mr-2"></i>返回课时列表
            </button>
            <br>
            <button onclick="App.quizEngine.reset(); App._renderQuiz();"
                    class="px-6 py-2 text-amber-500 hover:text-amber-600 transition-colors font-bold text-sm">
              <i class="fa fa-refresh mr-1"></i>重新练习
            </button>
          `;
          resultsDiv.appendChild(backDiv);
        }
      }, 100);
    };

    main.innerHTML = `
      <div class="max-w-lg mx-auto">
        <div class="flex items-center gap-3 mb-4">
          <button onclick="App._navigate('grade/${this.state.gradeId}/unit/${this.state.unitId}/lesson/${this.state.lessonId}')" class="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
            <i class="fa fa-arrow-left"></i>
          </button>
          <div>
            <h1 class="text-xl font-bold text-gray-700">📝 ${lesson.title} — 练习</h1>
            <p class="text-xs text-gray-400">共 ${lesson.exercises.length} 题，加油！</p>
          </div>
        </div>
        <div id="quiz-container"></div>
      </div>
    `;

    const quizContainer = document.getElementById('quiz-container');
    const renderNext = () => {
      this.quizEngine.renderQuestion(quizContainer, renderNext);
    };
    renderNext();
  }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => App.init());
