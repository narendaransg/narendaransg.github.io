// Tailwind build config (replaces the in-browser cdn.tailwindcss.com script).
// Rebuild with: npx tailwindcss@3 -i tailwind.src.css -o tailwind.css --minify
// A GitHub Action (.github/workflows/build-css.yml) also rebuilds it on every push.
module.exports = {
  darkMode: 'class',
  content: ['./*.html', './*.js', './scripts/*.py'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        silicon: { 950: '#070709', 900: '#111217', 800: '#181920', 700: '#262730' },
        metal: {
          m5: '#F5B041', // 24K Wirebond Gold
          m6: '#FFD166', // Bright Gold
          m3: '#10B981', // Emerald Signoff Pass
          m8: '#F59E0B', // Warm Amber Clock
        },
      },
    },
  },
};
