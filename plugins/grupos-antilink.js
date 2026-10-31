import { database } from '../lib/database.js'

// Expresión regular para detectar enlaces de grupos de WhatsApp
const linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i

let handler = async (m, { conn, isAdmin, isBotAdmin, text }) => {
    if (!m.isGroup) return
    
    // Configuración en base de datos
    if (!database.data.groups[m.chat]) database.data.groups[m.chat] = {}
    if (typeof database.data.groups[m.chat].antilink === 'undefined') {
        database.data.groups[m.chat].antilink = false
    }

    // Comando para activar/desactivar: #antilink on/off
    if (isAdmin && (text === 'on' || text === 'off')) {
        database.data.groups[m.chat].antilink = (text === 'on')
        return m.reply(`✦ 𝕗𝕝𝕒𝕤𝕙 𝔹𝕠𝕥-𝕄𝔻\n\n🛡️ *Anti-Link ${text === 'on' ? 'Activado' : 'Desactivado'}*\n${text === 'on' ? 'Expulsaré a cualquiera que envíe enlaces de grupos.' : 'Ya pueden enviar enlaces con libertad.'}`)
    }

    // Lógica de detección
    const isGroupLink = linkRegex.test(m.body)
    
    if (isGroupLink && database.data.groups[m.chat].antilink) {
        if (isAdmin) return m.reply('🛡️ *Anti-Link:* انت أدمن، مش هطردك بس بلاش سپام، حبيبي~')
        if (!isBotAdmin) return m.reply('⚠️ أنا مش أدمن، مش قادر أطرد السپامر.')

        await m.reply(`✦ 𝕗𝕝𝕒𝕤𝕙 𝔹𝕠𝕥-𝕄𝔻\n\n🚫 *لينك مكتشف*\nسلام, حبيبي. القوانين واضحة.`)
        
        // Borrar mensaje
        await conn.sendMessage(m.chat, { delete: m.key })
        
        // Expulsar usuario
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
    }
}

handler.help = ['antilink on', 'antilink off']
handler.tags = ['group']
handler.command = ['antilink']
handler.group = true

export default handler
