-- ============================================================================
-- Freegents Finance - Script SQL para Supabase (PostgreSQL)
-- ============================================================================
-- Copia y pega este script completo en el editor SQL de Supabase
-- ============================================================================

-- ============================================================================
-- TABLA: usuarios
-- ============================================================================
-- NOTA: Usamos UUID para que coincida con auth.users.id de Supabase
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT true,
    password_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);

-- ============================================================================
-- TABLA: categorias
-- ============================================================================
CREATE TABLE IF NOT EXISTS categorias (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_categorias_tipo ON categorias(tipo);

-- ============================================================================
-- TABLA: proyectos
-- ============================================================================
CREATE TABLE IF NOT EXISTS proyectos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'completado', 'cancelado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_proyectos_estado ON proyectos(estado);
CREATE INDEX IF NOT EXISTS idx_proyectos_fecha_inicio ON proyectos(fecha_inicio);

-- ============================================================================
-- TABLA: movimientos
-- ============================================================================
CREATE TABLE IF NOT EXISTS movimientos (
    id BIGSERIAL PRIMARY KEY,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
    monto NUMERIC(15, 2) NOT NULL CHECK (monto >= 0),
    fecha DATE NOT NULL,
    categoria_id BIGINT NOT NULL,
    proyecto_id BIGINT NULL,
    descripcion TEXT NOT NULL,
    creado_por UUID NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    CONSTRAINT fk_movimiento_categoria 
        FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT,
    CONSTRAINT fk_movimiento_proyecto 
        FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE SET NULL,
    CONSTRAINT fk_movimiento_creado_por 
        FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_movimientos_tipo ON movimientos(tipo);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos(fecha);
CREATE INDEX IF NOT EXISTS idx_movimientos_proyecto ON movimientos(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_categoria ON movimientos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_creado_por ON movimientos(creado_por);
CREATE INDEX IF NOT EXISTS idx_movimientos_estado ON movimientos(estado);

-- ============================================================================
-- TABLA: repartos_proyecto
-- ============================================================================
CREATE TABLE IF NOT EXISTS repartos_proyecto (
    id BIGSERIAL PRIMARY KEY,
    proyecto_id BIGINT NOT NULL,
    usuario_id UUID NOT NULL,
    porcentaje NUMERIC(5, 2) NOT NULL CHECK (porcentaje >= 0 AND porcentaje <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    CONSTRAINT fk_reparto_proyecto 
        FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    CONSTRAINT fk_reparto_usuario 
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT uk_reparto_proyecto_usuario 
        UNIQUE (proyecto_id, usuario_id)
);

CREATE INDEX IF NOT EXISTS idx_repartos_proyecto ON repartos_proyecto(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_repartos_usuario ON repartos_proyecto(usuario_id);

-- ============================================================================
-- TABLA: pagos_socios
-- ============================================================================
CREATE TABLE IF NOT EXISTS pagos_socios (
    id BIGSERIAL PRIMARY KEY,
    proyecto_id BIGINT NOT NULL,
    usuario_id UUID NOT NULL,
    monto NUMERIC(15, 2) NOT NULL CHECK (monto >= 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado')),
    fecha_pago DATE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    CONSTRAINT fk_pago_proyecto 
        FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pago_usuario 
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_pagos_proyecto ON pagos_socios(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_pagos_usuario ON pagos_socios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos_socios(estado);

-- ============================================================================
-- FUNCIÓN para actualizar updated_at automáticamente
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- TRIGGERS para actualizar updated_at
-- ============================================================================
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at 
    BEFORE UPDATE ON usuarios
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categorias_updated_at ON categorias;
CREATE TRIGGER update_categorias_updated_at 
    BEFORE UPDATE ON categorias
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_proyectos_updated_at ON proyectos;
CREATE TRIGGER update_proyectos_updated_at 
    BEFORE UPDATE ON proyectos
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_movimientos_updated_at ON movimientos;
CREATE TRIGGER update_movimientos_updated_at 
    BEFORE UPDATE ON movimientos
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_repartos_updated_at ON repartos_proyecto;
CREATE TRIGGER update_repartos_updated_at 
    BEFORE UPDATE ON repartos_proyecto
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pagos_updated_at ON pagos_socios;
CREATE TRIGGER update_pagos_updated_at 
    BEFORE UPDATE ON pagos_socios
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DATOS INICIALES
-- ============================================================================

-- NOTA: Los usuarios se crearán automáticamente cuando inicien sesión con OAuth
-- Si necesitas crear usuarios manualmente para pruebas, usa UUIDs:
-- INSERT INTO usuarios (id, nombre, email, activo) VALUES
--     (gen_random_uuid(), 'Socio 1', 'socio1@example.com', true),
--     (gen_random_uuid(), 'Socio 2', 'socio2@example.com', true)
-- ON CONFLICT (email) DO UPDATE SET nombre = EXCLUDED.nombre;

-- Insertar categorías
INSERT INTO categorias (id, nombre, tipo) VALUES
    -- Categorías de ingreso
    (1, 'Ventas', 'ingreso'),
    (2, 'Servicios', 'ingreso'),
    (3, 'Inversiones', 'ingreso'),
    -- Categorías de egreso
    (4, 'Salarios', 'egreso'),
    (5, 'Materiales', 'egreso'),
    (6, 'Servicios', 'egreso'),
    (7, 'Marketing', 'egreso'),
    (8, 'Gastos generales', 'egreso')
ON CONFLICT (id) DO NOTHING;

-- Resetear secuencia de categorias después de insertar IDs manuales
SELECT setval('categorias_id_seq', (SELECT MAX(id) FROM categorias));

-- ============================================================================
-- VISTAS ÚTILES
-- ============================================================================

-- Vista: Movimientos con información completa
CREATE OR REPLACE VIEW v_movimientos_detallados AS
SELECT 
    m.id,
    m.tipo,
    m.monto,
    m.fecha,
    m.descripcion,
    m.estado,
    m.proyecto_id,
    m.creado_por,
    c.id AS categoria_id,
    c.nombre AS categoria_nombre,
    c.tipo AS categoria_tipo,
    p.nombre AS proyecto_nombre,
    p.estado AS proyecto_estado,
    u.nombre AS creado_por_nombre,
    u.email AS creado_por_email,
    m.created_at,
    m.updated_at
FROM movimientos m
LEFT JOIN categorias c ON m.categoria_id = c.id
LEFT JOIN proyectos p ON m.proyecto_id = p.id
LEFT JOIN usuarios u ON m.creado_por = u.id;

-- Vista: Resumen de proyectos con ingresos y egresos
CREATE OR REPLACE VIEW v_proyectos_resumen AS
SELECT 
    p.id,
    p.nombre,
    p.descripcion,
    p.fecha_inicio,
    p.fecha_fin,
    p.estado,
    COALESCE(SUM(CASE WHEN m.tipo = 'ingreso' THEN m.monto ELSE 0 END), 0) AS total_ingresos,
    COALESCE(SUM(CASE WHEN m.tipo = 'egreso' THEN m.monto ELSE 0 END), 0) AS total_egresos,
    COALESCE(SUM(CASE WHEN m.tipo = 'ingreso' THEN m.monto ELSE -m.monto END), 0) AS ganancia_neta
FROM proyectos p
LEFT JOIN movimientos m ON p.id = m.proyecto_id
GROUP BY p.id, p.nombre, p.descripcion, p.fecha_inicio, p.fecha_fin, p.estado;

-- Vista: Repartos con información de usuarios
CREATE OR REPLACE VIEW v_repartos_detallados AS
SELECT 
    r.id,
    r.proyecto_id,
    r.usuario_id,
    r.porcentaje,
    p.nombre AS proyecto_nombre,
    u.nombre AS usuario_nombre,
    u.email AS usuario_email,
    r.created_at,
    r.updated_at
FROM repartos_proyecto r
JOIN proyectos p ON r.proyecto_id = p.id
JOIN usuarios u ON r.usuario_id = u.id;

-- Vista: Pagos con información completa
CREATE OR REPLACE VIEW v_pagos_detallados AS
SELECT 
    ps.id,
    ps.proyecto_id,
    ps.usuario_id,
    ps.monto,
    ps.estado,
    ps.fecha_pago,
    p.nombre AS proyecto_nombre,
    u.nombre AS usuario_nombre,
    u.email AS usuario_email,
    ps.created_at,
    ps.updated_at
FROM pagos_socios ps
JOIN proyectos p ON ps.proyecto_id = p.id
JOIN usuarios u ON ps.usuario_id = u.id;

