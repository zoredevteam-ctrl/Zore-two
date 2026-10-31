// ════════════════════════════════════════════════════════════════
//   HACK PLUGIN — Detección real por país y operador
// ════════════════════════════════════════════════════════════════

// ── Fallback por código de país ───────────────────────────────
const COUNTRY_FALLBACK = {
    // Latinoamérica
    '57':  { op: 'Claro Colombia',     asn: 'AS13489',  subnet: '181.49',  rdns: 'mobile-{ip}.claro.net.co',        tz: 'America/Bogota',                    country: 'كولومبيا',          flag: '🇨🇴' },
    '52':  { op: 'Telcel',             asn: 'AS8151',   subnet: '187.141', rdns: '{ip}.mobile.telcel.com',          tz: 'America/Mexico_City',               country: 'المكسيك',            flag: '🇲🇽' },
    '58':  { op: 'Movistar Venezuela', asn: 'AS6306',   subnet: '190.202', rdns: '{ip}.movistar.net.ve',            tz: 'America/Caracas',                   country: 'Venezuela',         flag: '🇻🇪' },
    '51':  { op: 'Claro Perú',         asn: 'AS27843',  subnet: '181.65',  rdns: 'mobile-{ip}.claro.net.pe',        tz: 'America/Lima',                      country: 'بيرو',              flag: '🇵🇪' },
    '54':  { op: 'Personal',           asn: 'AS22927',  subnet: '181.10',  rdns: '{ip}.gprs.personal.com.ar',       tz: 'America/Argentina/Buenos_Aires',    country: 'Argentina',         flag: '🇦🇷' },
    '56':  { op: 'Entel Chile',        asn: 'AS22047',  subnet: '190.98',  rdns: '{ip}.dynamic.entel.cl',           tz: 'America/Santiago',                  country: 'Chile',             flag: '🇨🇱' },
    '55':  { op: 'Vivo',               asn: 'AS26615',  subnet: '177.8',   rdns: '{ip}.dynamic.vivo.com.br',        tz: 'America/Sao_Paulo',                 country: 'Brasil',            flag: '🇧🇷' },
    '593': { op: 'Claro Ecuador',      asn: 'AS27947',  subnet: '190.11',  rdns: 'mobile-{ip}.claro.net.ec',        tz: 'America/Guayaquil',                 country: 'Ecuador',           flag: '🇪🇨' },
    '591': { op: 'Tigo Bolivia',       asn: 'AS27882',  subnet: '190.129', rdns: '{ip}.tigo.bo',                    tz: 'America/La_Paz',                    country: 'Bolivia',           flag: '🇧🇴' },
    '595': { op: 'Tigo Paraguay',      asn: 'AS27882',  subnet: '200.85',  rdns: '{ip}.tigo.com.py',                tz: 'America/Asuncion',                  country: 'Paraguay',          flag: '🇵🇾' },
    '598': { op: 'Antel',              asn: 'AS6057',   subnet: '167.56',  rdns: '{ip}.antel.net.uy',               tz: 'America/Montevideo',                country: 'Uruguay',           flag: '🇺🇾' },
    '507': { op: 'Claro Panamá',       asn: 'AS27843',  subnet: '181.211', rdns: 'mobile-{ip}.claro.com.pa',        tz: 'America/Panama',                    country: 'بنما',            flag: '🇵🇦' },
    '506': { op: 'Kolbi',              asn: 'AS11297',  subnet: '201.192', rdns: '{ip}.ice.cr',                     tz: 'America/Costa_Rica',                country: 'Costa Rica',        flag: '🇨🇷' },
    '502': { op: 'Tigo Guatemala',     asn: 'AS27882',  subnet: '190.111', rdns: '{ip}.tigo.com.gt',                tz: 'America/Guatemala',                 country: 'Guatemala',         flag: '🇬🇹' },
    '504': { op: 'Tigo Honduras',      asn: 'AS27882',  subnet: '190.7',   rdns: '{ip}.tigo.hn',                    tz: 'America/Tegucigalpa',               country: 'Honduras',          flag: '🇭🇳' },
    '503': { op: 'Tigo El Salvador',   asn: 'AS27882',  subnet: '190.88',  rdns: '{ip}.tigo.net.sv',                tz: 'America/El_Salvador',               country: 'السلفادور',       flag: '🇸🇻' },
    '505': { op: 'Claro Nicaragua',    asn: 'AS27843',  subnet: '186.130', rdns: 'mobile-{ip}.claro.net.ni',        tz: 'America/Managua',                   country: 'Nicaragua',         flag: '🇳🇮' },
    '53':  { op: 'ETECSA',             asn: 'AS27725',  subnet: '152.206', rdns: '{ip}.etecsa.cu',                  tz: 'America/Havana',                    country: 'Cuba',              flag: '🇨🇺' },
    // Norteamérica
    '1':   { op: 'AT&T',               asn: 'AS7018',   subnet: '72.229',  rdns: '{ip}.sbcglobal.net',              tz: 'America/New_York',                  country: 'Estados Unidos',    flag: '🇺🇸' },
    // Europa
    '34':  { op: 'Movistar España',    asn: 'AS3352',   subnet: '81.33',   rdns: '{ip}.mobile.movistar.net',        tz: 'Europe/Madrid',                     country: 'إسبانيا',            flag: '🇪🇸' },
    '44':  { op: 'EE',                 asn: 'AS12576',  subnet: '86.3',    rdns: '{ip}.mobile.ee.co.uk',            tz: 'Europe/London',                     country: 'Reino Unido',       flag: '🇬🇧' },
    '49':  { op: 'Telekom DE',         asn: 'AS3320',   subnet: '80.187',  rdns: '{ip}.t-dialin.net',               tz: 'Europe/Berlin',                     country: 'Alemania',          flag: '🇩🇪' },
    '33':  { op: 'Orange FR',          asn: 'AS5410',   subnet: '90.50',   rdns: '{ip}.orange.fr',                  tz: 'Europe/Paris',                      country: 'Francia',           flag: '🇫🇷' },
    '39':  { op: 'TIM Italia',         asn: 'AS1267',   subnet: '79.20',   rdns: '{ip}.tim.it',                     tz: 'Europe/Rome',                       country: 'Italia',            flag: '🇮🇹' },
    '351': { op: 'MEO Portugal',       asn: 'AS5432',   subnet: '85.243',  rdns: '{ip}.meo.pt',                     tz: 'Europe/Lisbon',                     country: 'Portugal',          flag: '🇵🇹' },
    '31':  { op: 'KPN Nederland',      asn: 'AS1136',   subnet: '84.105',  rdns: '{ip}.dynamic.kpn.net',            tz: 'Europe/Amsterdam',                  country: 'Países Bajos',      flag: '🇳🇱' },
    '32':  { op: 'Proximus',           asn: 'AS5432',   subnet: '81.246',  rdns: '{ip}.proximus.be',                tz: 'Europe/Brussels',                   country: 'Bélgica',           flag: '🇧🇪' },
    '41':  { op: 'Swisscom',           asn: 'AS3303',   subnet: '85.2',    rdns: '{ip}.static.swisscom.ch',         tz: 'Europe/Zurich',                     country: 'Suiza',             flag: '🇨🇭' },
    '46':  { op: 'Telia SE',           asn: 'AS3301',   subnet: '62.109',  rdns: '{ip}.telia.com',                  tz: 'Europe/Stockholm',                  country: 'Suecia',            flag: '🇸🇪' },
    '47':  { op: 'Telenor NO',         asn: 'AS2119',   subnet: '84.208',  rdns: '{ip}.telenor.net',                tz: 'Europe/Oslo',                       country: 'Noruega',           flag: '🇳🇴' },
    '45':  { op: 'TDC DK',             asn: 'AS3292',   subnet: '80.62',   rdns: '{ip}.tdc.dk',                     tz: 'Europe/Copenhagen',                 country: 'Dinamarca',         flag: '🇩🇰' },
    '358': { op: 'Elisa FI',           asn: 'AS719',    subnet: '91.157',  rdns: '{ip}.elisa.net',                  tz: 'Europe/Helsinki',                   country: 'Finlandia',         flag: '🇫🇮' },
    '43':  { op: 'A1 Austria',         asn: 'AS8447',   subnet: '62.178',  rdns: '{ip}.a1.net',                     tz: 'Europe/Vienna',                     country: 'Austria',           flag: '🇦🇹' },
    '420': { op: 'T-Mobile CZ',        asn: 'AS12912',  subnet: '85.160',  rdns: '{ip}.t-mobile.cz',                tz: 'Europe/Prague',                     country: 'Rep. Checa',        flag: '🇨🇿' },
    '48':  { op: 'Orange PL',          asn: 'AS5617',   subnet: '83.24',   rdns: '{ip}.neoplus.adsl.tpnet.pl',      tz: 'Europe/Warsaw',                     country: 'Polonia',           flag: '🇵🇱' },
    '36':  { op: 'Telekom HU',         asn: 'AS5483',   subnet: '89.134',  rdns: '{ip}.t-mobile.hu',                tz: 'Europe/Budapest',                   country: 'Hungría',           flag: '🇭🇺' },
    '40':  { op: 'Orange RO',          asn: 'AS9050',   subnet: '86.121',  rdns: '{ip}.orange.ro',                  tz: 'Europe/Bucharest',                  country: 'Rumanía',           flag: '🇷🇴' },
    '359': { op: 'A1 Bulgaria',        asn: 'AS8866',   subnet: '95.111',  rdns: '{ip}.a1.bg',                      tz: 'Europe/Sofia',                      country: 'Bulgaria',          flag: '🇧🇬' },
    '30':  { op: 'Cosmote GR',         asn: 'AS6799',   subnet: '94.64',   rdns: '{ip}.cosmote.gr',                 tz: 'Europe/Athens',                     country: 'Grecia',            flag: '🇬🇷' },
    '7':   { op: 'MTS Russia',         asn: 'AS8359',   subnet: '178.140', rdns: '{ip}.dynamic.mts.ru',             tz: 'Europe/Moscow',                     country: 'Rusia',             flag: '🇷🇺' },
    '380': { op: 'Kyivstar',           asn: 'AS15895',  subnet: '176.36',  rdns: '{ip}.kyivstar.net',               tz: 'Europe/Kyiv',                       country: 'Ucrania',           flag: '🇺🇦' },
    '375': { op: 'A1 Belarus',         asn: 'AS25106',  subnet: '178.120', rdns: '{ip}.a1.by',                      tz: 'Europe/Minsk',                      country: 'Bielorrusia',       flag: '🇧🇾' },
    '373': { op: 'Orange MD',          asn: 'AS8926',   subnet: '79.112',  rdns: '{ip}.orange.md',                  tz: 'Europe/Chisinau',                   country: 'Moldavia',          flag: '🇲🇩' },
    '90':  { op: 'Turkcell',           asn: 'AS47524',  subnet: '88.229',  rdns: '{ip}.turkcell.com.tr',            tz: 'Europe/Istanbul',                   country: 'Turquía',           flag: '🇹🇷' },
    // Asia
    '86':  { op: 'China Mobile',       asn: 'AS9808',   subnet: '117.136', rdns: '{ip}.mobile.chinamobile.com',     tz: 'Asia/Shanghai',                     country: 'China',             flag: '🇨🇳' },
    '81':  { op: 'NTT Docomo',         asn: 'AS9605',   subnet: '111.107', rdns: '{ip}.spmode.ne.jp',               tz: 'Asia/Tokyo',                        country: 'Japón',             flag: '🇯🇵' },
    '82':  { op: 'SKT Korea',          asn: 'AS9644',   subnet: '114.206', rdns: '{ip}.sktelecom.com',              tz: 'Asia/Seoul',                        country: 'Corea del Sur',     flag: '🇰🇷' },
    '91':  { op: 'Jio India',          asn: 'AS55836',  subnet: '49.36',   rdns: '{ip}.jio.com',                    tz: 'Asia/Kolkata',                      country: 'India',             flag: '🇮🇳' },
    '62':  { op: 'Telkomsel',          asn: 'AS23693',  subnet: '114.125', rdns: '{ip}.telkomsel.net.id',           tz: 'Asia/Jakarta',                      country: 'Indonesia',         flag: '🇮🇩' },
    '92':  { op: 'Jazz PK',            asn: 'AS45669',  subnet: '103.255', rdns: '{ip}.jazz.com.pk',                tz: 'Asia/Karachi',                      country: 'Pakistán',          flag: '🇵🇰' },
    '63':  { op: 'Globe PH',           asn: 'AS4775',   subnet: '112.198', rdns: '{ip}.globe.com.ph',               tz: 'Asia/Manila',                       country: 'Filipinas',         flag: '🇵🇭' },
    '66':  { op: 'AIS Thailand',       asn: 'AS131090', subnet: '171.96',  rdns: '{ip}.ais.th',                     tz: 'Asia/Bangkok',                      country: 'Tailandia',         flag: '🇹🇭' },
    '84':  { op: 'Viettel',            asn: 'AS45899',  subnet: '113.160', rdns: '{ip}.viettel.vn',                 tz: 'Asia/Ho_Chi_Minh',                  country: 'Vietnam',           flag: '🇻🇳' },
    '60':  { op: 'Maxis MY',           asn: 'AS9534',   subnet: '175.136', rdns: '{ip}.maxis.net.my',               tz: 'Asia/Kuala_Lumpur',                 country: 'Malasia',           flag: '🇲🇾' },
    '65':  { op: 'Singtel',            asn: 'AS7473',   subnet: '118.200', rdns: '{ip}.singnet.com.sg',             tz: 'Asia/Singapore',                    country: 'Singapur',          flag: '🇸🇬' },
    '66':  { op: 'AIS Thailand',       asn: 'AS131090', subnet: '171.96',  rdns: '{ip}.ais.th',                     tz: 'Asia/Bangkok',                      country: 'Tailandia',         flag: '🇹🇭' },
    '880': { op: 'Grameenphone',       asn: 'AS24389',  subnet: '103.230', rdns: '{ip}.grameenphone.com',           tz: 'Asia/Dhaka',                        country: 'Bangladesh',        flag: '🇧🇩' },
    '94':  { op: 'Dialog LK',          asn: 'AS45429',  subnet: '112.134', rdns: '{ip}.dialog.lk',                  tz: 'Asia/Colombo',                      country: 'Sri Lanka',         flag: '🇱🇰' },
    '95':  { op: 'MPT Myanmar',        asn: 'AS18399',  subnet: '203.81',  rdns: '{ip}.mpt.net.mm',                 tz: 'Asia/Yangon',                       country: 'Myanmar',           flag: '🇲🇲' },
    '855': { op: 'Smart Axiata KH',    asn: 'AS38623',  subnet: '203.189', rdns: '{ip}.smart.com.kh',               tz: 'Asia/Phnom_Penh',                   country: 'Camboya',           flag: '🇰🇭' },
    '856': { op: 'Lao Telecom',        asn: 'AS17665',  subnet: '115.84',  rdns: '{ip}.laotelecom.com.la',          tz: 'Asia/Vientiane',                    country: 'Laos',              flag: '🇱🇦' },
    '966': { op: 'STC Saudi',          asn: 'AS25019',  subnet: '188.50',  rdns: '{ip}.stc.com.sa',                 tz: 'Asia/Riyadh',                       country: 'Arabia Saudita',    flag: '🇸🇦' },
    '971': { op: 'Etisalat UAE',       asn: 'AS5384',   subnet: '94.204',  rdns: '{ip}.etisalat.ae',                tz: 'Asia/Dubai',                        country: 'Emiratos Árabes',   flag: '🇦🇪' },
    '964': { op: 'Asiacell IQ',        asn: 'AS51684',  subnet: '37.236',  rdns: '{ip}.asiacell.com',               tz: 'Asia/Baghdad',                      country: 'Irak',              flag: '🇮🇶' },
    '98':  { op: 'Hamrahe Aval IR',    asn: 'AS44244',  subnet: '5.117',   rdns: '{ip}.mci.ir',                     tz: 'Asia/Tehran',                       country: 'Irán',              flag: '🇮🇷' },
    '972': { op: 'Partner IL',         asn: 'AS12400',  subnet: '46.116',  rdns: '{ip}.partner.net.il',             tz: 'Asia/Jerusalem',                    country: 'Israel',            flag: '🇮🇱' },
    '961': { op: 'Touch LB',           asn: 'AS39010',  subnet: '78.40',   rdns: '{ip}.touch.com.lb',               tz: 'Asia/Beirut',                       country: 'Líbano',            flag: '🇱🇧' },
    '962': { op: 'Zain JO',            asn: 'AS47589',  subnet: '188.247', rdns: '{ip}.zain.com',                   tz: 'Asia/Amman',                        country: 'Jordania',          flag: '🇯🇴' },
    '963': { op: 'Syriatel',           asn: 'AS29256',  subnet: '31.9',    rdns: '{ip}.syriatel.net',               tz: 'Asia/Damascus',                     country: 'Siria',             flag: '🇸🇾' },
    '968': { op: 'Omantel',            asn: 'AS8529',   subnet: '188.135', rdns: '{ip}.omantel.net.om',             tz: 'Asia/Muscat',                       country: 'Omán',              flag: '🇴🇲' },
    '974': { op: 'Ooredoo QA',         asn: 'AS8781',   subnet: '31.224',  rdns: '{ip}.ooredoo.qa',                 tz: 'Asia/Qatar',                        country: 'Qatar',             flag: '🇶🇦' },
    '965': { op: 'Zain KW',            asn: 'AS47589',  subnet: '37.39',   rdns: '{ip}.zain.com',                   tz: 'Asia/Kuwait',                       country: 'Kuwait',            flag: '🇰🇼' },
    '973': { op: 'Batelco BH',         asn: 'AS5416',   subnet: '188.109', rdns: '{ip}.batelco.com.bh',             tz: 'Asia/Bahrain',                      country: 'Baréin',            flag: '🇧🇭' },
    '967': { op: 'Yemen Mobile',       asn: 'AS30873',  subnet: '31.222',  rdns: '{ip}.yemen.net.ye',               tz: 'Asia/Aden',                         country: 'Yemen',             flag: '🇾🇪' },
    '93':  { op: 'Roshan AF',          asn: 'AS38731',  subnet: '37.111',  rdns: '{ip}.roshan.af',                  tz: 'Asia/Kabul',                        country: 'Afganistán',        flag: '🇦🇫' },
    '977': { op: 'Ncell NP',           asn: 'AS17501',  subnet: '103.69',  rdns: '{ip}.ncell.com.np',               tz: 'Asia/Kathmandu',                    country: 'Nepal',             flag: '🇳🇵' },
    '975': { op: 'TashiCell BT',       asn: 'AS38193',  subnet: '103.25',  rdns: '{ip}.tashicell.com',              tz: 'Asia/Thimphu',                      country: 'Bután',             flag: '🇧🇹' },
    // África
    '234': { op: 'MTN Nigeria',        asn: 'AS37282',  subnet: '197.210', rdns: '{ip}.mtn.com.ng',                 tz: 'Africa/Lagos',                      country: 'Nigeria',           flag: '🇳🇬' },
    '27':  { op: 'Vodacom ZA',         asn: 'AS36874',  subnet: '41.13',   rdns: '{ip}.vodacom.co.za',              tz: 'Africa/Johannesburg',               country: 'Sudáfrica',         flag: '🇿🇦' },
    '254': { op: 'Safaricom',          asn: 'AS33771',  subnet: '196.201', rdns: '{ip}.safaricom.net',              tz: 'Africa/Nairobi',                    country: 'Kenia',             flag: '🇰🇪' },
    '233': { op: 'MTN Ghana',          asn: 'AS29614',  subnet: '154.160', rdns: '{ip}.mtn.com.gh',                 tz: 'Africa/Accra',                      country: 'Ghana',             flag: '🇬🇭' },
    '20':  { op: 'Mobinil EG',         asn: 'AS24835',  subnet: '41.235',  rdns: '{ip}.mobinil.net',                tz: 'Africa/Cairo',                      country: 'Egipto',            flag: '🇪🇬' },
    '255': { op: 'Vodacom TZ',         asn: 'AS36874',  subnet: '41.188',  rdns: '{ip}.vodacom.co.tz',              tz: 'Africa/Dar_es_Salaam',              country: 'Tanzania',          flag: '🇹🇿' },
    '256': { op: 'MTN Uganda',         asn: 'AS20294',  subnet: '154.72',  rdns: '{ip}.mtn.co.ug',                  tz: 'Africa/Kampala',                    country: 'Uganda',            flag: '🇺🇬' },
    '251': { op: 'Ethio Telecom',      asn: 'AS24757',  subnet: '196.188', rdns: '{ip}.ethionet.et',                tz: 'Africa/Addis_Ababa',                country: 'Etiopía',           flag: '🇪🇹' },
    '212': { op: 'Maroc Telecom',      asn: 'AS36903',  subnet: '196.200', rdns: '{ip}.iam.net.ma',                 tz: 'Africa/Casablanca',                 country: 'Marruecos',         flag: '🇲🇦' },
    '216': { op: 'Ooredoo TN',         asn: 'AS37705',  subnet: '41.224',  rdns: '{ip}.ooredoo.tn',                 tz: 'Africa/Tunis',                      country: 'Túnez',             flag: '🇹🇳' },
    '213': { op: 'Djezzy DZ',          asn: 'AS36947',  subnet: '41.107',  rdns: '{ip}.djezzy.dz',                  tz: 'Africa/Algiers',                    country: 'Argelia',           flag: '🇩🇿' },
    '218': { op: 'Libyana LY',         asn: 'AS327697', subnet: '41.251',  rdns: '{ip}.libyana.ly',                 tz: 'Africa/Tripoli',                    country: 'Libia',             flag: '🇱🇾' },
    '221': { op: 'Orange SN',          asn: 'AS37197',  subnet: '41.82',   rdns: '{ip}.orange.sn',                  tz: 'Africa/Dakar',                      country: 'Senegal',           flag: '🇸🇳' },
    '225': { op: 'MTN CI',             asn: 'AS36916',  subnet: '41.138',  rdns: '{ip}.mtn.ci',                     tz: 'Africa/Abidjan',                    country: 'Costa de Marfil',   flag: '🇨🇮' },
    '237': { op: 'MTN CM',             asn: 'AS29975',  subnet: '154.68',  rdns: '{ip}.mtn.cm',                     tz: 'Africa/Douala',                     country: 'Camerún',           flag: '🇨🇲' },
    '243': { op: 'Vodacom CD',         asn: 'AS36874',  subnet: '41.243',  rdns: '{ip}.vodacom.cd',                 tz: 'Africa/Kinshasa',                   country: 'RD Congo',          flag: '🇨🇩' },
    '244': { op: 'Unitel AO',          asn: 'AS37514',  subnet: '196.46',  rdns: '{ip}.unitel.ao',                  tz: 'Africa/Luanda',                     country: 'Angola',            flag: '🇦🇴' },
    '260': { op: 'MTN Zambia',         asn: 'AS37342',  subnet: '196.32',  rdns: '{ip}.mtn.zm',                     tz: 'Africa/Lusaka',                     country: 'Zambia',            flag: '🇿🇲' },
    '263': { op: 'Econet ZW',          asn: 'AS30969',  subnet: '41.57',   rdns: '{ip}.econet.co.zw',               tz: 'Africa/Harare',                     country: 'Zimbabue',          flag: '🇿🇼' },
    // Oceanía
    '61':  { op: 'Telstra AU',         asn: 'AS1221',   subnet: '101.160', rdns: '{ip}.tpgi.com.au',                tz: 'Australia/Sydney',                  country: 'Australia',         flag: '🇦🇺' },
    '64':  { op: 'Spark NZ',           asn: 'AS4771',   subnet: '125.239', rdns: '{ip}.spark.co.nz',                tz: 'Pacific/Auckland',                  country: 'Nueva Zelanda',     flag: '🇳🇿' },
    '679': { op: 'Vodafone FJ',        asn: 'AS18096',  subnet: '202.137', rdns: '{ip}.vodafone.com.fj',            tz: 'Pacific/Fiji',                      country: 'Fiyi',              flag: '🇫🇯' },
    '675': { op: 'Digicel PG',         asn: 'AS38022',  subnet: '203.87',  rdns: '{ip}.digicel.com.pg',             tz: 'Pacific/Port_Moresby',              country: 'Papúa Nueva Guinea',flag: '🇵🇬' },
}

// ── Prefijos locales por operador (número sin código de país) ───
const OPERATOR_MAP = {
    // Colombia (cc: 57)
    '3001': { op: 'Claro Colombia',     asn: 'AS13489',  subnet: '181.49',  rdns: 'mobile-{ip}.claro.net.co'        },
    '3002': { op: 'Claro Colombia',     asn: 'AS13489',  subnet: '181.33',  rdns: 'mobile-{ip}.claro.net.co'        },
    '3003': { op: 'Claro Colombia',     asn: 'AS13489',  subnet: '181.50',  rdns: 'mobile-{ip}.claro.net.co'        },
    '3100': { op: 'Tigo Colombia',      asn: 'AS27831',  subnet: '190.24',  rdns: '{ip}.dynamic.tigo.com.co'        },
    '3101': { op: 'Tigo Colombia',      asn: 'AS27831',  subnet: '190.25',  rdns: '{ip}.dynamic.tigo.com.co'        },
    '3110': { op: 'Tigo Colombia',      asn: 'AS27831',  subnet: '190.26',  rdns: '{ip}.dynamic.tigo.com.co'        },
    '3200': { op: 'Movistar Colombia',  asn: 'AS27ora',  subnet: '190.85',  rdns: '{ip}.mobile.movistar.net.co'     },
    '3201': { op: 'Movistar Colombia',  asn: 'AS27ora',  subnet: '181.132', rdns: '{ip}.mobile.movistar.net.co'     },
    '3500': { op: 'WOM Colombia',       asn: 'AS262186', subnet: '190.248', rdns: 'user-{ip}.wom.co'                },
    '3380': { op: 'ETB Móvil',          asn: 'AS3816',   subnet: '200.118', rdns: '{ip}.etb.net.co'                 },
    // México (cc: 52)
    '1':    { op: 'Telcel',             asn: 'AS8151',   subnet: '187.141', rdns: '{ip}.mobile.telcel.com'          },
    '2':    { op: 'Telcel',             asn: 'AS8151',   subnet: '187.188', rdns: '{ip}.mobile.telcel.com'          },
    '3':    { op: 'AT&T México',        asn: 'AS18734',  subnet: '189.203', rdns: '{ip}.iusacell.net'               },
    '5':    { op: 'Movistar México',    asn: 'AS6503',   subnet: '189.216', rdns: '{ip}.movistar.net.mx'            },
    '8':    { op: 'Bait México',        asn: 'AS8151',   subnet: '187.188', rdns: '{ip}.bait.com.mx'                },
    // Venezuela (cc: 58)
    '4120': { op: 'Movistar Venezuela', asn: 'AS6306',   subnet: '190.202', rdns: '{ip}.movistar.net.ve'            },
    '4140': { op: 'Digitel',            asn: 'AS21826',  subnet: '186.168', rdns: 'dynamic-{ip}.digitel.com.ve'     },
    '4160': { op: 'Movilnet',           asn: 'AS27889',  subnet: '200.44',  rdns: '{ip}.movilnet.com.ve'            },
    // Perú (cc: 51)
    '9510': { op: 'Movistar Perú',      asn: 'AS6147',   subnet: '190.232', rdns: '{ip}.mobile.telefonica.net.pe'   },
    '9900': { op: 'Claro Perú',         asn: 'AS27843',  subnet: '181.65',  rdns: 'mobile-{ip}.claro.net.pe'        },
    '9760': { op: 'Entel Perú',         asn: 'AS61468',  subnet: '200.60',  rdns: '{ip}.entel.pe'                   },
    '9740': { op: 'Bitel',              asn: 'AS267613', subnet: '181.176', rdns: '{ip}.bitel.com.pe'               },
    // Argentina (cc: 54)
    '911':  { op: 'Personal',           asn: 'AS22927',  subnet: '181.10',  rdns: '{ip}.gprs.personal.com.ar'       },
    '9150': { op: 'Claro Argentina',    asn: 'AS27747',  subnet: '190.191', rdns: 'mobile-{ip}.claro.net.ar'        },
    '9160': { op: 'Movistar Argentina', asn: 'AS22084',  subnet: '200.49',  rdns: '{ip}.mobile.movistar.net.ar'     },
    // Chile (cc: 56)
    '9':    { op: 'Entel Chile',        asn: 'AS22047',  subnet: '190.98',  rdns: '{ip}.dynamic.entel.cl'           },
    '98':   { op: 'Movistar Chile',     asn: 'AS27651',  subnet: '181.43',  rdns: '{ip}.mobile.movistar.cl'         },
    '99':   { op: 'Claro Chile',        asn: 'AS27882',  subnet: '200.72',  rdns: 'mobile-{ip}.claro.cl'            },
    '97':   { op: 'WOM Chile',          asn: 'AS263702', subnet: '190.248', rdns: '{ip}.wom.cl'                     },
    // Brasil (cc: 55)
    '119':  { op: 'Vivo',               asn: 'AS26615',  subnet: '177.8',   rdns: '{ip}.dynamic.vivo.com.br'        },
    '118':  { op: 'Claro Brasil',       asn: 'AS28573',  subnet: '177.66',  rdns: 'mobile-{ip}.claro.com.br'        },
    '117':  { op: 'TIM Brasil',         asn: 'AS26599',  subnet: '187.0',   rdns: '{ip}.tim.com.br'                 },
    '116':  { op: 'Oi',                 asn: 'AS7738',   subnet: '200.147', rdns: '{ip}.oi.net.br'                  },
    // España (cc: 34)
    '6':    { op: 'Movistar España',    asn: 'AS3352',   subnet: '81.33',   rdns: '{ip}.mobile.movistar.net'        },
    '61':   { op: 'Vodafone España',    asn: 'AS12430',  subnet: '88.6',    rdns: '{ip}.dynamic.vodafone.es'        },
    '62':   { op: 'Orange España',      asn: 'AS12479',  subnet: '90.168',  rdns: '{ip}.orange.es'                  },
    '63':   { op: 'MásMóvil',           asn: 'AS57269',  subnet: '217.127', rdns: '{ip}.masmovil.es'                },
    // Reino Unido (cc: 44)
    '74':   { op: 'EE',                 asn: 'AS12576',  subnet: '86.3',    rdns: '{ip}.mobile.ee.co.uk'            },
    '75':   { op: 'O2 UK',              asn: 'AS13285',  subnet: '90.218',  rdns: '{ip}.o2mobile.co.uk'             },
    '77':   { op: 'Vodafone UK',        asn: 'AS1273',   subnet: '82.44',   rdns: '{ip}.dynamic.vodafone.co.uk'     },
    '78':   { op: 'Three UK',           asn: 'AS31655',  subnet: '109.145', rdns: '{ip}.three.co.uk'                },
    // Alemania (cc: 49)
    '151':  { op: 'Telekom DE',         asn: 'AS3320',   subnet: '80.187',  rdns: '{ip}.p80.pool.t-dialin.net'      },
    '152':  { op: 'Vodafone DE',        asn: 'AS3209',   subnet: '79.242',  rdns: '{ip}.dynamic.vodafone.de'        },
    '157':  { op: 'O2 DE',              asn: 'AS8422',   subnet: '84.190',  rdns: '{ip}.o2online.de'                },
    // Rusia (cc: 7)
    '900':  { op: 'MTS Russia',         asn: 'AS8359',   subnet: '178.140', rdns: '{ip}.dynamic.mts.ru'             },
    '901':  { op: 'Beeline RU',         asn: 'AS3216',   subnet: '109.252', rdns: '{ip}.static.vimpelcom.ru'        },
    '916':  { op: 'MegaFon',            asn: 'AS31133',  subnet: '94.25',   rdns: '{ip}.megafon.net'                },
    '999':  { op: 'Tele2 RU',           asn: 'AS1257',   subnet: '95.31',   rdns: '{ip}.tele2.ru'                   },
    // India (cc: 91)
    '70':   { op: 'Jio India',          asn: 'AS55836',  subnet: '49.36',   rdns: '{ip}.jio.com'                    },
    '80':   { op: 'Airtel India',       asn: 'AS24560',  subnet: '122.172', rdns: '{ip}.airtel.in'                  },
    '90':   { op: 'Vi India',           asn: 'AS55410',  subnet: '117.193', rdns: '{ip}.vodafone.in'                },
    '98':   { op: 'BSNL India',         asn: 'AS9829',   subnet: '117.97',  rdns: '{ip}.bsnl.in'                    },
    // Indonesia (cc: 62)
    '811':  { op: 'Telkomsel',          asn: 'AS23693',  subnet: '114.125', rdns: '{ip}.telkomsel.net.id'           },
    '851':  { op: 'Indosat',            asn: 'AS4761',   subnet: '110.136', rdns: '{ip}.indosatm2.com'              },
    '896':  { op: 'XL Axiata',          asn: 'AS24203',  subnet: '36.68',   rdns: '{ip}.xl.co.id'                   },
    // China (cc: 86)
    '130':  { op: 'China Mobile',       asn: 'AS9808',   subnet: '117.136', rdns: '{ip}.mobile.chinamobile.com'     },
    '153':  { op: 'China Unicom',       asn: 'AS4837',   subnet: '116.7',   rdns: '{ip}.unicom.cn'                  },
    '177':  { op: 'China Telecom',      asn: 'AS4134',   subnet: '113.88',  rdns: '{ip}.telecom.cn'                 },
    // Japón (cc: 81)
    '70':   { op: 'NTT Docomo',         asn: 'AS9605',   subnet: '111.107', rdns: '{ip}.spmode.ne.jp'               },
    '80':   { op: 'SoftBank JP',        asn: 'AS17676',  subnet: '126.65',  rdns: '{ip}.softbank.ne.jp'             },
    '90':   { op: 'au KDDI',            asn: 'AS2527',   subnet: '106.130', rdns: '{ip}.au-net.ne.jp'               },
    // Australia (cc: 61)
    '400':  { op: 'Telstra AU',         asn: 'AS1221',   subnet: '101.160', rdns: '{ip}.tpgi.com.au'                },
    '411':  { op: 'Optus AU',           asn: 'AS4804',   subnet: '49.183',  rdns: '{ip}.optusnet.com.au'            },
    '420':  { op: 'Vodafone AU',        asn: 'AS38804',  subnet: '101.161', rdns: '{ip}.vodafone.net.au'            },
}

const FAKE_MESSAGES = [
    ['❤️ te extraño mucho bb', 'cuando nos vemos?', 'jajaja eres un loco'],
    ['bro pasame la tarea', 'ya vi el partido, fue una locura', 'oye llámame cuando puedas'],
    ['ya llegué a casa', 'qué vas a hacer hoy?', 'me mandas el رقم de juan?'],
    ['happy birthday!! 🎂', 'ven a la fiesta el sábado', 'oye vi tu historia jajaj'],
    ['no te creo nada', 'en serio te lo juro', 'bueno ya te cuento después'],
]

// ─── Helpers ─────────────────────────────────────────────────────
function ri(n) { return Math.floor(Math.random() * n) }
function pick(arr) { return arr[ri(arr.length)] }
function pad(n) { return String(n).padStart(2, '0') }

function getRealTime(tz) {
    try {
        return new Date().toLocaleString('en-GB', {
            timeZone: tz,
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false
        }) + ` (${tz.split('/').pop().replace(/_/g, ' ')})`
    } catch {
        return `${pad(new Date().getUTCHours())}:${pad(new Date().getUTCMinutes())}:${pad(new Date().getUTCSeconds())} (UTC)`
    }
}

function generateIP(subnet) {
    const parts = subnet.split('.')
    while (parts.length < 4) parts.push(String(ri(253) + 1))
    parts[parts.length - 1] = String(ri(253) + 1)
    return parts.join('.')
}

function generateRdns(template, ip) {
    return template.replace('{ip}', ip.replace(/\./g, '-'))
}

function generateMAC() {
    const first = (ri(127) * 2).toString(16).padStart(2, '0').toUpperCase()
    const rest = [...Array(5)].map(() => ri(256).toString(16).padStart(2, '0').toUpperCase())
    return [first, ...rest].join(':')
}

// ─── Detección correcta: país primero, luego operador ────────────
function detectNetwork(phone) {
    // Paso 1: detectar código de país (3 → 2 → 1 dígito)
    let countryCode = null
    let countryData = null
    for (const len of [3, 2, 1]) {
        const cc = phone.slice(0, len)
        if (COUNTRY_FALLBACK[cc]) {
            countryCode = cc
            countryData = COUNTRY_FALLBACK[cc]
            break
        }
    }

    if (!countryCode) return {
        op: 'Unknown ISP', asn: 'AS0000', subnet: '192.168.1',
        rdns: '{ip}.unknown.net', tz: 'UTC',
        country: 'Desconocido', flag: '🌐'
    }

    // Paso 2: buscar operador por prefijo local (4 → 1 dígito)
    const local = phone.slice(countryCode.length)
    for (const len of [4, 3, 2, 1]) {
        const prefix = local.slice(0, len)
        if (OPERATOR_MAP[prefix]) {
            // Combina datos del país con datos del operador
            return { ...countryData, ...OPERATOR_MAP[prefix] }
        }
    }

    // Paso 3: país detectado pero operador desconocido → usar fallback del país
    return countryData
}

// ─── Handler ─────────────────────────────────────────────────────
let handler = async (m, { conn }) => {
    await m.react('⌛')

    const target    = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : m.sender)
    const shortName = '@' + target.split('@')[0]
    const phone     = target.split('@')[0]

    const net      = detectNetwork(phone)
    const fakeIP   = generateIP(net.subnet)
    const rdns     = generateRdns(net.rdns, fakeIP)
    const fakeMAC  = generateMAC()
    const realTime = getRealTime(net.tz)
    const msgs     = pick(FAKE_MESSAGES)

    const { key } = await conn.sendMessage(m.chat, { text: '⏳ Iniciando proceso...' }, { quoted: m })

    const steps = [
        `💻 بدء الاختراق ضد ${shortName}...`,
        `📡 الرقم المكتشف: +${phone}`,
        `${net.flag} الدولة: ${net.country}`,
        `📶 Operador: ${net.op}`,
        `🔌 ASN: ${net.asn}`,
        `🌐 Resolviendo IP en subred ${net.subnet}.0/16...`,
        `🔍 Escaneando puertos en ${fakeIP}...`,
        `🔐 Credenciales comprometidas...`,
        `💬 Interceptando رسايل recientes...`,
        `📤 Extrayendo datos...`,
        `🧹 Limpiando rastros...`,
        `✅ Acceso total obtenido`
    ]

    for (let i = 0; i < steps.length; i++) {
        const progress = Math.floor(((i + 1) / steps.length) * 100)
        const filled   = Math.floor(progress / 10)
        const bar      = '▰'.repeat(filled) + '▱'.repeat(10 - filled)
        await conn.sendMessage(m.chat, {
            text: `${steps[i]}\n\n[${bar}] ${progress}%`,
            edit: key
        })
        await new Promise(r => setTimeout(r, 900 + ri(600)))
    }

    const final =
        `☠️ *HACK COMPLETADO — REPORTE FINAL*\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `👤 *Objetivo:* ${shortName}\n` +
        `📱 *الرقم:* +${phone}\n\n` +
        `🌍 *UBICACIÓN*\n` +
        `• الدولة: ${net.country} ${net.flag}\n` +
        `• Zona horaria: ${net.tz}\n\n` +
        `🌐 *RED*\n` +
        `• Operador: ${net.op}\n` +
        `• نوع الخط: mobile\n` +
        `• ASN: ${net.asn}\n` +
        `• الـ IP العام: ${fakeIP}\n` +
        `• Hostname: ${rdns}\n` +
        `• MAC: ${fakeMAC}\n\n` +
        `🔑 *آخر نشاط*\n` +
        `• التوقيت المحلي للهدف: ${realTime}\n\n` +
        `💬 *MENSAJES INTERCEPTADOS*\n` +
        msgs.map((msg, i) => `• [${i + 1}] "${msg}"`).join('\n') + '\n\n' +
        `━━━━━━━━━━━━━━━━━━\n` +
        `_البيانات اتستخرجت واتخزنت بنجاح._`

    await conn.sendMessage(m.chat, { text: final, edit: key })
    await m.react('💀')
}

handler.help = ['hack @user']
handler.tags = ['fun']
handler.command = ['hack']
export default handler
