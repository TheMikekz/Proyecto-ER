DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Tabla de usuarios admin
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de servicios
CREATE TABLE servicios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    duracion_minutos INTEGER NOT NULL,
    precio DECIMAL(10,2),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de abogados
CREATE TABLE abogados (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefono VARCHAR(20),
    especialidad VARCHAR(255),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de disponibilidad de abogados
CREATE TABLE disponibilidad_abogados (
    id SERIAL PRIMARY KEY,
    abogado_id INTEGER REFERENCES abogados(id) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de agendamientos (CON EL NUEVO ESTADO)
CREATE TABLE agendamientos (
    id SERIAL PRIMARY KEY,
    servicio_id INTEGER REFERENCES servicios(id),
    abogado_id INTEGER REFERENCES abogados(id),
    cliente_nombre VARCHAR(255) NOT NULL,
    cliente_email VARCHAR(255) NOT NULL,
    cliente_telefono VARCHAR(20),
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    duracion_minutos INTEGER NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente',
    comentarios TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT agendamientos_estado_check 
    CHECK (estado IN ('pendiente', 'confirmado', 'cancelado', 'requiere_reagendamiento'))
);

-- Tabla de bloqueos (YA CON LAS COLUMNAS INCLUIDAS)
CREATE TABLE bloqueos (
    id SERIAL PRIMARY KEY,
    abogado_id INTEGER REFERENCES abogados(id) ON DELETE CASCADE,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    hora_inicio TIME,
    hora_fin TIME,
    tipo VARCHAR(50) DEFAULT 'dia_completo',
    motivo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar usuario admin (password: admin123)
INSERT INTO usuarios (email, password_hash, nombre, rol) 
VALUES ('admin@simpleylegal.cl', '$2b$10$lzYXhJfKtT4P1vznW9uMiutttiHLwxWN.q9rGKwk9hsXcsJYGMY66', 'Administrador', 'admin');

-- Insertar servicios
INSERT INTO servicios (nombre, descripcion, duracion_minutos, precio) VALUES
('Asesoría Civil', 'Consultas sobre derecho civil, contratos, propiedades', 30, 30000),
('Asesoría Laboral', 'Consultas sobre derecho laboral, despidos, finiquitos', 30, 20000),
('Asesoría Familiar', 'Consultas sobre derecho de familia, divorcios, pensiones', 30, 20000);

-- Insertar abogado
INSERT INTO abogados (nombre, email, telefono, especialidad) VALUES
('Eirian Rubio', 'cuenta2.albion2@gmail.com', '+56912345678', 'Derecho Civil');

-- Insertar disponibilidad
INSERT INTO disponibilidad_abogados (abogado_id, dia_semana, hora_inicio, hora_fin) VALUES
(1, 1, '09:30', '19:00'), 
(1, 2, '09:30', '19:00'), 
(1, 3, '09:30', '19:00'), 
(1, 4, '09:30', '19:00'), 
(1, 5, '09:30', '19:00'),
(1, 6, '09:30', '12:00');

-- Agregar columnas para Google Calendar
ALTER TABLE agendamientos ADD COLUMN IF NOT EXISTS google_event_id VARCHAR(255);
ALTER TABLE agendamientos ADD COLUMN IF NOT EXISTS meet_link TEXT;

select * from agendamientos;
select * from abogados;
