# 🔧 Migración Manual Multi-Usuario

Esta guía te explica cómo hacer la migración manualmente paso a paso.

## 📋 Opción 1: Usar `auth.users` de Supabase (RECOMENDADO)

Supabase **ya tiene** una tabla `auth.users` que se crea automáticamente cuando habilitas Authentication. No necesitas crear una nueva tabla "users".

### Paso 1: Habilitar Authentication en Supabase

1. Ve a **Authentication** → **Providers** en Supabase
2. Habilita **Email** como proveedor

### Paso 2: Crear un usuario de prueba (si aún no tienes)

1. Ve a **Authentication** → **Users**
2. Click en **"Add user"** → **"Create new user"**
3. O regístrate desde tu app en `/register`

### Paso 3: Obtener el ID de tu usuario

Ejecuta esto en SQL Editor para ver los usuarios disponibles:

```sql
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at ASC;
```

Copia el `id` del usuario que quieres usar (ejemplo: `123e4567-e89b-12d3-a456-426614174000`)

### Paso 4: Agregar columna `user_id` a todas las tablas

Ejecuta esto en SQL Editor (cambia `TU_USER_ID_AQUI` por el ID que copiaste):

```sql
-- 1. Agregar columna user_id a todas las tablas
ALTER TABLE ingresos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE presupuestos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ahorro ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
```

### Paso 5: Asignar user_id a todos los datos existentes

**IMPORTANTE**: Reemplaza `'TU_USER_ID_AQUI'` con el ID real de tu usuario:

```sql
-- 2. Asignar todos los datos existentes a tu usuario
UPDATE ingresos 
SET user_id = 'TU_USER_ID_AQUI' 
WHERE user_id IS NULL;

UPDATE gastos 
SET user_id = 'TU_USER_ID_AQUI' 
WHERE user_id IS NULL;

UPDATE presupuestos 
SET user_id = 'TU_USER_ID_AQUI' 
WHERE user_id IS NULL;

UPDATE ahorro 
SET user_id = 'TU_USER_ID_AQUI' 
WHERE user_id IS NULL;
```

### Paso 6: Verificar que todos tienen user_id

```sql
-- Verificar que no haya registros sin user_id
SELECT 
  'ingresos' as tabla,
  COUNT(*) as total,
  COUNT(user_id) as con_user_id
FROM ingresos
UNION ALL
SELECT 
  'gastos' as tabla,
  COUNT(*) as total,
  COUNT(user_id) as con_user_id
FROM gastos
UNION ALL
SELECT 
  'presupuestos' as tabla,
  COUNT(*) as total,
  COUNT(user_id) as con_user_id
FROM presupuestos
UNION ALL
SELECT 
  'ahorro' as tabla,
  COUNT(*) as total,
  COUNT(user_id) as con_user_id
FROM ahorro;
```

**Debe mostrar**: `total = con_user_id` en todas las tablas

### Paso 7: Hacer user_id NOT NULL

Solo ejecuta esto **después** de verificar que todos tienen user_id:

```sql
-- 3. Hacer user_id NOT NULL
ALTER TABLE ingresos ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE gastos ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE presupuestos ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE ahorro ALTER COLUMN user_id SET NOT NULL;
```

### Paso 8: Actualizar constraint UNIQUE de presupuestos

```sql
-- 4. Eliminar constraint antiguo y crear uno nuevo
ALTER TABLE presupuestos DROP CONSTRAINT IF EXISTS presupuestos_categoria_key;
ALTER TABLE presupuestos ADD CONSTRAINT presupuestos_user_categoria_unique UNIQUE(user_id, categoria);
```

### Paso 9: Actualizar constraint UNIQUE de ahorro

```sql
-- 5. Actualizar constraint de ahorro
ALTER TABLE ahorro DROP CONSTRAINT IF EXISTS ahorro_user_id_key;
ALTER TABLE ahorro ADD CONSTRAINT ahorro_user_id_unique UNIQUE(user_id);
```

### Paso 10: Crear índices

```sql
-- 6. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_ingresos_user_id ON ingresos(user_id);
CREATE INDEX IF NOT EXISTS idx_gastos_user_id ON gastos(user_id);
CREATE INDEX IF NOT EXISTS idx_presupuestos_user_id ON presupuestos(user_id);
CREATE INDEX IF NOT EXISTS idx_ahorro_user_id ON ahorro(user_id);
```

### Paso 11: Habilitar RLS y crear políticas

Ahora ejecuta el script completo de RLS del archivo `supabase-schema-multi-user-FIXED.sql` (solo desde el "PASO 8: HABILITAR ROW LEVEL SECURITY" en adelante).

---

## 📋 Opción 2: Crear tu propia tabla "users" (NO RECOMENDADO)

Si realmente quieres crear tu propia tabla "users" separada de `auth.users`, puedes hacerlo, pero tendrás que manejar la autenticación manualmente y será más complicado.

### Crear tabla users personalizada

```sql
-- Crear tabla users personalizada
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  nombre TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Referenciar tu tabla users en lugar de auth.users

```sql
-- Agregar user_id que referencia tu tabla users
ALTER TABLE ingresos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE presupuestos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ahorro ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
```

**⚠️ PROBLEMA**: Con esta opción tendrías que:
- Manejar autenticación manualmente
- No podrías usar las políticas RLS de Supabase (`auth.uid()` no funcionaría)
- Tendrías que crear tu propio sistema de autenticación
- Es mucho más trabajo y menos seguro

**✅ RECOMENDACIÓN**: Usa `auth.users` de Supabase que ya está lista y optimizada.

---

## 🎯 Resumen: Qué usar

| Opción | Ventajas | Desventajas |
|--------|----------|-------------|
| `auth.users` (Opción 1) | ✅ Ya existe<br>✅ RLS funciona<br>✅ Seguro<br>✅ Fácil | Ninguna |
| Tabla `users` propia | Control total | ❌ Más trabajo<br>❌ Menos seguro<br>❌ RLS no funciona<br>❌ Autenticación manual |

**Mi recomendación**: Usa la **Opción 1** con `auth.users` de Supabase. 🎯

---

## 📝 Checklist Manual

- [ ] Habilitar Authentication en Supabase
- [ ] Crear usuario de prueba
- [ ] Obtener ID del usuario
- [ ] Agregar columna `user_id` a todas las tablas
- [ ] Asignar `user_id` a datos existentes
- [ ] Verificar que todos tienen `user_id`
- [ ] Hacer `user_id NOT NULL`
- [ ] Actualizar constraints UNIQUE
- [ ] Crear índices
- [ ] Habilitar RLS y crear políticas

¡Listo! Hazlo paso a paso manualmente. 🚀

