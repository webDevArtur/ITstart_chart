import React, { useState, useEffect } from 'react';
import { Card } from '@consta/uikit/Card';
import { Text } from '@consta/uikit/Text';
import { ReactECharts, ReactEChartsProps } from '../Echarts/ReactECharts';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Typography from '@mui/material/Typography';

interface ChartDataItem {
  date: string;
  value: number;
  indicator: string;
}

const Dashboard: React.FC = () => {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('Курс доллара');
  const [minYValue, setMinYValue] = useState<number>(0);
  const [maxYValue, setMaxYValue] = useState<number>(0);
  const [currencyLabel, setCurrencyLabel] = useState<string>('КУРС ДОЛЛАРА, $/₽');
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    fetchChartData();
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  const checkIsMobile = () => {
    setIsMobile(window.innerWidth < 895);
  };

  const fetchChartData = async () => {
    try {
      const response = await fetch('https://65d9b500bcc50200fcdbf92c.mockapi.io/graph/v1/point');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data: ChartDataItem[] = await response.json();
      setChartData(data);

      const values = data.filter((item: ChartDataItem) => item.indicator === selectedCurrency).map((item: ChartDataItem) => item.value);
      const minY = Math.min(...values);
      const maxY = Math.max(...values);
      setMinYValue(minY);
      setMaxYValue(maxY);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  const handleCurrencyChange = (currency: string, label: string) => {
    setSelectedCurrency(currency);
    setCurrencyLabel(label);
    const values = chartData.filter(item => item.indicator === currency).map(item => item.value);
    const minY = Math.min(...values);
    const maxY = Math.max(...values);
    setMinYValue(minY);
    setMaxYValue(maxY);
  };

  const filteredData = chartData.filter(item => item.indicator === selectedCurrency);

  const averageValue = filteredData.reduce((total, item) => total + item.value, 0) / filteredData.length;

  const options: ReactEChartsProps['option'] = {
    xAxis: {
      type: 'category',
      data: filteredData.map(item => item.date),
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      min: minYValue,
      max: maxYValue,
      axisLabel: {
        show: true,
        formatter: '{value}',
        textStyle: {
          color: '#666',
          fontSize: 12,
        },
      },
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '15%',
      bottom: '15%',
    },
    tooltip: {
      trigger: 'axis',
    },
    series: [
      {
        name: selectedCurrency,
        type: 'line',
        data: filteredData.map(item => item.value),
        lineStyle: {
          color: '#F38B00',
        }
      },
    ],
  };

  return (
      <div style={{ width: '100%', height: '100%' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px' }}>
            <Text size="l" weight="bold" style={{ marginRight: '20px', fontFamily: 'Inter', fontWeight: 700, fontSize: '20px', lineHeight: '30px' }}>{currencyLabel}</Text>
            <ButtonGroup variant="contained" aria-label="Basic button group">
              <Button onClick={() => handleCurrencyChange('Курс доллара', 'КУРС ДОЛЛАРА, $/₽')} style={{ backgroundColor: selectedCurrency === 'Курс доллара' ? '#1976d2' : 'white', color: selectedCurrency === 'Курс доллара' ? 'white' : 'black' }}> $</Button>
              <Button onClick={() => handleCurrencyChange('Курс евро', 'КУРС ЕВРО, €/₽')} style={{ backgroundColor: selectedCurrency === 'Курс евро' ? '#1976d2' : 'white', color: selectedCurrency === 'Курс евро' ? 'white' : 'black' }}>€</Button>
              <Button onClick={() => handleCurrencyChange('Курс юаня', 'КУРС ЮАНЯ, ¥/₽')} style={{ backgroundColor: selectedCurrency === 'Курс юаня' ? '#1976d2' : 'white', color: selectedCurrency === 'Курс юаня' ? 'white' : 'black' }}>¥</Button>
            </ButtonGroup>
          </div>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'row'}}>
            <div style={{ height: 'calc(100vh - 300px)', width: '85%' }}>
              <ReactECharts option={options} />
            </div>
            <div style={{ marginRight: '1em', width: '15%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="body2" style={{ display: 'flex', justifyContent: 'start', fontFamily: 'Inter', fontWeight: 400, fontSize: isMobile ? '10px' : '16px', lineHeight: isMobile ? '20px' : '24px', color: '#667985' }}>
                Среднее за период
              </Typography>
              <Typography variant="body2" fontWeight="bold" style={{ fontFamily: 'Inter', fontSize: isMobile ? '28px' : '48px', lineHeight: isMobile ? '48px' : '72px', color: '#FFA500', display: 'flex', alignItems: 'center' }}>
                {averageValue.toFixed(1)}<span style={{ fontFamily: 'Inter', fontSize: isMobile ? '14px' : '20px', lineHeight: isMobile ? '30px' : '72px', color: '#667985', marginLeft: '5px' }} > ₽</span>
              </Typography>
            </div>
          </div>
        </Card>
      </div>
  );
};

export default Dashboard;
