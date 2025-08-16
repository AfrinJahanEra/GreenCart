// src/theme.js
export const theme = {
  colors: {
    primary: '#224229', // Dark green
    secondary: '#fbf7ed', // Cream
    accent: '#4b6250', // Lighter green
    text: {
      primary: '#224229',
      secondary: '#5a6d5f',
      light: '#f7f0e1',
    },
    background: {
      light: '#fbf7ed',
      dark: '#224229',
    },
  },
  fonts: {
    primary: '"Nib", serif',
    secondary: '"Helvetica Neue", sans-serif',
  },
  spacing: {
    small: '0.5rem',
    medium: '1rem',
    large: '2rem',
  },
  shadows: {
    small: '0 1px 3px rgba(0,0,0,0.12)',
    medium: '0 4px 6px rgba(0,0,0,0.1)',
    large: '0 10px 15px rgba(0,0,0,0.1)',
  },
  transitions: {
    default: 'all 0.3s ease-in-out',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
};