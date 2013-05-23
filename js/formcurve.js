// Generated by CoffeeScript 1.3.3
(function() {

  this.tageswoche = this.tageswoche || {};

  tageswoche.formcurve = (function() {
    var brush, color, context, focus, height, heightContext, margin, marginContext, svg_container, tooltip, width, widthContext, x, xAxis, xAxisContext, xContext, y, yAxis, yContext;
    brush = void 0;
    margin = {
      top: 10,
      right: 5,
      bottom: 105,
      left: 25
    };
    width = 320 - margin.left - margin.right;
    height = 380 - margin.top - margin.bottom;
    marginContext = {
      top: 325,
      right: 5,
      bottom: 0,
      left: 5
    };
    heightContext = 380 - marginContext.top - marginContext.bottom;
    widthContext = 320 - marginContext.left - marginContext.right;
    x = d3.time.scale().range([0, width]);
    xContext = d3.time.scale().range([0, widthContext]);
    y = d3.scale.linear().range([height, 0]);
    yContext = d3.scale.linear().range([heightContext, 0]);
    color = d3.scale.linear().range(['#D7191C', '#D7191C', '#FDAE61', '#FFFFBF', '#A6D96A', '#1A9641']);
    xAxisContext = d3.svg.axis().scale(xContext).orient('bottom');
    yAxis = d3.svg.axis().scale(y).orient('left').ticks(6);
    xAxis = d3.svg.axis().scale(x).orient('bottom');
    svg_container = d3.select('.curve').append('svg').attr('class', 'curve-svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom);
    focus = svg_container.append("g").attr('transform', "translate(" + margin.left + "," + margin.top + ")").attr('class', 'focus-svg');
    tooltip = d3.select('.curve').append('div').attr('class', 'tooltip').style('opacity', 0);
    context = svg_container.append('g').attr('transform', "translate(" + marginContext.left + "," + marginContext.top + ")");
    return {
      sanitizeData: function(data) {
        var grade, index, player, sanitizedData;
        sanitizedData = [];
        for (index in data) {
          player = data[index];
          grade = +player.grade;
          if (grade === 0) {
            grade = null;
          }
          sanitizedData.push({
            date: new Date(player.date),
            grade: grade,
            averageGrade: +player.gameAverageGrade,
            opponent: player.opponent
          });
        }
        return sanitizedData;
      },
      setupDomains: function(sanitizedData) {
        x.domain([
          d3.max(sanitizedData, function(d) {
            return d.date;
          }), d3.min(sanitizedData, function(d) {
            return d.date;
          })
        ]);
        y.domain([
          d3.min(sanitizedData, function(d) {
            if (d.averageGrade < d.grade) {
              return d.averageGrade;
            } else {
              return d.grade;
            }
          }), 6.1
        ]);
        return color.domain([1, 2, 3, 4, 5, 6]);
      },
      redrawFocusChart: function() {
        var circles;
        circles = focus.selectAll('circle').attr('cx', function(d) {
          return x(d.date);
        }).attr('cy', function(d) {
          return y(d.grade);
        }).attr('class', function(d) {
          if (d.grade === 0) {
            return 'invisible';
          }
        }).attr('fill', function(d) {
          return color(d.grade);
        }).attr('r', this.getRadius()).attr('clip-path', 'url(#clip)').on('mouseover', this.circleMouseover).on('mouseout', this.circleMouseout);
        return circles;
      },
      draw: function(data) {
        var brushCallback, circles, contextBars, sanitizedData;
        sanitizedData = this.sanitizeData(data);
        svg_container.append('defs').append('clipPath').attr('id', 'clip').append('rect').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom);
        this.setupDomains(sanitizedData);
        focus.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);
        focus.append('g').attr('class', 'y axis').call(yAxis);
        circles = focus.selectAll('circle').data(sanitizedData);
        circles.enter().append('circle').attr('cx', function(d) {
          return x(d.date);
        }).attr('cy', function(d) {
          return y(d.grade);
        }).attr('class', function(d) {
          if (d.grade === 0) {
            return 'invisible';
          }
        }).attr('fill', function(d) {
          return color(d.grade);
        }).attr('r', this.getRadius()).attr('clip-path', 'url(#clip)').on('mouseover', this.circleMouseover).on('mouseout', this.circleMouseout);
        circles.exit().remove();
        xContext.domain(x.domain());
        yContext.domain(y.domain());
        context.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + heightContext + ')').call(xAxisContext);
        contextBars = context.selectAll('rect').data(sanitizedData);
        contextBars.enter().append('rect').attr('x', function(d) {
          return xContext(d.date);
        }).attr('y', function(d) {
          return yContext(d.grade);
        }).attr('height', function(d) {
          var h;
          h = heightContext - yContext(d.grade);
          if (h > 0) {
            return h;
          } else {
            return 0;
          }
        }).attr('width', 2);
        contextBars.exit().remove();
        brushCallback = $.proxy(this.contextBrush, this);
        brush = d3.svg.brush().x(xContext).on('brush', brushCallback);
        brush.extent([sanitizedData[sanitizedData.length - 15].date, sanitizedData[sanitizedData.length - 1].date]);
        context.append('g').attr('class', 'x brush').call(brush).selectAll('rect').attr('y', -6).attr('height', heightContext + 7);
        return context.select('.brush').call(brushCallback);
      },
      getRadius: function() {
        var dayDiff, millisecondsPerDay, size;
        millisecondsPerDay = 1000 * 60 * 60 * 24;
        if (brush) {
          dayDiff = (brush.extent()[1].getTime() - brush.extent()[0].getTime()) / millisecondsPerDay;
          size = 600 / dayDiff;
          if (size > 8) {
            return 8;
          } else {
            return size;
          }
        } else {
          return 5;
        }
      },
      contextBrush: function() {
        var selection;
        selection = brush.extent();
        if (brush.empty()) {
          x.domain(xContext.domain());
        } else {
          x.domain([selection[1], selection[0]]);
        }
        focus.select(".x.axis").call(xAxis);
        return this.redrawFocusChart();
      },
      circleMouseover: function(d) {
        var path, text;
        d3.select(this).transition().duration(100).attr('r', 20).transition().duration(100).attr('r', 15);
        if (d.grade > d.averageGrade) {
          if (y(d.averageGrade) - y(d.grade) > 15) {
            path = "M  " + (x(d.date)) + " " + (y(d.averageGrade)) + " L " + (x(d.date)) + " " + (y(d.grade) + 15) + " L " + (x(d.date) + 5) + " " + (y(d.grade) + 23) + " L " + (x(d.date) - 5) + " " + (y(d.grade) + 23) + " L " + (x(d.date)) + " " + (y(d.grade) + 15);
            d3.select('.focus-svg').append('path').attr('d', path).attr('stroke', 'green');
          }
          text = "Gegner: " + d.opponent + ", <b>+" + (Math.floor((d.grade - d.averageGrade) * 10) / 10) + "</b> gegenüber Durchschnitt";
        } else {
          if (y(d.grade) - y(d.averageGrade) > 15) {
            path = "M " + (x(d.date)) + " " + (y(d.averageGrade)) + " L " + (x(d.date)) + " " + (y(d.grade) - 15) + " L " + (x(d.date) + 5) + " " + (y(d.grade) - 23) + " L " + (x(d.date) - 5) + " " + (y(d.grade) - 23) + " L " + (x(d.date)) + " " + (y(d.grade) - 15);
            focus.append('path').attr('d', path).attr('stroke', 'red');
          }
          text = "Gegner: " + d.opponent + ", <b>-" + (Math.floor((d.averageGrade - d.grade) * 10) / 10) + "</b> gegenüber Durchschnitt";
        }
        tooltip.transition().duration(200).style('opacity', .9);
        return tooltip.html(text).style('left', "" + (x(d.date) + margin.top + 25) + "px").style('top', "" + (y(d.grade) + margin.left + 35) + "px");
      },
      circleMouseout: function(d) {
        d3.select(this).transition().duration(100).attr('r', tageswoche.formcurve.getRadius());
        focus.selectAll('path').remove();
        return tooltip.transition().duration(200).style('opacity', 0);
      }
    };
  })();

}).call(this);