let handler = async (m, { conn, args }) => {
    const text = args.join(' ')

    let icons = 'https://causas-files.vercel.app/fl/9vs2.jpg'

    if (!text) return m.reply('💗 يا حبيبي، اكتب لينك جروب أو مجتمع أو قناة~')

    const groupUrl = text.match(/(?:https?:\/\/)?(?:chat\.whatsapp\.com\/)([0-9A-Za-z]{22,24})/i)?.[1]
    const channelUrl = text.match(/(?:https?:\/\/)?(?:whatsapp\.com\/channel\/)([0-9A-Za-z@.]+)/i)?.[1]

    let caption = ''
    let thumb = icons
    let sourceUrl = 'https://github.com/dwhhhg8-code/Zore-two'

    if (channelUrl) {
        try {
            const info = await conn.newsletterMetadata('invite', channelUrl).catch(() => null)
            if (!info) return m.reply('💔 مالقيتش معلومات القناة، حبيبي... اتأكد من اللينك~')

            const id = info.id || 'مش موجود'
            const nombre = info.name || 'بدون اسم'
            const descripcion = info.description || 'بدون وصف'
            const suscriptores = info.subscriberCount ?? 'مش متاح'
            const verificado = info.verified ? '✅ Verificado' : '❌ مش موثّق'

            try {
                thumb = info.picture?.directPath
                    ? `https://mmg.whatsapp.net${info.picture.directPath}`
                    : icons
            } catch { thumb = icons }

            sourceUrl = `https://whatsapp.com/channel/${channelUrl}`

            caption = `📢 *معلومات القناة*\n\n` +
                `🪪 *الاسم:* ${nombre}\n` +
                `🆔 *ID:* ${id}\n` +
                `👥 *Suscriptores:* ${suscriptores}\n` +
                `${verificado}\n` +
                `📝 *الوصف:* ${descripcion}`

        } catch (e) {
            console.error(e)
            return m.reply('💔 خطأ في جلب معلومات القناة، حبيبي~')
        }

    } else if (groupUrl) {
        try {
            const info = await conn.groupGetInviteInfo(groupUrl).catch(() => null)
            if (!info) return m.reply('💔 مالقيتش معلومات الجروب يا حبيبي... اتأكد من اللينك~')

            const id = info.id || 'مش موجود'
            const nombre = info.subject || 'بدون اسم'
            const descripcion = info.desc || 'بدون وصف'
            const participantes = info.size ?? info.participants?.length ?? 'مش متاح'
            const tipo = info.isCommunity ? '🏘️ Comunidad' : '👥 جروب'
            const creacion = info.creation
                ? new Date(info.creation * 1000).toLocaleDateString('ar-EG')
                : 'مش متاح'

            try {
                thumb = await conn.profilePictureUrl(info.id, 'image').catch(() => icons)
            } catch { thumb = icons }

            sourceUrl = `https://chat.whatsapp.com/${groupUrl}`

            caption = `${tipo === '🏘️ Comunidad' ? '🏘️ *INFORMACIÓN DE LA COMUNIDAD*' : '👥 *INFORMACIÓN DEL GRUPO*'}\n\n` +
                `📛 *الاسم:* ${nombre}\n` +
                `🆔 *ID:* ${id}\n` +
                `👥 *Participantes:* ${participantes}\n` +
                `📅 *Creado:* ${creacion}\n` +
                `📝 *الوصف:* ${descripcion}`

        } catch (e) {
            console.error(e)
            return m.reply('💔 خطأ في جلب معلومات الجروب، حبيبي~')
        }

    } else {
        return m.reply('💔 مش لقيت رابط صالح لجروب أو مجتمع أو قناة، حبيبي~')
    }

    await conn.sendMessage(m.chat, {
        text: caption,
        contextInfo: {
            externalAdReply: {
                title: '🔍 فاحص واتساب',
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
handler.help = ['inspect <لينك>', 'inspeccionar <لينك>']
handler.command = ['inspect', 'inspeccionar']

export default handler