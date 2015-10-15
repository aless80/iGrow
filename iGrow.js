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
            for (var ind = 0, length=babies.length; ind < length; ind++) {
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
            //Deselect circles: nullify is set circle to null (delete?)
        deselectCircle: function(nullify) {
            if (graph.selectCircle) {
                document.getElementById(graph.selectCircle.id).setAttribute("r",6);
                document.getElementById(graph.selectCircle.id).style.stroke = "blue"; 
                if (nullify) {
                    graph.selectCircle = null;
                    graph.selectCircleData=null;
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
            graph.setCurrrentDataWeight();
            var currentName = Page.getCurrName();
            graph.title = currentName;
            graph.redraw();
            graph.update();
            graph.setTitle();
        },
        //Delete a measurement when selecting a circle on graph and pressing Del
        deleteWeight: function(id){
            var indCircle = id.split("_").pop();
            var index = Page.getCurrIndex();
            var string = "Weight was "+babies[index].Data["Weight"][indCircle]+"Kg on "+babies[index].Data["Date"][indCircle]
            var conf = confirm("Do you really want to remove this point from the data?\nasdadsadThis action cannot be undone\n"+string);
            if (conf){
                babies[index].Data.splice(indCircle, 1);
                //Update the circles and the scatterplot
                graph.setCurrrentDataWeight();
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
        },
        disablePageButtons: function(){
            $("#dropdown").attr("disabled","true");
            $("#editbabybutton").attr("disabled","true");
            $("#dialogbutton").attr("disabled","true");
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
            $("#weightSpinner").spinner( "value", "4.0 Kg");
        }
    }
    
}();//end Page

//Container object for many methods related to the dialog
var Dialog = function(){
    //Private variable
    var todayDMY = ("00" + (new Date()).getDate()).slice(-2)+"/"+("00" + ((new Date()).getMonth()+1)).slice(-2)+"/"+(new Date()).getFullYear();
    //return public Methods in the Dialog "module"
    return {
    showAccordion: function() {
        $("#datep").val(todayDMY);
        $("#accordion").removeAttr("hidden");
        $("#dialogButtons").attr("hidden","true");
        $("#editmeasure").attr("disabled","true");
        $("#deletemeasure").attr("disabled","true");
        $("#export").attr("disabled","true");
    },
    hideAccordion: function() {
        $("table .selected").removeClass("selected");
        $("#accordion").attr("hidden","true");
        $("#dialogButtons").removeAttr("hidden");
        $("#editmeasure").attr("disabled","true");
        $("#deletemeasure").attr("disabled","true");
        $("#export").removeAttr("disabled");
        $("#addmeasure").removeAttr("disabled");
    },
    //Get the line and data from the selected row on the table
    getSelectedFromTable: function(){
        var line=$("table .selected")[0].getAttribute("id");
        var date=$("table .selected td:first-child").text();
        var weight=new Number($("table .selected td:nth-child(3)").text()).toFixed(1);
        var comment=$("table .selected td:nth-child(4)").text();
        var quantile=$("table .selected td:nth-child(5)").text();
        return {date:date, weight:weight, comment:comment, quantile:quantile, line:line}
    },    
    fillAccordion: function() {
        var cells=Dialog.getSelectedFromTable();
        $("#datep").val(cells.date);    
        $("#weightspinnerdiv").val();
        $("#weightSpinner").spinner( "value", cells.weight+" Kg");
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
        data = $('#table tr:has(td)').map(
            function(ind, val) {
                var td =    $('td', this);
                var index = Page.getCurrIndex();
                return {
                    ///Name:         babies[index].Name,
                    //BirthDate: babies[index].BirthDate,
                    //Gender: babies[index].Gender,
                    Date:        td.eq(0).text(), //.eq: Reduce the set of matched elements to the one at the specified index
                    Weeks:     Number(td.eq(1).text()/7),
                    Weight:    Number(td.eq(2).text()),
                    Comment: td.eq(3).text(),
                    Quantile: td.eq(4).text()
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
        for (var ind=0,length=babies[index].Data.length; ind<length; ind++) { 
            Dialog.appendToTable(babies[index].Data[ind]);
        }
    },
    //Append a line to the table
    appendToTable: function(obj){
        var tbdy = document.getElementById('tablebody');
        //Create a tr line element
        var tr = document.createElement('tr');
        //Append td elements to the tr
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {                    
                var td = document.createElement('td');
                if (key==="Weeks")
                    var t = document.createTextNode(Math.round(obj[key]*7)); //days
                else if (key==="Weight")
                    var t = document.createTextNode(Number(obj[key]).toFixed(1));
                else 
                    var t = document.createTextNode(obj[key]);                
                td.appendChild(t);
                tr.appendChild(td);
            }        
        }
        //Append line
        var ind=$('#tablebody tr:last-child')[0].id.split("tr")[1]
        tr.setAttribute('id','tr'+(Number(ind)+1));
        tr.setAttribute('align','center');
        tbdy.appendChild(tr);
    },    
    //Convert date string from DMY (dd/mm/yyyy) to YMD string (yyyy/mm/dd)
    dateToYMD: function(dmy) {
        return dmy.substring(6,10) + "/" + dmy.substring(3,5) + "/" + dmy.substring(0,2)
    },
    MDYToDMY: function(mdy) {
        return mdy.substring(3,5) + "/" + mdy.substring(0,2) + "/" + mdy.substring(6,10)
    },
    //Convert date string from DMY (dd/mm/yyyy) to YMD string (yyyy/mm/dd)
    DMYToDate: function(dmy) {
	 return date.parse(dmy.substring(3,5) + "/" + dmy.substring(0,2) + "/" + dmy.substring(6,10))	
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
                    console.log("len,index=",len,index)
                    var datalength=babies[index]["Data"].length;
                    if (datalength===0) {
                                 console.log("if, index=",index)
                        json.push({
                                Name:         babies[index].Name,
                                BirthDate: babies[index].BirthDate,
                                Gender: babies[index].Gender
                        });
                    } else {
                        for (var ind=0,length=datalength; ind<length; ind++) {
            console.log("else for, index=",index)
                            var obj={
                                Name:   babies[index].Name,
                            BirthDate:  babies[index].BirthDate,
                            Gender:   babies[index].Gender,
                            Date:     babies[index]["Data"][ind]["Date"],
                            Weeks:    babies[index]["Data"][ind]["Weeks"],
                            Weight:   babies[index]["Data"][ind]["Weight"],
                            Comment:  babies[index]["Data"][ind]["Comment"],
                            Quantile: babies[index]["Data"][ind]["Quantile"]
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
            }
        }
    }
});

//Fire up the help dialog of the main page
$("#helpmainpage").dialog({
    autoOpen: false,
    show: {effect: "blind", duration: 500},
    hide: {effect: "blind", duration: 500}
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
    jQuery.widget( "ui.pcntspinner", jQuery.ui.spinner, {
        _format: function( value ) { 
            var suffix = this.options.suffix;
            return value +" "+ suffix; 
        },    
        _parse: function(value) { return parseFloat(value); }
    });
    $("#weightSpinner").pcntspinner({ 
        min: 1,
        suffix:'Kg',
        //start: 4.0,
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
            $( this ).dialog("close"); 
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
        if ($("#weightSpinner").pcntspinner("isValid") == false) {
            alert("Please insert a correct weight");
            return False;
        }
        //Get the data inserted by the user 
        var index=Page.getCurrIndex();
        var weight = $("#weightSpinner").pcntspinner("value");
        var dateDMY = $("#datep").val();
        var table=Dialog.tableToJSON();
        for (var ind=0,length=table.length; ind<length;ind++) {
            if ((table[ind]["Date"]==dateDMY) && (table[ind]["Weight"]==weight)) {
            Page.customAlert("This point already exists",1800);
            return;
            }
        }
        var birthdateYMD = new Date(Dialog.dateToYMD(Page.getBirthdate()));
        var date = new Date(Dialog.dateToYMD(dateDMY));
        var days = Math.abs(date - birthdateYMD) / 3600 / 24000;
        var comment = $("#commentarea").val();
        var hmo = graph.points[days];
        var quantile=Math.round(cdf(weight,hmo.m,hmo.s)*100);
        if (textButton==="Inse"){
            //Append data to the babies' data
            var obj = {
            "Date" : dateDMY,
            "Weeks" : days / 7,
            "Weight" : weight.toFixed(1),
            "Comment": comment,
            "Quantile": quantile
            };
            Dialog.appendToTable(obj);
            $("#addmeasure").removeAttr("disabled");
        } else if (textButton==="Edit"){
        //Edit data in tables     
            var sel=Dialog.getSelectedFromTable();
            $("table #"+sel.line + " :nth-child(1)").text(dateDMY)
            $("table #"+sel.line + " :nth-child(2)").text(days)
            $("table #"+sel.line + " :nth-child(3)").text(weight)
            $("table #"+sel.line + " :nth-child(4)").text(comment)
            $("table #"+sel.line + " :nth-child(5)").text(quantile)
        }
        //hide accordion, reveal dialog buttons
        Dialog.hideAccordion();
        return true;       
    });
 });
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
        });
    $("#canceldialogbutton").click(function() {
        //Close dialog
        $("#dialog").dialog("close");
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
        for (var i = 0, length=obj.length; i < length; i++) {
            var row = "";        
            //2nd loop will extract each column and convert it in string comma-seprated
            for (var index in obj[i]) 
              if (obj[i].hasOwnProperty(index))
                row += '' + obj[i][index] + ', ';
            row.slice(0, row.length - 1);
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


//testing: click on 
// $(document).ready(function(){
//     $('#dialogbutton').trigger('click');
//   }
//)

//Load the data from weianthro
$(document).ready(function(){
    Page.autocomplete();  
    //Start plot
    weiBoy = [],
        weiGirl = [];
    //http://www.who.int/childgrowth/en/
    d3.tsv("weianthro.txt", 
        //This function defines how "data" below will look like 
        function(d) {
        return {
        gender: +d.sex,
        age: +d.age / 7,   //weeks!
            l: +d.l,
            m: +d.m,
            s: +d.s,
        };
        },function(error, data) {    
            data.forEach(function(d, i) {
            data[i].gender === 1 ? weiBoy.push(d) : weiGirl.push(d);
            });
    
            graph = new Graph("chart1", {
                "xmin": 0, "xmax": 200,
                "ymin": 0, "ymax": 20, 
                "pointsBoy": weiBoy,
                "pointsGirl": weiGirl,
                "xlabel": "Age [Weeks]",
                "ylabel": "Weight [Kg]",
                "maxzoom": 2  
            });
        }
    );   
})