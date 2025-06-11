const express = require('express')
const router = express.Router()
const fileUpload = require('express-fileupload')

const uploadOptions = {
    useTempFiles: true,
    tempFileDir: '/tmp/',
    createParentPath: true,
    limits: { 
        fileSize: 50 * 1024 * 1024 // 50MB
    },
    abortOnLimit: true,
    safeFileNames: true,
    preserveExtension: true
}
const { uploadExcels } = require('../controllers/uploadExcel')

router.post('/import-excel', fileUpload(uploadOptions), uploadExcels)

module.exports = router