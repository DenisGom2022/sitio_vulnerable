-- ============================================================
-- Tornillo Mayor · esquema y datos iniciales
-- Se carga al primer arranque del contenedor MySQL.
-- Todos los datos son ficticios.
-- ============================================================

SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS tornillo_mayor CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tornillo_mayor;

CREATE TABLE categories (
  id INT PRIMARY KEY,
  slug VARCHAR(60) NOT NULL UNIQUE,
  ref CHAR(2) NOT NULL,
  name VARCHAR(80) NOT NULL,
  position INT NOT NULL DEFAULT 0
);

CREATE TABLE products (
  id INT PRIMARY KEY,
  ref VARCHAR(10) NOT NULL UNIQUE,
  category_id INT NOT NULL,
  name VARCHAR(160) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  old_price DECIMAL(10,2) DEFAULT NULL,
  stock INT NOT NULL DEFAULT 0,
  drawing VARCHAR(20) DEFAULT NULL,
  home_position INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  address VARCHAR(200) DEFAULT NULL,
  role ENUM('customer','pro','admin') NOT NULL DEFAULT 'customer',
  company VARCHAR(120) DEFAULT NULL,
  nif VARCHAR(12) DEFAULT NULL,
  avatar VARCHAR(255) DEFAULT NULL,
  preferences JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
  sid VARCHAR(64) PRIMARY KEY,
  user_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL
);

CREATE TABLE password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  status ENUM('pendiente','preparando','enviado','entregado','cancelado') NOT NULL DEFAULT 'pendiente',
  shipping_address VARCHAR(200) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  card_last4 CHAR(4) DEFAULT NULL,
  card_enc VARCHAR(255) DEFAULT NULL,
  coupon_code VARCHAR(40) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) AUTO_INCREMENT = 1009;

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  rating TINYINT NOT NULL,
  title VARCHAR(120) NOT NULL,
  body TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE review_photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  review_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (review_id) REFERENCES reviews(id)
);

CREATE TABLE coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL UNIQUE,
  discount_pct INT NOT NULL,
  min_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1,
  expires_at DATE DEFAULT NULL
);

CREATE TABLE pro_imports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  lines_count INT NOT NULL DEFAULT 0,
  order_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE plugins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(60) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  kind ENUM('pasarela','transportista','marketing') NOT NULL,
  version VARCHAR(20) NOT NULL,
  source_url VARCHAR(255) DEFAULT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activity_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip VARCHAR(45) DEFAULT NULL,
  user_id INT DEFAULT NULL,
  action VARCHAR(60) NOT NULL,
  detail TEXT
);

CREATE TABLE contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE settings (
  name VARCHAR(60) PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO categories (id, slug, ref, name, position) VALUES
  (1, 'herramienta-manual', '01', 'Herramienta manual', 1),
  (2, 'herramienta-electrica', '02', 'Herramienta eléctrica', 2),
  (3, 'tornilleria', '03', 'Tornillería y fijación', 3),
  (4, 'fontaneria', '04', 'Fontanería', 4),
  (5, 'electricidad', '05', 'Electricidad', 5),
  (6, 'pintura', '06', 'Pintura y droguería', 6),
  (7, 'jardin', '07', 'Jardín y riego', 7);

INSERT INTO products (id, ref, category_id, name, description, price, old_price, stock, drawing, home_position) VALUES
  (118, '02-118', 2, 'Taladro percutor 18 V con dos baterías', 'Portabrocas metálico de 13 mm, 2 baterías de 2 Ah, cargador rápido y maletín.', 89.90, 119.00, 23, 'taladro', 1),
  (41, '03-041', 3, 'Tacos de nylon 8 mm, caja de 100', 'Taco universal con aletas antigiro para ladrillo macizo, hueco y hormigón.', 4.95, NULL, 340, 'tacos', 2),
  (207, '06-207', 6, 'Silicona sanitaria blanca 280 ml', 'Antimoho, para juntas de baño y cocina. Repintable no.', 3.40, 4.60, 96, 'silicona', 3),
  (9, '01-009', 1, 'Martillo de carpintero 500 g', 'Cabeza de acero forjado y mango de fresno.', 12.50, NULL, 41, 'martillo', 4),
  (330, '04-330', 4, 'Grifo monomando de cocina', 'Caño giratorio alto, cartucho cerámico de 35 mm, latiguillos incluidos.', 39.00, 52.00, 0, 'grifo', 5),
  (512, '05-512', 5, 'Cable H07V-K 2,5 mm², rollo 100 m', 'Cable flexible de cobre para instalaciones interiores, color azul.', 54.90, NULL, 18, 'cable', 6),
  (44, '07-044', 7, 'Tijera de podar bypass 21 cm', 'Hojas de acero templado con muelle y cierre de seguridad.', 16.90, NULL, 57, 'tijera', 7),
  (210, '01-210', 1, 'Juego de llaves Allen, 9 piezas', 'Medidas de 1,5 a 10 mm en acero cromo-vanadio, con soporte.', 8.75, NULL, 112, 'allen', 8),
  (19, '06-019', 6, 'Rodillo antigota 22 cm con mango', 'Pelo de 12 mm para pintura plástica en paredes y techos.', 6.20, 7.90, 75, 'rodillo', 9),
  (10, '01-010', 1, 'Maza de albañil 1 kg', 'Cabeza octogonal y mango de fibra antivibración.', 15.40, NULL, 30, 'martillo', NULL),
  (14, '01-014', 1, 'Destornillador de precisión, 6 piezas', 'Puntas planas y Phillips para electrónica y gafas.', 7.95, NULL, 64, NULL, NULL),
  (22, '01-022', 1, 'Alicate universal 180 mm', 'Mango bimaterial aislado a 1000 V.', 11.30, NULL, 48, NULL, NULL),
  (31, '01-031', 1, 'Flexómetro 5 m con freno', 'Cinta de 25 mm de ancho, carcasa con goma antigolpes.', 6.90, NULL, 150, NULL, NULL),
  (38, '01-038', 1, 'Nivel de burbuja 60 cm', 'Perfil de aluminio con tres burbujas.', 13.75, NULL, 27, NULL, NULL),
  (55, '01-055', 1, 'Sierra de costilla 300 mm', 'Dentado fino para cortes precisos en madera.', 14.20, NULL, 22, NULL, NULL),
  (121, '02-121', 2, 'Atornillador 12 V compacto', 'Par máximo de 30 Nm, luz LED y una batería de 2 Ah.', 59.00, NULL, 19, 'taladro', NULL),
  (130, '02-130', 2, 'Amoladora 115 mm 750 W', 'Empuñadura lateral en dos posiciones y protector regulable.', 42.50, 49.90, 14, NULL, NULL),
  (144, '02-144', 2, 'Sierra de calar 650 W', 'Péndulo en cuatro posiciones, corte en bisel hasta 45°.', 64.90, NULL, 9, NULL, NULL),
  (152, '02-152', 2, 'Lijadora orbital 240 W', 'Base de 1/3 de hoja con aspiración de polvo.', 38.00, NULL, 11, NULL, NULL),
  (160, '02-160', 2, 'Martillo perforador SDS-Plus 800 W', 'Tres modos: taladro, percutor y cincelado. 2,6 J.', 99.00, 129.00, 6, NULL, NULL),
  (52, '03-052', 3, 'Tacos de nylon 6 mm, caja de 100', 'Para cargas ligeras en pared de ladrillo y hormigón.', 3.95, NULL, 410, 'tacos', NULL),
  (60, '03-060', 3, 'Tornillo para madera 4×40, caja de 200', 'Cabeza avellanada, Pozidriv, acero cincado.', 5.60, NULL, 260, NULL, NULL),
  (66, '03-066', 3, 'Tornillo autorroscante 4,2×19, caja de 100', 'Punta broca para chapa, cabeza alomada.', 4.10, NULL, 180, NULL, NULL),
  (71, '03-071', 3, 'Anclaje químico de poliéster 300 ml', 'Para cargas pesadas en hormigón y ladrillo.', 9.80, NULL, 40, NULL, NULL),
  (79, '03-079', 3, 'Tacos para pladur, bolsa de 50', 'Metálicos de expansión, para placa de yeso de 12,5 mm.', 8.40, NULL, 95, NULL, NULL),
  (85, '03-085', 3, 'Varilla roscada M8, 1 m', 'Acero cincado, calidad 4.8.', 1.95, NULL, 300, NULL, NULL),
  (301, '04-301', 4, 'Latiguillo flexible 3/8" 35 cm', 'Malla de acero inoxidable, hembra-hembra.', 3.20, NULL, 220, NULL, NULL),
  (312, '04-312', 4, 'Llave de paso 1/2" esfera', 'Latón niquelado, maneta de mariposa roja.', 6.45, NULL, 88, NULL, NULL),
  (318, '04-318', 4, 'Teflón 12 m × 12 mm, 10 rollos', 'Cinta de PTFE para roscas de agua y gas.', 4.50, NULL, 130, NULL, NULL),
  (325, '04-325', 4, 'Sifón botella para lavabo', 'Salida de 32 mm, regulable en altura.', 7.10, NULL, 46, NULL, NULL),
  (340, '04-340', 4, 'Grifo de lavabo monomando', 'Aireador antical, cartucho de 35 mm.', 29.90, NULL, 21, 'grifo', NULL),
  (346, '04-346', 4, 'Tubo multicapa 16 mm, rollo 50 m', 'Para agua fría, caliente y calefacción.', 58.00, NULL, 12, NULL, NULL),
  (501, '05-501', 5, 'Cable H07V-K 1,5 mm², rollo 100 m', 'Cable flexible de cobre, color negro.', 36.50, NULL, 26, 'cable', NULL),
  (520, '05-520', 5, 'Diferencial 2P 40 A 30 mA', 'Clase AC, para carril DIN.', 24.90, NULL, 33, NULL, NULL),
  (528, '05-528', 5, 'Magnetotérmico 1P+N 16 A', 'Curva C, poder de corte 6 kA.', 6.80, NULL, 120, NULL, NULL),
  (533, '05-533', 5, 'Caja de empalmes estanca 100×100', 'IP55 con conos de entrada.', 3.15, NULL, 140, NULL, NULL),
  (540, '05-540', 5, 'Bombilla LED E27 10 W luz cálida', 'Equivale a 75 W, 1055 lúmenes.', 2.95, 3.90, 400, NULL, NULL),
  (547, '05-547', 5, 'Regleta de 5 enchufes con interruptor', 'Cable de 1,5 m y protección infantil.', 8.20, NULL, 77, NULL, NULL),
  (12, '06-012', 6, 'Pintura plástica blanca mate 15 L', 'Interior, alta cubrición, lavable.', 39.90, 46.00, 34, NULL, NULL),
  (25, '06-025', 6, 'Rodillo de esmalte 10 cm, 2 recambios', 'Espuma de poro fino para acabado liso.', 4.30, NULL, 90, 'rodillo', NULL),
  (33, '06-033', 6, 'Cinta de carrocero 36 mm × 45 m', 'Se retira sin dejar restos hasta 7 días.', 2.40, NULL, 260, NULL, NULL),
  (40, '06-040', 6, 'Masilla acrílica blanca 300 ml', 'Para grietas y juntas en interior, pintable.', 2.85, NULL, 110, 'silicona', NULL),
  (48, '06-048', 6, 'Brocha plana 50 mm', 'Mezcla de cerda natural y sintética.', 3.60, NULL, 85, NULL, NULL),
  (51, '07-051', 7, 'Tijera cortasetos 54 cm', 'Hoja ondulada y mangos de aluminio.', 24.50, NULL, 15, 'tijera', NULL),
  (58, '07-058', 7, 'Manguera de riego 15 m con accesorios', 'Antitorsión, 19 mm, con pistola de 7 posiciones.', 22.90, 27.50, 28, NULL, NULL),
  (63, '07-063', 7, 'Programador de riego a grifo', 'Pantalla LCD, hasta 4 riegos al día.', 31.00, NULL, 17, NULL, NULL),
  (70, '07-070', 7, 'Azada con mango de madera', 'Hoja forjada de 18 cm.', 17.40, NULL, 20, NULL, NULL),
  (76, '07-076', 7, 'Guantes de jardín talla 9', 'Palma de látex y dorso transpirable.', 3.25, NULL, 160, NULL, NULL);

INSERT INTO users (id, email, password_hash, name, phone, address, role, company, nif, preferences, created_at) VALUES
  (1, 'admin@tornillomayor.es', '5004ef0280d7c2f203aca89039bfede9a26f1652', 'Ramón Mayor Ortega', '910000101', 'C/ de la Fragua, 14 · 28000 Madrid', 'admin', NULL, NULL, '{"newsletter": false, "vista": "cuadricula"}', '2025-02-11 09:00:00'),
  (2, 'pilar.mayor@tornillomayor.es', '93996505f368256d031e3a22ff1ca80015591e34', 'Pilar Mayor Ortega', '910000102', 'C/ de la Fragua, 14 · 28000 Madrid', 'admin', NULL, NULL, '{"newsletter": true, "vista": "cuadricula"}', '2025-03-12 09:00:00'),
  (3, 'lucia.moreno@example.com', '43e62f08099d3678e6675f67692d0df5349621dd', 'Lucía Moreno Gil', '600000301', 'C/ del Olmo, 7, 2.º B · 28000 Madrid', 'customer', NULL, NULL, '{"newsletter": false, "vista": "cuadricula"}', '2025-04-13 09:00:00'),
  (4, 'javier.ruiz@example.net', '5cec175b165e3d5e62c9e13ce848ef6feac81bff', 'Javier Ruiz Prieto', '600000302', 'Av. de los Robles, 112 · 28000 Madrid', 'customer', NULL, NULL, '{"newsletter": true, "vista": "cuadricula"}', '2025-05-14 09:00:00'),
  (5, 'carmen.lopez@example.org', '176d97de948e33d47dcfd6f869adf1851fc27639', 'Carmen López Vidal', '600000303', 'C/ Mayor, 3, bajo · 28000 Madrid', 'customer', NULL, NULL, '{"newsletter": false, "vista": "cuadricula"}', '2025-06-15 09:00:00'),
  (6, 'reformas.alcaraz@example.com', '5f09af3a69dbd9849c86a11bc3750200d1b5d3aa', 'Andrés Alcaraz Soler', '600000304', 'Pol. Ind. Las Arenas, nave 4 · 28000 Madrid', 'pro', 'Reformas Alcaraz, S.L.', 'B00000001', '{"newsletter": true, "vista": "cuadricula"}', '2025-07-16 09:00:00'),
  (7, 'fontaneria.benitez@example.net', '1015c7a1afa928f501dcf32386dd66b98cf144d4', 'Sergio Benítez Mora', '600000305', 'C/ del Cauce, 19 · 28000 Madrid', 'pro', 'Fontanería Benítez', '00000002X', '{"newsletter": false, "vista": "cuadricula"}', '2025-08-17 09:00:00'),
  (8, 'elec.navarro@example.org', '1bbdd2333caa743abebc6409fa6d7620221db721', 'Marta Navarro Ibáñez', '600000306', 'C/ de la Corriente, 55, 1.º · 28000 Madrid', 'pro', 'Instalaciones Navarro, S.L.', 'B00000003', '{"newsletter": true, "vista": "cuadricula"}', '2025-09-18 09:00:00'),
  (9, 'tomas.serrano@example.com', '7c4a8d09ca3762af61e59520943dc26494f8941b', 'Tomás Serrano Rey', '600000307', 'Pza. del Mercado, 2, 4.º A · 28000 Madrid', 'customer', NULL, NULL, '{"newsletter": false, "vista": "cuadricula"}', '2025-01-10 09:00:00');

ALTER TABLE users AUTO_INCREMENT = 10;

INSERT INTO orders (id, user_id, status, shipping_address, total, card_last4, card_enc, created_at) VALUES
  (1001, 3, 'entregado', 'C/ del Olmo, 7, 2.º B · 28000 Madrid', 99.80, '4242', 'fSPFk8lxQEyme5BlkKs5b8aT1QDiy6uA', '2026-09-14 10:22:00'),
  (1002, 4, 'entregado', 'Av. de los Robles, 112 · 28000 Madrid', 21.25, '1881', '9kfIAqmiwyB7kihXmpbjNcaT1QDiy6uA', '2026-09-20 18:05:00'),
  (1003, 6, 'entregado', 'Pol. Ind. Las Arenas, nave 4 · 28000 Madrid', 199.80, '0005', 'MTHPX3rg32D0PL+xuknaosaT1QDiy6uA', '2026-10-02 08:41:00'),
  (1004, 5, 'enviado', 'C/ Mayor, 3, bajo · 28000 Madrid', 101.80, '3220', 'NoBUHxQ8j/6K/hqxibJDxMaT1QDiy6uA', '2026-10-28 12:13:00'),
  (1005, 7, 'entregado', 'C/ del Cauce, 19 · 28000 Madrid', 129.10, '7718', 'wMu870bUWuORwd2mWbXK68aT1QDiy6uA', '2026-10-30 09:02:00'),
  (1006, 8, 'preparando', 'C/ de la Corriente, 55, 1.º · 28000 Madrid', 375.90, '9054', '1fGA6y169YcBEG2+7FgSY8aT1QDiy6uA', '2026-11-17 16:47:00'),
  (1007, 3, 'preparando', 'C/ del Olmo, 7, 2.º B · 28000 Madrid', 29.40, '4242', 'fSPFk8lxQEyme5BlkKs5b8aT1QDiy6uA', '2026-11-18 11:30:00'),
  (1008, 9, 'pendiente', 'Pza. del Mercado, 2, 4.º A · 28000 Madrid', 29.50, '6003', 'OkUeX9cDBGGUHc9yAsAXL8aT1QDiy6uA', '2026-11-19 20:15:00');

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
  (1001, 118, 1, 89.90),
  (1001, 41, 2, 4.95),
  (1002, 9, 1, 12.50),
  (1002, 210, 1, 8.75),
  (1003, 60, 10, 5.60),
  (1003, 71, 6, 9.80),
  (1003, 130, 2, 42.50),
  (1004, 12, 2, 39.90),
  (1004, 19, 2, 6.20),
  (1004, 33, 4, 2.40),
  (1005, 301, 20, 3.20),
  (1005, 318, 3, 4.50),
  (1005, 312, 8, 6.45),
  (1006, 512, 4, 54.90),
  (1006, 520, 3, 24.90),
  (1006, 528, 12, 6.80),
  (1007, 58, 1, 22.90),
  (1007, 76, 2, 3.25),
  (1008, 540, 10, 2.95);

INSERT INTO reviews (product_id, user_id, rating, title, body, created_at) VALUES
  (118, 3, 5, 'Va sobrado para casa', 'Lo he usado para colgar estanterías en ladrillo y en hormigón. Las dos baterías se agradecen.', '2026-09-25 19:10:00'),
  (118, 6, 4, 'Correcto para obra ligera', 'Para remates está bien; para hormigón armado tirad del SDS.', '2026-10-10 07:55:00'),
  (41, 4, 5, 'Los de siempre', 'Agarran bien en ladrillo hueco. Caja completa.', '2026-09-28 13:20:00'),
  (9, 4, 4, 'Buen peso', 'Equilibrado. El mango podría ser algo más largo.', '2026-09-29 18:40:00'),
  (330, 5, 3, 'Bonito pero el caño gira duro', 'Pasados unos días se suaviza. Instalación sencilla.', '2026-08-12 10:00:00'),
  (512, 8, 5, 'Cobre de calidad', 'Pasa bien por el tubo corrugado, sin enredos.', '2026-11-01 17:35:00'),
  (19, 5, 5, 'No salpica', 'Pinté el salón entero sin tapar casi nada.', '2026-11-05 12:00:00'),
  (301, 7, 5, 'Material serio', 'Uso diario en obra, ninguno ha fallado.', '2026-11-02 08:15:00');

INSERT INTO coupons (code, discount_pct, min_total, active, expires_at) VALUES
  ('BIENVENIDA10', 10, 30.00, 1, '2026-12-31'),
  ('OBRA15', 15, 300.00, 1, '2026-12-31'),
  ('VERANO25', 25, 0.00, 0, '2026-08-31');

INSERT INTO plugins (slug, name, kind, version, source_url, enabled) VALUES
  ('pasarela-tpv', 'Pasarela TPV Virtual', 'pasarela', '2.4.1', NULL, 1),
  ('envios-rapidos', 'Envíos Rápidos 24 h', 'transportista', '1.8.0', NULL, 1),
  ('recogida-tienda', 'Recogida en tienda', 'transportista', '1.2.3', NULL, 1);

INSERT INTO settings (name, value) VALUES
  ('shop_name', 'Tornillo Mayor'),
  ('shop_email', 'pedidos@tornillomayor.es'),
  ('free_shipping_from', '49'),
  ('supplier_stock_host', 'almacen.proveedor.local');
