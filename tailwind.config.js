/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        midnight: '#0D0F1A',
        dusk: '#151829',
        twilight: '#1E2240',
        aurora: '#C8A97E',
        moonrise: '#E8D5B7',
        starlight: '#9BA3C2',
        'sleep-glow': '#6B7FD4',
        'feed-glow': '#D4916B',
        'diaper-glow': '#6BC4A6',
        'pump-glow': '#B56BD4',
        success: '#6BD494',
        warning: '#D4C46B',
        danger: '#D46B6B',
      },
      fontFamily: {
        'playfair': ['PlayfairDisplay_400Regular'],
        'playfair-italic': ['PlayfairDisplay_400Regular_Italic'],
        'playfair-bold': ['PlayfairDisplay_700Bold'],
        'dm': ['DMSans_400Regular'],
        'dm-medium': ['DMSans_500Medium'],
        'dm-bold': ['DMSans_700Bold'],
      },
    },
  },
  plugins: [],
};
