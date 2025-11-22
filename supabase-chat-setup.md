# 📝 Configuración de Tabla para Chat por Usuario

Este documento explica cómo crear la tabla `chat_mensajes` en Supabase para guardar el historial de conversación de cada usuario.

## 🗄️ Crear la Tabla

Ejecuta el siguiente SQL en el SQL Editor de Supabase:

```sql
-- Crear tabla para mensajes del chat
CREATE TABLE IF NOT EXISTS chat_mensajes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('usuario', 'bot')),
  texto TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para mejorar las consultas
CREATE INDEX IF NOT EXISTS idx_chat_mensajes_user_id ON chat_mensajes(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_mensajes_created_at ON chat_mensajes(created_at);

-- Habilitar Row Level Security (RLS)
ALTER TABLE chat_mensajes ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propios mensajes
CREATE POLICY "Los usuarios solo pueden ver sus propios mensajes"
  ON chat_mensajes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar sus propios mensajes
CREATE POLICY "Los usuarios solo pueden insertar sus propios mensajes"
  ON chat_mensajes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propios mensajes
CREATE POLICY "Los usuarios solo pueden eliminar sus propios mensajes"
  ON chat_mensajes
  FOR DELETE
  USING (auth.uid() = user_id);
```

## ✅ Verificación

Después de ejecutar el SQL:

1. Ve a la sección **Table Editor** en Supabase
2. Verifica que la tabla `chat_mensajes` existe
3. Verifica que tiene las columnas: `id`, `user_id`, `tipo`, `texto`, `created_at`
4. Verifica que RLS está habilitado en la pestaña **Policies**

## 🔒 Seguridad

Las políticas RLS garantizan que:
- Cada usuario solo puede ver sus propios mensajes
- Cada usuario solo puede crear mensajes para sí mismo
- Cada usuario solo puede eliminar sus propios mensajes
- Los mensajes se eliminan automáticamente si se elimina el usuario (CASCADE)

## 📊 Estructura de la Tabla

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID | Identificador único del mensaje |
| `user_id` | UUID | ID del usuario (referencia a auth.users) |
| `tipo` | TEXT | Tipo de mensaje: 'usuario' o 'bot' |
| `texto` | TEXT | Contenido del mensaje |
| `created_at` | TIMESTAMP | Fecha y hora de creación |

## 🚀 Uso

Una vez creada la tabla, el chat automáticamente:
- Guardará cada mensaje en la base de datos
- Cargará el historial cuando el usuario abra el chat
- Mantendrá el historial entre sesiones
- Permitirá borrar el historial completo

