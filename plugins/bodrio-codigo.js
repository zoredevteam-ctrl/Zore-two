let handler = async (m, { conn, text }) => {
  let apuesta = text.split(' ')[0]
  let eleccion = text.split(' ')[1]
  if (!apuesta || !eleccion) throw m.reply('Uso: !policias <apuesta> <policia/ladron>')
  if (isNaN(apuesta)) throw m.reply('La apuesta debe ser un número')
  let resultado = Math.random() < 0.5 ? 'policia' : 'ladron'
  if (eleccion.toLowerCase() === resultado) {
    m.reply(`¡Ganaste! El resultado es ${resultado}. Te llevas ${apuesta * 2} monedas`)
    // Aquí puedes agregar código para sumar las monedas ganadas al usuario
  } else {
    m.reply(`Perdiste. El resultado es ${resultado}. Perdiste ${apuesta} monedas`)
    // Aquí puedes agregar código para restar las monedas perdidas al usuario
  }
}

handler.help = ['policias <apuesta> <policia/ladron>']
handler.tags = ['casino']
handler.command = ['policias']

export default handler