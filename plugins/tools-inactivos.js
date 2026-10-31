// ─── PLUGIN: Inactivos ───────────────────────────────────────────────────────
// Carpeta: plugins/inactivos.js

import { database } from '../lib/database.js'

// تخزين مؤقت لقائمة غير النشطين في الجروب لتأكيد الطرد
const pendingKick = new Map()

let handler = async (m, { conn, isAdmin, isOwner, db }) => {
    if (!m.isGroup) return m.reply('💔 بيشتغل في الجروبات بس حبيبي~')
    if (!isAdmin && !isOwner) return m.reply('💔 الأدمنز والمالك بس اللي يستخدموا الأمر ده')

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
        return m.reply(`✅ مفيش أعضاء خاملين (أكتر من ${DIAS_INACTIVO} يوم من غير رسايل) في الجروب ده.`)
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
    txt += `_(من غير رسايل أكتر من ${DIAS_INACTIVO} يوم)_\n\n`

    for (const u of inactivos) {
        const diasTxt = u.dias !== null ? `${u.dias} يوم من غير كتابة` : 'Nunca ha escrito'
        txt += `• @${u.id.split('@')[0]} — ${diasTxt} · ${u.mensajesPorDia} رسالة/يوم\n`
    }

    txt += `\n📊 *البوت بيقرا كل رسايل الجروب من ساعة ما دخل.*\n`
    txt += `_البيانات دي متجمّعة من ساعة ما البوت دخل الجروب._\n\n`
    txt += `✦ رد *أيوه* عشان تطردهم دلوقتي.\n`
    txt += `✦ رد *لا* عشان تلغي.`

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

    if (txt === 'si' || txt === 'sí' || txt === 'نعم' || txt === 'أيوه') {
        if (!isBotAdmin) {
            await m.reply('❌ مش قادر أطرد، لازم أكون أدمن الجروب.')
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
        return m.reply(`✅ *الطرد خلص*\n\n✦ Expulsados: ${expulsados}\n✦ Fallidos: ${fallidos}`)
    }

    if (txt === 'no' || txt === 'لا') {
        pendingKick.delete(m.chat)
        await m.react('❌')
        return m.reply('❌ الطرد اتلغى.')
    }

    return true
}

handler.help = ['inactivos']
handler.tags = ['group']
handler.command = ['inactivos']
handler.group = true
handler.admin = true

export default handler
