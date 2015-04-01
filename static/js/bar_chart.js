'use strict';

var BarChart = function (_parent, _data, _eventHandler) {
	var self = this;

    this.parent = _parent;
    this.data = _data;
    this.eventHandler = _eventHandler;
    this.barPadding = 1;
    // this.color = d3.scale.category20();
    this.color = function(d) {
        return d._children ? '#3182bd' : d.children ? '#c6dbef' : '#fd8d3c';
    };
    this.display_data = [];
    this.margin = {
        top: 30,
        right: 20,
        bottom: 30,
        left: 20
    };
    this.width = 770 - this.margin.left - this.margin.right;
    this.height = 200 - this.margin.top - this.margin.bottom;
    this.bar_height = 20;
    this.duration = 400;
    this.tree = d3.layout.tree([0, 20]);
    this.i = 0;

    this.x = d3.scale.linear().range([0, this.width]);
    this.y = d3.scale.linear().domain([0, this.height]).range([0, this.height]);

    this.line = d3.svg.line()
    	.x(function(d) {return self.x(d.x);})
    	.y(function(d) {return self.y(d.y);})
    	.interpolate('linear');

    this.init_vis();
};

BarChart.prototype.init_vis = function() {
	var self = this;

    this.svg = this.parent.append('svg')
        .attr('width', this.width + this.margin.left + this.margin.right)
        .attr('height', this.height + this.margin.top + this.margin.bottom)
        .append('g')
        .attr('transform',
            'translate(' + this.margin.left + ',' + this.margin.top + ')');

    this.v_line = this.svg.append('path')
    	.attr('d', self.line([{x:0, y:0-self.bar_height/2},{x:0, y:self.bar_height/2}]))
    	.attr('stroke', 'black')
    	.attr('storke-width', 5)
    	.attr('fill', 'none')

    this.x_axis = d3.svg.axis()
    	.scale(this.x)
    	.orient('top')
    	.ticks(10);

    this.wrangle();
    this.update(self.data);
};

BarChart.prototype.wrangle = function() {
	var self = this;
	var nodes = this.tree.nodes(this.data);

	var width = 50;
	nodes.forEach(function(n) {
		// n.start = n.start || Math.min(10 + Math.floor(Math.random() * 100), self.width-1);
		// n.end = n.end || n.start + Math.max(width * Math.floor(Math.random() * 10), width);
	});
	this.x.domain([0, d3.max(nodes, function(d) {return d.end;})]);
	this.nodes_num = nodes.length;
};

BarChart.prototype.update = function() {
	var self = this;

    this.svg.append('g')
    	.attr('class', 'axis')
	    .attr('transform', 'translate(0,' + (0-this.bar_height/2) + ')')
    	.call(this.x_axis);


    var nodes = this.tree.nodes(this.data);
    var source = nodes[0];

    // Compute the 'layout'.
    nodes.forEach(function(n, i) {
        n.x = i * self.bar_height;
        // n.y = n.depth * self.bar_offset;
    });

    //
    var nodes_num = nodes.length;
    this.v_line.transition()
        .duration(self.duration)
	    .attr('d', self.line([{x:0, y:0-self.bar_height/2},{x:0, y:self.bar_height/2 + self.bar_height*(nodes_num-1)}]));

    // Nodes
    var node = this.svg.selectAll('g.node')
        .data(nodes, function(d) {
            return d.id || (d.id = ++self.i);
        });

    var nodeEnter = node.enter().append('g')
        .attr('class', function(d){return !d['className']? 'node' : 'node ' + d.className;})
        .attr('transform', function() {
            return 'translate(' + source.y0 + ',' + source.x0 + ')';
        })
        .style('opacity', 1e-6);

    var on_click = function(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
            $(self.eventHandler).trigger('collapse_select', d);
            self.update(d);
        };

    // Enter any new nodes at the parent's previous position.
    nodeEnter.append('rect')
        .attr('y', -self.bar_height / 2)
        .attr('height', self.bar_height)
        .attr('width', function(d){return self.x(d.end - d.start);})
        // .style('fill', self.color)
        .on('click', on_click);
    nodeEnter.append('text')
        .attr('dy', 3.5)
        .attr('dx', 5.5)
        .text(function(d) {
            return d.end - d.start;
        });


    // Transition nodes to their new position.
    nodeEnter.transition()
        .duration(self.duration)
        .attr('transform', function(d) {
            return 'translate(' + self.x(d.y + d.start) + ',' + d.x + ')';
        })
        .style('opacity', 1);
    node.transition()
        .duration(self.duration)
        .attr('transform', function(d) {
            return 'translate(' + self.x(d.y + d.start) + ',' + d.x + ')';
        })
        .style('opacity', 1)
        .select('rect');
        // .style('fill', self.color);


    // Transition exiting nodes to the parent's new position.
    node.exit().transition()
        .duration(self.duration)
        .attr('transform', function() {
            return 'translate(' + self.x(source.y) + ',' + source.x + ')';
        })
        .style('opacity', 1e-6)
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });

};