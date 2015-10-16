//Container object for many methods related to the dialog
var Page = function() { 
    //Scripts about the "add a baby" dialog
    //var today = new Date(); private variable
    var todayDMY = ("00" + (new Date()).getDate()).slice(-2)+"/"+("00" + ((new Date()).getMonth()+1)).slice(-2)+"/"+(new Date()).getFullYear();

    //Check if inputs in baby dialog are valid
    var areInputsValid = function(prompt){
        var text = $("#inputfordropdown").val();
        //We will check whether the name in "text" is already present in the baby instance
        var existing = Page.getExistingNames();
        var message = "";
        if (existing.indexOf(text) > -1) {
            message = "This name already exists";
        }
        else if (text === "") {
            message = "The name cannot be empty"; 
        }
        else if (text === "Name") {
            message = "Please select a name for your child"; 
        }
        //Check if the gender was selected
        else if ($("#genderinput").val() === null) {
            message = "Please select a gender for your child";
        }
        //Check if the birthdate was selected
        else if ($("#birthdatep").val() == "Birthdate") {
            message = "Please select a birthdate for your child";
        }
        //Prompt the problem
        if (message !== "") {
            if (prompt) {
                //Page.customAlert(message,3000); //too bad, Page.customAlert is asynchronous and the dialog disappears
                alert(message);
            }
            return false;
        }
        return true;
    }
    
    return {
        //Functions about retrieving data related to the babies object from DOM or babies itself 
        // //Get the currently plotted measurement
        // getMeasureType: function(){
        //     return $("#measureselect2").val();
        // },
        //Get the baby's name from the dropdown
        getCurrName: function(){
            var value = $("#dropdown").val();
            if (value === null) {
                return "    ";
            }
            return value
        },
        //Get the baby's index from the dropdown
        getCurrIndex: function(){
            if (babies.length===0) return null;
            var name = $("#dropdown").val();
            return Page.getIndexFromName(name);
        },
        //Get the index in the babies array from a baby's name
        getIndexFromName: function(name){
            for (var ind = 0, len=babies.length; ind < len; ind++) {
                    if (babies[ind]["Name"]==name)
                        return ind;
            }
            return null;
        },
        //Get the baby's gender from the dropdown
        getGender: function(){
            var name = Page.getCurrName();
            var index=Page.getCurrIndex();
            if (babies.length === 0) return 0;
                var gender = babies[index].Gender
            // solved problem: when I add a baby using the dropdown I get Male/Female, not 1/2.
            if (gender === "Female") 
                gender = 2;
            else if (gender === "Male") 
                gender = 1
            return gender;
        },
        //Get the currently plotted gender: 1,2,-1 for male/female/unknown
        getCurrGender: function() {
            var stroke = $('[id*="sigma"]').css("stroke");
            if (stroke == "rgb(0, 255, 255)") {
                return 1; 
            } else if (stroke == "rgb(255, 0, 255)") {
                return 2;
            } else {
                throw "Page.getCurrGender: cannot determine the plotted gender. color in style>stroke not recognized";
                return -1;
            } 
        },
        //Get the baby's BirthDate from the dropdown as string (e.g. 27/11/2015)
        getBirthdate: function(){
            var name = $("#dropdown").val();
            if (name === null) {
                return todayDMY;
            }
            var index = Page.getCurrIndex();
            return babies[index].BirthDate;
        },
        
        populateDropdown: function(array){
            //append children
            jQuery.each(array, function(index, value) {//val, text
                $('#dropdown').append($('<option></option>').val(value["Name"]).html(value["Name"]).addClass("dropdownBaby") )
            });
        },
        //Helper functions related to the dialog
        emptyDropdown: function(){
            //empty() removes all child nodes
            $("#dropdown").empty();
        },
        //Deselect circles: nullify is set circle to null (~delete)
        deselectCircle: function(nullify) {
            if (graph.selectCircle) {
                document.getElementById(graph.selectCircle.id).setAttribute("r",6);
                document.getElementById(graph.selectCircle.id).style.stroke = "blue"; 
                if (nullify) {
                    graph.selectCircle = null;
//graph.selectCircleData=null;
                    $('#deletemeasure').attr("disabled", "true");
                }
            }
        },
        //Custom alert
        customAlert: function(meassage,hideTimeout) {
            $("#custom-alert").text(meassage);
            $("#custom-alert").dialog("open");
            //set up a timer to hide it, a.k.a a setTimeout()
            setTimeout(function() {
                $("#custom-alert").dialog("close");
                return true;
            }, hideTimeout)
        },
        
        //Autocomplete baby name input
        autocomplete: function() {
            $(function() {
                    var index=Page.getCurrIndex();
                    var names = new Array();
                    babies.forEach(function(element) {
                        names.push(element.Name);
                    }, this);
                    $("#inputfordropdown").autocomplete({
                        source: names
                    });
            });
        },
    
        // Add all existing babies to the dropdown 
        addToDropdown: function(){
            if (areInputsValid(true)){
                var text = $("#inputfordropdown").val();    
                var gender = $("#genderinput").val();
                if (gender === "Female") {
                    gender = 2;
                } else if (gender === "Male") {
                    gender = 1;
                }
                var birthdate = $("#birthdatep").val();
                //Add to baby instance
                babies.push(new Baby(text, birthdate, gender));
                //Switch dropdown in UI to new baby 
                Page.emptyDropdown();
                Page.populateDropdown(babies);
                $("select option[value='"+text+"']").attr("selected","selected");
                //Replot
                Page.updateDataAndGraph();
                //Update minDate in #datep
                Page.updateMinDate("#datep");
                return true
            } else {
                return false;
            }
        },
        //Get the names of the existing babies
        getExistingNames: function(){
            var elem = new Array();
            $(".dropdownBaby").each(
                function(index) { 
                    elem.push($( this ).text());
            });
                return elem;
        },    
        //Update minDate for e.g. #datep
        updateMinDate: function(selector){
            var birthdateDMY = Page.getBirthdate().split("/");
            $(selector).datepicker("option", "minDate", new Date(birthdateDMY[2], birthdateDMY[1] - 1, birthdateDMY[0]) );
            $(selector).datepicker("option", "maxDate", 0 );
        },
        //update the data and graph
        updateDataAndGraph: function(){
            graph.setPoints();
            graph.setCurrrentData();
            var currentName = Page.getCurrName();
            graph.title = currentName;
            graph.setScale();
            graph.regenerate();  //to do  move inside somewhere? 
            graph.redraw();
            graph.update();
            graph.setTitle();
            graph.setAxisLabels();
        },
        //Delete a measurement when selecting a circle on graph and pressing Del
        deleteWeight: function(id){
            var indCircle = id.split("_").pop();
            var index = Page.getCurrIndex();
            var string = "Weight was "+babies[index].Data[indCircle]["Weight"]+"Kg on "+babies[index].Data[indCircle]["Date"]
            var conf = confirm("Do you really want to remove this point from the data?\nasdadsadThis action cannot be undone\n"+string);
            if (conf){
                babies[index].Data.splice(indCircle, 1);
                //Update the circles and the scatterplot
                graph.setCurrrentData();
                return true;
            }
            return false;
        },
        //Remove a baby
        removeBaby: function(name){
            var index=Page.getIndexFromName(name);
            if (index == -1) {
                alert(name+" was not found");
            } else {
                var conf = confirm("Do you really want to proceed with removing this baby and all its data?");
                if (conf){
                    var redrawLater=(Page.getCurrIndex()==index)?1:0 
                    babies.splice(index, 1);
                    Page.emptyDropdown();
                    if (babies.length > 0) {
                        Page.populateDropdown(babies);
                        //enable Selections
                        Dialog.enableSelection(true);
                    } else {
                        //disable Selections if baby is empty
                        Dialog.enableSelection(false);
                    }
                    //Update only if current baby was removed
                    if (redrawLater) Page.updateDataAndGraph();
                    Page.writeToCache();
                }
            }
        },
        enablePageButtons: function(){
            $("#dropdown").removeAttr("disabled");
            $("#editbabybutton").removeAttr("disabled");
            $("#dialogbutton").removeAttr("disabled");
            $("#measureselect2").removeAttr("disabled");            
        },
        disablePageButtons: function(){
            $("#dropdown").attr("disabled","true");
            $("#editbabybutton").attr("disabled","true");
            $("#dialogbutton").attr("disabled","true");
            $("#measureselect2").attr("disabled","true");
        },
        //Work with the cache 
        writeToCache: function(){
            localStorage['iGrow'] = JSON.stringify(babies);
        },
        readFromCache: function(){ 
            var stored = localStorage['iGrow'];
            if (stored) var babies = JSON.parse(stored);
            else var babies = new Array(); 
            return babies;
        },
    
        //
        pageFullyLoaded: function(e) {
            Dialog.enableSelection();
            //Set date picker to today and weight spinner to 4.0 Kg
            $("#datep").val(todayDMY);
        },
        //Read the txt files
        readTSV: function(measuretype){
            var filename, ylabel, ymax;
            switch (measuretype){
            case ("Weight"||0):
                filename="weianthro.txt"
                ylabel="Weight [Kg]",
                ymax=20;
                break;
            case ("Length"||1):
                filename="lenanthro.txt",
                ylabel="Length [cm]",
                ymax=130;
                break;
            case ("BMI"||2):
                filename="bmianthro.txt",
                ylabel="BMI [Kg/m2]",
                ymax=20;
                break;
            };
            //Read the file
            var measBoy = [],
                measGirl = [];            
            d3.tsv(filename, 
                //This function defines how "data" below will look like 
                function(d) {
                return {
                    gender: +d.sex,
                    age: +d.age / 7,
                    l: +d.l,
                    m: +d.m,
                    s: +d.s*+d.m, //Math.pow(+d.m*(+d.l*+d.s +1), (1/+d.l)), //+d.s,
                    loh: d.loh
                };
                },function(error, data) {
                    data.forEach(function(d, i) {
                    data[i].gender === 1 ? measBoy.push(d) : measGirl.push(d);
                    });
                    //change the graph options
                    graph.options={
                        "xmin": 0, "xmax": 200,
                        "ymin": 0, "ymax": ymax, 
                        "pointsBoy": measBoy,
                        "pointsGirl": measGirl,
                        "xlabel": "Age [Weeks]",
                        "ylabel": ylabel,
                        "maxzoom": 2  
                    };
                    //Read the files and change graph
                    //Display the new dataset
                    graph.useOptions(graph.options); 
                    graph.changeMeasure();
                    Page.updateDataAndGraph();
                })
        },
        
        getCurrMeasure: function(){
            return $("#measureselect2 input[name='mode']:checked").val();
        }
    }
}();//end Page

//Container object for many methods related to the dialog
var Dialog = function(){
    //Private variable
    var todayDMY = ("00" + (new Date()).getDate()).slice(-2)+"/"+("00" + ((new Date()).getMonth()+1)).slice(-2)+"/"+(new Date()).getFullYear();
    
    //return public Methods in the Dialog "module"
    return {
    getMeasureTypeDialog: function(){
        return $("#measureselectdialog").val();
    },
    changeMeasurementTypeDialog: function(){ //to do think changeMeasurementTypeDialog vs changeMeasurementType
        var measurementType=$("#measureselectdialog").val();
        //Change spinner's suffix and value
        var row=Dialog.getSelectedFromTable();
        switch (measurementType){
            case 'Weight':
                var suffixlabel=' [Kg]';
                //to do: grab it from selection
                var value=(row["weight"])?(row["weight"]):(4);
                var step=0.1;
                break;
            case 'Length':            
                var suffixlabel=' [cm]';
                var value=(row["length"])?(row["length"]):(50);
                var step=1;
                break;
            // case 'BMI':            
            //     var suffixlabel=' [Kg/m2]';
            //     var value=(row.length)?(row.length):(15);
            //     var step=1.1;
            //     break;
            default:            
                var suffixlabel=' ';
                var value="";
                var step=1;
                break;
        }
        document.getElementById('measurementspinnerlabel').innerHTML=measurementType+suffixlabel;
        $("#weightSpinner").spinner("option","step",step);
        $("#weightSpinner").spinner("value", value);//to do cannot set decimals!                
    },
    showAccordion: function() {
        $("#datep").val(todayDMY);
        $("#weightSpinner").spinner("option","disabled",true);
        $("#measureselectdialog").val("Measure");
        $("#accordion").removeAttr("hidden");
        $("#dialogButtons").attr("hidden","true");
        $("#editmeasure").attr("disabled","true");
        $("#deletemeasure").attr("disabled","true");
        $("#export").attr("disabled","true");
    },
    hideAccordion: function() {
        $("table .selected").removeClass("selected");
        $("#weightSpinner").spinner("option","disabled",true);
        $("#measureselectdialog").val("Measure");
        $("#accordion").attr("hidden","true");
        $("#dialogButtons").removeAttr("hidden");
        $("#editmeasure").attr("disabled","true");
        $("#deletemeasure").attr("disabled","true");
        $("#export").removeAttr("disabled");
        $("#addmeasure").removeAttr("disabled");
        $("#weightSpinner").spinner("value", "");
    },
    //Get the line and data from the selected row on the table
    getSelectedFromTable: function(){
        if ($("table .selected").length==0) {
            return {};
        }
        var line=$("table .selected")[0].getAttribute("id");
        var date=$("table .selected td:first-child").text();
        var weight=Number($("table .selected td:nth-child(3)").text());
        var weightq=Number($("table .selected td:nth-child(4)").text());
        var length=Number($("table .selected td:nth-child(5)").text());
        var lengthq=Number($("table .selected td:nth-child(6)").text());
        var bmi=Number($("table .selected td:nth-child(7)").text());
        var bmiq=Number($("table .selected td:nth-child(8)").text());
        var comment=$("table .selected td:nth-child(9)").text();
        return {date:date, weight:weight, weightq:weightq, length:length, lengthq:lengthq, bmi:bmi, bmiq:bmiq, comment:comment, line:line}
    },    
    fillAccordion: function() {
        var cells=Dialog.getSelectedFromTable();
        $("#datep").val(cells.date);    
        //$("#weightspinnerdiv").val(); //to do I commented this out, ok?
        var measurementType=$("#measureselect2").val();
        switch (measurementType){
            case 'Weight':
                //var suffix=" Kg";
                break;
            case 'Length':
                //var suffix=" cm";
                break;
        }
//console.log("fillAccordion: cells["+measurementType.toLowerCase()+"]=",cells[measurementType.toLowerCase()])
        $("#weightSpinner").spinner("value", cells[measurementType.toLowerCase()]); //to do can be undefined
        $("#commentarea").val(cells.comment);
    },

    //Save table in babies[].Data
    saveTable2BabiesData: function(){
        var data=Dialog.tableToJSON();
        var index=Page.getCurrIndex();
        babies[index].Data=data;
        //Sort data objects in babies
        //compare function to sort babies[].Data on Weeks
        function comparebabiesData(a,b) {
            if (a.Weeks < b.Weeks)
            return -1;
            if (a.Weeks > b.Weeks)
                return 1;
                return 0;
        }
        babies[index].Data.sort(comparebabiesData);
    },
    //convert the table in the dialog to JSON
    tableToJSON: function() {
        var data = $('#table tr:has(td)').map(
            function(ind, val) {
                var td = $('td', this);
                var index = Page.getCurrIndex();
                return {
                    Date:       td.eq(0).text(), //.eq: Reduce the set of matched elements to the one at the specified index
                    Weeks:      Number(td.eq(1).text()/7),
                    Weight:     function (){var text=td.eq(2).text(); return (text==="")?"":Number(text)}(),
                    WeightQ:    function (){var text=td.eq(3).text(); return (text==="")?"":Number(text)}(),//Number(td.eq(3).text()),
                    Length:     function (){var text=td.eq(4).text(); return (text==="")?"":Number(text)}(),//Number(td.eq(4).text()),
                    LengthQ:    function (){var text=td.eq(5).text(); return (text==="")?"":Number(text)}(),//Number(td.eq(5).text()),
                    BMI:        function (){var text=td.eq(6).text(); return (text==="")?"":Number(text)}(),//Number(td.eq(6).text()),
                    BMIQ:       function (){var text=td.eq(7).text(); return (text==="")?"":Number(text)}(),//Number(td.eq(7).text()),
                    Comment:    td.eq(8).text()
                }
            }).get();
        return data;
    },
    //Delete from tablebody all lines/tr elements having td elements (eg not the headers th)    
    emptyTable: function() {
        $("#tablebody tr").filter(":has(td)").remove();
    },
    createTable: function() {
        //First empty the table
        Dialog.emptyTable();
        var index = Page.getCurrIndex();
        var tbl = document.getElementById('table')
        tbl.setAttribute('cellspacing','1');
        tbl.setAttribute('cellpadding','5');
        var tbdy = document.getElementById('tablebody');
        //Table elements
        for (var ind=0,len=babies[index].Data.length; ind<len; ind++) { 
            Dialog.appendToTable(babies[index].Data[ind]);
        }
    },
    //Append a line to the table                        //to do  put as private method
    appendToTable: function(obj){
        var tbdy = document.getElementById('tablebody');
        //Create a tr line element
        var tr = document.createElement('tr');
        //Append td elements to the tr
         var fields=["Date","Weeks","Weight","WeightQ","Length","LengthQ","BMI","BMIQ","Comment"];
        fields.push(Dialog.getMeasureTypeDialog()); 
        for (var key in obj) {
//console.log("key,obj[key]=",key,obj[key]); 
            if (obj.hasOwnProperty(key)) {
                if (fields.indexOf(key)>-1){ //write only the selected measure to the table
//console.log(" key,obj[key]=",key,obj[key]);
                    var td = document.createElement('td');
                    if (obj[key] !== null){
                        if (key==="Weeks")
                            var t = document.createTextNode(Math.round(obj[key]*7)); //days
                        // else if ((key==="Weight") || (key==="BMI"))
                        //     var t = document.createTextNode(Number(obj[key]).toFixed(1));
                        else if ((key==="Weight") || (key==="BMI") || (key==="Length")){
                            var text=(obj[key]==="")?"":Number(obj[key]);
                            var t = document.createTextNode(text);
                            }
                        else 
                            var t = document.createTextNode(obj[key]);
                    }
                        td.appendChild(t);
                        tr.appendChild(td);
                }
            }        
        }
        //Append line
        var ind=$('#tablebody tr:last-child')[0].id.split("tr")[1]
        var ind=(Number(ind)+1);
        tr.setAttribute('id','tr'+ind);
        tr.setAttribute('align','center');
        tbdy.appendChild(tr);
        return ind;
    },    
    //Convert date string from DMY (dd/mm/yyyy) to YMD string (yyyy/mm/dd)
    dateToYMD: function(dmy) {
        return dmy.substring(6,10) + "/" + dmy.substring(3,5) + "/" + dmy.substring(0,2)
    },
    MDYToDMY: function(mdy) {
        return mdy.substring(3,5) + "/" + mdy.substring(0,2) + "/" + mdy.substring(6,10)
    },
    //Convert date string from DMY (dd/mm/yyyy) to YMD string (yyyy/mm/dd)
    DMYToDate: function(dmy){
	 return date.parse(dmy.substring(3,5) + "/" + dmy.substring(0,2) + "/" + dmy.substring(6,10))	
    },
    

    
    calculateQ: function(days,measure,measuretype){
        // Check for the various File API support.
        if (window.File && window.FileReader && window.FileList && window.Blob){// All the File APIs are supported
            } else alert('The File APIs are not fully supported in this browser.');
        this.str=";"+Page.getCurrGender()+","+days+",";        
        var url;
        switch (measuretype){
            case "weight":
                url ="weianthro.txt"; //to do: watch out loh in weight
                break;
            case "length":
                url ="lenanthro.txt";
                break;
            case "bmi":
                url ="bmianthro.txt";
                break;
        };
        if (isNaN(measure)) $("#"+url.split(".")[0]).text(NaN);
        console.log("calculateQ: days,measure,measuretype=",days,measure,measuretype);
        
        var measure=$("#"+url.split(".")[0]).text(measure);
        Dialog.loadDoc(url, Dialog.getLine);
    },
    
    loadDoc: function(url, cfunc) {
        var xhttp=new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
            cfunc(xhttp.responseText,url);
            }
        }
        xhttp.overrideMimeType('text/plain');
        xhttp.open("GET", url, true);
        xhttp.send();
    },
    
    //Find string with the desired data in txt file. str should begin with ";" eg ";1,3,"
    getLine: function(resp,url) {
        if (resp){
            console.log("getLine: url=",url);
            resp=resp.replace(/\n/g, ';').replace(/\t/g, ',');
            var start=resp.indexOf(Dialog.str)+1;
            if (start==-1) console.log("getLine: str not found. Dialog.str=",Dialog.str);
            var end=resp.indexOf(";",start);
            // Dialog.line=resp.substring(start,end);
            // console.log("getLine: Dialog.line=",Dialog.line);
            // Dialog.line.split(",").map(Number);
            var array = resp.substring(start,end).split(",").map(Number);
            var measure=$("#"+url.split(".")[0]).text();
            var mean=array[3];
            var std=array[4];
            var quantile=Math.round(cdf(measure,mean,std)*100);    
            $("#"+url.split(".")[0]).text(quantile);
            
    //                    console.log("calculateQ: $(#+url.split(.)[0]).text()",$("#"+url.split(".")[0]).text())
            // var array = $("#"+url.split(".")[0]).text().split(",").map(Number);
        // console.log("calculateQ: array",array)
                // return quantile;

            
            return Dialog.line; //does not work
        }
    },

    //Clear the graph from lines
    removePathsInSVG: function() {
     //d3.select("svg").selectAll("*").remove(); //all children
     d3.selectAll(".pathArea").remove(); //
    },
    //Enable a bunch of elements
    enableSelection: function(enable) {
            if (typeof enable === "undefined") {
                var index=Page.getCurrIndex();
                ((babies.length)&&(babies[index].Name.length > 0)) ? enable = true : enable = false;    
            }
            //Toggle the weight spinner 
            var spinner = $("#weightSpinner").spinner();
 //var spinner = $("#lengthSpinner").spinner();
            var datep = $("#datep").datepicker();
            if (enable) {
                $("#trlabels").removeClass("grayout");
                $("#dropdown").removeClass("grayout");
                $("#dropdown").prop("disabled", false); 
                spinner.spinner( "enable" );
                $( "#datep" ).datepicker( "option", "disabled", false);
                $('#addedittable').prop('disabled', false);    
            } else {
                $("#trlabels").addClass("grayout");
                $("#dropdown").addClass("grayout");
                $("#dropdown").prop("disabled", true);
                spinner.spinner( "disable" );
                $( "#datep" ).datepicker( "option", "disabled", true);
                $('#addedittable').prop('disabled', true);
            }
            //NB: "#deletemeasure" should be all set
    },
    //Convert the babies array to JSON    
    babiesToJSON: function(){
                var json=new Array();
                for (var index=0,len=babies.length; index<len; index++) {
//console.log("len,index=",len,index)
                    var datalength=babies[index]["Data"].length;
                    if (datalength===0) {
//console.log("if, index=",index)
                        json.push({
                                Name:       babies[index].Name,
                                BirthDate:  babies[index].BirthDate,
                                Gender:     babies[index].Gender
                        });
                    } else {
                        for (var ind=0,len=datalength; ind<len; ind++) {
                            var obj={
                            Name:       babies[index].Name,
                            BirthDate:  babies[index].BirthDate,
                            Gender:     babies[index].Gender,
                            Date:       babies[index]["Data"][ind]["Date"],
                            Weeks:      babies[index]["Data"][ind]["Weeks"],
                            Weight:     babies[index]["Data"][ind]["Weight"],
                            WeightQ:   babies[index]["Data"][ind]["WeightQ"],
                            Length:     babies[index]["Data"][ind]["Length"],
                            LengthQ:     babies[index]["Data"][ind]["LengthQ"],
                            Comment:    babies[index]["Data"][ind]["Comment"]
              }
              json.push(obj);
            }
          }
        }
        return json;
      }
    }
}(); //end Dialog








///Actions
//Create a baby instance
var babies=Page.readFromCache();
if (babies.length===0) {
  $("#dialogbutton").attr("disabled","true")
}

//At startup populate the dropdown menu
Page.populateDropdown(babies);

//Callback: track baby selected in dropdown
$(document).on("change", "#dropdown", function(e) {
    //deselect any possible circle
    Page.deselectCircle(1);
    //Update the lines, circles, title
    var currentName = this.options[e.target.selectedIndex].text;
    Page.updateDataAndGraph();
    //Update the minDate in date picker
    Page.updateMinDate("#datep");
});

//Functions for the babydialog
$("#babydialog").dialog({
    autoOpen: false,
    show: { effect: "blind", duration: 500 },
    hide: { effect: "blind", duration: 500 },
    buttons: {
        "Add baby" : {
            text : "Add baby",
            id : "dialog_AddBaby",
            click : function() {
                var ok = Page.addToDropdown(); 
                Page.autocomplete();
                //$("#datep").val(Page.todayDMY);  //to do
                Dialog.enableSelection();
                if (ok) $( this ).dialog("close");
                Page.enablePageButtons();
                Page.writeToCache();
            }
        },
        Cancel: function() {
            $( this ).dialog("close");
            Page.enablePageButtons();
            $(".ui-dialog-buttonpane button:contains('Delete')").button("disable");
        },
        "Delete this baby" : {
            text : "Delete this baby",
            disabled : true,
            id : "dialog_DelBaby",
            click : function() {
                var text = $("#inputfordropdown").val();
                Page.removeBaby(text);  
                Page.autocomplete();
                if (babies.length===0) $("#dialogbutton").attr("disabled","true");
                $(this).dialog("close");
                $(".ui-dialog-buttonpane button:contains('Delete')").button("disable");
            }
        }
    }
});

//Fire up the help dialog of the main page
$("#helpmainpage").dialog({
    autoOpen: false,
    show: { effect: "blind", duration: 500 },
    hide: { effect: "blind", duration: 500 }
}); 
$( "#helpbutton" ).click(function() {
    $("#helpmainpage").dialog("open");
});  

//Fire up the help dialog of the table 
$("#helpdialog").dialog({
    autoOpen: false,
    show: { effect: "blind", duration: 500 },
    hide: { effect: "blind", duration: 500 }
}); 
$("#helpdialogbutton").click(function() {
    $("#helpdialog").dialog("open");
});

//Fire up the babydialog 
$("#editbabybutton").click(function() {
    //Reset the inputs
    $("#inputfordropdown").val("Name");
    $("#genderinput").val("Gender");
    $("#birthdatep").val("Birthdate");
    $("#babydialog").dialog("open");
});

//track measurement type
// $(document).on("change", "#measureselect2", function(e) {
//     Dialog.changeMeasurementType();
// })

$(document).on("change", "#measureselectdialog", function(e) {
    $("#weightSpinner").spinner("option","disabled",false);
    Dialog.changeMeasurementTypeDialog();
})
    
//Behavior when dropdown changes
$(document).on("change", "#inputfordropdown", function(e) {
    var index=Page.getCurrIndex();
    //Get all names
    var names=new Array(babies.length);
    for (var key in babies) {
    if (babies.hasOwnProperty(key)) {
        names[key]=babies[key]["Name"];
    }
    }    
    var text = $("#inputfordropdown").val();
    if (names.indexOf(text) > -1) {  //text is existing name
        //Load the birthdate and gender
    $("#birthdatep").val(babies[index]["BirthDate"]);
        var gender = (babies[index]["Gender"] === 1 ? "Male" : "Female");
        $("#genderinput").val(gender);
        //Disable birthdatep and genderinput
        document.getElementById('birthdatep').disabled = true;
        document.getElementById('genderinput').disabled = true;    		
        //"enable Delete this baby"
        $(".ui-dialog-buttonpane button:contains('Delete')").button("enable");
    } else {
        //enable birthdatep 
        document.getElementById('birthdatep').disabled = false;
        document.getElementById('genderinput').disabled = false;    
        //"disable Delete this baby"
        $(".ui-dialog-buttonpane button:contains('Delete')").button("disable");
    }
});    



//Actions about adding and plotting the data 
//Define behaviour of date pickers and spinner
$(function() {
    var birthdateDMY = Page.getBirthdate().split("/");
    $("#datep").datepicker({
        minDate: (new Date(birthdateDMY[2], birthdateDMY[1] - 1, birthdateDMY[0])),
        maxDate: 0, 
        numberOfMonths: 2, 
        dateFormat: "dd/mm/yy"
    });
    $("#birthdatep").datepicker({
        maxDate: 0, numberOfMonths: 2, dateFormat: "dd/mm/yy"
    }); 
    $("#weightSpinner").spinner({
        min: 1,
        suffix:'',
        start: 4.0,
        max: 100,
        step: .1
    });
});

//Custom alert
$(function() {
    $("#custom-alert").dialog({
      id: "custom",
      buttons: {
        "Close" : {
        	text : "Close",
        	id : "dialog_AddBaby",
        	click : function() {       
            $(this).dialog("close"); 
            //enable all buttons on main page
            Page.enablePageButtons();
        	}
        }
      },
      text: "",
      autoOpen: false,
      width:'auto',
      position: { my: 'top', at: 'top+350' },
      show: { effect: "fade", duration: 600 },
      hide: { effect: "fade", duration: 1200 }
    });
});

//addedittable button: add or edit data to table
$(function() {
    $("#addedittable").click(function() {
        var textButton=$("#addedittable").text().substring(0,4);
        //First remove circle selection, if any
        Page.deselectCircle(1);
        //User must select a measurement
        if ($("#weightSpinner").spinner("option","disabled")) {
            alert("Please select a measurement in the drop down");
            return false;
        }
        //Check if value typed in is valid
        if ($("#weightSpinner").spinner("isValid") == false) {
            alert("Please insert a correct value for the measurement");
            return false;
        }
        //Get the data inserted by the user 
        var measureType=Dialog.getMeasureTypeDialog();
        var measure=$("#weightSpinner").spinner("value");
        //Calculate the days
        var dateDMY = $("#datep").val();
        var birthdateYMD = new Date(Dialog.dateToYMD(Page.getBirthdate()));
        var date = new Date(Dialog.dateToYMD(dateDMY));
        var days = Math.abs(date-birthdateYMD) / 3600 / 24000;
        
        //to do: skip all this if I am in edit mode! forceEdit
        var forceEdit=0;
        if (textButton==="Inse") {
            //Decide what to with the measurement: check if valid, append or merge it as a line to table
            //Check if point already exists
            var table=Dialog.tableToJSON();
            for (var ind=0,len=table.length; ind<len; ind++) {
                if (table[ind]["Date"]===dateDMY){
                    //Date exists in table! if current measure is identical return.    
                    if (table[ind][measureType]===measure){
                        Page.customAlert("This point already exists",1800);
                        return;  
                    } else {
                    //Edit line if other measures exist edit line in table, otherwise add normally
                        var othermeasurementtypes=['Weight','Length'].filter(function(val) {return val!='measureType'});
                        for (var i=0; i<othermeasurementtypes.length; i++) {
                            if (table[ind][othermeasurementtypes[i]]===""){  //to do: NB this works when empty measurements in .Data are "", not NaN
                                //edit the right line ind
                                forceEdit=1;
                                var forceEditLine=ind+1;
                            }
                        }                    
                    }
                }
            }
        }
        
        //Get data from the table        
        var row=Dialog.getSelectedFromTable();
        //Get the currently plotted measure
        //var hmo = graph.points[days]; //THIS WAS WRONG! IF PLOT HAS DIFFERENT MEASURE I HAVE TO TAKE IT FROM FILE!
        switch (measureType){
            case "Weight":
                var weight=measure;
  //              var weightq=Dialog.calculateQ(days,weight,"weight"); //Math.round(cdf(weight,hmo.m,hmo.s)*100);
  //              var weightq=Number($("#weianthro").text());
                var length=(row.length)?(row.length):(NaN);
                //var lengthq=(row.length)?(row.lengthq):(NaN); //this works only if length is the current measure
   //             var lengthq=Dialog.calculateQ(days,length,"length");
  //              var lengthq=Number($("#lenanthro").text());
                break;
            case "Length":
                var weight=(row.length)?(row.weight):(NaN);
                
                console.log("in lenanthro: ",$("#lenanthro").text())
                var length=measure;
                var lengthq=Dialog.calculateQ(days,length,"length");
                var lengthq=Number($("#lenanthro").text());
                //Math.round(cdf(length,hmo.m,hmo.s)*100);
                break;
        };
        
        //Get the comment from the accordion
        var comment = $("#commentarea").val();
        // //Calculate the BMI //to do: this has to be done later, when i decide whether i merge length and weight or not. here the nor current measure is NaN
        if ((textButton==="Inse")&&(forceEdit===0)){
            //Append data to the babies' data
            
  var lengthq="";
  var weightq="";
            var obj = {
                "Date" : dateDMY,
                "Weeks" : days / 7,
                "Weight" : isNaN(weight)?(""):weight.toFixed(1),
                "WeightQ": isNaN(weightq)?(""):weightq,
                "Length" : isNaN(length)?(""):length.toFixed(1),
                "LengthQ": isNaN(lengthq)?(""):lengthq,
                "BMI" : "",//bmi.toFixed(1),
                "BMIQ": "",//bmiq,
                "Comment": comment
            };
            var newindex=Dialog.appendToTable(obj);
            //simulate click on right line 
            $("#tr"+newindex).addClass('selected'); //to do: or > td:nth-child(1) ? 
            //$("#tr"+newindex+" > td:nth-child(1)").trigger("click");
            var sel=Dialog.getSelectedFromTable();
            
            
            
            $("#addmeasure").removeAttr("disabled");
        } else if ((textButton==="Edit")||(forceEdit===1)){
            //Edit data in tables
            if ((textButton!=="Edit")&&(forceEdit===1)){
                //simulate click on right line //to do: think if I want to edit the first or last occurrence
                //$("#tr"+forceEditLine+" > td:nth-child(1)").trigger("click");
                $("#tr"+forceEditLine).addClass('selected');   //no > td ! 
                //Append comment to old one 
                var newcomment=$("#tr1 > td:nth-child(9)").text();
                if (newcomment && (comment!=newcomment)) comment=newcomment+' - '+comment;
            };
            var sel=Dialog.getSelectedFromTable();
            //Edit the line   to do: use appendLine to table?
            $("#"+sel.line+" :nth-child(1)").text(dateDMY);
            $("#"+sel.line+" :nth-child(2)").text(days);

            switch (measureType){
                case "Weight":
                    var text=isNaN(weight)?(""):weight.toFixed(1);
                    $("#"+sel.line + " :nth-child(3)").text(text);
   //                 text=isNaN(weightq)?(""):weightq.toFixed(1);
    //                $("#"+sel.line + " :nth-child(4)").text(text);
                    length=$("#"+sel.line + " :nth-child(5)").text();
                    length=length?Number(length):NaN;
                break;
                case "Length":
                    var text=isNaN(length)?(""):length.toFixed(1);
                    $("table #"+sel.line + " :nth-child(5)").text(text);
     //               text=isNaN(lengthq)?(""):lengthq.toFixed(1);
      //              $("table #"+sel.line + " :nth-child(6)").text(text);
                    weight=$("#"+sel.line + " :nth-child(3)").text();
                    weight=weight?Number(weight):NaN;
                break;
            };
            //Calculate the BMI
            var bmi=weight/Math.pow(length/100,2); //to do: see precise formula
            var bmiq=Dialog.calculateQ(days,bmi,"bmi");
            var bmiq=Number($("#bmianthro").text());

            //BMI
            var text=isNaN(bmi)?(""):bmi.toFixed(2);
            $("table #"+sel.line + " :nth-child(7)").text(text);
   //         text=isNaN(bmiq)?(""):bmiq.toFixed(1);//.toFixed(1); to do
   //         $("table #"+sel.line + " :nth-child(8)").text(text);
            //Comment
            $("table #"+sel.line + " :nth-child(9)").text(comment);
        };
        
        console.log(sel.line)
        if (!isNaN(weight)) calculateQ2(days,weight,"weight",sel.line); //to do: bummer, this overwrites the existing one
        //to do problem: i think that sel.line is not defined when I add a measure
        if (!isNaN(length)) calculateQ2(days,length,"length",sel.line);
        if ((typeof bmi !== 'undefined') && !isNaN(bmi)) calculateQ2(days,bmi,"bmi",sel.line);
        
        
        
        
        //hide accordion, reveal dialog buttons
        Dialog.hideAccordion();
        return true;       
    });
 });
 
 function calculateQ2(days,measure,measuretype,selLine){ 
        // Check for the various File API support.
        if (window.File && window.FileReader && window.FileList && window.Blob){// All the File APIs are supported
            } else alert('The File APIs are not fully supported in this browser.');        
        var url;
        var cellNum;
        switch (measuretype){
            case "weight":
                url ="weianthro.txt"; //to do: watch out loh in weight
                cellNum = 4;
                break;
            case "length":
                url ="lenanthro.txt";
                cellNum = 6;
                break;
            case "bmi":
                url ="bmianthro.txt";
                cellNum = 8;
                break;
        };
        
        var str=";"+Page.getCurrGender()+","+days+",";
        console.log("calculateQ2: days,measure,measuretype,str=",days,measure,measuretype,str);
        
        var stuff={selLine:selLine,measure:measure,str:str,cellNum:cellNum};
        // var cb = function (resp){
        //     writeQ(resp);
        // };
        // loadDoc2(url, stuff, cb);
        loadDoc2(url, stuff, writeQ);
}

function loadDoc2(url, stuff, cfunc) {
        var xhttp=new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                cfunc(xhttp.responseText,url,stuff);
            }
        }
        xhttp.overrideMimeType('text/plain');
        xhttp.open("GET", url, true);
        xhttp.send();
}

function writeQ(resp,url,stuff) {
        if (resp){
            var str=stuff.str;            
            //Find the string str in the data
            resp=resp.replace(/\n/g, ';').replace(/\t/g, ',');
            var start=resp.indexOf(str)+1;
            if (start==-1) console.log("writeQ: str not found. str=",str);
            var end=resp.indexOf(";",start);
            //Calculate the quantile
            var array = resp.substring(start,end).split(",").map(Number);
            var measure=stuff.measure;
            var mean=array[3];
            var std=array[4];
            var quantile=Math.round(cdf(measure,mean,std)*100);    
            //Write the quantile
            var text=isNaN(quantile)?(""):quantile.toFixed(1);
            $("table #"+stuff.selLine+" :nth-child("+stuff.cellNum+")").text(text);
        }
    }
 
 
 
 
//Delete point button
$(function() {
    $("#deletemeasure").click(function() {
        var conf = confirm("Do you really want to remove this point from the table?\n");
        if (conf){
            var sel=Dialog.getSelectedFromTable();
            $("#"+sel.line).remove();
        } else {
            //Deselect line from table
            $("table .selected").removeClass("selected");
        }
            //Disable/enable buttons
            $("#deletemeasure").attr("disabled","true");
            $("#editmeasure").attr("disabled","true");
            $("#addmeasure").removeAttr("disabled");        
    })
});


//Disable selection div after the page has loaded
window.addEventListener("load", Page.pageFullyLoaded, false);





//Actions on Dialog
$(function() {
    $("#dialog").dialog({
        autoOpen: false,
        minHeight: 400,
        minWidth: 600,
        show: { effect: "blind", duration: 500 },
        hide: { effect: "blind", duration: 500 }
        });
        //Fire up the dialog 
    $("#dialogbutton").click(function() {
        Dialog.createTable();
        //deselect the graph.selectedCircle
        Page.deselectCircle();      
        var str = "Please edit the table for " + Page.getCurrName() + ", born on "+ babies[Page.getCurrIndex()]["BirthDate"];  
        $("#tabletitle").text(str);
        $("#textarea").value="";
        $("#dialog").dialog("open");
        //disable delete and edit measure buttons
        $("#deletemeasure").attr("disabled","true");
        $("#editmeasure").attr("disabled","true");
        });
    //editmeasure populates and opens the accordion
    $("#editmeasure").click(function(){
        Dialog.fillAccordion();
        //Change text of addedittable button 
        $("#addedittable").text("Edit in table");
        //show accordion
        Dialog.showAccordion();
    })
    //addmeasure opens the accordion
    $("#addmeasure").click(function(){
        $("#addedittable").text("Insert in table");
        Dialog.showAccordion();
    })
    //cancelaccordiondiv closes the accordion
    $("#cancelaccordion").click(function(){
        $("#accordion").attr("hidden","true");
        $("#dialogButtons").removeAttr("hidden");
        $("#editmeasure").removeAttr("disabled");
        $("#addmeasure").removeAttr("disabled");
        $("#editmeasure").attr("disabled","true");
        $("#deletemeasure").attr("disabled","true");
        $("#export").removeAttr("disabled");
        //Deselect line from table
        $("table .selected").removeClass("selected");
    })
    //Dialog buttons
    $("#savedialogbutton").click(function() {
        //Save to Data object
        Dialog.saveTable2BabiesData();
        Page.writeToCache();
        //replot
        Page.updateDataAndGraph();
        $("#dialog").dialog("close");
        //Deselect line from table
        $("table .selected").removeClass("selected");
    });
    $("#canceldialogbutton").click(function() {
        //Close dialog
        $("#dialog").dialog("close");
        //Deselect line from table
        $("table .selected").removeClass("selected");
    });
});


 
//Callbacks for the dialogs
$('#babydialog').on('dialogclose', function(event) {
    Page.enablePageButtons();
});
$('#babydialog').on('dialogopen', function(event) {
    Page.disablePageButtons();
});
$('#dialog').on('dialogclose', function(event) {
    Page.enablePageButtons();
});
$('#dialog').on('dialogopen', function(event) {
    Page.disablePageButtons();
});


//Select the whole row when clicking, populate and open accordion
$("#table").on("click", "tr", function(event) {
  event.preventDefault();
  //Ignore clicking on the header
  if (this.id==="tr0") return;
  //Ignore clicking when accordion is open and you are adding a measure    to do this created problems with quantiles where I select a line
  if ((!$("#accordion").attr("hidden"))&&(!$("#addmeasure").attr("disabled"))){
      console.log("ignore")
      return;} 
  //Select the row in the table
  if ($(this).hasClass('selected')) {
    $(this).removeClass('selected');
    $("#deletemeasure").attr("disabled","true");
    $("#addmeasure").removeAttr("disabled");
    $("#editmeasure").attr("disabled","true");
  } else {
    $(this).addClass('selected')
        .siblings().removeClass('selected');    
    //populate and open accordion    
    Dialog.fillAccordion();    
    $("#editmeasure").removeAttr("disabled");
    $("#addmeasure").attr("disabled","true");
    
    //enable deletemeasure button
    $("#deletemeasure").removeAttr("disabled");
  }
});





//Export
$(document).ready(function(){
    $('#export').click(function(){
      var data = $('#txt').val();
      if(data == '')
          return;
      var data=Dialog.babiesToJSON();
      JSONToCSVConvertor(data);
      //function to 
      function JSONToCSVConvertor(obj){
        var out = '';
        //1st loop is to extract each row
        for (var i = 0, len=obj.length; i < len; i++) {
            var row = "";        
            //2nd loop will extract each column and convert it in string comma-seprated
            for (var index in obj[i]) 
              if (obj[i].hasOwnProperty(index))
                row += '' + obj[i][index] + ', ';
            row.slice(0, row.length-1);
            //add a line break after each row
            out += row + '\r\n';
        }
        //Download as file
        var uri = 'data:text/csv;charset=utf-8,' + escape(out);
        // window.open(uri);  //will not work in some browsers or bad file extension
        //this trick generates a temp <a /> tag
            var link = document.createElement("a");    
            link.href = uri;
            link.style = "visibility:hidden";
            link.download = "output.csv";    
        //this part will append the anchor tag and remove it after automatic click
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
    }
    });
});

$(document).on("change", "#measureselect2 input[name=mode]",function() {
    Page.readTSV(this.value);
    //Page.changeGraph();
});


// function readSingleFile(evt) {
    // //Retrieve the first (and only!) File from the FileList object
    // var f = evt.target.files[0]; 

    // if (f) {
    //   var r = new FileReader();
    //   r.onload = function(e) { 
	//       var contents = e.target.result;
    //     alert( "Got the file.n" 
    //           +"name: " + f.name + "n"
    //           +"type: " + f.type + "n"
    //           +"size: " + f.size + " bytesn"
    //           + "starts with: " + contents.substr(1, contents.indexOf("n"))
    //     );  
    //   }
    //   r.readAsText(f);
    // } else { 
    //   alert("Failed to load file");
    // }
  // }

  // document.getElementById('fileinput').addEventListener('change', readSingleFile, false);

// //works but i need whole path
// function readTextFile(file)
// {
//     var rawFile = new XMLHttpRequest();
//     rawFile.open("GET", file, false);
//     rawFile.onreadystatechange = function ()
//     {
//         if(rawFile.readyState === 4)
//         {
//             if(rawFile.status === 200 || rawFile.status == 0)
//             {
//                 var allText = rawFile.responseText;
//                 alert(allText);
//             }
//         }
//     }
//     rawFile.send(null);
// }
// readTextFile("file:////home/amarin/VSCode/iGrow/bmianthro.txt");



// //Not working
// $.get( "bmianthro.txt", function( data ) {
//   alert( "Data Loaded: " + data );
// });

// var xhr;
// if (window.XMLHttpRequest) {
//     xhr = new XMLHttpRequest();
// } else if (window.ActiveXObject) {
//     xhr = new ActiveXObject("Microsoft.XMLHTTP");
// }

// xhr.onreadystatechange = function(){
//     alert(xhr.readyState)
//     alert(xhr.responseText);
//     };
// xhr.open("GET","bmianthro.txt"); //assuming kgr.bss is plaintext
// xhr.send();





//Load the data from weianthro
$(document).ready(function(){
    Page.autocomplete();  
    //Start plot
    var measBoy = [],
        measGirl = [];
    //http://www.who.int/childgrowth/en/
    //www.who.int/childgrowth/standards/velocity/tr3chap_6.pdf
    d3.tsv("weianthro.txt", 
        //This function defines how "data" below will look like 
        function(d) {
        return {
            gender: +d.sex,
            age: +d.age / 7,   //weeks!
            l: +d.l,
            m: +d.m,
            s: +d.s*+d.m, //Math.pow(+d.m*(+d.l*+d.s +1), (1/+d.l)), //+d.s,
            loh: d.loh //to do: this does not hurt it so group all d3.tsv together
        };
        },function(error, data) {    
            data.forEach(function(d, i) {
            data[i].gender === 1 ? measBoy.push(d) : measGirl.push(d);
            });
    
            graph = new Graph("chart1", {
                "xmin": 0, "xmax": 200,
                "ymin": 0, "ymax": 20, 
                "pointsBoy": measBoy,
                "pointsGirl": measGirl,
                "xlabel": "Age [Weeks]",
                "ylabel": "Weight [Kg]",
                "maxzoom": 2  
            });
        }
    );  
})