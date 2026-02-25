import cp, { exec as _exec } from 'child_process'
import { promisify } from 'util'

const exec = promisify(_exec).bind(cp)

let handler = async (m, { conn, command, args }) => {
    const text = args.join(' ')

    await m.reply('💗 *Ejecutando, darling~*')

    let o
    try {
        o = await exec(command.trimStart() + ' ' + text.trimEnd())
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
handler.owner = true

export default handler