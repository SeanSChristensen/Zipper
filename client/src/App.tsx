import { useEffect, useState, ChangeEvent  } from 'react'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import download from "downloadjs";

function App() {
  const [status, setStatus] = useState('checking...')
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState('')
  const [isDownloadAvailable, setIsDownloadAvailable] = useState(false)
  const [downloadFileName, setDownloadFileName] = useState('')
  


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

    const response = await axios.post('http://localhost:3001/upload', fileData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }}).then(res => {
      if (res.status === 200){
        setIsDownloadAvailable(true);
        setDownloadFileName(res.data.filename)
      }
    })
  }

  const downloadFile = async () => {
    const response = await axios.get('http://localhost:3001/download/' + downloadFileName+'.gz', {responseType : 'blob'}
    ).then(res => download(res.data,downloadFileName+'.gz'))
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
        <Typography sx={{ py: 1 }}>Result: </Typography>
        {isDownloadAvailable ?         <Button
          variant="contained"
          component="label"
          startIcon={<DownloadIcon />}
          onClick={downloadFile}
        >
          Download File
        </Button> : 
                <Button
          variant="contained"
          component="label"
          startIcon={<DownloadIcon />}
          disabled
        >
          Download File
        </Button>}
      </Box>
    </Box>
  )
}

export default App
