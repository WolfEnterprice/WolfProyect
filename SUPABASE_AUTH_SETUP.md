# Configuración de Autenticación OAuth con Supabase

## Paso 1: Configurar Google OAuth en Supabase

### 1.1. Crear proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **APIs & Services** > **Credentials**
4. Haz clic en **Create Credentials** > **OAuth client ID**
5. Si es la primera vez, configura la pantalla de consentimiento OAuth:
   - Tipo de aplicación: **External**
   - Nombre de la app: "Freegents Finance"
   - Email de soporte: tu email
   - Agrega tu dominio o deja el dominio de prueba
   - Guarda y continúa
6. Agrega los scopes necesarios (email, profile)
7. Agrega usuarios de prueba si estás en modo testing

### 1.2. Crear OAuth Client ID

1. Tipo de aplicación: **Web application**
2. Nombre: "Freegents Finance Web"
3. **Authorized JavaScript origins**:
   ```
   https://jnykzalzjhupwoumhgus.supabase.co
   http://localhost:3000 (para desarrollo)
   ```
4. **Authorized redirect URIs**:
   ```
   https://jnykzalzjhupwoumhgus.supabase.co/auth/v1/callback
   ```
5. Guarda y copia:
   - **Client ID**
   - **Client Secret**

### 1.3. Configurar en Supabase

1. Ve a tu proyecto en Supabase
2. Ve a **Authentication** > **Providers**
3. Busca **Google** y haz clic para habilitarlo
4. Pega el **Client ID** y **Client Secret** de Google
5. Guarda los cambios

---

## Paso 2: Configurar GitHub OAuth en Supabase

### 2.1. Crear OAuth App en GitHub

1. Ve a [GitHub Developer Settings](https://github.com/settings/developers)
2. Haz clic en **OAuth Apps** > **New OAuth App**
3. Completa el formulario:
   - **Application name**: "Freegents Finance"
   - **Homepage URL**: 
     ```
     http://localhost:3000 (desarrollo)
     https://tu-dominio.com (producción)
     ```
   - **Authorization callback URL**:
     ```
     https://jnykzalzjhupwoumhgus.supabase.co/auth/v1/callback
     ```
4. Haz clic en **Register application**
5. Copia:
   - **Client ID**
   - **Client Secret** (haz clic en "Generate a new client secret" si no lo tienes)

### 2.2. Configurar en Supabase

1. En Supabase, ve a **Authentication** > **Providers**
2. Busca **GitHub** y haz clic para habilitarlo
3. Pega el **Client ID** y **Client Secret** de GitHub
4. Guarda los cambios

---

## Paso 3: Configurar URL de redirección en Supabase

1. En Supabase, ve a **Authentication** > **URL Configuration**
2. Agrega a **Redirect URLs**:
   ```
   http://localhost:3000/**
   https://tu-dominio.com/**
   ```
3. Guarda los cambios

---

## Paso 4: Configurar función para sincronizar usuarios

Necesitamos crear una función que sincronice los usuarios de Supabase Auth con nuestra tabla `usuarios`:

1. Ve al **SQL Editor** en Supabase
2. Ejecuta este script:

```sql
-- Función para sincronizar usuario de auth.users a usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nombre, email, activo)
  VALUES (
    NEW.id::bigint,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET
    nombre = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', usuarios.nombre),
    email = NEW.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función cuando se crea un usuario en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## Paso 5: Actualizar permisos de la tabla usuarios

Para que la función pueda insertar en la tabla usuarios:

```sql
-- Permitir que la función inserte/actualice en usuarios
GRANT INSERT, UPDATE ON public.usuarios TO authenticated;
GRANT USAGE ON SEQUENCE usuarios_id_seq TO authenticated;

-- Opcional: Permitir que los usuarios lean su propia información
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON usuarios FOR SELECT
  USING (auth.uid() = id);
```

---

## Paso 6: Verificar configuración

1. En Supabase, ve a **Authentication** > **Providers**
2. Verifica que Google y GitHub estén habilitados (toggle verde)
3. Verifica que tengan Client ID y Client Secret configurados
4. Prueba haciendo clic en los botones de login en tu app

---

## Notas importantes

- **Desarrollo local**: Usa `http://localhost:3000` en las URLs de redirección
- **Producción**: Actualiza las URLs con tu dominio real
- **Client Secrets**: Nunca los compartas públicamente, están en las variables de entorno del servidor de Supabase
- **Testing**: Los usuarios se crearán automáticamente en la tabla `usuarios` cuando inicien sesión por primera vez

