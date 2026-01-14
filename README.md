# 🐺 Wolf Finance - Sistema de Gestión Financiera

Sistema web interno de gestión financiera empresarial para dos socios, desarrollado con tecnologías modernas y optimizado para rendimiento.

---

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Ejecutar en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📚 Documentación Completa

**👉 Ver la [documentación completa](./docs/README.md) para:**
- Guías de desarrollo
- API y servicios
- Componentes disponibles
- Hooks personalizados
- Configuración detallada

### Documentación Disponible

- 📖 [Guía Principal](./docs/README.md) - Índice completo
- 🎨 [Guía de Estilos](./docs/ESTILOS.md) - Convenciones de código
- 🧩 [Guía de Componentes](./docs/COMPONENTES.md) - Componentes disponibles
- 🔌 [Guía de API](./docs/API.md) - Endpoints y servicios
- 🪝 [Guía de Hooks](./docs/HOOKS.md) - Hooks personalizados
- ⚙️ [Guía de Configuración](./docs/CONFIGURACION.md) - Setup completo

---

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth (OAuth + Email)
- **Estado del Servidor**: React Query (TanStack Query)
- **Gráficos**: Recharts
- **IA**: Google Gemini AI

---

## ✨ Características Principales

- ✅ **Dashboard** con métricas financieras en tiempo real
- ✅ **Gestión de Movimientos** (ingresos y egresos)
- ✅ **Gestión de Proyectos** con repartos por socio
- ✅ **Pagos entre Socios** con seguimiento de estado
- ✅ **Reportes y Análisis** con gráficos interactivos
- ✅ **Asistente IA** financiero integrado
- ✅ **Autenticación OAuth** (Google, GitHub)
- ✅ **Optimizado para Rendimiento** con React Query y lazy loading

---

## 📦 Scripts Disponibles

```bash
npm run dev      # Desarrollo (localhost:3000)
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Linter
```

---

## 🏗️ Estructura del Proyecto

```
WolfProyect/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   ├── movimientos/       # Gestión de movimientos
│   │   ├── proyectos/         # Gestión de proyectos
│   │   ├── pagos/             # Pagos entre socios
│   │   └── reportes/          # Reportes y análisis
│   ├── components/            # Componentes React
│   ├── hooks/                 # Custom hooks (React Query)
│   ├── providers/             # Providers (QueryProvider)
│   ├── services/              # Servicios y llamadas a API
│   └── utils/                 # Utilidades
├── database/                  # Scripts SQL
├── docs/                      # Documentación completa
└── public/                    # Archivos estáticos
```

---

## 🔐 Configuración

### Variables de Entorno Requeridas

Crear `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
NEXT_PUBLIC_GEMINI_API_KEY=tu_api_key_de_gemini (opcional)
```

Ver [Guía de Configuración](./docs/CONFIGURACION.md) para más detalles.

---

## 📊 Estructura de Datos

El sistema maneja las siguientes entidades:
- **Usuarios**: Socios del negocio
- **Proyectos**: Proyectos empresariales
- **Movimientos**: Ingresos y egresos
- **Categorías**: Categorías de movimientos
- **Repartos de Proyecto**: Porcentajes de reparto por socio
- **Pagos entre Socios**: Pagos realizados entre socios

---

## 🚀 Optimizaciones de Rendimiento

- ⚡ **React Query** para caché inteligente
- ⚡ **Lazy Loading** de componentes pesados
- ⚡ **Memoización** de cálculos costosos
- ⚡ **Code Splitting** automático

Ver [OPTIMIZACIONES_RENDIMIENTO.md](./OPTIMIZACIONES_RENDIMIENTO.md) para más detalles.

---

## 📖 Documentación Adicional

- [Estado del Proyecto](./ESTADO_PROYECTO.md) - Funcionalidades y pendientes
- [Configuración de Supabase](./SUPABASE_SETUP.md) - Setup de base de datos
- [Configuración de OAuth](./SUPABASE_AUTH_SETUP.md) - Autenticación OAuth
- [Guía OAuth Paso a Paso](./GUIA_OAUTH_PASO_A_PASO.md) - Tutorial detallado

---

## 🤝 Contribuir

1. Leer la [Guía de Estilos](./docs/ESTILOS.md)
2. Crear branch desde `main`
3. Hacer cambios y commits descriptivos
4. Crear Pull Request

---

## 📞 Soporte

Para dudas o problemas:
1. Revisar la documentación en `docs/`
2. Buscar en issues existentes
3. Crear un nuevo issue con detalles

---

## 📄 Licencia

Proyecto privado - Todos los derechos reservados

---

**Última actualización**: Enero 2026
