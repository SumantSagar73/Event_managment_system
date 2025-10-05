// Re-export canonical context/provider to avoid case-insensitive import issues on Windows.
export { ThemeProvider } from './ThemeContext.jsx';
import ThemeContext from './ThemeContextCore';
export { ThemeContext as default, ThemeContext };
