/**
 * Componente TableCell reutilizable
 */

import React from 'react';

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

export default function TableCell({ children, className = '' }: TableCellProps) {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}>
      {children}
    </td>
  );
}

