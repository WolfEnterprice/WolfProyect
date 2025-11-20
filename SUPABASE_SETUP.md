# Configuración de Supabase - Pasos a Seguir

## 1. Crear el archivo .env

Crea un archivo `.env` en la raíz del proyecto con:

```env
VITE_SUPABASE_URL=https://xcbtuznihpgllhwijmkr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjYnR1em5paHBnbGxod2lqbWtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NTk1ODcsImV4cCI6MjA3OTIzNTU4N30.GSBXgJJjixRKARKVcA9ueDuhG47sGgsdxjyLOMxGVRI
```

## 2. Instalar dependencias

```bash
npm install
```

## 3. Crear las tablas en Supabase

Ve al SQL Editor de Supabase y ejecuta el contenido del archivo `supabase-schema.sql`

**IMPORTANTE**: Si NO vas a usar autenticación (solo un usuario), modifica el SQL eliminando:
- Las columnas `user_id` de todas las tablas
- Las referencias a `auth.users`
- Las políticas RLS

## 4. Estructura de las Tablas

### ingresos
```sql
id (UUID, PRIMARY KEY)
fecha (DATE)
descripcion (TEXT)
categoria (TEXT)
monto (NUMERIC)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### gastos
```sql
id (UUID, PRIMARY KEY)
fecha (DATE)
descripcion (TEXT)
categoria (TEXT)
monto (NUMERIC)
metodo_pago (TEXT)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### presupuestos
```sql
id (UUID, PRIMARY KEY)
categoria (TEXT, UNIQUE)
presupuesto (NUMERIC)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### ahorro
```sql
id (UUID, PRIMARY KEY)
ahorro_actual (NUMERIC)
ahorro_meta (NUMERIC)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

## 5. Servicios Creados

Ya están creados los servicios en:
- `src/services/ingresosService.js`
- `src/services/gastosService.js`
- `src/services/presupuestosService.js`
- `src/services/ahorroService.js`

## 6. Próximos Pasos

Ahora necesitas actualizar los componentes para usar estos servicios en lugar de los datos mock. Los servicios ya están listos para usar.

