import Storage from './storage.js';
import Quiz from './quiz.js';

const Lesson = {
  async render(app, moduleId, lessonId, modules) {
    const moduleData = modules.find(m => m.id === parseInt(moduleId));
    if (!moduleData) {
      app.innerHTML = '<div class="text-center py-20"><p class="text-lg text-slate-500">Module not found.</p></div>';
      return;
    }

    const lessonMeta = moduleData.lessons.find(l => l.id === lessonId);
    if (!lessonMeta) {
      app.innerHTML = '<div class="text-center py-20"><p class="text-lg text-slate-500">Lesson not found.</p></div>';
      return;
    }

    // Load condition data
    let conditionData;
    try {
      const resp = await fetch(`js/data/conditions/${lessonId}.json`);
      conditionData = await resp.json();
    } catch {
      app.innerHTML = '<div class="text-center py-20"><p class="text-lg text-slate-500">Failed to load lesson content.</p></div>';
      return;
    }

    Storage.setLastVisited(`#/module/${moduleId}/lesson/${lessonId}`);

    // Find prev/next lessons
    const allLessons = modules.flatMap(m => m.lessons.map(l => ({ ...l, moduleId: m.id })));
    const currentIdx = allLessons.findIndex(l => l.id === lessonId);
    const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
    const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

    app.innerHTML = `
      <div class="flex h-[calc(100vh-4rem)] overflow-hidden -mx-6 md:-mx-10 -my-8">
        <!-- Sidebar -->
        <aside id="lesson-sidebar" class="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-col hidden lg:flex flex-shrink-0 overflow-y-auto">
          <div class="p-6">
            <div class="mb-6">
              <a href="#/module/${moduleId}" class="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-primary transition-colors cursor-pointer flex items-center gap-1">
                <span class="material-symbols-outlined text-xs">arrow_back</span>
                Module ${moduleId}
              </a>
              <h3 class="text-slate-900 dark:text-white font-bold text-base leading-tight mt-2">${conditionData.title}</h3>
              ${conditionData.subtitle ? `<p class="text-xs text-slate-500 mt-1">${conditionData.subtitle}</p>` : ''}
            </div>
            <nav class="flex flex-col gap-1" id="section-nav">
              ${conditionData.sections.map((section, i) => {
                const isRead = Storage.getSectionsRead(lessonId).includes(section.id);
                return `
                  <a href="#section-${section.id}"
                    class="section-nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm
                      ${i === 0 ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}"
                    data-section="${section.id}">
                    <span class="material-symbols-outlined text-lg">${isRead ? 'check_circle' : section.icon}</span>
                    <span class="font-medium">${section.title}</span>
                  </a>
                `;
              }).join('')}
              <div class="border-t border-slate-100 dark:border-slate-800 mt-2 pt-2">
                <a href="#section-quiz"
                  class="section-nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm"
                  data-section="quiz">
                  <span class="material-symbols-outlined text-lg">quiz</span>
                  <span class="font-medium">Quiz</span>
                </a>
              </div>
            </nav>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6 lg:p-10" id="lesson-content">
          <div class="max-w-3xl mx-auto">
            <!-- Mobile back button -->
            <div class="lg:hidden mb-4">
              <a href="#/module/${moduleId}" class="text-sm text-slate-500 hover:text-primary flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">arrow_back</span>
                Back to Module ${moduleId}
              </a>
            </div>

            <!-- Breadcrumbs -->
            <nav class="hidden lg:flex items-center gap-2 text-sm mb-6 text-slate-500 dark:text-slate-400">
              <a class="hover:text-primary transition-colors cursor-pointer" onclick="window.location.hash='#/'">Home</a>
              <span class="material-symbols-outlined text-sm">chevron_right</span>
              <a class="hover:text-primary transition-colors cursor-pointer" onclick="window.location.hash='#/module/${moduleId}'">${moduleData.title}</a>
              <span class="material-symbols-outlined text-sm">chevron_right</span>
              <span class="text-slate-900 dark:text-white font-medium">${conditionData.title}</span>
            </nav>

            <!-- Title -->
            <div class="mb-8">
              <h1 class="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">${conditionData.title}</h1>
              ${conditionData.subtitle ? `<p class="text-slate-500 mt-1">${conditionData.subtitle}</p>` : ''}
              <div class="flex items-center gap-3 mt-3">
                <span class="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full font-semibold">${lessonMeta.bloomTag}</span>
                <span class="text-xs text-slate-400">${conditionData.sections.length} sections</span>
              </div>
            </div>

            <!-- Mobile section navigation -->
            <div class="lg:hidden mb-6 overflow-x-auto">
              <div class="flex gap-2 pb-2">
                ${conditionData.sections.map(section => `
                  <a href="#section-${section.id}" class="text-xs font-medium px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 whitespace-nowrap hover:border-primary hover:text-primary transition-colors">${section.title}</a>
                `).join('')}
                <a href="#section-quiz" class="text-xs font-medium px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 whitespace-nowrap hover:border-primary hover:text-primary transition-colors">Quiz</a>
              </div>
            </div>

            <!-- Content Sections -->
            <div class="space-y-10">
              ${conditionData.sections.map(section => `
                <section id="section-${section.id}" class="lesson-section bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm" data-section-id="${section.id}">
                  <div class="flex items-center gap-3 mb-6">
                    <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span class="material-symbols-outlined text-primary text-lg">${section.icon}</span>
                    </div>
                    <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">${section.title}</h2>
                    <span class="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 ml-auto">${section.bloomLevel}</span>
                  </div>
                  <div class="prose prose-slate dark:prose-invert max-w-none">
                    ${this._renderContent(section.content)}
                  </div>
                </section>
              `).join('')}

              <!-- Quiz Section -->
              <section id="section-quiz" class="lesson-section" data-section-id="quiz">
                <div id="quiz-container"></div>
              </section>
            </div>

            <!-- Footer Navigation -->
            <div class="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between pb-8">
              ${prevLesson ? `
                <a href="#/module/${prevLesson.moduleId}/lesson/${prevLesson.id}"
                  class="flex items-center gap-2 text-slate-500 hover:text-primary font-medium transition-colors">
                  <span class="material-symbols-outlined">arrow_back</span>
                  <span class="hidden sm:inline">${prevLesson.title}</span>
                  <span class="sm:hidden">Previous</span>
                </a>
              ` : '<div></div>'}
              ${nextLesson ? `
                <a href="#/module/${nextLesson.moduleId}/lesson/${nextLesson.id}"
                  class="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-all">
                  <span class="hidden sm:inline">${nextLesson.title}</span>
                  <span class="sm:hidden">Next</span>
                  <span class="material-symbols-outlined">arrow_forward</span>
                </a>
              ` : `
                <a href="#/module/${moduleId}"
                  class="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-all">
                  Back to Module
                  <span class="material-symbols-outlined">arrow_forward</span>
                </a>
              `}
            </div>
          </div>
        </main>
      </div>
    `;

    // Render quiz
    Quiz.renderInline(document.getElementById('quiz-container'), conditionData.quiz, lessonId);

    // Set up section tracking
    this._setupSectionObserver(lessonId);
    this._setupSidebarHighlighting();
  },

  _renderContent(content) {
    return content.map(block => {
      switch (block.type) {
        case 'paragraph':
          return `<p class="mb-4 text-slate-600 dark:text-slate-400 leading-relaxed">${block.text}</p>`;

        case 'heading':
          return `<h3 class="text-lg font-bold mt-6 mb-3 text-slate-900 dark:text-slate-100">${block.text}</h3>`;

        case 'list':
          if (block.ordered) {
            return `<ol class="list-decimal pl-6 mb-4 space-y-2 text-slate-600 dark:text-slate-400">${block.items.map(item => `<li>${item}</li>`).join('')}</ol>`;
          }
          return `<ul class="list-disc pl-6 mb-4 space-y-2 text-slate-600 dark:text-slate-400">${block.items.map(item => `<li>${item}</li>`).join('')}</ul>`;

        case 'callout':
          const styles = {
            info: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-400', icon: 'info', iconColor: 'text-blue-600 dark:text-blue-400', text: 'text-blue-800 dark:text-blue-200', title: 'text-blue-900 dark:text-blue-100' },
            warning: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-400', icon: 'warning', iconColor: 'text-amber-600 dark:text-amber-400', text: 'text-amber-800 dark:text-amber-200', title: 'text-amber-900 dark:text-amber-100' },
            danger: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-400', icon: 'error', iconColor: 'text-red-600 dark:text-red-400', text: 'text-red-800 dark:text-red-200', title: 'text-red-900 dark:text-red-100' }
          };
          const s = styles[block.style] || styles.info;
          return `
            <div class="my-6 ${s.bg} border-l-4 ${s.border} p-5 rounded-r-lg">
              ${block.title ? `
                <div class="flex items-center gap-2 mb-2">
                  <span class="material-symbols-outlined ${s.iconColor}">${s.icon}</span>
                  <h4 class="font-bold ${s.title}">${block.title}</h4>
                </div>
              ` : ''}
              <p class="${s.text} text-sm leading-relaxed">${block.text}</p>
            </div>
          `;

        default:
          return '';
      }
    }).join('');
  },

  _setupSectionObserver(lessonId) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.dataset.sectionId;
          if (sectionId && sectionId !== 'quiz') {
            Storage.markSectionRead(lessonId, sectionId);
            // Update sidebar icon
            const navLink = document.querySelector(`.section-nav-link[data-section="${sectionId}"] .material-symbols-outlined`);
            if (navLink && navLink.textContent !== 'check_circle') {
              navLink.textContent = 'check_circle';
            }
          }
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('.lesson-section').forEach(section => {
      observer.observe(section);
    });
  },

  _setupSidebarHighlighting() {
    const contentArea = document.getElementById('lesson-content');
    if (!contentArea) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.dataset.sectionId;
          document.querySelectorAll('.section-nav-link').forEach(link => {
            if (link.dataset.section === sectionId) {
              link.classList.add('bg-primary/10', 'text-primary', 'font-semibold');
              link.classList.remove('text-slate-600', 'dark:text-slate-400');
            } else {
              link.classList.remove('bg-primary/10', 'text-primary', 'font-semibold');
              link.classList.add('text-slate-600', 'dark:text-slate-400');
            }
          });
        }
      });
    }, { threshold: 0.2, root: contentArea });

    document.querySelectorAll('.lesson-section').forEach(section => {
      observer.observe(section);
    });

    // Smooth scroll for nav links
    document.querySelectorAll('.section-nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').replace('#', '');
        const target = document.getElementById(targetId);
        if (target && contentArea) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }
};

export default Lesson;
