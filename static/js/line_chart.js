var data, chart;
var labels_width = 160;
var width = 750;
var top_height = 150 + 5;
var chart_height = 500;


d3.json('/ajax_get_line_data', function(err, json) {
    data = json['result'];
    chart = c3.generate({
        bindto: '#chart',
        data: {
          columns: data,
          type: 'area-spline'
        },
        point: {
            show: false
        },
        size: {
          width: width - labels_width,
          height: chart_height
        }
  });
    d3.select('#chart svg').style('position', 'absolute');
    $('#chart svg').offset({top: top_height, left: labels_width});
}).header("Content-Type","application/json")
   .send("POST");;