
///http://bl.ocks.org/stepheneb/1182434
registerKeyboardHandler = function(callback) {
  var callback = callback;
  d3.select(window).on("keydown", callback);  
};

/* git
http://stackoverflow.com/questions/2745076/what-are-the-differences-between-git-commit-and-git-push
git config --global user.name "Alessandro"
git config --global core.editor "/usr/bin/vi -w"
git config credential.helper store
git config --unset credential.helper

Workspace <-> index <-> local repo <-> remote repo

//upload to remote repo
git add .               #work->ind
git commit -m date      #ind->lrepo
git status
git push origin master  #lrepo->rrepo

//branches
git status
git branch zoom
git remote add zoom https://github.com/aless80/iGrow
git push origin --delete <branchToDelete>
git checkout zoom       #lrepo->work
git checkout -f master  #discard changes

//Pull 
git branch mybranch
git pull            //rrepo->work

//Clone
git checkout zoom
git clone https://github.com/aless80/iGrow

//Diff
git diff zoom
*/

//Baby class
Baby = function(data){  
    this.Name = new Array();
    this.BirthDate = new Array();
    this.Gender = new Array();
    this.Data = new Array();
}
Baby.prototype.AddBaby = function(obj){
      this.Name.push(obj.name);
      this.BirthDate.push(obj.birthdate);
      //This conversion  not needed, but this would prevent bugs
      var gender = obj.gender;
      if (gender == "Female") {
        gender = 2;
      } else if (gender == "Male") {
        gender = 1;
      }
      this.Gender.push(gender);
      this.Data.push(new Data);
};
Baby.prototype.RemoveBabyByName = function(name){
      var index = this.Name.indexOf(name);
      if (index > -1) {
        this.Name.splice(index, 1);
        this.BirthDate.splice(index, 1);
        this.Data.splice(index, 1);
        this.Gender.splice(index, 1);
        return true;
      } else {
        return false;
      }
};
//From the name, get the index of the current baby in the baby instance 
Baby.prototype.GetIndex = function(name){
  return baby.Name.indexOf(name);
}

//Data class
Data = function(data){  
    this.Date = new Array();
    this.Weeks = new Array();
    this.Weight = new Array();
}
Data.prototype.Append = function(obj){
      this.Date.push(obj.Date);
      this.Weeks.push(obj.Weeks);
      this.Weight.push(obj.Weight);
};



SimpleGraph = function(elemid, options) {
  var self = this;
  this.selectCircle = null;
  
  this.setCurrrentDataWeight();

  this.chart = document.getElementById(elemid);
  this.cx = this.chart.clientWidth;
  this.cy = this.chart.clientHeight;
  this.options = options || {};

  this.title = getName();

  this.setPoints();

  var xrange=d3.extent(this.points, function(d) {  return d.age; });
  var yrange=[d3.min(this.points, function(d) { return Math.floor(d.m - 3 * d.s); }), 
              d3.max(this.points, function(d) { return Math.ceil(d.m); }) ];

  this.options.xmax = options.xmax || xrange[1];
  this.options.xmin = options.xmin || xrange[0];
  this.options.ymax = options.ymax || yrange[1];
  this.options.ymin = options.ymin || yrange[0];
  
  this.options.maxzoom = 1 / options.maxzoom || 0.2;
  
  this.padding = {
     "top":    this.title  ? 42 : 20,
     "right":                 30,
     "bottom": this.options.xlabel ? 63 : 10,
     "left":   this.options.ylabel ? 70 : 45
  };

  this.width = this.cx - this.padding.left - this.padding.right;
  this.height = this.cy - this.padding.top  - this.padding.bottom;

  // x-scale
  this.x = d3.scale.linear()
      .domain([this.options.xmin, this.options.xmax])
      .range([0, this.width]);

  // drag x-axis logic
  this.downx = Math.NaN;

  // y-scale (inverted domain)
  this.y = d3.scale.linear()
      .domain([this.options.ymax, this.options.ymin])
      .nice()
      .range([0, this.height])
      .nice();

  // drag y-axis logic
  this.downy = Math.NaN;

  this.dragged = this.selected = null;


//this.vis
  this.vis = d3.select(this.chart).append("svg") 
      .attr("width",  this.cx)
      .attr("height", this.cy)
      .append("g")
      .attr("class", "g_svg1")
        .attr("transform", "translate(" + this.padding.left + "," + this.padding.top + ")");

  this.rect = this.vis.append("rect")
      .attr("width", this.width)
      .attr("height", this.height)
      .style("fill", "#EEEEEE")
      .attr("pointer-events", "all")
      //.on("mousedown.drag", self.plot_drag())
      //.on("touchstart.drag", self.plot_drag())
      .on("mousedown", function(d){
        if (self.selectCircle != null) {
          //selectCircle.r = 6;  //NB: does not work. use setAttribute for attributes:
          deselectCircle(1);
          self.update(); //update so that circles get their normal color. not able to selectAll circle??
        }
      });

  this.svg = this.vis.append("svg")
      .attr("top", 0)
      .attr("left", 0)
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("viewBox", "0 0 "+this.width+" "+this.height)
      .attr("class", "svg");

this.plotLines();

  // add Chart Title
  if (this.title) {
    this.vis.append("text")
        .attr("class", "axis")
        .attr("id","title")
        .text(this.title)
        .attr("x", this.width/2)
        .attr("dy","-0.8em")
        .style("text-anchor","middle");
  }

  // Add the x-axis label
  if (this.options.xlabel) {
    this.vis.append("text")
        .attr("class", "axis")
        .text(this.options.xlabel)
        .attr("x", this.width/2)
        .attr("y", this.height)
        .attr("dy","2.4em")
        .style("text-anchor","middle");
  }

  // add y-axis label
  if (this.options.ylabel) {
    this.vis.append("g").append("text")
        .attr("class", "axis")
        .text(this.options.ylabel)
        .style("text-anchor","middle")
        .attr("transform","translate(" + -40 + " " + this.height/2+") rotate(-90)");
  }
  d3.select(this.chart)
      .on("mousemove.drag", self.mousemove())
      .on("touchmove.drag", self.mousemove())
      .on("mouseup.drag",   self.mouseup())
      .on("touchend.drag",  self.mouseup());

  //zoom1
  //.call(d3.behavior.zoom().on("zoom", redraw)).on("dblclick.zoom", null).on("wheel.zoom", null);
  self.origrange = [self.x.domain()[1]-self.x.domain()[0], self.y.domain()[0]-self.y.domain()[1]];
  
  var zoom = d3.behavior.zoom()
      .scaleExtent([0.833333, 1.2])
      .x(self.x)
      .y(self.y)
      .on("zoom", function(){
        console.log("zoom1")
          self.redraw()
      });
  self.rect.call(zoom)

  this.redraw()();
};


//
// SimpleGraph methods
//
//Redraws the axes
SimpleGraph.prototype.redraw = function(zoom) {
  var self = this;
  return function() {
    //zooming: Compute if the domain range is changing more than 1% (user is zooming out) or not (user is dragging with mouse) 
    var newrange = [self.x.domain()[1]-self.x.domain()[0], self.y.domain()[0]-self.y.domain()[1] ]
    console.log("self.x.domain()=",self.x.domain())
    //console.log("self.origrange",self.origrange)
    //console.log("newrange      ",newrange)  
    var zooming = ((Math.abs(newrange[0] - self.origrange[0])/self.origrange[0] > 0.1) && 
                  (Math.abs(newrange[1] - self.origrange[1])/self.origrange[1] > 0.1))
      
    if (zooming){
      console.log(newrange[0]/newrange[1])
      console.log(self.origrange[0]/self.origrange[1])
      if (newrange[0] / self.origrange[0] > 1.1) {
        console.log("zooming out too much. return") 
        return false;
        }
      if ((newrange[0] / self.origrange[0] < self.options.maxzoom)  && (newrange[1] / self.origrange[1] < self.options.maxzoom)) {
          console.log("zooming in too much. return") 
          return false;
      }
      // var domainx = [Math.max(self.x.domain()[0], self.options.xmin), Math.min(self.x.domain()[1], self.options.xmax)],
      //     domainy = [Math.min(self.y.domain()[0], self.options.ymax), Math.max(self.y.domain()[1], self.options.ymin)];
      //     console.log("zooming")
      //     // console.log("domainx : max of x.domain()[0] - xmin: "+self.x.domain()[0], self.options.xmin)
      //     // console.log("domainx : min of x.domain()[1] - xmax: "+self.x.domain()[1], self.options.xmax)
      //     // console.log("domainy : min of y.domain()[1] - ymax: "+self.y.domain()[0], self.options.ymax)
      //     // console.log("domainy : max of y.domain()[0] - ymin: "+self.y.domain()[1], self.options.ymin)        
      //     self.x.domain(domainx);
      //     self.y.domain(domainy); //NB inverted axis: [ymax, ymin]
    }
    //Not needed, I think:
    //self.origrange = [self.x.domain()[1]-self.x.domain()[0], self.y.domain()[0]-self.y.domain()[1]];    
    
    var tx = function(d) { 
      return "translate(" + self.x(d) + ",0)"; 
    },
    ty = function(d) { 
      return "translate(0," + self.y(d) + ")";
    },
    stroke = function(d) { 
      return d ? "#ccc" : "#666"; 
    },
    fx = self.x.tickFormat(10),
    //fx = self.x.tickFormat(d3.format("f2")),  //does not work
    fy = self.y.tickFormat(10);

    // Regenerate x-ticks…
/*d3.select(this.parentNode)
temp = d3.select("svg"); temp.select(function() { return this.parentNode; })*/
    var gx = self.vis.selectAll("g.x")
    //linear.ticks([count]) Returns approximately count representative values from the scale's input domain.
        .data(self.x.ticks(10).map(self.x.tickFormat(2, ".1")), String)     //how many ticks on the x axis
        .attr("transform", tx);
    gx.select("text")
        .text(fx);

    var gxe = gx.enter().insert("g", ".svg")   //Inserts a new element with the specified name before the element matching the specified before selector,
        .attr("class", "x")
        .attr("transform", tx);
    //Vertical grid
    gxe.append("line")
        .attr("stroke", stroke)
        .attr("y1", 0)
        .attr("y2", self.height);

    gxe.append("text")
        .attr("class", "axis label")
        .attr("y", self.height)
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
        .text(fx) 
        .style("cursor", "ew-resize")
        .on("mouseover", function(d) { d3.select(this).style("font-weight", "bold");})
        .on("mouseout",  function(d) { d3.select(this).style("font-weight", "normal");})
        .on("mousedown.drag",  self.xaxis_drag())
        .on("touchstart.drag", self.xaxis_drag());
    gx.exit().remove();

    
    //Change comma to dot: but have to change "axis" from title and axis labels
    jQuery(".axis.label").each(function( index ) { 
    	var elem = jQuery(this);
    	elem.text(elem.text().replace(",",""))
    	});    

    // Regenerate y-ticks…
    var gy = self.vis.selectAll("g.y")
        .data(self.y.ticks(10), String)
        .attr("transform", ty);

    gy.select("text")
        .text(fy);

    var gye = gy.enter().insert("g", ".svg")
        .attr("class", "y")
        .attr("transform", ty)
        .attr("background-fill", "#FFEEB6");

    gye.append("line")
        .attr("stroke", stroke)
        .attr("x1", 0)
        .attr("x2", self.width);

    gye.append("text")
        .attr("class", "axis label")
        .attr("x", -3)
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .text(fy)
        .style("cursor", "ns-resize")
        .on("mouseover", function(d) { d3.select(this).style("font-weight", "bold");})
        .on("mouseout",  function(d) { d3.select(this).style("font-weight", "normal");})
        .on("mousedown.drag",  self.yaxis_drag())
        .on("touchstart.drag", self.yaxis_drag());

    gy.exit().remove();
    //This zoom is call after the plot has loaded
    var zoom = d3.behavior.zoom()    
        .scaleExtent([0.833333, 1.2])
        .x(self.x)
        .y(self.y)
        .on("zoom", self.redraw());     //nb cannot put funtion(){self.redraw()} here
    self.rect.call(zoom)

  //http://bl.ocks.org/shawnbot/6518285
    //zoom limit does not work in this version?
    //.yExtent([-1500,1500])
    self.update();
  }  
}

SimpleGraph.prototype.plotNSigmaLine = function(n, gender){
  var self = this;
  //Choose Female if no babies are defined
  if (gender == 0) {gender = 2}
  self.line = d3.svg.line()
    .x(function(d, i) { 
      return this.x(this.points[i].age); })
    .y(function(d, i) { 
      return this.y(this.points[i].m + n * this.points[i].s); })
    .interpolate("linear");

  self.area = d3.svg.area()
    .x(function(d, i) {
      return this.x(this.points[i].age); })
    .y1(function(d, i) { 
      var Y = ((n > 0) ? (this.points[i].m + n * this.points[i].s) : (this.points[i].m));
      return this.y(Y);})
    .y0(function(d, i) { 
      var Y = ((n > 0) ? (this.points[i].m) : (this.points[i].m + n * this.points[i].s));
      return this.y(Y); })

    var color = {"1":"cyan", "2":"magenta"};
    var weiGender = {"1":weiBoy, "2":weiGirl};

    self.svg.append("path")
      .attr("class", "line")
      .attr("id" , gender+"_"+n+"sigma")
      //.classed("pathArea", true)
      .attr("d", this.line(weiGender[gender]))
      .style("stroke" , color[gender])
      .style("stroke-width" , (n==0 ? 2 : 1))
      .style("fill" , "none");

  if (n > -3 && n < 3 && n != 0) {
    self.svg.append("path")
    .attr("class", "line")
    .attr("id" ,"area_"+n)    
    .attr("d" , this.area(weiGender[gender]))
    .style("opacity" ,1 - Math.abs(n/3))
    .style("fill" , color[gender]);
  } 
}

SimpleGraph.prototype.plotLines = function() {
  var self = this;
  var gender = getGender();
  this.plotNSigmaLine(0, gender);
  this.plotNSigmaLine(0.674, gender);
  this.plotNSigmaLine(-0.674, gender);
  this.plotNSigmaLine(3, gender);
  this.plotNSigmaLine(-3, gender);
  this.plotNSigmaLine(2, gender);
  this.plotNSigmaLine(-2, gender);  
}

//Update the lines and the circles
SimpleGraph.prototype.update = function() {
  var self = this;
  //var lines = this.vis.select("path").attr("d", this.line(this.points));
  //This line with selectAll messes up the area plot because  it puts the line data to this.points for all lines
  //var lines = this.vis.selectAll("path").attr("d", this.line(this.points));
  //So I remove and replot the lines:
  this.removePathsInSVG();
  this.plotLines(); //is this really needed? there it recreates all lines.
  var circle = this.vis.select("svg").selectAll("circle")
      .data(d3.transpose([this.dataWeight.Weeks, this.dataWeight.Weight]))
      .style("stroke","blue");

  //Define tooltips
  var tooltip = d3.select("body").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0)
    .style("position", "absolute");

  circle.enter().append("circle")
      .attr("id", function(d, i){ return "circle_"+i;})
      .attr("class", function(d) {
        return d === self.selected ? "selected" : null; })
      .attr("cx", function(d) { return self.x(d[0]); })
      .attr("cy", function(d) { return self.y(d[1]); })
      .attr("r", 6.0)
      .style("stroke","blue")
      .style("cursor", "ns-resize")
      //.on("mousedown.drag",  self.datapoint_drag())
      //.on("touchstart.drag", self.datapoint_drag())
      .on("mousedown", function(d){
          if (self.selectCircle != null) {
            //recolor/delect the previous circle
            self.selectCircle.style = "stroke: blue; cursor: ns-resize; fill: none;"
            deselectCircle(0)
          }
          //set selectCircle and color the circle so that it can be removed        
          self.selectCircle = this;
          document.getElementById('DeleteMeasure').disabled = false;
          d3.select(this)
              .style("stroke","red")
              .attr("r",8)
              .style("fill","orange");
        })
      .on("mouseover", function(d){
          //show tooltip
          d3.select(this)
              .style("fill","blue");
          tooltip.transition()
              .duration(200) 
              .style("opacity", .9);
          tooltip.html(function(){
              //Show the date
              var ind = graph.dataWeight.Weeks.indexOf(d[0])
              var date = graph.dataWeight.Date[ind];
              var string = "Date: " + date + "<br/>Age: ";
              //Show the age
              if (d[0] < 3) {
            	  string = string.concat(d[0] * 7 + " weeks");
              } else if (d[0] < 20) {
	              //var weeks = Math.floor(d[0]);
	              string = string.concat(Math.floor(d[0]) + " weeks");
	              //skip days.. var days = (d[0] * 7) - (weeks * 7);	              
              } else {
  //          	  var dateD = DMYToDate(date);
  //          	  var birthdateD = DMYToDate(getBirthdate());
            	  
            	  var birthdate = getBirthdate();
            	  
            	  var monthsBDate = birthdate .substring(3,5);
            	  var monthsDate = date.substring(3,5)
            	  
            	  var months = monthsDate - monthsBDate
            	  
            	  string = string.concat(months + " months");
            	  //string = string.concat(" and " + weeks + " weeks");
              }
              //Show the weight
              return string.concat("<br/>Weight: "  + d[1] + "Kg");
          })
          .style("left", (d3.event.pageX) + "px")     
          .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mousemove", function(){
          tooltip.style("top",(d3.event.pageY-10)+"px")
                  .style("left",(d3.event.pageX+20)+"px");
          })
      .on("mouseout", function(d){
          //reset current object
          //currentObject = null;
          //tooltip fades away
          d3.select(this)
              .style("fill","none");
          tooltip.transition()
              .duration(500)
              .style("opacity", 0);
      });

  circle
      .attr("class", function(d) { return d === self.selected ? "selected" : null; })
      .attr("cx", function(d) { return self.x(d[0]); })
      .attr("cy", function(d) { return self.y(d[1]); });

  circle.exit().remove();


//var vis = this.vis;
d3.select("body")
  .on("keydown", function() {
    //exit if you have no circle selected
    if (self.selectCircle == null) {
      return false;
    }
    //Catch keys delete and backspace
    //console.log("d3.event.keyCode="+d3.event.keyCode)
    if ((d3.event.keyCode == 46) || (d3.event.keyCode == 8)) { //Delete or Backspace
      var del = deleteWeight(self.selectCircle.id);
      if (del) {
        deselectCircle(1);
      }
      self.update();
      tooltip.transition()
              .duration(500)
              .style("opacity", 0);
    }
  });

  if (d3.event && d3.event.keyCode) {
    //The default action of the event will not be triggered:
    d3.event.preventDefault();  //cancels
    //Prevent the event from bubbling up the DOM tree, preventing any parent handlers from being notified of the event
    d3.event.stopPropagation(); 
  }
}



SimpleGraph.prototype.removePathsInSVG = function() {
  d3.selectAll(".line").remove(); 
}

SimpleGraph.prototype.setCurrrentDataWeight = function(){
  var index = baby.GetIndex(getName());
  //Plot males when no baby is defined
  if (index == -1) {
    this.dataWeight = new Data();
    return;
  }   
  this.dataWeight = baby.Data[index];
}

SimpleGraph.prototype.setTitle = function(){
  // write the Chart Title
  var self = this;
  if (this.title) {
    d3.select("#title")
        .text(this.title);
   }
}

//set this.Points containing the data for the lines according to the current gender
SimpleGraph.prototype.setPoints = function(){
  var self = this;
  switch (getGender()) {
  case 0:
    this.points = this.options.pointsGirl;
    break;
  case 1:
    this.points =  this.options.pointsBoy;
    break;
  case 2:
    this.points =  this.options.pointsGirl;
    break;
  default:
    throw "Error: unrecognized child's gender: " + getGender();
  }
}

SimpleGraph.prototype.mousemove = function() {
  var self = this;
  return function() {
    var p = d3.mouse(self.vis[0][0]),
        t = d3.event.changedTouches;    
    if (self.dragged) {
      self.dragged.y = self.y.invert(Math.max(0, Math.min(self.height, p[1])));
      self.update();
    };
    if (!isNaN(self.downx)) {
      d3.select('body').style("cursor", "ew-resize");
      var rupx = self.x.invert(p[0]),
          xaxis1 = self.x.domain()[0],
          xaxis2 = self.x.domain()[1],
          xextent = xaxis2 - xaxis1;
      if (rupx != 0) {
        var changex, new_domain;
        changex = self.downx / rupx;
        new_domain = [xaxis1, xaxis1 + (xextent * changex)];
        self.x.domain(new_domain);
        self.redraw()();
      }
      d3.event.preventDefault();
      d3.event.stopPropagation();
    };
    if (!isNaN(self.downy)) {
      d3.select('body').style("cursor", "ns-resize");
      var rupy = self.y.invert(p[1]),
          yaxis1 = self.y.domain()[1],
          yaxis2 = self.y.domain()[0],
          yextent = yaxis2 - yaxis1;
      if (rupy != 0) {
        var changey, new_domain;
        changey = self.downy / rupy;
        new_domain = [yaxis1 + (yextent * changey), yaxis1];
        self.y.domain(new_domain);
        self.redraw()();
      }
      d3.event.preventDefault();
      d3.event.stopPropagation();
    }
  }
};

SimpleGraph.prototype.mouseup = function() {
  var self = this;
  return function() {
    document.onselectstart = function() { return true; };
    d3.select('body').style("cursor", "auto");
    d3.select('body').style("cursor", "auto");
    if (!isNaN(self.downx)) {
      self.redraw()();
      self.downx = Math.NaN;
      d3.event.preventDefault();
      d3.event.stopPropagation();
    };
    if (!isNaN(self.downy)) {
      self.redraw()();
      self.downy = Math.NaN;
      d3.event.preventDefault();
      d3.event.stopPropagation();
    }
    if (self.dragged) { 
      self.dragged = null 
    }
  }
}

SimpleGraph.prototype.xaxis_drag = function() {
  var self = this;
  return function(d) {
    document.onselectstart = function() { return false; };
    var p = d3.mouse(self.vis[0][0]);
    self.downx = self.x.invert(p[0]);
  }
};

SimpleGraph.prototype.yaxis_drag = function(d) {
  var self = this;
  return function(d) {
    document.onselectstart = function() { return false; };
    var p = d3.mouse(self.vis[0][0]);
    self.downy = self.y.invert(p[1]);
  }
};




/*SimpleGraph.prototype.datapoint_drag = function() {
  console.log("datapoint_drag")
  var self = this;
  return function(d) {
    //console.log("datapoint_drag, self.selected="+self.selected);
    registerKeyboardHandler(self.keydown());
    document.onselectstart = function() { return false; };
    self.selected = self.dragged = d;
    self.update();    
  }
};


/*
//remove these at some?
SimpleGraph.prototype.plot_drag = function() {
  console.log("plot_drag")
  var self = this;
  return function() {
    registerKeyboardHandler(self.keydown());
    d3.select('body').style("cursor", "move");
    if (d3.event.altKey) {
      var p = d3.mouse(self.vis.node());
      var newpoint = {};
      newpoint.x = self.x.invert(Math.max(0, Math.min(self.width,  p[0])));
      newpoint.y = self.y.invert(Math.max(0, Math.min(self.height, p[1])));
      self.points.push(newpoint);
      self.points.sort(function(a, b) {
        if (a.x < b.x) { return -1 };
        if (a.x > b.x) { return  1 };
        return 0
      });
      self.selected = newpoint;
      self.update();
      d3.event.preventDefault();
      d3.event.stopPropagation();
    }    
  }
};

SimpleGraph.prototype.keydown = function() {
  var self = this;
  return function() {
    if (!self.selected) return;
    switch (d3.event.keyCode) {
      case 8: // backspace
      case 46: { // delete
        var i = self.points.indexOf(self.selected);
        self.points.splice(i, 1);
        self.selected = self.points.length ? self.points[i > 0 ? i - 1 : 0] : null;
        self.update();
        break;
      }
    }
  }
};
*/
