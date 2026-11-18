import { useTheme } from '../state/ThemeContext.jsx';
import { MoonIcon, SunIcon } from './icons.jsx';

// Theme toggle — Spec Sec. 11.4: sun in dark mode, moon in light mode.
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const toDark = theme === 'light';
  return (
    <button
      type="button"
      className="icon-btn"
      onClick={toggleTheme}
      aria-label={toDark ? 'Switch to dark mode' : 'Switch to light mode'}
      title={toDark ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {toDark ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
