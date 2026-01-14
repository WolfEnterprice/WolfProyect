# ⚙️ Guía de Configuración

Configuración completa del proyecto Wolf Finance.

---

## 🔐 Variables de Entorno

Crear archivo `.env.local` en la raíz del proyecto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui

# Google Gemini AI (Opcional - para asistente IA)
NEXT_PUBLIC_GEMINI_API_KEY=tu_api_key_aqui

# API Base URL (Opcional - por defecto usa /api)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

### Obtener Credenciales

#### Supabase

1. Crear cuenta en [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Ir a **Settings** > **API**
4. Copiar:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Google Gemini

1. Ir a [Google AI Studio](https://aistudio.google.com/apikey)
2. Crear nueva API key
3. Copiar → `NEXT_PUBLIC_GEMINI_API_KEY`

---

## 🗄️ Configuración de Base de Datos

### 1. Ejecutar Scripts SQL

Ir a Supabase Dashboard > **SQL Editor** y ejecutar:

1. `database/schema_supabase.sql` - Esquema completo
2. `database/auth_setup.sql` - Configuración de autenticación (si es necesario)

### 2. Verificar Tablas Creadas

Deberías tener estas tablas:
- `usuarios`
- `categorias`
- `proyectos`
- `movimientos`
- `repartos_proyecto`
- `pagos_socios`

### 3. Crear Vistas (Opcional)

Las vistas mejoran el rendimiento:
- `v_movimientos_detallados` - Movimientos con relaciones

---

## 🔑 Configuración de OAuth

### Google OAuth

Ver guía completa en: `SUPABASE_AUTH_SETUP.md`

**Resumen:**
1. Crear proyecto en Google Cloud Console
2. Configurar OAuth consent screen
3. Crear OAuth client ID
4. Agregar redirect URIs en Supabase
5. Configurar en Supabase Dashboard

### GitHub OAuth

1. Ir a GitHub Settings > Developer settings > OAuth Apps
2. Crear nueva OAuth App
3. Agregar redirect URI: `https://tu-proyecto.supabase.co/auth/v1/callback`
4. Copiar Client ID y Secret
5. Configurar en Supabase Dashboard

---

## 🎨 Configuración de Tailwind CSS

El proyecto ya está configurado con Tailwind. Los colores personalizados están en:

**`tailwind.config.ts`**

```typescript
colors: {
  primary: { /* Azules */ },
  teal: { /* Teals */ },
  lime: { /* Verde lima */ },
  wolf: { /* Colores específicos Wolf */ }
}
```

### Personalizar Colores

Editar `tailwind.config.ts` y `src/app/globals.css`

---

## 📦 Configuración de Next.js

### `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['tu-dominio.com'],
  },
}

module.exports = nextConfig
```

---

## 🔧 Configuración de TypeScript

### `tsconfig.json`

Ya configurado con:
- Path aliases (`@/` → `src/`)
- Strict mode
- Next.js optimizations

---

## 🚀 Configuración de Desarrollo

### VS Code (Recomendado)

**Extensiones recomendadas:**
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

**Settings (`.vscode/settings.json`):**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

---

## 🧪 Configuración de Testing (Futuro)

### Jest + React Testing Library

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

**`jest.config.js`:**
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}
```

---

## 📊 Configuración de React Query

Ya configurado en `src/providers/QueryProvider.tsx`

**Ajustar configuración:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // Ajustar tiempo de caché
      gcTime: 5 * 60 * 1000,       // Ajustar tiempo de garbage collection
      refetchOnWindowFocus: false,   // Cambiar a true si se necesita
      retry: 1,                     // Ajustar reintentos
    },
  },
});
```

---

## 🗂️ Configuración de Estructura de Archivos

### Path Aliases

Ya configurado en `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Uso:**
```typescript
import Button from '@/components/ui/Button';
import { useMovimientos } from '@/hooks/useMovimientos';
```

---

## 🔍 Configuración de Linting

### ESLint

Ya configurado con Next.js ESLint config.

**Ejecutar:**
```bash
npm run lint
```

**Auto-fix:**
```bash
npm run lint -- --fix
```

---

## 📱 Configuración de PWA (Futuro)

### next-pwa

```bash
npm install next-pwa
```

**`next.config.js`:**
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA(nextConfig);
```

---

## 🌐 Configuración de Dominio

### Vercel (Recomendado)

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático

### Otros Proveedores

- Netlify
- AWS Amplify
- Railway
- Render

---

## 🔒 Configuración de Seguridad

### Headers de Seguridad

Agregar en `next.config.js`:

```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
      ],
    },
  ];
}
```

---

## 📝 Checklist de Configuración

- [ ] Variables de entorno configuradas
- [ ] Base de datos creada y migrada
- [ ] OAuth configurado (Google/GitHub)
- [ ] Supabase conectado
- [ ] API keys configuradas
- [ ] Dominio configurado (producción)
- [ ] SSL/HTTPS habilitado (producción)
- [ ] Variables de entorno en producción
- [ ] Backup de base de datos configurado

---

## 🆘 Troubleshooting

### Error: "Supabase URL not found"

- Verificar `.env.local` existe
- Verificar variable `NEXT_PUBLIC_SUPABASE_URL`
- Reiniciar servidor de desarrollo

### Error: "Invalid API key"

- Verificar que la API key sea correcta
- Verificar que tenga los permisos necesarios
- Verificar formato (sin espacios)

### Error: "Database connection failed"

- Verificar credenciales de Supabase
- Verificar que las tablas existan
- Verificar políticas RLS en Supabase

---

**Última actualización**: Enero 2026

