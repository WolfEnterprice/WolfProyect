# 📚 Documentación Completa - Wolf Finance

Bienvenido a la documentación completa del proyecto **Wolf Finance**, un sistema de gestión financiera empresarial para dos socios.

---

## 📑 Índice

1. [Inicio Rápido](#inicio-rápido)
2. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
3. [Guías de Desarrollo](#guías-de-desarrollo)
4. [API y Servicios](#api-y-servicios)
5. [Componentes](#componentes)
6. [Hooks Personalizados](#hooks-personalizados)
7. [Configuración](#configuración)
8. [Despliegue](#despliegue)
9. [Troubleshooting](#troubleshooting)

---

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase
- API Key de Google Gemini (para el asistente IA)

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd WolfProyect

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar en desarrollo
npm run dev
```

### Variables de Entorno

Crear archivo `.env.local` en la raíz:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
NEXT_PUBLIC_GEMINI_API_KEY=tu_api_key_de_gemini
```

---

## 🏗️ Arquitectura del Proyecto

### Estructura de Directorios

```
WolfProyect/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   ├── auth/              # Autenticación
│   │   ├── login/             # Página de login
│   │   ├── movimientos/       # Gestión de movimientos
│   │   ├── proyectos/         # Gestión de proyectos
│   │   ├── pagos/             # Pagos entre socios
│   │   └── reportes/          # Reportes y análisis
│   ├── components/            # Componentes React
│   │   ├── auth/              # Componentes de autenticación
│   │   ├── charts/            # Gráficos (Recharts)
│   │   ├── forms/             # Formularios
│   │   ├── layout/            # Layout components
│   │   ├── tables/            # Componentes de tabla
│   │   └── ui/                # Componentes UI base
│   ├── contexts/              # React Contexts
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Librerías y configuraciones
│   ├── providers/             # Providers (React Query, etc.)
│   ├── services/              # Servicios y llamadas a API
│   ├── types/                 # TypeScript types
│   └── utils/                 # Utilidades
├── database/                  # Scripts SQL
├── public/                    # Archivos estáticos
└── docs/                      # Documentación
```

### Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth (OAuth + Email)
- **Estado del Servidor**: React Query (TanStack Query)
- **Gráficos**: Recharts
- **IA**: Google Gemini AI

---

## 📖 Guías de Desarrollo

### [Guía de Estilos y Convenciones](./ESTILOS.md)
- Convenciones de código
- Estructura de componentes
- Naming conventions
- Best practices

### [Guía de Componentes](./COMPONENTES.md)
- Cómo crear componentes
- Componentes disponibles
- Patrones de uso

### [Guía de API](./API.md)
- Endpoints disponibles
- Estructura de respuestas
- Manejo de errores

### [Guía de Base de Datos](./DATABASE.md)
- Esquema de base de datos
- Migraciones
- Queries comunes

---

## 🔧 Configuración

Ver [CONFIGURACION.md](./CONFIGURACION.md) para:
- Configuración de Supabase
- Configuración de OAuth
- Variables de entorno
- Configuración de desarrollo

---

## 📦 Scripts Disponibles

```bash
npm run dev      # Desarrollo (localhost:3000)
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Linter
```

---

## 🤝 Contribuir

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para:
- Proceso de contribución
- Estándares de código
- Pull requests
- Issues

---

## 📞 Soporte

Para dudas o problemas:
1. Revisar la documentación
2. Buscar en issues existentes
3. Crear un nuevo issue con detalles

---

**Última actualización**: Enero 2026

