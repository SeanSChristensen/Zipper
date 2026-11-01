import { useEffect, useState, type ChangeEvent  } from 'react'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import download from "downloadjs";

function App() {
  const [status, setStatus] = useState('checking...')
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState('')

  


  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data: { status: string }) => setStatus(data.status))
      .catch(() => setStatus('unreachable'))
  }, [])

  const onFileChange = (e: ChangeEvent<HTMLInputElement>)  => {
    if(!e.target.files){
          return
    }
    else{
      setFile(e.target.files[0])
      setFileName(e.target.files[0].name)
    }
  }

  const submitFile = async () => {
    if (file === null) { return }
    const fileData = new FormData();
    fileData.append('file', file);

    const response = await axios.post('/api/zip', fileData, {
    responseType: 'blob',
    })
          if (response.status === 200){
        download(response.data,fileName + '.gz','application/gzip')
      }
  }


  return (
    <Box>
      <Box sx={{ p: 2 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Zipper
        </Typography>
        <Chip
          label={`API status: ${status}`}
          color={status === 'ok' ? 'success' : 'default'}
        />
      </Box>
      <Box sx={{ p: 3 }}>
        <Typography sx={{ py: 1 }}>Upload File Here: {fileName}</Typography>      
        <Button
          variant="contained"
          component="label"
          startIcon={<CloudUploadIcon />}
        >
          Upload File
          <input type="file" hidden onChange={onFileChange} />
        </Button>

        <Button variant="contained" endIcon={<SendIcon />} onClick={submitFile}>
          Send
        </Button>
      </Box>
    </Box>
  )
}

export default App
