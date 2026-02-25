let handler = async (m, { conn, args }) => {
    const text = args.join(' ')

    let icons = 'https://causas-files.vercel.app/fl/9vs2.jpg'

    if (!text) return m.reply('💗 Darling, ingresa un enlace de grupo, comunidad o canal~')

    const groupUrl = text.match(/(?:https?:\/\/)?(?:chat\.whatsapp\.com\/)([0-9A-Za-z]{22,24})/i)?.[1]
    const channelUrl = text.match(/(?:https?:\/\/)?(?:whatsapp\.com\/channel\/)([0-9A-Za-z@.]+)/i)?.[1]

    let caption = ''
    let thumb = icons
    let sourceUrl = 'https://github.com/zoredevteam-ctrl/Zore-two'

    if (channelUrl) {
        try {
            const info = await conn.newsletterMetadata('invite', channelUrl).catch(() => null)
            if (!info) return m.reply('💔 No encontré info del canal, darling... verifica el enlace~')

            const id = info.id || 'No encontrado'
            const nombre = info.name || 'Sin nombre'
            const descripcion = info.description || 'Sin descripción'
            const suscriptores = info.subscriberCount ?? 'No disponible'
            const verificado = info.verified ? '✅ Verificado' : '❌ No verificado'

            try {
                thumb = info.picture?.directPath
                    ? `https://mmg.whatsapp.net${info.picture.directPath}`
                    : icons
            } catch { thumb = icons }

            sourceUrl = `https://whatsapp.com/channel/${channelUrl}`

            caption = `📢 *INFORMACIÓN DEL CANAL*\n\n` +
                `🪪 *Nombre:* ${nombre}\n` +
                `🆔 *ID:* ${id}\n` +
                `👥 *Suscriptores:* ${suscriptores}\n` +
                `${verificado}\n` +
                `📝 *Descripción:* ${descripcion}`

        } catch (e) {
            console.error(e)
            return m.reply('💔 Error al obtener info del canal, darling~')
        }

    } else if (groupUrl) {
        try {
            const info = await conn.groupGetInviteInfo(groupUrl).catch(() => null)
            if (!info) return m.reply('💔 No encontré info del grupo, darling... verifica el enlace~')

            const id = info.id || 'No encontrado'
            const nombre = info.subject || 'Sin nombre'
            const descripcion = info.desc || 'Sin descripción'
            const participantes = info.size ?? info.participants?.length ?? 'No disponible'
            const tipo = info.isCommunity ? '🏘️ Comunidad' : '👥 Grupo'
            const creacion = info.creation
                ? new Date(info.creation * 1000).toLocaleDateString('es-ES')
                : 'No disponible'

            try {
                thumb = await conn.profilePictureUrl(info.id, 'image').catch(() => icons)
            } catch { thumb = icons }

            sourceUrl = `https://chat.whatsapp.com/${groupUrl}`

            caption = `${tipo === '🏘️ Comunidad' ? '🏘️ *INFORMACIÓN DE LA COMUNIDAD*' : '👥 *INFORMACIÓN DEL GRUPO*'}\n\n` +
                `📛 *Nombre:* ${nombre}\n` +
                `🆔 *ID:* ${id}\n` +
                `👥 *Participantes:* ${participantes}\n` +
                `📅 *Creado:* ${creacion}\n` +
                `📝 *Descripción:* ${descripcion}`

        } catch (e) {
            console.error(e)
            return m.reply('💔 Error al obtener info del grupo, darling~')
        }

    } else {
        return m.reply('💔 No detecté un enlace válido de grupo, comunidad o canal, darling~')
    }

    await conn.sendMessage(m.chat, {
        text: caption,
        contextInfo: {
            externalAdReply: {
                title: '🔍 Inspector de WhatsApp',
                body: 'Grupos • Comunidades • Canales',
                thumbnailUrl: thumb,
                sourceUrl: sourceUrl,
                mediaType: 1,
                showAdAttribution: false,
                renderLargerThumbnail: false
            }
        }
    }, { quoted: m })
}

handler.tags = ['herramientas']
handler.help = ['inspect <enlace>', 'inspeccionar <enlace>']
handler.command = ['inspect', 'inspeccionar']

export default handler