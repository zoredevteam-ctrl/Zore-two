// 💗 ── Z E R O  T W O  S Y S T E M ── 💗
// ✦ [ PROTOCOLO DE SHIP ] — ZoreDevTeam
// ⟡ Fusión de fotos de perfil + corazón animado + porcentaje de amor

import Jimp, { MIME_PNG } from 'jimp'

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const jidOf = x =>
    (typeof x === 'string' ? x : (x?.id || x?.jid || x?.participant || '')).toString()

const cleanJid = jid => jid?.split('@')[0]?.split(':')[0]

const getPercent = (a, b) => {
    // Porcentaje determinista basado en los JIDs (siempre el mismo par = mismo %)
    const seed = [...(cleanJid(a) + cleanJid(b))].reduce((acc, c) => acc + c.charCodeAt(0), 0)
    return seed % 101
}

const getPhrase = (p) => {
    if (p === 100) return ['👑', '¡AMOR ABSOLUTO! El universo los creó el uno para el otro~ ✨']
    if (p >= 90)  return ['💍', '¡ALMAS GEMELAS! Zero Two les da su bendición rosada~ 🌸']
    if (p >= 75)  return ['🔥', '¡Pareja perfecta! Me muero de envidia darling~ 💕']
    if (p >= 60)  return ['💗', 'Muy buena vibra... ¡casi casi se besan! 😘']
    if (p >= 45)  return ['🌸', 'Hay chispa... pero falta un poquito más de amor~']
    if (p >= 30)  return ['😅', 'Mmm... el amor está en proceso, Darling~ 💫']
    if (p >= 15)  return ['💀', 'Esto es un ship de alto riesgo~ 😬']
    return              ['💔', '¡Ship trágico! Romeo y Julieta versión catástrofe~ 😭']
}

const heartBar = (p) => {
    const full = Math.round(p / 10)
    return '💗'.repeat(full) + '🩶'.repeat(10 - full)
}

// ─── DESCARGA Y PROCESA FOTO DE PERFIL ────────────────────────────────────────

const getAvatar = async (conn, jid) => {
    try {
        const url = await conn.profilePictureUrl(jid, 'image')
        const res = await fetch(url)
        const buf = Buffer.from(await res.arrayBuffer())
        return buf
    } catch {
        // Avatar por defecto: círculo de color sólido con inicial
        return null
    }
}

// ─── GENERA IMAGEN DE SHIP ─────────────────────────────────────────────────────
// Layout: [Avatar1] ── 💗 XX% ── [Avatar2]
// Tamaño final: 800x300

const buildShipImage = async (buf1, buf2, percent, name1, name2) => {
    const SIZE   = 220   // tamaño de cada avatar
    const W      = 800
    const H      = 300
    const RADIUS = SIZE / 2

    // Canvas base — fondo degradado rosa oscuro
    const base = new Jimp(W, H, 0x1a0a12ff)

    // Fondo con patrón de corazoncitos (píxeles rosa claro dispersos)
    for (let i = 0; i < 400; i++) {
        const x = Math.floor(Math.random() * W)
        const y = Math.floor(Math.random() * H)
        base.setPixelColor(0xff69b430, x, y)
    }

    // Borde degradado superior e inferior
    for (let x = 0; x < W; x++) {
        for (let dy = 0; dy < 4; dy++) {
            base.setPixelColor(0xff1493cc, x, dy)
            base.setPixelColor(0xff1493cc, x, H - 1 - dy)
        }
    }

    const processAvatar = async (buf) => {
        let img
        if (buf) {
            img = await Jimp.read(buf)
        } else {
            img = new Jimp(SIZE, SIZE, 0xff1493ff)
        }
        img.cover(SIZE, SIZE)

        // Máscara circular
        const mask = new Jimp(SIZE, SIZE, 0x00000000)
        for (let y = 0; y < SIZE; y++) {
            for (let x = 0; x < SIZE; x++) {
                const dx = x - RADIUS
                const dy = y - RADIUS
                if (dx * dx + dy * dy <= RADIUS * RADIUS) {
                    mask.setPixelColor(0xffffffff, x, y)
                }
            }
        }
        img.mask(mask, 0, 0)

        // Borde rosa brillante
        for (let angle = 0; angle < 360; angle += 0.5) {
            const rad = (angle * Math.PI) / 180
            const bx = Math.round(RADIUS + (RADIUS - 2) * Math.cos(rad))
            const by = Math.round(RADIUS + (RADIUS - 2) * Math.sin(rad))
            img.setPixelColor(0xff69b4ff, bx, by)
        }

        return img
    }

    const [av1, av2] = await Promise.all([
        processAvatar(buf1),
        processAvatar(buf2)
    ])

    // Posiciones
    const y1 = (H - SIZE) / 2
    const x1 = 30
    const x2 = W - SIZE - 30

    base.composite(av1, x1, y1)
    base.composite(av2, x2, y1)

    // Corazón central grande con el porcentaje
    // Dibujamos un corazón pixel-art 80x80 en el centro
    const cx = W / 2
    const cy = H / 2

    // Corazón simplificado como elipse doble
    const heartColor = percent >= 70 ? 0xff1493ff : percent >= 40 ? 0xff69b4ff : 0x8b0000ff
    for (let py = -40; py <= 40; py++) {
        for (let px = -40; px <= 40; px++) {
            // Fórmula de corazón: (x²+y²-1)³ ≤ x²y³
            const nx = px / 40
            const ny = -py / 40
            const val = Math.pow(nx*nx + ny*ny - 1, 3) - nx*nx * ny*ny*ny
            if (val <= 0) {
                base.setPixelColor(heartColor, Math.round(cx + px), Math.round(cy + py))
            }
        }
    }

    // Brillo interior del corazón
    for (let py = -25; py <= 15; py++) {
        for (let px = -25; px <= 25; px++) {
            const nx = px / 28
            const ny = -py / 28
            const val = Math.pow(nx*nx + ny*ny - 1, 3) - nx*nx * ny*ny*ny
            if (val <= 0) {
                base.setPixelColor(0xff69b4aa, Math.round(cx + px), Math.round(cy + py))
            }
        }
    }

    return base.getBufferAsync(MIME_PNG)
}

// ─── HANDLER PRINCIPAL ────────────────────────────────────────────────────────

const handler = async (m, { conn, command }) => {
    let mentions = []
    if (Array.isArray(m.mentionedJid) && m.mentionedJid.length) mentions = m.mentionedJid
    else if (Array.isArray(m.mentioned) && m.mentioned.length)  mentions = m.mentioned
    else if (m.mentionedJid) mentions = [m.mentionedJid]

    if (mentions.length === 0 && m.quoted) {
        const qs = m.quoted?.sender || m.quoted?.participant
        if (qs) mentions = [qs]
    }

    let user1, user2

    if (mentions.length >= 2) {
        user1 = jidOf(mentions[0])
        user2 = jidOf(mentions[1])
    } else if (mentions.length === 1) {
        user1 = jidOf(m.sender)
        user2 = jidOf(mentions[0])
    } else {
        try {
            const group = await conn.groupMetadata(m.chat)
            const members = (group?.participants || [])
                .map(p => jidOf(p))
                .filter(id => id && id !== jidOf(m.sender) && id !== jidOf(conn.user?.jid))
            if (members.length < 1) throw new Error('no-members')
            user1 = jidOf(m.sender)
            user2 = members[Math.floor(Math.random() * members.length)]
        } catch {
            await m.react('💔')
            return m.reply(
                `💗 *𝒁𝒆𝒓𝒐 𝑻𝒘𝒐* 💗\n\n` +
                `🌸 ¡Taggea a alguien, Darling~!\n` +
                `⟡ Uso: *.${command} @persona* o *.${command} @persona1 @persona2*`
            )
        }
    }

    await m.react('💗')

    // Nombres
    let name1 = cleanJid(user1), name2 = cleanJid(user2)
    try { const n = await conn.getName(user1); if (n) name1 = n } catch {}
    try { const n = await conn.getName(user2); if (n) name2 = n } catch {}

    // Porcentaje (determinista por par)
    const percent = getPercent(user1, user2)
    const [emoji, phrase] = getPhrase(percent)
    const bar = heartBar(percent)

    // Fotos de perfil
    const [buf1, buf2] = await Promise.all([
        getAvatar(conn, user1),
        getAvatar(conn, user2)
    ])

    // Genera imagen
    let imgBuffer = null
    try {
        imgBuffer = await buildShipImage(buf1, buf2, percent, name1, name2)
    } catch (e) {
        console.error('[SHIP IMG ERROR]', e.message)
    }

    const caption =
        `💗 *¡SHIP ACTIVADO, DARLING~!* 🌸\n\n` +
        `✨ *${name1}* 💗 *${name2}* ✨\n\n` +
        `${emoji} *Compatibilidad de amor:* *${percent}%*\n` +
        `${bar}\n\n` +
        `🌸 ${phrase}\n\n` +
        `> 💕 *Zero Two* los bendice~ © ZoreDevTeam`

    if (imgBuffer) {
        await conn.sendMessage(m.chat, {
            image: imgBuffer,
            caption,
            mentions: [user1, user2]
        }, { quoted: m })
    } else {
        await conn.sendMessage(m.chat, {
            text: caption,
            mentions: [user1, user2]
        }, { quoted: m })
    }

    await m.react(percent >= 70 ? '💗' : percent >= 40 ? '🌸' : '💔')
}

handler.help = ['ship @user', 'ship @user1 @user2']
handler.tags = ['fun', 'anime']
handler.command = ['ship', 'shipear', 'pareja']

export default handler
