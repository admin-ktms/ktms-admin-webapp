import { hasAdminSession } from '../auth/session.js';

const routes = new Map();
let guard = null;

export function registerRoute(path, render, options = {}) {
  routes.set(path, { render, protected: options.protected !== false });
}

export function setRouteGuard(fn) {
  guard = fn;
}

export function resolveRoute(pathname = window.location.pathname) {
  return routes.get(pathname) || routes.get('*');
}

export function navigate(path) {
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path);
  }
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export async function startRouter() {
  const render = async () => {
    const route = resolveRoute();

    if (!route) return;

    if (route.protected && !hasAdminSession()) {
      if (window.location.pathname !== '/login') {
        window.history.replaceState({}, '', '/login');
      }
      const loginRoute = routes.get('/login');
      if (loginRoute) await loginRoute.render();
      return;
    }

    if (guard) await guard(route);
    await route.render();
  };

  window.addEventListener('popstate', render);
  window.addEventListener('click', event => {
    const link = event.target.closest('[data-route]');
    if (!link || event.defaultPrevented) return;
    event.preventDefault();
    navigate(link.getAttribute('href'));
  });

  await render();
}
