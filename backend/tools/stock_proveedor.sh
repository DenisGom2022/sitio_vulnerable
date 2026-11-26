#!/bin/sh
# Herramienta heredada de consulta de stock del almacén del proveedor.
# Uso: stock_proveedor.sh <referencia>
REF="$1"
DIR=$(dirname "$0")
LINE=$(grep -m1 "^${REF};" "$DIR/proveedor.csv")
if [ -n "$LINE" ]; then
  DISP=$(echo "$LINE" | cut -d';' -f2)
  PLAZO=$(echo "$LINE" | cut -d';' -f3)
  echo "ref ${REF} · disponible ${DISP} unidades · plazo ${PLAZO}"
else
  echo "ref ${REF} · sin existencias en el proveedor"
fi
