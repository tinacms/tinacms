const colors = require("tailwindcss/colors");

const fontMap = {
  a: ["Nunito"],
  b: ["Adren"],
  c: ["Moneta"],
  d: ["Brooklyn"],
  e: ["Berlin"],
  f: ["Quart"],
  Ardent: ["Ardent"],
  Article: ["Article"],
  Pulse: ["Pulse"],
  OpenSans: ["Open Sans"],
};

const base = (colorOption, fontOption) => ({
  mode: "jit",
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        display: fontOption,
      },
      colors: {
        indigo: colorOption,
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#fff",
            h2: {
              color: "#efefef",
            },
            a: {
              color: "#efefef",
              "&:hover": {
                color: "#eee",
              },
            },
          },
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
  ],
});

module.exports = (displayFont, colorMode) => {
  let colorOption;
  switch (colorMode) {
    case "black":
      colorOption = colors.coolGray;
      break;
    case "steel":
      colorOption = colors.blueGray;
      break;
    case "indigo":
      colorOption = colors.indigo;
      break;
    default:
      colorOption = colors.indigo;
      break;
  }
  const fontOption = fontMap[displayFont];
  return base(colorOption, fontOption);
};
