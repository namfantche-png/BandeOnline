/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cores da Bandeira da Guiné-Bissau
        primary: {
          50: '#fff5f5',
          100: '#ffe6e0',
          200: '#ffcdc2',
          300: '#ffb4a0',
          400: '#ff9a7e',
          500: '#CE1126', // Vermelho - Cor principal
          600: '#b60d1f',
          700: '#9d0a19',
          800: '#840812',
          900: '#6b060d',
        },
        accent: {
          50: '#fffff0',
          100: '#fffbeb',
          200: '#fef3c7',
          300: '#fde68a',
          400: '#fcd34d',
          500: '#FCD116', // Amarelo
          600: '#d4a513',
          700: '#ac8410',
          800: '#84630d',
          900: '#6c520a',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#007A5E', // Verde
          600: '#006650',
          700: '#005243',
          800: '#043836',
          900: '#031f1a',
        },
        dark: '#000000', // Preto
      },
    },
  },
  plugins: [],
};
