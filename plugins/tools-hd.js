import axios from 'axios'
import FormData from 'form-data'

let handler = async (m, { conn, usedPrefix, command }) => {
    // 1. Verificar si hay una imagen o si se está respondiendo a una
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!mime) throw `🌸 *¡Darling, necesito una imagen!* 🌸\n\nResponde a una foto o envía una con el comando *${usedPrefix + command}*`
    if (!/image\/(jpe?g|png)/.test(mime)) throw `⚠️ El formato *${mime}* no es compatible. Solo fotos, darling.`

    // Reacción de espera
    await m.react('⏳')
    await m.reply('✨ *Mejorando la calidad... espera un momento, darling.*')

    try {
        // 2. Descargar la imagen
        let img = await q.download()
        
        // 3. Enviar a la API de mejora (usando un servicio público gratuito)
        // Usamos la API de 'inference' que es común en estos bots
        let formData = new FormData()
        formData.append('image', img, { filename: 'enhance.jpg' })

        // Usamos una de las APIs más estables para bots de WhatsApp
        let response = await axios.post('https://api.boxi.bot/api/remini', formData, {
            headers: {
                ...formData.getHeaders(),
            },
            responseType: 'arraybuffer'
        })

        if (!response.data) throw 'Error en el servidor de mejora.'

        // 4. Enviar el resultado
        await conn.sendFile(m.chat, response.data, 'hd.jpg', '💗 *¡Aquí tienes tu imagen en HD, darling!* 🌸', m)
        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('💔 *Lo siento darling, el servidor está ocupado o falló.* Inténtalo de nuevo en unos minutos.')
    }
}

handler.help = ['hd', 'remini', 'upscale']
handler.tags = ['tools']
handler.command = ['hd', 'remini', 'upscale', 'mejorar'] // Responde a todos estos
handler.register = true

export default handler
