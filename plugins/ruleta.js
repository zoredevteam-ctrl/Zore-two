let handler = async (m, { conn, text }) => {
  let apuesta = text.split(' ')[0]
  let numero = text.split(' ')[1]
  if (!apuesta || !numero) throw m.reply('Uso: !ruleta <apuesta> <numero (1-36)>')
  if (isNaN(apuesta) || isNaN(numero)) throw m.reply('La apuesta y el número deben ser números')
  if (numero < 1 || numero > 36) throw m.reply('El número debe estar entre 1 y 36')
  let resultado = Math.floor(Math.random() * 37)
  if (resultado == numero) {
    m.reply(`¡Ganaste! El número ganador es ${resultado}. Te llevas ${apuesta * 35} monedas`)
    // Aquí puedes agregar código para sumar las monedas ganadas al usuario
  } else {
    m.reply(`Perdiste. El número ganador es ${resultado}. Perdiste ${apuesta} monedas`)
    // Aquí puedes agregar código para restar las monedas perdidas al usuario
  }
}

handler.help = ['ruleta <apuesta> <numero>']
handler.tags = ['casino']
handler.command = ['ruleta']

export default handler