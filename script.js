var width = 1800,
    height = 1200,
    radius = 500;

var x = d3.scale.linear()
    .range([0, 2 * Math.PI]);

var y = d3.scale.linear()
    .range([0, radius]);

var colors = {
  "data": "#000000",
  "solid": "#831751",
  "group": "#FFA25E",
  "platform": "#47A1F0",
  "program": "#E5B931",
  "people": "#79C546",
  "company": "#F7798A",
  "academy": "#A87BD9",
  "charity": "#00C9CB",
  "end": "#bbbbbb",
  // people
 "Jorge Quiroz": "#79C546",
 "Alvaro Amorrortu": "#79C546",
 "Tayjus Surampudi": "#79C546",
 "Gaelyn Flannery": "#79C546",
 "Annie Ganot": "#79C546",
 "VallKopp Aharonov": "#79C546",
 "Christianne Baruqui": "#79C546",
 "Karin Folman": "#79C546",
 "Kerry Rosenfeld": "#79C546",
 "Carl Morris": "#79C546",
 "Joel Schneider": "#79C546",
 "Ilan Ganot": "#79C546",
 "Robbie Huffines": "#79C546",
 "Andrey Zarur": "#79C546",
 "Matt Arnold": "#79C546",
 "Gilad Hayeem": "#79C546",
   // company
  "Perceptive": "#F7798A",
  "JP Morgan": "#F7798A",
  "SRI": "#F7798A",
  "Pfizer": "#F7798A",
  "Debiopharm": "#F7798A",
   // groups
  "Team": "#FFA25E",
  "Board of Directors": "#FFA25E",
  "Investors": "#FFA25E",
  "Partners": "#FFA25E", 
  // academies
  "U Penn": "#A87BD9",
  "Univ of Missouri": "#A87BD9"
};

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "graph")
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

var partition = d3.layout.partition()
    .value(function(d) {return d.size;});


var arc = d3.svg.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y)); })
    .outerRadius(function(d) { 
      if (d.depth == 3)
        return 600;
      else
        return Math.max(0, y(d.y + d.dy)); 
    });


d3.json("data.json", function(error, root) {
  var g = svg.selectAll("g")
    .data(partition.nodes(root))
    .enter().append("g");



// Draw arcs
  var path = g.append("path")
    .attr("d", arc)
    .attr("class", "arcSlices")
    .style("fill", function(d) {
      if (d.depth == 0) {
        // Make inner circle transparent
        return "rgba(0, 0, 0, 0)"
      } else {
        return colors[d.name]; }
      })
    .style("stroke", "#fff")
    //animation onClick
    .on("click", click)
    .each( function(d, i) {
      
      if (d.depth == 2) {
        //A regular expression that captures all in between the start of a string (denoted by ^) 
        //and the first capital letter L
        var firstArcSection = /(^.+?)L/;

        //The [1] gives back the expression between the () (thus not the L as well) 
        //which is exactly the arc statement
        var newArc = firstArcSection.exec( d3.select(this).attr("d") )[1];

        //Replace all the comma's so that IE can handle it -_-
        //The g after the / is a modifier that "find all matches rather than stopping after the first match"
        newArc = newArc.replace(/,/g , " ");

        var startLoc  = /M(.*?)A/,    //Everything between the capital M and first capital A
            middleLoc   = /A(.*?)0 0 1/,  //Everything between the capital A and 0 0 1
            endLoc    = /0 0 1 (.*?)$/; //Everything between the 0 0 1 and the end of the string (denoted by $)

        // Split path in different sections
        var newStart = startLoc.exec( newArc )[1];
        var newEnd = endLoc.exec( newArc )[1];
        var middleSec = middleLoc.exec( newArc )[1];

        //Everything between start and first space
        var startPosX = /(.*?)\s/g;
        var posX = startPosX.exec( newStart )[1];
        posX = posX / 1.2;
        
        // Everything from space and the end of the string
        var startPosY = /\s(.*?)$/g;
        var posY = startPosY.exec( newStart )[1];
        posY = posY / 1.2;

        // Put string back together
        newStart = posX + " " + posY;

        //Everything between start and first space
        var endPosX = /(.*?)\s/g;
        var posX = endPosX.exec( newEnd )[1];
        posX = posX / 1.2;

        // Everything from space and the end of the string
        var endPosY = /\s(.*?)$/g;
        var posY = endPosY.exec( newEnd )[1];
        posY = posY / 1.2;

        // Put string back together
        newEnd = posX + " " + posY;

        //Everything between start and first space
        var beforeSpace = /(.*?)\s/g;
        var radius = beforeSpace.exec( middleSec )[1];
        radius = radius / 1.2;

        // Put string back together
        middleSec = radius + " " + radius + " ";

        // Put whole string back together
        newArc = "M" + newStart + "A" + middleSec + "0 0 1 " + newEnd;




        //If the end angle lies beyond a quarter of a circle (90 degrees or pi/2) 
        //flip the end and start position
        var rotation = computeTextRotation(d);
        if (rotation > 90 && rotation < 135) {
          var startLoc  = /M(.*?)A/,    //Everything between the capital M and first capital A
              middleLoc   = /A(.*?)0 0 1/,  //Everything between the capital A and 0 0 1
              endLoc    = /0 0 1 (.*?)$/; //Everything between the 0 0 1 and the end of the string (denoted by $)

          // Flip the direction of the arc by switching the start and end point (and sweep flag)
          var newStart = endLoc.exec( newArc )[1];
          var newEnd = startLoc.exec( newArc )[1];
          var middleSec = middleLoc.exec( newArc )[1];
          
          //Build up the new arc notation, set the sweep-flag to 0
          newArc = "M" + newStart + "A" + middleSec + "0 0 0 " + newEnd;
        }
        
        //Create a new invisible arc that the text can flow along
        var pathText = g.append("path")
          .attr("class", "hiddenArcSlices")
          .attr("id", "arc"+i)
          .attr("d", newArc)
          .style("fill", "none")
          .style("stroke", "none");

        } else if (d.depth == 1) {
          var pathText = g.append("path")
            .attr("class", "hiddenArcSlices")
            .attr("id", "arc"+i)
            .attr("d", function(d) {
              return "M -" + 161.25 + ",0 A 10,10 0 0,1 " + 161.25 + ",0";
            })
            .style("fill", "none")
            .style("stroke", "none");
        }
    });




// Draw text
  var text = g.append("text")
    // Give unique classes to every ring
    .attr("class", function(d) {
      if (d.depth == 0) {
        return "data";
      } else if (d.depth == 1) {
        return "solid";
      } else if (d.depth == 2) {
        return "innerRing";
      } else if (d.depth == 3) {
        return "outerRing";
      }
    })
    // adjust textcolor
    .attr("fill", "#ffffff")
    // Hide text from innerRing
    .style("display", function(d) {
      if (d.depth == 0) {
        return "none"
      }
    })

    .style("text-anchor", "middle")
    
    .text(function(d) {
      if (d.depth == 3)
        return d.name; 
      else
        return null;
    })

    // Rotation for the outerRing text that is over 90 degrees
    .attr("transform", function(d) {
      if (d.depth == 3) {
        var rotation = computeTextRotation(d);
        var transformation = "rotate(" + computeTextRotation(d) + ")";
        if (rotation > 90) {
          var angle = (d.x + d.dx / 2) * 180 / Math.PI - 90;
          transformation = "rotate(" + computeTextRotation(d) + ")translate(" + (d.y  + 950)  + ")rotate(-180)"
        }
        return transformation;
      }
      else
      return null;
     })

    .attr("x", function(d) {
      if (d.depth == 3) {
        return y(d.y)+90;
      } else {
        return null;
      }
    })

    // Adjust margin
    .attr("dx", function(d) {
      if (d.depth == 3) {
        return 6;
      } else {
        return null;
      }
    })

    // Adjust margin
    .attr("dy", function(d) {
      if (d.depth == 3) {
        return ".35em";
      } else {
        return 0;
      }
    })

    .text(function(d) {
      if (d.depth == 3)
       return d.name; 
      else 
        return null;
    })

    // Place text on path
    .append("textPath")
    .attr("xlink:href", function(d, i) {
      if (d.depth == 3) {
        return null;
      }
      return "#arc" + i;
    })
      
    .attr("startOffset", "50%")  

    .text(function(d) {
      if (d.depth != 3)
       return d.name; 
      else 
        return null;
    })
    ;


  function click(d) {
    // fade out all text elements
    text.transition().attr("opacity", 0);

    path.transition()
      .duration(750)
      .attrTween("d", arcTween(d))
      .each("end", function(e, i) {
          // check if the animated element's data e lies within the visible angle span given in d
          if (e.x >= d.x && e.x < (d.x + d.dx)) {
            // get a selection of the associated text element
            var arcText = d3.select(this.parentNode).select("text");
            // fade in the text element and recalculate positions
            arcText.transition().duration(750)
              .attr("opacity", 1)
              .attr("transform", function() { return "rotate(" + computeTextRotation(e) + ")" })
              .attr("x", function(d) { return y(d.y); });
          }
      });
  }
});

d3.select(self.frameElement).style("height", height + "px");

// Interpolate the scales!
function arcTween(d) {
  var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
      yd = d3.interpolate(y.domain(), [d.y, 1]),
      yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
  return function(d, i) {
    return i
        ? function(t) { return arc(d); }
        : function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
  };
}

function computeTextRotation(d) {
  //console.log(d.name + ", x = " + x + ", d.x = " + d.x + ", d.dx = " + d.dx);
  //console.log((x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180);
  return (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180;
}