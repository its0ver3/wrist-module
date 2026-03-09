import Storage from './storage.js';
import Progress from './progress.js';

const ModuleView = {
  render(app, moduleData, allModules) {
    if (!moduleData) {
      app.innerHTML = `<div class="text-center py-20"><p class="text-lg text-slate-500">Module not found.</p><a href="#/" class="text-primary font-bold">Back to Dashboard</a></div>`;
      return;
    }

    const progress = Progress.getModuleProgress(moduleData);
    const dueReviews = Storage.getDueReviews();
    const isRecommended = this._isRecommendedModule(moduleData, allModules);

    const colorMap = {
      emerald: { bg: 'bg-primary', light: 'bg-primary/10 dark:bg-primary/15', text: 'text-primary dark:text-blue-400' },
      blue: { bg: 'bg-primary', light: 'bg-primary/10 dark:bg-primary/15', text: 'text-primary dark:text-blue-400' },
      purple: { bg: 'bg-primary', light: 'bg-primary/10 dark:bg-primary/15', text: 'text-primary dark:text-blue-400' },
      rose: { bg: 'bg-primary', light: 'bg-primary/10 dark:bg-primary/15', text: 'text-primary dark:text-blue-400' }
    };
    const colors = colorMap[moduleData.color] || colorMap.blue;

    app.innerHTML = `
      <div class="max-w-4xl mx-auto">
        <!-- Breadcrumbs -->
        <nav class="flex items-center gap-2 text-sm mb-6 text-slate-500 dark:text-slate-400">
          <a class="hover:text-primary transition-colors cursor-pointer" onclick="window.location.hash='#/'">Home</a>
          <span class="material-symbols-outlined text-sm">chevron_right</span>
          <span class="text-slate-900 dark:text-white font-medium">Module ${moduleData.id}: ${moduleData.title}</span>
        </nav>

        ${!isRecommended ? `
          <div class="mb-6 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4 rounded-r-lg">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-amber-600 dark:text-amber-400">info</span>
              <p class="text-sm text-amber-800 dark:text-amber-200">
                <strong>Heads up:</strong> Earlier modules haven't been completed yet. For the best learning experience, we recommend completing modules in order. But feel free to explore!
              </p>
            </div>
          </div>
        ` : ''}

        <!-- Module Header -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 mb-8">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-14 h-14 ${colors.light} rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined ${colors.text} text-3xl">${moduleData.icon}</span>
            </div>
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Module ${moduleData.id}</span>
              <h1 class="text-2xl font-bold">${moduleData.title}</h1>
            </div>
          </div>
          <p class="text-slate-600 dark:text-slate-400 mb-4">${moduleData.description}</p>
          <div class="flex items-center gap-4">
            <span class="text-xs font-semibold px-3 py-1 ${colors.light} ${colors.text} rounded-full">${moduleData.bloomLevel}</span>
            <span class="text-xs text-slate-500">${moduleData.lessons.length} lessons</span>
          </div>
          <div class="mt-4">
            <div class="flex justify-between text-xs font-semibold mb-1">
              <span>Progress</span>
              <span>${progress.percent}%</span>
            </div>
            <div class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full ${colors.bg} rounded-full transition-all duration-500" style="width: ${progress.percent}%"></div>
            </div>
          </div>
        </div>

        <!-- Lessons List -->
        <div class="space-y-4">
          ${moduleData.lessons.map((lesson, index) => {
            const isComplete = Storage.isLessonComplete(lesson.id);
            const score = Storage.getQuizScore(lesson.id);
            const isReviewDue = dueReviews.includes(lesson.id);

            return `
              <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer group"
                onclick="window.location.hash='#/module/${moduleData.id}/lesson/${lesson.id}'">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isComplete
                      ? 'bg-green-100 dark:bg-green-900/20'
                      : 'bg-slate-100 dark:bg-slate-800'
                  }">
                    ${isComplete
                      ? '<span class="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>'
                      : `<span class="text-sm font-bold text-slate-400">${index + 1}</span>`
                    }
                  </div>
                  <div class="flex-1">
                    <h3 class="font-bold group-hover:text-primary transition-colors">${lesson.title}</h3>
                    <div class="flex items-center gap-3 mt-1">
                      <span class="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">${lesson.bloomTag}</span>
                      ${score ? `<span class="text-xs text-slate-500">Quiz: ${score.percentage}%</span>` : ''}
                      ${isReviewDue ? `
                        <span class="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span class="material-symbols-outlined text-[10px]">schedule</span>Review Due
                        </span>
                      ` : ''}
                    </div>
                  </div>
                  <span class="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">arrow_forward</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Navigation -->
        <div class="mt-8 flex items-center justify-between">
          <a href="#/" class="flex items-center gap-2 text-slate-500 hover:text-primary font-medium transition-colors cursor-pointer">
            <span class="material-symbols-outlined">arrow_back</span>
            Back to Dashboard
          </a>
          ${moduleData.id < 4 ? `
            <a href="#/module/${moduleData.id + 1}" class="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-all">
              Next Module
              <span class="material-symbols-outlined">arrow_forward</span>
            </a>
          ` : ''}
        </div>
      </div>
    `;
  },

  _isRecommendedModule(moduleData, allModules) {
    // Check if all previous modules are complete
    for (const mod of allModules) {
      if (mod.id >= moduleData.id) break;
      if (!Progress.isModuleComplete(mod)) return false;
    }
    return true;
  }
};

export default ModuleView;
