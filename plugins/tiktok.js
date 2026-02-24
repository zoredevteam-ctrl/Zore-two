import fetch from 'node-fetch'

export default async function tiktok(client, m, args) {

  if (!m.text.startsWith('.tt') && !m.text.startsWith('/tt') && !m.text.startsWith('#tt')) {
    return
  }

  if (!args[0]) {
    return m.reply('💗 Envíame un enlace de TikTok.')
  }

  const api = global.apiConfigs.stellar
  const url = args[0]

  try {

    const res = await fetch(
      `${api.baseUrl}/downloader/tiktok?url=${encodeURIComponent(url)}&key=${api.key}`
    )

    const json = await res.json()

    if (!json.status) {
      return m.reply('💗 No pude descargar ese video.')
    }

    const data = json.data
    const video = data?.dl || data?.video || data?.url

    if (!video) {
      return m.reply('💗 No se encontró el video.')
    }

    await client.sendMessage(m.chat, {
      video: { url: video },
      caption: `💗 ${data.title || 'TikTok descargado'}`
    }, { quoted: m })

  } catch (err) {
    console.log(err)
    m.reply('💗 Darling Dame pene por fis error.')
  }
}