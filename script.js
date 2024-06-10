"use strict";
let rawData = null;
const currentFilters = {
    borough: '',
    neighborhood: '',
    buildingClass: '',
};
let lineChart;
let barChart;
let pieChart;
let unitsLineChart;
let tableChart;

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
    createUnitsLineChart('unitsLineChart', salesData.lineDatat);
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

function processData(data) {
    const filteredData = rawData.filter(item => {
        return (currentFilters.borough === '' || item.BOROUGH === currentFilters.borough) &&
            (currentFilters.neighborhood === '' || item.NEIGHBORHOOD === currentFilters.neighborhood) &&
            (currentFilters.buildingClass === '' || item.BUILDING_CLASS_CATEGORY === currentFilters.buildingClass);
    });
    const salesData = { lineData: {}, lineDatat: {}, barData: {}, priceRangeData: {}, tableData: {} };
    const salesByBorough = {};
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
    const initializeNestedObject = (obj, key, subKey, initialValue = 0) => {
        if (!obj[key]) {
            obj[key] = {};
        }
        if (!obj[key][subKey]) {
            obj[key][subKey] = initialValue;
        }
    };

    const processSalesByBorough = (borough, monthYear) => {
        initializeNestedObject(salesByBorough, borough, monthYear);
        salesByBorough[borough][monthYear]++;
    };

    const processPriceRange = (salePrice) => {
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
    };

    const processUnitsByMonth = (monthYear, resUnits, comUnits) => {
        if (!residentialUnits[monthYear]) {
            residentialUnits[monthYear] = 0;
        }
        residentialUnits[monthYear] += resUnits;

        if (!commercialUnits[monthYear]) {
            commercialUnits[monthYear] = 0;
        }
        commercialUnits[monthYear] += comUnits;
    };

    const processBuildingCategory = (category) => {
        if (!buildingCategoryCounts[category]) {
            buildingCategoryCounts[category] = 0;
        }
        buildingCategoryCounts[category]++;
    };

    const processSalesByNeighborhood = (neighborhood) => {
        if (!salesByNeighborhood[neighborhood]) {
            salesByNeighborhood[neighborhood] = 1;
        } else {
            salesByNeighborhood[neighborhood]++;
        }
    };

    filteredData.forEach(item => {
        const neighborhood = item.NEIGHBORHOOD;
        const borough = item.BOROUGH;
        const category = item.BUILDING_CLASS_CATEGORY;
        const saleDate = new Date(item.SALE_DATE);
        const salePrice = parseFloat(item.SALE_PRICE);
        const monthYear = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
        const resUnits = parseInt(item.RESIDENTIAL_UNITS, 10) || 0;
        const comUnits = parseInt(item.COMMERCIAL_UNITS, 10) || 0;

        processSalesByBorough(borough, monthYear);
        processPriceRange(salePrice);
        processUnitsByMonth(monthYear, resUnits, comUnits);
        processBuildingCategory(category);
        processSalesByNeighborhood(neighborhood);
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

    // Prepare data for Table of Sales Count by Neighborhood (Chart 5)
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

function setResponsiveFontSizes() {
    let width = window.innerWidth;
    if (width <= 575) {
        return { title: 10, legend: 5, ticks: 5, scalesTitle: 5, datalabel: 5 };
    } else if (width <= 1105) {
        return { title: 12, legend: 8, ticks: 8, scalesTitle: 8, datalabel: 8 };
    } else {
        return { title: 20, legend: 12, ticks: 10, scalesTitle: 10, datalabel: 10 };
    }
}

function createLineChart(chartId, lineData) {
    if (lineChart) {
        lineChart.destroy();
    }

    const ctx = document.getElementById(chartId).getContext('2d');

    const { title, legend, ticks, scalesTitle } = setResponsiveFontSizes();

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
                    font: { family: 'Libre Baskerville', size: title },
                    padding: { top: 10, bottom: 10 }
                },
                legend: {
                    position: 'top',
                    labels: { color: '#ffffff', font: { family: 'Libre Baskerville', size: legend } }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#ffffff', font: { family: 'Libre Baskerville', size: ticks } },
                    title: {
                        display: true,
                        text: 'Year-Month',
                        color: '#ffffff',
                        font: {
                            family: 'Libre Baskerville',
                            size: scalesTitle
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#ffffff',
                        font: {
                            family: 'Libre Baskerville',
                            size: ticks
                        }
                    },
                    title: {
                        display: true,
                        text: 'Total Sales',
                        color: '#ffffff',
                        font: {
                            family: 'Libre Baskerville',
                            size: scalesTitle
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

    const ctx = document.getElementById(chartId).getContext('2d');

    const { title, ticks, scalesTitle } = setResponsiveFontSizes();

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
                    font: { family: 'Libre Baskerville', size: title },
                    padding: { top: 10, bottom: 10 }
                },
                legend: { display: false }
            },
            scales: {
                x: {
                    ticks: { color: '#ffffff', font: { family: 'Libre Baskerville', size: ticks } },
                    title: {
                        display: true,
                        text: 'Building Class Category',
                        color: '#ffffff',
                        font: {
                            family: 'Libre Baskerville',
                            size: scalesTitle
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: '#ffffff', font: { family: 'Libre Baskerville', size: ticks } },
                    title: {
                        display: true,
                        text: 'Total Sales',
                        color: '#ffffff',
                        font: {
                            family: 'Libre Baskerville',
                            size: scalesTitle
                        },
                    }
                }
            }
        }
    });
}

function createUnitsLineChart(chartId, lineDatat) {
    if (unitsLineChart) {
        unitsLineChart.destroy();
    }

    const ctx = document.getElementById(chartId).getContext('2d');

    const { title, legend, ticks, scalesTitle } = setResponsiveFontSizes();

    unitsLineChart = new Chart(ctx, {
        type: 'line',
        data: lineDatat,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Sales of Residential and Commercial Units by Month',
                    color: '#ffffff',
                    font: { family: 'Libre Baskerville', size: title },
                    padding: { top: 10, bottom: 10 }
                },
                legend: {
                    position: 'top',
                    labels: { color: '#ffffff', font: { family: 'Libre Baskerville', size: legend } }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#ffffff', font: { family: 'Libre Baskerville', size: ticks } },
                    title: {
                        display: true,
                        text: 'Year-Month',
                        color: '#ffffff',
                        font: {
                            family: 'Libre Baskerville',
                            size: scalesTitle
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: '#ffffff', font: { family: 'Libre Baskerville', size: ticks } },
                    title: {
                        display: true,
                        text: 'Units Sold',
                        color: '#ffffff',
                        font: {
                            family: 'Libre Baskerville',
                            size: scalesTitle
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
    const ctx = document.getElementById(chartId).getContext('2d');

    const { title, legend, datalabel } = setResponsiveFontSizes();

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
                        size: title
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
                            size: legend
                        }
                    }
                },
                datalabels: {
                    formatter: (value, context) => {
                        let sum = 0;
                        const
                            dataArr = context.chart.data.datasets[0].data;
                        dataArr.forEach(data => sum += data);
                        const percentage = (value * 100 / sum).toFixed(2) + "%";
                        return percentage;
                    },
                    color: 'black',
                    font: {
                        family: 'Libre Baskerville',
                        size: datalabel,
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

window.addEventListener('resize', () => {
    const { title, legend, ticks, scalesTitle, datalabel } = setResponsiveFontSizes();

    if (lineChart) {
        lineChart.options.plugins.title.font.size = title;
        lineChart.options.plugins.legend.labels.font.size = legend;
        lineChart.options.scales.x.ticks.font.size = ticks;
        lineChart.options.scales.x.title.font.size = scalesTitle;
        lineChart.options.scales.y.ticks.font.size = ticks;
        lineChart.options.scales.y.title.font.size = scalesTitle;
        lineChart.update();
    }

    if (barChart) {
        barChart.options.plugins.title.font.size = title;
        barChart.options.scales.x.ticks.font.size = ticks;
        barChart.options.scales.x.title.font.size = scalesTitle;
        barChart.options.scales.y.ticks.font.size = ticks;
        barChart.options.scales.y.title.font.size = scalesTitle;
        barChart.update();
    }

    if (unitsLineChart) {
        unitsLineChart.options.plugins.title.font.size = title;
        unitsLineChart.options.plugins.legend.labels.font.size = legend;
        unitsLineChart.options.scales.x.ticks.font.size = ticks;
        unitsLineChart.options.scales.x.title.font.size = scalesTitle;
        unitsLineChart.options.scales.y.ticks.font.size = ticks;
        unitsLineChart.options.scales.y.title.font.size = scalesTitle;
        unitsLineChart.update();
    }

    if (pieChart) {
        pieChart.options.plugins.title.font.size = title;
        pieChart.options.plugins.legend.labels.font.size = legend;
        pieChart.options.plugins.datalabels.font.size = datalabel;
        pieChart.update();
    }
});

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