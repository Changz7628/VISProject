var margin = {top: 30, right: 10, bottom: 10, left: 10},
width = 960 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom;

// //建立變數和初始值設定
var x = d3.scale.ordinal().rangePoints([0, width], 1),    //序數比例尺 (ordinal scale)，用於映射座標軸上的離散值
    y = {},                                               //空物件，稍後將用於存儲每個維度的線性比例尺 (linear scale)
    dragging = {};                                        //用於存儲拖曳的相關資訊

var line = d3.svg.line(),               // SVG 線段生成器函式。根據提供的座標數據生成 SVG 路徑元素，用於繪製連接數據點的線段
    axis = d3.svg.axis().orient("left"),//生成軸
    background,                         //變數，用於存儲平行座標軸的背景元素，稍後將用於渲染背景線條
    foreground;                         //變數，用於存儲平行座標軸的前景元素，稍後將用於渲染背景線條

// 在指定的div中創建svg元素
var svg = d3.select("#pcp-view").append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 -15 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom + 15}`)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// 監聽視窗大小變化的事件
window.addEventListener('resize', resize);

function resize() {
  var width = parseInt(d3.select('#pcp-view').style('width'));
  svg.attr("width", width);
}

d3.csv("data/cars.csv", function(error, cars) {

  // Extract the list of dimensions and create a scale for each.
  x.domain(dimensions = d3.keys(cars[0]).filter(function(d) {
    return d != "name" && (y[d] = d3.scale.linear()
        .domain(d3.extent(cars, function(p) { return +p[d]; }))
        .range([height, 0]));
  }));

  // Add grey background lines for context.
  background = svg.append("g")
      .attr("class", "background")
    .selectAll("path")
      .data(cars)
    .enter().append("path")
      .attr("d", path)
      .style("fill", "none")
      .style("stroke", "#EDEDED")
      .style("opacity", 1);

  // Add blue foreground lines for focus.
  foreground = svg.append("g")
      .attr("class", "foreground")
    .selectAll("path")
      .data(cars)
    .enter().append("path")
      .attr("d", path)
      .style("fill", "none")
      .style("stroke", "#69b3a2")
      .style("opacity", 0.5)

  // Add a group element for each dimension.
  var g = svg.selectAll(".dimension")
      .data(dimensions)
    .enter().append("g")
      .attr("class", "dimension")
      .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
      .call(d3.behavior.drag()
        .origin(function(d) { return {x: x(d)}; })
        .on("dragstart", function(d) {
          dragging[d] = x(d);
          background.attr("visibility", "hidden");
        })
        .on("drag", function(d) {
          dragging[d] = Math.min(width, Math.max(0, d3.event.x));
          foreground.attr("d", path);
          dimensions.sort(function(a, b) { return position(a) - position(b); });
          x.domain(dimensions);
          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
        })
        .on("dragend", function(d) {
          delete dragging[d];
          transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
          transition(foreground).attr("d", path);
          background
              .attr("d", path)
            .transition()
              .delay(500)
              .duration(0)
              .attr("visibility", null);
        }));

  // Add an axis and title.
  g.append("g")
      .attr("class", "axis-group")
      .each(function(d) { 
        d3.select(this).call(axis.scale(y[d]))
          .selectAll("text")                // 選擇所有的文字元素
          .style("font-size", "12px")       // 設定文字大小
          .style("fill", "#bdbdbd");        // 設定文字顏色
      })
    .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      
      .style("fill", "black")
      .style("font-weight", "light")        // 設定文字粗細
      .text(function(d) { return d; });

  // Add and store a brush for each axis.
  g.append("g")
      .attr("class", "brush")
      .each(function(d) {
        d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush));
      })
    .selectAll("rect")
      .attr("x", -8)
      .attr("width", 16);
});

function position(d) {
  var v = dragging[d];
  return v == null ? x(d) : v;
}

function transition(g) {
  return g.transition().duration(500);
}

// Returns the path for a given data point.
function path(d) {
  return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
}

function brushstart() {
  d3.event.sourceEvent.stopPropagation();
}

// Handles a brush event, toggling the display of foreground lines.
function brush() {
  var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
      extents = actives.map(function(p) { return y[p].brush.extent(); });
  foreground.style("display", function(d) {
    return actives.every(function(p, i) {
      return extents[i][0] <= d[p] && d[p] <= extents[i][1];
    }) ? null : "none";
  });
}