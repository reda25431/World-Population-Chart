import axios from 'axios';

// export const CountryPerYear = async (year) => await axios.get('http://localhost:5001/api/country/' + year)
export const CountryPerYear = async (year) => await axios.get('https://world-population-chart.onrender.com/api/country/' + year)

// export const PopulationPerYear = async (year) => await axios.get('http://localhost:5001/api/population/' + year)
export const PopulationPerYear = async (year) => await axios.get('https://world-population-chart.onrender.com/api/population/' + year)

