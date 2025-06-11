import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CountryPerYear, PopulationPerYear } from '../api/country';
import Flag from 'react-world-flags';

const PopulationChart = () => {
  const [currentYear, setCurrentYear] = useState(1950);
  const [isPlaying, setIsPlaying] = useState(false);
  const [populationData, setPopulationData] = useState([]);
  const [worldPopulation, setWorldPopulation] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // สีสำหรับแต่ละภูมิภาค
  const regionColors = {
    'Asia': '#4472C4',
    'Europe': '#8E44C4',
    'Africa': '#E74C3C',
    'Americas': '#F39C12',
    'Oceania': '#27AE60'
  };

  // กำหนดภูมิภาคของแต่ละประเทศ
  const countryRegions = {
    'China': 'Asia',
    'India': 'Asia',
    'United States': 'Americas',
    'Russia': 'Europe',
    'Japan': 'Asia',
    'Indonesia': 'Asia',
    'Germany': 'Europe',
    'Brazil': 'Americas',
    'United Kingdom': 'Europe',
    'Italy': 'Europe',
    'France': 'Europe',
    'Bangladesh': 'Asia',
    'Pakistan': 'Asia',
    'Nigeria': 'Africa',
    'Mexico': 'Americas',
    'Turkey': 'Asia',
    'Vietnam': 'Asia',
    'Iran': 'Asia',
    'Thailand': 'Asia',
    'South Korea': 'Asia'
  };

  const countryCodeMap = {
    "China": "CN",
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
    "Thailand": "TH",
    "South Korea": "KR"
  };

  // ดึงข้อมูลประชากรตามปี
  const fetchPopulationData = useCallback(async (year) => {
    setLoading(true);
    setError(null);

    try {
      const countryResponse = await CountryPerYear(year);
      const countryResult = countryResponse.data;

      const worldResponse = await PopulationPerYear(year);
      const worldResult = worldResponse.data;

      if (countryResult.success && countryResult.data) {
        setPopulationData(countryResult.data);
      }

      if (worldResult.success && worldResult.data && worldResult.data.length > 0) {
        setWorldPopulation(worldResult.data[0].Population || 0);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // โหลดข้อมูลเมื่อปีเปลี่ยน
  useEffect(() => {
    fetchPopulationData(currentYear);
  }, [currentYear, fetchPopulationData]);

  // การควบคุมการเล่นอัตโนมัติ
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentYear(prev => {
          if (prev >= 2021) {
            setIsPlaying(false);
            return 2021;
          }
          return prev + 1;
        });
      }, 1000); // เปลี่ยนทุก 500ms
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // ฟังก์ชันจัดการการเล่น/หยุด
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // ฟังก์ชันรีเซ็ต
  const resetAnimation = () => {
    setIsPlaying(false);
    setCurrentYear(1950);
  };

  // จัดรูปแบบตัวเลข
  const formatNumber = (num) => {
    if (typeof num !== 'number') return '0';
    return num.toLocaleString();
  };


  // คำนวณความกว้างของแถบ
  const getBarWidth = (population) => {
    if (!populationData.length) return 0;
    const maxPopulation = Math.max(...populationData.map(item => item.Population));
    return (population / maxPopulation) * 100;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Population growth per country, 1950 to 2021
          </h1>
          <p className="text-gray-600">Click on the legend below to filter by continent 🌍</p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <div className="text-sm text-gray-600 font-semibold">Region</div>
          {Object.entries(regionColors).map(([region, color]) => (
            <div key={region} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-sm text-gray-600">{region}</span>
            </div>
          ))}
        </div>

        {/* Chart Container */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="relative">
              {/* Scale */}
              <div className="flex justify-between text-xs text-gray-500 mb-4">
                <span>0</span>
                <span>200,000,000</span>
                <span>400,000,000</span>
                <span>600,000,000</span>
              </div>

              {/* Bars */}
              <div className="space-y-3">
                {populationData.map((country, index) => {
                  const region = countryRegions[country.Country_name] || 'Asia';
                  const color = regionColors[region];
                  const barWidth = getBarWidth(country.Population);

                  return (
                    <div key={`${country.Country_name}-${index}`} className="flex items-center">
                      {/* Country Name */}
                      <div className="w-24 text-right text-sm text-gray-700 mr-4">
                        {country.Country_name}
                      </div>

                      {/* Flag placeholder */}
                      {/* <div className="w-8 h-6 bg-gray-300 rounded mr-2 flex-shrink-0"></div> */}
                      <Flag code={countryCodeMap[country.Country_name]} style={{ width: 32, height: 20, borderRadius: 4, marginRight: 8, boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)' }} />
                      {/* Bar */}
                      <div className="flex-1 relative">
                        <div
                          className="h-8 rounded transition-all duration-500 ease-out"
                          style={{
                            backgroundColor: color,
                            width: `${barWidth}%`
                          }}
                        ></div>

                        {/* Population Number */}
                        <div className="absolute right-0 top-0 h-8 flex items-center pr-2">
                          <span className="text-sm font-semibold text-gray-700">
                            {formatNumber(country.Population)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Year Display */}
              <div className="absolute bottom-4 right-4">
                <div className="text-8xl font-bold text-gray-300">
                  {currentYear}
                </div>
                <div className="text-right text-gray-500 text-sm">
                  Total: {formatNumber(worldPopulation)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center gap-4 mb-6">
          <button
            onClick={togglePlay}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          <button
            onClick={resetAnimation}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <RotateCcw size={20} />
            Reset
          </button>
        </div>

        {/* Year Slider */}
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">1950</span>
            <input
              type="range"
              min="1950"
              max="2021"
              value={currentYear}
              onChange={(e) => {
                setCurrentYear(parseInt(e.target.value));
                setIsPlaying(false);
              }}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-600">2021</span>
          </div>
          <div className="text-center mt-2">
            <span className="text-lg font-semibold text-gray-700">
              Year: {currentYear}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Source: Your Database Population Data</p>
          <p className="mt-2">
            โจทย์: ให้หาข้อมูล Database ไม่ให้ใส่ แสดงข้อมูล Population growth per country 1950 to 2021
          </p>
          <ul className="mt-2 text-left max-w-2xl mx-auto">
            <li>• ข้อมูลที่นำมาใส่แสดง ให้ดึงข้อมูล API มาจาก ไฟล์ Excel</li>
            <li>• ทำหน้าจอให้ใส่แบบด้วยข้อมูลหนึ่งข้อ ให้กรองเพื่อรีน-ลงลำดับตามจำนวนประชากรของแต่ละประเทศ (ตามให้ใส่แบบ)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PopulationChart;