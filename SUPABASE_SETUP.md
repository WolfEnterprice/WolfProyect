# Configuración de Supabase

## Pasos para conectar el frontend con Supabase

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
NEXT_PUBLIC_SUPABASE_URL=https://jnykzalzjhupwoumhgus.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_msq5jRMjkiPnQYDCjqK6pw_mmVx28Hy
```

### 3. Ejecutar el script SQL en Supabase

1. Ve a tu proyecto en Supabase
2. Abre el SQL Editor
3. Copia y pega el contenido completo de `database/schema_supabase.sql`
4. Ejecuta el script

### 4. Configurar políticas de seguridad (RLS) en Supabase

Por ahora, el proyecto está configurado para usar la clave anónima. Para producción, deberías configurar Row Level Security (RLS) en Supabase.

#### Habilitar RLS en las tablas:

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE repartos_proyecto ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos_socios ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar según tus necesidades)
-- Permitir lectura a todos los usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden leer usuarios"
  ON usuarios FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden leer categorias"
  ON categorias FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden leer proyectos"
  ON proyectos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden leer movimientos"
  ON movimientos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden insertar movimientos"
  ON movimientos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar sus movimientos"
  ON movimientos FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden leer repartos"
  ON repartos_proyecto FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden leer pagos"
  ON pagos_socios FOR SELECT
  USING (auth.role() = 'authenticated');
```

**Nota:** Por ahora, para desarrollo, puedes deshabilitar RLS temporalmente usando la clave anónima directamente. En producción, deberías usar Supabase Auth y configurar políticas adecuadas.

### 5. Verificar la conexión

1. Inicia el servidor de desarrollo: `npm run dev`
2. Abre la aplicación en el navegador
3. Intenta hacer login (cualquier contraseña funciona en modo demo)
4. Verifica que puedas crear y ver movimientos

### 6. Estructura de servicios

Los servicios están organizados así:

```
src/services/
  ├── supabase/          # Servicios usando Supabase
  │   ├── usuarios.ts
  │   ├── movimientos.ts
  │   ├── proyectos.ts
  │   ├── categorias.ts
  │   ├── pagos.ts
  │   ├── dashboard.ts
  │   ├── reportes.ts
  │   └── auth.ts
  ├── index.ts           # Exporta desde supabase/
  └── (servicios antiguos con APIs mockeadas)
```

Para cambiar entre Supabase y APIs mockeadas, actualiza `src/services/index.ts`.

### 7. Troubleshooting

#### Error: "Missing Supabase environment variables"
- Verifica que el archivo `.env.local` existe
- Verifica que las variables tienen los nombres correctos
- Reinicia el servidor de desarrollo después de crear/modificar `.env.local`

#### Error: "relation does not exist"
- Verifica que ejecutaste el script SQL en Supabase
- Verifica que las tablas se crearon correctamente
- Revisa la consola de Supabase para ver errores

#### Error: "permission denied"
- Verifica las políticas RLS en Supabase
- Temporalmente, puedes deshabilitar RLS en las tablas para desarrollo

### 8. Próximos pasos

1. Implementar autenticación real con Supabase Auth
2. Configurar políticas RLS adecuadas
3. Agregar validaciones adicionales
4. Implementar paginación para listados grandes
5. Agregar caché si es necesario

