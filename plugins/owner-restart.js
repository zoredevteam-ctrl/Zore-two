let handler = async (m, { conn, usedPrefix, command }) => {

    try {
        m.reply('Reiniciando 💗... ✨\n\n💞 ¡Espera un momento! 💫')
        setTimeout(() => {
            process.exit(0)
        }, 3000) 
    } catch (error) {
        console.log(error)
        conn.reply(m.chat, `${error}`, m)
    }
}

handler.help = ['restart']
handler.tags = ['owner']
handler.command = ['restart', 'reiniciar'] 
handler.owner = true

export default handler