# Guía Completa: Configurar OAuth con Google y GitHub en Supabase

## 📋 Resumen

Esta guía te llevará paso a paso para configurar autenticación OAuth con Google y GitHub en tu aplicación usando Supabase.

---

## 🔧 Paso 1: Configurar Google OAuth

### 1.1. Crear proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **APIs & Services** > **Credentials**
4. Haz clic en **Create Credentials** > **OAuth client ID**

### 1.2. Configurar OAuth Consent Screen (primera vez)

1. Si es la primera vez, configura la pantalla de consentimiento:
   - Tipo: **External** (para desarrollo)
   - App name: "Wolf"
   - User support email: tu email
   - Developer contact: tu email
   - Haz clic en **Save and Continue**
2. En Scopes, haz clic en **Add or Remove Scopes**
   - Selecciona: `.../auth/userinfo.email` y `.../auth/userinfo.profile`
   - Haz clic en **Update** y luego **Save and Continue**
3. En Test users (si estás en modo testing):
   - Agrega tu email como usuario de prueba
   - Haz clic en **Save and Continue**

### 1.3. Crear OAuth Client ID

1. Haz clic en **Create Credentials** > **OAuth client ID**
2. Tipo de aplicación: **Web application**
3. Nombre: "Wolf Web"
4. **Authorized JavaScript origins**:
   ```
   https://jnykzalzjhupwoumhgus.supabase.co
   http://localhost:3000
   ```
5. **Authorized redirect URIs**:
   ```
   https://jnykzalzjhupwoumhgus.supabase.co/auth/v1/callback
   ```
6. Haz clic en **Create**
7. **COPIA** el **Client ID** y **Client Secret**

### 1.4. Configurar en Supabase

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Ve a **Authentication** > **Providers**
3. Busca **Google** y haz clic en el toggle para habilitarlo
4. Pega el **Client ID** de Google
5. Pega el **Client Secret** de Google
6. Haz clic en **Save**

---

## 🐙 Paso 2: Configurar GitHub OAuth

### 2.1. Crear OAuth App en GitHub

1. Ve a [GitHub Settings > Developer settings](https://github.com/settings/developers)
2. Haz clic en **OAuth Apps** en el menú lateral
3. Haz clic en **New OAuth App**
4. Completa el formulario:
   - **Application name**: `Wolf`
   - **Homepage URL**: `http://localhost:3000` (o tu dominio de producción)
   - **Authorization callback URL**: 
     ```
     https://jnykzalzjhupwoumhgus.supabase.co/auth/v1/callback
     ```
5. Haz clic en **Register application**
6. **COPIA** el **Client ID**
7. Haz clic en **Generate a new client secret**
8. **COPIA** el **Client Secret** (solo se muestra una vez)

### 2.2. Configurar en Supabase

1. En Supabase, ve a **Authentication** > **Providers**
2. Busca **GitHub** y haz clic en el toggle para habilitarlo
3. Pega el **Client ID** de GitHub
4. Pega el **Client Secret** de GitHub
5. Haz clic en **Save**

---

## ⚙️ Paso 3: Configurar URL de redirección en Supabase

1. En Supabase, ve a **Authentication** > **URL Configuration**
2. En **Redirect URLs**, agrega:
   ```
   http://localhost:3000/**
   https://tu-dominio.com/**  (cuando tengas dominio de producción)
   ```
3. Haz clic en **Save**

---

## 🗄️ Paso 4: Configurar base de datos

### Opción A: Base de datos nueva (recomendado)

1. Ve al **SQL Editor** en Supabase
2. Ejecuta el script `database/schema_supabase.sql` (ya actualizado para UUID)
3. Ejecuta el script `database/auth_setup.sql`

### Opción B: Base de datos existente

1. Si ya tienes datos, ejecuta primero `database/migrate_to_uuid.sql`
2. Luego ejecuta `database/auth_setup.sql`

---

## 📦 Paso 5: Instalar dependencias y configurar

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Verifica que tienes `.env.local` con:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://jnykzalzjhupwoumhgus.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_msq5jRMjkiPnQYDCjqK6pw_mmVx28Hy
   ```

---

## ✅ Paso 6: Probar la autenticación

1. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Ve a `http://localhost:3000/login`

3. Haz clic en "Continuar con Google" o "Continuar con GitHub"

4. Completa el proceso de autenticación

5. Deberías ser redirigido al dashboard

---

## 🐛 Solución de problemas

### Error: "redirect_uri_mismatch"
- Verifica que la URL de callback en Google/GitHub sea exactamente: `https://jnykzalzjhupwoumhgus.supabase.co/auth/v1/callback`
- Verifica que hayas agregado `http://localhost:3000/**` en Redirect URLs de Supabase

### Error: "Usuario no encontrado en la base de datos"
- Verifica que ejecutaste `auth_setup.sql`
- Verifica que el trigger esté funcionando: revisa la tabla `usuarios` después de iniciar sesión
- Espera unos segundos, el trigger puede tardar un poco

### Error: "permission denied"
- Verifica que las políticas RLS estén configuradas correctamente
- Temporalmente puedes deshabilitar RLS para probar:
  ```sql
  ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
  ```

### Google dice "App not verified"
- Para desarrollo, agrega tu email como usuario de prueba en Google Cloud Console
- Para producción, necesitarás verificar tu app con Google

---

## 📝 Notas importantes

1. **Desarrollo local**: Las URLs de redirección deben incluir `http://localhost:3000`
2. **Producción**: Actualiza las URLs con tu dominio real
3. **Client Secrets**: Nunca los compartas públicamente
4. **Primera vez**: Los usuarios se crearán automáticamente en la tabla `usuarios` cuando inicien sesión
5. **UUID vs BIGINT**: El schema ahora usa UUID para que coincida con `auth.users.id`

---

## 🎉 ¡Listo!

Ya tienes autenticación OAuth configurada. Los usuarios pueden iniciar sesión con Google o GitHub, y se crearán automáticamente en tu base de datos.

