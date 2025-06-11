const csv = require('csv-parser')
const fs = require('fs')
const mysql = require('mysql2/promise')
const dbConfig = require('../config/connect_data')
const pool = mysql.createPool(dbConfig)

exports.uploadExcels = async (req, res) => {
    let connection
    try {
        console.log('Upload request received')
        console.log('Files:', req.files)
        
        if (!req.files || !req.files.excel) {
            return res.status(400).json({ msg: 'No file uploaded' })
        }
        
        const { excel } = req.files
        console.log('File info:', { name: excel.name, mimetype: excel.mimetype })
        
        const allowedMimeTypes = [
            'text/csv',
            'application/csv',
            'text/plain',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ]
        
        const isCSV = allowedMimeTypes.includes(excel.mimetype) || 
                     excel.name.toLowerCase().endsWith('.csv')
        
        if (!isCSV) {
            if (excel.tempFilePath && fs.existsSync(excel.tempFilePath)) {
                fs.unlinkSync(excel.tempFilePath)
            }
            return res.status(400).json({ 
                msg: 'Invalid file type. Please upload CSV file (.csv)',
                received: excel.mimetype 
            })
        }

        const data = []
        
        // ตรวจสอบว่าไฟล์มีอยู่จริง
        if (!fs.existsSync(excel.tempFilePath)) {
            return res.status(400).json({ msg: 'Uploaded file not found' })
        }

        await new Promise((resolve, reject) => {
            fs.createReadStream(excel.tempFilePath)
                .pipe(csv())
                .on('data', (row) => {
                    const cleanRow = {}
                    Object.keys(row).forEach(key => {
                        // ลบ BOM และ whitespace
                        const cleanKey = key.replace(/^\uFEFF/, '').trim()
                        cleanRow[cleanKey] = row[key] ? row[key].toString().trim() : ''
                    })
                    data.push(cleanRow)
                })
                .on('end', () => {
                    console.log('CSV parsing completed')
                    resolve()
                })
                .on('error', (error) => {
                    console.error('CSV parsing error:', error)
                    reject(error)
                })
        })

        console.log('CSV data preview:', data.slice(0, 2))
        console.log('Total rows:', data.length)

        if (data.length === 0) {
            if (fs.existsSync(excel.tempFilePath)) {
                fs.unlinkSync(excel.tempFilePath)
            }
            return res.status(400).json({ msg: 'CSV file is empty' })
        }

        // ตรวจสอบ header 
        const expectedHeaders = ['Country name', 'Year', 'Population']
        const actualHeaders = Object.keys(data[0])
        console.log('Expected headers:', expectedHeaders)
        console.log('Actual headers:', actualHeaders)

        connection = await pool.getConnection()
        await connection.beginTransaction()

        const successData = []
        const failedData = []

        for (let i = 0; i < data.length; i++) {
            try {
                const row = data[i]
                
                //กำหนดชื่อใน colum ที่เว้นวรรค
                const countryName = row['Country name']
                const year = row['Year']
                const population = row['Population']
                
                if (!countryName || !year || !population) {
                    failedData.push({
                        row: i + 1,
                        data: row,
                        reason: `Missing required fields. Found: ${Object.keys(row).join(', ')}`
                    })
                    continue
                }

                // Validate data types
                if (isNaN(year) || isNaN(population)) {
                    failedData.push({
                        row: i + 1,
                        data: row,
                        reason: 'Year and Population must be numbers'
                    })
                    continue
                }

                const sql = 'INSERT INTO `population_and_demography` (`Country_name`, `Year`, `Population`) VALUES (?, ?, ?)'
                const [result] = await connection.execute(sql, [countryName, year, population])

                if (result.affectedRows > 0) {
                    successData.push({
                        row: i + 1,
                        country: countryName,
                        year: parseInt(year),
                        population: parseInt(population)
                    })
                } else {
                    failedData.push({
                        row: i + 1,
                        data: row,
                        reason: 'Failed to insert to database'
                    })
                }

            } catch (error) {
                console.error(`Error inserting row ${i + 1}:`, error)
                failedData.push({
                    row: i + 1,
                    data: data[i],
                    reason: error.message
                })
            }
        }
        
        await connection.commit()
        
        if (excel.tempFilePath && fs.existsSync(excel.tempFilePath)) {
            fs.unlinkSync(excel.tempFilePath)
        }
        
        console.log(`Upload completed: ${successData.length} success, ${failedData.length} failed`)
        
        return res.json({
            msg: 'Upload completed',
            summary: {
                total: data.length,
                success: successData.length,
                failed: failedData.length
            },
            data: {
                successData: successData.slice(0, 10),
                failedData: failedData.slice(0, 10)
            }
        })

    } catch (error) {
        console.error('Upload error:', error)
        
        if (connection) {
            try {
                await connection.rollback()
            } catch (rollbackError) {
                console.error('Rollback error:', rollbackError)
            } finally {
                connection.release()
            }
        }
        
        if (req.files && req.files.excel && req.files.excel.tempFilePath) {
            try {
                if (fs.existsSync(req.files.excel.tempFilePath)) {
                    fs.unlinkSync(req.files.excel.tempFilePath)
                }
            } catch (fileError) {
                console.error('File cleanup error:', fileError)
            }
        }

        res.status(500).json({ 
            msg: 'Server Error',
            error: error.message 
        })
    } finally {
        if (connection) {
            connection.release()
        }
    }
}