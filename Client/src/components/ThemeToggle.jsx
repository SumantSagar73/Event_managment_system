import React from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import ThemeContext from '../context/ThemeContextCore';

const ThemeToggle = () => {
  const { theme, toggle } = React.useContext(ThemeContext);

  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <FaSun /> : <FaMoon />}
    </button>
  );
};

export default ThemeToggle;
