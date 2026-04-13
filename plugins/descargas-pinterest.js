import fetch from 'node-fetch'
import {
  generateWAMessageFromContent,
  generateWAMessage,
  delay
} from '@whiskeysockets/baileys'

async function sendAlbumMessage(conn, jid, medias, options = {}) {
    if (typeof jid !== 'string') throw new TypeError(`jid must be string, received: ${jid}`)
    if (medias.length < 2) throw new RangeError('Se necesitan al menos 2 imágenes para un álbum')

    const caption = options.text || options.caption || ''
    const delayMs = !isNaN(options.delay) ? options.delay : 500
    const quoted = options.quoted || null

    const album = generateWAMessageFromContent(
        jid,
        {
            messageContextInfo: {},
            albumMessage: { expectedImageCount: medias.length }
        },
        quoted ? { quoted } : {}
    )

    await conn.relayMessage(album.key.remoteJid, album.message, {
        messageId: album.key.id
    })

    for (let i = 0; i < medias.length; i++) {
        const { type, data } = medias[i]

        const img = await generateWAMessage(
            album.key.remoteJid,
            { [type]: data, ...(i === 0 ? { caption } : {}) },
            { upload: conn.waUploadToServer }
        )

        img.message.messageContextInfo = {
            messageAssociation: {
                associationType: 1,
                parentMessageKey: album.key
            }
        }

        await conn.relayMessage(img.key.remoteJid, img.message, {
            messageId: img.key.id
        })

        await delay(delayMs)
    }

    return album
}

let handler = async (m, { conn, args, prefix }) => {
    const text = args.join(' ')
    if (!text) return m.reply(`💗 Darling, dime qué buscar~\n> Ejemplo: ${prefix}pinterest Zero Two`)

    await m.react('⏳')
    await m.reply('🌸 Buscando imágenes en Pinterest, espera un momento~')

    try {
        const res = await fetch(`https://nex-magical.vercel.app/search/pinterest?q=${encodeURIComponent(text)}&apikey=NEX-Magicalofc`)

        if (!res.ok) throw new Error(`Error en la API: ${res.status} ${res.statusText}`)

        const data = await res.json()

        if (!data.status || !Array.isArray(data.result) || data.result.length < 2) {
            return m.reply('💔 No encontré suficientes imágenes, darling... prueba con otra búsqueda~')
        }

        const images = data.result.slice(0, 10).map(img => ({
            type: 'image',
            data: { url: img.image_large_url }
        }))

        const caption = `🌸 *Resultados para:* ${text}\n💗 *~Zero Two*`
        await sendAlbumMessage(conn, m.chat, images, { caption, quoted: m })
        await m.react('✅')
    } catch (error) {
        console.error('Error en pinterest:', error)
        await m.react('💔')
        await m.reply(`💔 Darling, algo salió mal... [Error: ${error.message}]`)
    }
}

handler.help = ['pinterest <query>']
handler.tags = ['misc']
handler.command = ['pinterest', 'pin']

export default handler