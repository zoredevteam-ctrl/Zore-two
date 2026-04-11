// ╔══════════════════════════════════════════════════════════════╗
// ║              ECONOMY SYSTEM — ZERO TWO                      ║
// ║         Sistema completo con troll mode 💗                  ║
// ║                  power by ZoreDevTeam                       ║
// ╚══════════════════════════════════════════════════════════════╝

import { database } from '../lib/database.js'

// ══════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════

const fmt  = n => Number(n || 0).toLocaleString('es-CO')
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const now  = () => Date.now()

// Frases troll por situación
const TROLLS = {
    broke: [
        '🥲 Más pelado que rodilla de niño.',
        '💸 Tus Stamps están en modo fantasma.',
        '😭 Ni pa\' un chicle alcanzas.',
        '🪙 Eso no es saldo, eso es decoración.',
        '💀 Literalmente en quiebra. Impresionante.',
    ],
    rico: [
        '🤑 Míralo, creyéndose Elon Musk del WhatsApp.',
        '👑 Con esa plata ni te saluda en persona.',
        '💰 Tiene más stamps que neuronas activas.',
        '🏦 Alguien llame al banco, esto es un atraco.',
        '😤 Oséase que sí hay plata, solo que no era pa\' ti.',
    ],
    trabajo: [
        '💼 Aquí trabajando como si el bot te pagara seguro.',
        '🏭 Dale duro que esto no se va a pagar solo.',
        '😤 Ya trabajando otra vez... qué disciplina tan sospechosa.',
        '🤡 Trabajando en WhatsApp. Esto es el futuro.',
        '⚒️ De noche trabajas y de día pides plata prestada. Clásico.',
    ],
    robo: [
        '🦹 Salió el criminal del WhatsApp.',
        '🤣 Ladrón de Stamps. Definitivamente esto no lo esperaba la víctima.',
        '🔫 Manos arriba, esto es un atraco virtual.',
        '😂 Robar en WhatsApp. La evolución del crimen.',
        '🎭 Picasso no te enseñó esto pero aquí estás.',
    ],
    apuesta: [
        '🎰 Puso todo y apostó con la fe de un youtuber de criptos.',
        '🃏 El casino siempre gana... menos cuando ganas tú.',
        '🎲 Apostando Stamps que ni tiene. Esto es arte.',
        '🤯 Las apuestas: donde los Stamps van a morir.',
        '🎪 Bienvenido al circo. Tú eres el payaso principal.',
    ],
    transfer: [
        '💌 Donando plata ajena como ONG del WhatsApp.',
        '🤲 Tan generoso... ¿o tan tonto?',
        '📤 Enviando Stamps. Esperemos que no te arrepientas.',
        '😂 Dale tu plata a otro, que igual no sabías qué hacer con ella.',
        '🏧 Cajero automático humano. Muy bien.',
    ],
    daily: [
        '🌅 Reclamando su limosna diaria. Dignísimo.',
        '📅 Apareció exactamente a tiempo. Sospechoso.',
        '🗓️ El único compromiso que cumple en su vida.',
        '⏰ Más puntual que el dentista cuando cobra.',
        '🐓 El gallo no canta pero tú ya estás reclamando.',
    ],
    mina: [
        '⛏️ Minando Stamps en lugar de estudiar. Bello.',
        '🪨 Golpeando piedras virtuales por monedas virtuales.',
        '😮‍💨 Ya sudando por Stamps. Esto es el metaverso.',
        '🏔️ Minero de WhatsApp. El futuro que nadie pidió.',
        '💎 Ojalá la dedicación en la mina la tuvieras en la vida real.',
    ],
    pesca: [
        '🎣 A pescar... porque trabajar era muy difícil.',
        '🐟 Ojalá pesque algo, porque en la vida real no ha pescado nada.',
        '🌊 Tirando el anzuelo en el mar digital. Filosófico.',
        '🦈 Cuidado con los tiburones... de Stamps.',
        '🐠 Hasta el pez tiene más dirección que tú.',
    ],
    ruleta: [
        '🎡 Giró la ruleta con la confianza de alguien que no tiene nada que perder.',
        '🔴 Rojo o negro. Como tu situación económica.',
        '🎯 La ruleta gira, el corazón late, el saldo llora.',
        '🃏 Apostando al azar porque la lógica ya no le sirve.',
        '🎠 Un giro más y quizás ya no tiene ni pa\' el bus.',
    ],
    limosna: [
        '🙏 Pidiendo limosna en WhatsApp. Nuevo low.',
        '😢 Tan roto que hasta al bot le pide.',
        '🪣 Con un balde de necesidad y media cucharada de dignidad.',
        '💔 Si esto no te motiva a trabajar, nada lo hará.',
        '🫙 El frasco de la vergüenza está lleno.',
    ]
}

const troll = (key) => TROLLS[key][rand(0, TROLLS[key].length - 1)]

// ══════════════════════════════════════════
//  INICIALIZAR USUARIO
// ══════════════════════════════════════════

function getEco(jid) {
    if (!database.data.users) database.data.users = {}
    if (!database.data.users[jid]) database.data.users[jid] = {}
    const u = database.data.users[jid]
    if (!u.eco) u.eco = {
        stamps:      500,       // moneda principal
        bank:        0,         // en el banco
        lastDaily:   0,
        lastWork:    0,
        lastMine:    0,
        lastFish:    0,
        lastCrime:   0,
        lastBeg:     0,
        lastSlots:   0,
        lastRoulette:0,
        lastRob:     0,
        streak:      0,         // racha diaria
        totalEarned: 0,
        totalLost:   0,
        job:         null,      // trabajo asignado
        inventory:   [],
        loans:       0,
        robberies:   0,
        wins:        0,
        losses:      0,
    }
    return u.eco
}

const save = () => database.save()

const cooldownLeft = (last, ms) => {
    const left = ms - (now() - last)
    if (left <= 0) return null
    const h = Math.floor(left / 3600000)
    const m = Math.floor((left % 3600000) / 60000)
    const s = Math.floor((left % 60000) / 1000)
    return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`
}

// ══════════════════════════════════════════
//  TRABAJOS disponibles
// ══════════════════════════════════════════

const JOBS = [
    { name: 'Influencer', emoji: '📱', min: 80,  max: 200 },
    { name: 'Cocinero',   emoji: '👨‍🍳', min: 100, max: 250 },
    { name: 'Médico',     emoji: '🩺', min: 150, max: 400 },
    { name: 'Streamer',   emoji: '🎮', min: 50,  max: 500 },
    { name: 'Músico',     emoji: '🎵', min: 60,  max: 350 },
    { name: 'Mecánico',   emoji: '🔧', min: 120, max: 300 },
    { name: 'Abogado',    emoji: '⚖️', min: 200, max: 500 },
    { name: 'Youtuber',   emoji: '🎬', min: 10,  max: 600 },
    { name: 'Repartidor', emoji: '🛵', min: 70,  max: 180 },
    { name: 'Hacker',     emoji: '💻', min: 90,  max: 450 },
]

const WORK_MSGS = [
    (job, earned) => `Trabajaste como ${job.emoji} ${job.name} y ganaste *${fmt(earned)} Stamps*. El jefe casi te despide pero aquí estás.`,
    (job, earned) => `Hiciste tu turno de ${job.emoji} ${job.name}. Te pagaron *${fmt(earned)} Stamps* y encima te felicitaron. Raro.`,
    (job, earned) => `Como ${job.emoji} ${job.name} hoy la pegaste. *${fmt(earned)} Stamps* en el bolsillo. Gástalo bien (no lo harás).`,
    (job, earned) => `El ${job.emoji} ${job.name} rindió hoy. *${fmt(earned)} Stamps*. Disfrútalos antes de apostártelos.`,
    (job, earned) => `Otro día sobreviviendo como ${job.emoji} ${job.name}. *${fmt(earned)} Stamps* pa\' las deudas.`,
]

// ══════════════════════════════════════════
//  TIENDA
// ══════════════════════════════════════════

const SHOP = [
    { id: 'escudo',   name: '🛡️ Escudo Anti-Robo', price: 2000,  desc: 'Protege del próximo robo' },
    { id: 'amuleto',  name: '🍀 Amuleto de Suerte',  price: 1500,  desc: '+20% en apuestas por 1h' },
    { id: 'palanca',  name: '⛏️ Pico Mejorado',      price: 3000,  desc: '+50% en minería' },
    { id: 'cana',     name: '🎣 Caña Pro',            price: 2500,  desc: '+50% en pesca' },
    { id: 'mascara',  name: '🎭 Máscara Ladrón',      price: 4000,  desc: '+30% éxito en robos' },
    { id: 'vip',      name: '💎 Pase VIP',            price: 10000, desc: 'Cooldowns -50% por 24h' },
]

// ══════════════════════════════════════════
//  PLUGIN PRINCIPAL
// ══════════════════════════════════════════

const plugin = async (m, { conn, args, prefix }) => {
    const cmd  = plugin._matchedCommand || ''
    const eco  = getEco(m.sender)
    const db   = database.data
    const name = m.pushName || 'Darling'

    // Helper de respuesta con rcanal
    const reply = async (text) => {
        await global.sendWithCtx(conn, m.chat, { text }, db, { quoted: m })
    }

    // ══════════════════════════════════════
    //  💰 BALANCE / PERFIL
    // ══════════════════════════════════════
    if (['balance', 'bal', 'saldo', 'perfil', 'wallet'].includes(cmd)) {
        const total = eco.stamps + eco.bank
        const estado = total < 500 ? troll('broke') : total > 20000 ? troll('rico') : '📊 Situación económica... existente.'

        return reply(
`╭────────────────────────────╮
│  💗 *ECONOMÍA DE ${name.toUpperCase()}*  │
╰────────────────────────────╯

💵 *Efectivo:*  ${fmt(eco.stamps)} Stamps
🏦 *Banco:*     ${fmt(eco.bank)} Stamps
💰 *Total:*     ${fmt(total)} Stamps

📈 *Ganado total:* ${fmt(eco.totalEarned)}
📉 *Perdido total:* ${fmt(eco.totalLost)}
🎰 *Victorias:* ${eco.wins} | *Derrotas:* ${eco.losses}
🔥 *Racha diaria:* ${eco.streak} días
💼 *Trabajo:* ${eco.job ? `${eco.job.emoji} ${eco.job.name}` : 'Desempleado 😐'}

${estado}

> ${global.dev}`)
    }

    // ══════════════════════════════════════
    //  📅 DAILY — Recompensa diaria
    // ══════════════════════════════════════
    if (['daily', 'diario', 'claim'].includes(cmd)) {
        const cd = cooldownLeft(eco.lastDaily, 86400000) // 24h
        if (cd) return reply(`⏳ Ya reclamaste hoy, *${name}*.\nVuelve en: *${cd}*\n\n_¿Tanto apuro? Relax._`)

        // Racha
        const lastWas = now() - eco.lastDaily
        if (lastWas < 172800000) eco.streak += 1 // menos de 48h → racha
        else eco.streak = 1

        const base   = rand(200, 600)
        const bonus  = Math.floor(base * (eco.streak > 1 ? Math.min(eco.streak * 0.1, 1) : 0))
        const earned = base + bonus

        eco.stamps    += earned
        eco.totalEarned += earned
        eco.lastDaily  = now()
        await save()

        return reply(
`╭────────────────────────╮
│  📅 *RECOMPENSA DIARIA*   │
╰────────────────────────╯

${troll('daily')}

💵 Base: *+${fmt(base)} Stamps*
${bonus > 0 ? `🔥 Bonus racha (x${eco.streak}): *+${fmt(bonus)} Stamps*` : `🔥 Racha: *${eco.streak} día*`}

✅ *Total recibido: ${fmt(earned)} Stamps*
💰 Saldo actual: ${fmt(eco.stamps)} Stamps

> ${global.dev}`)
    }

    // ══════════════════════════════════════
    //  💼 WORK — Trabajar
    // ══════════════════════════════════════
    if (['work', 'trabajar', 'trabajar', 'laburo'].includes(cmd)) {
        const cd = cooldownLeft(eco.lastWork, 3600000) // 1h
        if (cd) return reply(`⏳ Ya trabajaste hace poco, *${name}*.\nDescansa un momento: *${cd}*\n\n_El trabajo dignifica... pero no tanto._`)

        if (!eco.job) eco.job = JOBS[rand(0, JOBS.length - 1)]

        const pico    = eco.inventory.includes('palanca')
        const earned  = rand(eco.job.min, eco.job.max) * (pico ? 1.5 : 1) | 0
        eco.stamps   += earned
        eco.totalEarned += earned
        eco.lastWork  = now()
        await save()

        const msg = WORK_MSGS[rand(0, WORK_MSGS.length - 1)](eco.job, earned)

        return reply(
`╭────────────────────────╮
│      💼 *TRABAJO*         │
╰────────────────────────╯

${msg}

💰 Saldo actual: *${fmt(eco.stamps)} Stamps*
${troll('trabajo')}

> ${global.dev}`)
    }

    // ══════════════════════════════════════
    //  ⛏️ MINAR
    // ══════════════════════════════════════
    if (['minar', 'mine', 'mineria'].includes(cmd)) {
        const cd = cooldownLeft(eco.lastMine, 7200000) // 2h
        if (cd) return reply(`⏳ La mina está cerrada, *${name}*.\nVuelve en: *${cd}*\n\n_Dale un descanso a esa espalda virtual._`)

        const pico   = eco.inventory.includes('palanca')
        const base   = rand(100, 400)
        const earned = pico ? Math.floor(base * 1.5) : base

        // Evento aleatorio
        const eventos = [
            { prob: 0.1, txt: '💎 ¡DIAMANTE! Triplicaste lo minado.', mult: 3 },
            { prob: 0.2, txt: '🥇 ¡ORO! Doble de ganancias.', mult: 2 },
            { prob: 0.3, txt: '🪨 Mineral normal. Sin sorpresas.', mult: 1 },
            { prob: 0.2, txt: '💥 Explosión menor. Ganaste menos.', mult: 0.5 },
            { prob: 0.2, txt: '🕳️ Derrumbe. Saliste a tiempo pero con poco.', mult: 0.3 },
        ]
        let r = Math.random(), acc = 0, ev = eventos[2]
        for (const e of eventos) { acc += e.prob; if (r < acc) { ev = e; break } }

        const total = Math.floor(earned * ev.mult)
        eco.stamps += total
        eco.totalEarned += total
        eco.lastMine = now()
        await save()

        return reply(
`╭────────────────────────╮
│       ⛏️ *MINERÍA*        │
╰────────────────────────╯

${troll('mina')}
${ev.txt}

💵 Ganaste: *+${fmt(total)} Stamps*
${pico ? '⛏️ (Pico mejorado aplicado)' : ''}
💰 Saldo: *${fmt(eco.stamps)} Stamps*

> ${global.dev}`)
    }

    // ══════════════════════════════════════
    //  🎣 PESCAR
    // ══════════════════════════════════════
    if (['pescar', 'fish', 'pesca'].includes(cmd)) {
        const cd = cooldownLeft(eco.lastFish, 5400000) // 1.5h
        if (cd) return reply(`⏳ El mar está cerrado, *${name}*.\nVuelve en: *${cd}*\n\n_Hasta el mar te rechaza._`)

        const cana = eco.inventory.includes('cana')

        const peces = [
            { name: '🦐 Camarón',  val: rand(50, 100),   prob: 0.30 },
            { name: '🐟 Sardina',  val: rand(80, 200),   prob: 0.25 },
            { name: '🐠 Pez Trop', val: rand(150, 350),  prob: 0.20 },
            { name: '🐡 Pez Globo',val: rand(200, 500),  prob: 0.12 },
            { name: '🦈 Tiburón',  val: rand(500, 1200), prob: 0.07 },
            { name: '💀 Bota Vieja',val: -rand(20, 80),  prob: 0.04 },
            { name: '💎 Tesoro',   val: rand(1000, 3000),prob: 0.02 },
        ]

        let r = Math.random(), acc = 0, pez = peces[0]
        for (const p of peces) { acc += p.prob; if (r < acc) { pez = p; break } }

        const val = cana ? Math.floor(pez.val * 1.5) : pez.val
        eco.stamps += val
        eco.totalEarned += Math.max(val, 0)
        eco.totalLost   += Math.max(-val, 0)
        eco.lastFish = now()
        await save()

        return reply(
`╭────────────────────────╮
│        🎣 *PESCA*         │
╰────────────────────────╯

${troll('pesca')}

Pescaste: *${pez.name}*
${val >= 0 ? `💵 Ganaste: *+${fmt(val)} Stamps*` : `💸 Perdiste: *${fmt(Math.abs(val))} Stamps* (te cobró la bota)`}
${cana ? '🎣 (Caña Pro aplicada)' : ''}
💰 Saldo: *${fmt(eco.stamps)} Stamps*

> ${global.dev}`)
    }

    // ══════════════════════════════════════
    //  🦹 CRIMEN
    // ══════════════════════════════════════
    if (['crimen', 'crime', 'robar', 'delinquir'].includes(cmd)) {
        const cd = cooldownLeft(eco.lastCrime, 14400000) // 4h
        if (cd) return reply(`⏳ La policía te está buscando, *${name}*.\nEspera: *${cd}*\n\n_Quédate quieto, criminal._`)

        const mascara = eco.inventory.includes('mascara')
        const exitRate = mascara ? 0.65 : 0.50

        const crimenes = [
            '🏪 Robaste una tienda de barrio',
            '🚗 Robaste un carro pero no sabías manejarlo',
            '💻 Hackeaste una cuenta de Netflix',
            '🏧 Intentaste hackear un cajero con un tutorial de YouTube',
            '📦 Robaste un paquete de Amazon ajeno',
            '🏦 Planeaste robar un banco... pero era viernes',
            '🐔 Robaste gallinas en el pueblo',
            '🛵 Robaste una moto eléctrica que se descargó a los 2 km',
        ]

        const crimen = crimenes[rand(0, crimenes.length - 1)]
        const exito  = Math.random() < exitRate

        if (exito) {
            const earned = rand(200, 1500)
            eco.stamps  += earned
            eco.totalEarned += earned
            eco.robberies++
            eco.lastCrime = now()
            await save()
            return reply(
`╭────────────────────────╮
│      🦹 *CRIMEN*          │
╰────────────────────────╯

${troll('robo')}
✅ *¡ÉXITO!* ${crimen}

💵 Botín: *+${fmt(earned)} Stamps*
${mascara ? '🎭 (Máscara ladrón aplicada)' : ''}
💰 Saldo: *${fmt(eco.stamps)} Stamps*
🦹 Robos exitosos: ${eco.robberies}

> ${global.dev}`)
        } else {
            const multa = rand(100, 600)
            eco.stamps  = Math.max(0, eco.stamps - multa)
            eco.totalLost += multa
            eco.lastCrime  = now()
            await save()
            return reply(
`╭────────────────────────╮
│      🚔 *ATRAPADO*        │
╰────────────────────────╯

😂 *¡TE AGARRARON!* ${crimen}... y te vieron la cara.

💸 Multa: *-${fmt(multa)} Stamps*
💰 Saldo: *${fmt(eco.stamps)} Stamps*

_Próxima vez no cometas crímenes en WhatsApp._

> ${global.dev}`)
        }
    }

    // ══════════════════════════════════════
    //  🙏 LIMOSNA / BEG
    // ══════════════════════════════════════
    if (['limosna', 'beg', 'pedir'].includes(cmd)) {
        const cd = cooldownLeft(eco.lastBeg, 10800000) // 3h
        if (cd) return reply(`⏳ Ya pediste hace poco, *${name}*.\nEspera: *${cd}*\n\n_Hasta la limosna tiene límite._`)

        const exito  = Math.random() < 0.6
        eco.lastBeg  = now()

        if (exito) {
            const earned = rand(10, 100)
            eco.stamps  += earned
            eco.totalEarned += earned
            await save()
            return reply(
`╭────────────────────────╮
│      🙏 *LIMOSNA*         │
╰────────────────────────╯

${troll('limosna')}

✅ Alguien se apiadó de ti.
💵 Recibiste: *+${fmt(earned)} Stamps*
💰 Saldo: *${fmt(eco.stamps)} Stamps*

_No es mucho, pero es trabajo honesto._

> ${global.dev}`)
        } else {
            return reply(
`╭────────────────────────╮
│      🙏 *LIMOSNA*         │
╰────────────────────────╯

😂 Nadie te dio nada. Ignorado completamente.

💰 Saldo sin cambios: *${fmt(eco.stamps)} Stamps*
${troll('limosna')}

> ${global.dev}`)
        }
    }

    // ══════════════════════════════════════
    //  🎰 SLOTS
    // ══════════════════════════════════════
    if (['slots', 'tragamonedas', 'slot'].includes(cmd)) {
        const cd = cooldownLeft(eco.lastSlots, 1800000) // 30min
        if (cd) return reply(`⏳ Las máquinas están en mantenimiento, *${name}*.\nVuelve en: *${cd}*`)

        const apuesta = parseInt(args[0]) || 100
        if (apuesta < 50)  return reply('❌ Apuesta mínima: *50 Stamps*')
        if (apuesta > eco.stamps) return reply(`❌ No tienes suficiente. Tienes *${fmt(eco.stamps)} Stamps*.\n${troll('broke')}`)

        const simbolos = ['💗','⭐','🍒','🎵','🎰','💎','🌸','🔥']
        const s1 = simbolos[rand(0, simbolos.length - 1)]
        const s2 = simbolos[rand(0, simbolos.length - 1)]
        const s3 = simbolos[rand(0, simbolos.length - 1)]

        let mult = 0, resultado = ''

        if (s1 === s2 && s2 === s3) {
            if (s1 === '💎') { mult = 10; resultado = '💎 *JACKPOT DIAMANTE* — x10 !!!' }
            else if (s1 === '🌸') { mult = 7; resultado = '🌸 *JACKPOT ZERO TWO* — x7 !!!' }
            else { mult = 5; resultado = `${s1} *TRIPLE* — x5 !!!` }
        } else if (s1 === s2 || s2 === s3 || s1 === s3) {
            mult = 1.5; resultado = '✨ *PAR* — x1.5'
        } else {
            mult = 0; resultado = '💀 *NADA* — Perdiste todo'
        }

        const ganancia = Math.floor(apuesta * mult)
        eco.stamps    -= apuesta
        eco.stamps    += ganancia
        eco.totalEarned += ganancia
        eco.totalLost   += apuesta
        eco.lastSlots    = now()

        if (mult > 0) eco.wins++; else eco.losses++

        await save()

        return reply(
`╭────────────────────────╮
│       🎰 *SLOTS*          │
╰────────────────────────╯

${troll('apuesta')}

┌─────────────────┐
│  ${s1}  ${s2}  ${s3}  │
└─────────────────┘

${resultado}
💵 Apostaste: *${fmt(apuesta)} Stamps*
${ganancia > 0 ? `🏆 Ganaste: *+${fmt(ganancia)} Stamps*` : `💸 Perdiste: *-${fmt(apuesta)} Stamps*`}
💰 Saldo: *${fmt(eco.stamps)} Stamps*

> ${global.dev}`)
    }

    // ══════════════════════════════════════
    //  🎡 RULETA
    // ══