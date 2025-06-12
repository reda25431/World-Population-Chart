import React, { useEffect, useState } from 'react'
import { CountryPerYear, PopulationPerYear } from '../api/country';
import { CirclePlay, CirclePause } from 'lucide-react';
import Flag from 'react-world-flags';

const ChartPerYear = () => {
    const minYear = 1950;
    const maxYear = 2021;

    const [startYear, setStartYear] = useState(minYear);
    const [isPlaying, setIsPlaying] = useState(false);
    const [countryData, setCountryData] = useState([]);
    const [worldPopulation, setWorldPopulation] = useState([]);
    const [dynamicMax, setDynamicMax] = useState(200000000);

    const fetchPopulationData = async (year) => {
        try {
            const countryTop = await CountryPerYear(year);
            const countryResult = countryTop.data;

            if (countryResult.data) {
                setCountryData(countryResult.data);
                const maxPopulation = Math.max(...countryResult.data.map(c => c.Population));

                const step = 100000000;
                const targetMax = Math.ceil(maxPopulation / step) * step;

                setDynamicMax(prev => {
                    if (targetMax > prev) {
                        return targetMax;
                    }
                    return prev;
                });
            }
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
        } catch (error) {
            console.log('Error fetching data: ', error);
        }
    }

    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                setStartYear(prev => {
                    const nextYear = prev >= maxYear ? minYear : prev + 1;

                    if (nextYear === minYear) {
                        setDynamicMax(200000000);
                    }
                    fetchPopulationData(nextYear);
                    fetchWorldResult(nextYear);

                    return nextYear;
                });
            }, 500);
        }
        return () => clearInterval(interval);
    }, [isPlaying, maxYear, minYear]);

    useEffect(() => {
        if (!isPlaying) {
            fetchPopulationData(startYear);
            fetchWorldResult(startYear);
        }
    }, [startYear, isPlaying]);

    useEffect(() => {
        fetchPopulationData(startYear);
        fetchWorldResult(startYear);
    }, []);

    const formatNumber = (num) => {
        if (typeof num !== 'number') return '0';
        return num.toLocaleString();
    };

    const handleYearChange = (e) => {
        const newYear = Number(e.target.value);
        setStartYear(newYear);
        setIsPlaying(false);
    };

    const renderXAxisLabels = () => {
        const step = 100000000;
        const count = Math.ceil(dynamicMax / step);
        return Array.from({ length: count + 1 }, (_, i) => i * step).map((val, i) => (
            <div key={i} className="relative w-1/6 text-center">
                <span className="text-xs text-gray-500">{formatNumber(val)}</span>
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-px bg-gray-300 h-[530px]" />
            </div>
        ));
    };

    const countryCodeMap = {
        "China": "CN",
        "Philippines": "PH",
        "India": "IN",
        "United States": "US",
        "Russia": "RU",
        "Japan": "JP",
        "Indonesia": "ID",
        "Germany": "DE",
        "Brazil": "BR",
        "United Kingdom": "GB",
        "Italy": "IT",
        "France": "FR",
        "Bangladesh": "BD",
        "Pakistan": "PK",
        "Nigeria": "NG",
        "Mexico": "MX",
        "Turkey": "TR",
        "Vietnam": "VN",
        "Iran": "IR",
        "Ethiopia": "ET",
        "South Korea": "KR",
        "Egypt": "EG",
        "Ukraine": "UA",
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4">
                {/* chart */}
                <div className="w-full bg-white flex flex-col items-center justify-center p-8 rounded-t-lg shadow-lg">
                    {/* header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Population growth per country, 1950 to 2021</h1>
                        <p className="text-gray-600">Click on the legend below to filter by continent</p>
                    </div>

                    {/* Region Color */}
                    <div className="m-6 flex flex-wrap gap-4 justify-center">
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
                            <span className="text-sm">Oceania</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                            <span className="text-sm">Americas</span>
                        </div>
                    </div>

                    {/* Chart container */}
                    <div className=" w-full relative bg-gray-50 p-6 rounded-lg">
                        {/* X-axis labels */}
                        <div className="relative mb-2">
                            <div className="flex justify-between relative">
                                {renderXAxisLabels()}
                            </div>
                        </div>

                        {/* Chart area */}
                        <div className="space-y-3">
                            {countryData
                                .map((country, index) => {
                                    const width = Math.max((country.Population / dynamicMax) * 90, 1);
                                    const continentColors = {
                                        'Asia': '#4F46E5', // Blue
                                        'Europe': '#8B5CF6', // Purple  
                                        'Africa': '#EF4444', // Red
                                        'Oceania': '#F59E0B', // Orange
                                        'Americas': '#FFC300', // Yellow
                                    };
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
                                                    className="h-8 transition-all duration-700 ease-out rounded-r-md relative flex items-center justify-end"
                                                    style={{
                                                        width: `${width}%`,
                                                        backgroundColor: color,
                                                        minWidth: '20px',
                                                        paddingRight: '4px',
                                                    }}
                                                >
                                                    <Flag code={countryCodeMap[country.Country_name]} className="w-6 h-6 rounded-full shadow-md object-cover" />
                                                </div>
                                                {/* Count */}
                                                <div
                                                    className="absolute top-1/2 -translate-y-1/2 text-sm font-medium text-gray-800 whitespace-nowrap"
                                                    style={{ left: `calc(${width}% + 8px)` }}
                                                >
                                                    {formatNumber(country.Population)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>

                        {/* Year display */}
                        <div className="w-full absolute bottom-0 right-10 mt-2 mr-2 text-right z-50">
                            <div className="text-6xl font-bold text-gray-500 mb-2">
                                {startYear}
                            </div>
                            <div className="text-2xl font-medium text-gray-500">
                                Total: {formatNumber(worldPopulation)}
                            </div>
                        </div>
                    </div>
                </div>
                {/* controls */}
                <div className="w-full bg-white flex flex-col items-center justify-center p-8 rounded-b-lg shadow-lg">
                    {/* Main content area */}
                    <div className="w-full max-w-4xl relative">
                        {/* Button */}
                        <div className="relative mb-8">
                            {/* Play/Pause Button */}
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="cursor-pointer absolute -top-8 left-0 w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors shadow-lg"
                            >
                                {isPlaying ? <CirclePause size={24} /> : <CirclePlay size={24} />}
                            </button>
                        </div>

                        {/* Timeline container */}
                        <div className="mt-8">
                            {/* Year */}
                            <div className="relative h-5 mb-2">
                                {Array.from({ length: 18 }, (_, i) => {
                                    const y = minYear + i * 4;
                                    const position = ((y - minYear) / (maxYear - minYear)) * 100;

                                    return y <= maxYear ? (
                                        <span
                                            key={y}
                                            className="absolute text-xs text-gray-500 font-mono transform -translate-x-1/2"
                                            style={{ left: `${position}%` }}
                                        >
                                            {y}
                                        </span>
                                    ) : null;
                                })}
                            </div>

                            {/* Timeline Slider */}
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

                            {/* get year */}
                            <input
                                type="range"
                                min={minYear}
                                max={maxYear}
                                step={4}
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