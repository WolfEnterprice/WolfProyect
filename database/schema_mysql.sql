-- ============================================================================
-- Wolf - Script SQL de Base de Datos (MySQL/MariaDB)
-- ============================================================================
-- Este script crea la estructura completa de la base de datos para MySQL/MariaDB
-- ============================================================================

-- Crear base de datos (descomentar si necesitas crearla)
-- CREATE DATABASE IF NOT EXISTS wolf_finance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE wolf_finance;

-- ============================================================================
-- TABLA: usuarios
-- ============================================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT true,
    password_hash VARCHAR(255),  -- Para autenticación real
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_usuarios_email (email),
    INDEX idx_usuarios_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: categorias
-- ============================================================================
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo ENUM('ingreso', 'egreso') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_categorias_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: proyectos
-- ============================================================================
CREATE TABLE IF NOT EXISTS proyectos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NULL,
    estado ENUM('activo', 'completado', 'cancelado') NOT NULL DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_proyectos_estado (estado),
    INDEX idx_proyectos_fecha_inicio (fecha_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: movimientos
-- ============================================================================
CREATE TABLE IF NOT EXISTS movimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('ingreso', 'egreso') NOT NULL,
    monto DECIMAL(15, 2) NOT NULL CHECK (monto >= 0),
    fecha DATE NOT NULL,
    categoria_id INT NOT NULL,
    proyecto_id INT NULL,
    descripcion TEXT NOT NULL,
    creado_por INT NOT NULL,
    estado ENUM('pendiente', 'pagado') NOT NULL DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_movimiento_categoria 
        FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT,
    CONSTRAINT fk_movimiento_proyecto 
        FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE SET NULL,
    CONSTRAINT fk_movimiento_creado_por 
        FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE RESTRICT,
    
    -- Índices
    INDEX idx_movimientos_tipo (tipo),
    INDEX idx_movimientos_fecha (fecha),
    INDEX idx_movimientos_proyecto (proyecto_id),
    INDEX idx_movimientos_categoria (categoria_id),
    INDEX idx_movimientos_creado_por (creado_por),
    INDEX idx_movimientos_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: repartos_proyecto
-- ============================================================================
CREATE TABLE IF NOT EXISTS repartos_proyecto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    usuario_id INT NOT NULL,
    porcentaje DECIMAL(5, 2) NOT NULL CHECK (porcentaje >= 0 AND porcentaje <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_reparto_proyecto 
        FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    CONSTRAINT fk_reparto_usuario 
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Constraint: Un usuario solo puede tener un reparto por proyecto
    CONSTRAINT uk_reparto_proyecto_usuario 
        UNIQUE (proyecto_id, usuario_id),
    
    -- Índices
    INDEX idx_repartos_proyecto (proyecto_id),
    INDEX idx_repartos_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: pagos_socios
-- ============================================================================
CREATE TABLE IF NOT EXISTS pagos_socios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    usuario_id INT NOT NULL,
    monto DECIMAL(15, 2) NOT NULL CHECK (monto >= 0),
    estado ENUM('pendiente', 'pagado') NOT NULL DEFAULT 'pendiente',
    fecha_pago DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_pago_proyecto 
        FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pago_usuario 
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    
    -- Índices
    INDEX idx_pagos_proyecto (proyecto_id),
    INDEX idx_pagos_usuario (usuario_id),
    INDEX idx_pagos_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- DATOS INICIALES
-- ============================================================================

-- Insertar usuarios (socios)
INSERT INTO usuarios (id, nombre, email, activo) VALUES
    (1, 'Socio 1', 'socio1@example.com', true),
    (2, 'Socio 2', 'socio2@example.com', true)
ON DUPLICATE KEY UPDATE id=id;

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
ON DUPLICATE KEY UPDATE id=id;

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

