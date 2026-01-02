import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/breadcrumbs";

// Mock data - substituir por busca em CMS/banco de dados
const blogPostsData: Record<string, any> = {
    "o-que-e-otorrino": {
        title: "O que é Otorrinolaringologia?",
        subtitle: "Entenda o que faz um otorrinolaringologista, as doenças mais comuns e quando procurar este especialista.",
        category: "Saúde",
        date: "20 de Novembro, 2024",
        author: "Dra. Jasmin Dezotti",
        image: "/images/otorrino-icons.png",
        content: `
      <p><em>Conteúdo informativo. Não substitui consulta médica. Em caso de sintomas intensos, persistentes ou sinais de alerta, procure atendimento.</em></p>

      <p>A <strong>otorrinolaringologia</strong> (popularmente conhecida como "<strong>otorrino</strong>") é a especialidade médica que cuida de três áreas fundamentais do nosso corpo: o <strong>ouvido</strong> (oto), o <strong>nariz</strong> (rino) e a <strong>garganta</strong> (laringo). Além disso, o otorrinolaringologista também atua em problemas do <strong>equilíbrio</strong>, <strong>voz</strong>, <strong>sono</strong> (ronco e apneia), <strong>tumores nasais</strong> e em muitas condições de <strong>cabeça e pescoço</strong>.</p>

      <p>Se você sente que "vive com nariz entupido", tem <strong>zumbido</strong>, <strong>tonturas</strong>, <strong>rouquidão</strong> recorrente ou <strong>ronca</strong> com sono não reparador, vale considerar uma avaliação com o otorrino. Como <strong>otorrinolaringologista no Rio de Janeiro</strong>, vou explicar de forma clara o que fazemos e quando você deve nos procurar.</p>

      <h2>O que faz um otorrinolaringologista?</h2>
      <p>O otorrinolaringologista é o médico especialista que diagnostica e trata doenças relacionadas a:</p>
      <ul>
        <li><strong>Ouvido (Otologia)</strong> – otites, perda auditiva, zumbido, sensação de ouvido tampado, perfuração timpânica</li>
        <li><strong>Equilíbrio (Otoneurologia)</strong> – vertigem, tontura, labirintopatias, VPPB (vertigem posicional), doença de Ménière</li>
        <li><strong>Nariz (Rinologia)</strong> – rinite, sinusite/rinossinusite, desvio de septo, pólipos, sangramento nasal, perda de olfato</li>
        <li><strong>Garganta e voz (Laringologia)</strong> – rouquidão, faringites, amigdalites, refluxo laringofaríngeo, nódulos vocais</li>
        <li><strong>Sono</strong> – ronco, apneia obstrutiva do sono, respiração oral e suas consequências</li>
        <li><strong>Cabeça e pescoço</strong> –  aumento de linfonodos, alterações de glândulas salivares e avaliação de lesões na boca, garganta e laringe</li>
      </ul>

      <h2>As três áreas principais da otorrinolaringologia</h2>

      <h3>1. Otologia: cuidado com o ouvido (e com a audição)</h3>
      <p>A otologia é a área que cuida da saúde auditiva. O ouvido não serve apenas para ouvir: ele também participa do <strong>equilíbrio</strong>. No consultório, avaliamos desde condições comuns, como <strong>otite média</strong> e <strong>cera impactada</strong>, até queixas mais desafiadoras, como <strong>zumbido</strong> e <strong>perda auditiva</strong>.</p>

      <p><strong>Exames comuns:</strong> otoscopia, audiometria, imitanciometria/impedanciometria e testes específicos quando há queixa de tontura.</p>

      <div style="margin: 1.5rem 0; padding: 1rem 1.25rem; background-color: var(--color-background-secondary); border-left: 3px solid var(--color-primary); border-radius: 8px;">
        <p style="margin: 0; font-style: italic; color: var(--color-text-secondary);">
          <strong style="color: var(--color-primary); font-style: normal;">Curiosidade:</strong> <strong>Cera do ouvido não é "sujeira":</strong> ela ajuda a proteger o canal auditivo. O problema é quando há acúmulo e impactação — e aí o ideal é retirar com técnica adequada, não com hastes flexíveis ("cotonete").
        </p>
      </div>

      <h3>2. Rinologia: cuidado com o nariz e seios da face</h3>
      <p>A rinologia foca nas doenças nasais e dos seios da face. Rinite e rinossinusite (a popular "sinusite") estão entre as queixas mais frequentes. O nariz é um órgão "de entrada": filtra, aquece e umidifica o ar. Quando ele inflama ou obstrui, a qualidade de vida despenca — e sintomas como <strong>dor facial</strong>, <strong>secreção</strong>, <strong>espirros</strong>, <strong>coceira</strong> e <strong>perda de olfato</strong> podem aparecer.</p>

      <p><strong>Exames comuns:</strong> avaliação clínica, <strong>videoendoscopia nasal</strong> e, em alguns casos, exames de imagem (como tomografia) e testes alérgicos quando a história sugere alergia.</p>

      <div style="margin: 1.5rem 0; padding: 1rem 1.25rem; background-color: var(--color-background-secondary); border-left: 3px solid var(--color-primary); border-radius: 8px;">
        <p style="margin: 0; font-style: italic; color: var(--color-text-secondary);">
          <strong style="color: var(--color-primary); font-style: normal;">Curiosidade:</strong> Você sabia que existe o <strong>"ciclo nasal"</strong>? Em muitos momentos do dia, uma narina fica mais "livre" que a outra — e isso pode ser normal.
        </p>
      </div>

      <h3>3. Laringologia: garganta, voz e deglutição</h3>
      <p>A laringologia cuida da saúde vocal e das estruturas da garganta. Rouquidão, pigarro, dor de garganta recorrente, sensação de "bolo" na garganta e fadiga vocal são queixas comuns. A laringologia avalia estruturas como as <strong>cordas vocais</strong> e ajuda a diferenciar problemas inflamatórios, lesões benignas (ex.: nódulos) e situações que exigem investigação mais rápida.</p>

      <p><strong>Exames comuns:</strong> laringoscopia (por endoscópio), avaliação vocal e, quando indicado, encaminhamento para fonoaudiologia.</p>

      <div style="margin: 1.5rem 0; padding: 1rem 1.25rem; background-color: var(--color-background-secondary); border-left: 3px solid var(--color-primary); border-radius: 8px;">
        <p style="margin: 0; font-style: italic; color: var(--color-text-secondary);">
          <strong style="color: var(--color-primary); font-style: normal;">Curiosidade:</strong> Ao falar, as pregas vocais podem vibrar centenas de vezes por segundo — por isso, hidratação e técnica vocal fazem diferença para quem usa muito a voz.
        </p>
      </div>

      <h2>Doenças otorrinolaringológicas mais comuns (e o que observar)</h2>

      <h3>Rinite (alérgica e não alérgica)</h3>
      <ul>
        <li><strong>Sintomas típicos:</strong> espirros, coceira no nariz/olhos, coriza clara, obstrução nasal</li>
        <li><strong>Gatilhos comuns:</strong> poeira/ácaros, mofo, pelos, fumaça, mudanças de temperatura e cheiros fortes</li>
        <li><strong>Por que tratar?</strong> Rinite descontrolada piora sono, rendimento e pode agravar sinusite e ronco</li>
      </ul>

      <h3>Rinossinusite (a "sinusite")</h3>
      <ul>
        <li><strong>Sintomas típicos:</strong> congestão, secreção nasal, dor/pressão facial, redução do olfato; às vezes tosse e febre</li>
        <li><strong>Nem toda sinusite é bacteriana:</strong> muitos quadros são virais e melhoram com medidas de suporte</li>
        <li><strong>Quando investigar mais:</strong> sintomas persistentes, recorrentes ou com sinais de gravidade</li>
      </ul>

      <h3>Otite (muito comum na infância)</h3>
      <ul>
        <li><strong>Sintomas típicos:</strong> dor de ouvido, febre, irritabilidade, queda de apetite; em alguns casos, secreção</li>
        <li><strong>Importante:</strong> dor intensa e persistente, especialmente com febre alta, merece avaliação médica</li>
      </ul>

      <h3>Zumbido (tinnitus)</h3>
      <ul>
        <li><strong>Definição:</strong> percepção de som (apito, chiado, "cigarra") sem fonte externa</li>
        <li><strong>Não é uma doença — é um sintoma</strong> que pode ter várias causas: perda auditiva, exposição a ruído, alterações metabólicas, disfunção da ATM, estresse, entre outras</li>
        <li><strong>Quando preocupa:</strong> zumbido súbito, unilateral, pulsátil ou acompanhado de perda auditiva/tontura</li>
      </ul>

      <h3>Tontura e vertigem</h3>
      <ul>
        <li><strong>Vertigem</strong> é a sensação de "tudo girando". Nem toda tontura é "labirintite"</li>
        <li>Algumas causas são benignas (ex.: VPPB) e respondem bem a manobras específicas</li>
        <li><strong>Sinais de alerta</strong> (abaixo) indicam avaliação urgente</li>
      </ul>

      <h3>Ronco e apneia obstrutiva do sono</h3>
      <p>Ronco não é apenas barulho: em alguns casos, é sinal de colapso parcial da via aérea. Já a <strong>apneia</strong> envolve pausas respiratórias durante o sono e pode impactar pressão arterial, metabolismo e qualidade de vida.</p>

      <h2>Quando procurar um otorrinolaringologista?</h2>
      <p>Agende uma consulta se você tiver:</p>
      <ul>
        <li><strong>Ouvido:</strong> dor, secreção, perda auditiva, zumbido, sensação de ouvido tampado, tontura</li>
        <li><strong>Nariz:</strong> obstrução persistente, rinite frequente, sinusite recorrente, sangramento nasal, perda de olfato</li>
        <li><strong>Garganta/voz:</strong> rouquidão por mais de <strong>2 semanas</strong>, dor recorrente, dificuldade para engolir, pigarro persistente</li>
        <li><strong>Sono:</strong> ronco alto, sonolência diurna, pausas respiratórias percebidas por terceiros</li>
      </ul>

      <h2>Sinais de alerta: quando procurar atendimento com urgência</h2>
      <ul>
        <li><strong>Perda auditiva súbita</strong> (de um dia para o outro)</li>
        <li><strong>Vertigem intensa</strong> com desmaio, fraqueza, alteração de fala, visão dupla ou assimetria facial</li>
        <li><strong>Sangramento nasal</strong> que não cessa com compressão e medidas iniciais</li>
        <li><strong>Falta de ar</strong>, chiado/estridor, dificuldade importante para engolir ou salivação excessiva</li>
        <li><strong>Rouquidão</strong> persistente em fumantes ou associada a perda de peso/dor forte</li>
      </ul>

      <h2>O que esperar na consulta com o otorrino?</h2>
      <p>Durante a consulta, realizamos:</p>
      <ul>
        <li><strong>Anamnese detalhada</strong> (história dos sintomas, gatilhos, hábitos, medicações)</li>
        <li><strong>Exame físico</strong> de ouvido, nariz e garganta</li>
        <li><strong>Endoscopia</strong> (nasal ou laríngea) quando indicado, para visualizar estruturas internas</li>
        <li><strong>Exames complementares</strong> conforme o caso: audiometria, impedanciometria, testes vestibulares, exames de imagem, avaliação do sono</li>
        <li><strong>Plano de tratamento</strong> personalizado, com acompanhamento e prevenção</li>
      </ul>

      <h2>Prevenção: hábitos simples que protegem ouvido, nariz e garganta</h2>
      <p>Alguns cuidados simples podem ajudar a prevenir problemas otorrinolaringológicos:</p>
      <ul>
        <li><strong>Lavagem nasal com solução salina</strong> (quando indicada) pode ajudar na higiene e no conforto nasal</li>
        <li><strong>Proteja a audição:</strong> volume moderado e pausas no uso de fones; use proteção em ambientes ruidosos</li>
        <li><strong>Hidratação</strong> e cuidados vocais (especialmente para quem fala muito)</li>
        <li><strong>Evite tabaco</strong> e exposição a fumaça</li>
        <li><strong>Controle alergias</strong> e comorbidades (asma, refluxo, etc.) com acompanhamento adequado</li>
      </ul>

      <h2>FAQ: dúvidas comuns sobre otorrino</h2>

      <h3>1. "Sinusite" sempre precisa de antibiótico?</h3>
      <p>Não. Muitos quadros são virais e melhoram com medidas de suporte. Antibiótico pode ser indicado em situações específicas, após avaliação clínica.</p>

      <h3>2. Lavagem nasal pode ser feita com água?</h3>
      <p>Em geral, recomenda-se <strong>solução salina</strong> adequada. O ideal é receber orientação sobre técnica, frequência e cuidados para evitar irritação ou desconforto.</p>

      <h3>3. Roncar é normal?</h3>
      <p>Ronco pode ocorrer ocasionalmente, mas ronco frequente e alto, com sono não reparador ou pausas respiratórias, merece avaliação por risco de apneia do sono.</p>

      <h2>Por que escolher um otorrinolaringologista especializado?</h2>
      <ul>
        <li>Diagnóstico preciso com equipamentos modernos</li>
        <li>Tratamento baseado em evidências científicas</li>
        <li>Atendimento personalizado e humanizado</li>
        <li>Experiência em cirurgias nasais e procedimentos especializados</li>
      </ul>

      <p>Como <strong>otorrinolaringologista</strong>, estou à disposição para cuidar da sua saúde auditiva, respiratória e vocal.</p>
      
      <p><a href="/atendimento">Agende sua consulta</a> e receba um atendimento especializado e personalizado.</p>
    `,
    },
    "cuidados-com-rinite-alergica": {
        title: "Cuidados Essenciais com Rinite Alérgica",
        subtitle: "Entenda os sintomas, causas e como controlar a rinite alérgica no dia a dia.",
        category: "Rinologia",
        date: "15 de Novembro, 2024",
        author: "Dra. Jasmin Dezotti",
        image: "/images/workflow-01.png",
        content: `
      <p><em>Conteúdo informativo. Não substitui consulta médica. Se houver piora importante, sintomas persistentes ou sinais de alerta, procure atendimento.</em></p>

      <p>A <strong>rinite alérgica</strong> é uma inflamação do nariz causada por uma reação exagerada do sistema imunológico a alérgenos do ambiente. Ela costuma aparecer com <strong>espirros</strong>, <strong>coriza</strong>, <strong>coceira</strong> e <strong>nariz entupido</strong> — e pode impactar muito o sono, a disposição e a produtividade. Como <strong>otorrinolaringologista especializada em rinologia</strong>, reuni aqui orientações práticas, curiosidades e sinais de alerta para você controlar melhor as crises no dia a dia.</p>

      <h2>Rinite alérgica: o que acontece no corpo?</h2>
      <p>De forma simples: ao entrar em contato com alérgenos (como <strong>ácaros</strong> e <strong>mofo</strong>), o organismo libera substâncias inflamatórias — e isso provoca os sintomas. O resultado é um nariz que "vive reagindo" e fica mais sensível a cheiros fortes, fumaça, mudanças de temperatura e poluição.</p>

      <div style="margin: 1.5rem 0; padding: 1rem 1.25rem; background-color: var(--color-background-secondary); border-left: 3px solid var(--color-primary); border-radius: 8px;">
        <p style="margin: 0; font-style: italic; color: var(--color-text-secondary);">
          <strong style="color: var(--color-primary); font-style: normal;">Curiosidade:</strong> <strong>Rinite não é "frescura".</strong> Quando mal controlada, ela pode piorar o sono, aumentar o cansaço diurno e favorecer complicações como <strong>sinusite</strong> e <strong>respiração pela boca</strong>.
        </p>
      </div>

      <h2>O que causa a rinite alérgica?</h2>
      <p>Os principais gatilhos (alérgenos) incluem:</p>
      <ul>
        <li><strong>Ácaros da poeira</strong> – muito comuns em colchões, travesseiros, sofás, pelúcias e tapetes</li>
        <li><strong>Fungos e mofo</strong> – banheiros, áreas úmidas, paredes com infiltração</li>
        <li><strong>Pelos/descamação de animais</strong> – principalmente em ambientes fechados</li>
        <li><strong>Pólen</strong> – varia conforme estação e região</li>
        <li><strong>Baratas</strong> – em algumas pessoas, são gatilho relevante (especialmente em áreas urbanas)</li>
      </ul>

      <p>E existem os <strong>irritantes</strong> (não são "alergia", mas pioram os sintomas): <strong>fumaça</strong>, <strong>perfumes</strong>, produtos de limpeza fortes, ar muito seco, poluição e mudanças bruscas de temperatura.</p>

      <h2>Principais sintomas da rinite alérgica</h2>
      <ul>
        <li><strong>Espirros em salva</strong> (muito comuns pela manhã)</li>
        <li><strong>Coriza clara</strong> e/ou escorrendo</li>
        <li><strong>Coceira</strong> no nariz, olhos, garganta ou céu da boca</li>
        <li><strong>Congestão nasal</strong> (nariz entupido)</li>
        <li><strong>Olhos lacrimejantes</strong>, vermelhos e com sensação de areia</li>
        <li><strong>Pigarro</strong> e tosse (principalmente à noite, por gotejamento pós-nasal)</li>
        <li><strong>Cansaço</strong>, irritabilidade e dificuldade para dormir</li>
      </ul>

      <h3>Sintomas em crianças: atenção redobrada</h3>
      <p>Em crianças, a rinite pode aparecer como <strong>respiração pela boca</strong>, ronco, sono agitado, "nariz sempre fechado", coceira (a criança esfrega o nariz para cima, o chamado <em>"saudação alérgica"</em>) e queda de rendimento por sono ruim.</p>

      <h2>Como é feito o diagnóstico?</h2>
      <p>O diagnóstico é principalmente <strong>clínico</strong>, com base nos sintomas e no exame. Em alguns casos, podem ser indicados:</p>
      <ul>
        <li><strong>Videoendoscopia nasal</strong> – para avaliar cornetos, septo, secreções e pólipos</li>
        <li><strong>Testes alérgicos</strong> (quando a história sugere alergia e isso muda a conduta)</li>
        <li><strong>Avaliação de comorbidades</strong> – sinusite, asma, apneia do sono, refluxo, entre outras</li>
      </ul>

      <h2>Cuidados essenciais no dia a dia (o que mais funciona na prática)</h2>
      <p>Controle da rinite é como "tripé": <strong>ambiente + hábitos + tratamento</strong>.</p>

      <h3>1. Ambiente doméstico: checklist antiácaro</h3>
      <ul>
        <li><strong>Quarto</strong>: priorize limpeza úmida (pano úmido) e evite acúmulo de poeira</li>
        <li><strong>Roupas de cama</strong>: troque semanalmente; se possível, lave em água mais quente e seque bem</li>
        <li><strong>Capas antiácaros</strong> em colchão e travesseiros ajudam especialmente em quem tem sintomas fortes</li>
        <li><strong>Evite</strong> tapetes, cortinas pesadas e excesso de pelúcias (se tiver, lave com frequência)</li>
        <li><strong>Mofo</strong>: trate infiltrações e mantenha boa ventilação em áreas úmidas</li>
        <li><strong>Ar-condicionado</strong>: pode ajudar se os filtros estiverem <strong>limpos</strong> e com manutenção em dia</li>
        <li><strong>Umidade</strong>: extremos atrapalham; ambientes úmidos favorecem mofo/ácaros</li>
      </ul>

      <h3>2. Cuidados pessoais que fazem diferença</h3>
      <ul>
        <li><strong>Lavagem nasal com solução salina</strong> pode reduzir secreção, melhorar congestão e ajudar no controle de crises</li>
        <li><strong>Banho e troca de roupa</strong> ao chegar da rua (útil para quem reage a pólen/poluição)</li>
        <li><strong>Evite cheiros fortes</strong> (perfumes, sprays, incensos) se perceber piora imediata</li>
        <li><strong>Hidratação</strong> e sono regular ajudam o corpo a lidar melhor com inflamações</li>
        <li><strong>Óculos de sol</strong> em dias de vento podem reduzir irritação ocular em pessoas sensíveis</li>
      </ul>

      <h2>Lavagem nasal: como fazer com segurança (guia rápido)</h2>
      <p>A lavagem nasal é uma das medidas mais úteis na rinite, principalmente para quem tem congestão e secreção. Dicas práticas:</p>
      <ul>
        <li>Use <strong>solução salina</strong> (pronta ou orientada pelo seu médico). Em geral, prefira em <strong>temperatura ambiente</strong>.</li>
        <li>Escolha um dispositivo confortável (seringa, squeeze, irrigador). O ideal é aprender a técnica correta.</li>
        <li>Incline levemente a cabeça, direcione o jato para a lateral da narina (não para cima) e deixe o líquido sair pela outra narina ou pela boca.</li>
        <li>Frequência: varia conforme sintomas e orientação médica (muita lavagem, em algumas pessoas, pode irritar).</li>
        <li>Se houver <strong>dor forte</strong>, sangramento importante ou infecções de ouvido frequentes, converse com o otorrino sobre a melhor técnica e frequência.</li>
      </ul>

      <h2>Tratamento: o que o otorrino pode indicar</h2>
      <p>O tratamento é individualizado, conforme intensidade e frequência dos sintomas. Opções comuns incluem:</p>
      <ul>
        <li><strong>Anti-histamínicos</strong> (antialérgicos) – em geral, os de 2ª geração tendem a causar menos sonolência</li>
        <li><strong>Corticoide nasal</strong> – é uma das bases do controle em quadros moderados a intensos (uso correto faz toda diferença)</li>
        <li><strong>Anti-histamínico nasal</strong> – útil em alguns perfis de sintoma, inclusive crises</li>
        <li><strong>Terapia combinada</strong> (sprays específicos) – para quem não melhora bem com uma única medicação</li>
        <li><strong>Imunoterapia</strong> (vacinas) – para casos selecionados, com avaliação adequada dos gatilhos</li>
        <li><strong>Tratamento de comorbidades</strong> – sinusite, asma, refluxo, apneia do sono etc.</li>
      </ul>

      <div style="margin: 1.5rem 0; padding: 1rem 1.25rem; background-color: #FEF3C7; border-left: 3px solid #F59E0B; border-radius: 8px;">
        <p style="margin: 0; color: #92400E;">
          <strong style="color: #B45309;">⚠️ Atenção:</strong> Sprays descongestionantes de alívio rápido podem <strong>viciar</strong> e causar <strong>rinite medicamentosa</strong> quando usados por muitos dias seguidos. Se você sente que "não vive sem", procure avaliação — existe tratamento para sair desse ciclo com segurança.
        </p>
      </div>

      <h2>Quando procurar um otorrinolaringologista?</h2>
      <p>Vale agendar consulta quando:</p>
      <ul>
        <li>Os sintomas persistem por mais de <strong>2 semanas</strong> ou voltam com frequência</li>
        <li>Há impacto no <strong>sono</strong>, no trabalho/estudos ou nas atividades físicas</li>
        <li>Você tem <strong>sinusites recorrentes</strong>, otites, ronco ou respiração pela boca</li>
        <li>Há uso frequente de sprays vasoconstritores/descongestionantes</li>
        <li>Os medicamentos "de farmácia" não controlam mais</li>
      </ul>

      <h2>Sinais de alerta (procure atendimento mais rápido)</h2>
      <ul>
        <li><strong>Entupimento nasal unilateral</strong> persistente</li>
        <li><strong>Sangramentos</strong> nasais frequentes ou intensos</li>
        <li><strong>Dor facial forte</strong>, febre alta, inchaço ao redor dos olhos</li>
        <li><strong>Perda de olfato</strong> importante e persistente</li>
        <li><strong>Falta de ar</strong>, chiado ou suspeita de asma descompensada</li>
      </ul>

      <h2>Mitos e verdades sobre rinite alérgica</h2>
      <ul>
        <li><strong>"Rinite é só espirro."</strong> — Não. Pode causar congestão crônica, sono ruim, cansaço e até piorar sinusite.</li>
        <li><strong>"Antialérgico sempre dá sono."</strong> — Alguns sim (principalmente os mais antigos). Há opções com menor sonolência.</li>
        <li><strong>"Spray descongestionante pode usar sempre."</strong> — Não. Uso prolongado pode piorar o nariz e causar dependência.</li>
        <li><strong>"Lavagem nasal faz mal."</strong> — Quando bem orientada e com técnica adequada, costuma ser segura e útil.</li>
      </ul>

      <h2>Resumo prático: o plano dos 7 dias para começar a melhorar</h2>
      <ol>
        <li>Organize o <strong>quarto</strong> (poeira, roupa de cama, capas se necessário).</li>
        <li>Faça <strong>limpeza úmida</strong> e identifique focos de <strong>mofo</strong>.</li>
        <li>Implemente <strong>lavagem nasal</strong> com orientação.</li>
        <li>Evite gatilhos óbvios (fumaça, perfumes fortes, sprays).</li>
        <li>Se usa vasoconstritor, <strong>não aumente por conta própria</strong> — marque avaliação.</li>
        <li>Acompanhe padrões: piora de manhã? no quarto? na rua? Isso direciona o controle ambiental.</li>
        <li>Se não houver melhora consistente, procure o otorrino para <strong>ajustar tratamento</strong>.</li>
      </ol>

      <p>Como <strong>otorrinolaringologista em Madureira e Zona Sul</strong>, atendo pacientes com rinite alérgica oferecendo diagnóstico preciso e tratamento personalizado. <a href="/atendimento">Agende sua consulta</a> para uma avaliação completa.</p>
    `,
    },
};

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const post = blogPostsData[slug];

    if (!post) {
        return {
            title: "Post não encontrado - Dra. Jasmin Dezotti",
            description: "O post solicitado não foi encontrado.",
        };
    }

    return {
        title: `${post.title} - Dra. Jasmin Dezotti | Otorrinolaringologista`,
        description: post.subtitle,
        robots: "index, follow",
        alternates: {
            canonical: `https://jasmindezotti.com/blog/${slug}/`
        },
        openGraph: {
            title: `${post.title} - Dra. Jasmin Dezotti`,
            description: post.subtitle,
            url: `https://jasmindezotti.com/blog/${slug}/`,
            siteName: "Dra. Jasmin Dezotti Lovisi",
            locale: "pt_BR",
            type: "article",
            publishedTime: post.date,
            authors: [post.author],
            section: post.category,
        },
        keywords: [
            "otorrinolaringologista",
            "Rio de Janeiro",
            "Madureira",
            "Zona Sul",
            post.category.toLowerCase(),
            "rinologia",
            "otologia",
            "laringologia"
        ].join(", "),
    };
}

export default async function BlogPost({ params }: PageProps) {
    const { slug } = await params;
    const post = blogPostsData[slug];

    if (!post) {
        return (
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 text-center">
                <h1 className="text-3xl font-nacelle font-semibold text-[var(--color-text-primary)] mb-4">
                    Post não encontrado
                </h1>
                <Link href="/blog" className="btn btn-primary">
                    Voltar para o Blog
                </Link>
            </div>
        );
    }

    return (
        <>
            {/* Hero Section */}
            <section>
                <div className="mx-auto max-w-4xl px-4 sm:px-6">
                    <div className="py-12 md:py-20">
                        <Breadcrumbs
                            items={[
                                { label: "Blog", href: "/blog" },
                                { label: post.title }
                            ]}
                        />
                        {/* Back Button */}
                        <Link
                            href="/blog"
                            className="inline-flex items-center text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors mb-8"
                        >
                            <svg
                                className="h-4 w-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Voltar para o Blog
                        </Link>

                        {/* Post Header */}
                        <div className="mb-8">
                            <div className="mb-4 flex items-center gap-3 text-sm">
                                <span className="rounded-full bg-[var(--color-secondary)]/20 px-3 py-1 border border-[var(--color-secondary)]/60">
                                    <span className="text-[var(--color-secondary)] font-semibold">
                                        {post.category}
                                    </span>
                                </span>
                                <span className="text-[var(--color-text-muted)]">
                                    {post.date}
                                </span>
                            </div>

                            <h1 className="mb-4 font-nacelle text-3xl font-semibold text-[var(--color-text-primary)] md:text-5xl">
                                {post.title}
                            </h1>

                            <p className="text-xl text-[var(--color-text-secondary)]">
                                {post.subtitle}
                            </p>

                            <div className="mt-6 flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                                <span className="font-medium text-[var(--color-text-primary)]">
                                    Por {post.author}
                                </span>
                            </div>
                        </div>

                        {/* Featured Image */}
                        <div className="mb-12 overflow-hidden rounded-2xl">
                            <Image
                                src={post.image}
                                alt={post.title}
                                width={800}
                                height={450}
                                className="h-auto w-full"
                                priority
                            />
                        </div>

                        {/* Post Content */}
                        <article
                            className="prose prose-lg mx-auto"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                            style={{
                                maxWidth: "65ch",
                                color: "var(--color-text-primary)",
                            }}
                        />

                        {/* Related Links */}
                        <div className="mt-12 p-6 bg-[var(--color-background-secondary)]/50 rounded-2xl border border-[var(--color-accent)]">
                            <h3 className="font-nacelle text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                                Links Relacionados
                            </h3>
                            <div className="space-y-3">
                                <Link
                                    href="/atendimento"
                                    className="block text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors font-medium"
                                >
                                    → Agendar Consulta com a Dra. Jasmin Dezotti
                                </Link>
                                <Link
                                    href="/blog"
                                    className="block text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors font-medium"
                                >
                                    → Ver Mais Artigos sobre Otorrinolaringologia
                                </Link>
                                <Link
                                    href="/#servicos"
                                    className="block text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors font-medium"
                                >
                                    → Conheça Nossos Serviços Especializados
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section>
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="border-t border-[var(--color-accent)] py-12 md:py-20">
                        <div className="mx-auto max-w-3xl text-center">
                            <h2 className="bg-[linear-gradient(to_right,var(--color-primary),var(--color-secondary),var(--color-primary))] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-2xl font-semibold text-transparent md:text-3xl">
                                Precisa de uma avaliação especializada?
                            </h2>
                            <p className="mb-6 text-[var(--color-text-secondary)]">
                                Agende sua consulta e receba orientação profissional personalizada.
                            </p>
                            <a href="/atendimento" className="btn btn-primary">
                                Agendar Consulta
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

