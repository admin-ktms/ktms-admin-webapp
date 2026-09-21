const routes = new Map();

export const registerRoute = (path, render) => {
  routes.set(path, render);
};

export const navigate = (path) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

export const startRouter = async () => {
  const render = routes.get(window.location.pathname) || routes.get('/dashboard');
  await render?.();
};
