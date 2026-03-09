const Router = {
  routes: {},
  currentRoute: null,

  init() {
    window.addEventListener('hashchange', () => this._handleRoute());
    this._handleRoute();
  },

  register(pattern, handler) {
    this.routes[pattern] = handler;
  },

  navigate(hash) {
    window.location.hash = hash;
  },

  _handleRoute() {
    const hash = window.location.hash || '#/';
    this.currentRoute = hash;

    for (const [pattern, handler] of Object.entries(this.routes)) {
      const match = this._matchPattern(pattern, hash);
      if (match) {
        handler(match);
        return;
      }
    }

    // Default to dashboard
    this.navigate('#/');
  },

  _matchPattern(pattern, hash) {
    // Convert pattern like '#/module/:moduleId/lesson/:lessonId' to regex
    const paramNames = [];
    const regexStr = pattern.replace(/:([^/]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });

    const regex = new RegExp('^' + regexStr + '$');
    const match = hash.match(regex);

    if (match) {
      const params = {};
      paramNames.forEach((name, i) => {
        params[name] = decodeURIComponent(match[i + 1]);
      });
      return params;
    }
    return null;
  }
};

export default Router;
