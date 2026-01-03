/**
 * Componente TableRow reutilizable
 */

import React from 'react';

interface TableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function TableRow({ children, onClick, className = '' }: TableRowProps) {
  const baseClasses = onClick ? 'cursor-pointer hover:bg-gray-50' : '';
  
  return (
    <tr className={`${baseClasses} ${className}`} onClick={onClick}>
      {children}
    </tr>
  );
}

