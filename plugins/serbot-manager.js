// 💗 ── Z E R O  T W O  S Y S T E M ── 💗
// ✦ [ PROTOCOLO GESTOR SUB-BOTS ]
// ⟡ ZoreDevTeam

import ws from 'ws'
import { existsSync } from 'fs'
import { promises as fsp } from 'fs'
import path from 'path'

const SUBBOT_DIR = global.jadi || 'JadiBots'

const getThumb = async () => {
    try {
        const src = global.icon || global.avatar || global.banner
        if (!src) return null
        return Buffer.from(await (await fetch(src)).arrayBuffer())
    } catch { return null }
}

const sendStyled = async (conn, m, text, mentions = []) => {
    const thumb = await getThumb()
    try {
        return conn.sendMessage(m.chat, {
            text, mentions,
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
                    thumbnail:             thumb,
                    sourceUrl:             global.rcanal,
                    mediaType:             1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m })
    } catch { return m.reply(text) }
}

const msToStr = ms => {
    if (!ms || ms < 1000) return 'recién ahora~'
    const parts = []
    const d = Math.floor(ms / 86400000); if (d) parts.push(`${d}d`)
    const h = Math.floor(ms / 3600000) % 24; if (h) parts.push(`${h}h`)
    const mi = Math.floor(ms / 60000) % 60; if (mi) parts.push(`${mi}m`)
    const s = Math.floor(ms / 1000) % 60; if (s) parts.push(`${s}s`)
    return parts.join(' ') || 'ahora~'
}

const handler = async (m, { conn, command, isOwner }) => {
    const cmd = command.toLowerCase()

    // ── #bots — ver sub-bots activos ──────────────────────────────────────
    if (['bots', 'sockets', 'socket'].includes(cmd)) {
        const active = (global.conns || []).filter(c =>
            c?.user && c?.ws?.socket?.readyState !== ws.CLOSED
        )

        if (!active.length) {
            return sendStyled(conn, m,
                `╔══「 💗 𝒁𝒆𝒓𝒐 𝑻𝒘𝒐 · Sub-Bots 」══╗\n\n` +
                `꒰ 💤 ꒱ No hay sub-bots activos ahora~\n` +
                `꒰ 🌸 ꒱ Usa *#code +número* para crear uno, Darling~\n\n` +
                `╚══「 💕 © ZoreDevTeam 」══╝`
            )
        }

        const medals = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩']
        const lista = active.map((c, i) => {
            const num    = c.user?.jid?.split('@')[0] || c._number || '?'
            const nombre = c.user?.name || 'Sin nombre'
            const reg    = global.subBotRegistry?.get(c._number)
            const uptime = reg?.connectedAt ? msToStr(Date.now() - reg.connectedAt) : '?'
            return `  ${medals[i] || `${i+1}.`} *${nombre}*\n     📱 +${num}\n     ⏱️ Activo: ${uptime}`
        }).join('\n\n')

        return sendStyled(conn, m,
            `╔══「 💗 Sub-Bots Activos 」══╗\n\n` +
            `꒰ 📊 ꒱ Total: *${active.length}/${global.subbotlimitt || 10}*\n\n` +
            `${lista}\n\n` +
            `╚══「 💕 © ZoreDevTeam 」══╝`
        )
    }

    // ── #deletesesion — eliminar sesión ────────────────────────────────────
    if (['deletesesion', 'deletebot', 'deletesession'].includes(cmd)) {
        const who   = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
        const num   = who.split('@')[0].split(':')[0]
        const dir   = path.join(SUBBOT_DIR, num)

        if (!existsSync(dir)) {
            return sendStyled(conn, m,
                `╔══「 💗 𝒁𝒆𝒓𝒐 𝑻𝒘𝒐 · Sub-Bot 」══╗\n\n` +
                `꒰ 🚫 ꒱ No encontré sesión para *+${num}*, Darling~\n` +
                `꒰ 🌸 ꒱ Usa *#code +número* para crear una.\n\n` +
                `╚══「 💕 © ZoreDevTeam 」══╝`
            )
        }

        // Desconectar socket si está activo
        const sock = (global.conns || []).find(c => c._number === num)
        if (sock) {
            try { sock.ws.close() } catch {}
            global.conns = global.conns.filter(c => c._number !== num)
            global.subBotRegistry?.delete(num)
        }

        await m.react('🗑️')
        try {
            await fsp.rm(dir, { recursive: true, force: true })
            global.subLocks?.delete(num)
        } catch {}

        return sendStyled(conn, m,
            `╔══「 💗 𝒁𝒆𝒓𝒐 𝑻𝒘𝒐 · Sub-Bot 」══╗\n\n` +
            `꒰ ✅ ꒱ Sesión de *+${num}* eliminada, Darling~\n` +
            `꒰ 🌸 ꒱ ¡Todo limpio! 💗\n\n` +
            `╚══「 💕 © ZoreDevTeam 」══╝`
        )
    }

    // ── #stop — pausar sub-bot actual ──────────────────────────────────────
    if (['stop', 'pausarai', 'pausarbot'].includes(cmd)) {
        if (conn.user?.jid === global.conn?.user?.jid) {
            return sendStyled(conn, m,
                `╔══「 💗 𝒁𝒆𝒓𝒐 𝑻𝒘𝒐 · Error 」══╗\n\n` +
                `꒰ 🚫 ꒱ ¡No puedo pausar al bot principal, Darling~! 😤\n\n` +
                `╚══「 💕 © ZoreDevTeam 」══╝`
            )
        }

        await sendStyled(conn, m,
            `╔══「 💗 𝒁𝒆𝒓𝒐 𝑻𝒘𝒐 · Sub-Bot 」══╗\n\n` +
            `꒰ 🔕 ꒱ Sub-bot pausado~ Hasta luego, Darling 💔\n\n` +
            `╚══「 💕 © ZoreDevTeam 」══╝`
        )
        try { conn.ws.close() } catch {}
    }
}

handler.help    = ['bots', 'deletesesion', 'stop']
handler.tags    = ['serbot']
handler.command = [
    'bots', 'sockets', 'socket',
    'deletesesion', 'deletebot', 'deletesession',
    'stop', 'pausarai', 'pausarbot'
]
export default handler
