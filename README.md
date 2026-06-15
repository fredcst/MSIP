version: '3.8'

services:
  postgres:
    image: postgres:16
    container_name: compass-postgres
    environment:
      POSTGRES_DB: compass
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:


- |
  set -eu

  until mc alias set local http://minio:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"; do
    echo "Waiting for MinIO..."
    sleep 2
  done

  mc mb --ignore-existing "local/${MINIO_BUCKET}"
  mc anonymous set download "local/${MINIO_BUCKET}"

  cat > /tmp/lumen-cors.xml <<EOF
  <CORSConfiguration>
    <CORSRule>
      <AllowedOrigin>*</AllowedOrigin>
      <AllowedMethod>GET</AllowedMethod>
      <AllowedMethod>PUT</AllowedMethod>
      <AllowedMethod>POST</AllowedMethod>
      <AllowedMethod>HEAD</AllowedMethod>
      <AllowedHeader>*</AllowedHeader>
    </CORSRule>
  </CORSConfiguration>
EOF

  mc cors set "local/${MINIO_BUCKET}" /tmp/lumen-cors.xml

  mc ilm rule add --expire-days 7 --prefix 'full/' "local/${MINIO_BUCKET}" || true

  echo "MinIO bucket ready."



cat > /tmp/lumen-cors.xml <<'XML'
<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>http://localhost:4200</AllowedOrigin>

    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>HEAD</AllowedMethod>

    <AllowedHeader>*</AllowedHeader>

    <ExposeHeader>ETag</ExposeHeader>
    <ExposeHeader>Content-Length</ExposeHeader>
    <ExposeHeader>Content-Type</ExposeHeader>
    <ExposeHeader>Cache-Control</ExposeHeader>

    <MaxAgeSeconds>3600</MaxAgeSeconds>
  </CORSRule>
</CORSConfiguration>
XML

mc cors set "local/${MINIO_BUCKET}" /tmp/lumen-cors.xml