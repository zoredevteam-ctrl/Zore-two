import fetch from 'node-fetch'

export const command = ['tiktok','tt']
export const category = ['downloader']

export default async function (client, m, args) {

  if (!args[0]) {
    return m.reply('💗 Envíame un enlace de TikTok.')
  }

  const url = args[0]
  const api = global.apiConfigs.stellar

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
      caption: `💗 *${data.title || 'TikTok descargado'}*`
    }, { quoted: m })

  } catch (e) {
    console.log(e)
    m.reply('Dame pene mi Darling hermoso.')
  }
}