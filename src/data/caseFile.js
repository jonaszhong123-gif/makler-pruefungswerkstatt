export const caseSections = [
  {
    id: 'facts',
    index: '01',
    title: { de: 'Fakten', zh: '事实' },
    intro: {
      de: 'Im fiktiven Fall gegebene Angaben. confirmed bedeutet hier nur: in der Akte vorgegeben.',
      zh: '虚构案例中已给出的信息；confirmed 仅表示卷宗已提供。',
    },
    items: [
      { id: 'f-1', status: 'confirmed', de: 'Die Kundin betreibt eine kleine Kaffeerösterei mit Verkaufsraum und Onlineshop.', zh: '客户经营一家带门店和网店的小型咖啡烘焙店。' },
      { id: 'f-2', status: 'confirmed', de: 'Das Geschäftslokal ist gemietet. Geröstet, verpackt und verkauft wird am selben Standort.', zh: '经营场所为租赁，烘焙、包装和销售在同一地点完成。' },
      { id: 'f-3', status: 'confirmed', de: 'Röstmaschine, elektrische Geräte, Warenbestände und Kassensystem werden für den Betrieb benötigt.', zh: '经营依赖烘焙机、电器、库存和收银系统。' },
      { id: 'f-4', status: 'confirmed', de: 'Onlinebestellungen werden durch externe Dienstleister versandt; im Verkaufsraum gibt es gelegentlich Verkostungen.', zh: '网店订单由外部服务商配送；门店偶尔举行试饮。' },
      { id: 'f-5', status: 'confirmed', de: 'Es ist der erste Maklertermin. Vertragsunterlagen, Wertaufstellungen und Schadenhistorie liegen noch nicht vor.', zh: '这是首次经纪人会谈，合同、价值明细和出险记录尚未提交。' },
    ],
  },
  {
    id: 'missing',
    index: '02',
    title: { de: 'Fehlende Informationen', zh: '缺失信息' },
    items: [
      { id: 'm-1', status: 'unknown', de: 'Bestehende Versicherungsverträge und der tatsächlich erfasste Betriebszweck.', zh: '现有保单以及实际承保的经营范围尚不明确。' },
      { id: 'm-2', status: 'unknown', de: 'Eigentum, Wiederbeschaffungswerte und technische Daten von Maschinen, Einrichtung und Vorräten.', zh: '设备、装修和库存归谁所有，以及重置价值和技术数据，均不明确。' },
      { id: 'm-3', status: 'unknown', de: 'Umsatzverlauf, Fixkosten, Liquiditätsreserve und maximal tragbare Stillstandsdauer.', zh: '营业额、固定成本、现金储备和可承受停业时间未知。' },
      { id: 'm-4', status: 'unknown', de: 'Abhängigkeit von Maschinen, Lieferanten, IT-Systemen und Versanddienstleistern.', zh: '对机器、供应商、IT 和物流商的依赖未知。' },
      { id: 'm-5', status: 'unknown', de: 'Mietvertragliche Abgrenzung, Liefergebiete, Reklamationen, Schäden, Daten- und Sicherungsprozesse.', zh: '租约责任、配送范围、投诉、事故、数据和备份流程未知。' },
    ],
  },
  {
    id: 'risks',
    index: '03',
    title: { de: 'Risiken', zh: '风险' },
    items: [
      { id: 'r-1', status: 'derived', de: 'Fällt eine betriebsnotwendige Maschine aus oder wird der Standort unbenutzbar, können Produktion und Verkauf beeinträchtigt werden. Umfang: unknown.', zh: '关键设备停机或场所无法使用时，生产销售可能受影响；程度未知。' },
      { id: 'r-2', status: 'derived', de: 'Besucher, Produkte oder betriebliche Tätigkeiten können Anlass für Ansprüche Dritter geben. Eine Haftung ist nicht festgestellt.', zh: '访客、产品或经营活动可能引发第三方索赔，但责任尚未确定。' },
      { id: 'r-3', status: 'derived', de: 'Schäden an Maschinen, Einrichtung oder Vorräten können die Wiederaufnahme erschweren; die finanzielle Tragweite bleibt unknown.', zh: '设备、装修或库存受损可能影响复工；财务影响未知。' },
      { id: 'r-4', status: 'derived', de: 'Störungen von Onlineshop, Kassensystem oder Versand können Abläufe und Kundenkommunikation beeinträchtigen.', zh: '网店、收银或配送故障可能影响流程和客户沟通。' },
    ],
  },
  {
    id: 'rule',
    index: '04',
    title: { de: 'Regel & Prüfpfad', zh: '规则与核验路径' },
    items: [
      { id: 'p-1', status: 'derived', de: 'Tätigkeit, Sachen, Personen, Prozesse und Abhängigkeiten werden zuerst aufgenommen.', zh: '先盘点业务、资产、人员、流程和依赖关系。' },
      { id: 'p-2', status: 'derived', de: 'Je Risiko: Ereignis → notwendige Maßnahme → möglicher Aufwand → betriebliche Folge.', zh: '逐项检查：事件→措施→费用→经营后果。' },
      { id: 'p-3', status: 'derived', de: 'Danach reale Alternativen vergleichen: vermeiden, vorsorgen, selbst tragen, vertraglich übertragen, versichern.', zh: '再比较规避、预防、自担、合同转移和保险。' },
      { id: 'p-4', status: 'derived', de: 'Erst anschließend werden Originalpolizzen und mögliche Bausteine am Wortlaut geprüft.', zh: '完成上述核验后，再按原文检查现有保单和可能的保障模块。' },
    ],
  },
  {
    id: 'solution',
    index: '05',
    title: { de: 'Lösung & Ausschlussgründe', zh: '方案与排除理由' },
    intro: { de: 'Vorläufiges Ergebnis: INSUFFICIENT_EVIDENCE', zh: '暂定结论：证据不足' },
    items: [
      { id: 's-1', status: 'derived', de: 'Sachschaden, Stillstand, Ansprüche Dritter sowie digitale und logistische Abhängigkeiten bleiben getrennte Prüffelder.', zh: '财产损失、停业、第三方索赔、数字与物流依赖须分别审查。' },
      { id: 's-2', status: 'derived', de: 'Finanziell tragbare Schäden können durch Vorsorge und Reserven bewältigt werden; ob das hier genügt, ist unknown.', zh: '可承受的小额损失或许能靠预防措施和自有储备处理，但是否适合本案仍不明确。' },
      { id: 's-3', status: 'unknown', de: 'Gebäude-, Transport- oder digitale Lösungen werden ohne Eigentums-, Ablauf- und Vertragsdaten nicht empfohlen.', zh: '缺少产权、流程和合同资料时，不推荐建筑、运输或数字风险方案。' },
      { id: 's-4', status: 'derived', de: 'Ausgeschlossen sind Aussagen wie „alles gedeckt“, „günstigste Lösung“ oder „zwingend erforderlich“.', zh: '不能声称“全部承保”“最便宜”或“必须购买”。' },
    ],
  },
  {
    id: 'contract',
    index: '06',
    title: { de: 'CONTRACT_CHECK_REQUIRED', zh: '须核对合同' },
    items: [
      { id: 'c-1', status: 'unknown', de: 'Versicherte Tätigkeiten, Sachen, Personen und Standorte.', zh: '承保业务、财产、人员和地点。' },
      { id: 'c-2', status: 'unknown', de: 'Definitionen versicherter Ereignisse und Leistungsvoraussetzungen.', zh: '保险事故定义与给付条件。' },
      { id: 'c-3', status: 'unknown', de: 'Ausschlüsse, Obliegenheiten, Meldungen und Zustimmungserfordernisse.', zh: '除外、义务、通知及同意要求。' },
      { id: 'c-4', status: 'unknown', de: 'Bewertung, Grenzen, Selbstbehalte, räumliche und zeitliche Geltung.', zh: '估值、限额、自付额、地域和时间范围。' },
      { id: 'c-5', status: 'unknown', de: 'Schnittstellen zwischen Verträgen, Vermieterregeln und Leistungen Dritter.', zh: '合同、房东约定和第三方服务之间的衔接。' },
    ],
  },
  {
    id: 'explanation',
    index: '07',
    title: { de: 'Kundenerklärung', zh: '客户解释' },
    items: [
      { id: 'e-1', status: 'derived', de: '„Ihre Rösterei hängt gleichzeitig vom Standort, von Maschinen, Waren und digitalen Abläufen ab.“', zh: '“您的经营同时依赖场地、机器、库存和数字流程。”' },
      { id: 'e-2', status: 'derived', de: '„Ein Problem in einem Bereich kann Ihre Handlungsfähigkeit einschränken. Wie stark, hängt von Reserven und Ausweichmöglichkeiten ab.“', zh: '“其中一环出问题就可能限制经营；影响取决于储备和替代方案。”' },
      { id: 'e-3', status: 'derived', de: '„Versicherung kann definierte finanzielle Folgen planbarer machen. Sie verhindert den Schaden nicht und garantiert keine vollständige Wiederherstellung.“', zh: '“保险可让合同约定的财务后果更可预测，但不能阻止事故，也不保证完全恢复。”' },
      { id: 'e-4', status: 'derived', de: '„Welche Lösung passt, lässt sich erst nach Prüfung von Werten, Abläufen, Reserven und Verträgen sagen.“', zh: '“先核对资产、流程、储备和合同，之后才能判断哪种方案合适。”' },
    ],
  },
  {
    id: 'next',
    index: '08',
    title: { de: 'Nächste Schritte', zh: '下一步' },
    items: [
      { id: 'n-1', status: 'derived', de: 'Polizzen, Mietvertrag, Inventar, Maschinen- und Betriebsdaten anfordern.', zh: '索取保单、租约、资产、设备和经营数据。' },
      { id: 'n-2', status: 'derived', de: 'Ablauf für Maschinenstillstand, Standortausfall, Kundenanspruch und IT-Störung skizzieren.', zh: '梳理设备停机、场所停用、客户索赔和 IT 故障流程。' },
      { id: 'n-3', status: 'derived', de: 'Tragbare Verlusthöhe und Stillstandsdauer durch die Kundin festlegen lassen.', zh: '由客户确定可自行承担的损失和停业时长。' },
      { id: 'n-4', status: 'derived', de: 'Originalverträge prüfen; Lücken bleiben CONTRACT_CHECK_REQUIRED.', zh: '核对合同原件；未明确事项继续标记为须查合同。' },
      { id: 'n-5', status: 'derived', de: 'Erst danach Handlungsalternativen und gegebenenfalls Versicherungsvarianten vergleichen.', zh: '最后才比较风险处理方式和可能的保险方案。' },
    ],
  },
]
