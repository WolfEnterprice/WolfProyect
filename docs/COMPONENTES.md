# 🧩 Guía de Componentes

Documentación completa de todos los componentes disponibles en el proyecto.

---

## 📦 Componentes UI Base

### Button

Botón reutilizable con variantes.

```typescript
import Button from '@/components/ui/Button';

<Button variant="primary" size="md" onClick={handleClick}>
  Click me
</Button>
```

**Props:**
- `variant`: `'primary' | 'secondary' | 'danger' | 'outline'`
- `size`: `'sm' | 'md' | 'lg'`
- `disabled`: `boolean`
- `onClick`: `() => void`

**Ubicación**: `src/components/ui/Button.tsx`

---

### Card

Contenedor con sombra y bordes redondeados.

```typescript
import Card from '@/components/ui/Card';

<Card title="Título" className="mb-4">
  Contenido
</Card>
```

**Props:**
- `title?`: `string` - Título opcional
- `children`: `ReactNode`
- `className?`: `string`
- `actions?`: `ReactNode` - Acciones en el header

**Ubicación**: `src/components/ui/Card.tsx`

---

### Input

Campo de entrada de texto.

```typescript
import Input from '@/components/ui/Input';

<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="tu@email.com"
/>
```

**Props:**
- `label`: `string`
- `type`: `string` (text, email, password, date, etc.)
- `value`: `string`
- `onChange`: `(e: ChangeEvent<HTMLInputElement>) => void`
- `placeholder?`: `string`
- `disabled?`: `boolean`
- `required?`: `boolean`

**Ubicación**: `src/components/ui/Input.tsx`

---

### Select

Campo de selección dropdown.

```typescript
import Select from '@/components/ui/Select';

<Select
  label="Tipo"
  value={tipo}
  onChange={(e) => setTipo(e.target.value)}
  options={[
    { value: 'ingreso', label: 'Ingreso' },
    { value: 'egreso', label: 'Egreso' }
  ]}
/>
```

**Props:**
- `label`: `string`
- `value`: `string`
- `onChange`: `(e: ChangeEvent<HTMLSelectElement>) => void`
- `options`: `Array<{ value: string; label: string }>`
- `disabled?`: `boolean`

**Ubicación**: `src/components/ui/Select.tsx`

---

### Badge

Etiqueta para mostrar estados o categorías.

```typescript
import Badge from '@/components/ui/Badge';

<Badge variant="success">Activo</Badge>
```

**Props:**
- `variant`: `'success' | 'warning' | 'danger' | 'info' | 'default'`
- `children`: `ReactNode`
- `className?`: `string`

**Ubicación**: `src/components/ui/Badge.tsx`

---

### Modal

Modal reutilizable.

```typescript
import Modal from '@/components/ui/Modal';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Título del Modal"
>
  Contenido del modal
</Modal>
```

**Props:**
- `isOpen`: `boolean`
- `onClose`: `() => void`
- `title?`: `string`
- `children`: `ReactNode`
- `size?`: `'sm' | 'md' | 'lg'`

**Ubicación**: `src/components/ui/Modal.tsx`

---

## 📊 Componentes de Tabla

### Table

Contenedor de tabla.

```typescript
import Table from '@/components/tables/Table';
import TableRow from '@/components/tables/TableRow';
import TableCell from '@/components/tables/TableCell';

<Table headers={['Nombre', 'Monto', 'Fecha']}>
  {items.map(item => (
    <TableRow key={item.id}>
      <TableCell>{item.nombre}</TableCell>
      <TableCell>{formatCurrency(item.monto)}</TableCell>
      <TableCell>{formatDate(item.fecha)}</TableCell>
    </TableRow>
  ))}
</Table>
```

**Props Table:**
- `headers`: `string[]`

**Ubicación**: `src/components/tables/Table.tsx`

---

## 📈 Componentes de Gráficos

### IngresosVsEgresosChart

Gráfico de barras comparando ingresos vs egresos.

```typescript
import IngresosVsEgresosChart from '@/components/charts/IngresosVsEgresosChart';

<IngresosVsEgresosChart data={datosGrafico} />
```

**Props:**
- `data`: `DatosGrafico[]` - Array con `{ name: string, ingresos: number, egresos: number }`

**Ubicación**: `src/components/charts/IngresosVsEgresosChart.tsx`

---

### GananciaPorProyectoChart

Gráfico de barras mostrando ganancia por proyecto.

```typescript
import GananciaPorProyectoChart from '@/components/charts/GananciaPorProyectoChart';

<GananciaPorProyectoChart data={datosGrafico} />
```

**Props:**
- `data`: `DatosGrafico[]` - Array con `{ name: string, value: number }`

**Ubicación**: `src/components/charts/GananciaPorProyectoChart.tsx`

---

## 📝 Componentes de Formularios

### MovimientoForm

Formulario para crear/editar movimientos.

```typescript
import MovimientoForm from '@/components/forms/MovimientoForm';

<MovimientoForm
  movimiento={movimiento} // Opcional, para edición
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  usuarioId={user.id}
/>
```

**Props:**
- `movimiento?`: `MovimientoDetallado` - Para edición
- `onSubmit`: `(data: Omit<MovimientoDetallado, 'id'>) => void`
- `onCancel`: `() => void`
- `usuarioId`: `number`

**Ubicación**: `src/components/forms/MovimientoForm.tsx`

---

### ProyectoForm

Formulario para crear/editar proyectos.

```typescript
import ProyectoForm from '@/components/forms/ProyectoForm';

<ProyectoForm
  proyecto={proyecto} // Opcional
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

**Ubicación**: `src/components/forms/ProyectoForm.tsx`

---

### PagoForm

Formulario para crear pagos entre socios.

```typescript
import PagoForm from '@/components/forms/PagoForm';

<PagoForm
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

**Ubicación**: `src/components/forms/PagoForm.tsx`

---

## 🏗️ Componentes de Layout

### MainLayout

Layout principal con navbar y protección de rutas.

```typescript
import MainLayout from '@/components/layout/MainLayout';

<MainLayout>
  <h1>Contenido de la página</h1>
</MainLayout>
```

**Props:**
- `children`: `ReactNode`

**Ubicación**: `src/components/layout/MainLayout.tsx`

---

### Navbar

Barra de navegación principal.

```typescript
// Se usa automáticamente en MainLayout
// No necesita importación directa
```

**Características:**
- Navegación entre páginas
- Información del usuario
- Botón de logout
- Responsive (menú hamburguesa en móvil)

**Ubicación**: `src/components/layout/Navbar.tsx`

---

## 🤖 Componentes Especiales

### AsistenteIA

Chat con asistente de IA financiero.

```typescript
import AsistenteIA from '@/components/AsistenteIA';

<AsistenteIA
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
/>
```

**Props:**
- `isOpen`: `boolean`
- `onClose`: `() => void`

**Características:**
- Integración con Google Gemini AI
- Contexto financiero del usuario
- Historial de conversación
- Sugerencias de preguntas

**Ubicación**: `src/components/AsistenteIA.jsx`

---

### BotonAsistenteIA

Botón flotante para abrir el asistente IA.

```typescript
// Se muestra automáticamente cuando el usuario está autenticado
// No necesita importación directa
```

**Ubicación**: `src/components/BotonAsistenteIA.jsx`

---

## 🎨 Crear Nuevos Componentes

### Estructura Recomendada

```typescript
'use client'; // Si usa hooks de React

import React from 'react';

interface NuevoComponenteProps {
  // Definir props aquí
  title: string;
  onAction?: () => void;
}

export default function NuevoComponente({ 
  title, 
  onAction 
}: NuevoComponenteProps) {
  return (
    <div className="...">
      <h2>{title}</h2>
      {onAction && (
        <button onClick={onAction}>Acción</button>
      )}
    </div>
  );
}
```

### Ubicación

- **UI Base**: `src/components/ui/`
- **Específicos de Feature**: `src/components/[feature]/`
- **Layout**: `src/components/layout/`
- **Formularios**: `src/components/forms/`

---

## 📚 Recursos Adicionales

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Recharts Docs](https://recharts.org/)

---

**Última actualización**: Enero 2026

