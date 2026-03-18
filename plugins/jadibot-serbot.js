import {
  useMultiFileAuthState,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
  Browsers
} from "@whiskeysockets/baileys"
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import { makeWASocket } from '@whiskeysockets/baileys'
import { smsg } from '../lib/simple.js'
import { handler, loadEvents } from '../handler.js'
import { database } from '../lib/database.js'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)

if (!Array.isArray(global.conns)) global.conns = []

// ====================== MODO MANTENIMIENTO ======================
const MENSAJE_MANTENIMIENTO = `✦ Zero Two

  ◆ Comando en mantenimiento

  ✧ Método › Code / Serbot
  
  › Estamos trabajando para mejorar el sistema de SubBots
  › Espere las actualizaciones en el canal oficial
  
  › Canal: https://whatsapp.com/channel/0029Vb6p68rF6smrH4Jeay3Y

  ¡Gracias por tu paciencia! Pronto volverá a estar disponible 🚀`

// ============================================================

let pluginHandler = async (m, { conn, args, prefix, isOwner }) => {
  // Solo mostramos el mensaje de mantenimiento (sin crear nada)
  await m.reply(MENSAJE_MANTENIMIENTO)
}

pluginHandler.help = ['code', 'serbot']
pluginHandler.tags = ['serbot']
pluginHandler.command = ['code', 'serbot']

export default pluginHandler

// (bros yo tengo el código guardado por si lo necesitan