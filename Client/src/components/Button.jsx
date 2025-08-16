import { Link } from 'react-router-dom';
import { theme } from '../theme';

const Button = ({ 
  children, 
  onClick, 
  to, 
  type = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'px-4 py-2 sm:px-6 sm:py-2 rounded-full font-medium transition-colors duration-300 text-center text-sm sm:text-base';
  
  const typeClasses = {
    primary: `bg-${theme.colors.primary} text-${theme.colors.secondary} hover:bg-${theme.colors.accent}`,
    secondary: `bg-white text-${theme.colors.primary} border border-${theme.colors.primary} hover:bg-${theme.colors.secondary}`,
    text: `text-${theme.colors.primary} hover:underline`,
  };

  const buttonClasses = `${baseClasses} ${typeClasses[type]} ${className}`;

  if (to) {
    return (
      <Link
        to={to}
        className={buttonClasses}
        {...props}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className={buttonClasses}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;