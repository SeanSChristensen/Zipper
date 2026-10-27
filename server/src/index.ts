import cors from 'cors'
import express from 'express'
import multer from 'multer'

const app = express()
const port = Number(process.env.PORT) || 3001

app.use(cors())
app.use(express.json())

const upload = multer({ dest: 'uploads/' });

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})

app.post('/upload', upload.single('file'),(_req, res) => {
  if(!_req.file){
    res.statusCode=400;
    res.end('No File')
    return
  }
  res.statusCode=200;
  res.end(_req.file?.filename)
})