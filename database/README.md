# Base de Datos - Freegents Finance

Este directorio contiene los scripts SQL para crear la base de datos del sistema.

## Archivos

- **`schema.sql`** - Script para PostgreSQL
- **`schema_mysql.sql`** - Script para MySQL/MariaDB

## Estructura de Tablas

### 1. `usuarios`
Almacena información de los socios del negocio.
- `id` - ID único del usuario
- `nombre` - Nombre del usuario
- `email` - Email único
- `activo` - Si el usuario está activo
- `password_hash` - Hash de la contraseña (para autenticación real)

### 2. `categorias`
Categorías para clasificar los movimientos financieros.
- `id` - ID único
- `nombre` - Nombre de la categoría
- `tipo` - Tipo: 'ingreso' o 'egreso'

### 3. `proyectos`
Proyectos empresariales.
- `id` - ID único
- `nombre` - Nombre del proyecto
- `descripcion` - Descripción del proyecto
- `fecha_inicio` - Fecha de inicio
- `fecha_fin` - Fecha de fin (nullable)
- `estado` - Estado: 'activo', 'completado', 'cancelado'

### 4. `movimientos`
Ingresos y egresos financieros.
- `id` - ID único
- `tipo` - Tipo: 'ingreso' o 'egreso'
- `monto` - Monto del movimiento
- `fecha` - Fecha del movimiento
- `categoria_id` - FK a categorias
- `proyecto_id` - FK a proyectos (nullable)
- `descripcion` - Descripción
- `creado_por` - FK a usuarios (quién creó el registro)
- `estado` - Estado: 'pendiente' o 'pagado'

### 5. `repartos_proyecto`
Reparto de porcentajes por socio en cada proyecto.
- `id` - ID único
- `proyecto_id` - FK a proyectos
- `usuario_id` - FK a usuarios
- `porcentaje` - Porcentaje de reparto (0-100)

### 6. `pagos_socios`
Pagos realizados entre socios por proyecto.
- `id` - ID único
- `proyecto_id` - FK a proyectos
- `usuario_id` - FK a usuarios
- `monto` - Monto del pago
- `estado` - Estado: 'pendiente' o 'pagado'
- `fecha_pago` - Fecha del pago (nullable)

## Instalación

### PostgreSQL

```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE freegents_finance;

# Conectarse a la base de datos
\c freegents_finance

# Ejecutar script
\i database/schema.sql
```

### MySQL/MariaDB

```bash
# Conectarse a MySQL
mysql -u root -p

# Crear base de datos
CREATE DATABASE freegents_finance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Usar la base de datos
USE freegents_finance;

# Ejecutar script
SOURCE database/schema_mysql.sql;
```

## Datos Iniciales

Los scripts incluyen datos iniciales:
- 2 usuarios (Socios 1 y 2)
- 8 categorías (3 de ingreso, 5 de egreso)

## Vistas

El script incluye vistas útiles:
- `v_movimientos_detallados` - Movimientos con relaciones expandidas
- `v_proyectos_resumen` - Resumen de ingresos/egresos por proyecto
- `v_repartos_detallados` - Repartos con información de usuarios
- `v_pagos_detallados` - Pagos con información completa

## Notas Importantes

1. **Foreign Keys**: Las relaciones están definidas con foreign keys para mantener integridad referencial
2. **Índices**: Se han creado índices en campos clave para optimizar consultas
3. **Constraints**: Se han agregado constraints para validar datos (CHECK, UNIQUE)
4. **Timestamps**: Todas las tablas incluyen `created_at` y `updated_at`
5. **Charset**: En MySQL se usa utf8mb4 para soportar emojis y caracteres especiales

## Autenticación

Para implementar autenticación real:
1. Agrega `password_hash` en la tabla usuarios (ya está incluido)
2. Usa bcrypt o similar para hashear contraseñas
3. Implementa JWT o sessions en el backend

