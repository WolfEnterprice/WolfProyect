-- ============================================================================
-- Freegents Finance - Script SQL de Base de Datos
-- ============================================================================
-- Este script crea la estructura completa de la base de datos
-- Compatible con PostgreSQL, MySQL/MariaDB (con ligeras modificaciones)
-- ============================================================================

-- Eliminar tablas si existen (solo para desarrollo, comentar en producción)
-- DROP TABLE IF EXISTS pagos_socios CASCADE;
-- DROP TABLE IF EXISTS repartos_proyecto CASCADE;
-- DROP TABLE IF EXISTS movimientos CASCADE;
-- DROP TABLE IF EXISTS categorias CASCADE;
-- DROP TABLE IF EXISTS proyectos CASCADE;
-- DROP TABLE IF EXISTS usuarios CASCADE;

-- ============================================================================
-- TABLA: usuarios
-- ============================================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,  -- En MySQL usar: id INT AUTO_INCREMENT PRIMARY KEY
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT true,
    password_hash VARCHAR(255),  -- Para autenticación real
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLA: categorias
-- ============================================================================
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,  -- En MySQL usar: id INT AUTO_INCREMENT PRIMARY KEY
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLA: proyectos
-- ============================================================================
CREATE TABLE IF NOT EXISTS proyectos (
    id SERIAL PRIMARY KEY,  -- En MySQL usar: id INT AUTO_INCREMENT PRIMARY KEY
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'completado', 'cancelado')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLA: movimientos
-- ============================================================================
CREATE TABLE IF NOT EXISTS movimientos (
    id SERIAL PRIMARY KEY,  -- En MySQL usar: id INT AUTO_INCREMENT PRIMARY KEY
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
    monto DECIMAL(15, 2) NOT NULL CHECK (monto >= 0),
    fecha DATE NOT NULL,
    categoria_id INT NOT NULL,
    proyecto_id INT NULL,
    descripcion TEXT NOT NULL,
    creado_por INT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_movimiento_categoria 
        FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT,
    CONSTRAINT fk_movimiento_proyecto 
        FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE SET NULL,
    CONSTRAINT fk_movimiento_creado_por 
        FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE RESTRICT
);

-- ============================================================================
-- TABLA: repartos_proyecto
-- ============================================================================
CREATE TABLE IF NOT EXISTS repartos_proyecto (
    id SERIAL PRIMARY KEY,  -- En MySQL usar: id INT AUTO_INCREMENT PRIMARY KEY
    proyecto_id INT NOT NULL,
    usuario_id INT NOT NULL,
    porcentaje DECIMAL(5, 2) NOT NULL CHECK (porcentaje >= 0 AND porcentaje <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_reparto_proyecto 
        FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    CONSTRAINT fk_reparto_usuario 
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Constraint: Un usuario solo puede tener un reparto por proyecto
    CONSTRAINT uk_reparto_proyecto_usuario 
        UNIQUE (proyecto_id, usuario_id)
);

-- ============================================================================
-- TABLA: pagos_socios
-- ============================================================================
CREATE TABLE IF NOT EXISTS pagos_socios (
    id SERIAL PRIMARY KEY,  -- En MySQL usar: id INT AUTO_INCREMENT PRIMARY KEY
    proyecto_id INT NOT NULL,
    usuario_id INT NOT NULL,
    monto DECIMAL(15, 2) NOT NULL CHECK (monto >= 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado')),
    fecha_pago DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_pago_proyecto 
        FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pago_usuario 
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
);

-- ============================================================================
-- ÍNDICES para optimizar consultas
-- ============================================================================

-- Índices en usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);

-- Índices en categorias
CREATE INDEX IF NOT EXISTS idx_categorias_tipo ON categorias(tipo);

-- Índices en proyectos
CREATE INDEX IF NOT EXISTS idx_proyectos_estado ON proyectos(estado);
CREATE INDEX IF NOT EXISTS idx_proyectos_fecha_inicio ON proyectos(fecha_inicio);

-- Índices en movimientos
CREATE INDEX IF NOT EXISTS idx_movimientos_tipo ON movimientos(tipo);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos(fecha);
CREATE INDEX IF NOT EXISTS idx_movimientos_proyecto ON movimientos(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_categoria ON movimientos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_creado_por ON movimientos(creado_por);
CREATE INDEX IF NOT EXISTS idx_movimientos_estado ON movimientos(estado);

-- Índices en repartos_proyecto
CREATE INDEX IF NOT EXISTS idx_repartos_proyecto ON repartos_proyecto(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_repartos_usuario ON repartos_proyecto(usuario_id);

-- Índices en pagos_socios
CREATE INDEX IF NOT EXISTS idx_pagos_proyecto ON pagos_socios(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_pagos_usuario ON pagos_socios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos_socios(estado);

-- ============================================================================
-- DATOS INICIALES
-- ============================================================================

-- Insertar usuarios (socios)
INSERT INTO usuarios (id, nombre, email, activo) VALUES
    (1, 'Socio 1', 'socio1@example.com', true),
    (2, 'Socio 2', 'socio2@example.com', true)
ON CONFLICT (id) DO NOTHING;  -- PostgreSQL
-- En MySQL usar: ON DUPLICATE KEY UPDATE id=id;

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
ON CONFLICT (id) DO NOTHING;  -- PostgreSQL
-- En MySQL usar: ON DUPLICATE KEY UPDATE id=id;

-- ============================================================================
-- VISTAS ÚTILES (Opcional)
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

-- ============================================================================
-- FUNCIONES ÚTILES (Opcional - PostgreSQL)
-- ============================================================================

-- Función para actualizar updated_at automáticamente
-- Para PostgreSQL:
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proyectos_updated_at BEFORE UPDATE ON proyectos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_movimientos_updated_at BEFORE UPDATE ON movimientos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repartos_updated_at BEFORE UPDATE ON repartos_proyecto
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pagos_updated_at BEFORE UPDATE ON pagos_socios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMENTARIOS FINALES
-- ============================================================================

-- Este script está optimizado para PostgreSQL
-- Para MySQL/MariaDB, hacer los siguientes cambios:
-- 1. SERIAL -> INT AUTO_INCREMENT
-- 2. BOOLEAN -> TINYINT(1) o BOOLEAN (depende de versión)
-- 3. TEXT -> TEXT o LONGTEXT
-- 4. ON CONFLICT DO NOTHING -> ON DUPLICATE KEY UPDATE id=id
-- 5. Las funciones y triggers tienen sintaxis diferente en MySQL
-- 6. Las vistas funcionan igual en ambos

