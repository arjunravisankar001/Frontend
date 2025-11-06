/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // GitHub-inspired palette
        'gh-bg': '#0d1117',
        'gh-card': '#161b22',
        'gh-border': '#30363d',
        'gh-text': '#c9d1d9',
        'gh-accent': '#58a6ff',
      },
      boxShadow: {
        'gh': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      },
    },
  },
  plugins: [],
}

