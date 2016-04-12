(function($) {
  $(function() {
    var width = 900,
        height = 900,
        radius = 300;

    var x = d3.scale.linear()
        .range([0, 2 * Math.PI]);

    var y = d3.scale.linear()
        .range([0, radius]);

    var bounds = d3.select("path.arcSlices");

    // var colors = {
    //   "data": "#000000",
    //   "solid": "#00C4FF",
    //   "group": "#FFA25E",
    //   "platform": "#47A1F0",
    //   "program": "#E5B931",
    //   "people": "#79C546",
    //   "company": "#F7798A",
    //   "academy": "#A87BD9",
    //   "charity": "#00C9CB",
    //   "end": "#bbbbbb",
    //   // people
    //  "Jorge Quiroz": "#79C546",
    //  "Alvaro Amorrortu": "#00C4FF",
    //  "Tayjus Surampudi": "#00C4FF",
    //  "Gaelyn Flannery": "#00C4FF",
    //  "Annie Ganot": "#00C4FF",
    //  "VallKopp Aharonov": "#00C4FF",
    //  "Christianne Baruqui": "#00C4FF",
    //  "Karin Folman": "#00C4FF",
    //  "Kerry Rosenfeld": "#00C4FF",
    //  "Carl Morris": "#00C4FF",
    //  "Joel Schneider": "#00C4FF",
    //  "Ilan Ganot": "#45C26B",
    //  "Robbie Huffines": "#45C26B",
    //  "Andrey Zarur": "#45C26B",
    //  "Matt Arnold": "#45C26B",
    //  "Gilad Hayeem": "#45C26B",
    //    // company
    //   "Perceptive": "#FFCE00",
    //   "JP Morgan": "#FFCE00",
    //   "SRI": "#FFCE00",
    //   "Pfizer": "#FFCE00",
    //   "Debiopharm": "#FFCE00",
    //    // groups
    //   "Team": "#00C4FF",
    //   "Board of Directors": "#45C26B",
    //   "Investors": "#FFA25E",
    //   "Partners": "#FFCE00", 
    //   // academies
    //   "U Penn": "#A87BD9",
    //   "Univ of Missouri": "#A87BD9"
    // };

    var color = '#ff6d53';



    drawGraph();

    function drawGraph() {

    var pathText;

    var svg = d3.select(Drupal.settings.solidbio.organisationalchart.selector).append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "#solidbio-graph")
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

    var partition = d3.layout.partition()
        .value(function(d) {return d.size;});


    var arc = d3.svg.arc()
        .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
        .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
        .innerRadius(function(d) {
          // if (d.depth == 1) {
          //   return 0;
          // } else if (d.depth == 2) {
          //   return 150;
          // } else if(d.depth == 3) {
          //   return 300;
          // }

          // else {
            return Math.max(0, y(d.y));
          // }
        })
        .outerRadius(function(d) { 
          // if (d.depth == 3)
          //   return 400; // original 550
          // else if (d.depth == 1) {
          //   return 150;
          // } else if(d.depth == 2) {
          //   return 300;
          // }
          // else
            return Math.max(0, y(d.y + d.dy)); 
        });


    d3.json(Drupal.settings.solidbio.organisationalchart.url, function(error, root) {
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
            return "#ffffff" }
          })
        .attr('id', function(d) {
          return "path" + d.id;
        })
        .style("stroke", function(d) {
          // return colors[d.name];
          if (d.depth == 0) {
            return "none";
          } else 
          return "#D7D7D7";
        })
        //animation onClick
        .on("click", click)
        .on("mouseover", mouseover)
        .on("mouseleave", mouseleave)
        .each( function(d, i) {

          if (d.depth == 1) {
              var newArc = resizeTextPath(d, this, 1.25);

              //Create a new invisible arc that the text can flow along
              var pathText = svg.append("path")
                .attr("class", "hiddenArcSlices")
                .attr("id", "arc"+i)
                .attr("d", newArc)
                .style("fill", "none")
                .style("stroke", "none");

            // } else if (d.depth == 1) {
            //   var newArc = initialTextPos(d, this, 1);
            //   var pathText = svg.append("path")
            //     .attr("class", "hiddenArcSlices")
            //     .attr("id", "arc"+i)
            //     .attr("d", newArc)
            //     .style("fill", "none")
            //     .style("stroke", "none");
            }
        });




    // Draw text
      var text = g.append("text")
        // Give unique classes to every ring
        .attr("class", function(d) {
          // if (d.depth == 0) {
          //   return "data";
          /*} else*/ if (d.depth == 0) {
            return "solid";
          } else if (d.depth == 1) {
            return "innerRing";
          } else if (d.depth == 2) {
            return "outerRing";
          }
        })
        // adjust textcolor
        .style("fill", function(d) {
          return color;
        })
        // Hide text from innerRing
        .style("display", function(d) {
          if (d.depth == 0) {
            return "none"
          }
        })

        .style("text-anchor", function(d) {
          if (d.depth == 2) {
            var rotation = computeTextRotation(d);
            if (rotation > 90) {
              return "end";
            } else {
              return "start";
            }
          } else {
            return "middle";
          }
        })



        //  NAMES ON OUTER CIRCLE
        .text(function(d) {
          if (d.depth == 2) {
            // test = $("#path" + d.id).parent().find("text");
            // console.log(test);

            // var textWidth = test.width();
            // console.log(textWidth);
            // var n=(d.name||"").split(" ").length>1
            // console.log(n);
            // n = d.name.split(" ");
            // console.log(n);
            return d.name;
          }
          else
            return null;
        })

         

        // Rotation for the outerRing text that is over 90 degrees
        .attr("transform", function(d) {
          if (d.depth == 2) {
            var rotation = computeTextRotation(d);
            var transformation = "rotate(" + computeTextRotation(d) + ")";
            if (rotation > 90) {
              var angle = (d.x + d.dx / 2) * 180 / Math.PI - 90;
              transformation = "rotate(" + computeTextRotation(d) + ")rotate(-180)"
            }
            return transformation;
          }
          else
          return null;
         })

        .attr("x", function(d) {
          if (d.depth == 2) {
            var rotation = computeTextRotation(d);
            if (rotation > 90) {
              return -1 * 200;
            }
            return 200;
          } else {
            return null;
          }
        })

        // Adjust margin
        .attr("dx", function(d) {
          if (d.depth == 2) {
            var rotation = computeTextRotation(d);
            if (rotation > 90) {
              return -20;
            }
            return 20;
          } else {
            return null;
          }
        })

        .attr("dy", function(d) {
          var rotation = computeTextRotation(d);
          if (d.depth == 2) {
            return ".35em";
          } else if (d.depth == 1 && rotation > 45 && rotation < 180) {
            return null;
          } else if (d.depth == 1) {
            return ".75em";
          } else if (d.depth == 0) {
            return null;
          }
        })

        // Place text on path
        var textPaths = text.append("textPath")
        .attr("xlink:href", function(d, i) {
          if (d.depth == 2) {
            return null;
          }
          return "#arc" + i;
        })
          
        .attr("startOffset", "50%")  

        .text(function(d) {
          if (d.depth == 2) {
            return null;
          } else {
           return d.name;
         }
        })
        ;


        function mouseover(d) {

          var title = document.getElementById('group');
          var content = d.name;
          title.innerHTML = content;
        

          var thisObject = d;
          var objectsArray = [];
          var colorArray = [];

          while (thisObject.parent != null) {
            objectsArray.push(thisObject);
            thisObject = thisObject.parent;
          }

          for (var i = 0; i < objectsArray.length; i++) {
            var currentPath = d3.select("#path" + objectsArray[i].id);
            currentPath.transition().duration(250)
              .style('stroke', function() {
                return color;
              })
              .style('stroke-width', function() {
                return '3';
              })
          }

          // var test = d3.select("#path" + objectsArray[1].id);
          // console.log(test[0][0].parentNode);

          for (var i = 0; i < objectsArray.length; i++) {
            var currentPath = d3.select("#path" + objectsArray[i].id);
            var objectToMove = currentPath[0][0].parentNode;
            $( objectToMove ).insertBefore( $( "#arc1" ) );
          }

          
        }

        function mouseleave(d) {

          var title = document.getElementById('group');
          var content = "Solid Organogram";
          title.innerHTML = content;
          

          var thisObject = d;
          var objectsArray = [];
          var colorArray = [];

          while (thisObject.parent != null) {
            objectsArray.push(thisObject);
            thisObject = thisObject.parent;
          }

          for (var i = 0; i < objectsArray.length; i++) {
            var currentPath = d3.select("#path" + objectsArray[i].id);
            currentPath.transition().duration(250)
              .style('stroke', function() {
                return '#D7D7D7';
              })
              .style('stroke-width', function() {
                return '1';
              })
          }
        }

        document.getElementById("button").onclick = function () {
          var solid = d3.select("#path2").data()[0];
          click(solid);
        };

        function click(d) {

          // fade out all text elements
          text.transition().style("opacity", "0");

          path.on("mouseover", null)
            .on("mouseleave", null);

          if (d.depth == 2) {
            return null;
          } else if (d.depth == 1) {
            $("#button").css("visibility", "visible");
            $("#button").css("opacity", "1");
            $("#button").css("transition", "visibility 1.5s, opacity 1.5s linear");
            $("#button-wrapper").css("z-index", "5");
          } else if (d.depth == 0) {
            $("#button").css("visibility", "hidden");
            $("#button").css("opacity", "0");
            $("#button").css("transition", "visibility 0s, opacity 0s linear");
            $("#button-wrapper").css("z-index", "-10");
          }
          // console.log(d);

          


          path.transition()
            .duration(750)
            .attrTween("d", arcTween(d))
            .each("end", function(e, i) {

                // check if the animated element's data e lies within the visible angle span given in d
                if (e.x >= d.x && e.x < (d.x + d.dx)) {
                  // get a selection of the associated text element
                  var arcText = d3.select(this.parentNode).select("text");
                  // fade in the text element and recalculate positions
                  arcText.transition().duration(0)
                    .style("opacity", "1")
                    .attr("transform", function(d) {
                      if (d.depth == 2) {
                        var rotation = computeTextRotation(d);
                        var transformation = "rotate(" + computeTextRotation(d) + ")";

                        if (rotation > 90) {
                          var angle = (d.x + d.dx / 2) * 180 / Math.PI - 90;
                          transformation = "rotate(" + computeTextRotation(d) + ")rotate(-180)";
                        }
                        return transformation;
                      }
                      else {
                        return null;
                      }
                    })
                    .each( function(e) {
                      console.log(d.name);
                      if (d.depth == 1) {
                        if (e.depth == 2) {
                          test = $("#path" + e.id).parent().find("text");
                          console.log(test);
                          var textWidth = test.width();
                          console.log("width = ", textWidth);
                    
                          if (textWidth > 150) {

                            var arr = e.name.split(" ");
                            var group = $("#path" + e.id).parent().find("text");
                              console.log("group", group);
                              $( group ).empty();
                            for (var i = 0; i < arr.length; i++) {
                              
                              d3.select(this).append("tspan")
                                .text(arr[i])
                                .attr("dy", i ? "1.2em" : 0)
                                .attr("x", function(d) {
                                  var rotation = computeTextRotation(d);
                                  // console.log(d, rotation);
                                  if (rotation > 90) {
                                    return i ? -220 : 200
                                  } else {
                                    return i ? 220 : 200
                                  }
                                })
                                .attr("text-anchor", function(d) {
                                  var rotation = computeTextRotation(d);
                                  if (rotation > 90) {
                                    return "end"
                                  } else {
                                    return "start"
                                  }
                                })
                                .attr("class", "tspan" + i);
                            };
                          }
                        }
                      } else if (d.depth == 0) {
                        if (e.depth == 2) {
                          // var arr = e.name.split(" ");
                          // for (var i = 0; i < arr.length; i++) {
                          //   d3.select(this).remove("tspan");
                          // }
                        }
                      }
                    }) 


                    .style("text-anchor", function(e) {
                      var rotation = computeTextRotation(e);
                      if (e.depth == 2 && rotation > 90) {
                        return "end";
                      } else if (e.depth == 2) {
                        return "start";
                      } else if (d.depth == 1) {
                        return "middle";
                      } else if (d.depth == 0) {
                        return "middle";
                      }
                    })
                    .attr("x", function(e) {
                      var rotation = computeTextRotation(e);
                      if (d.depth == 1) {
                        if (e.depth == 2 && rotation > 90) {
                          return -y(d.y + d.dy);
                        } else if (e.depth == 2) {
                          return y(d.y + d.dy);
                        } 
                      }

                      if (d.depth == 0) {
                        if (e.depth == 2 && rotation > 90) {
                          return -300;
                        } else if (e.depth == 2) {
                          return 300;
                        }
                      }
                    })

                    

                    .attr("dx", function(e) {
                      var rotation = computeTextRotation(e);
                      
                      if (d.depth == 2) {
                        return 20;
                      } else if (d.depth == 2 && rotation > 90) {
                        return -20;
                      }

                      if (d.depth == 1) {
                        if (e.depth == 2 && rotation > 90) {
                          return -20;
                        } else if (e.depth == 2) {
                          return 20;
                        }
                      }

                      if (d.depth == 0) {
                        if (e.depth == 2 && rotation > 90) {
                          return -20;
                        } else if (e.depth == 2) {
                          return 20;
                        }
                      }
                    });

                  var pathText = d3.select('#arc' + i);

                  pathText.transition().duration(0)
                  .attr("d", function() {
                    elements = d3.select('#path' + d.id);
                    elements = elements[0][0];
                    elementChildren = d3.select('#path' + e.id);
                    elementChildren = elementChildren[0][0];

                    if (d.depth == 1) {
                      // var resize = resizeTextPath(e, elements, 1);
                      // return resize;

                      // var text = $("#path" + d.id).parent().find("text");
                      // console.log(text);

                      // var textpath = $(text).find("textpath");
                      // console.log(textpath);

                      return "M-200 0L200 0";

                    } else if (d.depth == 0) {
                      var resize = resizeTextPath(e, elementChildren, 1.25);
                      return resize;
                    }
                  })
                } else if (e.depth == 0) {
                  var arcText = d3.select(this.parentNode).select("text");
                  arcText.transition().duration(0)
                    .style("opacity", "1");
                }
            });

            if (d.depth == 1) {
              text.style("font-size", function(d) {
                if (d.depth == 2) {
                  return "1em";
                } else if (d.depth == 1) {
                  return "1.5em";
                }
              })
            } else if (d.depth == 0) {
              text.style("font-size", function(d) {
                if (d.depth == 2) {
                  return 0;
                }
              })
            }

            // text.text(function(d) {
            //   test = $("#path" + d.id).parent().find("text");
            //   // console.log(test);

            //   var textWidth = test.width();
            //   console.log("width = ", textWidth);
            //   var n=(d.name||"").split(" ").length>1
            //   // console.log(n);
            //   n = d.name.split(" ");
            //   console.log(n);
            //   return d.name;

            // })

            setTimeout(function(){ 
              path.on("mouseover", mouseover)
                  .on("mouseleave", mouseleave); 
            }, 1000);

            // for (var i = 0; i < d.children.length; i++) {
            //   id = d.children[i].id;

            //   text = $("#path" + id).parent().find("text");
            //   console.log(text);

            //   var textWidth = $(text).width();
            //   console.log(textWidth);
            // }
        }
      });

      d3.select(self.frameElement).style("height", height + "px");

      // Interpolate the scales!
      function arcTween(d) {

        if (d.depth == 1) {
          var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]);   // [0, 1] [startAngle, endAngle]
            yd = d3.interpolate(y.domain(), [d.y, 1]);    // [0, 1] [0 || 0.25 || 0.5 || 0.75, 1]
            yr = d3.interpolate(y.range(), [d.y ? 0 : 0, radius + 100]);   // [0, 500] [20, 500]
          } else if (d.depth == 0) {
            var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]);   // [0, 1] [startAngle, endAngle]
              yd = d3.interpolate(y.domain(), [d.y, 1]);    // [0, 1] [0 || 0.25 || 0.5 || 0.75, 1]
              yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);   // [0, 500] [20, 500]
          }

        return function(d, i) {
          return i
              ? function(t) { return arc(d); }
              : function(t) { 
                x.domain(xd(t)); 
                y.domain(yd(t)).range(yr(t)); 
                return arc(d); 
              };
        };
      }


      function computeTextRotation(d) {
        return (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180;
      }

      // function initialTextPos(d, path, size) {
      //   var path = path;

      //   var innerRadius = y(d.y);
      //   var outerRadius = y(d.y + d.dy);

      //   // if (d.depth == 0) {
      //   //   var innerRadius = 80;
      //   //   var outerRadius = 180;
      //   // } else if(d.depth == 1) {
      //   //   var innerRadius = 180;
      //   //   var outerRadius = 300;
      //   // } else if(d.depth == 2) {
      //   //   var innerRadius = 300;
      //   //   var outerRadius = 550;
      //   // }

      //   var position = innerRadius + (outerRadius - innerRadius) / 2;

      //   //A regular expression that captures all in between the start of a string (denoted by ^) 
      //   //and the first capital letter L
      //   var firstArcSection = /(^.+?)L/;

      //   //The [1] gives back the expression between the () (thus not the L as well) 
      //   //which is exactly the arc statement
      //   var newArc = firstArcSection.exec(d3.select(path).attr("d"));

      //   if (newArc && newArc.length > 0) {
      //     newArc = newArc[1];

      //     //Replace all the comma's so that IE can handle it -_-
      //     //The g after the / is a modifier that "find all matches rather than stopping after the first match"
      //     newArc = newArc.replace(/,/g , " ");


      //   } else {
      //     newArc = d3.select(path).attr("d");
      //     newArc = newArc.replace(/,/g , " ");
      //   }

      //   if (d.depth == 0) {
        
      //     var startLoc  = /M(.*?)A/,    //Everything between the capital M and first capital A
      //         middleLoc   = /A(.*?)0 1 1/,  //Everything between the capital A and 0 0 1
      //         endLoc    = /0 1 1 (.*?)A/, //Everything between the 0 0 1 and the end of the string (denoted by $)
      //         startToSpace = /(.*?)\s/g,  //Everything between start and first space
      //         spaceToEnd = /\s(.*?)$/g;   // Everything from space and the end of the string

      //     // Split path in different sections
      //     var newStart = startLoc.exec( newArc )[1];
      //     var newEnd = endLoc.exec( newArc )[1];
      //     var middleSec = middleLoc.exec( newArc )[1];

      //     var posX = startToSpace.exec( newStart )[1];
      //     posX = posX / size;
      //     if (posX > 0 && posX < 0.001) {
      //       posX = 0;
      //     }

      //     posY = position;
      //     if (posY < 0.001 && posY > 0) {
      //       posY = 0;
      //     }

      //     // Put string back together
      //     newStart = posX + " " + (-posY);
      //     middleStart = posX + " " + posY;

      //     //Everything between start and first space
      //     startToSpace.lastIndex = 0;
      //     var posX = startToSpace.exec( newEnd )[1];
      //     posX = posX / size;

      //     posY = -position;

      //     // Put string back together
      //     newEnd = posX + " " + posY;


      //     radius = position;

      //     // Put string back together
      //     middleSec = radius + " " + radius + " ";
          

      //     // Put whole string back together
      //     newArc = "M" + newStart + "A" + middleSec + " 0 1 0 " + middleStart + "A" + middleSec + " 0 1 0 " + newEnd;

      //     return newArc;


      //   } else {

      //     var startLoc  = /M(.*?)A/,    //Everything between the capital M and first capital A
      //         middleLoc   = /A(.*?)0 0 1/,  //Everything between the capital A and 0 0 1
      //         endLoc    = /0 0 1 (.*?)$/, //Everything between the 0 0 1 and the end of the string (denoted by $)
      //         startToSpace = /(.*?)\s/g,  //Everything between start and first space
      //         spaceToEnd = /\s(.*?)$/g;   // Everything from space and the end of the string

      //   }


      //   // Split path in different sections
      //   var newStart = startLoc.exec( newArc )[1];
      //   var newEnd = endLoc.exec( newArc )[1];
      //   var middleSec = middleLoc.exec( newArc )[1];

      //   //Everything between start and first space
      //   var posX = startToSpace.exec( newStart )[1];
      //   posX = posX / size;

      //   if (posX > 0 && posX < 0.001) {
      //     posX = 0;
      //   }

        
      //   // Everything from space and the end of the string
      //   var posY = spaceToEnd.exec( newStart )[1];
      //   posY = posY / size;

      //   if (posY < 0.001 && posY > 0) {
      //     posY = 0;
      //   }

      //   // Put string back together
      //   newStart = posX + " " + posY;

      //   //Everything between start and first space
      //   startToSpace.lastIndex = 0;
      //   var posX = startToSpace.exec( newEnd )[1];
      //   posX = posX / size;

        
      //   // Everything from space and the end of the string
      //   spaceToEnd.lastIndex = 0;
      //   var posY = spaceToEnd.exec( newEnd )[1];
      //   posY = posY / size;

      //   // Put string back together
      //   newEnd = posX + " " + posY;

      //   //Everything between start and first space
      //   startToSpace.lastIndex = 0;
      //   var radius = startToSpace.exec( middleSec )[1];
      //   radius = position;

      //   // Put string back together
      //   middleSec = radius + " " + radius + " ";
        

      //   // Put whole string back together
      //   newArc = "M" + newStart + "A" + middleSec + "0 0 1 " + newEnd;

      //   //If the end angle lies beyond a quarter of a circle (90 degrees or pi/2) 
      //   //flip the end and start position
      //   var rotation = computeTextRotation(d);
      //   if (rotation > 90 && rotation < 135) {
          
      //     // Flip the direction of the arc by switching the start and end point (and sweep flag)
      //     var newStart = endLoc.exec( newArc )[1];
      //     var newEnd = startLoc.exec( newArc )[1];
      //     var middleSec = middleLoc.exec( newArc )[1];
          
      //     //Build up the new arc notation, set the sweep-flag to 0
      //     newArc = "M" + newStart + "A" + middleSec + "0 0 0 " + newEnd;
      //   }

      //   return newArc;

      // }

      function resizeTextPath(d, path, size) {

        var path = path;

        var innerRadius = y(d.y);
        var outerRadius = y(d.y + d.dy);


        var position = innerRadius + (outerRadius - innerRadius) / 2;

        //A regular expression that captures all in between the start of a string (denoted by ^) 
        //and the first capital letter L
        var firstArcSection = /(^.+?)L/;
        var newArc = firstArcSection.exec(d3.select(path).attr("d"));

        if (newArc == null) {
          newArc = d3.select(path).attr("d");
          var firstArcSection = /^.+?A(.+?)A/;
          newArc = firstArcSection.exec(d3.select(path).attr("d"));

          newArc = newArc[0];

          var startLoc  = /M(.*?)A/,    //Everything between the capital M and first capital A
              middleLoc   = /A(.*?)0 1 1/,  //Everything between the capital A and 0 1 1
              endLoc    = /0 1 1 (.*?)A/, //Everything between the 0 1 1 and the first A
              startToSpace = /(.*?)\s/g,  //Everything between start and first space
              spaceToEnd = /\s(.*?)$/g;   // Everything from space and the end of the string
        } else {
          newArc = newArc[1];

          var pattern = /0 1,1/;
          var result = pattern.test(newArc);

          if (result == false) {
            var startLoc  = /M(.*?)A/,    //Everything between the capital M and first capital A
                middleLoc   = /A(.*?)0 0 1/,  //Everything between the capital A and 0 1 1
                endLoc    = /0 0 1 (.*?)$/, //Everything between the 0 1 1 and the end of the string (denoted by $)
                startToSpace = /(.*?)\s/g,  //Everything between start and first space
                spaceToEnd = /\s(.*?)$/g;   // Everything from space and the end of the string
          } else if (result == true) {
            var startLoc  = /M(.*?)A/,    //Everything between the capital M and first capital A
                middleLoc   = /A(.*?)0 1 1/,  //Everything between the capital A and 0 1 1
                endLoc    = /0 1 1 (.*?)$/, //Everything between the 0 1 1 and the end of the string (denoted by $)
                startToSpace = /(.*?)\s/g,  //Everything between start and first space
                spaceToEnd = /\s(.*?)$/g;   // Everything from space and the end of the string
          }


          newArc = newArc.replace(/,/g , " ");

          // Split path in different sections
          var newStart = startLoc.exec( newArc )[1];
          var newEnd = endLoc.exec( newArc )[1];
          var middleSec = middleLoc.exec( newArc )[1];

          //Everything between start and first space
          var posX = startToSpace.exec( newStart )[1];
          posX = posX / size;

          if (posX > 0 && posX < 0.001) {
            posX = 0;
          }

          // Everything from space and the end of the string
          var posY = spaceToEnd.exec( newStart )[1];
          posY = posY / size;

          if (posY > 0 && posY < 0.001) {
            posY = 0;
          }

          // Put string back together
          newStart = posX + " " + posY;

          //Everything between start and first space
          startToSpace.lastIndex = 0;
          var posX = startToSpace.exec( newEnd )[1];
          posX = posX / size;


          // Everything from space and the end of the string
          spaceToEnd.lastIndex = 0;
          var posY = spaceToEnd.exec( newEnd )[1];
          posY = posY / size;

          // Put string back together
          newEnd = posX + " " + posY;

          //Everything between start and first space
          startToSpace.lastIndex = 0;
          var radius = startToSpace.exec( middleSec )[1];
          radius = radius / size;

          // Put string back together
          middleSec = radius + " " + radius + " ";

          // Put whole string back together
          newArc = "M" + newStart + "A" + middleSec + " 0 0 1 " + newEnd;

          //If the end angle lies beyond a quarter of a circle (90 degrees or pi/2) 
          //flip the end and start position
          var rotation = computeTextRotation(d);
          if (rotation > 45 && rotation < 180) {

            // Flip the direction of the arc by switching the start and end point (and sweep flag)
            var newStart = endLoc.exec( newArc )[1];
            var newEnd = startLoc.exec( newArc )[1];
            var middleSec = middleLoc.exec( newArc )[1];
            
            //Build up the new arc notation, set the sweep-flag to 0
            newArc = "M" + newStart + "A" + middleSec + "0 0 0 " + newEnd;
          }

          return newArc;

        }
        
        // newArc = newArc.replace(/,/g , " ");


        // // Split path in different sections
        // var newStart = startLoc.exec( newArc )[1];
        // var newEnd = endLoc.exec( newArc )[1];
        // var middleSec = middleLoc.exec( newArc )[1];


        // //Everything between start and first space
        // var posX = startToSpace.exec( newStart )[1];
        // posX = posX / size;

        // if (posX > 0 && posX < 0.001) {
        //   posX = 0;
        // }

        // posY = position;

        // if (posY > 0 && posY < 0.001) {
        //   posY = 0;
        // }


        // // Put string back together
        // newStart = posX + " " + (-posY);
        // middleStart = posX + " " + posY;

        // //Everything between start and first space
        // startToSpace.lastIndex = 0;
        // var posX = startToSpace.exec( newEnd )[1];
        // posX = posX / size;

        // posY = -position;


        // // Put string back together
        // newEnd = posX + " " + posY;

        // //Everything between start and first space
        // var beforeSpace = /(.*?)\s/g;
        // var radius = beforeSpace.exec( middleSec )[1];
        // radius = position;

        // // Put string back together
        // middleSec = radius + " " + radius + " ";

        // // Put whole string back together
        // var rotation = computeTextRotation(d);
        // if (rotation > 90 && rotation < 135) {
        //   newArc = "M" + newStart + "A" + middleSec + " 0 0 0 " + middleStart + "A" + middleSec + " 0 0 0 " + newEnd;
        // } else {
        //   newArc = "M" + newStart + "A" + middleSec + " 0 1 0 " + middleStart + "A" + middleSec + " 0 1 0 " + newEnd;
        // }

        // return newArc;

      }
    }
  });
})(jQuery);
