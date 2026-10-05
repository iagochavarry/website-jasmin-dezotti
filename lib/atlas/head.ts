// Content and presets of the 3D anatomy explorer. Edit texts, colours, cuts and labels here.
// Model frame (public/models/cabeca.glb): +x = patient's LEFT, +y = up, +z = front, units = cm.
import type { CutDef, GroupDef, StructureDef } from "./types";

/** Model file in /models and its cache-busting version (bump MODEL_VERSION whenever the GLB changes; /models is served immutable). */
export const MODEL_FILE = "cabeca.glb";
export const MODEL_VERSION = "2026-10-05.1";
export const MODEL_URL = `/models/${MODEL_FILE}?v=${MODEL_VERSION}`;

/** One flat colour for every bone section, so cut bone reads as one solid. */
const BONE_CAP = "#B8AE98";

export const GROUPS: GroupDef[] = [
  { id: "rosto", name: "Rosto", text: "É a superfície do rosto. Aparece como um vidro leve só para mostrar onde cada estrutura fica em relação ao rosto." },
  { id: "ossos", name: "Ossos do crânio", color: "#EADCBE", text: "São os ossos que protegem o cérebro e dão forma ao rosto. Eles também guardam os seios da face e sustentam o nariz." },
  {
    id: "seios", name: "Seios da face", open: true,
    text: "São cavidades cheias de ar dentro dos ossos do rosto, ligadas ao nariz por pequenas aberturas. Quando essas aberturas incham, o muco fica retido e pode surgir a sinusite. A cor mostra o espaço de ar de cada seio, não é líquido nem doença.",
    note: "A cor mostra o espaço de ar de cada seio — não é líquido nem doença.",
  },
  {
    id: "septo", name: "Septo nasal", color: "#BFD6DC",
    text: "É a parede que divide o nariz em dois lados. Na frente é de cartilagem e atrás é de osso. Quando fica torto, falamos em desvio de septo, que pode dificultar a passagem do ar.",
  },
  {
    id: "cornetos", name: "Cornetos", color: "#D58A88",
    text: "São estruturas cobertas por mucosa, com osso por dentro, na parede lateral de cada lado do nariz. Aquecem, umidificam e filtram o ar. Quando incham, como na rinite, o nariz entope. Costumam ser três de cada lado; neste modelo aparecem o inferior e o médio, que são os maiores.",
  },
  { id: "cartilagens", name: "Cartilagens do nariz", text: "Dão forma à ponta e às laterais do nariz. São firmes, mas flexíveis, e mantêm as narinas abertas para o ar passar." },
  { id: "olhos", name: "Olhos", text: "Aparecem aqui só para orientar. Ficam em cavidades ósseas chamadas órbitas, separadas do nariz e dos seios por paredes ósseas muito finas." },
];

export const STRUCTURES: StructureDef[] = [
  // ── Rosto ──
  {
    id: "pele", group: "rosto", parts: ["^pele$"], material: "skin", color: "#E7B292",
    name: "Pele do rosto",
    text: "É a superfície do rosto. Ela aparece como um vidro leve só para mostrar onde cada estrutura fica em relação ao rosto.",
  },
  // ── Ossos ──
  {
    id: "cranio", group: "ossos", material: "bone", color: "#EADCBE", cap: BONE_CAP,
    parts: ["^osso_(frontal|parietal|occipital|temporal_|esfenoide|zigomatico_|lacrimal_)"],
    name: "Crânio",
    technical: "Ossos frontal, parietal, temporal, occipital, esfenoide, zigomático e lacrimal",
    text: "É a estrutura óssea que protege o cérebro e forma a testa, as têmporas e as órbitas dos olhos. Vários seios da face ficam dentro destes ossos, como pequenas câmaras de ar.",
  },
  {
    id: "maxila", group: "ossos", material: "bone", color: "#E6D6B6", cap: BONE_CAP,
    parts: ["^maxila_", "^osso_palatino_"],
    name: "Maxila",
    technical: "Maxila e osso palatino",
    text: "É o osso que forma a arcada dos dentes de cima, o céu da boca e o assoalho do nariz. Dentro dela, na altura das bochechas, fica o seio maxilar.",
  },
  {
    id: "ossos_nasais", group: "ossos", material: "bone", color: "#F1E4C9", cap: BONE_CAP,
    parts: ["^osso_nasal_"],
    name: "Ossos do nariz",
    technical: "Ossos nasais",
    text: "São dois ossinhos finos que formam a parte dura do nariz, logo abaixo da testa. Mais para baixo, o nariz é feito de cartilagem.",
  },
  {
    id: "etmoide", group: "ossos", material: "bone", color: "#E9D3B0", cap: BONE_CAP,
    parts: ["^osso_etmoide$"],
    name: "Osso etmoide",
    technical: "Osso etmoide",
    text: "É um osso delicado entre os olhos, no alto do nariz. Contém as células do seio etmoidal e dele saem o corneto médio e parte do septo.",
  },
  {
    id: "mandibula", group: "ossos", material: "bone", color: "#EFE3C8", cap: BONE_CAP,
    parts: ["^mandibula$", "^dentes_"],
    name: "Mandíbula e dentes",
    technical: "Mandíbula e dentes",
    text: "É o osso móvel do queixo. Ajuda a mostrar a posição do rosto, mas não faz parte do nariz nem dos seios da face.",
  },
  // ── Seios da face ──
  {
    id: "seio_frontal", group: "seios", parts: ["^seio_frontal_"], material: "sinus", color: "#F0A15B",
    name: "Seio frontal",
    text: "Fica dentro do osso da testa, acima do nariz e das sobrancelhas. Costuma ser diferente de um lado para o outro e só termina de se formar na adolescência. Varia muito de pessoa para pessoa; neste modelo ele é grande.",
  },
  {
    id: "seio_etmoidal", group: "seios", parts: ["^seio_etmoidal_"], material: "sinus", color: "#5FBF97",
    name: "Seio etmoidal",
    technical: "Células etmoidais",
    text: "É um conjunto de várias pequenas células de ar, como um favo de mel, entre o nariz e os olhos. Já existe ao nascer e fica muito perto da órbita.",
  },
  {
    id: "seio_maxilar", group: "seios", parts: ["^seio_maxilar_"], material: "sinus", color: "#5D9FE6",
    name: "Seio maxilar",
    text: "É o maior dos seios da face. Fica dentro da maxila, na altura das bochechas, logo acima dos dentes de cima, e drena por uma pequena abertura para dentro do nariz. É um dos seios mais envolvidos nas sinusites.",
  },
  {
    id: "seio_esfenoidal", group: "seios", parts: ["^seio_esfenoidal_"], material: "sinus", color: "#A889DB",
    name: "Seio esfenoidal",
    text: "É o seio mais profundo, no centro da cabeça, atrás do nariz. Fica perto de estruturas delicadas, como o nervo óptico e a hipófise, e por isso os exames de imagem ajudam a avaliá-lo.",
  },
  // ── Nariz ──
  {
    id: "septo_cartilagem", group: "septo", parts: ["^septo_cartilagem$"], material: "cartilage", color: "#BFD6DC",
    name: "Cartilagem do septo",
    technical: "Cartilagem quadrangular do septo",
    text: "É a parede que divide o nariz em duas passagens de ar. Na parte da frente ela é feita de cartilagem, que é firme e um pouco flexível. Quando o septo é torto, chamamos de desvio de septo.",
  },
  {
    id: "septo_lamina", group: "septo", parts: ["^septo_lamina_perpendicular$"], material: "bone", color: "#D9C29A", cap: "#B49C72",
    name: "Lâmina perpendicular (osso)",
    technical: "Lâmina perpendicular do etmoide",
    text: "É um osso muito fino, na parte de cima e de trás do septo, que vem do osso etmoide e se encaixa na cartilagem. Desvios também podem acontecer nesta parte.",
  },
  {
    id: "septo_vomer", group: "septo", parts: ["^vomer$"], material: "bone", color: "#CDB58A", cap: "#A99068",
    name: "Vômer (osso)",
    technical: "Vômer",
    text: "É um osso fino, na parte de baixo e de trás do septo. Ele se apoia no assoalho do nariz e se encaixa na cartilagem e na lâmina perpendicular.",
  },
  {
    id: "concha_inferior", group: "cornetos", parts: ["^concha_inferior_"], material: "mucosa", color: "#D58A88", cap: "#B07574",
    name: "Corneto inferior",
    technical: "Concha nasal inferior",
    text: "É a maior das três \"prateleiras\" da lateral do nariz e aquece e umidifica o ar que respiramos. Quando incha, por rinite por exemplo, o nariz entope: é uma das causas mais comuns de nariz congestionado.",
  },
  {
    id: "concha_media", group: "cornetos", parts: ["^concha_media_"], material: "mucosa", color: "#EDB0AC", cap: "#C48D8A",
    name: "Corneto médio",
    technical: "Concha nasal média",
    text: "Fica acima do corneto inferior. Debaixo dele ficam as aberturas por onde drenam os seios maxilar, frontal e parte do etmoidal, por isso esta região é muito importante nas sinusites.",
  },
  {
    id: "cartilagens", group: "cartilagens", parts: ["^cartilagem_lateral_", "^cartilagem_alar_"], material: "cartilage", color: "#CFE0E3",
    name: "Cartilagens do nariz",
    technical: "Cartilagens laterais superiores e alares",
    text: "Dão forma à ponta e às laterais do nariz. São firmes, mas flexíveis, e sustentam as narinas abertas para o ar passar.",
  },
  // ── Olhos ──
  {
    id: "olhos", group: "olhos", parts: ["^olho_"], material: "eye", color: "#DDD6C8", cap: "#B9B2A4", opacity: 0.6,
    name: "Olhos",
    technical: "Globos oculares",
    text: "Aparecem aqui só para orientar. Eles ficam em cavidades ósseas chamadas órbitas, separadas do nariz e dos seios por paredes ósseas muito finas.",
  },
];

// Default structure sets
const OSTIO_INFO = "É por esta pequena abertura que o seio maxilar drena para o nariz, debaixo do corneto médio. Quando ela incha e fecha, o muco fica preso e pode surgir a sinusite.";
const SEIOS = ["seio_frontal", "seio_etmoidal", "seio_maxilar", "seio_esfenoidal"];
const OSSOS = ["cranio", "maxila", "ossos_nasais", "etmoide", "mandibula"];
const SEPTO = ["septo_cartilagem", "septo_lamina", "septo_vomer"];
const CORNETOS = ["concha_inferior", "concha_media"];

export const CUTS: CutDef[] = [
  {
    id: "inteiro", name: "Inteiro", short: "Inteiro", hint: "Modelo inteiro · os seios da face aparecem por dentro do crânio.",
    plane: null,
    camera: { dir: [-0.53, 0.14, 0.84], focus: [[-7, -5.5, -9], [7, 7.8, 2.9]], fill: 0.84 },
    visible: ["pele", ...OSSOS, ...SEIOS],
    labels: [
      { structure: "seio_frontal" }, { structure: "seio_etmoidal", side: "esq" },
      { structure: "seio_maxilar", side: "dir" }, { structure: "seio_esfenoidal" },
    ],
  },
  {
    id: "sagital", name: "Perfil (corte sagital)", short: "Perfil", hint: "Corte sagital · uma \"fatia\" no meio do rosto, vista de lado: mostra o septo (cartilagem e osso) e os seios frontal e esfenoidal.",
    plane: { axis: "x", keep: "neg", offset: 0, min: -1.4, max: 0.4, minLabel: "Mais à direita", maxLabel: "Mais à esquerda" },
    camera: { dir: [1, 0.05, 0.04], portraitFocus: [[-0.5, -3.4, -7.8], [0.5, 6.6, 3.0]], focus: [[-0.5, -4.6, -8.2], [0.5, 7.6, 2.9]] },
    visible: [...OSSOS, ...SEIOS, ...SEPTO, ...CORNETOS, "cartilagens"],
    labels: [
      { structure: "septo_lamina", text: "Lâmina perpendicular", column: "left" },
      { structure: "septo_cartilagem", text: "Septo · cartilagem", column: "left" },
      { structure: "septo_vomer", text: "Vômer", column: "right" },
      { structure: "seio_frontal", column: "left" }, { structure: "seio_esfenoidal", column: "right" },
    ],
  },
  {
    id: "parede", name: "Cornetos (parede lateral do nariz)", short: "Cornetos",
    hint: "Parede lateral do nariz · vista de lado, sem o septo: os cornetos inferior e médio e, atrás deles, os seios etmoidal e esfenoidal.",
    plane: { axis: "x", keep: "neg", offset: -0.3, min: -2.2, max: -0.1, minLabel: "Lado direito do paciente", maxLabel: "Perto do centro" },
    camera: { dir: [1, 0.05, 0.04], portraitFocus: [[-0.8, -3.4, -7.8], [0.2, 6.6, 3.0]], focus: [[-0.8, -4.6, -8.2], [0.2, 7.6, 2.9]] },
    visible: [...OSSOS, ...SEIOS, ...CORNETOS, "cartilagens"],
    labels: [
      { structure: "concha_media" }, { structure: "concha_inferior" },
      { structure: "ostio", text: "Abertura do seio maxilar", point: [-1.2, 0.45, -2.7], info: OSTIO_INFO },
      { structure: "seio_etmoidal", side: "dir" }, { structure: "seio_esfenoidal", side: "dir" },
      { structure: "meato_medio", text: "Meato médio", point: [-0.75, -0.12, -3.6], info: "É o espaço debaixo do corneto médio. É ali que drenam os seios maxilar, frontal e parte do etmoidal." },
      { structure: "meato_inferior", text: "Meato inferior", point: [-0.8, -1.75, -2.4], info: "É o espaço debaixo do corneto inferior, junto ao assoalho do nariz. Por ali passa o ar e drena a lágrima, que vem do canto do olho." },
    ],
  },
  {
    id: "coronal", name: "De frente (corte coronal)", short: "De frente",
    hint: "Corte coronal · o mais usado na tomografia dos seios da face: seios maxilares, células etmoidais, cornetos e órbitas, lado a lado, na região por onde os seios drenam.",
    plane: { axis: "z", keep: "neg", offset: -2.8, min: -4.2, max: -1.0, minLabel: "Mais atrás", maxLabel: "Mais à frente" },
    camera: { dir: [0, 0.07, 1], portraitFocus: [[-4.8, -3.4, -3.2], [4.8, 3.8, -2.4]], fill: 0.88, focus: [[-5.6, -4.6, -3.2], [5.6, 6.2, -2.4]] },
    visible: [...OSSOS, ...SEIOS, ...SEPTO, ...CORNETOS],
    labels: [
      { structure: "seio_maxilar", side: "esq", column: "right" }, { structure: "concha_inferior", side: "dir", column: "left" },
      { structure: "concha_media", side: "esq", column: "right", desktopOnly: true }, { structure: "septo_lamina", text: "Lâmina perpendicular", column: "left", desktopOnly: true },
      { structure: "seio_etmoidal", side: "dir", column: "left", desktopOnly: true },
      { structure: "ostio", text: "Abertura do seio maxilar", point: [-1.2, 0.45, -2.7], column: "left", info: OSTIO_INFO },
    ],
  },
  {
    id: "axial", name: "Horizontal (corte axial)", short: "Horizontal",
    hint: "Corte axial · como na tomografia, visto de baixo: a frente do rosto no alto e o lado direito do paciente à esquerda. Mostra os seios maxilares, o septo e os cornetos.",
    plane: { axis: "y", keep: "pos", offset: -0.8, min: -2.4, max: 2.4, minLabel: "Mais para baixo", maxLabel: "Mais para cima" },
    camera: { dir: [0, -1, 0], up: [0, 0, 1], focus: [[-5.2, -0.9, -5.4], [5.2, -0.7, 3.2]], portraitFocus: [[-4.8, -0.9, -4.2], [4.8, -0.7, 3.2]] },
    visible: [...OSSOS, ...SEIOS, ...SEPTO, ...CORNETOS, "cartilagens"],
    labels: [
      { structure: "seio_maxilar", side: "dir", column: "left" }, { structure: "seio_maxilar", side: "esq", column: "right" },
      { structure: "septo_cartilagem", text: "Septo · cartilagem", column: "right" },
    ],
  },
];

export const INFO_CARDS = [
  {
    title: "O que são os seios da face",
    text: "São cavidades cheias de ar dentro dos ossos do rosto, revestidas por uma mucosa fina. Cada seio se comunica com o nariz por uma abertura pequena. Quando essa abertura incha, o muco fica retido e pode surgir a sinusite.",
  },
  {
    title: "O septo nasal",
    text: "É a parede que divide o nariz ao meio, em cartilagem na frente e osso atrás. Um pequeno desvio é muito comum e nem sempre causa sintomas. Quando atrapalha a respiração, vale conversar sobre tratamento.",
  },
  {
    title: "Os cornetos",
    text: "São estruturas cobertas por mucosa, com osso por dentro, na parede lateral de cada lado do nariz. Aquecem, umidificam e filtram o ar. O corneto inferior, quando inchado, é uma causa frequente de nariz entupido, e muitas vezes melhora com tratamento clínico.",
  },
  {
    title: "Quando procurar o otorrino",
    text: "Nariz entupido que não melhora, dor ou pressão no rosto, secreção que dura mais de 10 dias, perda do olfato, sangramentos frequentes ou sinusites que se repetem merecem uma avaliação com otorrinolaringologista. Inchaço e vermelhidão em volta do olho, febre alta, dor de cabeça forte ou alteração da visão pedem atendimento urgente.",
  },
];
