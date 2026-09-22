export function currentPath() {
  return window.location.hash.replace(/^#/, '') || '/';
}

export function navigate(path) {
  const nextHash = `#${path || '/'}`;

  if (window.location.hash === nextHash) {
    window.dispatchEvent(new Event('hashchange'));
    return;
  }

  window.location.hash = path || '/';
}
