# Freegents Finance - Sistema de Gestión Financiera

Sistema web interno de gestión financiera empresarial para dos socios.

## Stack Tecnológico

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Recharts** (Gráficos)
- **Supabase** (Base de datos y autenticación)

## Estructura del Proyecto

```
src/
 ├── app/              # App Router de Next.js
 ├── components/       # Componentes reutilizables
 ├── hooks/           # Custom hooks
 ├── services/        # Llamadas a la API
 ├── types/           # Tipos e interfaces TypeScript
 └── utils/           # Funciones utilitarias
```

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Construcción

```bash
npm run build
```

## Estructura de Datos

El sistema maneja las siguientes entidades:
- **Usuarios**: Socios del negocio
- **Proyectos**: Proyectos empresariales
- **Movimientos**: Ingresos y egresos
- **Categorías**: Categorías de movimientos
- **Repartos de Proyecto**: Porcentajes de reparto por socio
- **Pagos entre Socios**: Pagos realizados entre socios

## Configuración

Ver `SUPABASE_SETUP.md` para configurar la conexión con Supabase.

# WolfProyect
