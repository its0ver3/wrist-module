const Storage = {
  KEY: 'wrist-conditions-progress',

  _getData() {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : this._defaultData();
    } catch {
      return this._defaultData();
    }
  },

  _save(data) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
  },

  _defaultData() {
    return {
      sectionsRead: {},
      quizScores: {},
      completedLessons: {},
      reviewSchedule: {},
      darkMode: false,
      lastVisited: null
    };
  },

  // Dark mode
  getDarkMode() {
    return this._getData().darkMode;
  },

  setDarkMode(enabled) {
    const data = this._getData();
    data.darkMode = enabled;
    this._save(data);
  },

  // Section tracking
  markSectionRead(lessonId, sectionId) {
    const data = this._getData();
    if (!data.sectionsRead[lessonId]) data.sectionsRead[lessonId] = [];
    if (!data.sectionsRead[lessonId].includes(sectionId)) {
      data.sectionsRead[lessonId].push(sectionId);
    }
    this._save(data);
  },

  getSectionsRead(lessonId) {
    return this._getData().sectionsRead[lessonId] || [];
  },

  // Quiz scores
  saveQuizScore(lessonId, score, total) {
    const data = this._getData();
    const percentage = Math.round((score / total) * 100);
    data.quizScores[lessonId] = {
      score,
      total,
      percentage,
      date: new Date().toISOString(),
      passed: percentage >= 67
    };
    if (percentage >= 67) {
      data.completedLessons[lessonId] = new Date().toISOString();
      this._scheduleReview(data, lessonId);
    }
    this._save(data);
    return data.quizScores[lessonId];
  },

  getQuizScore(lessonId) {
    return this._getData().quizScores[lessonId] || null;
  },

  // Completion
  isLessonComplete(lessonId) {
    return !!this._getData().completedLessons[lessonId];
  },

  getCompletedLessons() {
    return this._getData().completedLessons;
  },

  // Spaced repetition (simplified SM-2)
  _scheduleReview(data, lessonId) {
    const existing = data.reviewSchedule[lessonId];
    const interval = existing ? Math.min(existing.interval * 2, 16) : 1;
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);
    data.reviewSchedule[lessonId] = {
      interval,
      nextReview: nextDate.toISOString(),
      reviewCount: existing ? existing.reviewCount + 1 : 0
    };
  },

  getReviewSchedule() {
    return this._getData().reviewSchedule;
  },

  getDueReviews() {
    const schedule = this.getReviewSchedule();
    const now = new Date();
    const due = [];
    for (const [lessonId, review] of Object.entries(schedule)) {
      if (new Date(review.nextReview) <= now) {
        due.push(lessonId);
      }
    }
    return due;
  },

  // Save final quiz score
  saveFinalQuizScore(score, total, breakdown) {
    const data = this._getData();
    data.finalQuiz = {
      score,
      total,
      percentage: Math.round((score / total) * 100),
      date: new Date().toISOString(),
      breakdown
    };
    this._save(data);
    return data.finalQuiz;
  },

  getFinalQuizScore() {
    return this._getData().finalQuiz || null;
  },

  // Stats
  getStats() {
    const data = this._getData();
    const completed = Object.keys(data.completedLessons).length;
    const scores = Object.values(data.quizScores);
    const avgScore = scores.length
      ? Math.round(scores.reduce((s, q) => s + q.percentage, 0) / scores.length)
      : 0;
    const dueReviews = this.getDueReviews().length;

    return {
      completedLessons: completed,
      totalLessons: 11,
      completionPercent: Math.round((completed / 11) * 100),
      averageScore: avgScore,
      dueReviews
    };
  },

  // Last visited
  setLastVisited(route) {
    const data = this._getData();
    data.lastVisited = route;
    this._save(data);
  },

  getLastVisited() {
    return this._getData().lastVisited;
  },

  // Reset
  resetAll() {
    localStorage.removeItem(this.KEY);
  }
};

export default Storage;
