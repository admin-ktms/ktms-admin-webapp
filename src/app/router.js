const routes = new Map();

export const registerRoute = (path, render) => {
  routes.set(path, render);
};

export const navigate = (path) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

export const startRouter = async () => {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const render = routes.get(path) || routes.get('/dashboard');

  if (!render) throw new Error(`No route registered for ${path}`);
  await render();
};
