export const modules = [
  {
    code: 'M1-A',
    module: 'Modul 1',
    mode: 'schriftlich',
    title: 'Geschäftsgrundlagen, Vertragsanbahnung und Qualitätsmanagement schriftlich',
    shortTitle: 'Grundlagen & Anbahnung',
    duration: '120 Min. vorgesehen · Ende nach 150 Min.',
    criteria: ['fachliche Richtigkeit', 'Praxistauglichkeit'],
    evidence: 'WKO BPO §§ 5–6',
    status: 'confirmed',
  },
  {
    code: 'M1-B',
    module: 'Modul 1',
    mode: 'schriftlich',
    title: 'Laufende Kundenbetreuung schriftlich',
    shortTitle: 'Laufende Betreuung',
    duration: '120 Min. vorgesehen · Ende nach 150 Min.',
    criteria: ['fachliche Richtigkeit', 'Praxistauglichkeit'],
    evidence: 'WKO BPO §§ 5 und 7',
    status: 'confirmed',
  },
  {
    code: 'M2-A',
    module: 'Modul 2',
    mode: 'mündlich',
    title: 'Geschäftsgrundlagen, Vertragsanbahnung und Qualitätsmanagement mündlich',
    shortTitle: 'Grundlagen im Gespräch',
    duration: 'mind. 30 Min. · Ende nach 40 Min.',
    criteria: ['fachliche Richtigkeit', 'Praxistauglichkeit', 'schlüssige Argumentation'],
    evidence: 'WKO BPO §§ 8–9',
    status: 'confirmed',
  },
  {
    code: 'M2-B',
    module: 'Modul 2',
    mode: 'mündlich',
    title: 'Laufende Kundenbetreuung mündlich',
    shortTitle: 'Betreuung im Gespräch',
    duration: 'mind. 30 Min. · Ende nach 40 Min.',
    criteria: ['fachliche Richtigkeit', 'Praxistauglichkeit', 'schlüssige Argumentation'],
    evidence: 'WKO BPO §§ 8 und 10',
    status: 'confirmed',
  },
]

export const lessons = [
  {
    id: 'scope-before-product',
    module: 'M1-A',
    title: { de: 'Auftrag vor Produkt', zh: '先明确委托，再谈产品' },
    purpose: {
      de: 'Tätigkeit, Auftrag und Informationslücken sichtbar voneinander trennen.',
      zh: '把经营事实、委托范围和信息缺口分开。',
    },
    status: 'derived',
  },
  {
    id: 'risk-chain',
    module: 'M1-A',
    title: { de: 'Risiko als Kette', zh: '把风险写成因果链' },
    purpose: {
      de: 'Ereignis, Maßnahme, Aufwand und betriebliche Folge nachvollziehbar verbinden.',
      zh: '连接事件、措施、成本和经营后果。',
    },
    status: 'derived',
  },
  {
    id: 'contract-boundary',
    module: 'M1-B',
    title: { de: 'Vertragsgrenze markieren', zh: '标出合同边界' },
    purpose: {
      de: 'Keine Deckungs- oder Leistungsbehauptung ohne Originalunterlagen.',
      zh: '没有合同原件，不断言承保或给付。',
    },
    status: 'derived',
  },
  {
    id: 'case-decision',
    module: 'M1-B',
    title: { de: 'Entscheidung mit Ausschlussgründen', zh: '用排除理由形成决定' },
    purpose: {
      de: 'Auch Vertagung oder Selbsttragung als begründbare Ergebnisse behandeln.',
      zh: '延后决定或自行承担也可以是合理结论。',
    },
    status: 'derived',
  },
  {
    id: 'spoken-structure',
    module: 'M2-A',
    title: { de: 'Antwort in vier Zügen', zh: '四步口头回答' },
    purpose: {
      de: 'Ausgangslage, Prüfpfad, Entscheidung und nächsten Schritt frei erklären.',
      zh: '依次说明情境、检查路径、决定和下一步。',
    },
    status: 'derived',
  },
  {
    id: 'challenge-question',
    module: 'M2-B',
    title: { de: 'Rückfrage unter Druck', zh: '在压力追问下保持边界' },
    purpose: {
      de: 'Einwände aufnehmen, Unsicherheit benennen und den Prüfpfad fortsetzen.',
      zh: '承接异议、说明不确定性，并继续核验。',
    },
    status: 'derived',
  },
]

export const writtenQuestions = [
  {
    id: 'w-structure',
    module: 'M1-A',
    title: 'Sachverhalt strukturieren',
    prompt:
      'Ordnen Sie aus der Kundenakte mindestens vier Angaben als Fakt, fehlende Angabe oder abgeleitetes Risiko ein. Begründen Sie zwei Zuordnungen.',
    promptZh: '从客户卷宗中至少选四项，区分事实、缺失信息或推导风险，并解释其中两项。',
    referencePoints: [
      'Akteninhalt, Schlussfolgerung und offene Frage bleiben sichtbar getrennt.',
      'Gemietetes Lokal und Vertriebskanäle sind im Fall gegeben.',
      'Wiederbeschaffungswerte und vorhandene Polizzen fehlen.',
      'Ein möglicher Produktionsstillstand ist eine Ableitung, kein gegebener Schaden.',
    ],
  },
  {
    id: 'w-risk-chain',
    module: 'M1-A',
    title: 'Risikokette und Alternativen',
    prompt:
      'Bilden Sie für den Ausfall der Röstmaschine eine Risikokette und nennen Sie zwei Alternativen zur Versicherung.',
    promptZh: '为烘焙机故障建立风险因果链，并列出两种保险以外的应对方式。',
    referencePoints: [
      'Ereignis: Maschine fällt aus.',
      'Maßnahme: Diagnose, Reparatur, Ersatz oder Ausweichproduktion.',
      'Folge: mögliche Verzögerung oder Stillstand bei weiterlaufenden Kosten.',
      'Alternativen: Wartung, Ersatzteilkonzept, Partnerbetrieb oder Liquiditätsreserve.',
      'Keine erfundenen Zeiten, Kosten oder Wahrscheinlichkeiten.',
    ],
  },
  {
    id: 'w-decision',
    module: 'M1-B',
    title: 'Vorläufige Lösung begründen',
    prompt:
      'Formulieren Sie eine vorläufige Entscheidung. Nennen Sie drei Aussagen, die wegen fehlender Informationen ausgeschlossen werden müssen.',
    promptZh: '给出一个暂定结论，并列出三项因信息不足而不能作出的判断。',
    referencePoints: [
      'Zulässig ist INSUFFICIENT_EVIDENCE beziehungsweise die Vertagung einer Empfehlung.',
      'Keine pauschale Vollständigkeitszusage.',
      'Keine konkrete Versicherungssumme oder Preisbewertung.',
      'Keine Aussage, ein bestimmter Baustein sei zwingend erforderlich.',
      'Fehlende Unterlagen und nächster Prüfschritt werden benannt.',
    ],
  },
  {
    id: 'w-client-language',
    module: 'M1-B',
    title: 'Kundengerecht erklären',
    prompt:
      'Erklären Sie der Kundin in höchstens fünf Sätzen, warum die Beratung nicht mit einer Produktliste beginnt.',
    promptZh: '用不超过五句话向客户解释，为什么咨询不应从产品清单开始。',
    referencePoints: [
      'Ausgangspunkt ist die betriebliche Handlungsfähigkeit.',
      'Risiken und Abhängigkeiten werden zuerst verstanden.',
      'Eigenvorsorge und Selbsttragung sind echte Alternativen.',
      'Versicherung wirkt nur innerhalb definierter Vertragsgrenzen.',
      'Kein Druck und kein vorweggenommenes Ergebnis.',
    ],
  },
]

export const oralQuestions = [
  {
    id: 'o-opening',
    module: 'M2-A',
    title: 'Gesprächseröffnung',
    prompt:
      'Wie eröffnen Sie das Erstgespräch, und mit welchen vier Fragen ermitteln Sie die wichtigsten betrieblichen Abhängigkeiten?',
    promptZh: '如何开始首次会谈？用哪四个问题识别最重要的经营依赖？',
    observationPoints: ['offene Fragen', 'verständliche Sprache', 'keine voreilige Produktnennung', 'systematische Erhebung'],
  },
  {
    id: 'o-mechanism',
    module: 'M2-A',
    title: 'Mechanismus erklären',
    prompt:
      'Erklären Sie ohne Fachbegriffe, warum der Ausfall einer einzelnen Maschine relevant sein kann. Nennen Sie auch eine Situation, in der Eigenvorsorge ausreichen könnte.',
    promptZh: '不用术语说明单台设备故障为何重要，并举一个可由客户自行承担风险的情形。',
    observationPoints: ['Ursache-Wirkungs-Kette', 'Unsicherheit', 'Alternative', 'keine Dramatisierung'],
  },
  {
    id: 'o-objection',
    module: 'M2-B',
    title: 'Kundeneinwand',
    prompt:
      'Die Kundin sagt: „Ich möchte einfach das billigste Paket, in dem alles drin ist.“ Wie antworten Sie?',
    promptZh: '客户说：“我只想要最便宜、什么都包括的套餐。”你如何回答？',
    observationPoints: ['Wunsch anerkennen', '„alles“ klären', 'Grenzen erklären', 'fehlende Daten benennen', 'nächsten Schritt vereinbaren'],
  },
  {
    id: 'o-new-info',
    module: 'M2-B',
    title: 'Neue Information einordnen',
    prompt:
      'Ein großer Teil der Bestellungen läuft über den Onlineshop; eine aktuelle Datensicherung ist nicht dokumentiert. Wie verändert das Ihren Prüfpfad?',
    promptZh: '大量订单来自网店，但没有记录当前备份。这会如何改变你的核验路径？',
    observationPoints: ['Abhängigkeit aufnehmen', 'technische Vorsorge prüfen', 'Auswirkungen erfragen', 'keine automatische Produktempfehlung'],
  },
]

export const mistakeDefinitions = [
  { code: 'F1', title: 'Fakten erfunden', description: 'Eine fehlende Angabe wurde als vorhanden dargestellt.', descriptionZh: '把未知信息写成事实。', priority: 'sofort' },
  { code: 'U1', title: 'Unbekanntes verdeckt', description: 'Eine offene Frage blieb ohne unknown oder CONTRACT_CHECK_REQUIRED.', descriptionZh: '没有明确标出未知项。', priority: 'nächste Sitzung' },
  { code: 'R1', title: 'Risiko ohne Kausalkette', description: 'Ein Risikobegriff steht ohne Ereignis, Maßnahme und Folge.', descriptionZh: '只列风险名称，没有因果链。', priority: 'nächste Sitzung' },
  { code: 'P1', title: 'Produkt zu früh', description: 'Die Antwort beginnt mit einem Produkt, bevor der Bedarf geklärt ist.', descriptionZh: '需求未明确就开始谈产品。', priority: 'nächste Sitzung' },
  { code: 'A1', title: 'Alternative fehlt', description: 'Eigenvorsorge, Vermeidung, Vertrag oder Selbsttragung wurden nicht geprüft.', descriptionZh: '没有比较保险之外的路径。', priority: 'nächste Sitzung' },
  { code: 'K1', title: 'Vertragsbehauptung', description: 'Deckung oder Leistung wurde ohne Originalvertrag zugesagt.', descriptionZh: '未查合同就断言承保或赔付。', priority: 'sofort' },
  { code: 'E1', title: 'Ergebnis zu früh', description: 'Eine Empfehlung wurde trotz entscheidender Lücken ausgesprochen.', descriptionZh: '信息不足却提前下结论。', priority: 'sofort' },
  { code: 'S1', title: 'Nicht kundengerecht', description: 'Die Erklärung ist unnötig technisch oder unverständlich.', descriptionZh: '内容可能正确，但客户听不懂。', priority: 'Kurzrunde' },
  { code: 'N1', title: 'Nächster Schritt fehlt', description: 'Die Antwort erkennt Lücken, schließt sie aber nicht planvoll.', descriptionZh: '发现缺口，却没有下一步。', priority: 'nächste Sitzung' },
]
