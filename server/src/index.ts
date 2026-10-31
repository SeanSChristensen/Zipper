import cors from 'cors'
import express from 'express'
import multer from 'multer'
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'path';

const app = express()
const port = Number(process.env.PORT) || 3001

app.use(cors())
app.use(express.json())

//const upload = multer({ dest: 'uploads/' });

const zipFile = (fileName:string) => {
  const gzip = zlib.createGzip();
  const source = fs.createReadStream(process.cwd() + '/uploads/' + fileName);
  const destination = fs.createWriteStream(process.cwd() + '/downloads/' + fileName + '.gz');

  console.log(source.path)
  console.log(destination.path)

  source.pipe(gzip).pipe(destination);
}

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

var upload = multer({ storage: storage });

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
  zipFile(_req.file?.filename)
  res.statusCode=200;
  res.end(_req.file?.filename)
})

