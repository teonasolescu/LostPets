window.onload = () => {
    fetch(`http://127.0.0.1:6969/users/statistics`)
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                const {
                    total,
                    found
                } = response;

                // Load google charts
                google.charts.load('current', {
                    'packages': ['corechart']
                });
                google.charts.setOnLoadCallback(drawChart);

                // Draw the chart and set the chart values
                function drawChart() {
                    var data = google.visualization.arrayToDataTable([
                        ['Task', 'Hours per Day'],
                        ['Total', total],
                        ['Found', found]
                    ]);

                    // Optional; add a title and set the width and height of the chart
                    var options = {
                        'title': 'Most lost breeds',
                        'width': 600,
                        'height': 600
                    };

                    // Display the chart inside the <div> element with id="piechart"
                    var chart = new google.visualization.PieChart(document.getElementById('piechart'));
                    chart.draw(data, options);
                }
            } else {
                alert(response.message);
            }
        })
        .catch(e => {
            console.log(e);
        });

    document.getElementById("csv").onclick = () => {
        fetch(`http://127.0.0.1:6969/users/raport?type=csv`)
            .then(response => response.json())
            .then(response => {
                if (response.success) {
                    const {
                        link
                    } = response;

                    const a = document.createElement('a');
                    a.href = link;
                    a.download = true;
                    a.style.display = "none";
                    a.target = "_blank";

                    document.body.appendChild(a);
                    a.click();
                } else {
                    alert(response.message);
                }
            })
            .catch(e => {
                console.log(e);
            });
    }

    document.getElementById("pdf").onclick = () => {
        fetch(`http://127.0.0.1:6969/users/raport?type=pdf`)
            .then(response => response.json())
            .then(response => {
                if (response.success) {
                    const {
                        link
                    } = response;

                    const a = document.createElement('a');
                    a.href = link;
                    a.download = true;
                    a.style.display = "none";
                    a.target = "_blank";

                    document.body.appendChild(a);
                    a.click();
                } else {
                    alert(response.message);
                }
            })
            .catch(e => {
                console.log(e);
            });
    }

    document.getElementById("html").onclick = () => {
        fetch(`http://127.0.0.1:6969/users/raport?type=html`)
            .then(response => response.json())
            .then(response => {
                if (response.success) {
                    const {
                        link
                    } = response;

                    const a = document.createElement('a');
                    a.href = link;
                    a.download = true;
                    a.style.display = "none";
                    a.target = "_blank";

                    document.body.appendChild(a);
                    a.click();
                } else {
                    alert(response.message);
                }
            })
            .catch(e => {
                console.log(e);
            });
    }
}