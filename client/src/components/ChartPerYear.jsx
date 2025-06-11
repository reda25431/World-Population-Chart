import React, { useEffect, useState } from 'react'
import { CountryPerYear, PopulationPerYear } from '../api/country';
import { CirclePlay, CirclePause } from 'lucide-react';

const ChartPerYear = () => {
    const minYear = 1950;
    const maxYear = 2021;

    const [startYear, setStartYear] = useState(minYear);
    const [isPlaying, setIsPlaying] = useState(false);
    const [countryData, setCountryData] = useState([]);
    const [worldPopulation, setWorldPopulation] = useState([]);

    const fetchPopulationData = async (year) => {
        try {
            const countryTop = await CountryPerYear(year);
            const countryResult = countryTop.data;

            if (countryResult.data) {
                setCountryData(countryResult.data);
            }
            console.log(countryData);
        } catch (error) {
            console.log('Error fetching data: ', error);
        }
    }

    const fetchWorldResult = async (year) => {
        try {
            const worldResult = await PopulationPerYear(year);
            const population = worldResult?.data?.data?.[0]?.Population;

            if (population !== undefined) {
                setWorldPopulation(population);
            } else {
                console.warn('No population data found for year:', year);
            }

            console.log('Population:', population);
        } catch (error) {
            console.log('Error fetching data: ', error);
        }
    }

    // แยก useEffect สำหรับ auto-play
    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                setStartYear(prev => {
                    const nextYear = prev >= maxYear ? minYear : prev + 1;
                    
                    // เรียก API ด้วยปีที่จะอัปเดต
                    fetchPopulationData(nextYear);
                    fetchWorldResult(nextYear);
                    
                    return nextYear;
                });
            }, 500);
        }
        return () => clearInterval(interval);
    }, [isPlaying, maxYear, minYear]);

    // useEffect แยกสำหรับ fetch ข้อมูลเมื่อ startYear เปลี่ยน (สำหรับ manual control)
    useEffect(() => {
        if (!isPlaying) {
            fetchPopulationData(startYear);
            fetchWorldResult(startYear);
        }
    }, [startYear, isPlaying]);

    // useEffect สำหรับ initial load
    useEffect(() => {
        fetchPopulationData(startYear);
        fetchWorldResult(startYear);
    }, []); // รันแค่ครั้งแรก

    const formatNumber = (num) => {
        if (typeof num !== 'number') return '0';
        return num.toLocaleString();
    };

    const handleYearChange = (e) => {
        const newYear = Number(e.target.value);
        setStartYear(newYear);
        setIsPlaying(false); // หยุด auto-play เมื่อผู้ใช้เลื่อน slider
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4">
                {/* header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Population growth per country, 1950 to 2021</h1>
                    <p className="text-gray-600">Click on the legend below to filter by continent</p>
                </div>
                {/* chart */}
                <div className="w-full max-w-6xl mx-auto p-6 bg-white">
                    {/* Chart container */}
                    <div className="relative bg-gray-50 p-6 rounded-lg">
                        {/* X-axis labels */}
                        <div className="flex justify-between mb-2 pl-32">
                            <span className="text-xs text-gray-500">0</span>
                            <span className="text-xs text-gray-500">200,000,000</span>
                            <span className="text-xs text-gray-500">400,000,000</span>
                            <span className="text-xs text-gray-500">600,000,000</span>
                        </div>
                        
                        {/* Chart area */}
                        <div className="space-y-3">
                            {countryData
                                .sort((a, b) => b.Population - a.Population) // เรียงจากมากไปน้อย
                                .slice(0, 12)
                                .map((country, index) => {
                                const maxPopulation = Math.max(...countryData.map(c => c.Population)); // หาค่าสูงสุด
                                const width = Math.max((country.Population / maxPopulation) * 100, 1);
                                const continentColors = {
                                    'Asia': '#4F46E5', // Blue
                                    'Europe': '#8B5CF6', // Purple  
                                    'Africa': '#EF4444', // Red
                                    'Americas': '#F59E0B', // Orange
                                    'Oceania': '#10B981' // Green
                                };
                                
                                // Simple continent mapping based on country names
                                const getContinent = (countryName) => {
                                    const asiaCountries = ['China', 'India', 'Indonesia', 'Japan', 'Bangladesh', 'Pakistan', 'Philippines', 'Vietnam', 'Turkey', 'Iran', 'Thailand', 'Myanmar'];
                                    const europeCountries = ['Russia', 'Germany', 'United Kingdom', 'France', 'Italy', 'Spain', 'Ukraine', 'Poland'];
                                    const americasCountries = ['United States', 'Brazil', 'Mexico', 'Colombia', 'Argentina', 'Canada', 'Peru'];
                                    const africaCountries = ['Nigeria', 'Ethiopia', 'Egypt', 'South Africa', 'Kenya', 'Tanzania', 'Algeria'];
                                    
                                    if (asiaCountries.some(c => countryName.includes(c))) return 'Asia';
                                    if (europeCountries.some(c => countryName.includes(c))) return 'Europe';
                                    if (americasCountries.some(c => countryName.includes(c))) return 'Americas';
                                    if (africaCountries.some(c => countryName.includes(c))) return 'Africa';
                                    return 'Asia'; // Default
                                };
                                
                                const continent = getContinent(country.Country_name);
                                const color = continentColors[continent];
                                
                                return (
                                    <div key={country.Country_name} className="flex items-center">
                                        {/* Country name */}
                                        <div className="w-28 text-right pr-4">
                                            <span className="text-sm font-medium text-gray-700 truncate block">
                                                {country.Country_name}
                                            </span>
                                        </div>
                                        
                                        {/* Bar container */}
                                        <div className="flex-1 relative">
                                            {/* Bar */}
                                            <div 
                                                className="h-8 transition-all duration-700 ease-out rounded-r-md relative group flex items-center"
                                                style={{ 
                                                    width: `${width}%`, 
                                                    backgroundColor: color,
                                                    minWidth: '20px'
                                                }}
                                            >
                                                {/* Population label inside bar */}
                                                <span className="ml-3 text-white text-sm font-medium">
                                                    {formatNumber(country.Population)}
                                                </span>
                                                
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="mt-6 flex flex-wrap gap-4 justify-center">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-600 rounded"></div>
                            <span className="text-sm">Asia</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-purple-600 rounded"></div>
                            <span className="text-sm">Europe</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded"></div>
                            <span className="text-sm">Africa</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-orange-500 rounded"></div>
                            <span className="text-sm">Americas</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded"></div>
                            <span className="text-sm">Oceania</span>
                        </div>
                    </div>
                </div>
                {/* controls */}
                <div className="w-full bg-white flex flex-col items-center justify-center p-8 rounded-lg shadow-lg">
                    {/* Main content area */}
                    <div className="w-full max-w-4xl relative">

                        {/* Controls */}
                        <div className="relative mb-8">
                            {/* Play/Pause Button */}
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="cursor-pointer absolute -top-8 left-0 w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors shadow-lg"
                            >
                                {isPlaying ? <CirclePause size={24} /> : <CirclePlay size={24} />}
                            </button>

                            {/* Year display - large */}
                            <div className="text-right">
                                <div className="text-6xl font-light text-gray-700 mb-2">
                                    {startYear}
                                </div>
                                <div className="text-2xl font-medium text-gray-700">
                                    Total: {formatNumber(worldPopulation)}
                                </div>
                            </div>
                        </div>

                        {/* Timeline container */}
                        <div className="mt-8">
                            {/* Year labels */}
                            <div className="flex justify-between mb-2 px-1">
                                {Array.from({ length: 18 }, (_, i) => {
                                    const y = minYear + i * 4;
                                    return y <= maxYear ? (
                                        <span key={y} className="text-xs text-gray-500 font-mono">
                                            {y}
                                        </span>
                                    ) : null;
                                })}
                            </div>

                            {/* Timeline track */}
                            <div className="relative h-2 bg-gray-200 rounded-full">
                                <div
                                    className="absolute h-full bg-blue-500 rounded-full transition-all duration-200"
                                    style={{ width: `${((startYear - minYear) / (maxYear - minYear)) * 100}%` }}
                                />
                                <div
                                    className="absolute -top-1 transform -translate-x-1/2 transition-all duration-200"
                                    style={{ left: `${((startYear - minYear) / (maxYear - minYear)) * 100}%` }}
                                >
                                    <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
                                </div>
                            </div>

                            {/* Range slider (invisible but functional) */}
                            <input
                                type="range"
                                min={minYear}
                                max={maxYear}
                                value={startYear}
                                onChange={handleYearChange}
                                className="absolute w-full h-6 -top-2 opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChartPerYear