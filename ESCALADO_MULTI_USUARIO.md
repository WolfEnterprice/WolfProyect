# 🚀 Guía de Escalado Multi-Usuario

Esta guía te explica paso a paso cómo escalar tu aplicación de Gestor de Finanzas para que múltiples usuarios puedan usarla de forma segura.

## 📋 Requisitos Previos

1. ✅ Proyecto React funcionando
2. ✅ Cuenta de Supabase activa
3. ✅ Tablas creadas en Supabase (si ya las tienes)

---

## 🔧 PASO 1: Habilitar Autenticación en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. En el menú lateral, ve a **Authentication** → **Providers**
3. Habilita **Email** como proveedor de autenticación:
   - Activa el toggle
   - Opcionalmente, desactiva "Confirm email" si quieres que los usuarios puedan registrarse sin confirmación por email (solo para desarrollo)

---

## 🗄️ PASO 2: Actualizar el Schema de Base de Datos

### Opción A: Si ya tienes tablas creadas (MIGRACIÓN)

1. Ve a **SQL Editor** en Supabase
2. Ejecuta estos comandos para actualizar tus tablas existentes:

```sql
-- Agregar columna user_id si no existe
ALTER TABLE ingresos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE presupuestos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ahorro ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Eliminar constraint UNIQUE de presupuestos.categoria si existe
ALTER TABLE presupuestos DROP CONSTRAINT IF EXISTS presupuestos_categoria_key;

-- Agregar nuevo constraint UNIQUE para (user_id, categoria)
ALTER TABLE presupuestos ADD CONSTRAINT presupuestos_user_categoria_unique UNIQUE(user_id, categoria);

-- Hacer user_id NOT NULL (después de migrar datos si es necesario)
ALTER TABLE ingresos ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE gastos ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE presupuestos ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE ahorro ALTER COLUMN user_id SET NOT NULL;
```

3. **IMPORTANTE**: Si ya tienes datos en las tablas, necesitas asignarlos a un usuario antes de hacer `NOT NULL`. Crea un usuario de prueba y asigna todos los registros existentes a ese usuario.

### Opción B: Crear tablas desde cero (RECOMENDADO)

1. Ve a **SQL Editor** en Supabase
2. Copia y ejecuta TODO el contenido del archivo `supabase-schema-multi-user.sql`
3. Este script incluye:
   - Tablas con `user_id`
   - Triggers para establecer `user_id` automáticamente
   - RLS (Row Level Security) habilitado
   - Políticas de seguridad completas

---

## 🔒 PASO 3: Verificar RLS (Row Level Security)

Después de ejecutar el schema, verifica que RLS esté habilitado:

1. Ve a **Authentication** → **Policies**
2. Deberías ver políticas para cada tabla:
   - `Users can view own [tabla]`
   - `Users can insert own [tabla]`
   - `Users can update own [tabla]`
   - `Users can delete own [tabla]`

---

## 🎨 PASO 4: Código Frontend (YA ESTÁ LISTO)

El código frontend ya está actualizado con:

✅ **Contexto de Autenticación** (`src/contexts/AuthContext.jsx`)
- Maneja login, registro y logout
- Proporciona el estado del usuario en toda la app

✅ **Componentes de Autenticación**
- `src/pages/Login.jsx` - Página de inicio de sesión
- `src/pages/Register.jsx` - Página de registro

✅ **Rutas Protegidas**
- `src/components/ProtectedRoute.jsx` - Protege rutas que requieren autenticación
- `src/App.jsx` - Configurado con rutas públicas y protegidas

✅ **Servicios Actualizados**
- Todos los servicios ahora incluyen `user_id` automáticamente
- Los queries están filtrados por usuario (gracias a RLS)

✅ **Header Actualizado**
- Muestra el email del usuario
- Botón de logout funcional

---

## 🧪 PASO 5: Probar la Aplicación

1. **Inicia la aplicación**:
   ```bash
   npm run dev
   ```

2. **Registra un nuevo usuario**:
   - Ve a `http://localhost:5173/register`
   - Crea una cuenta con email y contraseña
   - Si habilitaste confirmación por email, verifica tu email

3. **Inicia sesión**:
   - Ve a `http://localhost:5173/login`
   - Ingresa tus credenciales

4. **Prueba la funcionalidad**:
   - Crea ingresos, gastos, presupuestos
   - Verifica que solo veas tus propios datos
   - Cierra sesión y crea otro usuario
   - Verifica que cada usuario vea solo sus datos

---

## 📊 Cómo Funciona la Seguridad

### Row Level Security (RLS)

Supabase usa RLS para filtrar automáticamente los datos por usuario:

- Cuando un usuario hace `SELECT * FROM ingresos`, Supabase solo devuelve los ingresos donde `user_id = auth.uid()`
- Lo mismo aplica para `INSERT`, `UPDATE` y `DELETE`
- **No es posible** que un usuario acceda a datos de otro usuario

### Triggers Automáticos

Los triggers establecen `user_id` automáticamente:

- Cuando insertas un registro sin `user_id`, el trigger lo establece usando `auth.uid()`
- Esto asegura que siempre se asigne el usuario correcto

---

## 🔍 Solución de Problemas

### Error: "Usuario no autenticado"

**Causa**: No hay sesión activa o RLS bloquea el acceso.

**Solución**:
1. Verifica que estés logueado
2. Revisa que RLS esté habilitado en las tablas
3. Verifica que las políticas RLS estén creadas

### Error: "duplicate key value violates unique constraint"

**Causa**: La combinación `(user_id, categoria)` ya existe en presupuestos.

**Solución**: Cada usuario puede tener solo un presupuesto por categoría. Esto es correcto.

### No veo mis datos después de login

**Causa**: Los datos antiguos no tienen `user_id` asignado.

**Solución**: Asigna tus datos existentes a tu usuario:
```sql
-- Reemplaza 'TU_USER_ID' con el ID de tu usuario (lo encuentras en Authentication → Users)
UPDATE ingresos SET user_id = 'TU_USER_ID' WHERE user_id IS NULL;
UPDATE gastos SET user_id = 'TU_USER_ID' WHERE user_id IS NULL;
UPDATE presupuestos SET user_id = 'TU_USER_ID' WHERE user_id IS NULL;
UPDATE ahorro SET user_id = 'TU_USER_ID' WHERE user_id IS NULL;
```

---

## 📝 Cambios Importantes en las Tablas

### Tabla `presupuestos`

**ANTES**: `categoria TEXT NOT NULL UNIQUE`

**AHORA**: `UNIQUE(user_id, categoria)` - Cada usuario puede tener su propio presupuesto por categoría

### Tabla `ahorro`

**ANTES**: Una fila global

**AHORA**: Una fila por usuario (`user_id UNIQUE`)

### Todas las tablas

**ANTES**: Sin `user_id`

**AHORA**: Todas tienen `user_id UUID NOT NULL` que referencia `auth.users(id)`

---

## 🎯 Próximos Pasos (Opcional)

1. **Autenticación Social**: Agrega login con Google/GitHub en Supabase
2. **Recuperación de Contraseña**: Ya está habilitada en Supabase por defecto
3. **Perfiles de Usuario**: Crea una tabla `profiles` para información adicional
4. **Roles y Permisos**: Agrega roles si necesitas administradores

---

## ✅ Checklist Final

- [ ] Autenticación habilitada en Supabase
- [ ] Schema ejecutado correctamente
- [ ] RLS habilitado en todas las tablas
- [ ] Políticas RLS creadas
- [ ] Aplicación probada con múltiples usuarios
- [ ] Cada usuario solo ve sus propios datos

---

## 📞 Soporte

Si encuentras algún problema:

1. Revisa los logs en la consola del navegador
2. Revisa los logs en Supabase Dashboard → Logs
3. Verifica que el schema se haya ejecutado completamente

¡Listo! Tu aplicación ahora soporta múltiples usuarios de forma segura. 🎉

