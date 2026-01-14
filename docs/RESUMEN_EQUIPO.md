# 👥 Resumen para el Equipo - Wolf Finance

Bienvenido al proyecto **Wolf Finance**. Este documento es tu punto de partida.

---

## 🎯 ¿Qué es Wolf Finance?

Sistema web de gestión financiera empresarial para dos socios que permite:
- Gestionar ingresos y egresos
- Administrar proyectos con repartos por socio
- Realizar pagos entre socios
- Generar reportes y análisis financieros
- Consultar con asistente IA financiero

---

## 🚀 Inicio Rápido (5 minutos)

### 1. Clonar y Configurar

```bash
git clone <repository-url>
cd WolfProyect
npm install
```

### 2. Variables de Entorno

Crear `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key
NEXT_PUBLIC_GEMINI_API_KEY=tu_key (opcional)
```

### 3. Ejecutar

```bash
npm run dev
```

¡Listo! Abre http://localhost:3000

---

## 📚 Documentación Disponible

### Para Desarrolladores Nuevos

1. **[README Principal](./README.md)** - Visión general
2. **[Guía de Estilos](./ESTILOS.md)** - Cómo escribir código
3. **[Guía de Componentes](./COMPONENTES.md)** - Componentes disponibles
4. **[Guía de Hooks](./HOOKS.md)** - Hooks personalizados

### Para Desarrollo Avanzado

1. **[Guía de API](./API.md)** - Endpoints y servicios
2. **[Guía de Configuración](./CONFIGURACION.md)** - Setup completo

---

## 🏗️ Arquitectura en 30 Segundos

```
Frontend (Next.js) → React Query → Supabase → PostgreSQL
```

- **Frontend**: Next.js 14 con TypeScript
- **Estado**: React Query (caché inteligente)
- **Backend**: Supabase (PostgreSQL + Auth)
- **Estilos**: Tailwind CSS

---

## 🎨 Paleta de Colores

- **Primary (Azul)**: `#06b6d4` - Elementos principales
- **Teal**: `#14b8a6` - Ingresos/positivo
- **Lime**: `#84cc16` - Alertas/destacado
- **Red**: `#ef4444` - Egresos/error

**Regla**: No usar negro excepto para texto y nombre "Wolf"

---

## 🔑 Conceptos Clave

### React Query

```typescript
// ✅ Usar hooks de React Query
const { data, isLoading } = useMovimientos(filtros);

// ❌ NO usar useState + useEffect para datos del servidor
```

### Componentes

```typescript
// Estructura estándar
export default function ComponentName() {
  // 1. Hooks
  // 2. Funciones
  // 3. Render
}
```

### Estilos

```typescript
// Usar Tailwind, NO estilos inline
<div className="flex items-center p-4 bg-white rounded-lg">
```

---

## 📁 Estructura de Archivos Importante

```
src/
├── app/              # Páginas (Next.js App Router)
├── components/       # Componentes React
│   ├── ui/          # Componentes base (Button, Card, etc.)
│   └── layout/      # Layout components
├── hooks/           # Custom hooks (React Query)
├── services/        # Llamadas a API/Supabase
└── utils/           # Utilidades
```

---

## 🛠️ Comandos Útiles

```bash
npm run dev      # Desarrollo
npm run build    # Build producción
npm run lint     # Verificar código
```

---

## 🐛 Troubleshooting Común

### "Supabase URL not found"
→ Verificar `.env.local` existe y tiene las variables correctas

### "Module not found"
→ Ejecutar `npm install`

### "Error de autenticación"
→ Verificar credenciales de Supabase

---

## 📞 ¿Necesitas Ayuda?

1. **Revisar documentación** en `docs/`
2. **Buscar en código** - Usa Ctrl+Shift+F
3. **Preguntar al equipo** - Crea issue o pregunta en chat

---

## ✅ Checklist para Nuevos Desarrolladores

- [ ] Repositorio clonado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Variables de entorno configuradas
- [ ] Proyecto ejecutando (`npm run dev`)
- [ ] Leída la [Guía de Estilos](./ESTILOS.md)
- [ ] Revisados los componentes disponibles
- [ ] Entendido React Query básico

---

## 🎓 Recursos de Aprendizaje

- [Next.js Docs](https://nextjs.org/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 📝 Convenciones del Equipo

1. **Commits descriptivos**: `feat:`, `fix:`, `docs:`, etc.
2. **Pull Requests**: Siempre desde branch, nunca directo a main
3. **Code Review**: Todos los PRs requieren review
4. **Testing**: Agregar tests cuando sea posible
5. **Documentación**: Actualizar docs cuando cambies algo importante

---

## 🚀 Próximos Pasos

1. Explorar el código en `src/app/`
2. Ver componentes en `src/components/`
3. Probar hooks en `src/hooks/`
4. Leer documentación completa cuando tengas tiempo

---

**¡Bienvenido al equipo! 🐺**

---

**Última actualización**: Enero 2026

