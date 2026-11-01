import cors from 'cors'
import express from 'express'
import multer from 'multer'
import fs, { unlink } from 'node:fs';
import zlib from 'node:zlib';
import path from 'path';
import { pipeline } from 'node:stream/promises';
import os from 'node:os'
import crypto from 'node:crypto'

const app = express()
const port = Number(process.env.PORT) || 3001

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')
const DOWNLOAD_DIR = path.join(process.cwd(), 'downloads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })
fs.mkdirSync(DOWNLOAD_DIR, { recursive: true })

//Multer configuration for saving files to the disk with unique file names and 100MB limit
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => cb(null, crypto.randomUUID() + path.extname(file.originalname)),
  }),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
})


app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' , instance: os.hostname()})
})


app.post('/api/zip', upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400).end('No File')
    return
  }

  //define file loacation in uploads and download location for later
  const src = req.file.path
  const dest = path.join(DOWNLOAD_DIR, req.file.filename + '.gz')

  //define a cleanup function to remove files later
  const cleanup = () => {
    fs.unlink(src, () => {})
    fs.unlink(dest, () => {})
  }

  try {
    //zip file
    await pipeline(fs.createReadStream(src), zlib.createGzip(), fs.createWriteStream(dest))
  } catch (err) {
    console.error(err)
    cleanup()
    res.status(500).end('Compression failed')
    return
  }

  console.log(`[${os.hostname()}] zipped ${req.file.originalname}`)
  res.download(dest, req.file.originalname + '.gz', (err) => {
    if (err) console.error(err)
    cleanup()
  })
})

const server = app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})

process.on('SIGTERM', () => server.close(() => process.exit(0)))
