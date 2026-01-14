# 🔌 Guía de API

Documentación completa de todos los endpoints y servicios disponibles.

---

## 📡 Estructura de API

El proyecto usa **Next.js API Routes** y **Supabase** como backend.

### Base URL

- **Desarrollo**: `http://localhost:3000/api`
- **Producción**: `https://tu-dominio.com/api`

---

## 🔐 Autenticación

### Login

```typescript
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Respuesta:**
```json
{
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "usuario@example.com"
  },
  "token": "jwt_token_here"
}
```

### OAuth (Google/GitHub)

```typescript
// Redirige a Supabase OAuth
GET /api/auth/login/google
GET /api/auth/login/github
```

### Obtener Usuario Actual

```typescript
GET /api/auth/me
Headers: { Authorization: "Bearer token" }
```

---

## 📊 Dashboard

### Obtener Estadísticas

```typescript
GET /api/dashboard
```

**Respuesta:**
```json
{
  "totalIngresos": 50000,
  "totalEgresos": 30000,
  "gananciaNeta": 20000,
  "proyectosActivos": 3,
  "pagosPendientes": 2,
  "proximasFechas": [
    {
      "fecha": "2026-02-01",
      "descripcion": "Pago de factura",
      "tipo": "pago"
    }
  ]
}
```

---

## 💰 Movimientos

### Listar Movimientos

```typescript
GET /api/movimientos?fechaDesde=2026-01-01&fechaHasta=2026-01-31&tipo=ingreso&proyecto_id=1&estado=pagado
```

**Query Parameters:**
- `fechaDesde?`: `string` (YYYY-MM-DD)
- `fechaHasta?`: `string` (YYYY-MM-DD)
- `tipo?`: `'ingreso' | 'egreso'`
- `proyecto_id?`: `number`
- `estado?`: `'pendiente' | 'pagado'`

**Respuesta:**
```json
[
  {
    "id": 1,
    "tipo": "ingreso",
    "monto": 10000,
    "fecha": "2026-01-15",
    "categoria": {
      "id": 1,
      "nombre": "Ventas"
    },
    "proyecto": {
      "id": 1,
      "nombre": "Proyecto A"
    },
    "descripcion": "Venta de producto",
    "estado": "pagado",
    "creado_por_usuario": {
      "id": 1,
      "nombre": "Juan Pérez"
    }
  }
]
```

### Crear Movimiento

```typescript
POST /api/movimientos
Content-Type: application/json

{
  "tipo": "ingreso",
  "monto": 5000,
  "fecha": "2026-01-20",
  "categoria_id": 1,
  "proyecto_id": 1,
  "descripcion": "Nueva venta",
  "estado": "pendiente",
  "creado_por": 1
}
```

### Actualizar Movimiento

```typescript
PUT /api/movimientos/:id
Content-Type: application/json

{
  "monto": 6000,
  "estado": "pagado"
}
```

### Eliminar Movimiento

```typescript
DELETE /api/movimientos/:id
```

---

## 🏗️ Proyectos

### Listar Proyectos

```typescript
GET /api/proyectos
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "nombre": "Proyecto A",
    "descripcion": "Descripción del proyecto",
    "fecha_inicio": "2026-01-01",
    "fecha_fin": null,
    "estado": "activo"
  }
]
```

### Obtener Proyecto

```typescript
GET /api/proyectos/:id
```

### Crear Proyecto

```typescript
POST /api/proyectos
Content-Type: application/json

{
  "nombre": "Nuevo Proyecto",
  "descripcion": "Descripción",
  "fecha_inicio": "2026-01-01",
  "fecha_fin": null,
  "estado": "activo"
}
```

### Actualizar Proyecto

```typescript
PUT /api/proyectos/:id
```

### Obtener Repartos de Proyecto

```typescript
GET /api/proyectos/:id/repartos
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "proyecto_id": 1,
    "usuario": {
      "id": 1,
      "nombre": "Juan Pérez"
    },
    "porcentaje": 50
  }
]
```

---

## 💳 Pagos

### Listar Pagos

```typescript
GET /api/pagos-socios
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "proyecto": {
      "id": 1,
      "nombre": "Proyecto A"
    },
    "usuario": {
      "id": 1,
      "nombre": "Juan Pérez"
    },
    "monto": 5000,
    "estado": "pendiente",
    "fecha_pago": null
  }
]
```

### Obtener Pagos Pendientes

```typescript
GET /api/pagos-socios?estado=pendiente
```

### Crear Pago

```typescript
POST /api/pagos-socios
Content-Type: application/json

{
  "proyecto_id": 1,
  "usuario_id": 1,
  "monto": 5000,
  "estado": "pendiente"
}
```

### Marcar Pago como Pagado

```typescript
POST /api/pagos-socios/:id/pagar
```

---

## 📈 Reportes

### Ingresos vs Egresos

```typescript
GET /api/reportes/ingresos-vs-egresos?fechaDesde=2026-01-01&fechaHasta=2026-01-31
```

**Respuesta:**
```json
[
  {
    "name": "Enero 2026",
    "ingresos": 50000,
    "egresos": 30000
  }
]
```

### Ganancia por Proyecto

```typescript
GET /api/reportes/ganancia-por-proyecto?fechaDesde=2026-01-01&fechaHasta=2026-01-31
```

**Respuesta:**
```json
[
  {
    "name": "Proyecto A",
    "value": 20000
  }
]
```

---

## 🏷️ Categorías

### Listar Categorías

```typescript
GET /api/categorias
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "nombre": "Ventas",
    "tipo": "ingreso"
  }
]
```

### Obtener Categorías por Tipo

```typescript
GET /api/categorias?tipo=ingreso
```

---

## 👥 Usuarios

### Listar Usuarios

```typescript
GET /api/usuarios
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "activo": true
  }
]
```

---

## ⚠️ Manejo de Errores

### Formato de Error

```json
{
  "error": "Mensaje de error",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Códigos de Estado HTTP

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔧 Uso con React Query

### Ejemplo con Hook

```typescript
import { useMovimientos } from '@/hooks/useMovimientos';

function MovimientosPage() {
  const { data: movimientos, isLoading, error } = useMovimientos({
    fechaDesde: '2026-01-01',
    tipo: 'ingreso'
  });
  
  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {movimientos.map(m => (
        <div key={m.id}>{m.descripcion}</div>
      ))}
    </div>
  );
}
```

---

## 📚 Servicios Directos

### Usar Servicios Supabase

```typescript
import { getMovimientos } from '@/services/movimientos';

const movimientos = await getMovimientos({ tipo: 'ingreso' });
```

**Ubicación de Servicios:**
- `src/services/supabase/` - Servicios que usan Supabase directamente
- `src/services/` - Servicios que re-exportan desde supabase/

---

## 🔐 Seguridad

- Todas las rutas requieren autenticación (excepto login)
- Tokens JWT en headers: `Authorization: Bearer <token>`
- Validación de permisos en cada endpoint
- Sanitización de inputs

---

**Última actualización**: Enero 2026

