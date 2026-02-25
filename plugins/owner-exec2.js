import cp, { exec as _exec } from 'child_process'
import { promisify } from 'util'

const exec = promisify(_exec).bind(cp)

let handler = async (m, { conn, args }) => {
    const text = args.join(' ')
    console.log('$ ejecutando:', text)
    if (!text) return m.reply('💗 Darling, ingresa un comando~')

    await m.reply('💗 *Ejecutando, darling~*')

    let o
    try {
        o = await exec(text.trimEnd())
    } catch (e) {
        o = e
    } finally {
        const { stdout, stderr } = o
        if (stdout?.trim()) await m.reply(stdout.trim())
        if (stderr?.trim()) await m.reply(stderr.trim())
    }
}

handler.help = ['$']
handler.tags = ['owner']
handler.customPrefix = ['$']
handler.command = new RegExp
handler.rowner = true

export default handler