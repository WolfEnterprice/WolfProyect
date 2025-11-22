# 🔧 Solución: Error "user_id contains null values" en tabla `ahorro`

## ❌ El Problema

Estás intentando hacer `user_id NOT NULL` pero hay registros en `ahorro` sin `user_id` asignado.

## ✅ Solución Paso a Paso

### Opción 1: Si NO tienes datos importantes en `ahorro` (Más fácil)

Si no te importa perder los datos de ahorro existentes:

```sql
-- Eliminar todos los registros sin user_id
DELETE FROM ahorro WHERE user_id IS NULL;

-- Ahora sí puedes hacer NOT NULL
ALTER TABLE ahorro ALTER COLUMN user_id SET NOT NULL;
```

### Opción 2: Si TIENES datos importantes en `ahorro` (Recomendado)

Asignar `user_id` a los registros existentes antes de hacer NOT NULL:

#### **Paso 1: Obtener tu user_id**

```sql
SELECT 
  id as user_id,
  email
FROM auth.users 
ORDER BY created_at ASC;
```

**Copia el `id` del usuario que quieres usar** (ejemplo: `123e4567-e89b-12d3-a456-426614174000`)

#### **Paso 2: Asignar user_id a los registros existentes**

**⚠️ IMPORTANTE**: Reemplaza `'TU_USER_ID_AQUI'` con el ID real que copiaste:

```sql
UPDATE ahorro 
SET user_id = 'TU_USER_ID_AQUI'  -- ⚠️ CAMBIA ESTO
WHERE user_id IS NULL;
```

#### **Paso 3: Verificar que funcionó**

```sql
SELECT 
  COUNT(*) as total,
  COUNT(user_id) as con_user_id,
  CASE 
    WHEN COUNT(*) = COUNT(user_id) THEN '✅ OK'
    ELSE '❌ ERROR'
  END as estado
FROM ahorro;
```

**Debe mostrar**: `total = con_user_id` y estado `✅ OK`

#### **Paso 4: Si hay múltiples registros, eliminar duplicados**

Si un usuario tiene múltiples registros en `ahorro`, elimina los duplicados:

```sql
-- Ver duplicados
SELECT user_id, COUNT(*) as cantidad
FROM ahorro
GROUP BY user_id
HAVING COUNT(*) > 1;
```

Si hay duplicados, elimina todos excepto uno:

```sql
-- Eliminar duplicados (mantiene el más reciente)
DELETE FROM ahorro 
WHERE id NOT IN (
  SELECT MAX(id) 
  FROM ahorro 
  GROUP BY user_id
);
```

#### **Paso 5: Ahora sí hacer NOT NULL**

```sql
ALTER TABLE ahorro ALTER COLUMN user_id SET NOT NULL;
```

---

## 🎯 Script Completo (Todo en uno)

Ejecuta esto completo (cambiando `'TU_USER_ID_AQUI'`):

```sql
-- 1. Asignar user_id
UPDATE ahorro 
SET user_id = 'TU_USER_ID_AQUI'  -- ⚠️ CAMBIA ESTO
WHERE user_id IS NULL;

-- 2. Verificar
SELECT 
  COUNT(*) as total,
  COUNT(user_id) as con_user_id
FROM ahorro;

-- 3. Eliminar duplicados si es necesario
DELETE FROM ahorro 
WHERE id NOT IN (
  SELECT MAX(id) 
  FROM ahorro 
  GROUP BY user_id
);

-- 4. Hacer NOT NULL
ALTER TABLE ahorro ALTER COLUMN user_id SET NOT NULL;
```

---

## 📋 Checklist

- [ ] Obtuve mi `user_id` de `auth.users`
- [ ] Asigné `user_id` a todos los registros en `ahorro`
- [ ] Verifiqué que todos tienen `user_id` (total = con_user_id)
- [ ] Eliminé duplicados si había
- [ ] Ejecuté `ALTER TABLE ahorro ALTER COLUMN user_id SET NOT NULL`

---

## ⚠️ Si aún tienes el error después

1. **Verifica que realmente asignaste el user_id**:
   ```sql
   SELECT * FROM ahorro WHERE user_id IS NULL;
   ```
   Si muestra registros, no se asignó correctamente.

2. **Verifica que el user_id es válido**:
   ```sql
   SELECT id FROM auth.users WHERE id = 'TU_USER_ID_AQUI';
   ```
   Debe mostrar una fila.

3. **Verifica que no hay NULLs ocultos**:
   ```sql
   SELECT COUNT(*) FROM ahorro WHERE user_id IS NULL;
   ```
   Debe ser 0.

¡Ejecuta el script y avísame si funciona! 🚀

