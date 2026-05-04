import { cn } from '../../lib/utils';

export const Card = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'rounded-lg shadow-sm border border-gray-700 bg-gray-800',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div
      className={cn('px-6 py-4 border-b border-gray-700', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div
      className={cn('px-6 py-4', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div
      className={cn('px-6 py-4 border-t border-gray-700', className)}
      {...props}
    >
      {children}
    </div>
  );
};