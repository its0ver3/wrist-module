import Storage from './storage.js';
import Progress from './progress.js';
import Router from './router.js';

const Dashboard = {
  async render(app, modules) {
    const stats = Storage.getStats();
    const dueReviews = Storage.getDueReviews();
    const recommended = Progress.getRecommendedNext(modules);
    const lastVisited = Storage.getLastVisited();

    const colorMap = {
      emerald: { bg: 'bg-primary', light: 'bg-primary/10 dark:bg-primary/15', text: 'text-primary dark:text-blue-400', border: 'border-primary/20 dark:border-primary/30' },
      blue: { bg: 'bg-primary', light: 'bg-primary/10 dark:bg-primary/15', text: 'text-primary dark:text-blue-400', border: 'border-primary/20 dark:border-primary/30' },
      purple: { bg: 'bg-primary', light: 'bg-primary/10 dark:bg-primary/15', text: 'text-primary dark:text-blue-400', border: 'border-primary/20 dark:border-primary/30' },
      rose: { bg: 'bg-primary', light: 'bg-primary/10 dark:bg-primary/15', text: 'text-primary dark:text-blue-400', border: 'border-primary/20 dark:border-primary/30' }
    };

    app.innerHTML = `
      <section class="mb-10">
        <div class="relative overflow-hidden rounded-xl bg-slate-900 text-white p-8 md:p-12">
          <div class="absolute inset-0 opacity-20 bg-gradient-to-br from-primary to-blue-800"></div>
          <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div class="max-w-xl text-center md:text-left">
              <h1 class="text-3xl md:text-4xl font-black mb-3 leading-tight">Wrist Conditions Learning Modules</h1>
              <p class="text-slate-300 text-base mb-6">Upper Extremity Orthopedic Treatment — FT300 PT500</p>
              ${recommended ? `
                <button onclick="window.location.hash='#/module/${recommended.moduleId}/lesson/${recommended.lessonId}'"
                  class="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-bold transition-all inline-flex items-center gap-2">
                  <span class="material-symbols-outlined">rocket_launch</span>
                  ${stats.completedLessons === 0 ? 'Start Learning' : 'Continue Learning'}
                </button>
              ` : `
                <button onclick="window.location.hash='#/final-quiz'"
                  class="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-bold transition-all inline-flex items-center gap-2">
                  <span class="material-symbols-outlined">emoji_events</span>
                  Take Final Assessment
                </button>
              `}
            </div>
            <div class="flex items-center gap-6 bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
              <div class="text-center">
                <p class="text-3xl font-bold">${stats.completionPercent}%</p>
                <p class="text-xs uppercase tracking-wider text-slate-300">Complete</p>
              </div>
              <div class="w-[1px] h-12 bg-white/20"></div>
              <div class="text-center">
                <p class="text-3xl font-bold">${stats.completedLessons}/${stats.totalLessons}</p>
                <p class="text-xs uppercase tracking-wider text-slate-300">Lessons</p>
              </div>
              <div class="w-[1px] h-12 bg-white/20"></div>
              <div class="text-center">
                <p class="text-3xl font-bold">${stats.averageScore}%</p>
                <p class="text-xs uppercase tracking-wider text-slate-300">Avg Score</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div class="lg:col-span-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">grid_view</span>
              Learning Modules
            </h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${modules.map(mod => {
              const progress = Progress.getModuleProgress(mod);
              const colors = colorMap[mod.color] || colorMap.blue;
              const hasDueReview = mod.lessons.some(l => dueReviews.includes(l.id));
              return `
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden group hover:shadow-xl transition-all cursor-pointer"
                  onclick="window.location.hash='#/module/${mod.id}'">
                  <div class="h-3 ${colors.bg}"></div>
                  <div class="p-5">
                    <div class="flex items-start justify-between mb-3">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 ${colors.light} rounded-lg flex items-center justify-center">
                          <span class="material-symbols-outlined ${colors.text}">${mod.icon}</span>
                        </div>
                        <div>
                          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Module ${mod.id}</span>
                          <h3 class="text-lg font-bold group-hover:text-primary transition-colors">${mod.title}</h3>
                        </div>
                      </div>
                      ${hasDueReview ? `
                        <span class="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <span class="material-symbols-outlined text-xs">schedule</span>Review Due
                        </span>
                      ` : ''}
                    </div>
                    <p class="text-slate-500 dark:text-slate-400 text-sm mb-1">${mod.description}</p>
                    <p class="text-xs text-slate-400 mb-4">${mod.bloomLevel}</p>
                    <div class="mb-4">
                      <div class="flex justify-between text-xs font-semibold mb-1">
                        <span>${progress.completed}/${progress.total} lessons</span>
                        <span>${progress.percent}%</span>
                      </div>
                      <div class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div class="h-full ${colors.bg} rounded-full transition-all duration-500" style="width: ${progress.percent}%"></div>
                      </div>
                    </div>
                    <button class="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white rounded-lg text-sm font-bold transition-all">
                      ${progress.percent === 100 ? 'Review' : progress.percent > 0 ? 'Continue' : 'Start'}
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Final Assessment Card -->
          <div class="mt-8">
            ${this._renderFinalQuizCard(modules, stats)}
          </div>
        </div>

        <div class="lg:col-span-4 space-y-8">
          ${dueReviews.length > 0 ? this._renderReviewsDue(dueReviews, modules) : ''}
          ${this._renderRecentlyCompleted(modules)}
        </div>
      </div>
    `;
  },

  _renderFinalQuizCard(modules, stats) {
    const finalScore = Storage.getFinalQuizScore();

    return `
      <div class="bg-gradient-to-r from-primary/10 to-blue-800/10 border border-primary/20 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all"
        onclick="window.location.hash='#/final-quiz'">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
            <span class="material-symbols-outlined text-primary">emoji_events</span>
          </div>
          <div class="flex-1">
            <h3 class="font-bold text-lg">Final Comprehensive Assessment</h3>
            <p class="text-sm text-slate-500">15 questions across all modules</p>
          </div>
          ${finalScore ? `
            <div class="text-right">
              <p class="text-2xl font-bold text-primary">${finalScore.percentage}%</p>
              <p class="text-xs text-slate-500">Best Score</p>
            </div>
          ` : `
            <span class="material-symbols-outlined text-primary text-3xl">arrow_forward</span>
          `}
        </div>
      </div>
    `;
  },

  _renderReviewsDue(dueReviews, modules) {
    const lessons = modules.flatMap(m => m.lessons.map(l => ({ ...l, moduleId: m.id })));
    const dueItems = dueReviews.map(id => lessons.find(l => l.id === id)).filter(Boolean);

    return `
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <h3 class="text-lg font-bold mb-5 flex items-center gap-2">
          <span class="material-symbols-outlined text-amber-500">schedule</span>
          Reviews Due
        </h3>
        <div class="space-y-3">
          ${dueItems.map(item => `
            <div class="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-lg border-l-4 border-amber-400 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
              onclick="window.location.hash='#/module/${item.moduleId}/lesson/${item.id}'">
              <div class="flex-1">
                <p class="text-sm font-bold">${item.title}</p>
                <p class="text-xs text-slate-500">Tap to review</p>
              </div>
              <span class="material-symbols-outlined text-amber-500 text-sm">arrow_forward</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  _renderRecentlyCompleted(modules) {
    const completed = Storage.getCompletedLessons();
    const entries = Object.entries(completed)
      .sort(([, a], [, b]) => new Date(b) - new Date(a))
      .slice(0, 5);

    if (entries.length === 0) {
      return `
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">history</span>
            Recently Completed
          </h3>
          <p class="text-sm text-slate-500">No lessons completed yet. Start learning!</p>
        </div>
      `;
    }

    const allLessons = modules.flatMap(m => m.lessons.map(l => ({ ...l, moduleId: m.id })));

    return `
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <h3 class="text-lg font-bold mb-5 flex items-center gap-2">
          <span class="material-symbols-outlined text-primary">history</span>
          Recently Completed
        </h3>
        <div class="space-y-4">
          ${entries.map(([lessonId, date]) => {
            const lesson = allLessons.find(l => l.id === lessonId);
            const score = Storage.getQuizScore(lessonId);
            if (!lesson) return '';
            return `
              <div class="flex items-center gap-3 group cursor-pointer"
                onclick="window.location.hash='#/module/${lesson.moduleId}/lesson/${lessonId}'">
                <div class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                  <span class="material-symbols-outlined text-green-600 dark:text-green-400 text-lg">check_circle</span>
                </div>
                <div class="flex-1 overflow-hidden">
                  <p class="text-sm font-bold truncate group-hover:text-primary transition-colors">${lesson.title}</p>
                  <p class="text-xs text-slate-500">${score ? score.percentage + '% score' : 'Completed'}</p>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }
};

export default Dashboard;
