import { useEffect, useRef } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import styles from './LineChart.module.css'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

interface LineChartProps {
    labels: string[]
    datasets: {
        label: string
        data: number[]
        type?: string
    }[]
    title?: string
    height?: number
}

const LineChart = ({ labels, datasets, title, height = 300 }: LineChartProps) => {
    const chartRef = useRef<ChartJS<'line'>>(null)

    // gnerate dynamic class name for height
    const heightClass = `height${height}`

    const colors = [
        {
            border: 'rgb(75, 192, 192)',
            background: 'rgba(75, 192, 192, 0.1)'
        },
        {
            border: 'rgb(255, 99, 132)',
            background: 'rgba(255, 99, 132, 0.1)'
        },
        {
            border: 'rgb(54, 162, 235)',
            background: 'rgba(54, 162, 235, 0.1)'
        },
        {
            border: 'rgb(255, 206, 86)',
            background: 'rgba(255, 206, 86, 0.1)'
        }
    ]

    const chartData = {
        labels,
        datasets: datasets.map((dataset, index) => ({
            label: dataset.label,
            data: dataset.data,
            borderColor: colors[index % colors.length].border,
            backgroundColor: colors[index % colors.length].background,
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: colors[index % colors.length].border,
            pointBorderColor: '#fff',
            pointBorderWidth: 2
        }))
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif"
                    },
                    padding: 15,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            title: {
                display: !!title,
                text: title,
                font: {
                    size: 16,
                    weight: 600,
                    family: "'Inter', sans-serif"
                },
                padding: {
                    top: 10,
                    bottom: 20
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: {
                    size: 13,
                    weight: 600
                },
                bodyFont: {
                    size: 12
                },
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                displayColors: true,
                callbacks: {
                    label: function(context: any) {
                        let label = context.dataset.label || ''
                        if (label) {
                            label += ': '
                        }
                        if (context.parsed.y !== null) {
                            //format based on dataset type
                            const datasetType = datasets[context.datasetIndex]?.type
                            if (datasetType === 'revenue' || datasetType === 'stockValue') {
                                label += '₱' + context.parsed.y.toLocaleString('en-PH', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })
                            } else {
                                label += context.parsed.y.toLocaleString()
                            }
                        }
                        return label
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 11,
                        family: "'Inter', sans-serif"
                    },
                    maxRotation: 45,
                    minRotation: 0
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                    font: {
                        size: 11,
                        family: "'Inter', sans-serif"
                    },
                    callback: function(value: any) {
                        //format based on first dataset type
                        const firstDatasetType = datasets[0]?.type
                        if (firstDatasetType === 'revenue' || firstDatasetType === 'stockValue') {
                            return '₱' + value.toLocaleString()
                        }
                        return value.toLocaleString()
                    }
                }
            }
        },
        interaction: {
            mode: 'index' as const,
            intersect: false
        }
    }

    useEffect(() => {
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy()
            }
        }
    }, [])

    return (
        <div className={`${styles.chartContainer} ${styles[heightClass] || ''}`}>
            <Line ref={chartRef} data={chartData} options={options} />
        </div>
    )
}

export default LineChart