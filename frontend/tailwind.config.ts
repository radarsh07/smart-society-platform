import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7ff',
          100: '#d9ebff',
          200: '#b8dbff',
          300: '#85c2ff',
          400: '#4ea2ff',
          500: '#1d7ef0',
          600: '#135ec0',
          700: '#124b98',
          800: '#143f7c',
          900: '#173766'
        }
      }
    }
  },
  plugins: []
} satisfies Config;
