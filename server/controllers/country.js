const pool = require('../config/connect_data');

exports.country_per_year = async (req, res) => {
    try {
        const { year } = req.params;

        if (!year) {
            return res.status(400).json({ success: false, msg: 'Year parameter is required' });
        }

        const notInCountries = [
            'Africa (UN)',
            'Least developed countries',
            'Latin America and the Caribbean (UN)',
            'Northern America (UN)',
            'Low-income countries',
            'Land-locked developing countries (LLDC)',
            'Europe (UN)',
            'High-income countries'
        ];
        const notInPlaceholders = notInCountries.map(() => '?').join(', ');

        const query = `SELECT * FROM population_and_demography WHERE Year = ? AND Country_name NOT IN (${notInPlaceholders}) ORDER BY Population DESC LIMIT 12 OFFSET 10`;
        const [rows] = await pool.execute(query, [year, ...notInCountries]);

        res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        console.error('country_per_year error:', error);
        res.status(500).json({ msg: 'Server Error', error: error.message });
    }
};

exports.Population_in_world = async (req, res) => {
    try {
        const { year } = req.params;
        
        if (!year) {
            return res.status(400).json({
                success: false,
                msg: 'Year parameter is required'
            });
        }
        
        const Population_world = `SELECT * FROM population_and_demography WHERE Year = ? AND Country_name IN ('World')`;
        const [rows] = await pool.execute(Population_world, [year]);

        res.status(200).json({ success: true, count: rows.length, data: rows });

    } catch (error) {
        console.error('Population_in_world error:', error);
        res.status(500).json({ msg: 'Server Error', error: error.message });
    }
}