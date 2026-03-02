// Portugal IMI 2026 — Municipal rates and IMI Familiar participation
//
// Source: Portal das Finanças via idealista/news (reference: 2026-01-08)
//         Raw data: docs/static-data/imi_2026_por_municipio.json (300 confirmed entries)
//         imi_2025_portal_financas.json (IMI Familiar per-municipality data)
//
// 99 municipalities above the 0.3% legal minimum (rates from JSON source).
// 5 municipalities without confirmed 2026 data default to 0.3%:
//   Arganil, Belmonte, Corvo, Manteigas, São João da Pesqueira
// Alfândega da Fé: 0.38%, Espinho: 0.37%, Gondomar: 0.372% (from imi_2025_portal_financas.json)
//
// Update rates each December: portaldasfinancas.gov.pt → Consultar Taxas IMI/CA
// IMI Familiar: 261 full (minDeps=1), 14 partial (minDeps=2 or 3), 33 non-participants (minDeps=0).

export type FreguesiaDat = {
  id: string;    // kebab-case unique key within the municipality
  name: string;  // Portuguese display name
  rate: number;  // Annual IMI rate as decimal for this parish
};

export type MunicipioData = {
  id: string;           // kebab-case unique key
  name: string;         // Portuguese display name
  distrito: string;     // District (for cascading dropdown)
  rate: number;         // Annual IMI rate as decimal (e.g. 0.003 = 0.3%)
  /** 0=no participation, 1=all tiers (1–3 deps), 2=min 2 deps, 3=min 3 deps only */
  imiFamiliarMinDeps: 0 | 1 | 2 | 3;
  /**
   * Per-parish rates — only present when the municipality has different rates
   * across parishes (currently: Espinho, Gondomar). When present, a parish
   * dropdown is shown in the UI and the selected parish rate overrides `rate`.
   */
  taxasFreguesia?: FreguesiaDat[];
};

// ─── Mainland districts ───────────────────────────────────────────────────────

export const MUNICIPIOS: MunicipioData[] = [
  // ── Aveiro (19) ──────────────────────────────────────────────────────────
  { id: "agueda",                   name: "Águeda",                   distrito: "Aveiro",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "albergaria-a-velha",       name: "Albergaria-a-Velha",       distrito: "Aveiro",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "anadia",                   name: "Anadia",                   distrito: "Aveiro",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "arouca",                   name: "Arouca",                   distrito: "Aveiro",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "aveiro",                   name: "Aveiro",                   distrito: "Aveiro",          rate: 0.0035,  imiFamiliarMinDeps: 1  },
  { id: "castelo-de-paiva",         name: "Castelo de Paiva",         distrito: "Aveiro",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "espinho",                  name: "Espinho",                  distrito: "Aveiro",          rate: 0.0037,  imiFamiliarMinDeps: 1,  taxasFreguesia: [
    { id: "anta",     name: "Anta",     rate: 0.0037 },
    { id: "espinho",  name: "Espinho",  rate: 0.0037 },
    { id: "guetim",   name: "Guetim",   rate: 0.0034 },
    { id: "paramos",  name: "Paramos",  rate: 0.0034 },
    { id: "silvalde", name: "Silvalde", rate: 0.0037 },
  ]},
  { id: "estarreja",                name: "Estarreja",                distrito: "Aveiro",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "ilhavo",                   name: "Ílhavo",                   distrito: "Aveiro",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "mealhada",                 name: "Mealhada",                 distrito: "Aveiro",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "murtosa",                  name: "Murtosa",                  distrito: "Aveiro",          rate: 0.0032,  imiFamiliarMinDeps: 1  },
  { id: "oliveira-de-azemeis",      name: "Oliveira de Azeméis",      distrito: "Aveiro",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "oliveira-do-bairro",       name: "Oliveira do Bairro",       distrito: "Aveiro",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "ovar",                     name: "Ovar",                     distrito: "Aveiro",          rate: 0.0034,  imiFamiliarMinDeps: 1  },
  { id: "santa-maria-da-feira",     name: "Santa Maria da Feira",     distrito: "Aveiro",          rate: 0.00365,  imiFamiliarMinDeps: 1  },
  { id: "sao-joao-da-madeira",      name: "São João da Madeira",      distrito: "Aveiro",          rate: 0.0035,  imiFamiliarMinDeps: 1  },
  { id: "sever-do-vouga",           name: "Sever do Vouga",           distrito: "Aveiro",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "vagos",                    name: "Vagos",                    distrito: "Aveiro",          rate: 0.004,  imiFamiliarMinDeps: 1  },
  { id: "vale-de-cambra",           name: "Vale de Cambra",           distrito: "Aveiro",          rate: 0.003,  imiFamiliarMinDeps: 1  },

  // ── Beja (15) ────────────────────────────────────────────────────────────
  { id: "aljustrel",                name: "Aljustrel",                distrito: "Beja",            rate: 0.003,  imiFamiliarMinDeps: 0  },
  { id: "almodovar",                name: "Almodôvar",                distrito: "Beja",            rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "alvito",                   name: "Alvito",                   distrito: "Beja",            rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "barrancos",                name: "Barrancos",                distrito: "Beja",            rate: 0.003,  imiFamiliarMinDeps: 0  },
  { id: "beja",                     name: "Beja",                     distrito: "Beja",            rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "castro-verde",             name: "Castro Verde",             distrito: "Beja",            rate: 0.003,  imiFamiliarMinDeps: 0  },
  { id: "cuba",                     name: "Cuba",                     distrito: "Beja",            rate: 0.003,  imiFamiliarMinDeps: 0  },
  { id: "ferreira-do-alentejo",     name: "Ferreira do Alentejo",     distrito: "Beja",            rate: 0.003,  imiFamiliarMinDeps: 3  },
  { id: "mertola",                  name: "Mértola",                  distrito: "Beja",            rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "moura",                    name: "Moura",                    distrito: "Beja",            rate: 0.003,  imiFamiliarMinDeps: 0  },
  { id: "mourao",                   name: "Mourão",                   distrito: "Beja",            rate: 0.00325,  imiFamiliarMinDeps: 1  },
  { id: "odemira",                  name: "Odemira",                  distrito: "Beja",            rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "ourique",                  name: "Ourique",                  distrito: "Beja",            rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "serpa",                    name: "Serpa",                    distrito: "Beja",            rate: 0.003,  imiFamiliarMinDeps: 0  },
  { id: "vidigueira",               name: "Vidigueira",               distrito: "Beja",            rate: 0.003,  imiFamiliarMinDeps: 0  },

  // ── Braga (14) ───────────────────────────────────────────────────────────
  { id: "amares",                   name: "Amares",                   distrito: "Braga",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "barcelos",                 name: "Barcelos",                 distrito: "Braga",           rate: 0.0033,  imiFamiliarMinDeps: 1  },
  { id: "braga",                    name: "Braga",                    distrito: "Braga",           rate: 0.0032,  imiFamiliarMinDeps: 1  },
  { id: "cabeceiras-de-basto",      name: "Cabeceiras de Basto",      distrito: "Braga",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "celorico-de-basto",        name: "Celorico de Basto",        distrito: "Braga",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "esposende",                name: "Esposende",                distrito: "Braga",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "fafe",                     name: "Fafe",                     distrito: "Braga",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "guimaraes",                name: "Guimarães",                distrito: "Braga",           rate: 0.0031,  imiFamiliarMinDeps: 2  },
  { id: "povoa-de-lanhoso",         name: "Póvoa de Lanhoso",         distrito: "Braga",           rate: 0.0034,  imiFamiliarMinDeps: 1  },
  { id: "terras-de-bouro",          name: "Terras de Bouro",          distrito: "Braga",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "vieira-do-minho",          name: "Vieira do Minho",          distrito: "Braga",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "vila-nova-de-famalicao",   name: "Vila Nova de Famalicão",   distrito: "Braga",           rate: 0.00335,  imiFamiliarMinDeps: 1  },
  { id: "vila-verde",               name: "Vila Verde",               distrito: "Braga",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "vizela",                   name: "Vizela",                   distrito: "Braga",           rate: 0.0035,  imiFamiliarMinDeps: 1  },

  // ── Bragança (12) ────────────────────────────────────────────────────────
  { id: "alfandega-da-fe",          name: "Alfândega da Fé",          distrito: "Bragança",        rate: 0.0038,  imiFamiliarMinDeps: 0  },
  { id: "braganca",                 name: "Bragança",                 distrito: "Bragança",        rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "carrazeda-de-ansiaes",     name: "Carrazeda de Ansiães",     distrito: "Bragança",        rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "freixo-de-espada-a-cinta", name: "Freixo de Espada à Cinta", distrito: "Bragança",        rate: 0.003,  imiFamiliarMinDeps: 0  },
  { id: "macedo-de-cavaleiros",     name: "Macedo de Cavaleiros",     distrito: "Bragança",        rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "miranda-do-douro",         name: "Miranda do Douro",         distrito: "Bragança",        rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "mirandela",                name: "Mirandela",                distrito: "Bragança",        rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "mogadouro",                name: "Mogadouro",                distrito: "Bragança",        rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "torre-de-moncorvo",        name: "Torre de Moncorvo",        distrito: "Bragança",        rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "vila-flor",                name: "Vila Flor",                distrito: "Bragança",        rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "vimioso",                  name: "Vimioso",                  distrito: "Bragança",        rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "vinhais",                  name: "Vinhais",                  distrito: "Bragança",        rate: 0.003,  imiFamiliarMinDeps: 1  },

  // ── Castelo Branco (11) ──────────────────────────────────────────────────
  { id: "belmonte",                 name: "Belmonte",                 distrito: "Castelo Branco",  rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "castelo-branco",           name: "Castelo Branco",           distrito: "Castelo Branco",  rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "covilha",                  name: "Covilhã",                  distrito: "Castelo Branco",  rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "fundao",                   name: "Fundão",                   distrito: "Castelo Branco",  rate: 0.0038,  imiFamiliarMinDeps: 1  },
  { id: "idanha-a-nova",            name: "Idanha-a-Nova",            distrito: "Castelo Branco",  rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "oleiros",                  name: "Oleiros",                  distrito: "Castelo Branco",  rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "penamacor",                name: "Penamacor",                distrito: "Castelo Branco",  rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "proenca-a-nova",           name: "Proença-a-Nova",           distrito: "Castelo Branco",  rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "serta",                    name: "Sertã",                    distrito: "Castelo Branco",  rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "vila-de-rei",              name: "Vila de Rei",              distrito: "Castelo Branco",  rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "vila-velha-de-rodao",      name: "Vila Velha de Ródão",      distrito: "Castelo Branco",  rate: 0.003,  imiFamiliarMinDeps: 1  },

  // ── Coimbra (17) ─────────────────────────────────────────────────────────
  { id: "arganil",                  name: "Arganil",                  distrito: "Coimbra",         rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "cantanhede",               name: "Cantanhede",               distrito: "Coimbra",         rate: 0.0038,  imiFamiliarMinDeps: 1  },
  { id: "coimbra",                  name: "Coimbra",                  distrito: "Coimbra",         rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "condeixa-a-nova",          name: "Condeixa-a-Nova",          distrito: "Coimbra",         rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "figueira-da-foz",          name: "Figueira da Foz",          distrito: "Coimbra",         rate: 0.004,  imiFamiliarMinDeps: 1  },
  { id: "gois",                     name: "Góis",                     distrito: "Coimbra",         rate: 0.0033,  imiFamiliarMinDeps: 1  },
  { id: "lousa",                    name: "Lousã",                    distrito: "Coimbra",         rate: 0.0038,  imiFamiliarMinDeps: 1  },
  { id: "mira",                     name: "Mira",                     distrito: "Coimbra",         rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "miranda-do-corvo",         name: "Miranda do Corvo",         distrito: "Coimbra",         rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "montemor-o-velho",         name: "Montemor-o-Velho",         distrito: "Coimbra",         rate: 0.0034,  imiFamiliarMinDeps: 1  },
  { id: "oliveira-do-hospital",     name: "Oliveira do Hospital",     distrito: "Coimbra",         rate: 0.0031,  imiFamiliarMinDeps: 1  },
  { id: "pampilhosa-da-serra",      name: "Pampilhosa da Serra",      distrito: "Coimbra",         rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "penacova",                 name: "Penacova",                 distrito: "Coimbra",         rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "penela",                   name: "Penela",                   distrito: "Coimbra",         rate: 0.00375,  imiFamiliarMinDeps: 1  },
  { id: "soure",                    name: "Soure",                    distrito: "Coimbra",         rate: 0.0034,  imiFamiliarMinDeps: 1  },
  { id: "tabua",                    name: "Tábua",                    distrito: "Coimbra",         rate: 0.0035,  imiFamiliarMinDeps: 1  },
  { id: "vila-nova-de-poiares",     name: "Vila Nova de Poiares",     distrito: "Coimbra",         rate: 0.0039,  imiFamiliarMinDeps: 0  },

  // ── Évora (14) ───────────────────────────────────────────────────────────
  { id: "alandroal",                name: "Alandroal",                distrito: "Évora",           rate: 0.0042,  imiFamiliarMinDeps: 0  },
  { id: "arraiolos",                name: "Arraiolos",                distrito: "Évora",           rate: 0.003,  imiFamiliarMinDeps: 0  },
  { id: "borba",                    name: "Borba",                    distrito: "Évora",           rate: 0.0035,  imiFamiliarMinDeps: 1  },
  { id: "estremoz",                 name: "Estremoz",                 distrito: "Évora",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "evora",                    name: "Évora",                    distrito: "Évora",           rate: 0.0037,  imiFamiliarMinDeps: 1  },
  { id: "montemor-o-novo",          name: "Montemor-o-Novo",          distrito: "Évora",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "mora",                     name: "Mora",                     distrito: "Évora",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "mourao-evora",             name: "Mourão",                   distrito: "Évora",           rate: 0.00325,  imiFamiliarMinDeps: 1  },
  { id: "portel",                   name: "Portel",                   distrito: "Évora",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "redondo",                  name: "Redondo",                  distrito: "Évora",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "reguengos-de-monsaraz",    name: "Reguengos de Monsaraz",    distrito: "Évora",           rate: 0.0035,  imiFamiliarMinDeps: 1  },
  { id: "vendas-novas",             name: "Vendas Novas",             distrito: "Évora",           rate: 0.0033,  imiFamiliarMinDeps: 1  },
  { id: "viana-do-alentejo",        name: "Viana do Alentejo",        distrito: "Évora",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "vila-vicosa",              name: "Vila Viçosa",              distrito: "Évora",           rate: 0.003,  imiFamiliarMinDeps: 1  },

  // ── Faro (16) ────────────────────────────────────────────────────────────
  { id: "albufeira",                name: "Albufeira",                distrito: "Faro",            rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "alcoutim",                 name: "Alcoutim",                 distrito: "Faro",            rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "aljezur",                  name: "Aljezur",                  distrito: "Faro",            rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "castro-marim",             name: "Castro Marim",             distrito: "Faro",            rate: 0.0039,  imiFamiliarMinDeps: 1  },
  { id: "faro",                     name: "Faro",                     distrito: "Faro",            rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "lagoa-faro",               name: "Lagoa",                    distrito: "Faro",            rate: 0.0036,  imiFamiliarMinDeps: 1  },
  { id: "lagos",                    name: "Lagos",                    distrito: "Faro",            rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "loule",                    name: "Loulé",                    distrito: "Faro",            rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "monchique",                name: "Monchique",                distrito: "Faro",            rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "olhao",                    name: "Olhão",                    distrito: "Faro",            rate: 0.0037,  imiFamiliarMinDeps: 1  },
  { id: "portimao",                 name: "Portimão",                 distrito: "Faro",            rate: 0.0037,  imiFamiliarMinDeps: 1  },
  { id: "sao-bras-de-alportel",     name: "São Brás de Alportel",     distrito: "Faro",            rate: 0.0041,  imiFamiliarMinDeps: 1  },
  { id: "silves",                   name: "Silves",                   distrito: "Faro",            rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "tavira",                   name: "Tavira",                   distrito: "Faro",            rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "vila-do-bispo",            name: "Vila do Bispo",            distrito: "Faro",            rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "vila-real-de-santo-antonio", name: "Vila Real de Santo António", distrito: "Faro",        rate: 0.0045, imiFamiliarMinDeps: 0  },

  // ── Guarda (14) ──────────────────────────────────────────────────────────
  { id: "aguiar-da-beira",          name: "Aguiar da Beira",          distrito: "Guarda",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "almeida",                  name: "Almeida",                  distrito: "Guarda",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "celorico-da-beira",        name: "Celorico da Beira",        distrito: "Guarda",          rate: 0.0035,  imiFamiliarMinDeps: 1  },
  { id: "figueira-de-castelo-rodrigo", name: "Figueira de Castelo Rodrigo", distrito: "Guarda",   rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "fornos-de-algodres",       name: "Fornos de Algodres",       distrito: "Guarda",          rate: 0.0041,  imiFamiliarMinDeps: 0  },
  { id: "gouveia",                  name: "Gouveia",                  distrito: "Guarda",          rate: 0.0036,  imiFamiliarMinDeps: 1  },
  { id: "guarda",                   name: "Guarda",                   distrito: "Guarda",          rate: 0.00375,  imiFamiliarMinDeps: 1  },
  { id: "manteigas",                name: "Manteigas",                distrito: "Guarda",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "meda",                     name: "Mêda",                     distrito: "Guarda",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "pinhel",                   name: "Pinhel",                   distrito: "Guarda",          rate: 0.003,  imiFamiliarMinDeps: 0  },
  { id: "sabugal",                  name: "Sabugal",                  distrito: "Guarda",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "seia",                     name: "Seia",                     distrito: "Guarda",          rate: 0.0034,  imiFamiliarMinDeps: 1  },
  { id: "trancoso",                 name: "Trancoso",                 distrito: "Guarda",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "vila-nova-de-foz-coa",     name: "Vila Nova de Foz Côa",     distrito: "Guarda",          rate: 0.003,  imiFamiliarMinDeps: 1  },

  // ── Leiria (16) ──────────────────────────────────────────────────────────
  { id: "alcobaca",                 name: "Alcobaça",                 distrito: "Leiria",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "alvaiazere",               name: "Alvaiázere",               distrito: "Leiria",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "ansiao",                   name: "Ansião",                   distrito: "Leiria",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "batalha",                  name: "Batalha",                  distrito: "Leiria",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "bombarral",                name: "Bombarral",                distrito: "Leiria",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "caldas-da-rainha",         name: "Caldas da Rainha",         distrito: "Leiria",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "castanheira-de-pera",      name: "Castanheira de Pêra",      distrito: "Leiria",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "figueiro-dos-vinhos",      name: "Figueiró dos Vinhos",      distrito: "Leiria",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "leiria",                   name: "Leiria",                   distrito: "Leiria",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "marinha-grande",           name: "Marinha Grande",           distrito: "Leiria",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "nazare",                   name: "Nazaré",                   distrito: "Leiria",          rate: 0.0045,  imiFamiliarMinDeps: 0  },
  { id: "obidos",                   name: "Óbidos",                   distrito: "Leiria",          rate: 0.0036,  imiFamiliarMinDeps: 1  },
  { id: "pedrogao-grande",          name: "Pedrógão Grande",          distrito: "Leiria",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "peniche",                  name: "Peniche",                  distrito: "Leiria",          rate: 0.00305,  imiFamiliarMinDeps: 1  },
  { id: "pombal",                   name: "Pombal",                   distrito: "Leiria",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "porto-de-mos",             name: "Porto de Mós",             distrito: "Leiria",          rate: 0.003,  imiFamiliarMinDeps: 1  },

  // ── Lisboa (16) ──────────────────────────────────────────────────────────
  { id: "alenquer",                 name: "Alenquer",                 distrito: "Lisboa",          rate: 0.0036,  imiFamiliarMinDeps: 1  },
  { id: "amadora",                  name: "Amadora",                  distrito: "Lisboa",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "arruda-dos-vinhos",        name: "Arruda dos Vinhos",        distrito: "Lisboa",          rate: 0.0036,  imiFamiliarMinDeps: 1  },
  { id: "azambuja",                 name: "Azambuja",                 distrito: "Lisboa",          rate: 0.0035,  imiFamiliarMinDeps: 1  },
  { id: "cadaval",                  name: "Cadaval",                  distrito: "Lisboa",          rate: 0.0035,  imiFamiliarMinDeps: 1  },
  { id: "cascais",                  name: "Cascais",                  distrito: "Lisboa",          rate: 0.0035,  imiFamiliarMinDeps: 1  },
  { id: "lisboa",                   name: "Lisboa",                   distrito: "Lisboa",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "loures",                   name: "Loures",                   distrito: "Lisboa",          rate: 0.00361,  imiFamiliarMinDeps: 1  },
  { id: "lourinha",                 name: "Lourinhã",                 distrito: "Lisboa",          rate: 0.0035,  imiFamiliarMinDeps: 1  },
  { id: "mafra",                    name: "Mafra",                    distrito: "Lisboa",          rate: 0.00425,  imiFamiliarMinDeps: 1  },
  { id: "odivelas",                 name: "Odivelas",                 distrito: "Lisboa",          rate: 0.0033,  imiFamiliarMinDeps: 2  },
  { id: "oeiras",                   name: "Oeiras",                   distrito: "Lisboa",          rate: 0.0045, imiFamiliarMinDeps: 1  },
  { id: "sintra",                   name: "Sintra",                   distrito: "Lisboa",          rate: 0.003,  imiFamiliarMinDeps: 0  },
  { id: "sobral-de-monte-agraco",   name: "Sobral de Monte Agraço",   distrito: "Lisboa",          rate: 0.003,  imiFamiliarMinDeps: 0  },
  { id: "torres-vedras",            name: "Torres Vedras",            distrito: "Lisboa",          rate: 0.0035,  imiFamiliarMinDeps: 1  },
  { id: "vila-franca-de-xira",      name: "Vila Franca de Xira",      distrito: "Lisboa",          rate: 0.003,  imiFamiliarMinDeps: 1  },

  // ── Portalegre (15) ──────────────────────────────────────────────────────
  { id: "alter-do-chao",            name: "Alter do Chão",            distrito: "Portalegre",      rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "arronches",                name: "Arronches",                distrito: "Portalegre",      rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "avis",                     name: "Avis",                     distrito: "Portalegre",      rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "campo-maior",              name: "Campo Maior",              distrito: "Portalegre",      rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "castelo-de-vide",          name: "Castelo de Vide",          distrito: "Portalegre",      rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "crato",                    name: "Crato",                    distrito: "Portalegre",      rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "elvas",                    name: "Elvas",                    distrito: "Portalegre",      rate: 0.0035,  imiFamiliarMinDeps: 1  },
  { id: "fronteira",                name: "Fronteira",                distrito: "Portalegre",      rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "gaviao",                   name: "Gavião",                   distrito: "Portalegre",      rate: 0.003,  imiFamiliarMinDeps: 0  },
  { id: "marvao",                   name: "Marvão",                   distrito: "Portalegre",      rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "monforte",                 name: "Monforte",                 distrito: "Portalegre",      rate: 0.0034,  imiFamiliarMinDeps: 1  },
  { id: "nisa",                     name: "Nisa",                     distrito: "Portalegre",      rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "ponte-de-sor",             name: "Ponte de Sor",             distrito: "Portalegre",      rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "portalegre",               name: "Portalegre",               distrito: "Portalegre",      rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "sousel",                   name: "Sousel",                   distrito: "Portalegre",      rate: 0.0035,  imiFamiliarMinDeps: 1  },

  // ── Porto (18) ───────────────────────────────────────────────────────────
  // NOTE: Porto and Vila Nova de Gaia are confirmed non-participants in IMI Familiar 2026
  { id: "amarante",                 name: "Amarante",                 distrito: "Porto",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "baiao",                    name: "Baião",                    distrito: "Porto",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "felgueiras",               name: "Felgueiras",               distrito: "Porto",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "gondomar",                 name: "Gondomar",                 distrito: "Porto",           rate: 0.00372,  imiFamiliarMinDeps: 1,  taxasFreguesia: [
    { id: "baguim-do-monte",              name: "Baguim do Monte (Rio Tinto)",              rate: 0.00372 },
    { id: "fanzeres-sao-pedro-da-cova",   name: "Fânzeres e São Pedro da Cova",             rate: 0.00372 },
    { id: "foz-do-sousa-covelo",          name: "Foz do Sousa e Covelo",                    rate: 0.00326 },
    { id: "gondomar-sao-cosme",           name: "Gondomar (São Cosme), Valbom e Jovim",     rate: 0.00372 },
    { id: "lomba",                        name: "Lomba",                                    rate: 0.00326 },
    { id: "melres-medas",                 name: "Melres e Medas",                           rate: 0.00326 },
    { id: "rio-tinto",                    name: "Rio Tinto",                                rate: 0.00372 },
  ]},
  { id: "lousada",                  name: "Lousada",                  distrito: "Porto",           rate: 0.003,  imiFamiliarMinDeps: 3  },
  { id: "maia",                     name: "Maia",                     distrito: "Porto",           rate: 0.00345,  imiFamiliarMinDeps: 3  },
  { id: "marco-de-canaveses",       name: "Marco de Canaveses",       distrito: "Porto",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "matosinhos",               name: "Matosinhos",               distrito: "Porto",           rate: 0.0037,  imiFamiliarMinDeps: 1  },
  { id: "pacos-de-ferreira",        name: "Paços de Ferreira",        distrito: "Porto",           rate: 0.003,  imiFamiliarMinDeps: 3  },
  { id: "paredes",                  name: "Paredes",                  distrito: "Porto",           rate: 0.003,  imiFamiliarMinDeps: 2  },
  { id: "penafiel",                 name: "Penafiel",                 distrito: "Porto",           rate: 0.003,  imiFamiliarMinDeps: 3  },
  { id: "porto",                    name: "Porto",                    distrito: "Porto",           rate: 0.00324,  imiFamiliarMinDeps: 0  },
  { id: "povoa-de-varzim",          name: "Póvoa de Varzim",          distrito: "Porto",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "santo-tirso",              name: "Santo Tirso",              distrito: "Porto",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "trofa",                    name: "Trofa",                    distrito: "Porto",           rate: 0.0039,  imiFamiliarMinDeps: 1  },
  { id: "valongo",                  name: "Valongo",                  distrito: "Porto",           rate: 0.0034,  imiFamiliarMinDeps: 1  },
  { id: "vila-do-conde",            name: "Vila do Conde",            distrito: "Porto",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "vila-nova-de-gaia",        name: "Vila Nova de Gaia",        distrito: "Porto",           rate: 0.0036,  imiFamiliarMinDeps: 3  },

  // ── Santarém (21) ────────────────────────────────────────────────────────
  { id: "abrantes",                 name: "Abrantes",                 distrito: "Santarém",        rate: 0.004,  imiFamiliarMinDeps: 1  },
  { id: "alcanena",                 name: "Alcanena",                 distrito: "Santarém",        rate: 0.00365,  imiFamiliarMinDeps: 1  },
  { id: "almeirim",                 name: "Almeirim",                 distrito: "Santarém",        rate: 0.00375,  imiFamiliarMinDeps: 0  },
  { id: "alpiarca",                 name: "Alpiarça",                 distrito: "Santarém",        rate: 0.0036,  imiFamiliarMinDeps: 1  },
  { id: "benavente",                name: "Benavente",                distrito: "Santarém",        rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "cartaxo",                  name: "Cartaxo",                  distrito: "Santarém",        rate: 0.0045, imiFamiliarMinDeps: 0  },
  { id: "chamusca",                 name: "Chamusca",                 distrito: "Santarém",        rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "constancia",               name: "Constância",               distrito: "Santarém",        rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "coruche",                  name: "Coruche",                  distrito: "Santarém",        rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "entroncamento",            name: "Entroncamento",            distrito: "Santarém",        rate: 0.003,  imiFamiliarMinDeps: 3  },
  { id: "ferreira-do-zezere",       name: "Ferreira do Zêzere",       distrito: "Santarém",        rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "golega",                   name: "Golegã",                   distrito: "Santarém",        rate: 0.0033,  imiFamiliarMinDeps: 1  },
  { id: "macao",                    name: "Mação",                    distrito: "Santarém",        rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "ourem",                    name: "Ourém",                    distrito: "Santarém",        rate: 0.00325,  imiFamiliarMinDeps: 1  },
  { id: "rio-maior",                name: "Rio Maior",                distrito: "Santarém",        rate: 0.0038,  imiFamiliarMinDeps: 1  },
  { id: "salvaterra-de-magos",      name: "Salvaterra de Magos",      distrito: "Santarém",        rate: 0.0035,  imiFamiliarMinDeps: 0  },
  { id: "santarem",                 name: "Santarém",                 distrito: "Santarém",        rate: 0.00367,  imiFamiliarMinDeps: 1  },
  { id: "sardoal",                  name: "Sardoal",                  distrito: "Santarém",        rate: 0.00325,  imiFamiliarMinDeps: 1  },
  { id: "tomar",                    name: "Tomar",                    distrito: "Santarém",        rate: 0.0034,  imiFamiliarMinDeps: 1  },
  { id: "torres-novas",             name: "Torres Novas",             distrito: "Santarém",        rate: 0.0034,  imiFamiliarMinDeps: 1  },
  { id: "vila-nova-da-barquinha",   name: "Vila Nova da Barquinha",   distrito: "Santarém",        rate: 0.003,  imiFamiliarMinDeps: 1  },

  // ── Setúbal (13) ─────────────────────────────────────────────────────────
  { id: "alcacer-do-sal",           name: "Alcácer do Sal",           distrito: "Setúbal",         rate: 0.003,  imiFamiliarMinDeps: 0  },
  { id: "alcochete",                name: "Alcochete",                distrito: "Setúbal",         rate: 0.0034,  imiFamiliarMinDeps: 1  },
  { id: "almada",                   name: "Almada",                   distrito: "Setúbal",         rate: 0.0035,  imiFamiliarMinDeps: 3  },
  { id: "barreiro",                 name: "Barreiro",                 distrito: "Setúbal",         rate: 0.0035,  imiFamiliarMinDeps: 0  },
  { id: "grandola",                 name: "Grândola",                 distrito: "Setúbal",         rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "moita",                    name: "Moita",                    distrito: "Setúbal",         rate: 0.00365,  imiFamiliarMinDeps: 1  },
  { id: "montijo",                  name: "Montijo",                  distrito: "Setúbal",         rate: 0.0031,  imiFamiliarMinDeps: 1  },
  { id: "palmela",                  name: "Palmela",                  distrito: "Setúbal",         rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "santiago-do-cacem",        name: "Santiago do Cacém",        distrito: "Setúbal",         rate: 0.003,  imiFamiliarMinDeps: 0  },
  { id: "seixal",                   name: "Seixal",                   distrito: "Setúbal",         rate: 0.00325,  imiFamiliarMinDeps: 0  },
  { id: "sesimbra",                 name: "Sesimbra",                 distrito: "Setúbal",         rate: 0.004,  imiFamiliarMinDeps: 1  },
  { id: "setubal",                  name: "Setúbal",                  distrito: "Setúbal",         rate: 0.0037,  imiFamiliarMinDeps: 1  },
  { id: "sines",                    name: "Sines",                    distrito: "Setúbal",         rate: 0.0033,  imiFamiliarMinDeps: 1  },

  // ── Viana do Castelo (10) ─────────────────────────────────────────────────
  { id: "arcos-de-valdevez",        name: "Arcos de Valdevez",        distrito: "Viana do Castelo", rate: 0.0034, imiFamiliarMinDeps: 1  },
  { id: "caminha",                  name: "Caminha",                  distrito: "Viana do Castelo", rate: 0.0039, imiFamiliarMinDeps: 1  },
  { id: "melgaco",                  name: "Melgaço",                  distrito: "Viana do Castelo", rate: 0.0032, imiFamiliarMinDeps: 1  },
  { id: "moncao",                   name: "Monção",                   distrito: "Viana do Castelo", rate: 0.003, imiFamiliarMinDeps: 1  },
  { id: "paredes-de-coura",         name: "Paredes de Coura",         distrito: "Viana do Castelo", rate: 0.003, imiFamiliarMinDeps: 3  },
  { id: "ponte-da-barca",           name: "Ponte da Barca",           distrito: "Viana do Castelo", rate: 0.0034, imiFamiliarMinDeps: 1  },
  { id: "ponte-de-lima",            name: "Ponte de Lima",            distrito: "Viana do Castelo", rate: 0.0032, imiFamiliarMinDeps: 1  },
  { id: "valenca",                  name: "Valença",                  distrito: "Viana do Castelo", rate: 0.003, imiFamiliarMinDeps: 1  },
  { id: "viana-do-castelo",         name: "Viana do Castelo",         distrito: "Viana do Castelo", rate: 0.0035, imiFamiliarMinDeps: 1  },
  { id: "vila-nova-de-cerveira",    name: "Vila Nova de Cerveira",    distrito: "Viana do Castelo", rate: 0.003, imiFamiliarMinDeps: 1  },

  // ── Vila Real (14) ───────────────────────────────────────────────────────
  { id: "alijo",                    name: "Alijó",                    distrito: "Vila Real",       rate: 0.0032,  imiFamiliarMinDeps: 1  },
  { id: "boticas",                  name: "Boticas",                  distrito: "Vila Real",       rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "chaves",                   name: "Chaves",                   distrito: "Vila Real",       rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "mesao-frio",               name: "Mesão Frio",               distrito: "Vila Real",       rate: 0.004,  imiFamiliarMinDeps: 0  },
  { id: "mondim-de-basto",          name: "Mondim de Basto",          distrito: "Vila Real",       rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "montalegre",               name: "Montalegre",               distrito: "Vila Real",       rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "murca",                    name: "Murça",                    distrito: "Vila Real",       rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "peso-da-regua",            name: "Peso da Régua",            distrito: "Vila Real",       rate: 0.0037,  imiFamiliarMinDeps: 1  },
  { id: "ribeira-de-pena",          name: "Ribeira de Pena",          distrito: "Vila Real",       rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "sabrosa",                  name: "Sabrosa",                  distrito: "Vila Real",       rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "santa-marta-de-penaguiao", name: "Santa Marta de Penaguião", distrito: "Vila Real",       rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "valpacos",                 name: "Valpaços",                 distrito: "Vila Real",       rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "vila-pouca-de-aguiar",     name: "Vila Pouca de Aguiar",     distrito: "Vila Real",       rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "vila-real",                name: "Vila Real",                distrito: "Vila Real",       rate: 0.00385,  imiFamiliarMinDeps: 1  },

  // ── Viseu (23) ───────────────────────────────────────────────────────────
  { id: "armamar",                  name: "Armamar",                  distrito: "Viseu",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "carregal-do-sal",          name: "Carregal do Sal",          distrito: "Viseu",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "castro-daire",             name: "Castro Daire",             distrito: "Viseu",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "cinfaes",                  name: "Cinfães",                  distrito: "Viseu",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "lamego",                   name: "Lamego",                   distrito: "Viseu",           rate: 0.00365,  imiFamiliarMinDeps: 1  },
  { id: "mangualde",                name: "Mangualde",                distrito: "Viseu",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "moimenta-da-beira",        name: "Moimenta da Beira",        distrito: "Viseu",           rate: 0.003,  imiFamiliarMinDeps: 0  },
  { id: "mortagua",                 name: "Mortágua",                 distrito: "Viseu",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "nelas",                    name: "Nelas",                    distrito: "Viseu",           rate: 0.003,  imiFamiliarMinDeps: 0  },
  { id: "oliveira-de-frades",       name: "Oliveira de Frades",       distrito: "Viseu",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "penalva-do-castelo",       name: "Penalva do Castelo",       distrito: "Viseu",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "penedono",                 name: "Penedono",                 distrito: "Viseu",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "resende",                  name: "Resende",                  distrito: "Viseu",           rate: 0.00375,  imiFamiliarMinDeps: 1  },
  { id: "santa-comba-dao",          name: "Santa Comba Dão",          distrito: "Viseu",           rate: 0.0039,  imiFamiliarMinDeps: 3  },
  { id: "sao-joao-da-pesqueira",    name: "São João da Pesqueira",    distrito: "Viseu",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "sao-pedro-do-sul",         name: "São Pedro do Sul",         distrito: "Viseu",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "satao",                    name: "Sátão",                    distrito: "Viseu",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "tabuaco",                  name: "Tabuaço",                  distrito: "Viseu",           rate: 0.004,  imiFamiliarMinDeps: 1  },
  { id: "tarouca",                  name: "Tarouca",                  distrito: "Viseu",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "tondela",                  name: "Tondela",                  distrito: "Viseu",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "vila-nova-de-paiva",       name: "Vila Nova de Paiva",       distrito: "Viseu",           rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "viseu",                    name: "Viseu",                    distrito: "Viseu",           rate: 0.003,  imiFamiliarMinDeps: 2  },
  { id: "vouzela",                  name: "Vouzela",                  distrito: "Viseu",           rate: 0.003,  imiFamiliarMinDeps: 1  },

  // ─── Açores (19) ─────────────────────────────────────────────────────────
  { id: "angra-do-heroismo",        name: "Angra do Heroísmo",        distrito: "Açores",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "calheta-sao-jorge",        name: "Calheta (São Jorge)",      distrito: "Açores",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "corvo",                    name: "Corvo",                    distrito: "Açores",          rate: 0.003,  imiFamiliarMinDeps: 0  },
  { id: "horta",                    name: "Horta",                    distrito: "Açores",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "lagoa-sao-miguel",         name: "Lagoa (São Miguel)",       distrito: "Açores",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "lajes-das-flores",         name: "Lajes das Flores",         distrito: "Açores",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "lajes-do-pico",            name: "Lajes do Pico",            distrito: "Açores",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "madalena",                 name: "Madalena",                 distrito: "Açores",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "nordeste",                 name: "Nordeste",                 distrito: "Açores",          rate: 0.00425,  imiFamiliarMinDeps: 0  },
  { id: "ponta-delgada",            name: "Ponta Delgada",            distrito: "Açores",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "povoacao",                 name: "Povoação",                 distrito: "Açores",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "ribeira-grande",           name: "Ribeira Grande",           distrito: "Açores",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "santa-cruz-da-graciosa",   name: "Santa Cruz da Graciosa",   distrito: "Açores",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "santa-cruz-das-flores",    name: "Santa Cruz das Flores",    distrito: "Açores",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "sao-roque-do-pico",        name: "São Roque do Pico",        distrito: "Açores",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "velas",                    name: "Velas",                    distrito: "Açores",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "vila-do-porto",            name: "Vila do Porto",            distrito: "Açores",          rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "vila-franca-do-campo",     name: "Vila Franca do Campo",     distrito: "Açores",          rate: 0.00425,  imiFamiliarMinDeps: 0  },
  { id: "praia-da-vitoria",         name: "Praia da Vitória",         distrito: "Açores",          rate: 0.003,  imiFamiliarMinDeps: 1  },

  // ─── Madeira (11) ────────────────────────────────────────────────────────
  { id: "calheta-madeira",          name: "Calheta (Madeira)",        distrito: "Madeira",         rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "camara-de-lobos",          name: "Câmara de Lobos",          distrito: "Madeira",         rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "funchal",                  name: "Funchal",                  distrito: "Madeira",         rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "machico",                  name: "Machico",                  distrito: "Madeira",         rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "ponta-do-sol",             name: "Ponta do Sol",             distrito: "Madeira",         rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "porto-moniz",              name: "Porto Moniz",              distrito: "Madeira",         rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "porto-santo",              name: "Porto Santo",              distrito: "Madeira",         rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "ribeira-brava",            name: "Ribeira Brava",            distrito: "Madeira",         rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "santa-cruz-madeira",       name: "Santa Cruz (Madeira)",     distrito: "Madeira",         rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "santana",                  name: "Santana",                  distrito: "Madeira",         rate: 0.003,  imiFamiliarMinDeps: 1  },
  { id: "sao-vicente",              name: "São Vicente",              distrito: "Madeira",         rate: 0.003,  imiFamiliarMinDeps: 1  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getMunicipio(id: string): MunicipioData | undefined {
  return MUNICIPIOS.find((m) => m.id === id);
}

export function getMunicipiosByDistrito(distrito: string): MunicipioData[] {
  return MUNICIPIOS.filter((m) => m.distrito === distrito);
}

export const DISTRITOS: string[] = [
  ...new Set(MUNICIPIOS.map((m) => m.distrito)),
];
