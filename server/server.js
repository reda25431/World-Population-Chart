const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const countryData = require('./routes/country')
const uploadExcelData = require('./routes/uploadExcel')

const app = express()

// Middleware
app.use(morgan('dev'))
app.use(cors())
app.use(express.json())

// Routes
app.use('/api', countryData)
app.use('/api', uploadExcelData)

app.use((error, req, res, next) => {
    res.status(500).json({ msg: 'Server Error', error: error.message })
})

// app.listen(5001, ()=> console.log('server is running on port 5001'))
app.listen(process.env.PORT || 5001)
