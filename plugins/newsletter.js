// ╔══════════════════════════════════════════════════════════════╗
// ║              NEWSLETTER & RCANAL — ZERO TWO                 ║
// ║                  power by ZoreDevTeam                       ║
// ╚══════════════════════════════════════════════════════════════╝

import { database } from '../lib/database.js'

const plugin = async (m, { conn, args, isOwner, isROwner, prefix }) => {
    const sub = args[0]?.toLowerCase()

    // ─── ENVIAR TEXTO AL CANAL ─────────────────────────────────────────
    if (sub === 'send') {
        if (!isOwner) return m.reply('👑 *Solo el owner puede enviar al canal.*')
        const texto = args.slice(1).join(' ')
        if (!texto) return m.reply(`❌ Uso: *${prefix}newsletter send <mensaje>*`)
        await global.sendToChannel(conn, texto, database.data)
        return m.reply('✅ Mensaje enviado al canal.')
    }

    // ─── REENVIAR MENSAJE CITADO AL CANAL ─────────────────────────────
    if (sub === 'forward') {
        if (!isOwner) return m.reply('👑 *Solo el owner puede reenviar al canal.*')
        if (!m.quoted) return m.reply(`❌ Cita el mensaje a reenviar.`)
        const qType = m.quoted.mtype

        if (qType === 'conversation' || qType === 'extendedTextMessage') {
            await global.sendToChannel(conn, m.quoted.body || '', database.data)
        } else if (qType === 'imageMessage' || qType === 'videoMessage') {
            const media = await conn.downloadMediaMessage(m.quoted)
            const type  = qType === 'imageMessage' ? 'image' : 'video'
            await global.sendWithCtx(conn, global.newsletterJid, {
                [type]: media,
                caption: m.quoted.msg?.caption || ''
            }, database.data)
        } else {
            return m.reply('⚠️ Tipo de mensaje no soportado.')
        }
        return m.reply('✅ Mensaje reenviado al canal.')
    }

    // ─── OBTENER JID DEL CANAL AUTOMÁTICAMENTE ───────────────────────
    if (sub === 'jid') {
        if (!isROwner) return m.reply('👑 *Solo el root owner puede usar esto.*')
        try {
            const inviteCode = global.rcanal.split('/').pop()
            const metadata   = await conn.newsletterMetadata('invite', inviteCode)
            const jid        = metadata?.id || 'No encontrado'
            return m.reply(
                `📡 *JID del canal:*\n\`${jid}\`\n\n` +
                `Ponlo en settings.js:\n\`global.newsletterJid = '${jid}'\``
            )
        } catch (e) {
            return m.reply(`❌ Error: ${e.message}`)
        }
    }

    // ─── MENÚ ──────────────────────────────────────────────────────────
    await global.sendWithCtx(conn, m.chat, {
        text:
`╭──────────────────────────╮
│  💗 *NEWSLETTER ZERO TWO* 💗  │
╰──────────────────────────╯

📡 *Canal:* ${global.rcanal}
🏷️ *JID:* \`${global.newsletterJid}\`

*Comandos:*
› *${prefix}newsletter send* _<texto>_ — Enviar al canal
› *${prefix}newsletter forward* — Reenviar mensaje citado
› *${prefix}newsletter jid* — Obtener JID automático
› *${prefix}rcanal* — Info del canal

> ${global.dev}`
    }, database.data, { quoted: m })
}

plugin.command     = ['newsletter', 'nl']
plugin.description = 'Gestión del canal/newsletter de Zero Two'
plugin.owner       = false
plugin.group       = false
plugin.private     = false
plugin.register    = false
plugin.premium     = false
plugin.limit       = false

export default plugin