
registerKeyboardHandler = function(callback) {
    var callback = callback;
    d3.select(window).on("keydown", callback);
};

/* Style
http://jshint.com/
*/
/* git
http://stackoverflow.com/questions/2745076/what-are-the-differences-between-git-commit-and-git-push
git config --global user.name "Alessandro"
git config --global core.editor "/usr/bin/vi -w"
git config credential.helper store
git config --unset credential.helper
git config credential.helper store    #store my info (username/password)

Workspace <-> index <-> local repo <-> remote repo

//upload to remote repo
git add .               #work->ind
git commit -m date      #ind->lrepo
git status
git push origin master  #lrepo->rrepo

//branches
git status
git branch zoom     # create a new local branch
git remote add zoom https://github.com/aless80/iGrow  #add files remotely
git checkout zoom       #lrepo->work
git checkout -f master  #discard changes
git checkout -b zoom2 origin/zoom2  #switch to zoom2 branch and download it

//delete branch
git branch -d lbranch      #delete a local branch
git push origin :rbranch    #delete remote branch. watch out

//Clone
git clone https://github.com/aless80/iGrow
git branch -r     #see remote branches
git checkout lbranch   #if lbranch does not exist locally, create it and switch to it

//Pull
git branch mybranch
git pull            //rrepo->work

//force pull
git fetch --all
git reset --hard origin/master        //delete local master or:
git reset --hard origin/your_branch   //delete local branch

//Diff
git diff zoom
git diff master origin/maste
*/

//Baby class
Baby = function(name, birthdate, gender){
      this.Name = name;
      this.BirthDate = birthdate;
      //This conversion  not needed, but this could prevent bugs
      if (gender == "Female") {
        gender = 2;
      } else if (gender == "Male") {
        gender = 1;
      }
      this.Gender = gender;
      this.Data = new Array();
};

//Data class
// Datum = function(date, weeks, weight, length, comment){
//     this.Date = date;
//     this.Weeks = weeks;
//     this.Weight = weight;
//     this.Length = length;
//     this.WeightQ = (typeof quantile === "undefined")?"N/A":quantile;
//     this.Comment=(typeof comment === "undefined")?"":comment;
// }

Graph = function(elemid, options) {
    var self = this;
    this.selectCircle = null;
    this.selectCircleData=null;

    this.setCurrrentDataWeight();
    this.chart = document.getElementById(elemid);
    this.cx = this.chart.clientWidth;
    this.cy = this.chart.clientHeight;

    this.title = Page.getCurrName();

    this.useOptions(options || {});
    // this.options = options || {};
    // this.setPoints();
    // //this.points =  this.options.pointsBoy;
    // var xrange=d3.extent(this.points, function(d) { return d.age; });
    // var yrange=[d3.min(this.points, function(d) { return Math.floor(d.m - 3 * d.s); }),
    //             d3.max(this.points, function(d) { return Math.ceil(d.m); }) ];


    // this.options.xmin = ((typeof options.xmin == "undefined") ? xrange[0] : options.xmin);
    // this.options.xmax = ((typeof options.xmax == "undefined") ? xrange[1] : options.xmax);
    // this.options.ymax = ((typeof options.ymax == "undefined") ? yrange[1] : options.ymax);
    // this.options.ymin = ((typeof options.ymin == "undefined") ? yrange[0] : options.ymin);

    // this.options.maxzoom = 1 / options.maxzoom || 0.2;


    this.padding = {
        "top":    42,
        "right":  30,
        "bottom": 63,
        "left":   70
    };

    this.width = this.cx - this.padding.left - this.padding.right;
    this.height = this.cy - this.padding.top  - this.padding.bottom;

    // // x-scale
    // this.x = d3.scale.linear()
    //     .domain([this.options.xmin, this.options.xmax])
    //     .range([0, this.width]);

    // // y-scale (inverted domain)
    // this.y = d3.scale.linear()
    //     .domain([this.options.ymax, this.options.ymin])
    //     .nice()
    //     .range([0, this.height])
    //     .nice();
    this.setScale();


    // drag x-axis logic
    this.downx = Math.NaN;
    // drag y-axis logic
    this.downy = Math.NaN;

    this.dragged = this.selected = null;

    this.vis = d3.select(this.chart).append("svg")
        .attr("width",  this.cx)
        .attr("height", this.cy)
        .append("g")
        .attr("class", "g_svg1")
            .attr("transform", "translate(" + this.padding.left + "," + this.padding.top + ")");

    //I need this to test the zoom
    this.g = d3.select("g_svg1");

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
            Page.deselectCircle(1);
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

    // // Add the x-axis label
    // if (this.options.xlabel) {
    //     this.vis.append("text")
    //         .attr("class", "axis")
    //         .attr("id", "xlabel")
    //         .text(this.options.xlabel)
    //         .attr("x", this.width/2)
    //         .attr("y", this.height)
    //         .attr("dy","2.4em")
    //         .style("text-anchor","middle");
    // }
    // // add y-axis label
    // if (this.options.ylabel) {
    //     this.vis.append("g").append("text")
    //         .attr("class", "axis")
    //         .attr("id", "ylabel")
    //         .text(this.options.ylabel)
    //         .style("text-anchor","middle")
    //         .attr("transform","translate(" + -40 + " " + this.height/2+") rotate(-90)");
    // }
    this.setAxisLabels();


    d3.select(this.chart)
        .on("mousemove.drag", self.mousemove())
        .on("touchmove.drag", self.mousemove())
        .on("mouseup.drag",   self.mouseup())
        .on("touchend.drag",  self.mouseup());


    self.origrange = [self.x.domain()[1]-self.x.domain()[0], self.y.domain()[0]-self.y.domain()[1]];

    this.scale=1;
    this.zoom = d3.behavior.zoom()
        .scaleExtent([1, 3])
        //.x(self.x)  //cannot use .scaleExtent with this
        //.y(self.y)
        .on("zoom", function(){
            //self.redraw()   //problem: it does not work in redraw because I have to call zoom again, and that messes up the axis
            self.zoomHandler()
        });
    self.rect.call(this.zoom)

    this.redraw()();
};

//
// Graph methods
//
Graph.prototype.useOptions = function(options) {
    this.options = options || {};
    this.setPoints();
    //this.points =  this.options.pointsBoy;
    var xrange=d3.extent(this.points, function(d) { return d.age; });
    var yrange=[d3.min(this.points, function(d) { return Math.floor(d.m - 3 * d.s); }),
                d3.max(this.points, function(d) { return Math.ceil(d.m); }) ];

    this.options.xmin = ((typeof options.xmin == "undefined") ? xrange[0] : options.xmin);
    this.options.xmax = ((typeof options.xmax == "undefined") ? xrange[1] : options.xmax);
    this.options.ymax = ((typeof options.ymax == "undefined") ? yrange[1] : options.ymax);
    this.options.ymin = ((typeof options.ymin == "undefined") ? yrange[0] : options.ymin);

    this.options.maxzoom = 1 / options.maxzoom || 0.2;
}

Graph.prototype.setScale = function(){
    self = this;
    console.log(self)
    console.log("setScale: this.options.ymax=",this.options.ymax)
    // x-scale
    this.x = d3.scale.linear()
        .domain([this.options.xmin, this.options.xmax])
        .range([0, this.width]);

    // y-scale (inverted domain)
    this.y = d3.scale.linear()
        .domain([this.options.ymax, this.options.ymin])
        .range([0, this.height])
        .nice();
}

Graph.prototype.regenerate = function(){
    var self = this;
    var tx = function(d) {
      return "translate(" + self.x(d)  + ",0)";
    },
    ty = function(d) {
      return "translate(0," + self.y(d)  + ")";
    };
    var stroke = function(d) {
      return d ? "#ccc" : "#666";
    };
    var fx = self.x.tickFormat(10),
    fy = self.y.tickFormat(10);

    // Regenerate x-ticks…
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
}

Graph.prototype.zoomHandler = function() {
    var self = this;
    var rangex = (this.options.xmax-this.options.xmin);
    var halfdiffrangex = (rangex - (rangex / d3.event.scale))/2;
    var rangey = (this.options.ymax-this.options.ymin);
    var halfdiffrangey = (rangey - (rangey / d3.event.scale))/2;
    //If scale/range changes do not translate much. if range does not change translate
    var xdomain, ydomain;
    if (self.scale==d3.event.scale) { //translate
    xdomain = [this.options.xmin+halfdiffrangex-d3.event.translate[0]/6,
               this.options.xmax-halfdiffrangex-d3.event.translate[0]/6 ];
    ydomain = [this.options.ymax-halfdiffrangey+d3.event.translate[1]/25,
               this.options.ymin+halfdiffrangey+d3.event.translate[1]/25];
    } else { //scale
    xdomain = [this.options.xmin+halfdiffrangex,
               this.options.xmax-halfdiffrangex];
    ydomain = [this.options.ymax-halfdiffrangey,
               this.options.ymin+halfdiffrangey];
    self.scale=d3.event.scale;
    self.zoom.translate([0,0]);
    }
    this.x = d3.scale.linear()
      .domain(xdomain)
      .range([0, this.width]);
    this.y = d3.scale.linear()
      .domain(ydomain)
      //.nice()
      .range([0, this.height]);


    self.regenerate();
    // var tx = function(d) {
    //   return "translate(" + self.x(d)  + ",0)";
    // },
    // ty = function(d) {
    //   return "translate(0," + self.y(d)  + ")";
    // };
    // var stroke = function(d) {
    //   return d ? "#ccc" : "#666";
    // };
    // var fx = self.x.tickFormat(10),
    // fy = self.y.tickFormat(10);

    // // Regenerate x-ticks…
    // var gx = self.vis.selectAll("g.x")
    // //linear.ticks([count]) Returns approximately count representative values from the scale's input domain.
    //     .data(self.x.ticks(10).map(self.x.tickFormat(2, ".1")), String)     //how many ticks on the x axis
    //     .attr("transform", tx);
    // gx.select("text")
    //     .text(fx);

    // var gxe = gx.enter().insert("g", ".svg")   //Inserts a new element with the specified name before the element matching the specified before selector,
    //     .attr("class", "x")
    //     .attr("transform", tx);
    // //Vertical grid
    // gxe.append("line")
    //     .attr("stroke", stroke)
    //     .attr("y1", 0)
    //     .attr("y2", self.height);

    // gxe.append("text")
    //     .attr("class", "axis label")
    //     .attr("y", self.height)
    //     .attr("dy", "1em")
    //     .attr("text-anchor", "middle")
    //     .text(fx)
    //     .style("cursor", "ew-resize")
    //     .on("mouseover", function(d) { d3.select(this).style("font-weight", "bold");})
    //     .on("mouseout",  function(d) { d3.select(this).style("font-weight", "normal");})
    //     .on("mousedown.drag",  self.xaxis_drag())
    //     .on("touchstart.drag", self.xaxis_drag());
    // gx.exit().remove();

    // //Change comma to dot: but have to change "axis" from title and axis labels
    // jQuery(".axis.label").each(function( index ) {
    // 	var elem = jQuery(this);
    // 	elem.text(elem.text().replace(",",""))
    // 	});

    // // Regenerate y-ticks…
    // var gy = self.vis.selectAll("g.y")
    //     .data(self.y.ticks(10), String)
    //     .attr("transform", ty);

    // gy.select("text")
    //     .text(fy);

    // var gye = gy.enter().insert("g", ".svg")
    //     .attr("class", "y")
    //     .attr("transform", ty)
    //     .attr("background-fill", "#FFEEB6");

    // gye.append("line")
    //     .attr("stroke", stroke)
    //     .attr("x1", 0)
    //     .attr("x2", self.width);

    // gye.append("text")
    //     .attr("class", "axis label")
    //     .attr("x", -3)
    //     .attr("dy", ".35em")
    //     .attr("text-anchor", "end")
    //     .text(fy)
    //     .style("cursor", "ns-resize")
    //     .on("mouseover", function(d) { d3.select(this).style("font-weight", "bold");})
    //     .on("mouseout",  function(d) { d3.select(this).style("font-weight", "normal");})
    //     .on("mousedown.drag",  self.yaxis_drag())
    //     .on("touchstart.drag", self.yaxis_drag());

    // gy.exit().remove();

    self.update();
}

//Redraws the axes
Graph.prototype.redraw = function(zoom) {
    var self = this;
    return function() {
        var newrange = [self.x.domain()[1]-self.x.domain()[0], self.y.domain()[0]-self.y.domain()[1]];
        //zooming: Compute if the domain range is changing more than 1% (user is zooming out) or not (user is dragging with mouse)
        //Zooming if the new range is significantly different from
        var zooming = ((Math.abs(newrange[0] - self.origrange[0])/self.origrange[0] > 0.1) &&
                    (Math.abs(newrange[1] - self.origrange[1])/self.origrange[1] > 0.1));
        if (zooming){
            //Check if we are attempting to zoom out more than the original range
            if (newrange[0] / self.origrange[0] > 1.1) {
                console.log("zooming out too much. return");
                return false;
                }
            //Check if we are attempting to zoom in more than self.options.maxzoom
            if ((newrange[0] / self.origrange[0] < self.options.maxzoom)  && (newrange[1] / self.origrange[1] < self.options.maxzoom)) {
                var domainx = [(self.x.domain()[1]+self.x.domain()[0] - self.options.maxzoom * self.origrange[0])/2-1,
                                (self.x.domain()[1]+self.x.domain()[0] + self.options.maxzoom * self.origrange[0])/2],
                domainy = [(self.y.domain()[1]+self.y.domain()[0] + self.options.maxzoom * self.origrange[1])/2,
                            (self.y.domain()[1]+self.y.domain()[0] - self.options.maxzoom * self.origrange[1])/2-1];
                return false;
            }
        }

    //     var tx = function(d) {
    //         return "translate(" + self.x(d) + ",0)";
    //     },
    //     ty = function(d) {
    //         return "translate(0," + self.y(d) + ")";
    //     },
    //     stroke = function(d) {
    //         return d ? "#ccc" : "#666";
    //     },
    //     fx = self.x.tickFormat(10),
    //     fy = self.y.tickFormat(10);

    //     // Regenerate x-ticks…
    //     var gx = self.vis.selectAll("g.x")
    //     //linear.ticks([count]) Returns approximately count representative values from the scale's input domain.
    //         .data(self.x.ticks(10).map(self.x.tickFormat(2, ".1")), String)     //how many ticks on the x axis
    //         .attr("transform", tx);
    //     gx.select("text")
    //         .text(fx);

    //     var gxe = gx.enter().insert("g", ".svg")   //Inserts a new element with the specified name before the element matching the specified before selector,
    //         .attr("class", "x")
    //         .attr("transform", tx);
    //     //Vertical grid
    //     gxe.append("line")
    //         .attr("stroke", stroke)
    //         .attr("y1", 0)
    //         .attr("y2", self.height);

    //     gxe.append("text")
    //         .attr("class", "axis label")
    //         .attr("y", self.height)
    //         .attr("dy", "1em")
    //         .attr("text-anchor", "middle")
    //         .text(fx)
    //         .style("cursor", "ew-resize")
    //         .on("mouseover", function(d) { d3.select(this).style("font-weight", "bold");})
    //         .on("mouseout",  function(d) { d3.select(this).style("font-weight", "normal");})
    //         .on("mousedown.drag",  self.xaxis_drag())
    //         .on("touchstart.drag", self.xaxis_drag());
    //     gx.exit().remove();

    //     //Change comma to dot: but have to change "axis" from title and axis labels
    //     jQuery(".axis.label").each(function( index ) {
    //         var elem = jQuery(this);
    //         elem.text(elem.text().replace(",",""))
    //         });
    // console.log("// Regenerate y-ticks…")

    //     // Regenerate y-ticks…
    //     var gy = self.vis.selectAll("g.y")
    //         .data(self.y.ticks(10), String)
    //         .attr("transform", ty);

    //     gy.select("text")
    //         .text(fy);

    //     var gye = gy.enter().insert("g", ".svg")
    //         .attr("class", "y")
    //         .attr("transform", ty)
    //         .attr("background-fill", "#FFEEB6");

    //     gye.append("line")
    //         .attr("stroke", stroke)
    //         .attr("x1", 0)
    //         .attr("x2", self.width);

    //     gye.append("text")
    //         .attr("class", "axis label")
    //         .attr("x", -3)
    //         .attr("dy", ".35em")
    //         .attr("text-anchor", "end")
    //         .text(fy)
    //         .style("cursor", "ns-resize")
    //         .on("mouseover", function(d) { d3.select(this).style("font-weight", "bold");})
    //         .on("mouseout",  function(d) { d3.select(this).style("font-weight", "normal");})
    //         .on("mousedown.drag",  self.yaxis_drag())
    //         .on("touchstart.drag", self.yaxis_drag());

    //     gy.exit().remove();
        self.regenerate();

        self.update();
    }
}

Graph.prototype.plotNSigmaLine = function(n, gender){
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
    
        var color = (gender==1)?("cyan"):("magenta");

    self.svg.append("path")
        .attr("class", "line")
        .attr("id" , gender+"_"+n+"sigma")
        //.classed("pathArea", true)
        .attr("d", this.line(self.points))
        .style("stroke" , color)
        .style("stroke-width" , (n==0 ? 2 : 1))
        .style("fill" , "none");
    
    if (n > -3 && n < 3 && n != 0) {
        self.svg.append("path")
        .attr("class", "line")
        .attr("id" ,"area_"+n)
        .attr("d" , this.area(self.points))
        .style("opacity" ,1 - Math.abs(n/3))
        .style("fill" , color);
    }
}

Graph.prototype.plotLines = function() {
    var gender = Page.getGender();
    this.plotNSigmaLine(0, gender);
    /*this.plotNSigmaLine(0.674, gender);
    this.plotNSigmaLine(-0.674, gender);
    this.plotNSigmaLine(3, gender);
    this.plotNSigmaLine(-3, gender);
    this.plotNSigmaLine(2, gender);
    this.plotNSigmaLine(-2, gender);
    */
}

//Update the lines and the circles
Graph.prototype.update = function() {
    var self = this;
    //This line with selectAll messes up the area plot because  it puts the line data to this.points for all lines
    //var lines = this.vis.selectAll("path").attr("d", this.line(this.points));
    //So I remove and replot the lines:
    this.removePathsInSVG();
    this.plotLines();
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
    //self.selectCircle.style = "stroke: blue; cursor: ns-resize; fill: none;" moved to iGrow.js
                Page.deselectCircle(0)
            }
            //Store the selected circle. it will be needed for the table in the dialog
            self.selectCircle = this;
            self.selectCircleData={
                Baby: Page.getCurrName(),
                Weeks:d[0],
                Weight:d[1]
            };
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
                var dateMDY = graph.dataWeight.Date[ind].split("/");
                var date = dateMDY[0] + "/" + dateMDY[1] + "/" + dateMDY[2];
                var string = "Date: " + date + "<br/>Age: ";
                //Show the age
                if (d[0] < 3) {
                    string = string.concat(d[0] * 7 + " day");
                    if (d[0]*7 > 1) string = string.concat("s");
                } else if (d[0] < 20) {
                    string = string.concat(Math.floor(d[0]) + " weeks");
                } else {
                    var birthdate = Page.getBirthdate();
                    var yearsBDate = birthdate.substring(6,10);
                    var yearsDate = date.substring(6,10);
                    var monthsBDate = birthdate .substring(3,5);
                    var monthsDate = date.substring(3,5);
                    var months = monthsDate - monthsBDate + (yearsDate - yearsBDate) * 12;   //can be -1! must count year change
                    var years = Math.floor(months / 12);
                    var months = months % 12;
                    if (d[0] * 7  > 364) {
                    string = string.concat(years + " year");
                    if (years>1) string = string.concat("s");
                    }
                    if (months > 0) {
                    if (years > 0) string = string.concat(" and ");
                    string = string.concat(months + " month");
                    if (months>1) string = string.concat("s");
                    }
                }
                //Show the weight
                string = string.concat("<br/>Weight: "  + d[1] + " Kg");
                //Show the data from WHO
                var hmo = self.points[Math.round(d[0] * 7)];
                string = string.concat("<br/>Average weight from WHO: " + Math.round(hmo.m*100)/100);
                var quantile=""+Math.round(cdf(d[1],hmo.m,hmo.s)*100); //d[1] is weight
                var ordinal = new String(2);
                if ((quantile[1]=="1") && (quantile!="11")) ordinal="st";
                else if ((quantile[1]=="2") && (quantile!="12")) ordinal="nd";
                else ordinal="th";
                string = string.concat("<br/>The weight is in the " + quantile + ordinal  + " quantile")
    
    
                return  string;
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
        if ((d3.event.keyCode == 46) || (d3.event.keyCode == 8)) { //Delete or Backspace
        var del = Page.deleteWeight(self.selectCircle.id);
        if (del) {
            Page.deselectCircle(1);
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

//Remove lines
Graph.prototype.removePathsInSVG = function() {
    d3.selectAll(".line").remove();
}

Graph.prototype.setCurrrentDataWeight = function(){
    var index = Page.getCurrIndex();
    //Plot males when no baby is defined
    var dataWeight;
    if (index == null) {
        dataWeight = new Array();
        dataWeight.Weeks=new Array();
        dataWeight.Date=new Array();
        dataWeight.Weight=new Array();
    } else {
    
        dataWeight = babies[index].Data;
        dataWeight.Weeks=new Array();
        dataWeight.Date=new Array();
        dataWeight.Weight=new Array();
        for (var i=0,length=dataWeight.length;i<length;i++){
        dataWeight.Weeks.push( babies[index].Data[i]["Weeks"]);
        dataWeight.Date.push(  babies[index].Data[i]["Date"]);
        dataWeight.Weight.push(babies[index].Data[i]["Weight"]);
        }
    }
    this.dataWeight=dataWeight;
}

Graph.prototype.setTitle = function(){
    // write the Chart Title
    if (this.title) {
        d3.select("#title")
            .text(this.title);
    }
}


Graph.prototype.setAxisLabels = function(){
    //First remoce the x/y-axis labels
    $("#xlabel").remove();
    $("#ylabel").remove();
    // Add the x-axis label
    if (this.options.xlabel) {
        this.vis.append("text")
            .attr("class", "axis")
            .attr("id", "xlabel")
            .text(this.options.xlabel)
            .attr("x", this.width/2)
            .attr("y", this.height)
            .attr("dy","2.4em")
            .style("text-anchor","middle");
    }
    // add y-axis label
    if (this.options.ylabel) {
        //this.vis.append("g").attr("id", "gylabel").append("text")
        this.vis.append("text")
            .attr("class", "axis")
            .attr("id", "ylabel")
            .text(this.options.ylabel)
            .style("text-anchor","middle")
            .attr("transform","translate(" + -40 + " " + this.height/2+") rotate(-90)");
    }
}

Graph.prototype.changeMeasure = function() {
    var self = this;
    this.setPoints();

}

//set this.Points containing the data for the lines according to the current gender
Graph.prototype.setPoints = function(){
    var self = this;    //to do: not needed
    switch (Page.getGender()) {
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
        throw "Error: unrecognized child's gender: " + Page.getGender();
    }
}

Graph.prototype.mousemove = function() {
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

Graph.prototype.mouseup = function() {
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

Graph.prototype.xaxis_drag = function() {
    var self = this;
    return function(d) {
        document.onselectstart = function() { return false; };
        var p = d3.mouse(self.vis[0][0]);
        self.downx = self.x.invert(p[0]);
    }
};

Graph.prototype.yaxis_drag = function(d) {
    var self = this;
    return function(d) {
        document.onselectstart = function() { return false; };
        var p = d3.mouse(self.vis[0][0]);
        self.downy = self.y.invert(p[1]);
    }
};

function cdf(x, mean, variance) {
    return 0.5 * (1 + erf((x - mean) / (Math.sqrt(2 * variance))));
}

    function erf(x) {
    // save the sign of x
    var sign = (x >= 0) ? 1 : -1;
    x = Math.abs(x);
    
    // constants
    var a1 =  0.254829592;
    var a2 = -0.284496736;
    var a3 =  1.421413741;
    var a4 = -1.453152027;
    var a5 =  1.061405429;
    var p  =  0.3275911;
    
    // A&S formula 7.1.26
    var t = 1.0/(1.0 + p*x);
    var y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y; // erf(-x) = -erf(x);
}