import { downloadMediaMessage } from '@whiskeysockets/baileys'
import { sticker, writeExif } from '../lib/sticker.js'
import { spawn } from 'child_process'
import fs from 'fs-extra'
import { tmpdir } from 'os'
import { join } from 'path'
import Crypto from 'crypto'
import sharp from 'sharp'

const tmpFile = (ext) => join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`)

function ffRun(args) {
    return new Promise((resolve, reject) => {
        const p = spawn('ffmpeg', args)
        let err = ''
        p.stderr.on('data', d => err += d)
        p.on('close', code => code === 0 ? resolve() : reject(new Error(err.slice(-400))))
    })
}

// ── Thumbnail para newsletter ──────────────────────────────────────────────
const getThumb = async () => {
    try {
        const src = global.icon || global.avatar || global.banner
        if (!src) return null
        const res = await fetch(src)
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

const sendStyled = async (conn, m, text) => {
    try {
        const thumb = await getThumb()
        return conn.sendMessage(m.chat, {
            text,
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid:   global.newsletterJid,
                    serverMessageId: '',
                    newsletterName:  global.newsletterName
                },
                externalAdReply: {
                    title:                 global.botName,
                    body:                  global.botText,
                    mediaType:             1,
                    thumbnail:             thumb,
                    renderLargerThumbnail: false,
                    sourceUrl:             global.rcanal
                }
            }
        }, { quoted: m })
    } catch {
        return conn.sendMessage(m.chat, { text }, { quoted: m })
    }
}

async function webpToPng(buffer) {
    return sharp(buffer).png().toBuffer()
}

async function webpToGif(buffer) {
    return sharp(buffer, { animated: true }).gif().toBuffer()
}

async function addWatermarkImg(buffer, texto) {
    const tmpIn  = tmpFile('jpg')
    const tmpOut = tmpFile('jpg')
    await fs.writeFile(tmpIn, buffer)
    const safe = texto.replace(/'/g, "\\'").replace(/:/g, '\\:')
    await ffRun([
        '-y', '-i', tmpIn,
        '-vf', `drawtext=text='${safe}':fontsize=28:fontcolor=white:borderw=2:bordercolor=black:x=w-tw-18:y=h-th-18`,
        '-q:v', '2',
        tmpOut
    ])
    const result = await fs.readFile(tmpOut)
    await fs.remove(tmpIn)
    await fs.remove(tmpOut)
    return result
}

// ── Genera el packname con info de Zero Two ────────────────────────────────
const buildPackInfo = async (m, conn, customText = '') => {
    const usuario = m.pushName || m.sender.split('@')[0]
    const now     = new Date()
    const fecha   = now.toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric', year: 'numeric' })
    const hora    = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

    let grupo = 'Chat privado'
    if (m.isGroup) {
        try {
            const meta = await conn.groupMetadata(m.chat)
            grupo = meta.subject || m.chat
        } catch {}
    }

    const packname = customText ||
        `╭╼꒰🌸꒱ 𐔌 BOT - INFO\n` +
        `|✎ BOT: ${global.botName}\n` +
        `|✎ Grupo: ${grupo}\n` +
        `╰─────────────────╯`

    const author = `💗 ${usuario} · ${fecha} ${hora}`

    return { packname, author }
}

let handler = async (m, { conn, args, prefix, command }) => {
    const isWm    = /^(wm|watermark|marca)$/.test(command)
    const isToImg = /^(toimagen|toimg|s2img)$/.test(command)
    let stikerBuf = false

    try {
        let q    = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || q.mediaType || ''

        // ── STICKER → IMAGEN ──────────────────────────────────────────────
        if (isToImg) {
            if (!m.quoted) return sendStyled(conn, m,
                `╔══「 💗 Zero Two · Sticker 」══╗\n\n` +
                `꒰ ⚠️ ꒱ ¡Cita un *sticker* para convertirlo, Darling~!\n\n` +
                `╚══「 💕 © ZoreDevTeam 」══╝`
            )
            if (!/webp/.test(mime)) return sendStyled(conn, m,
                `╔══「 💗 Zero Two · Sticker 」══╗\n\n` +
                `꒰ ⚠️ ꒱ Solo funciona con *stickers* (webp), Darling~\n\n` +
                `╚══「 💕 © ZoreDevTeam 」══╝`
            )

            await m.react('🕒')
            const buf = await downloadMediaMessage(q, 'buffer', {}, { logger: console, reuploadRequest: conn.updateMediaMessage })
            if (!buf) throw new Error('No se pudo descargar el sticker.')

            const caption = `> 💗 Convertido por Zero Two~ © ZoreDevTeam`

            if (q.msg?.isAnimated) {
                try {
                    const gif = await webpToGif(buf)
                    await conn.sendMessage(m.chat, { video: gif, caption, gifPlayback: true }, { quoted: m })
                } catch {
                    const png = await webpToPng(buf)
                    await conn.sendMessage(m.chat, { image: png, caption }, { quoted: m })
                }
            } else {
                const png = await webpToPng(buf)
                await conn.sendMessage(m.chat, { image: png, caption }, { quoted: m })
            }
            return await m.react('✅')
        }

        // ── WATERMARK ─────────────────────────────────────────────────────
        if (isWm) {
            const buf = await downloadMediaMessage(q, 'buffer', {}, { logger: console, reuploadRequest: conn.updateMediaMessage })
            if (!buf) throw new Error('No se pudo extraer el buffer.')

            if (/webp/.test(mime)) {
                await m.react('🕒')
                const customText = args.join(' ').trim()
                const { packname, author } = await buildPackInfo(m, conn, customText)
                const result = await writeExif(buf, packname, author)
                await conn.sendMessage(m.chat, { sticker: result }, { quoted: m })
                return await m.react('✅')
            }

            if (!/image/.test(mime)) return sendStyled(conn, m,
                `╔══「 💗 Zero Two · Watermark 」══╗\n\n` +
                `꒰ ⚠️ ꒱ Cita una *imagen* o *sticker*, Darling~\n` +
                `⟡ Uso: *${prefix + command}*\n\n` +
                `╚══「 💕 © ZoreDevTeam 」══╝`
            )

            await m.react('🕒')
            const texto = args.join(' ').trim() || global.botName
            const out   = await addWatermarkImg(buf, texto)
            await conn.sendMessage(m.chat, {
                image: out,
                caption: `> 💗 Watermark por Zero Two~ © ZoreDevTeam`
            }, { quoted: m })
            return await m.react('✅')
        }

        // ── CREAR STICKER ─────────────────────────────────────────────────
        if (/webp|image|video/g.test(mime)) {
            await m.react('🪄')
            const img = await downloadMediaMessage(q, 'buffer', {}, { logger: console, reuploadRequest: conn.updateMediaMessage })
            if (!img) throw new Error('No se pudo extraer el buffer.')
            const { packname, author } = await buildPackInfo(m, conn)
            stikerBuf = await sticker(img, false, packname, author)
        } else if (args[0] && /https?:\/\//.test(args[0])) {
            const { packname, author } = await buildPackInfo(m, conn)
            stikerBuf = await sticker(false, args[0], packname, author)
        } else {
            return sendStyled(conn, m,
                `╔══「 💗 Zero Two · Sticker 」══╗\n\n` +
                `꒰ ⚠️ ꒱ Responde a una *imagen* o *video*, Darling~\n` +
                `⟡ También puedes pasar una *URL* directamente.\n` +
                `⟡ Uso: *${prefix + command}*\n\n` +
                `╚══「 💕 © ZoreDevTeam 」══╝`
            )
        }

        if (stikerBuf) {
            await conn.sendMessage(m.chat, { sticker: stikerBuf }, { quoted: m })
            await m.react('✅')
        }

    } catch (e) {
        console.error('[STICKER ERROR]', e.message)
        await m.react('💔')
        sendStyled(conn, m,
            `╔══「 💗 Zero Two · Error 」══╗\n\n` +
            `꒰ 💔 ꒱ ¡Algo falló, Darling~!\n` +
            `⟡ Detalle: ${e.message}\n\n` +
            `╚══「 💕 © ZoreDevTeam 」══╝`
        )
    }
}

handler.help    = ['s', 'wm', 'toimagen']
handler.command = ['s', 'sticker', 'stiker', 'wm', 'watermark', 'marca', 'toimagen', 'toimg', 's2img']
handler.tags    = ['tools']

export default handler