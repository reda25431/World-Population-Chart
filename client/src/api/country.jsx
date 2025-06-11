import axios from 'axios';

export const CountryPerYear = async (year) => await axios.get('http://localhost:5001/api/country/' + year)

export const PopulationPerYear = async (year) => await axios.get('http://localhost:5001/api/population/' + year)

