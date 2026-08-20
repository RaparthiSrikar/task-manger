import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F5F6F3',
        surface: '#FFFFFF',
        ink: '#15181C',
        muted: '#626B76',
        faint: '#8B939C',
        line: '#E1E4E1',
        navy: {
          DEFAULT: '#1F2E4A',
          hover: '#16233B',
          50: '#EEF1F6',
        },
        signal: {
          DEFAULT: '#C97A2E',
          soft: '#F5E6D3',
        },
        success: {
          DEFAULT: '#1E7A61',
          soft: '#DCEFE8',
        },
        danger: {
          DEFAULT: '#B0462E',
          soft: '#F6E1DB',
        },
        info: {
          DEFAULT: '#3B6FA0',
          soft: '#DFEAF3',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
    },
  },
  plugins: [],
};

export default config;
