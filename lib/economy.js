// ╔══════════════════════════════════════════════════════════════╗
// ║              ECONOMY SYSTEM — ZERO TWO                      ║
// ║         Sistema completo con troll mode 💗                  ║
// ║                  power by ZoreDevTeam                       ║
// ╚══════════════════════════════════════════════════════════════╝

import { database } from './lib/database.js'

// ══════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════

const fmt  = n => Number(n || 0).toLocaleString('es-CO')
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const ms   = () => Date.now()

function cdLeft(last, total) {
    const left = total - (ms() - last)
    if (left <= 0) return null
    const h = Math.floor(left / 3600000)
    const m = Math.floor((left % 3600000) / 60000)
    const s = Math.floor((left % 60000) / 1000)
    return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`
}

// ══════════════════════════════════════════
//  FRASES TROLL
// ══════════════════════════════════════════

const T = {
    broke:    ['🥲 Más pelado que rodilla de niño.','💸 Tus Stamps están en modo fantasma.','😭 Ni pa\' un chicle alcanzas.','💀 Literalmente en quiebra. Impresionante.','🪙 Eso no es saldo, eso es decoración.'],
    rico:     ['🤑 Míralo, creyéndose Elon Musk del WhatsApp.','👑 Con esa plata ni te saluda en persona.','💰 Más stamps que neuronas activas.','😤 Sí había plata, solo que no era pa\' ti.'],
    trabajo:  ['💼 Trabajando como si el bot te pagara seguro.','🤡 Trabajando en WhatsApp. Esto es el futuro.','⚒️ De noche trabajas y de día pides prestado. Clásico.','😤 Qué disciplina tan sospechosa.'],
    robo:     ['🦹 Salió el criminal del WhatsApp.','😂 Robar en WhatsApp. La evolución del crimen.','🎭 Picasso no te enseñó esto pero aquí estás.','🔫 Manos arriba, esto es un atraco virtual.'],
    apuesta:  ['🎰 Apostó con la fe de un youtuber de criptos.','🃏 El casino siempre gana... menos cuando ganas tú.','🎪 Bienvenido al circo. Tú eres el payaso principal.','🤯 Las apuestas: donde los Stamps van a morir.'],
    transfer: ['🤲 Tan generoso... ¿o tan tonto?','🏧 Cajero automático humano. Muy bien.','😂 Dale tu plata a otro, que igual no sabías qué hacer.'],
    daily:    ['🌅 Reclamando su limosna diaria. Dignísimo.','🗓️ El único compromiso que cumple en su vida.','⏰ Más puntual que el dentista cuando cobra.','🐓 El gallo no canta pero tú ya estás reclamando.'],
    mina:     ['⛏️ Minando Stamps en lugar de estudiar. Bello.','🏔️ Minero de WhatsApp. El futuro que nadie pidió.','💎 Ojalá esta dedicación la tuvieras en la vida real.'],
    pesca:    ['🎣 A pescar... porque trabajar era muy difícil.','🌊 Tirando el anzuelo en el mar digital. Filosófico.','🐟 Ojalá pesque algo, porque en la vida real no ha pescado nada.'],
    ruleta:   ['🎡 Giró con la confianza de quien no tiene nada que perder.','🔴 Rojo o negro. Como tu situación económica.','🎠 Un giro más y quizás ya no tiene ni pa\' el bus.'],
    limosna:  ['🙏 Pidiendo limosna en WhatsApp. Nuevo low.','💔 Si esto no te motiva a trabajar, nada lo hará.','🫙 El frasco de la vergüenza está lleno.','😢 Tan roto que hasta al bot le pide.'],
}
const troll = k => T[k][rand(0, T[k].length - 1)]

// ══════════════════════════════════════════
//  BASE DE DATOS
// ══════════════════════════════════════════

function getEco(jid) {
    if (!database.data.users)      database.data.users = {}
    if (!database.data.users[jid]) database.data.users[jid] = {}
    const u = database.data.users[jid]
    if (!u.eco) u.eco = {
        stamps: 500, bank: 0,
        lastDaily: 0, lastWork: 0, lastMine: 0, lastFish: 0,
        lastCrime: 0, lastBeg: 0, lastSlots: 0, lastRoulette: 0, lastRob: 0,
        streak: 0, totalEarned: 0, totalLost: 0,
        job: null, inventory: [], robberies: 0, wins: 0, losses: 0,
    }
    return u.eco
}

const save = () => database.save()

// ══════════════════════════════════════════
//  TRABAJOS & TIENDA
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

const WORK_PHRASES = [
    (j, e) => `Trabajaste como ${j.emoji} ${j.name} y ganaste *${fmt(e)} Stamps*. El jefe casi te despide pero aquí estás.`,
    (j, e) => `Hiciste tu turno de ${j.emoji} ${j.name}. Te pagaron *${fmt(e)} Stamps* y encima te felicitaron. Raro.`,
    (j, e) => `Como ${j.emoji} ${j.name} hoy la pegaste. *${fmt(e)} Stamps*. Gástalo bien (no lo harás).`,
    (j, e) => `El ${j.emoji} ${j.name} rindió hoy. *${fmt(e)} Stamps*. Disfrútalos antes de apostártelos.`,
    (j, e) => `Otro día sobreviviendo como ${j.emoji} ${j.name}. *${fmt(e)} Stamps* pa las deudas.`,
]

const SHOP = [
    { id: 'escudo',  name: '🛡️ Escudo Anti-Robo', price: 2000,  desc: 'Bloquea el próximo robo que recibas'  },
    { id: 'amuleto', name: '🍀 Amuleto de Suerte',  price: 1500,  desc: '+20% ganancias en apuestas'           },
    { id: 'palanca', name: '⛏️ Pico Mejorado',      price: 3000,  desc: '+50% en minería'                     },
    { id: 'cana',    name: '🎣 Caña Pro',            price: 2500,  desc: '+50% en pesca'                       },
    { id: 'mascara', name: '🎭 Máscara Ladrón',      price: 4000,  desc: '+30% éxito en robos y crimen'        },
    { id: 'vip',     name: '💎 Pase VIP',            price: 10000, desc: 'Cooldowns -50% por 24h'              },
]

// ══════════════════════════════════════════
//  PLUGIN — recibe cmd directo del handler
// ══════════════════════════════════════════

const plugin = async (m, { conn, args, prefix }) => {
    // El handler ya extrajo el comando de m.body y lo quitó de args
    // Lo recuperamos limpiamente desde m.body
    const body = m.body || ''
    const pfx  = prefix || ['#','.','/','\$'].find(p => body.startsWith(p)) || '.'
    const cmd  = body.slice(pfx.length).trim().split(/ +/)[0]?.toLowerCase() || ''

    const eco  = getEco(m.sender)
    const db   = database.data
    const name = m.pushName || 'Darling'

    const send = async (text) => {
        await global.sendWithCtx(conn, m.chat, { text }, db, { quoted: m })
    }

    // ─── BALANCE ────────────────────────────────────────────────────────
    if (['balance','bal','saldo','perfil','wallet'].includes(cmd)) {
        const total  = eco.stamps + eco.bank
        const estado = total < 500 ? troll('broke') : total > 20000 ? troll('rico') : '📊 Situación económica... existente.'
        return send(
`╭─────────────────────────╮
│  💗 ECONOMÍA DE ${name.toUpperCase()}
╰─────────────────────────╯

💵 Efectivo:  ${fmt(eco.stamps)} Stamps
🏦 Banco:     ${fmt(eco.bank)} Stamps
💰 Total:     ${fmt(total)} Stamps

📈 Ganado: ${fmt(eco.totalEarned)} | 📉 Perdido: ${fmt(eco.totalLost)}
🎰 Victorias: ${eco.wins} | Derrotas: ${eco.losses}
🔥 Racha: ${eco.streak} días
💼 Trabajo: ${eco.job ? eco.job.emoji + ' ' + eco.job.name : 'Desempleado 😐'}

${estado}

> ${global.dev}`)
    }

    // ─── DAILY ──────────────────────────────────────────────────────────
    if (['daily','diario','claim'].includes(cmd)) {
        const cd = cdLeft(eco.lastDaily, 86400000)
        if (cd) return send('⏳ Ya reclamaste hoy.\nVuelve en: *' + cd + '*\n\n_¿Tanto apuro? Relax._')

        eco.streak = (ms() - eco.lastDaily) < 172800000 ? eco.streak + 1 : 1
        const base   = rand(200, 600)
        const bonus  = eco.streak > 1 ? Math.floor(base * Math.min(eco.streak * 0.1, 1)) : 0
        const earned = base + bonus
        eco.stamps += earned
        eco.totalEarned += earned
        eco.lastDaily = ms()
        await save()

        return send(
`╭─────────────────────────╮
│   📅 RECOMPENSA DIARIA   │
╰─────────────────────────╯

${troll('daily')}

💵 Base: +${fmt(base)} Stamps
${bonus > 0 ? '🔥 Bonus racha (×' + eco.streak + '): +' + fmt(bonus) + ' Stamps' : '🔥 Racha: ' + eco.streak + ' día'}

✅ Total: +${fmt(earned)} Stamps
💰 Saldo: ${fmt(eco.stamps)} Stamps

> ${global.dev}`)
    }

    // ─── WORK ───────────────────────────────────────────────────────────
    if (['work','trabajar','laburo','chamba'].includes(cmd)) {
        const cd = cdLeft(eco.lastWork, 3600000)
        if (cd) return send('⏳ Ya trabajaste hace poco.\nDescansa: *' + cd + '*\n\n_El trabajo dignifica... pero no tanto._')

        if (!eco.job) eco.job = JOBS[rand(0, JOBS.length - 1)]
        const pico   = eco.inventory.includes('palanca')
        const earned = Math.floor(rand(eco.job.min, eco.job.max) * (pico ? 1.5 : 1))
        eco.stamps += earned
        eco.totalEarned += earned
        eco.lastWork = ms()
        await save()

        return send(
`╭─────────────────────────╮
│       💼 TRABAJO         │
╰─────────────────────────╯

${WORK_PHRASES[rand(0, WORK_PHRASES.length - 1)](eco.job, earned)}
${pico ? '\n⛏️ (Pico mejorado +50%)' : ''}
💰 Saldo: ${fmt(eco.stamps)} Stamps

${troll('trabajo')}

> ${global.dev}`)
    }

    // ─── MINAR ──────────────────────────────────────────────────────────
    if (['minar','mine','mineria'].includes(cmd)) {
        const cd = cdLeft(eco.lastMine, 7200000)
        if (cd) return send('⏳ La mina está cerrada.\nVuelve en: *' + cd + '*')

        const pico = eco.inventory.includes('palanca')
        const base = rand(100, 400)
        const evts = [
            { p: 0.10, txt: '💎 ¡DIAMANTE! Triplicaste.', m: 3   },
            { p: 0.20, txt: '🥇 ¡ORO! Doble.',             m: 2   },
            { p: 0.30, txt: '🪨 Mineral normal.',           m: 1   },
            { p: 0.20, txt: '💥 Explosión. Menos.',         m: 0.5 },
            { p: 0.20, txt: '🕳️ Derrumbe. Saliste.',       m: 0.3 },
        ]
        let r = Math.random(), acc = 0, ev = evts[2]
        for (const e of evts) { acc += e.p; if (r < acc) { ev = e; break } }

        const total = Math.floor(base * ev.m * (pico ? 1.5 : 1))
        eco.stamps += total
        eco.totalEarned += total
        eco.lastMine = ms()
        await save()

        return send(
`╭─────────────────────────╮
│      ⛏️ MINERÍA          │
╰─────────────────────────╯

${troll('mina')}
${ev.txt}

💵 Ganaste: +${fmt(total)} Stamps
${pico ? '⛏️ (Pico mejorado +50%)' : ''}
💰 Saldo: ${fmt(eco.stamps)} Stamps

> ${global.dev}`)
    }

    // ─── PESCAR ─────────────────────────────────────────────────────────
    if (['pescar','fish','pesca'].includes(cmd)) {
        const cd = cdLeft(eco.lastFish, 5400000)
        if (cd) return send('⏳ El mar está cerrado.\nVuelve en: *' + cd + '*\n\n_Hasta el mar te rechaza._')

        const cana  = eco.inventory.includes('cana')
        const peces = [
            { name: '🦐 Camarón',    val: rand(50,   100),  p: 0.30 },
            { name: '🐟 Sardina',    val: rand(80,   200),  p: 0.25 },
            { name: '🐠 Pez Trop',   val: rand(150,  350),  p: 0.20 },
            { name: '🐡 Pez Globo',  val: rand(200,  500),  p: 0.12 },
            { name: '🦈 Tiburón',    val: rand(500,  1200), p: 0.07 },
            { name: '💀 Bota Vieja', val: -rand(20,  80),   p: 0.04 },
            { name: '💎 Tesoro',     val: rand(1000, 3000), p: 0.02 },
        ]
        let r = Math.random(), acc = 0, pez = peces[0]
        for (const p of peces) { acc += p.p; if (r < acc) { pez = p; break } }

        const val = cana ? Math.floor(pez.val * 1.5) : pez.val
        eco.stamps += val
        val > 0 ? (eco.totalEarned += val) : (eco.totalLost += Math.abs(val))
        eco.lastFish = ms()
        await save()

        return send(
`╭─────────────────────────╮
│        🎣 PESCA          │
╰─────────────────────────╯

${troll('pesca')}

Pescaste: ${pez.name}
${val >= 0 ? '💵 Ganaste: +' + fmt(val) + ' Stamps' : '💸 Perdiste: -' + fmt(Math.abs(val)) + ' Stamps (te cobró la bota)'}
${cana ? '🎣 (Caña Pro +50%)' : ''}
💰 Saldo: ${fmt(eco.stamps)} Stamps

> ${global.dev}`)
    }

    // ─── CRIMEN ─────────────────────────────────────────────────────────
    if (['crimen','crime','delinquir'].includes(cmd)) {
        const cd = cdLeft(eco.lastCrime, 14400000)
        if (cd) return send('⏳ La policía te está buscando.\nEspera: *' + cd + '*\n\n_Quédate quieto, criminal._')

        const mascara = eco.inventory.includes('mascara')
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
        eco.lastCrime = ms()

        if (Math.random() < (mascara ? 0.65 : 0.50)) {
            const earned = rand(200, 1500)
            eco.stamps += earned
            eco.totalEarned += earned
            eco.robberies++
            await save()
            return send(
`╭─────────────────────────╮
│       🦹 CRIMEN          │
╰─────────────────────────╯

${troll('robo')}
✅ ¡ÉXITO! ${crimen}

💵 Botín: +${fmt(earned)} Stamps
${mascara ? '🎭 (Máscara ladrón aplicada)' : ''}
💰 Saldo: ${fmt(eco.stamps)} Stamps

> ${global.dev}`)
        } else {
            const multa = rand(100, 600)
            eco.stamps  = Math.max(0, eco.stamps - multa)
            eco.totalLost += multa
            await save()
            return send(
`╭─────────────────────────╮
│      🚔 ATRAPADO         │
╰─────────────────────────╯

😂 ¡TE AGARRARON! ${crimen}... y te vieron la cara.

💸 Multa: -${fmt(multa)} Stamps
💰 Saldo: ${fmt(eco.stamps)} Stamps

_Próxima vez no cometas crímenes en WhatsApp._

> ${global.dev}`)
        }
    }

    // ─── LIMOSNA ────────────────────────────────────────────────────────
    if (['limosna','beg','pedir'].includes(cmd)) {
        const cd = cdLeft(eco.lastBeg, 10800000)
        if (cd) return send('⏳ Ya pediste hace poco.\nEspera: *' + cd + '*\n\n_Hasta la limosna tiene límite._')

        eco.lastBeg = ms()

        if (Math.random() < 0.6) {
            const earned = rand(10, 100)
            eco.stamps += earned
            eco.totalEarned += earned
            await save()
            return send(
`╭─────────────────────────╮
│       🙏 LIMOSNA         │
╰─────────────────────────╯

${troll('limosna')}
✅ Alguien se apiadó de ti.

💵 Recibiste: +${fmt(earned)} Stamps
💰 Saldo: ${fmt(eco.stamps)} Stamps

_No es mucho pero es trabajo honesto._

> ${global.dev}`)
        } else {
            await save()
            return send(
`╭─────────────────────────╮
│       🙏 LIMOSNA         │
╰─────────────────────────╯

😂 Nadie te dio nada. Ignorado completamente.
💰 Saldo sin cambios: ${fmt(eco.stamps)} Stamps

${troll('limosna')}

> ${global.dev}`)
        }
    }

    // ─── SLOTS ──────────────────────────────────────────────────────────
    if (['slots','tragamonedas','slot'].includes(cmd)) {
        const cd = cdLeft(eco.lastSlots, 1800000)
        if (cd) return send('⏳ Las máquinas en mantenimiento.\nVuelve en: *' + cd + '*')

        const apuesta = parseInt(args[0]) || 100
        if (apuesta < 50)         return send('❌ Apuesta mínima: 50 Stamps')
        if (apuesta > eco.stamps) return send('❌ No tienes suficiente. Tienes ' + fmt(eco.stamps) + ' Stamps.\n' + troll('broke'))

        const sym = ['💗','⭐','🍒','🎵','🎰','💎','🌸','🔥']
        const s   = [sym[rand(0,7)], sym[rand(0,7)], sym[rand(0,7)]]

        let mult = 0, res = ''
        if (s[0]===s[1] && s[1]===s[2]) {
            if (s[0]==='💎')  { mult=10; res='💎 JACKPOT DIAMANTE — ×10 !!!' }
            else if (s[0]==='🌸') { mult=7; res='🌸 JACKPOT ZERO TWO — ×7 !!!' }
            else               { mult=5; res=s[0]+' TRIPLE — ×5 !!!' }
        } else if (s[0]===s[1]||s[1]===s[2]||s[0]===s[2]) {
            mult=1.5; res='✨ PAR — ×1.5'
        } else {
            mult=0; res='💀 NADA — Perdiste todo'
        }

        const gan = Math.floor(apuesta * mult)
        eco.stamps += gan - apuesta
        eco.totalEarned += gan
        eco.totalLost   += apuesta
        eco.lastSlots    = ms()
        mult > 0 ? eco.wins++ : eco.losses++
        await save()

        return send(
`╭─────────────────────────╮
│        🎰 SLOTS          │
╰─────────────────────────╯

${troll('apuesta')}

┌─────────────┐
│  ${s[0]}  ${s[1]}  ${s[2]}  │
└─────────────┘

${res}
💵 Apostaste: ${fmt(apuesta)} Stamps
${gan > 0 ? '🏆 Ganaste: +' + fmt(gan) + ' Stamps' : '💸 Perdiste: -' + fmt(apuesta) + ' Stamps'}
💰 Saldo: ${fmt(eco.stamps)} Stamps

> ${global.dev}`)
    }

    // ─── RULETA ─────────────────────────────────────────────────────────
    if (['ruleta','roulette','girar'].includes(cmd)) {
        const cd = cdLeft(eco.lastRoulette, 1800000)
        if (cd) return send('⏳ La ruleta se está enfriando.\nVuelve en: *' + cd + '*')

        const apuesta = parseInt(args[0]) || 0
        const color   = args[1]?.toLowerCase() || ''

        if (!['rojo','negro','verde','r','n','v'].includes(color))
            return send('❌ Uso: ' + pfx + 'ruleta <cantidad> <rojo/negro/verde>\nEj: ' + pfx + 'ruleta 500 rojo')
        if (apuesta < 50)         return send('❌ Apuesta mínima: 50 Stamps')
        if (apuesta > eco.stamps) return send('❌ No tienes suficiente.\n' + troll('broke'))

        const num      = rand(0, 36)
        const realColor = num===0 ? 'verde' : num%2===0 ? 'negro' : 'rojo'
        const elegido   = ['r','rojo'].includes(color) ? 'rojo' : ['n','negro'].includes(color) ? 'negro' : 'verde'
        const gano      = elegido === realColor
        const mult      = elegido==='verde' ? 14 : 2
        const gan       = gano ? Math.floor(apuesta * mult) : 0

        eco.stamps += gan - apuesta
        eco.totalEarned += gan
        eco.totalLost   += apuesta
        eco.lastRoulette = ms()
        gano ? eco.wins++ : eco.losses++
        await save()

        const ce = c => c==='rojo' ? '🔴 Rojo' : c==='negro' ? '⚫ Negro' : '🟢 Verde'

        return send(
`╭─────────────────────────╮
│        🎡 RULETA         │
╰─────────────────────────╯

${troll('ruleta')}

🎯 Número: ${num} — ${ce(realColor)}
Tu apuesta: ${ce(elegido)}

${gano ? '✅ ¡GANASTE! ×' + mult + '\n🏆 +' + fmt(gan) + ' Stamps' : '❌ PERDISTE\n💸 -' + fmt(apuesta) + ' Stamps'}
💰 Saldo: ${fmt(eco.stamps)} Stamps

> ${global.dev}`)
    }

    // ─── DADOS ──────────────────────────────────────────────────────────
    if (['dados','dice','apostar'].includes(cmd)) {
        const apuesta = parseInt(args[0]) || 0
        if (apuesta < 50)         return send('❌ Apuesta mínima: 50 Stamps')
        if (apuesta > eco.stamps) return send('❌ No tienes suficiente.\n' + troll('broke'))

        const td = rand(1,6), bd = rand(1,6)
        let cambio = 0, res = ''
        if (td > bd)      { cambio =  apuesta; res = '✅ ¡GANASTE! Tu (' + td + ') > Bot (' + bd + ')'; eco.wins++ }
        else if (td < bd) { cambio = -apuesta; res = '❌ PERDISTE. Tu (' + td + ') < Bot (' + bd + ')'; eco.losses++ }
        else              { cambio =  0;       res = '🤝 EMPATE. Ambos sacaron ' + td + '. Nadie gana.' }

        eco.stamps += cambio
        eco.totalEarned += Math.max(cambio, 0)
        eco.totalLost   += Math.max(-cambio, 0)
        await save()

        return send(
`╭─────────────────────────╮
│        🎲 DADOS          │
╰─────────────────────────╯

?