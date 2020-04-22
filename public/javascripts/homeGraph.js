Chart.defaults.groupableBar = Chart.helpers.clone(Chart.defaults.bar);

Chart.controllers.groupableBar = Chart.controllers.bar.extend({
    calculateBarX: function (index) {
        // position the bars based on the stack index
        var stackIndex = this.getMeta().stackIndex;
        return Chart.controllers.bar.prototype.calculateBarX.apply(this, [index, stackIndex]);
    },

    getBarCount: function () {
        var stacks = [];
        //put the stack index in the dataset meta
        Chart.helpers.each(this.chart.data.datasets, function (dataset, datasetIndex) {
            var meta = this.chart.getDatasetMeta(datasetIndex);
            if (meta.bar && this.chart.isDatasetVisible(datasetIndex)) {
                var stackIndex = stacks.indexOf(dataset.stack);
                if (stackIndex === -1) {
                    stackIndex = stacks.length;
                    stacks.push(cerealCrop);
                }
                meta.stackIndex = stackIndex;
            }
        }, this);
        this.getMeta().stacks = stacks;
        return stacks.length;
    },
});

function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.response);
    }
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.send(null);
};

httpGetAsync('http://localhost:3000/graph/getGraph', function (res) {
    var resp = JSON.parse(res);
    var barChartData = resp;
    if (barChartData.length > 0) {
        var cerealCropData = [];
        var oilseedCrop = [];
        var pulsesCropData = [];
        var districts = [];
        var totalAreaAffected = [];
        var totalAreaTreated = [];
        var totalAreaAffected1 = [];
        var totalAreaTreated1 = [];
        var totalAreaAffected2 = [];
        var totalAreaTreated2 = [];
        for (var i = 0; i < barChartData.length; i++) {
            if (districts.indexOf(barChartData[i].dist_name) === -1) {
                districts.push(barChartData[i].dist_name);
            }
            if (barChartData[i].crop_code == '01') {
                var cerealCrop = {
                    disObj: barChartData[i].dist_name,
                    totalAtreated: barChartData[i].area_Treated,
                    totalAaffected: barChartData[i].area_Affected,
                    cropName: 'Cereal Crops'
                };
                cerealCropData.push(cerealCrop);
                totalAreaAffected.push(cerealCrop.totalAaffected);
                totalAreaTreated.push(cerealCrop.totalAtreated);
            }
            else if (barChartData[i].crop_code == '02') {
                var oilseedData = {
                    disObj: barChartData[i].dist_name,
                    totalAtreated: barChartData[i].area_Treated,
                    totalAaffected: barChartData[i].area_Affected,
                    cropName: 'Oil Seeds'
                };
                oilseedCrop.push(oilseedData);
                totalAreaAffected1.push(oilseedData.totalAaffected);
                totalAreaTreated1.push(oilseedData.totalAtreated);
            }
            else if (barChartData[i].crop_code == '03') {
                var pulsesData = {
                    disObj: barChartData[i].dist_name,
                    totalAtreated: barChartData[i].area_Treated,
                    totalAaffected: barChartData[i].area_Affected,
                    cropName: 'Pulses'
                };
                pulsesCropData.push(pulsesData);
                totalAreaAffected2.push(pulsesData.totalAaffected);
                totalAreaTreated2.push(pulsesData.totalAtreated);
            }
            else {
                console.log(resp.status);
            }
        };
    }
    else {
        alert('No records are available for graph. Please reload the page.')
    }
    var data = {
        labels: districts,
        datasets: [
            {
                label: "Total Area Affected (in ha) (Cereal Crops)",
                backgroundColor: "orange",
                data: totalAreaAffected,
                stack: 1
            },
            {
                label: "Total Area Treated (in ha) (Cereal Crops)",
                backgroundColor: "green",
                data: totalAreaTreated,
                stack: 1
            },
            {
                label: "Total Area Affected (in ha) (Oil Seeds)",
                backgroundColor: "red",
                data: totalAreaAffected1,
                stack: 2
            },
            {
                label: "Total Area Treated (in ha) (Oil Seeds)",
                backgroundColor: "blue",
                data: totalAreaTreated1,
                stack: 2
            },
            {
                label: "Total Area Affected (in ha) (Pulses)",
                backgroundColor: "brown",
                data: totalAreaAffected2,
                stack: 3
            },
            {
                label: "Total Area Treated (in ha) (Pulses)",
                backgroundColor: "pink",
                data: totalAreaTreated2,
                stack: 3
            },
        ]
    };
    var ctx = document.getElementById("myChart").getContext("2d");
    new Chart(ctx, {
        type: 'groupableBar',
        data: data,
        options: {
            legend: {
                labels: {
                    generateLabels: function (chart) {
                        return Chart.defaults.global.legend.labels.generateLabels.apply(this, [chart]).filter(function (item, i) {
                            return i <= 23;
                        });
                    }
                }
            },
            scales: {
                yAxes: [{
                    ticks: {
                        max: 20000,
                    },
                    scaleLabel: {
                        display: true,
                        fontColor: 'red',
                        fontStyle: "bold",
                        labelString: 'Area (in Hectares)'
                    },
                    stacked: true,
                }],
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        fontColor: 'red',
                        fontStyle: "bold",
                        labelString: 'Total affected area & total treated area of Cereal Crops, Oil Seeds & Pulses (District-wise) (Kharif-season)'
                    },
                    ticks: {
                        autoSkip: false,
                        beginAtZero: true,
                        stepSize: 100,
                    }
                }]
            }
        }
    });
});