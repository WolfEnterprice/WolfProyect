# 🎨 Guía de Estilos y Convenciones

Esta guía establece los estándares de código para mantener la consistencia en todo el proyecto.

---

## 📝 Convenciones de Nomenclatura

### Archivos y Carpetas

- **Componentes**: PascalCase (`Navbar.tsx`, `MovimientoForm.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useDashboard.ts`, `useMovimientos.ts`)
- **Utilidades**: camelCase (`format.ts`, `debounce.ts`)
- **Servicios**: camelCase (`movimientos.ts`, `dashboard.ts`)
- **Tipos**: PascalCase (`MovimientoDetallado`, `EstadisticasDashboard`)

### Variables y Funciones

```typescript
// ✅ Correcto
const userName = 'John';
const isLoading = true;
function handleSubmit() {}
const getMovimientos = () => {};

// ❌ Incorrecto
const user_name = 'John';
const IsLoading = true;
function HandleSubmit() {}
```

### Componentes React

```typescript
// ✅ Correcto
export default function MovimientosPage() {
  return <div>...</div>;
}

// ✅ Correcto - Componente con props
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export default function Button({ variant, children }: ButtonProps) {
  return <button className={...}>{children}</button>;
}
```

---

## 🏗️ Estructura de Componentes

### Orden de Imports

```typescript
// 1. React y Next.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Librerías de terceros
import { useQuery } from '@tanstack/react-query';

// 3. Componentes internos
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';

// 4. Hooks personalizados
import { useMovimientos } from '@/hooks/useMovimientos';

// 5. Servicios
import { getMovimientos } from '@/services/movimientos';

// 6. Tipos
import { MovimientoDetallado } from '@/types';

// 7. Utilidades
import { formatCurrency } from '@/utils/format';
```

### Estructura de un Componente

```typescript
'use client'; // Si es necesario

// 1. Imports
import ...

// 2. Types/Interfaces (si son específicos del componente)
interface ComponentProps {
  // ...
}

// 3. Componente principal
export default function ComponentName({ prop1, prop2 }: ComponentProps) {
  // 3.1. Hooks
  const [state, setState] = useState();
  const { data } = useQuery(...);
  
  // 3.2. Funciones helper
  const handleClick = () => {};
  
  // 3.3. useMemo/useCallback si es necesario
  const memoizedValue = useMemo(() => {}, []);
  
  // 3.4. useEffect
  useEffect(() => {}, []);
  
  // 3.5. Early returns
  if (loading) return <Loading />;
  
  // 3.6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

---

## 🎨 Estilos con Tailwind CSS

### Clases de Utilidad

```typescript
// ✅ Correcto - Usar clases de Tailwind
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h1 className="text-2xl font-bold text-gray-900">Título</h1>
</div>

// ❌ Evitar - Estilos inline (excepto casos específicos)
<div style={{ display: 'flex', padding: '16px' }}>
```

### Colores del Sistema

Usar la paleta definida en `tailwind.config.ts`:

```typescript
// Primary (azul)
className="bg-primary-500 text-primary-600"

// Teal (ingresos/positivo)
className="bg-teal-100 text-teal-600"

// Lime (alertas/destacado)
className="bg-lime-100 text-lime-600"

// Red (egresos/error)
className="bg-red-100 text-red-600"
```

### Responsive Design

```typescript
// Mobile first
<div className="
  grid 
  grid-cols-1           // Mobile: 1 columna
  md:grid-cols-2        // Tablet: 2 columnas
  lg:grid-cols-4        // Desktop: 4 columnas
  gap-4
">
```

---

## 🔄 Manejo de Estado

### React Query para Datos del Servidor

```typescript
// ✅ Correcto
const { data, isLoading, error } = useMovimientos(filtros);

// ❌ Evitar - useState + useEffect para datos del servidor
const [data, setData] = useState([]);
useEffect(() => {
  fetchData().then(setData);
}, []);
```

### Estado Local

```typescript
// ✅ Correcto - Estado simple
const [isOpen, setIsOpen] = useState(false);
const [filtros, setFiltros] = useState({});

// ✅ Correcto - Estado complejo con useReducer
const [state, dispatch] = useReducer(reducer, initialState);
```

---

## 🎯 Optimización

### Memoización

```typescript
// ✅ useMemo para cálculos costosos
const total = useMemo(() => {
  return items.reduce((sum, item) => sum + item.price, 0);
}, [items]);

// ✅ useCallback para funciones pasadas como props
const handleClick = useCallback(() => {
  // ...
}, [dependencies]);
```

### Lazy Loading

```typescript
// ✅ Componentes pesados con dynamic import
const Chart = dynamic(() => import('./Chart'), {
  ssr: false,
  loading: () => <Loading />
});
```

---

## 🧪 Testing (Futuro)

```typescript
// Estructura esperada para tests
describe('ComponentName', () => {
  it('should render correctly', () => {
    // ...
  });
  
  it('should handle user interaction', () => {
    // ...
  });
});
```

---

## 📋 Checklist de Código

Antes de hacer commit, verificar:

- [ ] Nombres de variables y funciones en camelCase
- [ ] Componentes en PascalCase
- [ ] Imports ordenados correctamente
- [ ] TypeScript types definidos
- [ ] Sin console.log en producción
- [ ] Manejo de errores implementado
- [ ] Loading states implementados
- [ ] Responsive design verificado
- [ ] Sin warnings del linter

---

## 🔍 Ejemplos

### Componente Completo Ejemplo

```typescript
'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useMovimientos } from '@/hooks/useMovimientos';
import { formatCurrency } from '@/utils/format';
import { MovimientoDetallado } from '@/types';

interface MovimientosPageProps {
  // Props si es necesario
}

export default function MovimientosPage({}: MovimientosPageProps) {
  const [filtros, setFiltros] = useState({});
  const { data: movimientos = [], isLoading } = useMovimientos(filtros);
  
  const total = useMemo(() => {
    return movimientos.reduce((sum, m) => sum + m.monto, 0);
  }, [movimientos]);
  
  const handleFilterChange = useCallback((newFiltros: any) => {
    setFiltros(newFiltros);
  }, []);
  
  if (isLoading) {
    return <div>Cargando...</div>;
  }
  
  return (
    <Card>
      <h1>Movimientos</h1>
      <p>Total: {formatCurrency(total)}</p>
      {/* ... */}
    </Card>
  );
}
```

---

**Última actualización**: Enero 2026

