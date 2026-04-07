import * as baileys from "@whiskeysockets/baileys";
import crypto from "node:crypto";
import { PassThrough } from "stream";
import ffmpeg from "fluent-ffmpeg";

let handler = async (m, { conn, text }) => {
  let [textoEntrada = '', colorTexto = '', url = ''] = (text || '').split('|');

  let id;
  if (url) {
    const codigoInvitacion = url.split('/').pop().split('?')[0];
    let infoGrupo = await conn.groupGetInviteInfo(codigoInvitacion);
    id = infoGrupo.id;
  } else {
    id = m.chat;
  }

  let q = m.quoted || m;
  let caption = q?.caption || textoEntrada || '';

  let mime = q?.mimetype || '';

  const buffer = await conn.downloadMediaMessage(q).catch(() => null);

  if (mime.includes('image')) {
    if (!buffer) return m.reply('⚠️ Error al obtener la imagen.');

    const estado = await enviarEstadoGrupo(conn, id, {
      image: buffer,
      caption
    });

    return conn.reply(m.chat, '✅ Estado subido correctamente.', estado);
  }

  if (mime.includes('video')) {
    if (!buffer) return m.reply('⚠️ Error al obtener el video.');

    const estado = await enviarEstadoGrupo(conn, id, {
      video: buffer,
      caption
    });

    return conn.reply(m.chat, '✅ Estado subido correctamente.', estado);
  }

  if (mime.includes('audio')) {
    if (!buffer) return m.reply('⚠️ Error al obtener el audio.');

    const audioVoz = await convertirAVoz(buffer);
    const formaOnda = await generarFormaOnda(buffer);

    const estado = await enviarEstadoGrupo(conn, id, {
      audio: audioVoz,
      waveform: formaOnda,
      mimetype: "audio/ogg; codecs=opus",
      ptt: true
    });

    return conn.reply(m.chat, '✅ Estado subido correctamente.', estado);
  }

  if (colorTexto || (!mime && caption)) {
    if (!caption) return m.reply('⚠️ No hay texto para subir al estado del grupo.');

    const coloresWA = new Map([
      ['azul', '#34B7F1'],
      ['verde', '#25D366'],
      ['amarillo', '#FFD700'],
      ['naranja', '#FF8C00'],
      ['rojo', '#FF3B30'],
      ['morado', '#9C27B0'],
      ['gris', '#9E9E9E'],
      ['negro', '#000000'],
      ['blanco', '#FFFFFF'],
      ['cian', '#00BCD4']
    ]);

    const textoColor = (colorTexto || '').toLowerCase();
    let color = null;

    for (const [nombre, codigo] of coloresWA.entries()) {
      if (textoColor.includes(nombre)) {
        color = codigo;
        break;
      }
    }

    if (!color) return m.reply('⚪ No se encontró un color válido en tu texto.');

    const estado = await enviarEstadoGrupo(conn, id, {
      text: caption,
      backgroundColor: color
    });

    return conn.reply(m.chat, '✅ Estado publicado correctamente.', estado);
  }

  return m.reply('⚠️ Responde a un medio (imagen/video/audio) o envía texto con color. También puedes usar un link de grupo.');
};

async function enviarEstadoGrupo(conn, jid, contenido) {
  const { backgroundColor } = contenido;
  delete contenido.backgroundColor;

  const contenidoInterno = await baileys.generateWAMessageContent(contenido, {
    upload: conn.waUploadToServer,
    backgroundColor
  });

  const secretoMensaje = crypto.randomBytes(32);

  const mensaje = baileys.generateWAMessageFromContent(jid, {
    messageContextInfo: { messageSecret: secretoMensaje },
    groupStatusMessageV2: {
      message: {
        ...contenidoInterno,
        messageContextInfo: { messageSecret: secretoMensaje }
      }
    }
  }, {});

  await conn.relayMessage(jid, mensaje.message, { messageId: mensaje.key.id });
  return mensaje;
}

async function convertirAVoz(inputBuffer) {
  return new Promise((resolve, reject) => {
    const entrada = new PassThrough();
    const salida = new PassThrough();
    const chunks = [];

    entrada.end(inputBuffer);

    ffmpeg(entrada)
      .noVideo()
      .audioCodec('libopus')
      .format('ogg')
      .audioBitrate('48k')
      .audioChannels(1)
      .audioFrequency(48000)
      .outputOptions([
        '-map_metadata', '-1',
        '-application', 'voip',
        '-compression_level', '10',
        '-page_duration', '20000'
      ])
      .on('error', reject)
      .on('end', () => resolve(Buffer.concat(chunks)))
      .pipe(salida, { end: true });

    salida.on('data', c => chunks.push(c));
  });
}

async function generarFormaOnda(inputBuffer, barras = 64) {
  return new Promise((resolve, reject) => {
    const inputStream = new PassThrough();
    inputStream.end(inputBuffer);

    const chunks = [];

    ffmpeg(inputStream)
      .audioChannels(1)
      .audioFrequency(16000)
      .format("s16le")
      .on("error", reject)
      .on("end", () => {
        const rawData = Buffer.concat(chunks);
        const muestras = rawData.length / 2;

        const amplitudes = [];
        for (let i = 0; i < muestras; i++) {
          let val = rawData.readInt16LE(i * 2);
          amplitudes.push(Math.abs(val) / 32768);
        }

        let tamañoBloque = Math.floor(amplitudes.length / barras);
        let promedio = [];

        for (let i = 0; i < barras; i++) {
          let bloque = amplitudes.slice(i * tamañoBloque, (i + 1) * tamañoBloque);
          promedio.push(bloque.reduce((a, b) => a + b, 0) / (bloque.length || 1));
        }

        let max = Math.max(...promedio);
        let normalizado = promedio.map(v => Math.floor((v / (max || 1)) * 100));

        let buffer = Buffer.from(new Uint8Array(normalizado));
        resolve(buffer.toString("base64"));
      })
      .pipe()
      .on("data", chunk => chunks.push(chunk));
  });
}

export default handler;