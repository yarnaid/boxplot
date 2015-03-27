var data, chart;
var labels_width = 200;
var width = 770;
var top_height = 150 + 5;
var chart_height = 500;


// d3.json('/ajax_get_line_data', function(err, json) {
//     data = json['result'];
//     chart = c3.generate({
//         bindto: '#chart',
//         data: {
//           columns: data,
//           type: 'area-spline'
//         },
//         point: {
//             show: false
//         }
//   });
// }).header("Content-Type","application/json")
//    .send("POST");




// $('#chart').offset({top: 0, left: labels_width});
// d3.select('.nvtooltip').style('margin-left', -labels_width);
d3.json('/ajax_get_line_data', function(err, json) {
  nv.addGraph(function() {
    data = json['result'];
    chart = nv.models.lineChart()
      .margin({left: labels_width})
      .width(width)
      .height(chart_height);

    // d3.select('svg')
      // .attr('width', width);

    // var chart = nv.models.lineWithFocusChart()
    //               .x(function(d) { return d[0] })
    //               .y(function(d) { return d[1]/100 }) //adjusting, 100% is 1.00, not 100 as it is in the data
    //               .color(d3.scale.category10().range())
    //               .useInteractiveGuideline(true)
    //               ;

     // chart.xAxis
     //    .tickValues([1078030800000,1122782400000,1167541200000,1251691200000])
     //    .tickFormat(function(d) {
     //        return d3.time.format('%x')(new Date(d))
     //      });

    // chart.yAxis
        // .tickFormat(d3.format(',.1%'));

    d3.select('#chart svg')
        .datum(data)
        .call(chart)
        .style({ 'width': width, 'height': chart_height });

    //TODO: Figure out a good way to do this automatically
    nv.utils.windowResize(chart.update);

    return chart;
  });
    // d3.select('#chart svg').style('position', 'absolute');
}).header("Content-Type","application/json")
   .send("POST");