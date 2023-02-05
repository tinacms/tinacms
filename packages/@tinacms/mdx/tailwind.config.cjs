/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './markdown/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: [
            {
              // …
              'code::before': {
                content: '',
              },
              'code::after': {
                content: '',
              },
              // …
            },
          ],
        },
      },
    },
  },

  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
}
