# 🔑 Diseño de Primary Keys - Multi-Usuario

## ❓ ¿Puedo usar `user_id` como Primary Key?

La respuesta depende de la tabla:

---

## ✅ TABLA `ahorro` - SÍ puede usar `user_id` como Primary Key

**Razón**: Cada usuario solo tiene **UNA** fila de ahorro (1 usuario = 1 registro)

```sql
-- Opción actual (con id separado):
CREATE TABLE ahorro (
  id UUID PRIMARY KEY,              -- ⚠️ No es necesario
  user_id UUID UNIQUE NOT NULL,     -- Ya tiene UNIQUE
  ...
);

-- Opción mejorada (user_id como Primary Key):
CREATE TABLE ahorro (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,  -- ✅ Mejor
  ahorroActual BIGINT NOT NULL DEFAULT 0,
  ahorroMeta BIGINT NOT NULL DEFAULT 0,
  ...
);
```

**Ventajas**:
- ✅ Más simple (eliminas una columna)
- ✅ `user_id` ya es único por usuario
- ✅ Más eficiente

---

## ❌ TABLAS `ingresos`, `gastos`, `presupuestos` - NO pueden usar `user_id` como Primary Key

**Razón**: Cada usuario puede tener **MÚLTIPLES** registros (1 usuario = muchos ingresos/gastos/presupuestos)

```sql
-- ❌ ESTO NO FUNCIONA:
CREATE TABLE ingresos (
  user_id UUID PRIMARY KEY,  -- ❌ ERROR: No puede haber múltiples registros con el mismo user_id
  fecha DATE NOT NULL,
  ...
);

-- Usuario 1 intenta crear su SEGUNDO ingreso:
INSERT INTO ingresos (user_id, fecha, monto) 
VALUES ('user-123', '2024-01-02', 50000);  -- ❌ ERROR: Primary key duplicada!
```

**Por qué necesitas `id` separado**:
- Un usuario puede tener 10 ingresos diferentes
- Un usuario puede tener 20 gastos diferentes  
- Un usuario puede tener 5 presupuestos (uno por categoría)
- Cada registro necesita un `id` único

**✅ Diseño correcto**:
```sql
CREATE TABLE ingresos (
  id UUID PRIMARY KEY,              -- ✅ Único para cada registro
  user_id UUID NOT NULL,            -- ✅ Puede repetirse (FK, no PK)
  fecha DATE NOT NULL,
  ...
);
```

---

## 🎯 Resumen

| Tabla | ¿user_id como PK? | Razón |
|-------|-------------------|-------|
| `ahorro` | ✅ **SÍ** | 1 usuario = 1 registro |
| `ingresos` | ❌ **NO** | 1 usuario = muchos registros |
| `gastos` | ❌ **NO** | 1 usuario = muchos registros |
| `presupuestos` | ❌ **NO** | 1 usuario = muchos registros (uno por categoría) |

---

## 🔧 ¿Quieres cambiar la tabla `ahorro`?

Si quieres usar `user_id` como Primary Key en `ahorro`, aquí está el script:

```sql
-- PASO 1: Eliminar la columna id de ahorro
ALTER TABLE ahorro DROP CONSTRAINT IF EXISTS ahorro_pkey;
ALTER TABLE ahorro DROP COLUMN IF EXISTS id;

-- PASO 2: Hacer user_id la Primary Key
ALTER TABLE ahorro DROP CONSTRAINT IF EXISTS ahorro_user_id_unique;
ALTER TABLE ahorro ADD PRIMARY KEY (user_id);

-- PASO 3: Actualizar la referencia en el código (si existe)
-- No necesitas hacer nada más, user_id ya referencia auth.users(id)
```

**⚠️ IMPORTANTE**: Si ya tienes datos en `ahorro`, primero asigna `user_id` a todos los registros antes de eliminar `id`.

---

## 📝 Recomendación Final

- ✅ **Mantener `id` en todas las tablas**: Es más estándar y flexible
- ✅ **Usar `user_id` como PK solo en `ahorro`**: Si quieres optimizar, está bien
- ❌ **NO usar `user_id` como PK en otras tablas**: No funcionará

¿Quieres que actualice la tabla `ahorro` para usar `user_id` como Primary Key?

