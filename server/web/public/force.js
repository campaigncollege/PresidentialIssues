var width = 1000,
    height = 600;

var links = {};

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(-500)
    .linkDistance(200)
    .linkStrength(.2)
    .size([width, height]);

var svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.json("set.json", function(json) {
  force
      .nodes(json.nodes)
      .links(json.links)
      .start();

d3.json("links.json", function(json) {
    links = json;
  });

  var link = svg.selectAll("line.link")
      .data(json.links)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return d.value/2; });

  var node = svg.selectAll("circle.node")
      .data(json.nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("r", function(d) { return d.num/1.1; })
      .style("fill", function(d) { return "45ADA8"; })
      .on("mouseover", function(d, i) { 

        d3.select("#hoverbox").html("<span id=\"prez\">"+d.name+"</span>");
        /*
        var str = "<ul>";
        var arr = links[d.name];

        console.log(d.name)

        for(var i=0; i<arr.length && i<5; i++){
          str += "<li><a href=\"" + arr[i] + "\">article</a></li>";
        }

        str += "</ul>";

        console.log(str);


        d3.select("#linkbox").html(str); 
        */
        })
      .call(force.drag);

  node.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .text(function(d) { return d.name; });

  node.append("title")
      .text(function(d) { return d.name; });



  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  });
});



