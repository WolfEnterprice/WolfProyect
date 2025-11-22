# 📋 Orden Correcto de Migración Multi-Usuario

## ⚠️ IMPORTANTE: El Orden SÍ Importa

Debes seguir este orden exacto para que funcione correctamente:

---

## 🔄 Orden Correcto (Paso a Paso)

### **PASO 1: Agregar columna `user_id`** ✅
```sql
-- Agregar columna user_id (sin NOT NULL todavía)
ALTER TABLE ingresos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE presupuestos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ahorro ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
```

**Estado de RLS**: ❌ DESHABILITADO o sin políticas aún

---

### **PASO 2: Asignar `user_id` a datos existentes** ✅
```sql
-- IMPORTANTE: Hacer esto ANTES de habilitar RLS
UPDATE ingresos SET user_id = 'TU_USER_ID' WHERE user_id IS NULL;
UPDATE gastos SET user_id = 'TU_USER_ID' WHERE user_id IS NULL;
UPDATE presupuestos SET user_id = 'TU_USER_ID' WHERE user_id IS NULL;
UPDATE ahorro SET user_id = 'TU_USER_ID' WHERE user_id IS NULL;
```

**Estado de RLS**: ❌ DESHABILITADO (si no, te bloqueará las actualizaciones)

---

### **PASO 3: Verificar que todos tienen `user_id`** ✅
```sql
-- Verificar que no hay NULLs
SELECT COUNT(*) as total, COUNT(user_id) as con_user_id 
FROM ingresos;
-- Repite para gastos, presupuestos, ahorro
```

**Estado de RLS**: ❌ DESHABILITADO todavía

---

### **PASO 4: Hacer `user_id NOT NULL`** ✅
```sql
-- Ahora sí puedes hacer NOT NULL
ALTER TABLE ingresos ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE gastos ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE presupuestos ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE ahorro ALTER COLUMN user_id SET NOT NULL;
```

**Estado de RLS**: ❌ DESHABILITADO todavía

---

### **PASO 5: Actualizar constraints y crear índices** ✅
```sql
-- Actualizar constraints UNIQUE
ALTER TABLE presupuestos DROP CONSTRAINT IF EXISTS presupuestos_categoria_key;
ALTER TABLE presupuestos ADD CONSTRAINT presupuestos_user_categoria_unique UNIQUE(user_id, categoria);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_ingresos_user_id ON ingresos(user_id);
CREATE INDEX IF NOT EXISTS idx_gastos_user_id ON gastos(user_id);
-- etc...
```

**Estado de RLS**: ❌ DESHABILITADO todavía

---

### **PASO 6: HABILITAR RLS** ✅ (Ahora sí)
```sql
-- Ahora sí puedes habilitar RLS
ALTER TABLE ingresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE presupuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ahorro ENABLE ROW LEVEL SECURITY;
```

**Estado de RLS**: ✅ HABILITADO (pero sin políticas todavía)

---

### **PASO 7: Crear políticas RLS** ✅ (Último paso)
```sql
-- Crear políticas para ingresos
CREATE POLICY "Users can view own ingresos" ON ingresos
  FOR SELECT USING (auth.uid() = user_id);
-- etc... (todas las políticas)
```

**Estado de RLS**: ✅ HABILITADO + Políticas creadas

---

## ❌ ¿Qué pasa si habilitas RLS antes?

Si habilitas RLS **ANTES** de asignar `user_id`, podrías tener problemas:

### Problema 1: UPDATE bloqueado
```sql
-- Si RLS está habilitado y no hay usuario autenticado:
UPDATE ingresos SET user_id = 'user-123' WHERE user_id IS NULL;
-- ❌ ERROR: No tienes permisos (RLS te bloquea)
```

### Problema 2: Políticas RLS bloquean operaciones
- Las políticas RLS requieren `auth.uid()` (usuario autenticado)
- En el SQL Editor, no hay usuario autenticado
- Por eso las operaciones pueden fallar

---

## ✅ Solución: Deshabilitar RLS temporalmente (si ya lo habilitaste)

Si **ya habilitaste RLS** y ahora no puedes actualizar:

### Paso 1: Deshabilitar RLS temporalmente
```sql
-- Deshabilitar RLS temporalmente
ALTER TABLE ingresos DISABLE ROW LEVEL SECURITY;
ALTER TABLE gastos DISABLE ROW LEVEL SECURITY;
ALTER TABLE presupuestos DISABLE ROW LEVEL SECURITY;
ALTER TABLE ahorro DISABLE ROW LEVEL SECURITY;
```

### Paso 2: Asignar user_id
```sql
-- Ahora sí puedes actualizar
UPDATE ingresos SET user_id = 'TU_USER_ID' WHERE user_id IS NULL;
UPDATE gastos SET user_id = 'TU_USER_ID' WHERE user_id IS NULL;
UPDATE presupuestos SET user_id = 'TU_USER_ID' WHERE user_id IS NULL;
UPDATE ahorro SET user_id = 'TU_USER_ID' WHERE user_id IS NULL;
```

### Paso 3: Volver a habilitar RLS
```sql
-- Volver a habilitar RLS
ALTER TABLE ingresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE presupuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ahorro ENABLE ROW LEVEL SECURITY;
```

### Paso 4: Crear políticas
```sql
-- Ahora crear las políticas
CREATE POLICY "Users can view own ingresos" ON ingresos
  FOR SELECT USING (auth.uid() = user_id);
-- etc...
```

---

## 📝 Resumen del Orden

1. ✅ Agregar columna `user_id` (sin NOT NULL)
2. ✅ Asignar `user_id` a datos existentes (RLS deshabilitado)
3. ✅ Verificar que todos tienen `user_id`
4. ✅ Hacer `user_id NOT NULL`
5. ✅ Actualizar constraints e índices
6. ✅ **Habilitar RLS** (solo después de migrar datos)
7. ✅ Crear políticas RLS (último paso)

---

## 🎯 Respuesta Directa a tu Pregunta

**¿Necesito habilitar RLS para asignar user_id?**

**❌ NO**. De hecho, es al revés:
- **NO** habilites RLS hasta después de asignar `user_id`
- Si ya habilitaste RLS, deshabilítalo temporalmente
- Asigna `user_id` a los datos existentes
- **Luego** habilita RLS nuevamente
- **Finalmente** crea las políticas RLS

---

## ✅ Checklist

- [ ] Agregué columna `user_id` (sin NOT NULL)
- [ ] Verifiqué que RLS está deshabilitado
- [ ] Asigné `user_id` a todos los datos existentes
- [ ] Verifiqué que todos tienen `user_id`
- [ ] Hice `user_id NOT NULL`
- [ ] Actualicé constraints e índices
- [ ] **AHORA SÍ** habilité RLS
- [ ] Creé todas las políticas RLS

¡Sigue este orden y no tendrás problemas! 🚀

