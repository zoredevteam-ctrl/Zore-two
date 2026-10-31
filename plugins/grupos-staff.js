let handler = async (m, { conn }) => {
    // Reaccionamos al comando para darle un toque interactivo
    await m.react('👑')

    try {
        // 1. Obtenemos la información del grupo
        const groupMetadata = await conn.groupMetadata(m.chat)
        const groupName = groupMetadata.subject
        const participants = groupMetadata.participants
        
        // 2. Filtramos solo a los que son administradores
        const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin')
        const adminJids = admins.map(a => a.id)

        // 3. Intentamos obtener la foto del grupo
        let pp
        try {
            pp = await conn.profilePictureUrl(m.chat, 'image')
        } catch {
            // Si el grupo no tiene foto o hay un error, usamos esta imagen por defecto
            pp = 'https://i.ibb.co/WPnWnBR/avatar-contact.png' 
        }

        // 4. Construimos el mensaje con la estética de Flash Bot MD
        let texto = `✦ 𝕗𝕝𝕒𝕤𝕙 𝔹𝕠𝕥-𝕄𝔻\n\n`
        texto += `👑 *طاقم الجروب*\n`
        texto += `💠 *${groupName}*\n\n`
        texto += `> *Administradores:*\n`

        // Listamos a los admins mencionándolos
        admins.forEach((admin, i) => {
            texto += ` ${i + 1}.- @${admin.id.split('@')[0]}\n`
        })

        texto += `\n> 𝓩0𝓡𝓣 𝓢𝓨𝓢𝓣𝓔𝓜𝓢`

        // 5. Enviamos la imagen con el texto y las menciones
        await conn.sendMessage(m.chat, {
            image: { url: pp },
            caption: texto,
            mentions: adminJids
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        await m.reply('❌ حصل خطأ وأنا بحاول أجيب قائمة الأدمنز.')
    }
}

handler.help = ['staff', 'admins']
handler.tags = ['group']
handler.command = ['staff', 'admins', 'listadmin']
handler.group = true // Obliga a que solo se use en grupos

export default handler
