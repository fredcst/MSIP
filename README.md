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