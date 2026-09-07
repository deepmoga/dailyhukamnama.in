/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fffbf0',
          100: '#fef5d6',
          200: '#fce8aa',
          300: '#fad775',
          400: '#f7c244',
          500: '#dd9933', // User's specified primary brand color
          600: '#c57f20',
          700: '#9e5f17',
          800: '#804b19',
          900: '#6b3e18',
        },
        spiritual: {
          navy: '#0f172a',
          dark: '#1e293b',
          creme: '#fdfbf7',
          border: '#e8dfd1',
        }
      },
      fontFamily: {
        gurmukhi: ['"Noto Sans Gurmukhi"', 'Gurmukhi MN', 'sans-serif'],
        serif: ['"Cinzel"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
