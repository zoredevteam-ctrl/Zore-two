// ─── PLUGIN: Inactivos ───────────────────────────────────────────────────────
// Carpeta: plugins/inactivos.js

import { database } from '../lib/database.js'

// Guarda temporalmente la lista de inactivos por grupo para confirmar expulsión
const pendingKick = new Map()

let handler = async (m, { conn, isAdmin, isOwner, db }) => {
    if (!m.isGroup) return m.reply('💔 Solo funciona en grupos darling~')
    if (!isAdmin && !isOwner) return m.reply('💔 Solo admins y owner pueden usar este comando')

    await m.react('⌛')

    const DIAS_INACTIVO = 7 // Días sin enviar mensajes para ser considerado inactivo

    const group = await conn.groupMetadata(m.chat)
    const participants = group.participants

    // ─── LEER MENSAJES DE LA DB ───────────────────────────────────────
    const ahora = Date.now()
    const limiteTiempo = DIAS_INACTIVO * 24 * 60 * 60 * 1000

    const inactivos = []

    for (const p of participants) {
        if (p.admin) continue // Ignorar admins
        if (p.id === conn.user.id) continue // Ignorar al bot

        // Ignorar owners
        const owners = Array.isArray(global.owner) ? global.owner : []
        const ownerNums = owners.map(o => (Array.isArray(o) ? o[0] : o).replace(/\D/g, ''))
        if (ownerNums.includes(p.id.replace(/\D/g, ''))) continue

        const userData = db.users?.[p.id]
        const lastMsg = userData?.lastMessage || userData?.registered_time || 0

        // Si nunca mandó mensaje o lleva más de X días sin mandar
        if (!lastMsg || (ahora - lastMsg) > limiteTiempo) {
            const diasSinMensaje = lastMsg
                ? Math.floor((ahora - lastMsg) / (1000 * 60 * 60 * 24))
                : null
            const mensajesPorDia = userData?.messageCount
                ? (userData.messageCount / Math.max(1, Math.floor((ahora - (userData.joinedAt || ahora)) / (1000 * 60 * 60 * 24)))).toFixed(1)
                : '0'

            inactivos.push({
                id: p.id,
                dias: diasSinMensaje,
                mensajesPorDia
            })
        }
    }

    if (inactivos.length === 0) {
        await m.react('✅')
        return m.reply(`✅ No hay usuarios inactivos (más de ${DIAS_INACTIVO} días sin mensajes) en este grupo.`)
    }

    // ─── GUARDAR PENDIENTE ────────────────────────────────────────────
    pendingKick.set(m.chat, {
        ids: inactivos.map(i => i.id),
        requestedBy: m.sender,
        time: ahora
    })

    // Limpiar pendientes viejos después de 5 minutos
    setTimeout(() => pendingKick.delete(m.chat), 5 * 60 * 1000)

    // ─── NEWSLETTER ───────────────────────────────────────────────────
    let thumbnail = null
    try { thumbnail = await global.getBannerBuffer(db) } catch {}

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

    // ─── ARMAR MENSAJE ────────────────────────────────────────────────
    let txt = `⚠️ *${inactivos.length} USUARIOS INACTIVOS DETECTADOS*\n`
    txt += `_(Sin mensajes hace más de ${DIAS_INACTIVO} días)_\n\n`

    for (const u of inactivos) {
        const diasTxt = u.dias !== null ? `${u.dias} días sin escribir` : 'Nunca ha escrito'
        txt += `• @${u.id.split('@')[0]} — ${diasTxt} · ${u.mensajesPorDia} msg/día\n`
    }

    txt += `\n📊 *El bot lee todos los mensajes del grupo desde que entró.*\n`
    txt += `_Estos datos son acumulados desde que el bot está en el grupo._\n\n`
    txt += `✦ Responde *si* para expulsarlos ahora.\n`
    txt += `✦ Responde *no* para cancelar.`

    await conn.sendMessage(m.chat, {
        text: txt,
        mentions: inactivos.map(i => i.id),
        contextInfo
    }, { quoted: m })

    await m.react('✅')
}

// ─── CONFIRMAR EXPULSIÓN ──────────────────────────────────────────────────────
handler.before = async (m, { conn, isAdmin, isOwner, isBotAdmin }) => {
    if (!m.isGroup) return true
    if (!m.text) return true

    const pending = pendingKick.get(m.chat)
    if (!pending) return true

    // Solo quien pidió el comando puede confirmar
    if (m.sender !== pending.requestedBy) return true

    const txt = m.text.trim().toLowerCase()

    if (txt === 'si' || txt === 'sí') {
        if (!isBotAdmin) {
            await m.reply('❌ No puedo expulsar, necesito ser admin del grupo.')
            pendingKick.delete(m.chat)
            return false
        }

        await m.react('⌛')
        let expulsados = 0
        let fallidos = 0

        for (const id of pending.ids) {
            try {
                await conn.groupParticipantsUpdate(m.chat, [id], 'remove')
                expulsados++
                await new Promise(r => setTimeout(r, 500)) // Delay para no ser baneado
            } catch {
                fallidos++
            }
        }

        pendingKick.delete(m.chat)
        await m.react('✅')
        return m.reply(`✅ *Expulsión completada*\n\n✦ Expulsados: ${expulsados}\n✦ Fallidos: ${fallidos}`)
    }

    if (txt === 'no') {
        pendingKick.delete(m.chat)
        await m.react('❌')
        return m.reply('❌ Expulsión cancelada.')
    }

    return true
}

handler.help = ['inactivos']
handler.tags = ['group']
handler.command = ['inactivos']
handler.group = true
handler.admin = true

export default handler
