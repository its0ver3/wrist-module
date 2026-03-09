import Storage from './storage.js';

const Quiz = {
  // Render inline quiz at end of a lesson
  renderInline(container, questions, lessonId) {
    if (!container || !questions || questions.length === 0) return;

    const existingScore = Storage.getQuizScore(lessonId);

    container.innerHTML = `
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <span class="material-symbols-outlined text-primary text-lg">quiz</span>
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">Knowledge Check</h2>
          ${existingScore ? `
            <span class="ml-auto text-sm font-semibold ${existingScore.passed ? 'text-green-600' : 'text-amber-600'}">
              Previous: ${existingScore.percentage}%
            </span>
          ` : ''}
        </div>
        <p class="text-sm text-slate-500 mb-6">Answer the following questions to test your understanding. You need 67% or higher to mark this lesson complete.</p>
        <div id="quiz-questions"></div>
        <div id="quiz-actions" class="mt-6">
          <button id="submit-quiz" class="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
            <span class="material-symbols-outlined">check</span>
            Submit Answers
          </button>
        </div>
        <div id="quiz-results" class="hidden mt-6"></div>
      </div>
    `;

    this._renderQuestions(document.getElementById('quiz-questions'), questions);

    document.getElementById('submit-quiz').addEventListener('click', () => {
      this._submitQuiz(container, questions, lessonId);
    });
  },

  // Render full-page final quiz
  async renderFinal(app, modules) {
    let quizData;
    try {
      const resp = await fetch('js/data/final-quiz.json');
      quizData = await resp.json();
    } catch {
      app.innerHTML = '<div class="text-center py-20"><p class="text-lg text-slate-500">Failed to load quiz.</p></div>';
      return;
    }

    const existingScore = Storage.getFinalQuizScore();
    // Shuffle questions
    const shuffled = [...quizData.questions].sort(() => Math.random() - 0.5);

    app.innerHTML = `
      <div class="max-w-3xl mx-auto">
        <nav class="flex items-center gap-2 text-sm mb-6 text-slate-500">
          <a class="hover:text-primary transition-colors cursor-pointer" onclick="window.location.hash='#/'">Home</a>
          <span class="material-symbols-outlined text-sm">chevron_right</span>
          <span class="text-slate-900 dark:text-white font-medium">Final Assessment</span>
        </nav>

        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm mb-8">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-primary text-3xl">emoji_events</span>
            </div>
            <div>
              <h1 class="text-2xl font-bold">${quizData.title}</h1>
              <p class="text-sm text-slate-500">${quizData.questions.length} questions across all modules</p>
            </div>
            ${existingScore ? `
              <div class="ml-auto text-right">
                <p class="text-2xl font-bold ${existingScore.percentage >= 67 ? 'text-green-600' : 'text-amber-600'}">${existingScore.percentage}%</p>
                <p class="text-xs text-slate-500">Previous Score</p>
              </div>
            ` : ''}
          </div>
          <p class="text-slate-600 dark:text-slate-400 text-sm">${quizData.description}</p>
        </div>

        <div id="final-quiz-questions" class="space-y-6"></div>

        <div id="final-quiz-actions" class="mt-8">
          <button id="submit-final-quiz" class="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
            <span class="material-symbols-outlined">check</span>
            Submit Final Assessment
          </button>
        </div>

        <div id="final-quiz-results" class="hidden mt-8"></div>
      </div>
    `;

    this._renderQuestions(document.getElementById('final-quiz-questions'), shuffled, true);

    document.getElementById('submit-final-quiz').addEventListener('click', () => {
      this._submitFinalQuiz(app, shuffled, modules);
    });
  },

  _renderQuestions(container, questions, numbered = false) {
    container.innerHTML = questions.map((q, i) => {
      if (q.type === 'multiple_choice') {
        return `
          <div class="quiz-question mb-6 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl" data-index="${i}">
            ${numbered ? `<span class="text-xs font-bold text-slate-400 mb-2 block">Question ${i + 1} of ${questions.length}</span>` : ''}
            <p class="font-bold text-slate-900 dark:text-slate-100 mb-4">${q.question}</p>
            <div class="space-y-2">
              ${q.options.map((opt, j) => `
                <label class="quiz-option flex items-center p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 cursor-pointer hover:border-primary/50 transition-all" data-question="${i}" data-option="${j}">
                  <input type="radio" name="q${i}" value="${j}" class="hidden">
                  <div class="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center flex-shrink-0 mr-3 quiz-radio">
                    <div class="w-2 h-2 rounded-full bg-primary hidden quiz-dot"></div>
                  </div>
                  <span class="text-sm text-slate-700 dark:text-slate-300">${opt}</span>
                </label>
              `).join('')}
            </div>
            <div class="quiz-feedback hidden mt-3"></div>
          </div>
        `;
      } else if (q.type === 'true_false') {
        return `
          <div class="quiz-question mb-6 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl" data-index="${i}">
            ${numbered ? `<span class="text-xs font-bold text-slate-400 mb-2 block">Question ${i + 1} of ${questions.length}</span>` : ''}
            <p class="font-bold text-slate-900 dark:text-slate-100 mb-4">${q.question}</p>
            <div class="space-y-2">
              <label class="quiz-option flex items-center p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 cursor-pointer hover:border-primary/50 transition-all" data-question="${i}" data-option="true">
                <input type="radio" name="q${i}" value="true" class="hidden">
                <div class="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center flex-shrink-0 mr-3 quiz-radio">
                  <div class="w-2 h-2 rounded-full bg-primary hidden quiz-dot"></div>
                </div>
                <span class="text-sm text-slate-700 dark:text-slate-300">True</span>
              </label>
              <label class="quiz-option flex items-center p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 cursor-pointer hover:border-primary/50 transition-all" data-question="${i}" data-option="false">
                <input type="radio" name="q${i}" value="false" class="hidden">
                <div class="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center flex-shrink-0 mr-3 quiz-radio">
                  <div class="w-2 h-2 rounded-full bg-primary hidden quiz-dot"></div>
                </div>
                <span class="text-sm text-slate-700 dark:text-slate-300">False</span>
              </label>
            </div>
            <div class="quiz-feedback hidden mt-3"></div>
          </div>
        `;
      }
      return '';
    }).join('');

    // Add click handlers for options
    container.querySelectorAll('.quiz-option').forEach(option => {
      option.addEventListener('click', () => {
        const questionIdx = option.dataset.question;
        const input = option.querySelector('input');
        input.checked = true;

        // Visual update - clear siblings
        const siblings = container.querySelectorAll(`.quiz-option[data-question="${questionIdx}"]`);
        siblings.forEach(s => {
          s.classList.remove('border-primary', 'bg-primary/5');
          s.classList.add('border-slate-200', 'dark:border-slate-700');
          s.querySelector('.quiz-dot').classList.add('hidden');
          s.querySelector('.quiz-radio').classList.remove('border-primary', 'bg-primary');
        });

        option.classList.remove('border-slate-200', 'dark:border-slate-700');
        option.classList.add('border-primary', 'bg-primary/5');
        option.querySelector('.quiz-dot').classList.remove('hidden');
        option.querySelector('.quiz-radio').classList.add('border-primary');
      });
    });
  },

  _submitQuiz(container, questions, lessonId) {
    let correct = 0;
    const total = questions.length;

    questions.forEach((q, i) => {
      const selected = container.querySelector(`input[name="q${i}"]:checked`);
      const questionEl = container.querySelector(`.quiz-question[data-index="${i}"]`);
      const feedbackEl = questionEl.querySelector('.quiz-feedback');
      feedbackEl.classList.remove('hidden');

      let isCorrect = false;

      if (q.type === 'multiple_choice') {
        isCorrect = selected && parseInt(selected.value) === q.correctIndex;
        // Highlight correct option
        const options = questionEl.querySelectorAll('.quiz-option');
        options.forEach((opt, j) => {
          opt.classList.remove('hover:border-primary/50', 'cursor-pointer');
          if (j === q.correctIndex) {
            opt.classList.remove('border-slate-200', 'dark:border-slate-700', 'border-primary');
            opt.classList.add('border-green-500', 'bg-green-50', 'dark:bg-green-900/20');
          } else if (selected && parseInt(selected.value) === j && !isCorrect) {
            opt.classList.remove('border-slate-200', 'dark:border-slate-700', 'border-primary');
            opt.classList.add('border-amber-500', 'bg-amber-50', 'dark:bg-amber-900/20');
          }
        });
      } else if (q.type === 'true_false') {
        isCorrect = selected && (selected.value === 'true') === q.correctAnswer;
        const options = questionEl.querySelectorAll('.quiz-option');
        options.forEach(opt => {
          opt.classList.remove('hover:border-primary/50', 'cursor-pointer');
          const isCorrectOption = (opt.dataset.option === 'true') === q.correctAnswer;
          if (isCorrectOption) {
            opt.classList.remove('border-slate-200', 'dark:border-slate-700', 'border-primary');
            opt.classList.add('border-green-500', 'bg-green-50', 'dark:bg-green-900/20');
          } else if (selected && selected.value === opt.dataset.option && !isCorrect) {
            opt.classList.remove('border-slate-200', 'dark:border-slate-700', 'border-primary');
            opt.classList.add('border-amber-500', 'bg-amber-50', 'dark:bg-amber-900/20');
          }
        });
      }

      if (isCorrect) correct++;

      feedbackEl.innerHTML = `
        <div class="p-3 rounded-lg ${isCorrect ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'}">
          <div class="flex items-center gap-2 mb-1">
            <span class="material-symbols-outlined text-sm ${isCorrect ? 'text-green-600' : 'text-amber-600'}">${isCorrect ? 'check_circle' : 'cancel'}</span>
            <span class="text-sm font-bold ${isCorrect ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}">${isCorrect ? 'Correct!' : 'Incorrect'}</span>
          </div>
          <p class="text-xs ${isCorrect ? 'text-green-600 dark:text-green-300' : 'text-amber-600 dark:text-amber-300'}">${q.explanation}</p>
        </div>
      `;

      // Disable further input
      questionEl.querySelectorAll('input').forEach(inp => inp.disabled = true);
      questionEl.querySelectorAll('.quiz-option').forEach(opt => {
        opt.style.pointerEvents = 'none';
      });
    });

    // Save score and show results
    const result = Storage.saveQuizScore(lessonId, correct, total);

    const actionsEl = container.querySelector('#quiz-actions');
    const resultsEl = container.querySelector('#quiz-results');
    actionsEl.classList.add('hidden');
    resultsEl.classList.remove('hidden');

    resultsEl.innerHTML = `
      <div class="p-6 rounded-xl ${result.passed ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'}">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-full ${result.passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'} flex items-center justify-center">
            <span class="material-symbols-outlined text-3xl ${result.passed ? 'text-green-600' : 'text-amber-600'}">${result.passed ? 'emoji_events' : 'refresh'}</span>
          </div>
          <div>
            <h3 class="text-lg font-bold ${result.passed ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}">
              ${result.passed ? 'Lesson Complete!' : 'Keep Trying!'}
            </h3>
            <p class="text-sm ${result.passed ? 'text-green-600 dark:text-green-300' : 'text-amber-600 dark:text-amber-300'}">
              You scored ${correct}/${total} (${result.percentage}%). ${result.passed ? 'Great work!' : 'You need 67% to pass. Try again!'}
            </p>
          </div>
        </div>
        ${!result.passed ? `
          <button onclick="window.location.reload()" class="mt-4 w-full py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-all">
            Retry Quiz
          </button>
        ` : ''}
      </div>
    `;
  },

  _submitFinalQuiz(app, questions, modules) {
    const container = app;
    let correct = 0;
    const total = questions.length;
    const moduleScores = {};

    questions.forEach((q, i) => {
      const selected = container.querySelector(`input[name="q${i}"]:checked`);
      const questionEl = container.querySelector(`.quiz-question[data-index="${i}"]`);
      const feedbackEl = questionEl.querySelector('.quiz-feedback');
      feedbackEl.classList.remove('hidden');

      let isCorrect = false;

      if (q.type === 'multiple_choice') {
        isCorrect = selected && parseInt(selected.value) === q.correctIndex;
        const options = questionEl.querySelectorAll('.quiz-option');
        options.forEach((opt, j) => {
          opt.classList.remove('hover:border-primary/50', 'cursor-pointer');
          if (j === q.correctIndex) {
            opt.classList.remove('border-slate-200', 'dark:border-slate-700', 'border-primary');
            opt.classList.add('border-green-500', 'bg-green-50', 'dark:bg-green-900/20');
          } else if (selected && parseInt(selected.value) === j && !isCorrect) {
            opt.classList.remove('border-slate-200', 'dark:border-slate-700', 'border-primary');
            opt.classList.add('border-amber-500', 'bg-amber-50', 'dark:bg-amber-900/20');
          }
        });
      } else if (q.type === 'true_false') {
        isCorrect = selected && (selected.value === 'true') === q.correctAnswer;
        const options = questionEl.querySelectorAll('.quiz-option');
        options.forEach(opt => {
          opt.classList.remove('hover:border-primary/50', 'cursor-pointer');
          const isCorrectOption = (opt.dataset.option === 'true') === q.correctAnswer;
          if (isCorrectOption) {
            opt.classList.remove('border-slate-200', 'dark:border-slate-700', 'border-primary');
            opt.classList.add('border-green-500', 'bg-green-50', 'dark:bg-green-900/20');
          } else if (selected && selected.value === opt.dataset.option && !isCorrect) {
            opt.classList.remove('border-slate-200', 'dark:border-slate-700', 'border-primary');
            opt.classList.add('border-amber-500', 'bg-amber-50', 'dark:bg-amber-900/20');
          }
        });
      }

      if (isCorrect) correct++;

      // Track by module
      const mod = q.module || 0;
      if (!moduleScores[mod]) moduleScores[mod] = { correct: 0, total: 0 };
      moduleScores[mod].total++;
      if (isCorrect) moduleScores[mod].correct++;

      feedbackEl.innerHTML = `
        <div class="p-3 rounded-lg ${isCorrect ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'}">
          <div class="flex items-center gap-2 mb-1">
            <span class="material-symbols-outlined text-sm ${isCorrect ? 'text-green-600' : 'text-amber-600'}">${isCorrect ? 'check_circle' : 'cancel'}</span>
            <span class="text-sm font-bold ${isCorrect ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}">${isCorrect ? 'Correct!' : 'Incorrect'}</span>
          </div>
          <p class="text-xs ${isCorrect ? 'text-green-600 dark:text-green-300' : 'text-amber-600 dark:text-amber-300'}">${q.explanation}</p>
        </div>
      `;

      questionEl.querySelectorAll('input').forEach(inp => inp.disabled = true);
      questionEl.querySelectorAll('.quiz-option').forEach(opt => {
        opt.style.pointerEvents = 'none';
      });
    });

    const result = Storage.saveFinalQuizScore(correct, total, moduleScores);
    const percentage = result.percentage;

    const actionsEl = container.querySelector('#final-quiz-actions');
    const resultsEl = container.querySelector('#final-quiz-results');
    actionsEl.classList.add('hidden');
    resultsEl.classList.remove('hidden');

    const moduleNames = { 1: 'Foundations', 2: 'Tendon Conditions', 3: 'Joint & Connective Tissue', 4: 'Trauma & Complex' };

    resultsEl.innerHTML = `
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <div class="text-center mb-8">
          <div class="w-20 h-20 mx-auto rounded-full ${percentage >= 67 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-amber-100 dark:bg-amber-900/20'} flex items-center justify-center mb-4">
            <span class="material-symbols-outlined text-4xl ${percentage >= 67 ? 'text-green-600' : 'text-amber-600'}">${percentage >= 67 ? 'emoji_events' : 'refresh'}</span>
          </div>
          <h2 class="text-2xl font-bold">${percentage >= 67 ? 'Congratulations!' : 'Keep Studying!'}</h2>
          <p class="text-4xl font-black mt-2 ${percentage >= 67 ? 'text-green-600' : 'text-amber-600'}">${percentage}%</p>
          <p class="text-slate-500 mt-1">${correct} out of ${total} correct</p>
        </div>

        <h3 class="font-bold mb-4">Score Breakdown by Module</h3>
        <div class="space-y-3">
          ${Object.entries(moduleScores).map(([mod, scores]) => {
            const pct = Math.round((scores.correct / scores.total) * 100);
            return `
              <div class="flex items-center gap-4">
                <span class="text-sm font-medium w-48">${moduleNames[mod] || `Module ${mod}`}</span>
                <div class="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full ${pct >= 67 ? 'bg-green-500' : 'bg-amber-500'} rounded-full" style="width: ${pct}%"></div>
                </div>
                <span class="text-sm font-bold w-16 text-right">${scores.correct}/${scores.total}</span>
              </div>
            `;
          }).join('')}
        </div>

        <div class="mt-8 flex gap-4">
          <a href="#/" class="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Back to Dashboard
          </a>
          ${percentage < 67 ? `
            <button onclick="window.location.reload()" class="flex-1 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-all">
              Try Again
            </button>
          ` : ''}
        </div>
      </div>
    `;

    // Scroll to results
    resultsEl.scrollIntoView({ behavior: 'smooth' });
  }
};

export default Quiz;
