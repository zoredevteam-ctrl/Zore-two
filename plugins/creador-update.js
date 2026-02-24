import fs from 'fs'
import { exec } from 'child_process'

let handler = async (m, { conn }) => {
  const restarterFile = './lastRestarter.json'

  await conn.sendMessage(m.chat, {
    react: { text: '🔄', key: m.key }
  })

  exec('git pull', async (err, stdout, stderr) => {
    if (err) {
      return conn.sendMessage(
        m.chat,
        { text: `❌ Error al actualizar:\n${err.message}` },
        { quoted: m }
      )
    }

    const output = (stdout || stderr || '').trim()

    if (/Already up to date/i.test(output)) {
      return conn.sendMessage(
        m.chat,
        { text: `✅ *${global.namebot} ya está en la última versión.*` },
        { quoted: m }
      )
    }

    const msg = await conn.sendMessage(
      m.chat,
      {
        text:
          `✅ *Actualización completada*\n\n` +
          `${output}\n\n` +
          `♻️ Reiniciando ${global.namebot}...`
      },
      { quoted: m }
    )

    fs.writeFileSync(
      restarterFile,
      JSON.stringify(
        {
          chatId: m.chat,
          key: msg.key
        },
        null,
        2
      )
    )

    setTimeout(() => process.exit(1), 3000)
  })
}

handler.command = ['carga', 'update']
handler.help = ['Update']
handler.tags = ['OWNER']
handler.owner = false

export default handler