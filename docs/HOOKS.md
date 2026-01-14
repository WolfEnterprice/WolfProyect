# 🪝 Guía de Hooks Personalizados

Documentación completa de todos los hooks personalizados disponibles.

---

## 📊 Hooks de Datos (React Query)

### useDashboard

Hook para obtener estadísticas del dashboard.

```typescript
import { useDashboard } from '@/hooks/useDashboard';

function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboard();
  
  // data: EstadisticasDashboard
  // isLoading: boolean
  // error: Error | null
  // refetch: () => void
}
```

**Caché**: 30 segundos  
**Ubicación**: `src/hooks/useDashboard.ts`

---

### useMovimientos

Hook para obtener movimientos con filtros.

```typescript
import { useMovimientos } from '@/hooks/useMovimientos';

function MovimientosPage() {
  const { data, isLoading, error } = useMovimientos({
    fechaDesde: '2026-01-01',
    tipo: 'ingreso',
    proyecto_id: 1,
    estado: 'pagado'
  });
  
  // data: MovimientoDetallado[]
}
```

**Caché**: 60 segundos  
**Query Key**: `['movimientos', filtros]`  
**Ubicación**: `src/hooks/useMovimientos.ts`

---

### useCreateMovimiento

Hook para crear un nuevo movimiento.

```typescript
import { useCreateMovimiento } from '@/hooks/useMovimientos';

function MovimientoForm() {
  const createMutation = useCreateMovimiento();
  
  const handleSubmit = async (data) => {
    try {
      await createMutation.mutateAsync(data);
      // Éxito - caché se invalida automáticamente
    } catch (error) {
      // Manejar error
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
      <button disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  );
}
```

**Invalidación automática**: `['movimientos']`, `['dashboard']`  
**Ubicación**: `src/hooks/useMovimientos.ts`

---

### useUpdateMovimiento

Hook para actualizar un movimiento existente.

```typescript
import { useUpdateMovimiento } from '@/hooks/useMovimientos';

const updateMutation = useUpdateMovimiento();

await updateMutation.mutateAsync({
  id: 1,
  data: { monto: 5000, estado: 'pagado' }
});
```

**Ubicación**: `src/hooks/useMovimientos.ts`

---

### useDeleteMovimiento

Hook para eliminar un movimiento.

```typescript
import { useDeleteMovimiento } from '@/hooks/useMovimientos';

const deleteMutation = useDeleteMovimiento();

await deleteMutation.mutateAsync(1); // id del movimiento
```

**Ubicación**: `src/hooks/useMovimientos.ts`

---

### useProyectos

Hook para obtener lista de proyectos.

```typescript
import { useProyectos } from '@/hooks/useProyectos';

const { data: proyectos, isLoading } = useProyectos();
```

**Caché**: 60 segundos  
**Ubicación**: `src/hooks/useProyectos.ts`

---

### useProyecto

Hook para obtener un proyecto específico.

```typescript
import { useProyecto } from '@/hooks/useProyectos';

const { data: proyecto, isLoading } = useProyecto(proyectoId);
```

**Caché**: 60 segundos  
**Query Key**: `['proyecto', id]`  
**Ubicación**: `src/hooks/useProyectos.ts`

---

### useRepartosProyecto

Hook para obtener repartos de un proyecto.

```typescript
import { useRepartosProyecto } from '@/hooks/useProyectos';

const { data: repartos } = useRepartosProyecto(proyectoId);
```

**Ubicación**: `src/hooks/useProyectos.ts`

---

### usePagos

Hook para obtener pagos entre socios.

```typescript
import { usePagos } from '@/hooks/usePagos';

const { data: pagos, isLoading } = usePagos(mostrarSoloPendientes);
```

**Caché**: 60 segundos  
**Query Key**: `['pagos', mostrarSoloPendientes]`  
**Ubicación**: `src/hooks/usePagos.ts`

---

### useReportes

Hooks para reportes.

```typescript
import { 
  useIngresosVsEgresos, 
  useGananciaPorProyecto 
} from '@/hooks/useReportes';

const { data: ingresosVsEgresos } = useIngresosVsEgresos({
  fechaDesde: '2026-01-01',
  fechaHasta: '2026-01-31'
});

const { data: gananciaPorProyecto } = useGananciaPorProyecto({
  fechaDesde: '2026-01-01',
  fechaHasta: '2026-01-31'
});
```

**Caché**: 2 minutos  
**Ubicación**: `src/hooks/useReportes.ts`

---

## 🔐 Hooks de Autenticación

### useAuth

Hook para acceder al contexto de autenticación.

```typescript
import { useAuth } from '@/contexts/AuthContext';

function Component() {
  const { user, loading, login, logout, isAuthenticated } = useAuth();
  
  if (loading) return <div>Cargando...</div>;
  if (!user) return <div>No autenticado</div>;
  
  return <div>Hola, {user.nombre}</div>;
}
```

**Propiedades:**
- `user`: Usuario actual o `null`
- `loading`: Estado de carga
- `login`: Función para login con email/password
- `loginWithGoogle`: Función para login con Google
- `loginWithGitHub`: Función para login con GitHub
- `logout`: Función para cerrar sesión
- `isAuthenticated`: `boolean`

**Ubicación**: `src/contexts/AuthContext.tsx`

---

## 🛠️ Hooks de Utilidad

### useData (Legacy)

Hook genérico para cargar datos (legacy, usar React Query cuando sea posible).

```typescript
import { useData } from '@/hooks/useData';

const { data, loading, error, refetch } = useData(
  () => fetchData(),
  { immediate: true }
);
```

**Ubicación**: `src/hooks/useData.ts`

---

### useFormatCurrency

Hook para formatear moneda (si existe).

```typescript
import { useFormatCurrency } from '@/hooks/useFormatCurrency';

const formatCurrency = useFormatCurrency();
const formatted = formatCurrency(1000); // "$1,000.00"
```

**Ubicación**: `src/hooks/useFormatCurrency.js`

---

## 📝 Crear Nuevos Hooks

### Estructura Recomendada

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicio } from '@/services/servicio';
import { Tipo } from '@/types';

// Query Hook
export function useRecurso(filtros?: Filtros) {
  return useQuery<Tipo[]>({
    queryKey: ['recurso', filtros],
    queryFn: () => servicio.getRecurso(filtros),
    staleTime: 60 * 1000,
  });
}

// Mutation Hook
export function useCreateRecurso() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Tipo, 'id'>) => servicio.createRecurso(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurso'] });
    },
  });
}
```

### Ubicación

- **Hooks de datos**: `src/hooks/use[Nombre].ts`
- **Hooks de utilidad**: `src/hooks/use[Utilidad].ts`

---

## 🎯 Mejores Prácticas

### 1. Usar React Query para Datos del Servidor

```typescript
// ✅ Correcto
const { data } = useMovimientos(filtros);

// ❌ Evitar
const [data, setData] = useState([]);
useEffect(() => {
  fetchData().then(setData);
}, []);
```

### 2. Invalidar Caché Relacionado

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['movimientos'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}
```

### 3. Manejar Estados de Loading y Error

```typescript
const { data, isLoading, error } = useMovimientos();

if (isLoading) return <Loading />;
if (error) return <Error message={error.message} />;
```

### 4. Usar Mutations para Operaciones de Escritura

```typescript
const mutation = useCreateMovimiento();

await mutation.mutateAsync(data);
```

---

## 📚 Recursos

- [React Query Docs](https://tanstack.com/query/latest)
- [React Hooks Docs](https://react.dev/reference/react)

---

**Última actualización**: Enero 2026

