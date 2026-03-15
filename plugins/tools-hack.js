let handler = async (m, { conn, text }) => {

let user = text || '@usuario'

let steps = [
'💻 Conectando al servidor...',
'📡 Rastreando IP...',
'🔍 Buscando datos...',
'📂 Accediendo a archivos...',
'📤 Descargando información...',
'✅ Hack completado'
]

for (let step of steps) {
await conn.reply(m.chat, step, m)
await new Promise(r => setTimeout(r, 1500))
}

conn.reply(m.chat, `⚠️ *Hack completado*\n\nDatos de ${user} obtenidos 😈`, m)

}

handler.help = ['hack']
handler.tags = ['fun']
handler.command = ['hack']

export default handler