"use strict";
let rawData = null;
const currentFilters = {
    borough: '',
    neighborhood: '',
    buildingClass: '',
};
let lineChart = null;
let barChart = null;
let pieChart = null;
let unitsLineChart = null;
let tableChart = null;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('spinner').style.display = 'flex';

    fetch('https://raw.githubusercontent.com/Team10Jakarta/Project-SE/main/NYC%20DATASET.json')
        .then(response => response.json())
        .then(data => {
            rawData = data;
            populateFilters(rawData);
            filter(rawData);

            document.getElementById('spinner').style.display = 'none';
        })
});

function filter(data) {
    const salesData = processData(data);
    const recordCountElement = document.getElementById('recordCountValue');
    const totalSales = salesData.tableData.reduce((total, neighborhood) => total + neighborhood.totalSales, 0);
    recordCountElement.textContent = totalSales;

    createLineChart('lineChart', salesData.lineData);
    createPieChart('pieChart', salesData.priceRangeData);
    createUnitsLineChart('unitsLineChart', salesData);
    createBarChart('barChart', salesData.barData);
    createTableChart('tableChart', salesData.tableData);
}

function populateFilters(data) {
    const boroughSet = new Set();
    const neighborhoodSet = new Set();
    const buildingClassSet = new Set();

    data.forEach(item => {
        boroughSet.add(item.BOROUGH);
        neighborhoodSet.add(item.NEIGHBORHOOD);
        buildingClassSet.add(item.BUILDING_CLASS_CATEGORY);
    });

    const sortedBoroughs = Array.from(boroughSet).sort();
    const sortedNeighborhoods = Array.from(neighborhoodSet).sort();
    const sortedBuildingClasses = Array.from(buildingClassSet).sort();

    const boroughFilter = document.getElementById('boroughFilter');
    const neighborhoodFilter = document.getElementById('neighborhoodFilter');
    const buildingClassFilter = document.getElementById('buildingClassFilter');

    sortedBoroughs.forEach(borough => {
        const option = document.createElement('option');
        option.value = borough;
        option.textContent = borough;
        boroughFilter.appendChild(option);
    });

    sortedNeighborhoods.forEach(neighborhood => {
        const option = document.createElement('option');
        option.value = neighborhood;
        option.textContent = neighborhood;
        neighborhoodFilter.appendChild(option);
    });

    sortedBuildingClasses.forEach(buildingClass => {
        const option = document.createElement('option');
        option.value = buildingClass;
        option.textContent = buildingClass;
        buildingClassFilter.appendChild(option);
    });

    boroughFilter.addEventListener('change', (event) => {
        currentFilters.borough = event.target.value;
        if (currentFilters.borough === '') {
            currentFilters.neighborhood = '';
            currentFilters.buildingClass = '';
            updateNeighborhoodFilter(rawData);
            updateBuildingClassFilter(rawData);
            filter(rawData);
        } else {
            filter(rawData);
            updateNeighborhoodFilter(rawData);
            updateBuildingClassFilter(rawData);
        }
    });

    neighborhoodFilter.addEventListener('change', (event) => {
        currentFilters.neighborhood = event.target.value;
        filter();
        updateBuildingClassFilter(data);
    });

    buildingClassFilter.addEventListener('change', (event) => {
        currentFilters.buildingClass = event.target.value;
        filter();
    });
}

function updateNeighborhoodFilter(data) {
    const neighborhoodFilter = document.getElementById('neighborhoodFilter');
    neighborhoodFilter.innerHTML = '<option value="">All Neighborhood</option>';

    if (currentFilters.borough === '') {
        const neighborhoodSet = new Set();
        data.forEach(item => {
            neighborhoodSet.add(item.NEIGHBORHOOD);
        });

        const sortedNeighborhoods = Array.from(neighborhoodSet).sort();

        sortedNeighborhoods.forEach(neighborhood => {
            const option = document.createElement('option');
            option.value = neighborhood;
            option.textContent = neighborhood;
            neighborhoodFilter.appendChild(option);
        });
    } else {
        // Jika filter borough lain dipilih, update daftar neighborhood sesuai dengan borough yang dipilih
        const neighborhoodSet = new Set();
        data.forEach(item => {
            if (currentFilters.borough === '' || item.BOROUGH === currentFilters.borough) {
                neighborhoodSet.add(item.NEIGHBORHOOD);
            }
        });

        const sortedNeighborhoods = Array.from(neighborhoodSet).sort();

        sortedNeighborhoods.forEach(neighborhood => {
            const option = document.createElement('option');
            option.value = neighborhood;
            option.textContent = neighborhood;
            neighborhoodFilter.appendChild(option);
        });
    }
}

function updateBuildingClassFilter(data) {
    const buildingClassFilter = document.getElementById('buildingClassFilter');
    buildingClassFilter.innerHTML = '<option value="">All Building Class Category</option>';

    if (currentFilters.borough === '') {
        const buildingClassSet = new Set();
        data.forEach(item => {
            buildingClassSet.add(item.BUILDING_CLASS_CATEGORY);
        });

        const sortedBuildingClasses = Array.from(buildingClassSet).sort();

        sortedBuildingClasses.forEach(buildingClass => {
            const option = document.createElement('option');
            option.value = buildingClass;
            option.textContent = buildingClass;
            buildingClassFilter.appendChild(option);
        });
    } else {
        const buildingClassSet = new Set();
        data.forEach(item => {
            if ((currentFilters.borough === '' || item.BOROUGH === currentFilters.borough) &&
                (currentFilters.neighborhood === '' || item.NEIGHBORHOOD === currentFilters.neighborhood)) {
                buildingClassSet.add(item.BUILDING_CLASS_CATEGORY);
            }
        });

        const sortedBuildingClasses = Array.from(buildingClassSet).sort();

        sortedBuildingClasses.forEach(buildingClass => {
            const option = document.createElement('option');
            option.value = buildingClass;
            option.textContent = buildingClass;
            buildingClassFilter.appendChild(option);
        });
    }
}

function updateBuildingClassFilter(data) {
    const buildingClassFilter = document.getElementById('buildingClassFilter');
    buildingClassFilter.innerHTML = '<option value="">All Building Class Category</option>';

    const buildingClassSet = new Set();
    data.forEach(item => {
        if ((currentFilters.borough === '' || item.BOROUGH === currentFilters.borough) &&
            (currentFilters.neighborhood === '' || item.NEIGHBORHOOD === currentFilters.neighborhood)) {
            buildingClassSet.add(item.BUILDING_CLASS_CATEGORY);
        }
    });

    const sortedBuildingClasses = Array.from(buildingClassSet).sort();

    sortedBuildingClasses.forEach(buildingClass => {
        const option = document.createElement('option');
        option.value = buildingClass;
        option.textContent = buildingClass;
        buildingClassFilter.appendChild(option);
    });
}

function processData(data) {
    const filteredData = rawData.filter(item => {
        return (currentFilters.borough === '' || item.BOROUGH === currentFilters.borough) &&
            (currentFilters.neighborhood === '' || item.NEIGHBORHOOD === currentFilters.neighborhood) &&
            (currentFilters.buildingClass === '' || item.BUILDING_CLASS_CATEGORY === currentFilters.buildingClass);
    });
    const salesData = { lineData: {}, lineDatat: {}, barData: {}, priceRangeData: {}, tableData: {} };
    const salesByBorough = {};
    const salesCounts = {};
    const buildingCategoryCounts = {};
    const salesByNeighborhood = {};
    const priceRanges = {
        "$0 - $20": 0,
        "$20 - $100.000": 0,
        "$100.000 - $10.000.000": 0,
        "$10.000.000 - $1.000.000.000": 0,
        "> $1.000.000.000": 0
    };

    const residentialUnits = {};
    const commercialUnits = {};

    filteredData.forEach(item => {
        const neighborhood = item.NEIGHBORHOOD;
        const borough = item.BOROUGH;
        const category = item.BUILDING_CLASS_CATEGORY;
        const saleDate = new Date(item.SALE_DATE);
        const salePrice = parseFloat(item.SALE_PRICE);
        const monthYear = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
        const resUnits = parseInt(item.RESIDENTIAL_UNITS, 10) || 0;
        const comUnits = parseInt(item.COMMERCIAL_UNITS, 10) || 0;

        // Process data for Total Sales in Each Borough by Month (Chart 1)
        if (!salesByBorough[borough]) {
            salesByBorough[borough] = {};
        }
        if (!salesByBorough[borough][monthYear]) {
            salesByBorough[borough][monthYear] = 0;
        }
        salesByBorough[borough][monthYear]++;

        // Process data for Sales Distribution by Price Range (Chart 2)
        if (salePrice >= 0 && salePrice <= 20) {
            priceRanges["$0 - $20"]++;
        } else if (salePrice > 20 && salePrice <= 100000) {
            priceRanges["$20 - $100.000"]++;
        } else if (salePrice > 100000 && salePrice <= 10000000) {
            priceRanges["$100.000 - $10.000.000"]++;
        } else if (salePrice > 10000000 && salePrice <= 1000000000) {
            priceRanges["$10.000.000 - $1.000.000.000"]++;
        } else if (salePrice > 1000000000) {
            priceRanges["> $1.000.000.000"]++;
        }

        // Process data for Sales of Residential and Commercial Units by Month (Chart 3)
        if (!residentialUnits[monthYear]) {
            residentialUnits[monthYear] = 0;
        }
        residentialUnits[monthYear] += resUnits;

        if (!commercialUnits[monthYear]) {
            commercialUnits[monthYear] = 0;
        }
        commercialUnits[monthYear] += comUnits;

        // Process data for Total Sales by Building Class Category (Chart 4)
        if (!buildingCategoryCounts[category]) {
            buildingCategoryCounts[category] = 0;
        }
        buildingCategoryCounts[category]++;

        // Process data for Table of Total Sales by Neighborhood (Chart 5)
        if (!salesByNeighborhood[neighborhood]) {
            salesByNeighborhood[neighborhood] = 1;
        } else {
            salesByNeighborhood[neighborhood]++;
        }
    });

    // Prepare data for Total Sales in Each Borough by Month (Chart 1)
    const labels = Array.from(new Set(filteredData.map(item => {
        const saleDate = new Date(item.SALE_DATE);
        return `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
    }))).sort();

    const lineDatasets = Object.keys(salesByBorough).map(borough => {
        return {
            label: borough,
            data: labels.map(label => salesByBorough[borough][label] || 0),
            fill: false,
            borderColor: getRandomColor(),
            tension: 0.1
        };
    });

    // Prepare data for Sales Distribution by Price Range (Chart 2)
    const priceRangeData = {
        labels: Object.keys(priceRanges),
        datasets: [{
            data: Object.values(priceRanges),
            backgroundColor: Object.keys(priceRanges).map(() => getRandomColor())
        }]
    };

    // Prepare data for Sales of Residential and Commercial Units by Month (Chart 3)
    const lineDatat = {
        labels: labels,
        datasets: [
            {
                label: 'Residential Units',
                data: labels.map(label => residentialUnits[label] || 0),
                borderColor: getRandomColor(),
                fill: false,
                tension: 0.1
            },
            {
                label: 'Commercial Units',
                data: labels.map(label => commercialUnits[label] || 0),
                borderColor: getRandomColor(),
                fill: false,
                tension: 0.1
            }
        ]
    };

    const barData = {
        labels: Object.keys(buildingCategoryCounts),
        datasets: [{
            label: null,
            data: Object.values(buildingCategoryCounts),
            backgroundColor: Object.keys(buildingCategoryCounts).map(() => getRandomColor()),
        }]
    };

    // Prepare data for Table of Total Sales by Neighborhood (Chart 5)
    const tableData = Object.keys(salesByNeighborhood).map(neighborhood => ({
        neighborhood: neighborhood,
        totalSales: salesByNeighborhood[neighborhood]
    }));

    salesData.lineData = { labels, datasets: lineDatasets };
    salesData.lineDatat = lineDatat;
    salesData.barData = barData;
    salesData.priceRangeData = priceRangeData;
    salesData.tableData = tableData;
    return salesData;
}

function createLineChart(chartId, lineData) {
    if (lineChart) {
        lineChart.destroy();
    }
    const chartContainer = document.getElementById(chartId).parentNode;

    const ctx = document.getElementById(chartId).getContext('2d');

    let titleFontSize, legendFontSize, ticksFontSize, scalesTitleFontSize;

    const setResponsiveFontSizes = () => {
        let width = window.innerWidth;
        if (width <= 575) {
            titleFontSize = 10;
            legendFontSize = 5;
            ticksFontSize = 5;
            scalesTitleFontSize = 5;
        } else if (width <= 1105) {
            titleFontSize = 12;
            legendFontSize = 8;
            ticksFontSize = 8;
            scalesTitleFontSize = 8;
        } else {
            titleFontSize = 20;
            legendFontSize = 12;
            ticksFontSize = 10;
            scalesTitleFontSize = 10;
        }
    };

    setResponsiveFontSizes();

    window.addEventListener('resize', () => {
        createLineChart(chartId, lineData);
    });

    lineChart = new Chart(ctx, {
        type: 'line',
        data: lineData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Total Sales in Each Borough by Month',
                    color: '#ffffff',
                    font: { family: 'Libre Baskerville', size: titleFontSize },
                    padding: { top: 10, bottom: 10 }
                },
                legend: {
                    position: 'top',
                    labels: { color: '#ffffff', font: { family: 'Libre Baskerville', size: legendFontSize } }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#ffffff', font: { family: 'Libre Baskerville', size: ticksFontSize } },
                    title: {
                        display: true,
                        text: 'Year-Month',
                        color: '#ffffff',
                        font: {
                            family: 'Libre Baskerville',
                            size: scalesTitleFontSize
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#ffffff',
                        font: {
                            family: 'Libre Baskerville',
                            size: ticksFontSize
                        }
                    },
                    title: {
                        display: true,
                        text: 'Total Sales',
                        color: '#ffffff',
                        font: {
                            family: 'Libre Baskerville',
                            size: scalesTitleFontSize
                        }
                    }
                }
            }
        }
    });
}

function createBarChart(chartId, barData) {
    if (barChart) {
        barChart.destroy();
    }
    const chartContainer = document.getElementById(chartId).parentNode;

    const ctx = document.getElementById(chartId).getContext('2d');

    let titleFontSize, legendFontSize, ticksFontSize, scalesTitleFontSize;

    const setResponsiveFontSizes = () => {
        let width = window.innerWidth;
        if (width <= 575) {
            titleFontSize = 10;
            legendFontSize = 5;
            ticksFontSize = 5;
            scalesTitleFontSize = 5;
        } else if (width <= 1105) {
            titleFontSize = 12;
            legendFontSize = 8;
            ticksFontSize = 8;
            scalesTitleFontSize = 8;
        } else {
            titleFontSize = 20;
            legendFontSize = 12;
            ticksFontSize = 10;
            scalesTitleFontSize = 10;
        }
    };

    setResponsiveFontSizes();

    window.addEventListener('resize', () => {
        createBarChart(chartId, barData);
    });

    barChart = new Chart(ctx, {
        type: 'bar',
        data: barData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Total Sales by Building Class Category',
                    color: '#ffffff',
                    font: { family: 'Libre Baskerville', size: titleFontSize },
                    padding: { top: 10, bottom: 10 }
                },
                legend: { display: false }
            },
            scales: {
                x: {
                    ticks: { color: '#ffffff', font: { family: 'Libre Baskerville', size: ticksFontSize } },
                    title: {
                        display: true,
                        text: 'Building Class Category',
                        color: '#ffffff',
                        font: {
                            family: 'Libre Baskerville',
                            size: scalesTitleFontSize
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: '#ffffff', font: { family: 'Libre Baskerville', size: ticksFontSize } },
                    title: {
                        display: true,
                        text: 'Total Sales',
                        color: '#ffffff',
                        font: {
                            family: 'Libre Baskerville',
                            size: scalesTitleFontSize
                        },
                    }
                }
            }
        }
    });
}

function createUnitsLineChart(chartId, salesData) {
    if (unitsLineChart) {
        unitsLineChart.destroy();
    }
    const chartContainer = document.getElementById(chartId).parentNode;

    const ctx = document.getElementById(chartId).getContext('2d');

    let titleFontSize, legendFontSize, ticksFontSize, scalesTitleFontSize;

    const setResponsiveFontSizes = () => {
        let width = window.innerWidth;
        if (width <= 575) {
            titleFontSize = 10;
            legendFontSize = 5;
            ticksFontSize = 5;
            scalesTitleFontSize = 5;
        } else if (width <= 1105) {
            titleFontSize = 12;
            legendFontSize = 8;
            ticksFontSize = 8;
            scalesTitleFontSize = 8;
        } else {
            titleFontSize = 20;
            legendFontSize = 12;
            ticksFontSize = 10;
            scalesTitleFontSize = 10;
        }
    };

    setResponsiveFontSizes();

    window.addEventListener('resize', () => {
        createUnitsLineChart(chartId, salesData);
    });

    unitsLineChart = new Chart(ctx, {
        type: 'line',
        data: salesData.lineData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Sales of Residential and Commercial Units by Month',
                    color: '#ffffff',
                    font: { family: 'Libre Baskerville', size: titleFontSize },
                    padding: { top: 10, bottom: 10 }
                },
                legend: {
                    position: 'top',
                    labels: { color: '#ffffff', font: { family: 'Libre Baskerville', size: legendFontSize } }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#ffffff', font: { family: 'Libre Baskerville', size: ticksFontSize } },
                    title: {
                        display: true,
                        text: 'Year-Month',
                        color: '#ffffff',
                        font: {
                            family: 'Libre Baskerville',
                            size: scalesTitleFontSize
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: '#ffffff', font: { family: 'Libre Baskerville', size: ticksFontSize } },
                    title: {
                        display: true,
                        text: 'Units Sold',
                        color: '#ffffff',
                        font: {
                            family: 'Libre Baskerville',
                            size: scalesTitleFontSize
                        }
                    }
                }
            }
        }
    });
}

function createPieChart(chartId, priceRangeData) {
    if (pieChart) {
        pieChart.destroy();
    }

    const chartContainer = document.getElementById(chartId).parentNode;
    const ctx = document.getElementById(chartId).getContext('2d');

    let titleFontSize, legendFontSize, datalabelFontSize;
    if (window.innerWidth <= 575) {
        titleFontSize = Math.max(10);
        legendFontSize = Math.max(5);
        datalabelFontSize = Math.max(5);
    } else if (window.innerWidth >= 576 && window.innerWidth <= 1105) {
        titleFontSize = Math.max(12);
        legendFontSize = Math.max(8);
        datalabelFontSize = Math.max(8);
    } else {
        titleFontSize = Math.max(20);
        legendFontSize = Math.max(12);
        datalabelFontSize = Math.max(12);
    }

    window.addEventListener('resize', () => {
        createPieChart(chartId, priceRangeData);
    });

    pieChart = new Chart(ctx, {
        type: 'pie',
        data: priceRangeData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Sales Distribution by Price Range',
                    color: '#ffffff',
                    font: {
                        family: 'Libre Baskerville',
                        size: titleFontSize
                    },
                    padding: {
                        top: 10,
                        bottom: 10
                    }
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ffffff',
                        font: {
                            family: 'Libre Baskerville',
                            size: legendFontSize
                        }
                    }
                },
                datalabels: {
                    formatter: (value, context) => {
                        let sum = 0;
                        const dataArr = context.chart.data.datasets[0].data;
                        dataArr.forEach(data => sum += data);
                        const percentage = (value * 100 / sum).toFixed(2) + "%";
                        return percentage;
                    },
                    color: 'black',
                    font: {
                        family: 'Libre Baskerville',
                        size: datalabelFontSize,
                        weight: 'bolder',
                    },
                    display: (context) => {
                        const value = context.dataset.data[context.dataIndex];
                        let sum = 0;
                        context.dataset.data.forEach(data => sum += data);
                        const percentage = (value * 100 / sum);
                        return percentage >= 4;
                    },
                    textStrokeColor: 'white',
                    textStrokeWidth: 2
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function createTableChart(chartId, tableData) {
    if ($.fn.DataTable.isDataTable(`#${chartId}`)) {
        $(`#${chartId}`).DataTable().destroy();
    }
    $(`#${chartId}`).empty();

    const columnNames = {
        neighborhood: 'Neighborhood',
        totalSales: 'Sales Count'
    };

    const columns = Object.keys(tableData[0]);

    let thead = '<thead><tr>';
    columns.forEach(col => {
        thead += `<th>${columnNames[col] || col}</th>`;
    });
    thead += '</tr></thead>';

    $(`#${chartId}`).append(thead);

    const listColumn = columns.map(col => {
        return {
            data: col
        };
    });

    const orderColumnIndex = columns.indexOf('totalSales');

    tableChart = new DataTable(`#${chartId}`, {
        caption: "Table of Sales Count by Neighborhood",
        columns: listColumn,
        data: tableData,
        responsive: true,
        pagingType: "simple_numbers",
        paging: true,
        info: true,
        order: [[orderColumnIndex, 'desc']]
    });
}


function getRandomColor() {
    const letters = 'ABCDEF0123456789';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

window.onscroll = function () { scrollFunction() };

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        document.getElementById("myBtn").style.display = "block";
    } else {
        document.getElementById("myBtn").style.display = "none";
    }
}

function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}