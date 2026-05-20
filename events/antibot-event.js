// ─── EVENTO: AntiBot ─────────────────────────────────────────────────────────
// Carpeta: events/antibot-event.js

import { database } from '../lib/database.js'

export const event = 'group-participants.update'

export const run = async (conn, update) => {
    try {
        const { id, participants, action } = update
        if (action !== 'add') return

        const chat = database.data.groups?.[id]
        if (!chat?.antibot) return

        // ─── IGNORAR OWNERS ───────────────────────────────────────────
        const owners = Array.isArray(global.owner) ? global.owner : []
        const ownerNums = owners.map(o => (Array.isArray(o) ? o[0] : o).replace(/\D/g, ''))

        for (const participant of participants) {
            // Ignorar al bot mismo
            if (participant === conn.user.id) continue
            if (participant.split(':')[0] + '@s.whatsapp.net' === conn.user.id) continue

            // Ignorar owners
            if (ownerNums.includes(participant.replace(/\D/g, ''))) continue

            // Verificar si es admin del grupo
            try {
                const meta = await conn.groupMetadata(id)
                const clean = v => (v || '').split('@')[0].split(':')[0]
                const p = meta.participants.find(x => clean(x.jid || x.id) === clean(participant))
                if (p?.admin) continue
            } catch {}

            const number = participant.split('@')[0]

            // ─── DETECCIÓN DE BOT ─────────────────────────────────────
            // 1. Nombre contiene palabras de bot
            let name = ''
            try {
                const info = await conn.onWhatsApp(participant)
                name = info?.[0]?.notify || ''
            } catch {}

            const nombreEsBot = /bot|robot|baileys|whatsappbot|spam/i.test(name)

            // 2. Número con dígitos repetitivos (ej: 55555555)
            const numeroRepetitivo = /([0-9])\1{5,}/.test(number)

            // 3. Número demasiado corto
            const numeroCorto = number.length < 9

            const esBot = nombreEsBot || numeroRepetitivo || numeroCorto

            if (!esBot) continue

            // ─── EXPULSAR ─────────────────────────────────────────────
            try {
                await conn.groupParticipantsUpdate(id, [participant], 'remove')
            } catch (e) {
                console.log('[ANTIBOT] Error al expulsar:', e.message)
                continue
            }

            // ─── NEWSLETTER ───────────────────────────────────────────
            let thumbnail = null
            try { thumbnail = await global.getBannerBuffer(database.data) } catch {}

            const contextInfo = {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.newsletterJid,
                    serverMessageId: '',
                    newsletterName: global.newsletterName
                },
                ...(thumbnail ? {
                    externalAdReply: {
                        title: global.botName,
                        body: global.botText,
                        thumbnail,
                        sourceUrl: global.rcanal,
                        mediaType: 1,
                        renderLargerThumbnail: false,
                        showAdAttribution: true,
                        ...(global.icon ? { thumbnailUrl: global.icon } : {})
                    }
                } : {})
            }

            await conn.sendMessage(id, {
                text: `🌸💗 *¡KYAAAAAH! ¡BOT DETECTADO Y EXPULSADO!* 💗🌸\n\n¡No quiero ningún robot imitador en *mi* paraíso rosado!!\nSolo acepto darlings humanos que me quieran de verdad... ¡tú no eres real!\n\n¡Fuera de aquí @${number}! Vuelve cuando seas una persona de carne y hueso, kyaaah~ 🌷💗`,
                mentions: [participant],
                contextInfo
            })
        }
    } catch (e) {
        console.error('[ANTIBOT EVENT ERROR]', e.message)
    }
}
