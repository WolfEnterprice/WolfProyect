# Configuración de Supabase para Gestor de Finanzas

## Tablas Necesarias

Necesitas **4 tablas principales**:

### 1. `ingresos`
- **Campos**: id, fecha, descripcion, categoria, monto
- **Propósito**: Almacenar todos los ingresos

### 2. `gastos`
- **Campos**: id, fecha, descripcion, categoria, monto, metodo_pago
- **Propósito**: Almacenar todos los gastos

### 3. `presupuestos`
- **Campos**: id, categoria, presupuesto
- **Propósito**: Almacenar el presupuesto asignado por categoría
- **Nota**: El campo "gastado" se calcula dinámicamente sumando los gastos de esa categoría

### 4. `ahorro`
- **Campos**: id, ahorro_actual, ahorro_meta
- **Propósito**: Almacenar el estado del ahorro (una fila por usuario)

## Pasos para Configurar

1. **Crea las tablas**: Ejecuta el archivo `supabase-schema.sql` en el SQL Editor de Supabase

2. **Si NO usas autenticación** (solo un usuario):
   - Elimina las columnas `user_id` de todas las tablas
   - Elimina las políticas RLS (Row Level Security)

3. **Si SÍ usas autenticación** (múltiples usuarios):
   - Mantén las columnas `user_id`
   - Descomenta y ajusta las políticas RLS
   - Habilita RLS en cada tabla

## Instalación del Cliente

```bash
npm install @supabase/supabase-js
```

## Variables de Entorno

Crea un archivo `.env`:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

## Estructura de Datos

### Ingresos
```typescript
{
  id: string (UUID)
  fecha: string (DATE)
  descripcion: string
  categoria: string
  monto: number
  created_at: timestamp
  updated_at: timestamp
  user_id?: string (UUID) // Solo si usas auth
}
```

### Gastos
```typescript
{
  id: string (UUID)
  fecha: string (DATE)
  descripcion: string
  categoria: string
  monto: number
  metodo_pago: string
  created_at: timestamp
  updated_at: timestamp
  user_id?: string (UUID) // Solo si usas auth
}
```

### Presupuestos
```typescript
{
  id: string (UUID)
  categoria: string (UNIQUE)
  presupuesto: number
  created_at: timestamp
  updated_at: timestamp
  user_id?: string (UUID) // Solo si usas auth
}
```

### Ahorro
```typescript
{
  id: string (UUID)
  ahorro_actual: number
  ahorro_meta: number
  created_at: timestamp
  updated_at: timestamp
  user_id?: string (UUID) // Solo si usas auth, UNIQUE
}
```

## Notas Importantes

- Los montos están en **pesos colombianos (COP)** sin decimales
- El campo `gastado` en presupuestos se calcula dinámicamente sumando los gastos por categoría
- Si usas autenticación, cada usuario tendrá sus propios datos
- Si NO usas autenticación, todos los datos serán compartidos (una sola instancia)

