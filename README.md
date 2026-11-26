# Tornillo Mayor

Tienda online ficticia, vulnerable a propósito, para prácticas de pentest en caja negra.
**Solo para la red local del aula. Nunca la publiques en Internet.** Producto y catálogo de fallos: `PRODUCT.md`.

## Levantar

```bash
sudo docker compose up --build -d      # tienda en http://<ip-del-equipo>:8085
sudo docker compose down -v            # reinicio limpio (borra la base de datos)
```

MySQL solo escucha en `127.0.0.1:3308`. Los valores por defecto están en `.env.example`.

## Desarrollo sin Docker

```bash
cd backend && DB_HOST=127.0.0.1 DB_PORT=3308 npm run dev    # API en :4000 (con el MySQL del compose)
cd frontend && npx vite                                      # web en :5173, /api va al :4000
```

## Datos semilla

`database/init.sql` se genera con `python3 database/generar_init.py > database/init.sql`.
Las contraseñas en claro de las cuentas sembradas están en ese script (solo para el instructor).

## Correo

No hay servidor de correo. Los enlaces de recuperación de contraseña se escriben en el registro del backend:
`sudo docker logs tm-backend | grep correo`.
