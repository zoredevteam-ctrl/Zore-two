import fetch from 'node-fetch'
import * as cheerio from 'cheerio'

let handler = async (m, { args, usedPrefix }) => {
    if (!global.db.data.chats[m.chat].nsfw) {
        return m.reply('🚫 El contenido NSFW está desactivado en este grupo.\n\nUn admin puede activarlo con *#nable nsfw on*')
    }

    const query = args.join(" ").trim()
    if (!query) {
        return m.reply('Ingresa el título o URL del video de XNXX.\nEjemplo: *#xnxx mia khalifa*')
    }

    try {
        const isUrl = query.includes("xnxx.com")
        if (isUrl) {
            const res = await xnxxdl(query)
            const dll = res.result.files.high || res.result.files.low
            const videoBuffer = await fetch(dll).then(r => r.buffer())

            let caption = `*XNXX - DESCARGA*\n\n` +
                          `Título: ${res.result.title}\n` +
                          `Duración: ${res.result.info.dur || 'Desconocida'}\n` +
                          `Calidad: ${res.result.info.qual || 'Desconocida'}`

            await conn.sendMessage(m.chat, {
                video: videoBuffer,
                caption: caption,
                mimetype: 'video/mp4'
            }, { quoted: m })
            return
        }

        const res = await search(query)
        const list = res.result.slice(0, 10).map((v, i) => `${i+1}. ${v.title}\n   ${v.link}`).join('\n\n')
        await m.reply(`*XNXX - BÚSQUEDA*\n\n${list}\n\nCopia la URL para descargar con #xnxx <url>`)

    } catch (e) {
        console.error(e)
        m.reply('❌ Error al procesar el comando.')
    }
}

async function xnxxdl(URL) {
    const res = await fetch(URL)
    const html = await res.text()
    const $ = cheerio.load(html)

    const title = $('meta[property="og:title"]').attr("content") || $('title').text().trim()
    let files = {}

    const script = $('script').filter((i, el) => $(el).html()?.includes('html5player')).html() || ''
    const lowMatch = script.match(/html5player\.setVideoUrlLow\('(.*?)'\)/)
    const highMatch = script.match(/html5player\.setVideoUrlHigh\('(.*?)'\)/)

    if (lowMatch) files.low = lowMatch[1]
    if (highMatch) files.high = highMatch[1]

    let info = $("span.metadata").text() || ""
    let dur = info.match(/(\d+\s?min)/i)?.[0] || 'Desconocida'
    let qual = info.match(/([0-9]{3,4}p)/i)?.[0] || 'Desconocida'

    return { result: { title, info: { dur, qual }, files } }
}

async function search(query) {
    const res = await fetch(`https://www.xnxx.com/search/\( {encodeURIComponent(query)}/ \){Math.floor(Math.random() * 3) + 1}`)
    const html = await res.text()
    const $ = cheerio.load(html)
    const results = []

    $('div.mozaique div.thumb-under').each((i, el) => {
        const href = $(el).find('a').attr('href')
        if (!href) return
        const url = 'https://www.xnxx.com' + href
        const title = $(el).find('a').attr('title') || $(el).find('span').text().trim() || 'Sin título'
        results.push({ title, link: url })
    })

    return { result: results }
}

handler.help = ['xnxx <título o url>']
handler.tags = ['nsfw']
handler.command = ['xnxx']
handler.nsfw = true

export default handler