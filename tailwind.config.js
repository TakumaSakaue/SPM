/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'bg-neutral',
    'bg-happy',
    'bg-sad',
    'bg-angry',
    'bg-fearful',
    'bg-disgusted',
    'bg-surprised',
  ],
  theme: {
    extend: {
      colors: {
        neutral: '#c0c0c0',
        happy: '#ffde34',
        sad: '#5b89eb',
        angry: '#ff6347',
        fearful: '#9370db',
        disgusted: '#2e8b57',
        surprised: '#ff69b4',
      },
    },
  },
  plugins: [],
} 