
public function print_dossier_for_zip(FiDossier $dossier, $user)
{
    $template = TemplateManagement::DOSSIER_PATH;

    $this->tbs->LoadTemplate($template, OPENTBS_ALREADY_XML);
    $this->tbs->PlugIn(OPENTBS_DELETE_COMMENTS);

    $print = new printclass();

    $blockDossier = $this->getDossierData($dossier, $user);

    $this->tbs->MergeBlock('d', array($blockDossier));

    if ($this->tbs->Plugin(OPENTBS_FILEEXISTS, 'word/header1.xml')) {
        $this->tbs->Plugin(OPENTBS_SELECT_HEADER);

        foreach ($blockDossier as $field => $val) {
            $this->tbs->MergeField($field, $val);
        }
    }

    // 🔥 CLAVE:
    $tempDocx = tempnam(sys_get_temp_dir(), "DOC");

    // Guardar DOCX COMPLETO
    $this->tbs->Show(OPENTBS_FILE, $tempDocx);

    // Leer binario REAL
    $content = file_get_contents($tempDocx);

    unlink($tempDocx);

    return $content;
}

public function print_dossier_for_zip(FiDossier $dossier, $user)
{
    // 1. Preparar como original
    $template = TemplateManagement::DOSSIER_PATH;

    $this->tbs->LoadTemplate($template, OPENTBS_ALREADY_XML);
    $this->tbs->PlugIn(OPENTBS_DELETE_COMMENTS);

    $print = new printclass();

    $blockDossier = $this->getDossierData($dossier, $user);

    $dataToMerge = array($blockDossier);

    $this->tbs->MergeBlock('d', $dataToMerge);

    if ($this->tbs->Plugin(OPENTBS_FILEEXISTS, 'word/header1.xml')) {

        $this->tbs->Plugin(OPENTBS_SELECT_HEADER);

        foreach ($blockDossier as $field => $val) {
            $this->tbs->MergeField($field, $val);
        }
    }

    // 🔥 AQUÍ TU LÓGICA ORIGINAL DE BINARIO
    $test = tempnam(sys_get_temp_dir(), "FOO");

    $this->tbs->Show(OPENTBS_FILE, $test);

    $zip = new clsTbsZip();
    $zip->open($test);

    $content = $zip->FileRead('word/document.xml');

    $zip->close();

    unlink($test);

    return $content;
}


public function print_dossier_capture(FiDossier $dossier, $user)
{
    // 1. Capturar salida
    ob_start();

    // 2. Llamar ORIGINAL
    $this->print_dossier($dossier, $user);

    // 3. Tomar binario
    $content = ob_get_clean();

    return $content;
}

public function print_dossier_for_zip(FiDossier $dossier, $user)
{
    // 1. Iniciar TBS
    $this->tbs = new clsTinyButStrong();
    $this->tbs->Plugin(TBS_INSTALL, OPENTBS_PLUGIN);

    // 2. MISMA lógica que original
    $template = TemplateManagement::DOSSIER_PATH;

    $this->tbs->LoadTemplate($template, OPENTBS_ALREADY_XML);
    $this->tbs->PlugIn(OPENTBS_DELETE_COMMENTS);

    // 👉 ESTO FALTABA
    $print = new printclass();

    // 3. Obtener datos
    $blockDossier = $this->getDossierData($dossier, $user);

    $dataToMerge = array(
        $blockDossier,
    );

    $this->tbs->MergeBlock('d', $dataToMerge);

    // 👉 TAMBIÉN esto es clave para cabeceras
    if ($this->tbs->Plugin(OPENTBS_FILEEXISTS, 'word/header1.xml')) {

        $this->tbs->Plugin(OPENTBS_SELECT_HEADER);

        foreach ($blockDossier as $field => $val) {
            $this->tbs->MergeField($field, $val);
        }
    }

    // 4. DEVOLVER DOCX COMPLETO
    return $this->tbs->Show(OPENTBS_STRING);
}

public function print_dossier_for_zip(FiDossier $dossier, $user)
{
    // 1. Iniciar TBS como lo hace tu app
    $this->tbs = new clsTinyButStrong();
    $this->tbs->Plugin(TBS_INSTALL, OPENTBS_PLUGIN);

    // 2. Cargar misma plantilla
    $template = TemplateManagement::DOSSIER_PATH;

    $this->tbs->LoadTemplate($template, OPENTBS_ALREADY_XML);
    $this->tbs->PlugIn(OPENTBS_DELETE_COMMENTS);

    // 3. Obtener datos reales
    $blockDossier = $this->getDossierData($dossier, $user);

    $dataToMerge = array(
        $blockDossier,
    );

    // 4. Merge idéntico al original
    $this->tbs->MergeBlock('d', $dataToMerge);

    if ($this->tbs->Plugin(OPENTBS_FILEEXISTS, 'word/header1.xml')) {

        $this->tbs->Plugin(OPENTBS_SELECT_HEADER);

        foreach ($blockDossier as $field => $val) {
            $this->tbs->MergeField($field, $val);
        }
    }

    // 5. 👉 AQUÍ LA DIFERENCIA CLAVE:
    // Devolver DOCX en memoria
    return $this->tbs->Show(OPENTBS_STRING);
}


foreach ($dossierList as $dossier) {

    $folderName = $this->normalize($dossier->getTitre());

    // 👉 USAMOS NUEVO MÉTODO
    $fileContent = $this->print_dossier_for_zip($dossier, $user);

    $fileName = $folderName.'.docx';

    $routePrint = sys_get_temp_dir().'/'.$fileName;

    file_put_contents($routePrint, $fileContent);

    $tempFiles[] = [
        PCLZIP_ATT_FILE_NAME => $routePrint,
        PCLZIP_ATT_FILE_NEW_FULL_NAME =>
            $folderName.'/'.$fileName
    ];
}





import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])
