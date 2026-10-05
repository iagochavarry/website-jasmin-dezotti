# Modelos 3D de anatomia / cirurgia

Páginas em `/cirurgias/<slug>` mostram um modelo 3D interativo com etapas.

## Como funciona

1. **Modelo** — `pnpm build:anatomy` gera `public/models/nariz.glb` (~0,8 MB, meshopt).
   - Anatomia real do [BodyParts3D](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/)
     (CC BY-SA 2.1 JP — manter o crédito na página). Os STLs são baixados para `.cache/`.
   - **Cortes limpos**: nenhum recorte descarta triângulos. `mesh.mjs#splitByField` divide a malha
     por um campo escalar (plano ou campo suave), interpola vértices (posição, normais e *morph
     targets*) e devolve os dois lados com vértices idênticos; depois `dropIslands` remove
     fragmentos e `smoothBoundary` alisa as bordas rasgadas do scan.
   - `floor.mjs`: mede o assoalho nasal (z-buffer das faces voltadas para cima), corta maxila e
     palatino logo abaixo dele (sem processo alveolar nem dentes) e adiciona uma laje fechada
     sob o assoalho, para que o corte coronal pareça sólido. O mesmo perfil apoia o septo no assoalho.
   - `solid.mjs`: ossos nasais perfurados viram sólidos fechados (isosuperfície da distância à casca).
   - `concha.mjs`: conchas inferiores comprimidas/elevadas (meato inferior visível) e ligadas à parede lateral.
   - `septum.mjs` reconstrói o septo (a lâmina perpendicular não existe no scan) como UMA placa
     contínua (normais calculadas no todo) e só então a divide em peças (estrutura em L, porção
     ressecada, vômer, lâmina perpendicular, esporão) por campos suaves, sem costura. Também gera
     mucosa, incisão, splints e suturas, e grava *morph targets* (`desvio`, `descolamento`).
     A estrutura em L mantém ≥ 1 cm (distância euclidiana ⇒ perpendicular) de TODA a borda dorsal
     (inclusive a borda oblíqua condro-etmoidal) e ≥ 1,05 cm da borda caudal.
   - `check.mjs` roda no fim do build e **falha** (exit 1) se algum invariante quebrar: largura da
     estrutura em L, folgas das conchas, contato septo–assoalho, fragmentos, dentes, descolamento da
     mucosa, folga do fluxo de ar (≥ 0,12 cm nos dois estados) e âncoras dos rótulos (só relatório).
     `geom.mjs` é a consulta de distância ponto–triângulo usada nas verificações.
   - `route-airflow.mjs` (ferramenta de desenvolvimento) sugere os pontos de controle do fluxo de ar:
     `ANATOMY_RAW=/tmp/raw.glb node scripts/anatomy/build-nose.mjs && node scripts/anatomy/route-airflow.mjs /tmp/raw.glb`.
   - **Estrutura em L**: a ressecção da cartilagem vai até a base atrás da faixa caudal; só restam as duas
     faixas (dorsal ≥ 1,0 cm e caudal ≥ 1,05 cm), formando um "L" nítido (invariante em `check.mjs`).
   - **Descolamento articulado** (`descolamento` da mucosa esquerda): levanta ~0,7 cm na incisão e decai
     em cosseno até 0 numa dobradiça ~3,4 cm atrás, some perto do teto (y > 2,4) e é limitado pela
     distância 3D às estruturas à esquerda; as cartilagens laterais/alares esquerdas recuam junto
     (morph `descolamento`). `check.mjs` garante folga ≥ 0,02 cm.
   - **Corte coronal `corte_*`** (`slice.mjs`): fatia de livro-texto em z0 = −2,5 (concha inferior maior,
     esporão ao lado), sólidos fechados com a face frontal exatamente em z0 e 0,6 cm de profundidade:
     osso (parede lateral fina, assoalho, teto abobadado e fenda olfatória de 2–4 mm), conchas inferiores
     e médias presas à parede, septo por tecido (PPE/vômer/cartilagem), mucosa septal e da parede e ar
     (um nó por lado, morph `desvio` do mesmo campo D do modelo 3D). Parâmetros em `SLICE`; invariantes de
     z0, tamanho das conchas, meato inferior, fenda olfatória e larguras do ar em `check.mjs`.
   - Eixos: +x = lado esquerdo do paciente, +y = cima, +z = anterior. Unidade: cm.
2. **Roteiro** — `lib/anatomy/procedures/<slug>.ts`: camadas, nomes/descrições das
   peças (toque para identificar), rótulos e as etapas. Cada etapa é um estado-alvo
   (câmera, opacidade das camadas, cortes, morphs, peças removidas, destaques) e o
   motor anima a transição.
3. **Motor** — `components/anatomy/engine.ts` (three.js, sem React) e
   `procedure-viewer.tsx` (interface).

## Nova cirurgia

1. Gerar/estender um `.glb` (novo script em `scripts/anatomy/` se precisar de outra região).
2. Criar `lib/anatomy/procedures/<slug>.ts` e registrar em `procedures/index.ts`.
3. Criar `app/(default)/cirurgias/<slug>/page.tsx` com `<ProcedureViewer slug="<slug>" />`.

Para ajustar câmeras e rótulos, em desenvolvimento o motor fica em `window.__anatomy`.
