# Anatomia 3D (`/anatomia`)

A página `/anatomia` mostra um modelo 3D da cabeça focado no nariz e nos seios da face: o usuário escolhe um corte
(Inteiro, Perfil, Cornetos, De frente, Horizontal), liga e desliga estruturas e toca numa estrutura para ler o que ela é.

## Peças

| O quê | Onde |
|---|---|
| Página (texto, créditos, CTA) | `app/(default)/anatomia/page.tsx` |
| Conteúdo: estruturas, grupos, cores, textos, cortes, rótulos | `lib/atlas/head.ts` (tipos em `lib/atlas/types.ts`) |
| Motor three.js (cortes com tampas, camadas fantasma, seleção, câmera) | `components/atlas/atlas-engine.ts` |
| Rótulos 3D → 2D | `components/atlas/atlas-labels.ts` |
| Interface React | `components/atlas/atlas-viewer.tsx`, `app/css/additional-styles/atlas.css` |
| Modelo | `public/models/cabeca.glb` (~1,7 MB, meshopt + quantização) |

Textos e cortes são editados só em `lib/atlas/head.ts`. Ao trocar o `.glb`, aumente `MODEL_VERSION` nesse arquivo:
`/models/*` é servido com cache imutável.

## Modelo

Feito a partir da tomografia de **um adulto real** do conjunto público
[NasalSeg](https://zenodo.org/records/12177181) (Zhang et al., *Scientific Data* 2024, CC BY 4.0), sujeito P099:
ossos, seios da face (com a abertura do seio maxilar), cornetos inferior e médio, septo e olhos. O
[BodyParts3D](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/) (CC BY-SA 2.1 JP) só divide o osso em peças nomeadas
e fornece as cartilagens do nariz e os dentes. **Os dois créditos precisam ficar na página.** A pele é suavizada
(σ 3,5 mm) para que a pessoa não seja identificável.

Eixos: +x = lado esquerdo do paciente, +y = cima, +z = frente, em cm; o septo fica em x = 0.

### Gerar de novo

```sh
# 1. Uma vez: baixar a tomografia e os rótulos para .cache/ct/raw (ignorado pelo git; nunca versionar)
#    (comandos no cabeçalho de scripts/anatomy/ct/00_fetch.py)
# 2. Segmentação (Python via uv, ~10 min)
scripts/anatomy/ct/run-all.sh 01_orient 02_resample 03_register 04_air 05_sinus 05b_ostium 06_bone 07_teeth 08_soft 09_mesh 10_skin 11_cart
# 3. Malhas → GLB + verificações
corepack pnpm build:anatomy
```

O cabeçalho de `build-head.mjs` descreve cada etapa e lista onde o modelo foi ajustado para ficar legível (fresta entre
os cornetos, distância mínima do septo, abertura do seio maxilar traçada). `check-head.mjs` roda no fim e **falha** se
alguma peça não for fechada/manifold, se houver interpenetração entre osso, seios e cornetos, se as folgas dos meatos e
do septo caírem abaixo do mínimo, ou se o arquivo passar de 2,5 MB. Também imprime a tabela de volumes dos seios.

`head-lib.mjs`, `mesh.mjs` e `sdf.mjs` são utilitários (voxels, booleanas com manifold-3d, decimação, leitura do GLB).
