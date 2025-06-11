const express = require('express')
const router = express.Router()
const { country_per_year, Population_in_world } = require('../controllers/country')

router.get('/country/:year', country_per_year)
router.get('/population/:year', Population_in_world)

module.exports = router