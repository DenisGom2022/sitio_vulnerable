import json, sys, hashlib
bhash = lambda s: hashlib.sha1(s.encode()).hexdigest()
q = lambda s: "NULL" if s is None else "'" + str(s).replace("\\", "\\\\").replace("'", "''") + "'"
NB = " "

cats = [
 (1,'herramienta-manual','01','Herramienta manual'),
 (2,'herramienta-electrica','02','Herramienta eléctrica'),
 (3,'tornilleria','03','Tornillería y fijación'),
 (4,'fontaneria','04','Fontanería'),
 (5,'electricidad','05','Electricidad'),
 (6,'pintura','06','Pintura y droguería'),
 (7,'jardin','07','Jardín y riego'),
]
# (id, ref, cat, drawing, name, description, price, old_price, stock, home_position)
P = [
 (118,'02-118',2,'taladro','Taladro percutor 18 V con dos baterías','Portabrocas metálico de 13 mm, 2 baterías de 2 Ah, cargador rápido y maletín.',89.90,119.00,23,1),
 (41,'03-041',3,'tacos','Tacos de nylon 8 mm, caja de 100','Taco universal con aletas antigiro para ladrillo macizo, hueco y hormigón.',4.95,None,340,2),
 (207,'06-207',6,'silicona','Silicona sanitaria blanca 280 ml','Antimoho, para juntas de baño y cocina. Repintable no.',3.40,4.60,96,3),
 (9,'01-009',1,'martillo','Martillo de carpintero 500 g','Cabeza de acero forjado y mango de fresno.',12.50,None,41,4),
 (330,'04-330',4,'grifo','Grifo monomando de cocina','Caño giratorio alto, cartucho cerámico de 35 mm, latiguillos incluidos.',39.00,52.00,0,5),
 (512,'05-512',5,'cable','Cable H07V-K 2,5 mm², rollo 100 m','Cable flexible de cobre para instalaciones interiores, color azul.',54.90,None,18,6),
 (44,'07-044',7,'tijera','Tijera de podar bypass 21 cm','Hojas de acero templado con muelle y cierre de seguridad.',16.90,None,57,7),
 (210,'01-210',1,'allen','Juego de llaves Allen, 9 piezas','Medidas de 1,5 a 10 mm en acero cromo-vanadio, con soporte.',8.75,None,112,8),
 (19,'06-019',6,'rodillo','Rodillo antigota 22 cm con mango','Pelo de 12 mm para pintura plástica en paredes y techos.',6.20,7.90,75,9),
 (10,'01-010',1,'martillo','Maza de albañil 1 kg','Cabeza octogonal y mango de fibra antivibración.',15.40,None,30,None),
 (14,'01-014',1,None,'Destornillador de precisión, 6 piezas','Puntas planas y Phillips para electrónica y gafas.',7.95,None,64,None),
 (22,'01-022',1,None,'Alicate universal 180 mm','Mango bimaterial aislado a 1000 V.',11.30,None,48,None),
 (31,'01-031',1,None,'Flexómetro 5 m con freno','Cinta de 25 mm de ancho, carcasa con goma antigolpes.',6.90,None,150,None),
 (38,'01-038',1,None,'Nivel de burbuja 60 cm','Perfil de aluminio con tres burbujas.',13.75,None,27,None),
 (55,'01-055',1,None,'Sierra de costilla 300 mm','Dentado fino para cortes precisos en madera.',14.20,None,22,None),
 (121,'02-121',2,'taladro','Atornillador 12 V compacto','Par máximo de 30 Nm, luz LED y una batería de 2 Ah.',59.00,None,19,None),
 (130,'02-130',2,None,'Amoladora 115 mm 750 W','Empuñadura lateral en dos posiciones y protector regulable.',42.50,49.90,14,None),
 (144,'02-144',2,None,'Sierra de calar 650 W','Péndulo en cuatro posiciones, corte en bisel hasta 45°.',64.90,None,9,None),
 (152,'02-152',2,None,'Lijadora orbital 240 W','Base de 1/3 de hoja con aspiración de polvo.',38.00,None,11,None),
 (160,'02-160',2,None,'Martillo perforador SDS-Plus 800 W','Tres modos: taladro, percutor y cincelado. 2,6 J.',99.00,129.00,6,None),
 (52,'03-052',3,'tacos','Tacos de nylon 6 mm, caja de 100','Para cargas ligeras en pared de ladrillo y hormigón.',3.95,None,410,None),
 (60,'03-060',3,None,'Tornillo para madera 4×40, caja de 200','Cabeza avellanada, Pozidriv, acero cincado.',5.60,None,260,None),
 (66,'03-066',3,None,'Tornillo autorroscante 4,2×19, caja de 100','Punta broca para chapa, cabeza alomada.',4.10,None,180,None),
 (71,'03-071',3,None,'Anclaje químico de poliéster 300 ml','Para cargas pesadas en hormigón y ladrillo.',9.80,None,40,None),
 (79,'03-079',3,None,'Tacos para pladur, bolsa de 50','Metálicos de expansión, para placa de yeso de 12,5 mm.',8.40,None,95,None),
 (85,'03-085',3,None,'Varilla roscada M8, 1 m','Acero cincado, calidad 4.8.',1.95,None,300,None),
 (301,'04-301',4,None,'Latiguillo flexible 3/8" 35 cm','Malla de acero inoxidable, hembra-hembra.',3.20,None,220,None),
 (312,'04-312',4,None,'Llave de paso 1/2" esfera','Latón niquelado, maneta de mariposa roja.',6.45,None,88,None),
 (318,'04-318',4,None,'Teflón 12 m × 12 mm, 10 rollos','Cinta de PTFE para roscas de agua y gas.',4.50,None,130,None),
 (325,'04-325',4,None,'Sifón botella para lavabo','Salida de 32 mm, regulable en altura.',7.10,None,46,None),
 (340,'04-340',4,'grifo','Grifo de lavabo monomando','Aireador antical, cartucho de 35 mm.',29.90,None,21,None),
 (346,'04-346',4,None,'Tubo multicapa 16 mm, rollo 50 m','Para agua fría, caliente y calefacción.',58.00,None,12,None),
 (501,'05-501',5,'cable','Cable H07V-K 1,5 mm², rollo 100 m','Cable flexible de cobre, color negro.',36.50,None,26,None),
 (520,'05-520',5,None,'Diferencial 2P 40 A 30 mA','Clase AC, para carril DIN.',24.90,None,33,None),
 (528,'05-528',5,None,'Magnetotérmico 1P+N 16 A','Curva C, poder de corte 6 kA.',6.80,None,120,None),
 (533,'05-533',5,None,'Caja de empalmes estanca 100×100','IP55 con conos de entrada.',3.15,None,140,None),
 (540,'05-540',5,None,'Bombilla LED E27 10 W luz cálida','Equivale a 75 W, 1055 lúmenes.',2.95,3.90,400,None),
 (547,'05-547',5,None,'Regleta de 5 enchufes con interruptor','Cable de 1,5 m y protección infantil.',8.20,None,77,None),
 (12,'06-012',6,None,'Pintura plástica blanca mate 15 L','Interior, alta cubrición, lavable.',39.90,46.00,34,None),
 (25,'06-025',6,'rodillo','Rodillo de esmalte 10 cm, 2 recambios','Espuma de poro fino para acabado liso.',4.30,None,90,None),
 (33,'06-033',6,None,'Cinta de carrocero 36 mm × 45 m','Se retira sin dejar restos hasta 7 días.',2.40,None,260,None),
 (40,'06-040',6,'silicona','Masilla acrílica blanca 300 ml','Para grietas y juntas en interior, pintable.',2.85,None,110,None),
 (48,'06-048',6,None,'Brocha plana 50 mm','Mezcla de cerda natural y sintética.',3.60,None,85,None),
 (51,'07-051',7,'tijera','Tijera cortasetos 54 cm','Hoja ondulada y mangos de aluminio.',24.50,None,15,None),
 (58,'07-058',7,None,'Manguera de riego 15 m con accesorios','Antitorsión, 19 mm, con pistola de 7 posiciones.',22.90,27.50,28,None),
 (63,'07-063',7,None,'Programador de riego a grifo','Pantalla LCD, hasta 4 riegos al día.',31.00,None,17,None),
 (70,'07-070',7,None,'Azada con mango de madera','Hoja forjada de 18 cm.',17.40,None,20,None),
 (76,'07-076',7,None,'Guantes de jardín talla 9','Palma de látex y dorso transpirable.',3.25,None,160,None),
]
units = ['V','Ah','mm','mm²','m','g','kg','cm','ml','L','W','A','J','piezas','rollos','recambios']
def nb(s):
    import re
    s = re.sub(r'(\d) (%s)\b' % '|'.join(map(re.escape, units)), lambda m: m.group(1)+NB+m.group(2), s)
    s = s.replace('de 100','de'+NB+'100').replace('de 200','de'+NB+'200').replace('de 50','de'+NB+'50')
    return s

users = [
 # id, email, pass, name, phone, role, company, nif
 (1,'admin@tornillomayor.es','Tornillo1987','Ramón Mayor Ortega','910000101','admin',None,None),
 (2,'pilar.mayor@tornillomayor.es','mostrador22','Pilar Mayor Ortega','910000102','admin',None,None),
 (3,'lucia.moreno@example.com','lucia2023','Lucía Moreno Gil','600000301','customer',None,None),
 (4,'javier.ruiz@example.net','qwerty123','Javier Ruiz Prieto','600000302','customer',None,None),
 (5,'carmen.lopez@example.org','carmen1975','Carmen López Vidal','600000303','customer',None,None),
 (6,'reformas.alcaraz@example.com','Alcaraz2019!','Andrés Alcaraz Soler','600000304','pro','Reformas Alcaraz, S.L.','B00000001'),
 (7,'fontaneria.benitez@example.net','tuberia88','Sergio Benítez Mora','600000305','pro','Fontanería Benítez','00000002X'),
 (8,'elec.navarro@example.org','voltios220','Marta Navarro Ibáñez','600000306','pro','Instalaciones Navarro, S.L.','B00000003'),
 (9,'tomas.serrano@example.com','123456','Tomás Serrano Rey','600000307','customer',None,None),
]
addresses = {
 3:'C/ del Olmo, 7, 2.º B · 28000 Madrid', 4:'Av. de los Robles, 112 · 28000 Madrid',
 5:'C/ Mayor, 3, bajo · 28000 Madrid', 6:'Pol. Ind. Las Arenas, nave 4 · 28000 Madrid',
 7:'C/ del Cauce, 19 · 28000 Madrid', 8:'C/ de la Corriente, 55, 1.º · 28000 Madrid',
 9:'Pza. del Mercado, 2, 4.º A · 28000 Madrid',
}
orders = [
 # id, user, status, date, card_last4, items [(pid, qty)]
 (1001,3,'entregado','2026-09-14 10:22:00','4242',[(118,1),(41,2)]),
 (1002,4,'entregado','2026-09-20 18:05:00','1881',[(9,1),(210,1)]),
 (1003,6,'entregado','2026-10-02 08:41:00','0005',[(60,10),(71,6),(130,2)]),
 (1004,5,'enviado','2026-10-28 12:13:00','3220',[(12,2),(19,2),(33,4)]),
 (1005,7,'entregado','2026-10-30 09:02:00','7718',[(301,20),(318,3),(312,8)]),
 (1006,8,'preparando','2026-11-17 16:47:00','9054',[(512,4),(520,3),(528,12)]),
 (1007,3,'preparando','2026-11-18 11:30:00','4242',[(58,1),(76,2)]),
 (1008,9,'pendiente','2026-11-19 20:15:00','6003',[(540,10)]),
]
reviews = [
 (118,3,5,'Va sobrado para casa','Lo he usado para colgar estanterías en ladrillo y en hormigón. Las dos baterías se agradecen.','2026-09-25 19:10:00'),
 (118,6,4,'Correcto para obra ligera','Para remates está bien; para hormigón armado tirad del SDS.','2026-10-10 07:55:00'),
 (41,4,5,'Los de siempre','Agarran bien en ladrillo hueco. Caja completa.','2026-09-28 13:20:00'),
 (9,4,4,'Buen peso','Equilibrado. El mango podría ser algo más largo.','2026-09-29 18:40:00'),
 (330,5,3,'Bonito pero el caño gira duro','Pasados unos días se suaviza. Instalación sencilla.','2026-08-12 10:00:00'),
 (512,8,5,'Cobre de calidad','Pasa bien por el tubo corrugado, sin enredos.','2026-11-01 17:35:00'),
 (19,5,5,'No salpica','Pinté el salón entero sin tapar casi nada.','2026-11-05 12:00:00'),
 (301,7,5,'Material serio','Uso diario en obra, ninguno ha fallado.','2026-11-02 08:15:00'),
]

o = []
w = o.append
w("""-- ============================================================
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
""")

w("INSERT INTO categories (id, slug, ref, name, position) VALUES\n" + ",\n".join(
  f"  ({i}, {q(s)}, {q(r)}, {q(n)}, {i})" for i,s,r,n in cats) + ";\n")
w("INSERT INTO products (id, ref, category_id, name, description, price, old_price, stock, drawing, home_position) VALUES\n" + ",\n".join(
  f"  ({i}, {q(r)}, {c}, {q(nb(n))}, {q(nb(d))}, {p:.2f}, {'NULL' if op is None else f'{op:.2f}'}, {s}, {q(dr)}, {'NULL' if hp is None else hp})"
  for i,r,c,dr,n,d,p,op,s,hp in P) + ";\n")
w("INSERT INTO users (id, email, password_hash, name, phone, address, role, company, nif, preferences, created_at) VALUES\n" + ",\n".join(
  f"  ({i}, {q(e)}, {q(bhash(pw))}, {q(n)}, {q(ph)}, {q(addresses.get(i, 'C/ de la Fragua, 14 · 28000 Madrid'))}, {q(r)}, {q(co)}, {q(nif)}, {q(json.dumps({'newsletter': i%2==0, 'vista': 'cuadricula'}))}, '2025-0{1+i%9}-1{i%9} 09:00:00')"
  for i,e,pw,n,ph,r,co,nif in users) + ";\n")
w("ALTER TABLE users AUTO_INCREMENT = 10;\n")
# Número completo de tarjeta cifrado con DES-ECB (clave de la instalación).
# Los pedidos 1001 y 1007 se pagaron con la misma tarjeta: el cifrado coincide (ECB).
card_enc = {
 1001:'fSPFk8lxQEyme5BlkKs5b8aT1QDiy6uA', 1002:'9kfIAqmiwyB7kihXmpbjNcaT1QDiy6uA',
 1003:'MTHPX3rg32D0PL+xuknaosaT1QDiy6uA', 1004:'NoBUHxQ8j/6K/hqxibJDxMaT1QDiy6uA',
 1005:'wMu870bUWuORwd2mWbXK68aT1QDiy6uA', 1006:'1fGA6y169YcBEG2+7FgSY8aT1QDiy6uA',
 1007:'fSPFk8lxQEyme5BlkKs5b8aT1QDiy6uA', 1008:'OkUeX9cDBGGUHc9yAsAXL8aT1QDiy6uA',
}
price = {p[0]: p[6] for p in P}
olines, ilines = [], []
for oid,u,st,dt,l4,items in orders:
    tot = sum(price[pid]*qt for pid,qt in items)
    olines.append(f"  ({oid}, {u}, {q(st)}, {q(addresses[u])}, {tot:.2f}, {q(l4)}, {q(card_enc.get(oid))}, {q(dt)})")
    for pid,qt in items:
        ilines.append(f"  ({oid}, {pid}, {qt}, {price[pid]:.2f})")
w("INSERT INTO orders (id, user_id, status, shipping_address, total, card_last4, card_enc, created_at) VALUES\n" + ",\n".join(olines) + ";\n")
w("INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES\n" + ",\n".join(ilines) + ";\n")
w("INSERT INTO reviews (product_id, user_id, rating, title, body, created_at) VALUES\n" + ",\n".join(
  f"  ({p}, {u}, {r}, {q(t)}, {q(b)}, {q(d)})" for p,u,r,t,b,d in reviews) + ";\n")
w("""INSERT INTO coupons (code, discount_pct, min_total, active, expires_at) VALUES
  ('BIENVENIDA10', 10, 30.00, 1, '2026-12-31'),
  ('OBRA15', 15, 300.00, 1, '2026-12-31'),
  ('VERANO25', 25, 0.00, 0, '2026-08-31');
""")
w("""INSERT INTO plugins (slug, name, kind, version, source_url, enabled) VALUES
  ('pasarela-tpv', 'Pasarela TPV Virtual', 'pasarela', '2.4.1', NULL, 1),
  ('envios-rapidos', 'Envíos Rápidos 24 h', 'transportista', '1.8.0', NULL, 1),
  ('recogida-tienda', 'Recogida en tienda', 'transportista', '1.2.3', NULL, 1);
""")
w("""INSERT INTO settings (name, value) VALUES
  ('shop_name', 'Tornillo Mayor'),
  ('shop_email', 'pedidos@tornillomayor.es'),
  ('free_shipping_from', '49'),
  ('supplier_stock_host', 'almacen.proveedor.local');
""")
sys.stdout.write("\n".join(o))
