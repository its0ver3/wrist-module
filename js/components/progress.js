import Storage from './storage.js';

const Progress = {
  getModuleProgress(moduleData) {
    const completed = moduleData.lessons.filter(l => Storage.isLessonComplete(l.id));
    return {
      completed: completed.length,
      total: moduleData.lessons.length,
      percent: Math.round((completed.length / moduleData.lessons.length) * 100)
    };
  },

  isModuleComplete(moduleData) {
    return moduleData.lessons.every(l => Storage.isLessonComplete(l.id));
  },

  areAllModulesComplete(modules) {
    return modules.every(m => this.isModuleComplete(m));
  },

  getRecommendedNext(modules) {
    for (const mod of modules) {
      for (const lesson of mod.lessons) {
        if (!Storage.isLessonComplete(lesson.id)) {
          return { moduleId: mod.id, lessonId: lesson.id, title: lesson.title };
        }
      }
    }
    return null;
  },

  getLessonReviewStatus(lessonId) {
    const schedule = Storage.getReviewSchedule();
    const review = schedule[lessonId];
    if (!review) return null;

    const now = new Date();
    const nextReview = new Date(review.nextReview);
    const isDue = nextReview <= now;

    return {
      isDue,
      nextReview,
      interval: review.interval,
      reviewCount: review.reviewCount
    };
  }
};

export default Progress;
