//Create a baby instance, for testing purposes
// var babies = new Array();
// //tests:
// var obj = new Baby("Alice", "01/07/2015", "Female");
// babies.push(obj);
// babies.push(new Baby("Jack", "01/01/2015", "Male"));
var babies=readFromCache();
if (babies.length==0) {
  jQuery("#dialogbutton").attr("disabled","true")
}

//Scripts about the "add a baby" dialog
var today = new Date();
var todayDMY = ("00" + today.getDate()).slice(-2)+"/"+("00" + (today.getMonth()+1)).slice(-2)+"/"+today.getFullYear();
//update the data and graph
function updateDataAndGraph(){
    graph.setPoints();
    graph.setCurrrentDataWeight();
    var currentName = getCurrName();
    graph.title = currentName;
    graph.redraw();
    graph.update();
    graph.setTitle();
}
//Track baby selected in dropdown
jQuery(document).on("change", "#dropdown", function(e) {
    //deselect any possible circle
    deselectCircle(1);
    //Update the lines, circles, title
    var currentName = this.options[e.target.selectedIndex].text;
    updateDataAndGraph();
    //Update the minDate in date picker
    updateMinDate("#datep");
});

var names = []
//Functions for the babydialog
jQuery(function() {
    jQuery("#babydialog").dialog({
      autoOpen: false,
      show: { effect: "blind", duration: 500 },
      hide: { effect: "blind", duration: 500 },
      buttons: {
        "Add baby" : {
        	text : "Add baby",
        	id : "dialog_AddBaby",
        	click : function() {
          		var ok = addToDropdown(); 
              autocomplete();
              jQuery("#datep").val(todayDMY);
              enableSelection();
          		if (ok) jQuery( this ).dialog("close");
              jQuery("#dropdown").removeAttr("disabled");
              jQuery("#editbabybutton").removeAttr("disabled");
              jQuery("#dialogbutton").removeAttr("disabled");
              jQuery("#dialogbutton").removeAttr("disabled")
              write2Cache();
        	}
        },
        Cancel: function() {
            jQuery( this ).dialog("close");
            jQuery("#dropdown").removeAttr("disabled");
            jQuery("#editbabybutton").removeAttr("disabled");
            jQuery("#dialogbutton").removeAttr("disabled");
          },
        "Delete this baby" : {
        	text : "Delete this baby",
        	disabled : true,
        	id : "dialog_DelBaby",
        	click : function() {
            var text = jQuery("#inputfordropdown").val();
            removeBaby(text);  
            autocomplete();
            if (babies.length==0) jQuery("#dialogbutton").attr("disabled","true");
            jQuery( this ).dialog("close");
          }
        }
      }
    });    
    //Fire up the help dialog of the main page
    jQuery("#helpmainpage").dialog({
      autoOpen: false,
      show: { effect: "blind", duration: 500 },
      hide: { effect: "blind", duration: 500 }
    }); 
    jQuery( "#helpbutton" ).click(function() {
      jQuery("#helpmainpage").dialog("open");
    });  
  
    //Fire up the help dialog of the table 
    jQuery("#helpdialog").dialog({
      autoOpen: false,
      show: { effect: "blind", duration: 500 },
      hide: { effect: "blind", duration: 500 }
    }); 
    jQuery("#helpdialogbutton").click(function() {
      jQuery("#helpdialog").dialog("open");
    });
    
    //Fire up the babydialog 
    jQuery("#editbabybutton").click(function() {
      //Reset the inputs
      jQuery("#inputfordropdown").val("Name");
      jQuery("#genderinput").val("Gender");
      jQuery("#birthdatep").val("Birthdate");
      jQuery("#babydialog").dialog("open");
      //disable all buttons on main page 
      // jQuery("#dropdown").attr("disabled","true")     //to do open babydialog
      // jQuery("#editbabybutton").attr("disabled","true")
      // jQuery("#dialogbutton").attr("disabled","true")
    });
    //Behavior when dropdown changes
    jQuery(document).on("change", "#inputfordropdown", function(e) {
      var index=getCurrIndex();
      //Get all names
      var names=new Array(babies.length);
      for (var key in babies) {
        names[key]=babies[key]["Name"];
      }    
      var text = jQuery("#inputfordropdown").val();
      if (names.indexOf(text) > -1) {  //text is existing name
    		//Load the birthdate and gender
        jQuery("#birthdatep").val(babies[index]["BirthDate"]);
    		var gender = (babies[index]["Gender"] == 1 ? "Male" : "Female");
    		jQuery("#genderinput").val(gender);
    		//Disable birthdatep and genderinput
    		document.getElementById('birthdatep').disabled = true;
    		document.getElementById('genderinput').disabled = true;    		
    		//"enable Delete this baby"
    		jQuery(".ui-dialog-buttonpane button:contains('Delete')").button("enable");
    	} else {
    		//enable birthdatep 
    		document.getElementById('birthdatep').disabled = false;
    		document.getElementById('genderinput').disabled = false;    
    		//"disable Delete this baby"
    		jQuery(".ui-dialog-buttonpane button:contains('Delete')").button("disable");
    	}
    });    
});

jQuery('#babydialog').on('dialogclose', function(event) {
  jQuery("#dropdown").removeAttr("disabled")
  jQuery("#editbabybutton").removeAttr("disabled")
  jQuery("#dialogbutton").removeAttr("disabled")
});
jQuery('#babydialog').on('dialogopen', function(event) {
  jQuery("#dropdown").attr("disabled","true")
  jQuery("#editbabybutton").attr("disabled","true")
  jQuery("#dialogbutton").attr("disabled","true")
});
jQuery('#dialog').on('dialogclose', function(event) {
  jQuery("#dropdown").removeAttr("disabled")
  jQuery("#editbabybutton").removeAttr("disabled")
  jQuery("#dialogbutton").removeAttr("disabled")
});
jQuery('#dialog').on('dialogopen', function(event) {
  jQuery("#dropdown").attr("disabled","true")
  jQuery("#editbabybutton").attr("disabled","true")
  jQuery("#dialogbutton").attr("disabled","true")
});




//Autocomplete baby name input
function autocomplete() {
    jQuery(function() {
        var index=getCurrIndex();
        var names = new Array();
        babies.forEach(function(element) {
          names.push(element.Name);
        }, this);
        jQuery("#inputfordropdown").autocomplete({
          source: names
        });
      });
     }
//Helper functions related to the dialog
function emptyDropdown(){
  //empty() removes all child nodes
  jQuery("#dropdown").empty();
}
function populateDropdown(array){
  //append children
  jQuery.each(array, function(index, value) {//val, text
  jQuery('#dropdown').append(jQuery('<option></option>').val(value["Name"]).html(value["Name"]).addClass("dropdownBaby") )
    });
}
function removeBaby(name){
  var index=getIndexFromName(name);
  if (index == -1) {
    alert(name+" was not found");
  } else {
    var conf = confirm("Do you really want to proceed with removing this baby and all its data?");
    if (conf){
      var redrawLater=(getCurrIndex()==index)?1:0 
      babies.splice(index, 1);
      emptyDropdown();
      if (babies.length > 0) {
        populateDropdown(babies);
        //Update only if current baby was removed
        if (redrawLater) updateDataAndGraph();
        //enable Selections
        enableSelection(true);
        write2Cache();
      } else {
        //disable Selections if baby is empty
        enableSelection(false);
      }
    }
  }
}
function areInputsValid(prompt){
  var text = jQuery("#inputfordropdown").val();
  //We will check whether the name in "text" is already present in the baby instance
  var existing = getExistingElements();
  var message = "";
  if (existing.indexOf(text) > -1) {
    message = "This name already exists";
  }
  else if (text == "") {
    message = "The name cannot be empty"; 
  }
  else if (text == "Name") {
    message = "Please select a name for your child"; 
  }
  //Check if the gender was selected
  else if (jQuery("#genderinput").val() === null) {
    message = "Please select a gender for your child";
  }
  //Check if the birthdate was selected
  else if (jQuery("#birthdatep").val() == "Birthdate") {
    message = "Please select a birthdate for your child";
  }
  //Prompt the problem
  if (message !== "") {
    if (prompt) {
      //customAlert(message,3000); //too bad, customAlert is asynchronous and the dialog disappears
      alert(message);
    }
    return false;
  }
  return true;
}
// Add all existing babies to the dropdown 
function addToDropdown(){
  if (areInputsValid(true)){
    var text = jQuery("#inputfordropdown").val();  
    var gender = jQuery("#genderinput").val();
    if (gender == "Female") {
      gender = 2;
    } else if (gender == "Male") {
      gender = 1;
    }
    var birthdate = jQuery("#birthdatep").val();
    //Add to baby instance
    babies.push(new Baby(text, birthdate, gender));
    //Switch dropdown in UI to new baby 
    emptyDropdown();
    populateDropdown(babies);
    jQuery("select option[value='"+text+"']").attr("selected","selected");
    //Replot
    updateDataAndGraph();
    //Update minDate in #datep
    updateMinDate("#datep");
    return true
  } else {
    return false;
  }
}
function getExistingElements(){
  var elem = new Array();
  jQuery(".dropdownBaby").each(
    function(index) { 
      elem.push(jQuery( this ).text());
  });
    return elem;
}
//Get the baby's name from the dropdown
function getCurrName(){
  var value = jQuery("#dropdown").val();
  if (value == null) {
    return "  ";
  }
  return value
}
//Get the baby's index from the dropdown
function getCurrIndex(){
  if (babies.length==0) return null;
  var name = jQuery("#dropdown").val();
  return getIndexFromName(name);
}
//Get the index in the babies array from a baby's name
function getIndexFromName(name){
  for (var ind = 0; ind < babies.length; ind++) {
      if (babies[ind]["Name"]==name){
        return ind;
      }
  }
  return null
}
//Get the baby's gender from the dropdown
function getGender(){
  var name = getCurrName();
  var index=getCurrIndex();
  if (babies.length == 0) return 0;
    //var index = babies[index].Name.indexOf(name);
    var gender = babies[index].Gender
  // solved problem: when I add a baby using the dropdown I get Male/Female, not 1/2.
  if (gender == "Female") {
    gender = 2;
  } else if (gender == "Male") {
    gender = 1
  }
  return gender;
}
//Get the baby's BirthDate from the dropdown as string (e.g. 27/11/2015)
function getBirthdate(){
  var name = jQuery("#dropdown").val();
  if (name == null) {
    return todayDMY;
  }
  var index = getCurrIndex();
  return babies[index].BirthDate;
}
//Update minDate for e.g. #datep
function updateMinDate(selector){
    var birthdateDMY = getBirthdate().split("/");
    jQuery(selector).datepicker("option", "minDate", new Date(birthdateDMY[2], birthdateDMY[1] - 1, birthdateDMY[0]) );
    jQuery(selector).datepicker("option", "maxDate", 0 );
}
//At startup populate the dropdown menu
populateDropdown(babies);





//Scripts about adding and plotting the data
//disable weight spinner, date and add weight button  
// jQuery(document).ready(function(){           //bug because of this Kg in weight are lost!
  //enableSelection()
  
//Set birthdate picker to yesterday 
if (jQuery("#birthdatep").val() == "") {
  var yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  var yesterdayDMY = ("00" + yesterday.getDate()).slice(-2)+"/"+("00" + yesterday.getMonth()).slice(-2)+"/"+yesterday.getFullYear()
  jQuery("#birthdatep").val(yesterdayDMY);
}
//Define behaviour of date pickers and spinner
var birthdateDMY = getBirthdate().split("/");
jQuery(function() {   
  jQuery("#datep").datepicker({
    minDate: (new Date(birthdateDMY[2], birthdateDMY[1] - 1, birthdateDMY[0])),
    maxDate: 0, 
    numberOfMonths: 2, 
    dateFormat: "dd/mm/yy"
  });
  jQuery("#birthdatep").datepicker({
    maxDate: 0, numberOfMonths: 2, dateFormat: "dd/mm/yy"
  });
jQuery.widget( "ui.pcntspinner", jQuery.ui.spinner, {
    _format: function( value ) { 
        var suffix = this.options.suffix;
        return value +" "+ suffix; 
    },    
    _parse: function(value) { return parseFloat(value); }
});
jQuery("#weightSpinner").pcntspinner({ 
    min: 1,
    suffix:'Kg',
    //start: 3.0,
    max: 100,
    step: .1
    });
  
  });
//Custom alert
jQuery(function() {
    jQuery("#custom-alert").dialog({
      id: "custom",
      buttons: {
        "Close" : {
        	text : "Close",
        	id : "dialog_AddBaby",
        	click : function() {       
            jQuery( this ).dialog("close"); 
            //enable all buttons on main page
            jQuery("#dropdown").removeAttr("disabled");
            jQuery("#editbabybutton").removeAttr("disabled");
            jQuery("#dialogbutton").removeAttr("disabled");          
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
function customAlert(meassage,hideTimeout) {
   jQuery("#custom-alert").text(meassage);
   jQuery("#custom-alert").dialog("open");
    /* //display the box
  var customAlert = document.getElementById("custom-alert-1");
  customAlert.style.visibility = 'visible';
  */
   //set up a timer to hide it, a.k.a a setTimeout()
  setTimeout(function() {
    jQuery("#custom-alert").dialog("close");
    return true;
  }, hideTimeout)
}   

//compare function to sort babies[].Data on Weeks
function comparebabiesData(a,b) {
  if (a.Weeks < b.Weeks)
  return -1;
  if (a.Weeks > b.Weeks)
    return 1;
    return 0;
}

//addedittable: add or edit data to table
jQuery(function() {
    jQuery("#addedittable").click(function() {      
      var textButton=jQuery("#addedittable").text().substring(0,4);
      //First remove circle selection, if any
      deselectCircle(1);
      if (jQuery("#weightSpinner").pcntspinner("isValid") == false) {
        alert("Please insert a correct weight");
        return False;
      }
      //Get the data inserted by the user 
      var index=getCurrIndex();
      var weight = jQuery("#weightSpinner").pcntspinner("value");
      var dateDMY = jQuery("#datep").val();     
      for (var ind=0; ind<babies[index].Data.length;ind++) {
        if ((babies[index].Data[ind]["Date"]==dateDMY) && (babies[index].Data[ind]["Weight"]==weight)) {
          customAlert("This point already exists",1800);
          return;
        }
      }
      var birthdateYMD = new Date(dateToYMD(getBirthdate()));
      var date = new Date(dateToYMD(dateDMY));
      var days = Math.abs(date - birthdateYMD) / 3600 / 24000;
      var comment = jQuery("#commentarea").val();
      if (textButton=="Inse"){
        //Append data to the babies' data
        var obj = {
          "Date" : dateDMY,
          "Weeks" : days / 7,
          "Weight" : weight.toFixed(1),
          "Comment": comment
        };
        appendToTable(obj);
        jQuery("#addmeasure").removeAttr("disabled");
      } else if (textButton=="Edit"){
      //Edit data in tables     
        var sel=getSelectedFromTable();
        jQuery("table #"+sel.line + " :nth-child(1)").text(dateDMY)
        jQuery("table #"+sel.line + " :nth-child(2)").text(days)
        jQuery("table #"+sel.line + " :nth-child(3)").text(weight)
        jQuery("table #"+sel.line + " :nth-child(4)").text(comment)
      }
      //hide accordion, reveal dialog buttons
      hideAccordion();
      return true;       
    });
 });
//Delete point button
jQuery(function() {
    jQuery("#deletemeasure").click(function() {
      var conf = confirm("Do you really want to remove this point from the table?\n");
      if (conf){
        var sel=getSelectedFromTable();
        jQuery("#"+sel.line).remove();
      } else {
        //Deselect line from table
        jQuery("table .selected").removeClass("selected");
        //Disable/enable buttons
        jQuery("#deletemeasure").attr("disabled","true");
        jQuery("#editmeasure").attr("disabled","true");
        jQuery("#addmeasure").removeAttr("disabled");
      }
    })
});

//Enable a bunch of elements
function enableSelection(enable) {
    if (typeof enable === "undefined") {
      var index=getCurrIndex();
      ((babies.length)&&(babies[index].Name.length > 0)) ? enable = true : enable = false;  
    }
    //Toggle the weight spinner 
    var spinner = jQuery( "#weightSpinner" ).spinner();
    var datep = jQuery( "#datep" ).datepicker();
    if (enable) {
      jQuery("#trlabels").removeClass("grayout");
      jQuery("#dropdown").removeClass("grayout");
      jQuery("#dropdown").prop("disabled", false); 
      spinner.spinner( "enable" );
      jQuery( "#datep" ).datepicker( "option", "disabled", false);
      jQuery('#addedittable').prop('disabled', false);  
    } else {
      jQuery("#trlabels").addClass("grayout");
      jQuery("#dropdown").addClass("grayout");
      jQuery("#dropdown").prop("disabled", true);
      spinner.spinner( "disable" );
      jQuery( "#datep" ).datepicker( "option", "disabled", true);
      jQuery('#addedittable').prop('disabled', true);
    }
    //NB: "#deletemeasure" should be all set
}
//Disable selection div after the page has loaded
window.addEventListener("load", pageFullyLoaded, false);
function pageFullyLoaded(e) {
  enableSelection();
  //Set date picker to today and weight spinner to 3.0 Kg
  jQuery("#datep").val(todayDMY);
  jQuery("#weightSpinner").spinner( "value", "3.0 Kg");
}
//Deselect circles: nullify is set circle to null (delete?)
function deselectCircle(nullify) {
  if (graph.selectCircle) {
    document.getElementById(graph.selectCircle.id).setAttribute("r",6);
    document.getElementById(graph.selectCircle.id).style.stroke = "blue"; 
    //document.getElementById(graph.selectCircle.id).style("cursor: ns-resize; fill: none;");
    if (nullify) {
      graph.selectCircle = null;
      graph.selectCircleData=null;
      document.getElementById('deletemeasure').disabled = true;
    }
  }
}
//Convert date string from DMY (dd/mm/yyyy) to YMD string (yyyy/mm/dd)
function dateToYMD(dmy) {
  return dmy.substring(6,10) + "/" + dmy.substring(3,5) + "/" + dmy.substring(0,2)
 };
function MDYToDMY(mdy) {
  return mdy.substring(3,5) + "/" + mdy.substring(0,2) + "/" + mdy.substring(6,10)
 };

//Convert date string from DMY (dd/mm/yyyy) to YMD string (yyyy/mm/dd)
function DMYToDate(dmy) {
	return date.parse(dmy.substring(3,5) + "/" + dmy.substring(0,2) + "/" + dmy.substring(6,10))	
  };

//Clear the graph from lines
function removePathsInSVG() {
   //d3.select("svg").selectAll("*").remove(); //all children
   d3.selectAll(".pathArea").remove(); //
  }
//Get the currently plotted gender: 1,2,-1 for male/female/unknown
function getPlottedGender() {
  var stroke = jQuery('[id*="sigma"]').css("stroke");
  if (stroke == "rgb(0, 255, 255)") {
    return 1; 
  } else if (stroke == "rgb(255, 0, 255)") {
    return 2;
  } else {
    throw "getPlottedGender: cannot determine the plotted gender. color in style>stroke not recognized";
    return -1;
  } 
}
function deleteWeight(id){
  console.log("deleteWeight: id=",id)
	var indCircle = id.split("_").pop();
  var index = getCurrIndex();
	var string = "Weight was "+babies[index].Data["Weight"][indCircle]+"Kg on "+babies[index].Data["Date"][indCircle]
	var conf = confirm("Do you really want to remove this point from the data?\nThis action cannot be undone\n"+string);
  if (conf){
		babies[index].Data.splice(indCircle, 1);
		//Update the circles and the scatterplot
		graph.setCurrrentDataWeight();
    return true;
	}
  return false;
}





//Functions for the dialog
jQuery(function() {
  jQuery("#dialog").dialog({
      autoOpen: false,
      minHeight: 400,
      minWidth: 600,
      show: { effect: "blind", duration: 500 },
      hide: { effect: "blind", duration: 500 }
    });
    //Fire up the dialog 
  jQuery("#dialogbutton").click(function() {
      createTable();
      //deselect the graph.selectedCircle
      deselectCircle();      
      var str = "Please edit the table for " + getCurrName() + ", born on "+ babies[getCurrIndex()]["BirthDate"];  
      jQuery("#tabletitle").text(str);
      jQuery("#textarea").value="";
      jQuery("#dialog").dialog("open");
      //disable delete and edit measure buttons
      jQuery("#deletemeasure").attr("disabled","true");
      jQuery("#editmeasure").attr("disabled","true");
      //disable all buttons on main page
      //jQuery("#dropdown").attr("disabled","true");          //to do open dialog
      //jQuery("#editbabybutton").attr("disabled","true");
      //jQuery("#dialogbutton").attr("disabled","true");
    });
  //editmeasure populates and opens the accordion
  jQuery("#editmeasure").click(function(){
    fillAccordion();
    //Change text of addedittable button 
    jQuery("#addedittable").text("Edit in table");
    //show accordion
    showAccordion();
  })
  //addmeasure opens the accordion
  jQuery("#addmeasure").click(function(){
    jQuery("#addedittable").text("Insert in table");
    showAccordion();
  })
  //cancelweightdiv closes the accordion
  jQuery("#cancelweight").click(function(){
    jQuery("#accordion").attr("hidden","true");
    jQuery("#dialogButtons").removeAttr("hidden");
    jQuery("#editmeasure").removeAttr("disabled");
    jQuery("#addmeasure").removeAttr("disabled");
    jQuery("#editmeasure").attr("disabled","true");
    jQuery("#deletemeasure").attr("disabled","true");
    jQuery("#export").removeAttr("disabled");
    //Deselect line from table
    jQuery("table .selected").removeClass("selected");
  })
  //Dialog buttons
  jQuery("#savedialogbutton").click(function() {
      //Save to Data object
      //var conf = confirm("Do you really want edit the data and close this dialog?\nThis action cannot be undone\n");
      saveTable2BabiesData();
      write2Cache();
      //replot
      updateDataAndGraph();
      jQuery("#dialog").dialog("close");
      // //enable all buttons on main page                   //to do close dialog
      // jQuery("#dropdown").removeAttr("disabled")
      // jQuery("#editbabybutton").removeAttr("disabled")
      // jQuery("#dialogbutton").removeAttr("disabled")
    });
  jQuery("#canceldialogbutton").click(function() {
      //var conf = confirm("Do you really want discard the data and close this dialog?\nThis action cannot be undone\n");
      // //enable all buttons on main page                  //to do close dialog
      // jQuery("#dropdown").removeAttr("disabled")
      // jQuery("#editbabybutton").removeAttr("disabled")
      // jQuery("#dialogbutton").removeAttr("disabled")
      //Close dialog
      jQuery("#dialog").dialog("close");
    });
});

function showAccordion() {
      jQuery("#accordion").removeAttr("hidden");
      jQuery("#dialogButtons").attr("hidden","true");
      jQuery("#editmeasure").attr("disabled","true");
      jQuery("#deletemeasure").attr("disabled","true");
      jQuery("#export").attr("disabled","true");
    }
function hideAccordion() {
      jQuery("table .selected").removeClass("selected");
      jQuery("#accordion").attr("hidden","true");
      jQuery("#dialogButtons").removeAttr("hidden");
      jQuery("#editmeasure").attr("disabled","true");
      jQuery("#deletemeasure").attr("disabled","true");
      jQuery("#export").removeAttr("disabled");
      jQuery("#addmeasure").removeAttr("disabled");
}

//Delete from tablebody all lines/tr elements having td elements (eg not the headers th)  
function tableEmpty() {
  jQuery("#tablebody tr").filter(":has(td)").remove();
}

function createTable() {
    //First empty the table
    tableEmpty();
    var index = getCurrIndex();
    var tbl = document.getElementById('table')
    tbl.setAttribute('cellspacing','1');
    tbl.setAttribute('cellpadding','5');
    var tbdy = document.getElementById('tablebody');
    //Table elements
    for (var ind=0; ind<babies[index].Data.length; ind++) { 
      appendToTable(babies[index].Data[ind]);
    }
}

//Append a line to the table
function appendToTable(obj){
    var tbdy = document.getElementById('tablebody');
    //Create a tr line element
    var tr = document.createElement('tr');
    //Append td elements to the tr
    for (var key in obj) {
      var td = document.createElement('td');
      if (key=="Weeks") 
        var t = document.createTextNode(obj[key]*7); //days
      else if (key=="Weight")
        var t = document.createTextNode(Number(obj[key]).toFixed(1));
      else 
        var t = document.createTextNode(obj[key]);        
      td.appendChild(t);
      tr.appendChild(td);    
    }
    //Append line
    var ind=jQuery('#tablebody tr:last-child')[0].id.split("tr")[1]
    tr.setAttribute('id','tr'+(Number(ind)+1));
    tr.setAttribute('align','center');
    tbdy.appendChild(tr);
}


//Select the whole row when clicking, populate and open accordion
jQuery("#table").on("click", "tr", function(event) {
  event.preventDefault();
  if (jQuery(this).hasClass('selected')) {
    jQuery(this).removeClass('selected');
console.log("deletemeasure disabled true")
    jQuery("#deletemeasure").attr("disabled","true");
    jQuery("#addmeasure").removeAttr("disabled");
    jQuery("#editmeasure").attr("disabled","true");
  } else {
    jQuery(this).addClass('selected')
        .siblings().removeClass('selected');    
    //populate and open accordion    
    fillAccordion();    
    jQuery("#editmeasure").removeAttr("disabled");
    jQuery("#addmeasure").attr("disabled","true");
    
    //enable deletemeasure button
    jQuery("#deletemeasure").removeAttr("disabled");
  }
});

//Get the line and data from the selected row on the table
function getSelectedFromTable(){
  var line=jQuery("table .selected")[0].getAttribute("id");
  var date=jQuery("table .selected td:first-child").text();
  var weight=new Number(jQuery("table .selected td:nth-child(3)").text()).toFixed(1);
  var comment=jQuery("table .selected td:nth-child(4)").text();
  return {date:date, weight:weight, comment:comment, line:line}
}

function fillAccordion() {
  var cells=getSelectedFromTable();  
  //console.log("weight,comment=",weight,comment)
  jQuery("#datep").val(cells.date);  
  jQuery("#weightspinnerdiv").val();
  jQuery("#weightSpinner").spinner( "value", cells.weight+" Kg");
  jQuery("#commentarea").val(cells.comment);
}

//Save table in babies[].Data
function saveTable2BabiesData(){
  var data=table2JSON();
  var index=getCurrIndex();
  babies[index].Data=data;
}

//Table2JSON
// jQuery(document).ready(function(){
//     jQuery('#Table2JSON').click(function(){
//         //var 
//         data=table2JSON();  
//     });
// });
function table2JSON() {
  //var 
  data = jQuery('#table tr:has(td)').map(
    function(ind, val) {
      var td =  jQuery('td', this);
      var index = getCurrIndex();
      return {
        ///Name:     babies[index].Name,
        //BirthDate: babies[index].BirthDate,
        //Gender: babies[index].Gender,
        Date:    td.eq(0).text(), //.eq: Reduce the set of matched elements to the one at the specified index
        Weeks:   Number(td.eq(1).text()/7),
        Weight:  Number(td.eq(2).text()),
        Comment: td.eq(3).text()
      }
    }).get();
return data;
}


//Export
jQuery(document).ready(function(){
    jQuery('#export').click(function(){
      //babies2JSON
      function babies2JSON(){
        var json=new Array();
        for (var index=0; index<babies.length;index++) {
          for (var ind=0; ind<babies[index]["Data"].length;ind++) {
            json.push({
              Name:     babies[index].Name,
              BirthDate: babies[index].BirthDate,
              Gender: babies[index].Gender,
              Date:    babies[index]["Data"][ind]["Date"],
              Weeks:   babies[index]["Data"][ind]["Weeks"],
              Weight:  babies[index]["Data"][ind]["Weight"],
              Comment: babies[index]["Data"][ind]["Comment"]
            });
          }
        }
        return json;
      }
      var data = jQuery('#txt').val();
      if(data == '')
          return;
      var data=babies2JSON();
      JSONToCSVConvertor(data);
    });
});
function JSONToCSVConvertor(obj){
    var out = '';
     //1st loop is to extract each row
    for (var i = 0; i < obj.length; i++) {
        var row = "";        
        //2nd loop will extract each column and convert it in string comma-seprated
        for (var index in obj[i]) 
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

//testing: click on 
// jQuery(document).ready(function(){
//     jQuery('#dialogbutton').trigger('click');
//   }
// )

//document.getElementById("dialogbutton").focus();

function write2Cache(){
  localStorage['iGrow'] = JSON.stringify(babies);
}

function readFromCache(){
  var stored = localStorage['iGrow'];
  if (stored) var babies = JSON.parse(stored);
  else var babies = new Array(); 
  return babies;
}

//Load the data from weianthro
jQuery(document).ready(function(){
/*//tests
var DaysForTest = function(index, date){
  //console.log("DaysForTest")
  var birthdateYMD = new Date(dateToYMD(babies[index].BirthDate));
	//console.log("birthdateYMD=",birthdateYMD)
  var date = new Date(dateToYMD(date));
	var days = Math.abs(date - birthdateYMD) / 3600 / 24000
	return days;
	//console.log("days=",days)
}
var datum = new Datum("01/08/2015", DaysForTest(0,"01/08/2015") / 7, 4,"Just born!");
babies[0].Data.push(datum);
babies[0].Data.push(new Datum("30/08/2015", DaysForTest(0,"30/08/2015") / 7, 5.4));
babies[1].Data.push(new Datum("10/08/2014", DaysForTest(1,"01/08/2015") / 7, 8.6));
*/
  autocomplete();
  
  
  //Start plot
  weiBoy = [];
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
          data[i].gender == 1 ? weiBoy.push(d) : weiGirl.push(d);
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