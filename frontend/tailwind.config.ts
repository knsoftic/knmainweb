import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}', './src/utils/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brandPurple: '#8D18D0',
        brandBlue: '#3930C7',
      },
      backgroundImage: {
        brandGradient: 'linear-gradient(135deg, #8D18D0, #3930C7)'
      }
    },
  },
  plugins: [],
};

export default config;
