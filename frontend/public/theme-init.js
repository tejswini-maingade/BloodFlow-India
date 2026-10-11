// Runs before the page paints: applies the saved (or system) theme to avoid a flash.
(function () {
  var theme = 'light';
  try {
    var saved = localStorage.getItem('bloodflow_theme');
    if (saved === 'dark' || saved === 'light') {
      theme = saved;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme = 'dark';
    }
  } catch {
    /* storage blocked: fall back to the default */
  }
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
})();
