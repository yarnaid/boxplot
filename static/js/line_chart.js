
var data, chart;

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
        }
  });
}).header("Content-Type","application/json")
   .send("POST");;