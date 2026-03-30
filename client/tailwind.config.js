export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        serif: ['"Fraunces"', 'serif']
      },
      colors: {
        ember: {
          50: '#fff2ec',
          100: '#ffe2d4',
          200: '#ffc4a8',
          300: '#ffa27a',
          400: '#ff7a46',
          500: '#f1591f',
          600: '#cc4113',
          700: '#a13212',
          800: '#7c2814',
          900: '#621f12'
        }
      },
      boxShadow: {
        glow: '0 0 40px rgba(255, 122, 70, 0.35)'
      }
    }
  },
  plugins: []
};
