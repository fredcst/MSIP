
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;

public function print_dossier_zip(array $dossierList, $user)
{
    // Crear zip temporal en /tmp
    $zipPath = tempnam('/tmp', 'ZIP_');

    $tempFiles = [];

    foreach ($dossierList as $dossier) {

        $folderName = $this->normalize($dossier->getCdossier());

        // Generar DOCX como string
        $fileContent = $this->print_dossier_for_zip($dossier, $user);

        // Crear DOCX temporal
        $tmpDocx = tempnam('/tmp', 'DOC_');
        file_put_contents($tmpDocx, $fileContent);

        $tempFiles[] = [
            PCLZIP_ATT_FILE_NAME => $tmpDocx,
            PCLZIP_ATT_FILE_NEW_FULL_NAME => $folderName . '/IG-FI.docx',
        ];

        // Adjuntos
        if (!empty($dossier->getFichiersJoint())) {

            foreach ($dossier->getFichiersJoint() as $pj) {

                $pjName = $this->normalize(substr($pj->getNomFichier(), 0, 100));
                $blob   = $pj->getBlobFichier();

                if (is_resource($blob)) {
                    rewind($blob);
                    $content = stream_get_contents($blob);
                } else {
                    $content = (string) $blob;
                }

                $tmpAttach = tempnam('/tmp', 'PJ_');
                file_put_contents($tmpAttach, $content);

                $tempFiles[] = [
                    PCLZIP_ATT_FILE_NAME => $tmpAttach,
                    PCLZIP_ATT_FILE_NEW_FULL_NAME => $folderName . '/' . $pjName,
                ];
            }
        }
    }

    // Crear ZIP
    $zip = new \PclZip($zipPath);
    $result = $zip->create($tempFiles);

    // 🔥 Borrar DOCX y adjuntos temporales
    foreach ($tempFiles as $file) {
        if (isset($file[PCLZIP_ATT_FILE_NAME]) && file_exists($file[PCLZIP_ATT_FILE_NAME])) {
            @unlink($file[PCLZIP_ATT_FILE_NAME]);
        }
    }

    if ($result == 0) {
        @unlink($zipPath);
        throw new \RuntimeException('Error creando ZIP: ' . $zip->errorInfo(true));
    }

    // Enviar ZIP y borrarlo después de descargar
    $response = new BinaryFileResponse($zipPath);
    $response->headers->set('Content-Type', 'application/zip');
    $response->setContentDisposition(
        ResponseHeaderBag::DISPOSITION_ATTACHMENT,
        'dossiers.zip'
    );

    $response->deleteFileAfterSend(true);

    return $response;
}


public function print_dossier_for_zip(FiDossier $dossier, $user)
{
    $template = TemplateManagement::DOSSIER_PATH;

    $this->tbs->LoadTemplate($template, OPENTBS_ALREADY_XML);
    $this->tbs->Plugin(OPENTBS_DELETE_COMMENTS);

    $print = new printclass();

    $blockDossier = $this->getDossierData($dossier, $user);

    $this->tbs->MergeBlock('d', array($blockDossier));

    if ($this->tbs->Plugin(OPENTBS_FILEEXISTS, 'word/header1.xml')) {

        $this->tbs->Plugin(OPENTBS_SELECT_HEADER);

        foreach ($blockDossier as $field => $val) {
            $this->tbs->MergeField($field, $val);
        }
    }

    // Crear DOCX temporal en /tmp
    $tempDocx = tempnam('/tmp', 'DOC_');

    $this->tbs->Show(OPENTBS_FILE, $tempDocx);

    $content = file_get_contents($tempDocx);

    @unlink($tempDocx);

    return $content;
}












use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;

public function print_dossier_zip(array $dossierList, $user)
{
    $workDir = realpath($this->getParameter('kernel.root_dir').'/../var') . '/dossiers_tmp';
    if (!is_dir($workDir)) {
        mkdir($workDir, 0775, true);
    }

    // Zip en el mismo directorio (no /tmp)
    $zipPath = $workDir . '/dossiers_' . date('Ymd_His') . '_' . uniqid() . '.zip';

    $tempFiles = [];

    foreach ($dossierList as $key => $dossier) {

        $folderName  = $this->normalize($dossier->getCdossier());

        // Generas el docx en memoria (string)
        $fileContent = $this->print_dossier_for_zip($dossier, $user);

        // Guardas docx temporal en tu carpeta
        $docxPath = $workDir . '/IG-FI_' . uniqid() . '.docx';
        file_put_contents($docxPath, $fileContent);

        $tempFiles[] = [
            PCLZIP_ATT_FILE_NAME => $docxPath,
            PCLZIP_ATT_FILE_NEW_FULL_NAME => $folderName . '/IG-FI.docx',
        ];

        // Adjuntos
        if (!empty($dossier->getFichiersJoint())) {
            foreach ($dossier->getFichiersJoint() as $pj) {
                $pjName = $pj->getNomFichier();
                $pjName = $this->normalize(substr($pjName, 0, 100));
                $blob   = $pj->getBlobFichier();

                if (is_resource($blob)) {
                    rewind($blob);
                    $content = stream_get_contents($blob);
                } else {
                    $content = (string) $blob;
                }

                $tmpAttachPath = $workDir . '/PJ_' . uniqid('', true);
                file_put_contents($tmpAttachPath, $content);

                $tempFiles[] = [
                    PCLZIP_ATT_FILE_NAME => $tmpAttachPath,
                    PCLZIP_ATT_FILE_NEW_FULL_NAME => $folderName . '/' . $pjName,
                ];
            }
        }
    }

    // Crear el zip
    $zip = new \PclZip($zipPath);
    $result = $zip->create($tempFiles);

    // Limpieza inmediata de intermedios (docx + adjuntos)
    foreach ($tempFiles as $f) {
        if (!empty($f[PCLZIP_ATT_FILE_NAME]) && is_file($f[PCLZIP_ATT_FILE_NAME])) {
            @unlink($f[PCLZIP_ATT_FILE_NAME]);
        }
    }

    if ($result == 0) {
        // Si falló, borra también el zip si existe
        if (is_file($zipPath)) {
            @unlink($zipPath);
        }
        throw new \RuntimeException('Error creando ZIP: ' . $zip->errorInfo(true));
    }

    // Respuesta como archivo (stream) y borrar zip tras enviar
    $response = new BinaryFileResponse($zipPath);
    $response->headers->set('Content-Type', 'application/zip');
    $response->setContentDisposition(
        ResponseHeaderBag::DISPOSITION_ATTACHMENT,
        'dossiers.zip'
    );

    // Esto hace que Symfony borre el zip cuando termine de enviarlo
    $response->deleteFileAfterSend(true);

    return $response;
}


public function print_dossier_for_zip(FiDossier $dossier, $user)
{
    $workDir = realpath($this->getParameter('kernel.root_dir').'/../var') . '/dossiers_tmp';
    if (!is_dir($workDir)) {
        mkdir($workDir, 0775, true);
    }

    $template = TemplateManagement::DOSSIER_PATH;

    $this->tbs->LoadTemplate($template, OPENTBS_ALREADY_XML);
    $this->tbs->Plugin(OPENTBS_DELETE_COMMENTS);

    $print = new printclass();

    $blockDossier = $this->getDossierData($dossier, $user);

    $this->tbs->MergeBlock('d', array($blockDossier));

    if ($this->tbs->Plugin(OPENTBS_FILEEXISTS, 'word/header1.xml')) {
        $this->tbs->Plugin(OPENTBS_SELECT_HEADER);
        foreach ($blockDossier as $field => $val) {
            $this->tbs->MergeField($field, $val);
        }
    }

    $tempDocx = tempnam($workDir, 'DOC_');
    $this->tbs->Show(OPENTBS_FILE, $tempDocx);

    $content = file_get_contents($tempDocx);
    @unlink($tempDocx);

    return $content;
}


$workDir = realpath($this->getParameter('kernel.root_dir').'/../var') . '/dossiers_tmp';
if (!is_dir($workDir)) { mkdir($workDir, 0775, true); }

$test = tempnam($workDir, 'FOO_');





<VirtualHost *:80>
  ServerName localhost

  DocumentRoot /var/simplesamlphp/public

  <Directory /var/simplesamlphp/public>
    Options FollowSymLinks
    AllowOverride All
    Require all granted
  </Directory>

  ErrorLog /proc/self/fd/2
  CustomLog /proc/self/fd/1 combined
</VirtualHost>



services:
  simplesamlphp:
    image: php:8.2-apache
    container_name: simplesamlphp
    ports:
      - "8080:80"
    volumes:
      # Monta tu SimpleSAMLphp ya descargado/configurado
      - ./simplesamlphp:/var/simplesamlphp:rw
    environment:
      APACHE_DOCUMENT_ROOT: /var/simplesamlphp/public
    command: >
      bash -lc "
        a2enmod rewrite headers &&
        sed -ri 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf /etc/apache2/apache2.conf &&
        sed -ri 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf &&
        apache2-foreground
      "
    restart: unless-stopped

  # Opcional: PostgreSQL (solo si tu config de SimpleSAMLphp lo usa)
  postgresql:
    image: postgres:16-alpine
    container_name: postgresql
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
      POSTGRES_DB: simplesaml
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  pgdata:



# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
