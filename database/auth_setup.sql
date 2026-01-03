-- ============================================================================
-- Script SQL para configurar autenticación OAuth en Supabase
-- Ejecuta este script después de ejecutar schema_supabase.sql
-- ============================================================================

-- Función para sincronizar usuario de auth.users a usuarios
-- Requiere que la tabla usuarios.id sea UUID (ya está configurado en schema_supabase.sql)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nombre, email, activo)
  VALUES (
    NEW.id,  -- auth.users.id es UUID
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET
    nombre = COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      usuarios.nombre
    ),
    email = NEW.email,
    activo = true;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función cuando se crea/actualiza un usuario en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Permitir que la función inserte/actualice en usuarios
GRANT INSERT, UPDATE ON public.usuarios TO authenticated;

-- Habilitar Row Level Security en usuarios
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden leer su propia información
DROP POLICY IF EXISTS "Users can read own data" ON usuarios;
CREATE POLICY "Users can read own data"
  ON usuarios FOR SELECT
  USING (auth.uid() = id);

-- Política: Permitir lectura de todos los usuarios activos (para la app)
-- Ajusta esto según tus necesidades de privacidad
DROP POLICY IF EXISTS "Users can read active users" ON usuarios;
CREATE POLICY "Users can read active users"
  ON usuarios FOR SELECT
  USING (activo = true);

-- Política: Permitir que el servicio inserte/actualice usuarios (para el trigger)
-- Esto se maneja con SECURITY DEFINER en la función, pero es bueno tener la política
DROP POLICY IF EXISTS "Service can manage users" ON usuarios;
CREATE POLICY "Service can manage users"
  ON usuarios FOR ALL
  USING (true)
  WITH CHECK (true);

