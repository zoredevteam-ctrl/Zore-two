let handler = async (m, { conn }) => {

  const msg = m.quoted ? m.quoted : m
  const mime = msg.msg?.mimetype || ''

  if (!mime)
    return m.reply('❌ Responde a un archivo con *.cdn*')

  const esCompatible = /gif|video|image|audio/.test(mime)
  if (!esCompatible)
    return m.reply('❌ Formato no compatible. Solo gif, foto, video o audio')

  let extension
  if (/gif/.test(mime)) extension = 'gif'
  else if (/mp4|video/.test(mime)) extension = 'mp4'
  else if (/jpeg|jpg/.test(mime)) extension = 'jpg'
  else if (/png/.test(mime)) extension = 'png'
  else if (/webp/.test(mime)) extension = 'webp'
  else if (/ogg/.test(mime)) extension = 'ogg'
  else if (/mp3/.test(mime)) extension = 'mp3'
  else extension = 'bin'

  await m.reply(`⏳ Subiendo archivo *.${extension}*...`)

  try {

    const media = await msg.download()
    if (!media) throw new Error('No se pudo descargar el archivo')

    const form = new FormData()
    form.append('files', new Blob([media], { type: mime }), `archivo.${extension}`)
    form.append('expiresIn', 'never')

    const response = await fetch('https://causas-files.vercel.app/upload', {
      method: 'POST',
      body: form
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Error desconocido')

    const publicUrl = data.files?.[0]?.publicUrl
    if (!publicUrl) throw new Error('No se recibió URL pública')

    await m.reply(
      `✅ *Subido exitosamente!*\n\n` +
      `📦 *Tipo:* ${mime}\n` +
      `🔗 *URL:*\n${publicUrl}`
    )

  } catch (e) {
    await m.reply(`❌ Error al subir: ${e.message}`)
  }
}

handler.help = ['cdn']
handler.tags = ['tools']
handler.command = ['cdn']

export default handler