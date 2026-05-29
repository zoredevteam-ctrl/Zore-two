import { tmpdir } from 'os'
import { join } from 'path'
import fse from 'fs-extra'
const { writeFile, readFile, remove } = fse
import Crypto from 'crypto'
import { spawn } from 'child_process'
import sharp from 'sharp'

// ── Helpers ──────────────────────────────────────────────────────────────────

const tmpFile = (ext) =>
    join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`)

function ffRun(args) {
    return new Promise((resolve, reject) => {
        const p = spawn('ffmpeg', args)
        let err = ''
        p.stderr.on('data', d => err += d)
        p.on('close', code =>
            code === 0 ? resolve() : reject(new Error(err.slice(-400)))
        )
    })
}

async function fetchBuffer(url) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`fetch failed: ${res.status}`)
    return Buffer.from(await res.arrayBuffer())
}

// ── writeExif — inyecta packname/author en un webp ───────────────────────────
// Usa exiftool si está disponible, sino escribe los bytes EXIF manualmente.

export async function writeExif(buffer, packname = '', author = '') {
    // Intento con exiftool
    try {
        const tmpIn  = tmpFile('webp')
        const tmpOut = tmpFile('webp')
        await writeFile(tmpIn, buffer)

        await new Promise((resolve, reject) => {
            const p = spawn('exiftool', [
                `-XMP-dc:Title=${packname}`,
                `-XMP-dc:Creator=${author}`,
                `-o`, tmpOut,
                tmpIn
            ])
            p.on('close', code => code === 0 ? resolve() : reject(new Error('exiftool failed')))
        })

        const result = await readFile(tmpOut)
        await remove(tmpIn)
        await remove(tmpOut)
        return result
    } catch {}

    // Fallback: inyectar JSON de metadata en los bytes del webp (compatible con WA)
    try {
        const json = JSON.stringify({
            'sticker-pack-name':      packname,
            'sticker-pack-publisher': author,
            'android-app-store-link': '',
            'ios-app-store-link':     ''
        })

        const utf8 = Buffer.from(json, 'utf8')

        // Estructura WebP EXIF chunk
        const exifHeader  = Buffer.from('EXIF')
        const exifSize    = Buffer.alloc(4)
        exifSize.writeUInt32LE(utf8.length + 6, 0)

        // Chunk EXIF simple
        const exifChunk = Buffer.concat([
            exifHeader,
            exifSize,
            Buffer.from([0x45, 0x78, 0x69, 0x66, 0x00, 0x00]), // "Exif\0\0"
            utf8
        ])

        // Reescribir cabecera RIFF con nuevo tamaño
        const riffSize = buffer.length + exifChunk.length
        const newRiff  = Buffer.alloc(4)
        newRiff.writeUInt32LE(riffSize - 8, 0)

        const result = Buffer.concat([
            buffer.slice(0, 4),    // "RIFF"
            newRiff,               // nuevo tamaño
            buffer.slice(8),       // resto del webp
            exifChunk              // metadata al final
        ])

        return result
    } catch {
        // Si todo falla, devolver el buffer original sin exif
        return buffer
    }
}

// ── imageToWebp — convierte imagen estática a webp ───────────────────────────

async function imageToWebp(buffer) {
    return sharp(buffer)
        .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .webp({ quality: 80 })
        .toBuffer()
}

// ── videoToWebp — convierte video/gif a webp animado ─────────────────────────

async function videoToWebp(buffer) {
    const tmpIn  = tmpFile('mp4')
    const tmpOut = tmpFile('webp')
    await writeFile(tmpIn, buffer)

    await ffRun([
        '-y', '-i', tmpIn,
        '-vf',  'scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000',
        '-vcodec', 'libwebp',
        '-lossless', '0',
        '-compression_level', '4',
        '-q:v', '50',
        '-loop', '0',
        '-preset', 'picture',
        '-an', '-vsync', '0',
        '-t', '00:00:10',       // máx 10s como WhatsApp
        tmpOut
    ])

    const result = await readFile(tmpOut)
    await remove(tmpIn)
    await remove(tmpOut)
    return result
}

// ── sticker — función principal ───────────────────────────────────────────────
// Uso:
//   sticker(buffer, false, packname, author)   → desde buffer
//   sticker(false, url, packname, author)       → desde URL

export async function sticker(buffer, url, packname = '', author = '') {
    // Obtener buffer
    if (!buffer && url) {
        buffer = await fetchBuffer(url)
    }
    if (!buffer) throw new Error('No se proporcionó buffer ni URL válida.')

    // Detectar si es video/gif o imagen
    // Los primeros bytes de GIF son "GIF8", de MP4 hay ftyp, de webp animado tiene ANIM
    const header = buffer.slice(0, 12).toString('hex')
    const isGif  = buffer.slice(0, 3).toString() === 'GIF'
    const isMp4  = buffer.slice(4, 8).toString() === 'ftyp' ||
                   buffer.slice(0, 4).toString('hex') === '00000020'
    const isWebpAnimated = buffer.slice(0, 4).toString() === 'RIFF' &&
                           buffer.indexOf('ANIM') !== -1

    let webp
    if (isGif || isMp4 || isWebpAnimated) {
        webp = await videoToWebp(buffer)
    } else {
        webp = await imageToWebp(buffer)
    }

    // Inyectar metadata
    return writeExif(webp, packname, author)
}

export default { sticker, writeExif }
