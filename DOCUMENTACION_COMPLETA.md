# 📚 Documentación Completa - Wolf Finance

**Sistema de Gestión Financiera Empresarial**

---

## 📑 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Inicio Rápido](#inicio-rápido)
3. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
4. [Stack Tecnológico](#stack-tecnológico)
5. [Estructura de Directorios](#estructura-de-directorios)
6. [Guías de Desarrollo](#guías-de-desarrollo)
7. [API y Servicios](#api-y-servicios)
8. [Componentes](#componentes)
9. [Base de Datos](#base-de-datos)
10. [Configuración](#configuración)
11. [Despliegue](#despliegue)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 Introducción

**Wolf Finance** es un sistema web interno de gestión financiera empresarial diseñado para dos socios. Permite gestionar ingresos, egresos, proyectos, pagos entre socios y generar reportes financieros con la ayuda de un asistente IA.

### Características Principales

- ✅ Dashboard con métricas en tiempo real
- ✅ Gestión completa de movimientos (ingresos/egresos)
- ✅ Administración de proyectos con repartos por socio
- ✅ Sistema de pagos entre socios
- ✅ Reportes y análisis con gráficos interactivos
- ✅ Asistente IA financiero integrado
- ✅ Autenticación OAuth (Google, GitHub)
- ✅ Optimizado para alto rendimiento

---

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js 18 o superior
- npm o yarn
- Cuenta de Supabase
- Git

### Instalación Paso a Paso

```bash
# 1. Clonar el repositorio
git clone https://github.com/WolfEnterprice/WolfProyect.git
cd WolfProyect

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# Crear archivo .env.local en la raíz del proyecto
cp .env.example .env.local  # Si existe
# Editar .env.local con tus credenciales

# 4. Ejecutar en desarrollo
npm run dev
```

### Variables de Entorno Necesarias

Crear archivo `.env.local`:

```env
# Supabase (Obligatorio)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui

# Google Gemini AI (Opcional - para asistente IA)
NEXT_PUBLIC_GEMINI_API_KEY=tu_api_key_aqui
```

### Primer Inicio

1. Ejecutar `npm run dev`
2. Abrir http://localhost:3000
3. Iniciar sesión con Google/GitHub o email
4. ¡Listo para usar!

---

## 🏗️ Arquitectura del Proyecto

### Arquitectura General

```
┌─────────────────┐
│   Next.js 14    │  Frontend (App Router)
│   React 18      │
│   TypeScript    │
└────────┬────────┘
         │
    ┌────▼────────────────┐
    │  React Query        │  Caché y Estado del Servidor
    │  (TanStack Query)   │
    └────┬────────────────┘
         │
    ┌────▼────────────────┐
    │  API Routes         │  Next.js API Routes
    │  (Next.js)          │
    └────┬────────────────┘
         │
    ┌────▼────────────────┐
    │  Supabase           │  Backend (PostgreSQL + Auth)
    │  PostgreSQL         │
    └─────────────────────┘
```

### Flujo de Datos

1. **Usuario interactúa** → Componente React
2. **Componente** → Hook (useMovimientos, useDashboard, etc.)
3. **Hook** → React Query (verifica caché)
4. **Si no está en caché** → API Route (Next.js)
5. **API Route** → Supabase (PostgreSQL)
6. **Respuesta** → Caché en React Query → Componente

---

## 🛠️ Stack Tecnológico

### Frontend

- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **React 18** - Librería UI
- **Tailwind CSS** - Estilos utilitarios
- **React Query (TanStack Query)** - Gestión de estado del servidor
- **Recharts** - Gráficos y visualizaciones

### Backend

- **Supabase** - Backend as a Service
- **PostgreSQL** - Base de datos relacional
- **Supabase Auth** - Autenticación y autorización
- **Next.js API Routes** - Endpoints de API

### Herramientas

- **Git** - Control de versiones
- **ESLint** - Linter de código
- **PostCSS** - Procesamiento de CSS
- **Autoprefixer** - Compatibilidad de CSS

### Integraciones

- **Google Gemini AI** - Asistente IA financiero
- **OAuth** - Autenticación con Google/GitHub

---

## 📁 Estructura de Directorios

```
WolfProyect/
├── public/                    # Archivos estáticos
│   └── icons/                # Iconos y imágenes
│       └── icono.png         # Logo de Wolf
│
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # API Routes
│   │   │   ├── auth/         # Autenticación
│   │   │   ├── categorias/   # Categorías
│   │   │   ├── dashboard/    # Dashboard
│   │   │   ├── movimientos/  # Movimientos
│   │   │   ├── pagos-socios/ # Pagos
│   │   │   ├── proyectos/    # Proyectos
│   │   │   └── reportes/     # Reportes
│   │   │
│   │   ├── auth/             # Callback OAuth
│   │   ├── login/            # Página de login
│   │   ├── movimientos/      # Gestión de movimientos
│   │   ├── proyectos/        # Gestión de proyectos
│   │   ├── pagos/            # Pagos entre socios
│   │   ├── reportes/         # Reportes y análisis
│   │   ├── layout.tsx        # Layout principal
│   │   ├── page.tsx          # Dashboard
│   │   └── globals.css       # Estilos globales
│   │
│   ├── components/           # Componentes React
│   │   ├── auth/             # Componentes de autenticación
│   │   ├── charts/           # Gráficos (Recharts)
│   │   ├── forms/            # Formularios
│   │   ├── layout/           # Componentes de layout
│   │   │   ├── MainLayout.tsx
│   │   │   └── Navbar.tsx
│   │   ├── tables/           # Componentes de tabla
│   │   ├── ui/               # Componentes UI base
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Select.tsx
│   │   ├── AsistenteIA.jsx   # Asistente IA
│   │   └── BotonAsistenteIA.jsx
│   │
│   ├── contexts/             # React Contexts
│   │   ├── AuthContext.tsx   # Contexto de autenticación
│   │   └── PreferenciasContext.jsx
│   │
│   ├── hooks/                # Custom Hooks
│   │   ├── useDashboard.ts   # Hook para dashboard
│   │   ├── useMovimientos.ts # Hooks para movimientos
│   │   ├── useProyectos.ts   # Hooks para proyectos
│   │   ├── usePagos.ts       # Hooks para pagos
│   │   ├── useReportes.ts    # Hooks para reportes
│   │   └── useData.ts        # Hook genérico (legacy)
│   │
│   ├── lib/                  # Librerías y configuraciones
│   │   ├── supabase.ts       # Cliente de Supabase
│   │   └── database.types.ts # Tipos de base de datos
│   │
│   ├── providers/            # Providers de React
│   │   └── QueryProvider.tsx # Provider de React Query
│   │
│   ├── services/             # Servicios y llamadas a API
│   │   ├── supabase/         # Servicios de Supabase
│   │   │   ├── auth.ts
│   │   │   ├── categorias.ts
│   │   │   ├── dashboard.ts
│   │   │   ├── movimientos.ts
│   │   │   ├── pagos.ts
│   │   │   ├── proyectos.ts
│   │   │   ├── reportes.ts
│   │   │   └── usuarios.ts
│   │   ├── dashboard.ts      # Re-exporta desde supabase/
│   │   ├── movimientos.ts
│   │   ├── proyectos.ts
│   │   ├── pagos.ts
│   │   └── reportes.ts
│   │
│   ├── types/                # TypeScript Types
│   │   └── index.ts          # Tipos e interfaces
│   │
│   └── utils/                # Utilidades
│       ├── constants.ts      # Constantes
│       ├── format.ts         # Funciones de formato
│       └── debounce.ts       # Función debounce
│
├── database/                 # Scripts SQL
│   ├── schema_supabase.sql   # Esquema para Supabase
│   ├── schema_mysql.sql      # Esquema para MySQL
│   ├── schema.sql            # Esquema genérico
│   ├── auth_setup.sql        # Setup de autenticación
│   └── README.md
│
├── docs/                     # Documentación detallada
│   ├── README.md
│   ├── ESTILOS.md
│   ├── COMPONENTES.md
│   ├── API.md
│   ├── HOOKS.md
│   ├── CONFIGURACION.md
│   └── RESUMEN_EQUIPO.md
│
├── .env.local                # Variables de entorno (no commitear)
├── .gitignore
├── next.config.js            # Configuración de Next.js
├── package.json
├── tailwind.config.ts        # Configuración de Tailwind
├── tsconfig.json             # Configuración de TypeScript
│
└── README.md                 # README principal
```

---

## 📖 Guías de Desarrollo

### Convenciones de Código

Ver **[docs/ESTILOS.md](./docs/ESTILOS.md)** para:
- Convenciones de nomenclatura
- Estructura de componentes
- Estilos con Tailwind
- Mejores prácticas

### Componentes

Ver **[docs/COMPONENTES.md](./docs/COMPONENTES.md)** para:
- Lista completa de componentes
- Uso de cada componente
- Props y ejemplos
- Crear nuevos componentes

### Hooks Personalizados

Ver **[docs/HOOKS.md](./docs/HOOKS.md)** para:
- Hooks disponibles (React Query)
- Uso y ejemplos
- Crear nuevos hooks

---

## 🔌 API y Servicios

### Endpoints Disponibles

Ver **[docs/API.md](./docs/API.md)** para documentación completa de:
- Autenticación (`/api/auth/*`)
- Dashboard (`/api/dashboard`)
- Movimientos (`/api/movimientos`)
- Proyectos (`/api/proyectos`)
- Pagos (`/api/pagos-socios`)
- Reportes (`/api/reportes/*`)
- Categorías (`/api/categorias`)

### Uso con React Query

```typescript
// Ejemplo: Obtener movimientos
import { useMovimientos } from '@/hooks/useMovimientos';

function MovimientosPage() {
  const { data, isLoading, error } = useMovimientos({
    tipo: 'ingreso',
    fechaDesde: '2026-01-01'
  });
  
  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {data.map(m => (
        <div key={m.id}>{m.descripcion}</div>
      ))}
    </div>
  );
}
```

---

## 🎨 Componentes Principales

### Componentes UI Base

- **Button** - Botones con variantes
- **Card** - Contenedor con sombra
- **Input** - Campos de entrada
- **Select** - Dropdowns
- **Modal** - Modales reutilizables
- **Badge** - Etiquetas de estado

### Componentes de Layout

- **MainLayout** - Layout principal con navbar
- **Navbar** - Barra de navegación

### Componentes Especiales

- **AsistenteIA** - Chat con asistente IA
- **IngresosVsEgresosChart** - Gráfico de ingresos vs egresos
- **GananciaPorProyectoChart** - Gráfico de ganancia por proyecto

Ver **[docs/COMPONENTES.md](./docs/COMPONENTES.md)** para documentación completa.

---

## 🗄️ Base de Datos

### Esquema de Base de Datos

**Entidades principales:**

1. **usuarios** - Socios del negocio
2. **categorias** - Categorías de movimientos
3. **proyectos** - Proyectos empresariales
4. **movimientos** - Ingresos y egresos
5. **repartos_proyecto** - Repartos por socio
6. **pagos_socios** - Pagos entre socios

### Scripts SQL

- `database/schema_supabase.sql` - Para Supabase (PostgreSQL)
- `database/schema_mysql.sql` - Para MySQL/MariaDB
- `database/auth_setup.sql` - Setup de autenticación

Ver **[database/README.md](./database/README.md)** para más detalles.

---

## ⚙️ Configuración

### Variables de Entorno

Ver **[docs/CONFIGURACION.md](./docs/CONFIGURACION.md)** para:
- Configuración de Supabase
- Configuración de OAuth
- Variables de entorno completas
- Setup paso a paso

### Configuración de Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ejecutar script SQL (`database/schema_supabase.sql`)
3. Configurar OAuth (Google/GitHub)
4. Obtener URL y anon key

Ver **SUPABASE_SETUP.md** y **SUPABASE_AUTH_SETUP.md** para guías detalladas.

---

## 🚀 Despliegue

### Opciones de Despliegue

1. **Vercel** (Recomendado para Next.js)
   - Conectar repositorio
   - Configurar variables de entorno
   - Deploy automático

2. **Netlify**
   - Similar a Vercel
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Otros proveedores**
   - AWS Amplify
   - Railway
   - Render

### Checklist de Despliegue

- [ ] Variables de entorno configuradas
- [ ] Base de datos migrada
- [ ] OAuth configurado
- [ ] Build exitoso (`npm run build`)
- [ ] Pruebas de funcionalidad
- [ ] SSL/HTTPS habilitado
- [ ] Dominio configurado

---

## 🐛 Troubleshooting

### Problemas Comunes

#### Error: "Supabase URL not found"

**Solución:**
- Verificar que `.env.local` existe
- Verificar variable `NEXT_PUBLIC_SUPABASE_URL`
- Reiniciar servidor de desarrollo

#### Error: "Invalid API key"

**Solución:**
- Verificar formato de API key
- Verificar permisos en Supabase
- Verificar que no tenga espacios

#### Error: "Database connection failed"

**Solución:**
- Verificar credenciales de Supabase
- Verificar que las tablas existan
- Verificar políticas RLS en Supabase

#### Error: "Module not found"

**Solución:**
```bash
npm install
```

#### Build Falla

**Solución:**
```bash
rm -rf .next node_modules
npm install
npm run build
```

---

## 📊 Optimizaciones de Rendimiento

El proyecto está optimizado con:

- **React Query** - Caché inteligente (70-80% menos llamadas API)
- **Lazy Loading** - Componentes pesados cargados bajo demanda
- **Memoización** - useMemo y useCallback para optimizar renders
- **Code Splitting** - Bundle dividido automáticamente

Ver **[OPTIMIZACIONES_RENDIMIENTO.md](./OPTIMIZACIONES_RENDIMIENTO.md)** para más detalles.

---

## 🎨 Paleta de Colores

- **Primary (Azul)**: `#06b6d4` - Elementos principales
- **Teal**: `#14b8a6` - Ingresos/positivo
- **Lime**: `#84cc16` - Alertas/destacado
- **Red**: `#ef4444` - Egresos/error

**Regla importante**: No usar negro excepto para texto y nombre "Wolf"

---

## 📝 Scripts Disponibles

```bash
npm run dev      # Desarrollo (localhost:3000)
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Verificar código con ESLint
```

---

## 🤝 Contribuir

### Proceso de Contribución

1. Crear branch desde `main`
2. Hacer cambios
3. Commits descriptivos (feat:, fix:, docs:, etc.)
4. Crear Pull Request
5. Code review
6. Merge a `main`

### Estándares de Código

- Seguir [Guía de Estilos](./docs/ESTILOS.md)
- TypeScript para tipado
- ESLint para calidad de código
- Commits descriptivos

---

## 📚 Recursos Adicionales

### Documentación del Proyecto

- [README Principal](./README.md)
- [Estado del Proyecto](./ESTADO_PROYECTO.md)
- [Optimizaciones](./OPTIMIZACIONES_RENDIMIENTO.md)
- [Docs Detalladas](./docs/)

### Documentación Externa

- [Next.js Docs](https://nextjs.org/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 👥 Para Nuevos Miembros del Equipo

**👉 Ver [docs/RESUMEN_EQUIPO.md](./docs/RESUMEN_EQUIPO.md) para:**
- Inicio rápido (5 minutos)
- Conceptos clave
- Checklist para nuevos desarrolladores
- Recursos de aprendizaje

---

## 📞 Soporte y Contacto

### Para Problemas

1. Revisar esta documentación
2. Revisar documentación en `docs/`
3. Buscar en issues existentes
4. Crear nuevo issue con detalles

### Para Preguntas

- Consultar documentación primero
- Preguntar al equipo
- Revisar código existente

---

## ✅ Checklist de Proyecto

- [x] Documentación completa
- [x] Código optimizado
- [x] Base de datos configurada
- [x] Autenticación funcionando
- [x] Todos los features implementados
- [x] Tests (pendiente)
- [x] CI/CD (pendiente)

---

## 📅 Historial de Versiones

### v1.0.0 (Enero 2026)

- Rebranding completo a "Wolf"
- Nueva paleta de colores
- Optimizaciones de rendimiento con React Query
- Documentación completa
- Lazy loading implementado
- Hooks optimizados

---

**Última actualización**: Enero 2026

**Versión**: 1.0.0

---

🐺 **Wolf Finance** - Sistema de Gestión Financiera Empresarial

