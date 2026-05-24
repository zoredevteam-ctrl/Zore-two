// 💗 ── Z E R O  T W O  S Y S T E M ── 💗
// ✦ [ PROTOCOLO ECONOMÍA ]
// ⟡ ZoreDevTeam

import { database } from '../lib/database.js'

const getThumb = async () => {
    try {
        const src = global.icon || global.avatar || global.banner
        if (!src) return null
        const res = await fetch(src)
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

const send = async (conn, m, txt, mentions = []) => {
    const thumb = await getThumb()
    try {
        await conn.sendMessage(m.chat, {
            text: txt, mentions,
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid:   global.newsletterJid,
                    serverMessageId: '',
                    newsletterName:  global.newsletterName
                },
                externalAdReply: {
                    title:                 global.botName,
                    body:                  global.botText,
                    mediaType:             1,
                    thumbnail:             thumb,
                    renderLargerThumbnail: false,
                    sourceUrl:             global.rcanal
                }
            }
        }, { quoted: m })
    } catch { await m.reply(txt) }
}

const getUser = (jid) => {
    if (!database.data.users)      database.data.users = {}
    if (!database.data.users[jid]) database.data.users[jid] = { money: 0, bank: 0, exp: 0, level: 1 }
    return database.data.users[jid]
}

const checkLevel = (user) => {
    const xpNeeded = user.level * 100
    if ((user.exp || 0) >= xpNeeded) {
        user.level = (user.level || 1) + 1
        user.exp  -= xpNeeded
        return true
    }
    return false
}

const rand = arr => arr[Math.floor(Math.random() * arr.length)]
const msToTime = ms => {
    const h = Math.floor(ms / 3600000)
    const m = Math.floor((ms % 3600000) / 60000)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
}
const cur = () => global.moneda || 'Stamps'

// ── FRASES ────────────────────────────────────────────────────────────────────

const frasesTrabajo = [
    'Piloteaste un Franxx bajo la lluvia ácida. Eso duele, Darling~',
    'Limpiaste los restos de un Klaxosaurio tú solo... qué asco 💗',
    'Entrenaste con el escuadrón Plantación 13 y casi no sobrevives~',
    'Repartiste raciones en el bunker y nadie dijo gracias. Normal.',
    'Cuidaste a los parasitos pequeños y te agotaron el alma entera~',
    'Construiste una barricada sola/solo porque los demás dormían 💕',
    'Hiciste guardia toda la noche y no pasó nada. Pero valió, Darling.',
    'Reparaste el FranXX con alambre y voluntad. Eso es amor 🌸'
]

const frasesRobo = [
    'Te detectaron los sensores del bunker, torpe~ 💔',
    'La víctima era Zero Two en modo combate. Mala elección, Darling.',
    'Tropezaste con tu propio pie. Clásico 😭',
    'El guardia era Goro. Sí, ese Goro. Te atrapó igual.',
    'Alguien te delató al escuadrón. Hay un topo entre nosotros~'
]

const frasesDaily = [
    'Toma, no lo gastes en tonterías... bueno sí, hazlo~ 💗',
    'Zero Two te lo da a regañadientes, pero con amor ♡',
    'El destino decidió ser amable hoy... qué raro~',
    'Supongo que te lo mereces, Darling. Tal vez 🌸',
    'No me lo agradezcas. Solo no te mueras hoy, ¿sí? 💕'
]

const frasesTransfer = [
    'Qué generoso/a... o le debes algo~ 💗',
    'Zero Two aprueba compartir. Pero solo un poco 🌸',
    'Darling transfirió fondos. Muy civilizado para variar~',
    'Oye, que no somos un banco. Bueno, sí. Pero 💕'
]

// ── HANDLER ───────────────────────────────────────────────────────────────────

let handler = async (m, { conn, command, args, isOwner }) => {
    const cmd    = command.toLowerCase()
    const sender = m.sender
    const user   = getUser(sender)

    const getRandomParticipant = async (excluir = []) => {
        if (!m.isGroup) return null
        try {
            const meta = await conn.groupMetadata(m.chat)
            const ps   = meta.participants.map(p => p.id || p.jid).filter(j => !excluir.includes(j))
            return ps.length ? ps[Math.floor(Math.random() * ps.length)] : null
        } catch { return null }
    }

    // ── #bal ──────────────────────────────────────────────────────────────────
    if (['bal', 'balance', 'dinero'].includes(cmd)) {
        const total = (user.money || 0) + (user.bank || 0)
        const estado = total === 0
            ? '💔 En quiebra total. Ni Zero Two puede ayudarte así~'
            : total < 500
            ? '🌸 Cuatro Stamps. No te ilusiones, Darling~'
            : total < 5000
            ? '💗 No está mal. Sigue trabajando~'
            : '✨ Eres rico/a, Darling. Zero Two está impresionada~'

        return send(conn, m,
            `╔══「 💗 Balance 」══╗\n\n` +
            `  💵 Efectivo:  *${(user.money || 0).toLocaleString()} ${cur()}*\n` +
            `  🏦 Banco:     *${(user.bank  || 0).toLocaleString()} ${cur()}*\n` +
            `  💰 Total:     *${total.toLocaleString()} ${cur()}*\n` +
            `  ⭐ Nivel:     *${user.level || 1}*\n\n` +
            `  ${estado}\n\n` +
            `╚══「 💕 © ZoreDevTeam 」══╝`
        )
    }

    // ── #chamba ───────────────────────────────────────────────────────────────
    if (['chamba', 'trabajar', 'work'].includes(cmd)) {
        const cooldown = 30 * 60 * 1000
        const diff     = Date.now() - (user.lastwork || 0)
        if (diff < cooldown) return send(conn, m,
            `╔══「 💗 Chamba 」══╗\n\n` +
            `  ⏳ Ya trabajaste, Darling~\n` +
            `  Vuelve en *${msToTime(cooldown - diff)}* 💕\n\n` +
            `╚══「 © ZoreDevTeam 」══╝`
        )
        const ganado  = Math.floor(Math.random() * 400) + 100
        const expGain = Math.floor(Math.random() * 20) + 5
        user.money    = (user.money || 0) + ganado
        user.exp      = (user.exp   || 0) + expGain
        user.lastwork = Date.now()
        const subio   = checkLevel(user)
        await database.save().catch(() => {})
        return send(conn, m,
            `╔══「 💗 Chamba 」══╗\n\n` +
            `  🌸 ${rand(frasesTrabajo)}\n\n` +
            `  💵 Ganaste:  *+${ganado.toLocaleString()} ${cur()}*\n` +
            `  ⭐ EXP:      *+${expGain}*\n` +
            (subio ? `  🎉 ¡Subiste al nivel *${user.level}*, Darling~! 💗\n` : '') +
            `  ⏳ Vuelve en 30 min~\n\n` +
            `╚══「 💕 © ZoreDevTeam 」══╝`
        )
    }

    // ── #daily ────────────────────────────────────────────────────────────────
    if (['daily', 'diario'].includes(cmd)) {
        const cooldown = 24 * 60 * 60 * 1000
        const diff     = Date.now() - (user.lastdaily || 0)
        if (diff < cooldown) return send(conn, m,
            `╔══「 💗 Daily 」══╗\n\n` +
            `  💔 Ya reclamaste hoy, Darling~\n` +
            `  Vuelve en *${msToTime(cooldown - diff)}* 🌸\n\n` +
            `╚══「 © ZoreDevTeam 」══╝`
        )
        const ganado   = Math.floor(Math.random() * 300) + 200
        user.money     = (user.money || 0) + ganado
        user.lastdaily = Date.now()
        await database.save().catch(() => {})
        return send(conn, m,
            `╔══「 💗 Daily 」══╗\n\n` +
            `  🌸 ${rand(frasesDaily)}\n\n` +
            `  💵 Ganaste:  *+${ganado.toLocaleString()} ${cur()}*\n` +
            `  💰 Saldo:    *${(user.money).toLocaleString()} ${cur()}*\n\n` +
            `╚══「 💕 © ZoreDevTeam 」══╝`
        )
    }

    // ── #dep ──────────────────────────────────────────────────────────────────
    if (['dep', 'depositar'].includes(cmd)) {
        const cantidad = args[0] === 'all' ? user.money : parseInt(args[0])
        if (!cantidad || isNaN(cantidad) || cantidad <= 0) return send(conn, m,
            `╔══「 💗 Depositar 」══╗\n\n` +
            `  ⟡ Uso: *#dep <cantidad>* o *#dep all*\n\n` +
            `╚══「 © ZoreDevTeam 」══╝`
        )
        if (cantidad > (user.money || 0)) return send(conn, m,
            `╔══「 💗 Error 」══╗\n\n` +
            `  💔 No tienes *${cantidad.toLocaleString()} ${cur()}* en efectivo~\n\n` +
            `╚══「 © ZoreDevTeam 」══╝`
        )
        user.money -= cantidad
        user.bank   = (user.bank || 0) + cantidad
        await database.save().catch(() => {})
        return send(conn, m,
            `╔══「 💗 Depósito 」══╗\n\n` +
            `  🏦 Depositaste: *${cantidad.toLocaleString()} ${cur()}*\n` +
            `  💰 Banco:       *${(user.bank).toLocaleString()} ${cur()}*\n\n` +
            `  🌸 Qué responsable... no te conocía ese lado, Darling~\n\n` +
            `╚══「 💕 © ZoreDevTeam 」══╝`
        )
    }

    // ── #retirar ──────────────────────────────────────────────────────────────
    if (['retirar', 'withdraw'].includes(cmd)) {
        const cantidad = args[0] === 'all' ? user.bank : parseInt(args[0])
        if (!cantidad || isNaN(cantidad) || cantidad <= 0) return send(conn, m,
            `╔══「 💗 Retirar 」══╗\n\n` +
            `  ⟡ Uso: *#retirar <cantidad>* o *#retirar all*\n\n` +
            `╚══「 © ZoreDevTeam 」══╝`
        )
        if (cantidad > (user.bank || 0)) return send(conn, m,
            `╔══「 💗 Error 」══╗\n\n` +
            `  💔 Tu banco solo tiene *${(user.bank || 0).toLocaleString()} ${cur()}*~\n\n` +
            `╚══「 © ZoreDevTeam 」══╝`
        )
        user.bank  -= cantidad
        user.money  = (user.money || 0) + cantidad
        await database.save().catch(() => {})
        return send(conn, m,
            `╔══「 💗 Retiro 」══╗\n\n` +
            `  💵 Retiraste: *${cantidad.toLocaleString()} ${cur()}*\n` +
            `  💰 Efectivo:  *${(user.money).toLocaleString()} ${cur()}*\n\n` +
            `  🌸 Ya te lo gastaste todo... ¿verdad? Darling~ 💔\n\n` +
            `╚══「 💕 © ZoreDevTeam 」══╝`
        )
    }

    // ── #transferir ───────────────────────────────────────────────────────────
    if (['transferir', 'transfer', 'pagar'].includes(cmd)) {
        const target   = m.mentionedJid?.[0] || m.quoted?.sender
        const cantidad = parseInt(args.find(a => !isNaN(a)))
        if (!target)                                   return send(conn, m, `╔══「 💗 Transferir 」══╗\n\n  ⟡ Uso: *#transferir @usuario <cantidad>*\n\n╚══「 © ZoreDevTeam 」══╝`)
        if (!cantidad || isNaN(cantidad) || cantidad <= 0) return send(conn, m, `╔══「 💗 Error 」══╗\n\n  💔 Indica una cantidad válida~\n\n╚══「 © ZoreDevTeam 」══╝`)
        if (cantidad > (user.money || 0))              return send(conn, m, `╔══「 💗 Error 」══╗\n\n  💔 No tienes suficiente efectivo, Darling~\n\n╚══「 © ZoreDevTeam 」══╝`)
        const targetUser  = getUser(target)
        user.money       -= cantidad
        targetUser.money  = (targetUser.money || 0) + cantidad
        await database.save().catch(() => {})
        return send(conn, m,
            `╔══「 💗 Transferencia 」══╗\n\n` +
            `  💸 Enviaste: *${cantidad.toLocaleString()} ${cur()}*\n` +
            `  👤 Para:     *@${target.split('@')[0]}*\n` +
            `  💰 Saldo:    *${(user.money).toLocaleString()} ${cur()}*\n\n` +
            `  🌸 ${rand(frasesTransfer)}\n\n` +
            `╚══「 💕 © ZoreDevTeam 」══╝`,
            [target]
        )
    }

    // ── #robar ────────────────────────────────────────────────────────────────
    if (['robar', 'rob'].includes(cmd)) {
        const cooldown = 60 * 60 * 1000
        const diff     = Date.now() - (user.lastrob || 0)
        if (diff < cooldown) return send(conn, m,
            `╔══「 💗 Robar 」══╗\n\n` +
            `  💔 La policía aún te busca, Darling~\n` +
            `  Espera *${msToTime(cooldown - diff)}* 🌸\n\n` +
            `╚══「 © ZoreDevTeam 」══╝`
        )
        user.lastrob = Date.now()

        let target       = m.mentionedJid?.[0] || m.quoted?.sender
        let randomVictim = false
        if (!target && m.isGroup) { target = await getRandomParticipant([sender]); randomVictim = true }
        if (!target || target === sender) return send(conn, m,
            `╔══「 💗 Error 」══╗\n\n  💔 Necesito a alguien a quien robarle, Darling~\n\n╚══「 © ZoreDevTeam 」══╝`
        )

        const targetUser = getUser(target)
        const targetNum  = target.split('@')[0]
        const exito      = Math.random() > 0.45

        if (!exito || (targetUser.money || 0) <= 0) {
            const multa = Math.floor(Math.random() * 100) + 50
            user.money  = Math.max(0, (user.money || 0) - multa)
            await database.save().catch(() => {})
            return send(conn, m,
                `╔══「 💗 Robo Fallido 」══╗\n\n` +
                `  💔 ${rand(frasesRobo)}\n\n` +
                `  💸 Multa:  *-${multa} ${cur()}*\n` +
                `  🌸 Patético. En serio, Darling~ 😭\n\n` +
                `╚══「 © ZoreDevTeam 」══╝`,
                [target]
            )
        }

        let robado
        if (randomVictim) {
            robado = targetUser.money || 0
            targetUser.money = 0
        } else {
            robado = Math.floor(Math.random() * ((targetUser.money || 0) * 0.3)) + 50
            targetUser.money = Math.max(0, (targetUser.money || 0) - robado)
        }
        user.money = (user.money || 0) + robado
        await database.save().catch(() => {})

        return send(conn, m,
            `╔══「 💗 Robo Exitoso 」══╗\n\n` +
            `  👤 Víctima:  *@${targetNum}*\n` +
            `  💵 Robaste:  *${robado.toLocaleString()} ${cur()}*\n` +
            (randomVictim ? `  😈 Le robaste todo~ @${targetNum} sin un peso 💀\n` : '') +
            `  💰 Saldo:    *${(user.money).toLocaleString()} ${cur()}*\n\n` +
            `  🌸 Zero Two está... impresionada. Solo un poco~ 💗\n\n` +
            `╚══「 © ZoreDevTeam 」══╝`,
            [target]
        )
    }

    // ── #chiste ───────────────────────────────────────────────────────────────
    if (['chiste', 'joke'].includes(cmd)) {
        const chistes = [
            '¿Por qué @{} nunca pierde al ajedrez? Porque es un caballo y corre~ 💗',
            '¿Saben por qué @{} no puede usar internet? El captcha lo detecta como bot 😭',
            'Me dijeron que @{} lee 50 libros al año... de pasta de dientes 🌸',
            'Dicen que @{} es tan lento que Google le manda los resultados por carta~ 💕',
            '¿Cómo sabes que @{} está a dieta? Come rápido para que nadie lo vea 😤',
            'Le pregunté a @{} cuánto es 2+2 y me dijo: "depende de cómo me sienta"~ 💀',
            '@{} intentó hacer sticker y convirtió su cara. Quedó peor 💔',
            'Zero Two dice que @{} tiene menos lógica que un Klaxosaurio bebé~ 🌸'
        ]
        const target = m.mentionedJid?.[0] || m.quoted?.sender || await getRandomParticipant([sender])
        if (!target) return send(conn, m,
            `╔══「 💗 Error 」══╗\n\n  💔 No hay nadie a quien contarle el chiste~\n\n╚══「 © ZoreDevTeam 」══╝`
        )
        const num = target.split('@')[0]
        return send(conn, m,
            `╔══「 💗 Zero Two cuenta un chiste 」══╗\n\n` +
            `  😏 ${rand(chistes).replace('@{}', `@${num}`)}\n\n` +
            `╚══「 💕 © ZoreDevTeam 」══╝`,
            [target]
        )
    }

    // ── #donar ────────────────────────────────────────────────────────────────
    if (['donar', 'donate'].includes(cmd)) {
        if (!isOwner) return send(conn, m,
            `╔══「 💗 Error 」══╗\n\n  💔 Solo el owner puede donar, Darling~\n\n╚══「 © ZoreDevTeam 」══╝`
        )
        const target   = m.mentionedJid?.[0] || m.quoted?.sender
        const cantidad = parseInt(args.find(a => !isNaN(a)))
        if (!target)                                   return send(conn, m, `╔══「 💗 Donar 」══╗\n\n  ⟡ Uso: *#donar @usuario <cantidad>*\n\n╚══「 © ZoreDevTeam 」══╝`)
        if (!cantidad || isNaN(cantidad) || cantidad <= 0) return send(conn, m, `╔══「 💗 Error 」══╗\n\n  💔 Indica una cantidad válida~\n\n╚══「 © ZoreDevTeam 」══╝`)
        const targetUser  = getUser(target)
        targetUser.money  = (targetUser.money || 0) + cantidad
        await database.save().catch(() => {})
        return send(conn, m,
            `╔══「 💗 Donación 」══╗\n\n` +
            `  🎁 Para:     *@${target.split('@')[0]}*\n` +
            `  💵 Cantidad: *${cantidad.toLocaleString()} ${cur()}*\n\n` +
            `  🌸 El owner donó y Zero Two aprueba~ 💗\n\n` +
            `╚══「 💕 © ZoreDevTeam 」══╝`,
            [target]
        )
    }

    // ── #top ──────────────────────────────────────────────────────────────────
    if (['top', 'ranking'].includes(cmd)) {
        const users  = database.data?.users || {}
        const sorted = Object.entries(users)
            .sort((a, b) => ((b[1].money || 0) + (b[1].bank || 0)) - ((a[1].money || 0) + (a[1].bank || 0)))
            .slice(0, 10)
        if (!sorted.length) return send(conn, m,
            `╔══「 💗 Top 」══╗\n\n  💔 Nadie en el ranking aún~\n\n╚══「 © ZoreDevTeam 」══╝`
        )
        const medals = ['🥇', '🥈', '🥉', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩']
        const lista  = sorted.map(([jid, u], i) =>
            `  ${medals[i]} *${u.name || jid.split('@')[0]}* — ${((u.money || 0) + (u.bank || 0)).toLocaleString()} ${cur()}`
        ).join('\n')
        return send(conn, m,
            `╔══「 💗 Top Ricos 」══╗\n\n` +
            `${lista}\n\n` +
            `  🌸 ¿No estás? A trabajar, Darling~ 💔\n\n` +
            `╚══「 💕 © ZoreDevTeam 」══╝`
        )
    }
}

handler.command = [
    'bal', 'balance', 'dinero',
    'chamba', 'trabajar', 'work',
    'daily', 'diario',
    'dep', 'depositar',
    'retirar', 'withdraw',
    'transferir', 'transfer', 'pagar',
    'robar', 'rob',
    'chiste', 'joke',
    'donar', 'donate',
    'top', 'ranking'
]
handler.tags = ['economy']

export default handler
