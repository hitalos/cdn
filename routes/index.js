const fs = require('fs')
const multer = require('multer')
const path = require('path')
const { promisify } = require('util')
const router = require('express').Router()

const readdir = promisify(fs.readdir)
const mkdir = promisify(fs.mkdir)

const UPLOAD_DIR = path.resolve(`${__dirname}/../uploads`)

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${UPLOAD_DIR}/${req.body.folder}`)
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})
const upload = multer({ storage })

router.get('/', (req, res) => {
  readdir(UPLOAD_DIR)
    .then(entries => entries.filter(entry =>
      fs.statSync(`${UPLOAD_DIR}/${entry}`).isDirectory()
    ))
    .then(folders =>
      res.render('index', { folders })
    )
    .catch(error => res.render('error', { error }))
})
router.post('/newFolder', (req, res) => {
  mkdir(`${UPLOAD_DIR}/${req.body.newFolder}`)
    .then(() => res.redirect('/'))
    .catch(error => res.render('error', { error }))
})

router.post('/new', upload.array('files'), (req, res) => {
  res.redirect('/')
})

router.get('/list', (req, res) => {
  const folder = req.query.listFiles
  readdir(`${UPLOAD_DIR}/${folder}`)
    .then(entries => entries.filter(entry =>
      fs.statSync(`${UPLOAD_DIR}/${folder}/${entry}`).isFile()
    ))
    .then(files => res.render('listFiles', { files, folder }))
    .catch(error => res.render('error', { error }))
})

module.exports = router
