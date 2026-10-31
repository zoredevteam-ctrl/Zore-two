// 💗 ── F L A S H  B O T  M D  S Y S T E M ── 💗
// ✦ [ PROTOCOLO ECONOMÍA ]
// ⟡ 𝖍𝖆𝖎𝖙𝖍𝖆𝖒

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
    'سُقت فرانكس تحت المطر الحمضي. ده بيوجع يا حبيبي~',
    'نضّفت بقايا كلاكسوصور لوحدك... يا قرف 💗',
    'اتدربت مع سرب بلانتاسيون 13 وكدت متنجحش~',
    'Repartiste raciones en el bunker y nadie dijo شكراً. Normal.',
    'خبّيت الطفيليات الصغيرة واستنزفوا روحك~',
    'بنيت حاجز لوحدك لأن الباقي كانوا نايمين 💕',
    'عملت حراسة الليل كله ومحصلش حاجة. بس يستاهل يا حبيبي.',
    'صلّحت الفرانكس بسلك وإرادة. ده حب 🌸'
]

const frasesRobo = [
    'الرادارات كشفتك يا غبي~ 💔',
    'الضحية كان Flash Bot MD في وضع القتال. اختيار غلط يا حبيبي.',
    'اتعثرت في رجلك. كلاسيكي 😭',
    'الحارس كان جورو. أيوه، نفس جورو. مسكك بردو.',
    'حد وشى عليك للسرب. في خاين بيناتنا~'
]

const frasesDaily = [
    'خد، ماتصرفهوش على فاضي... أصلاً صرفه~ 💗',
    'Flash Bot MD te lo da a regañadientes, pero con amor ♡',
    'القدر حب يكون لطيف النهاردة... غريبة~',
    'أظن إنك تستاهل ده يا حبيبي. يمكن 🌸',
    'ماتشكرنيش. بس ماتموتش النهاردة، تمام؟ 💕'
]

const frasesTransfer = [
    'يا كريم... ولا انت مديون له~ 💗',
    'Flash Bot MD موافق على المشاركة. بس شوية صغيرين 🌸',
    'حبيبي transfirió fondos. Muy civilizado para variar~',
    'يا عم إحنا مش بنك. أصلاً إحنا بنك. بس 💕'
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
    if (['bal', 'balance', 'فلوس'].includes(cmd)) {
        const total = (user.money || 0) + (user.bank || 0)
        const estado = total === 0
            ? '💔 En quiebra total. Ni Flash Bot MD puede ayudarte así~'
            : total < 500
            ? '🌸 Cuatro Stamps. No te ilusiones, حبيبي~'
            : total < 5000
            ? '💗 مش وحش. كمّل شغل~'
            : '✨ Eres rico/a, حبيبي. Flash Bot MD está impresionada~'

        return send(conn, m,
            `╔══「 💗 Balance 」══╗\n\n` +
            `  💵 Efectivo:  *${(user.money || 0).toLocaleString()} ${cur()}*\n` +
            `  🏦 Banco:     *${(user.bank  || 0).toLocaleString()} ${cur()}*\n` +
            `  💰 Total:     *${total.toLocaleString()} ${cur()}*\n` +
            `  ⭐ Nivel:     *${user.level || 1}*\n\n` +
            `  ${estado}\n\n` +
            `╚══「 💕 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
        )
    }

    // ── #chamba ───────────────────────────────────────────────────────────────
    if (['chamba', 'trabajar', 'work'].includes(cmd)) {
        const cooldown = 30 * 60 * 1000
        const diff     = Date.now() - (user.lastwork || 0)
        if (diff < cooldown) return send(conn, m,
            `╔══「 💗 Chamba 」══╗\n\n` +
            `  ⏳ اشتغلت بالفعل، حبيبي~\n` +
            `  Vuelve en *${msToTime(cooldown - diff)}* 💕\n\n` +
            `╚══「 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
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
            (subio ? `  🎉 ¡Subiste al مستوى *${user.level}*, حبيبي~! 💗\n` : '') +
            `  ⏳ Vuelve en 30 min~\n\n` +
            `╚══「 💕 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
        )
    }

    // ── #daily ────────────────────────────────────────────────────────────────
    if (['daily', 'diario'].includes(cmd)) {
        const cooldown = 24 * 60 * 60 * 1000
        const diff     = Date.now() - (user.lastdaily || 0)
        if (diff < cooldown) return send(conn, m,
            `╔══「 💗 Daily 」══╗\n\n` +
            `  💔 صطدت النهاردة بالفعل، حبيبي~\n` +
            `  Vuelve en *${msToTime(cooldown - diff)}* 🌸\n\n` +
            `╚══「 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
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
            `╚══「 💕 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
        )
    }

    // ── #dep ──────────────────────────────────────────────────────────────────
    if (['dep', 'depositar'].includes(cmd)) {
        const cantidad = args[0] === 'all' ? user.money : parseInt(args[0])
        if (!cantidad || isNaN(cantidad) || cantidad <= 0) return send(conn, m,
            `╔══「 💗 Depositar 」══╗\n\n` +
            `  ⟡ Uso: *#dep <cantidad>* o *#dep all*\n\n` +
            `╚══「 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
        )
        if (cantidad > (user.money || 0)) return send(conn, m,
            `╔══「 💗 خطأ 」══╗\n\n` +
            `  💔 معندكش *${cantidad.toLocaleString()} ${cur()}* كاش~\n\n` +
            `╚══「 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
        )
        user.money -= cantidad
        user.bank   = (user.bank || 0) + cantidad
        await database.save().catch(() => {})
        return send(conn, m,
            `╔══「 💗 Depósito 」══╗\n\n` +
            `  🏦 Depositaste: *${cantidad.toLocaleString()} ${cur()}*\n` +
            `  💰 Banco:       *${(user.bank).toLocaleString()} ${cur()}*\n\n` +
            `  🌸 Qué responsable... no te conocía ese lado, حبيبي~\n\n` +
            `╚══「 💕 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
        )
    }

    // ── #retirar ──────────────────────────────────────────────────────────────
    if (['retirar', 'withdraw'].includes(cmd)) {
        const cantidad = args[0] === 'all' ? user.bank : parseInt(args[0])
        if (!cantidad || isNaN(cantidad) || cantidad <= 0) return send(conn, m,
            `╔══「 💗 Retirar 」══╗\n\n` +
            `  ⟡ Uso: *#retirar <cantidad>* o *#retirar all*\n\n` +
            `╚══「 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
        )
        if (cantidad > (user.bank || 0)) return send(conn, m,
            `╔══「 💗 خطأ 」══╗\n\n` +
            `  💔 بنكك فيه بس *${(user.bank || 0).toLocaleString()} ${cur()}*~\n\n` +
            `╚══「 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
        )
        user.bank  -= cantidad
        user.money  = (user.money || 0) + cantidad
        await database.save().catch(() => {})
        return send(conn, m,
            `╔══「 💗 Retiro 」══╗\n\n` +
            `  💵 Retiraste: *${cantidad.toLocaleString()} ${cur()}*\n` +
            `  💰 Efectivo:  *${(user.money).toLocaleString()} ${cur()}*\n\n` +
            `  🌸 Ya te lo gastaste todo... ¿verdad? حبيبي~ 💔\n\n` +
            `╚══「 💕 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
        )
    }

    // ── #transferir ───────────────────────────────────────────────────────────
    if (['transferir', 'transfer', 'pagar'].includes(cmd)) {
        const target   = m.mentionedJid?.[0] || m.quoted?.sender
        const cantidad = parseInt(args.find(a => !isNaN(a)))
        if (!target)                                   return send(conn, m, `╔══「 💗 Transferir 」══╗\n\n  ⟡ Uso: *#transferir @عضو <cantidad>*\n\n╚══「 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`)
        if (!cantidad || isNaN(cantidad) || cantidad <= 0) return send(conn, m, `╔══「 💗 خطأ 」══╗\n\n  💔 اكتب مبلغ صحيح~\n\n╚══「 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`)
        if (cantidad > (user.money || 0))              return send(conn, m, `╔══「 💗 خطأ 」══╗\n\n  💔 معندكش كاش كفاية، حبيبي~\n\n╚══「 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`)
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
            `╚══「 💕 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`,
            [target]
        )
    }

    // ── #robar ────────────────────────────────────────────────────────────────
    if (['robar', 'rob'].includes(cmd)) {
        const cooldown = 60 * 60 * 1000
        const diff     = Date.now() - (user.lastrob || 0)
        if (diff < cooldown) return send(conn, m,
            `╔══「 💗 Robar 」══╗\n\n` +
            `  💔 La policía aún te busca, حبيبي~\n` +
            `  استنى *${msToTime(cooldown - diff)}* 🌸\n\n` +
            `╚══「 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
        )
        user.lastrob = Date.now()

        let target       = m.mentionedJid?.[0] || m.quoted?.sender
        let randomVictim = false
        if (!target && m.isGroup) { target = await getRandomParticipant([sender]); randomVictim = true }
        if (!target || target === sender) return send(conn, m,
            `╔══「 💗 خطأ 」══╗\n\n  💔 محتاج حد أسرق منه، حبيبي~\n\n╚══「 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
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
                `  🌸 Patético. En serio, حبيبي~ 😭\n\n` +
                `╚══「 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`,
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
            `  🌸 Flash Bot MD está... impresionada. Solo un poco~ 💗\n\n` +
            `╚══「 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`,
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
            'Flash Bot MD dice que @{} tiene menos lógica que un Klaxosaurio bebé~ 🌸'
        ]
        const target = m.mentionedJid?.[0] || m.quoted?.sender || await getRandomParticipant([sender])
        if (!target) return send(conn, m,
            `╔══「 💗 خطأ 」══╗\n\n  💔 مفيش حد أحكيله النكتة~\n\n╚══「 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
        )
        const num = target.split('@')[0]
        return send(conn, m,
            `╔══「 💗 Flash Bot MD cuenta un chiste 」══╗\n\n` +
            `  😏 ${rand(chistes).replace('@{}', `@${num}`)}\n\n` +
            `╚══「 💕 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`,
            [target]
        )
    }

    // ── #donar ────────────────────────────────────────────────────────────────
    if (['donar', 'donate'].includes(cmd)) {
        if (!isOwner) return send(conn, m,
            `╔══「 💗 خطأ 」══╗\n\n  💔 المالك بس اللي يتبرع، حبيبي~\n\n╚══「 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
        )
        const target   = m.mentionedJid?.[0] || m.quoted?.sender
        const cantidad = parseInt(args.find(a => !isNaN(a)))
        if (!target)                                   return send(conn, m, `╔══「 💗 Donar 」══╗\n\n  ⟡ Uso: *#donar @عضو <cantidad>*\n\n╚══「 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`)
        if (!cantidad || isNaN(cantidad) || cantidad <= 0) return send(conn, m, `╔══「 💗 خطأ 」══╗\n\n  💔 اكتب مبلغ صحيح~\n\n╚══「 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`)
        const targetUser  = getUser(target)
        targetUser.money  = (targetUser.money || 0) + cantidad
        await database.save().catch(() => {})
        return send(conn, m,
            `╔══「 💗 Donación 」══╗\n\n` +
            `  🎁 Para:     *@${target.split('@')[0]}*\n` +
            `  💵 Cantidad: *${cantidad.toLocaleString()} ${cur()}*\n\n` +
            `  🌸 المالك اتبرع و Flash Bot MD موافق~ 💗\n\n` +
            `╚══「 💕 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`,
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
            `╔══「 💗 Top 」══╗\n\n  💔 مفيش حد في الترتيب لسه~\n\n╚══「 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
        )
        const medals = ['🥇', '🥈', '🥉', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩']
        const lista  = sorted.map(([jid, u], i) =>
            `  ${medals[i]} *${u.name || jid.split('@')[0]}* — ${((u.money || 0) + (u.bank || 0)).toLocaleString()} ${cur()}`
        ).join('\n')
        return send(conn, m,
            `╔══「 💗 Top Ricos 」══╗\n\n` +
            `${lista}\n\n` +
            `  🌸 ¿No estás? A trabajar, حبيبي~ 💔\n\n` +
            `╚══「 💕 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
        )
    }
}

handler.command = [
    'bal', 'balance', 'فلوس',
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
