-- Esquema de base de datos para Gestor de Finanzas
-- Ejecuta estos comandos en el SQL Editor de Supabase

-- 1. Tabla de INGRESOS
CREATE TABLE IF NOT EXISTS ingresos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL,
  descripcion TEXT NOT NULL,
  categoria TEXT NOT NULL,
  monto BIGINT NOT NULL CHECK (monto >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE -- Si usas autenticación
);

-- 2. Tabla de GASTOS
CREATE TABLE IF NOT EXISTS gastos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL,
  descripcion TEXT NOT NULL,
  categoria TEXT NOT NULL,
  monto BIGINT NOT NULL CHECK (monto >= 0),
  metodo_pago TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE -- Si usas autenticación
);

-- 3. Tabla de PRESUPUESTOS (por categoría)
CREATE TABLE IF NOT EXISTS presupuestos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria TEXT NOT NULL UNIQUE,
  presupuesto BIGINT NOT NULL CHECK (presupuesto >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE -- Si usas autenticación
);

-- 4. Tabla de AHORRO (una fila por usuario)
CREATE TABLE IF NOT EXISTS ahorro (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ahorro_actual BIGINT NOT NULL DEFAULT 0 CHECK (ahorro_actual >= 0),
  ahorro_meta BIGINT NOT NULL DEFAULT 0 CHECK (ahorro_meta >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE -- Si usas autenticación
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_ingresos_fecha ON ingresos(fecha);
CREATE INDEX IF NOT EXISTS idx_ingresos_categoria ON ingresos(categoria);
CREATE INDEX IF NOT EXISTS idx_gastos_fecha ON gastos(fecha);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria ON gastos(categoria);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_ingresos_updated_at BEFORE UPDATE ON ingresos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gastos_updated_at BEFORE UPDATE ON gastos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presupuestos_updated_at BEFORE UPDATE ON presupuestos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ahorro_updated_at BEFORE UPDATE ON ahorro
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS (Row Level Security) - Descomenta si usas autenticación
-- ALTER TABLE ingresos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE presupuestos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ahorro ENABLE ROW LEVEL SECURITY;

-- Políticas para que cada usuario solo vea sus propios datos
-- CREATE POLICY "Users can view own ingresos" ON ingresos
--   FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can insert own ingresos" ON ingresos
--   FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update own ingresos" ON ingresos
--   FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY "Users can delete own ingresos" ON ingresos
--   FOR DELETE USING (auth.uid() = user_id);

-- Repite las políticas para gastos, presupuestos y ahorro...

