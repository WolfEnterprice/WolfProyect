-- ============================================================================
-- Script de migración: Cambiar IDs de usuarios a UUID para OAuth
-- ============================================================================
-- EJECUTA ESTO ANTES de configurar OAuth si ya tienes datos
-- Si es una base de datos nueva, modifica schema_supabase.sql directamente
-- ============================================================================

-- IMPORTANTE: Haz un backup antes de ejecutar esto

-- Paso 1: Actualizar foreign keys para permitir UUID
ALTER TABLE movimientos 
  DROP CONSTRAINT IF EXISTS fk_movimiento_creado_por,
  ALTER COLUMN creado_por TYPE uuid USING creado_por::text::uuid;

ALTER TABLE repartos_proyecto 
  DROP CONSTRAINT IF EXISTS fk_reparto_usuario,
  ALTER COLUMN usuario_id TYPE uuid USING usuario_id::text::uuid;

ALTER TABLE pagos_socios 
  DROP CONSTRAINT IF EXISTS fk_pago_usuario,
  ALTER COLUMN usuario_id TYPE uuid USING usuario_id::text::uuid;

-- Paso 2: Cambiar tipo de id en usuarios a UUID
ALTER TABLE usuarios 
  ALTER COLUMN id TYPE uuid USING id::text::uuid;

-- Paso 3: Recrear foreign keys
ALTER TABLE movimientos
  ADD CONSTRAINT fk_movimiento_creado_por 
  FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE RESTRICT;

ALTER TABLE repartos_proyecto
  ADD CONSTRAINT fk_reparto_usuario 
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE;

ALTER TABLE pagos_socios
  ADD CONSTRAINT fk_pago_usuario 
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT;

-- Paso 4: Actualizar políticas RLS
DROP POLICY IF EXISTS "Users can read own data" ON usuarios;
CREATE POLICY "Users can read own data"
  ON usuarios FOR SELECT
  USING (auth.uid() = id);

