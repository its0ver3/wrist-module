import Router from './components/router.js';
import Storage from './components/storage.js';
import Dashboard from './components/dashboard.js';
import ModuleView from './components/module-view.js';
import Lesson from './components/lesson.js';
import Quiz from './components/quiz.js';

let modulesData = null;

async function loadModules() {
  if (modulesData) return modulesData;
  const resp = await fetch('js/data/modules.json');
  const data = await resp.json();
  modulesData = data.modules;
  return modulesData;
}

function initDarkMode() {
  const isDark = Storage.getDarkMode();
  document.documentElement.classList.toggle('dark', isDark);
  updateDarkModeButton(isDark);
}

function updateDarkModeButton(isDark) {
  const btn = document.getElementById('dark-mode-toggle');
  if (btn) {
    btn.querySelector('.material-symbols-outlined').textContent = isDark ? 'light_mode' : 'dark_mode';
  }
}

function toggleDarkMode() {
  const isDark = !Storage.getDarkMode();
  Storage.setDarkMode(isDark);
  document.documentElement.classList.toggle('dark', isDark);
  updateDarkModeButton(isDark);
}

async function init() {
  const app = document.getElementById('app');
  const modules = await loadModules();

  initDarkMode();

  // Bind dark mode toggle
  document.getElementById('dark-mode-toggle')?.addEventListener('click', toggleDarkMode);

  // Register routes
  Router.register('#/', async () => {
    await Dashboard.render(app, modules);
  });

  Router.register('#/module/:moduleId', async (params) => {
    const moduleData = modules.find(m => m.id === parseInt(params.moduleId));
    ModuleView.render(app, moduleData, modules);
  });

  Router.register('#/module/:moduleId/lesson/:lessonId', async (params) => {
    await Lesson.render(app, params.moduleId, params.lessonId, modules);
  });

  Router.register('#/final-quiz', async () => {
    await Quiz.renderFinal(app, modules);
  });

  Router.init();
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
