// ╔══════════════════════════════════════════════════════════════╗
// ║              NEWSLETTER & RCANAL — FLASH BOT MD                 ║
// ║                  power by 𝖍𝖆𝖎𝖙𝖍𝖆𝖒                       ║
// ╚══════════════════════════════════════════════════════════════╝

import { database } from '../lib/database.js'

const plugin = async (m, { conn, args, isOwner, isROwner, prefix }) => {
    const sub = args[0]?.toLowerCase()

    // ─── ENVIAR TEXTO AL CANAL ─────────────────────────────────────────
    if (sub === 'send') {
        if (!isOwner) return m.reply('👑 *المالك بس اللي يبعت للقناة.*')
        const texto = args.slice(1).join(' ')
        if (!texto) return m.reply(`❌ Uso: *${prefix}newsletter send <رسالة>*`)
        await global.sendToChannel(conn, texto, database.data)
        return m.reply('✅ الرسالة اتبعتت للقناة.')
    }

    // ─── REENVIAR MENSAJE CITADO AL CANAL ─────────────────────────────
    if (sub === 'forward') {
        if (!isOwner) return m.reply('👑 *المالك بس اللي يعيد الإرسال للقناة.*')
        if (!m.quoted) return m.reply(`❌ اقتبس الرسالة اللي هتعيد إرسالها.`)
        const qType = m.quoted.mtype

        if (qType === 'conversation' || qType === 'extendedTextMessage') {
            await global.sendToChannel(conn, m.quoted.body || '', database.data)
        } else if (qType === 'imageMessage' || qType === 'فيديوMessage') {
            const media = await conn.downloadMediaMessage(m.quoted)
            const type  = qType === 'imageMessage' ? 'image' : 'فيديو'
            await global.sendWithCtx(conn, global.newsletterJid, {
                [type]: media,
                caption: m.quoted.msg?.caption || ''
            }, database.data)
        } else {
            return m.reply('⚠️ نوع الرسالة مش مدعوم.')
        }
        return m.reply('✅ الرسالة اتعادت للقناة.')
    }

    // ─── OBTENER JID DEL CANAL AUTOMÁTICAMENTE ───────────────────────
    if (sub === 'jid') {
        if (!isROwner) return m.reply('👑 *المالك الرئيسي بس اللي يستخدم ده.*')
        try {
            const inviteCode = global.rcanal.split('/').pop()
            const metadata   = await conn.newsletterMetadata('invite', inviteCode)
            const jid        = metadata?.id || 'مش موجود'
            return m.reply(
                `📡 *JID القناة:*\n\`${jid}\`\n\n` +
                `Ponlo en settings.js:\n\`global.newsletterJid = '${jid}'\``
            )
        } catch (e) {
            return m.reply(`❌ خطأ: ${e.message}`)
        }
    }

    // ─── MENÚ ──────────────────────────────────────────────────────────
    await global.sendWithCtx(conn, m.chat, {
        text:
`╭──────────────────────────╮
│  💗 *قناة FLASH BOT MD* 💗  │
╰──────────────────────────╯

📡 *Canal:* ${global.rcanal}
🏷️ *JID:* \`${global.newsletterJid}\`

*Comandos:*
› *${prefix}newsletter send* _<texto>_ — Enviar al canal
› *${prefix}newsletter forward* — Reenviar رسالة citado
› *${prefix}newsletter jid* — Obtener JID automático
› *${prefix}rcanal* — Info del canal

> ${global.dev}`
    }, database.data, { quoted: m })
}

plugin.command     = ['newsletter', 'nl']
plugin.description = 'إدارة قناة Flash Bot MD'
plugin.owner       = false
plugin.group       = false
plugin.private     = false
plugin.register    = false
plugin.premium     = false
plugin.limit       = false

export default plugin