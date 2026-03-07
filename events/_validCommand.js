export async function before(m, { conn }) {
    if (!m.text || !global.prefix.test(m.text)) return

    const usedPrefix = global.prefix.exec(m.text)[0]
    const command    = m.text.slice(usedPrefix.length).trim().split(' ')[0].toLowerCase()

    if (!command) return

    const allCommands = Object.values(global.plugins)
        .flatMap(p => Array.isArray(p.command) ? p.command : [p.command])
        .filter(v => typeof v === 'string')

    if (allCommands.includes(command)) {
        const user = global.db.data.users[m.sender]
        if (!user.commands) user.commands = 0
        user.commands++
        return
    }

    const similarity = (a, b) => {
        let matches = 0
        for (let i = 0; i < Math.min(a.length, b.length); i++) {
            if (a[i] === b[i]) matches++
        }
        return Math.floor((matches / Math.max(a.length, b.length)) * 100)
    }

    const similares = allCommands
        .map(cmd => ({ cmd, score: similarity(command, cmd) }))
        .filter(o => o.score >= 40)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)

    const sugerencias = similares.length
        ? similares.map(s => `*${usedPrefix + s.cmd}* » *${s.score}%*`).join('\n')
        : 'Sin resultados'

    const texto = `El comando *(${usedPrefix + command})* no existe.
- Use el comando *${usedPrefix}menu* para ver los comandos.

*Similares:*
${sugerencias}`

    await conn.sendMessage(m.chat, { text: texto.trim() }, { quoted: m })
}
