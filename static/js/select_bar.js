'use strict';
var SelectBar = function(_parent, _data, _eventHandler) {
    this.parent = _parent;
    this.data = _data;
    this.eventHandler = _eventHandler;
    this.barPadding = 1;
    // this.color = d3.scale.category20();
    this.color = function(d) {
        return d._children ? 'rgb(91, 191, 223)' : d.children ? 'rgb(91, 141, 223)' : '#fd8d3c';
    };
    this.display_data = [];
    this.margin = {
        top: 30,
        right: 0,
        bottom: 30,
        left: 0
    };
    this.width = 200 - this.margin.left - this.margin.right;
    this.height = 200 - this.margin.top - this.margin.bottom;
    this.bar_width = 50;
    this.bar_height = 20;
    this.bar_offset = 10;
    this.duration = 400;
    this.tree = d3.layout.tree([0, 20]);
    this.diagonal = d3.svg.diagonal()
        .projection(function(d) {
            return [d.y, d.x];
        });
    this.i = 0;
    this.initVis();
};
SelectBar.prototype.initVis = function() {
    var self = this;
    this.svg = this.parent.append('svg')
        .attr('width', this.width + this.margin.left + this.margin.right)
        .attr('height', this.height + this.margin.top + this.margin.bottom)
        .append('g')
        .attr('transform',
            'translate(' + this.margin.left + ',' + this.margin.top + ')');
    this.wrangle();
    this.update(self.data);
};
SelectBar.prototype.tree_apply = function(roots, callback) {
    var self = this;
    _.each(roots, function(value, key, list) {
        callback(value);
        self.tree_apply(value.children, callback);
    });
};
SelectBar.prototype.update = function(source) {
    var self = this;

    var nodes = this.tree.nodes(this.data);
    var height = Math.max(self.height, nodes.length * this.bar_height + this.margin.top + this.margin.bottom);
    this.svg.transition()
        .duration(this.duration)
        .attr('height', height);


    // Compute the 'layout'.
    nodes.forEach(function(n, i) {
        n.x = i * self.bar_height;
        n.y = n.depth * self.bar_offset;
    });
    // Update the nodes…
    var node = this.svg.selectAll('g.node')
        .data(nodes, function(d) {
            return d.id || (d.id = ++self.i);
        });
    var nodeEnter = node.enter().append('g')
        .attr('class', function(d){return !d['className']? 'node' : 'node ' + d.className;})
        .attr('transform', function(d) {
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
            $(self.eventHandler).trigger('collapse_bar', d);
            self.update(d);
        };
    // Enter any new nodes at the parent's previous position.
    nodeEnter.append('rect')
        .attr('y', -self.bar_height / 2)
        .attr('height', self.bar_height)
        .attr('width', self.bar_width)
        .style('fill', self.color)
        .on('click', on_click);
    nodeEnter.append('text')
        .attr('dy', 3.5)
        .attr('dx', 5.5)
        .text(function(d) {
            return d.label;
        });
    // Transition nodes to their new position.
    nodeEnter.transition()
        .duration(self.duration)
        .attr('transform', function(d) {
            return 'translate(' + d.y + ',' + d.x + ')';
        })
        .style('opacity', 1);
    node.transition()
        .duration(self.duration)
        .attr('transform', function(d) {
            return 'translate(' + d.y + ',' + d.x + ')';
        })
        .style('opacity', 1)
        .select('rect')
        .style('fill', self.color);
    // Transition exiting nodes to the parent's new position.
    node.exit().transition()
        .duration(self.duration)
        .attr('transform', function(d) {
            return 'translate(' + source.y + ',' + source.x + ')';
        })
        .style('opacity', 1e-6)
        .remove();
    // Update the links...
    var link = self.svg.selectAll('path.link')
        .data(self.tree.links(nodes), function(d) {
            return d.target.id;
        });
    // Enter any new links at the parent's previous position.
    link.enter().insert('path', 'g')
        .attr('class', 'link')
        .attr('d', function(d) {
            var o = {
                x: source.x0,
                y: source.y0
            };
            return self.diagonal({
                source: o,
                target: o
            });
        })
        .transition()
        .duration(self.duration)
        .attr('d', self.diagonal);
    // Transition links to their new position.
    link.transition()
        .duration(self.duration)
        .attr('d', self.diagonal);
    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(self.duration)
        .attr('d', function(d) {
            var o = {
                x: source.x,
                y: source.y
            };
            return self.diagonal({
                source: o,
                target: o
            });
        })
        .remove();
    // Stash the old positions for transition.
    nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });
};
SelectBar.prototype.wrangle = function() {
    var self = this;
    this.data.y0 = this.margin.left;
    this.data.x0 = this.margin.top;
    this.rows_num = 0;
    self.tree_apply(this.data, function() {
        self.rows_num += 1;
    });
};