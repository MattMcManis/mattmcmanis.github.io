$(document).ready(Generate);

// Generate Projects List HTML
function Generate() {
	var html = "";

	for (var i = 0; i < projects.length; i++) {
	    html += 
	    '<div class=\"project\">' + 
	    	'<div class=\"icon\">' +
	    		'<a href=\"' + projects[i][1] + '\" target=\"_blank\">' + 
	    			'<img src=\"img/projects/' + projects[i][3] +'\">' + 
    			'</a>' +
	    	'</div>' +
	    	'<div class=\"info\">' +
	    		'<a class=\"title\" href=\"' + projects[i][1] + '\" target=\"_blank\">' + 
	    			'<h2>' + 
	    				projects[i][0] + 
    				'</h2>' + 
    			'</a>' +
	    		'<p class=\"description\">' + 
	    			projects[i][2] + 
    			'</p>' +
	    		'<ul class=\"tags\">' +
	    			Lists(projects[i][4]) +
	    		'</ul>' +
	    		'<ul class=\"details\">' +
	    			Lists(projects[i][5]) +
	    		'</ul>' +
	    	'</div>' +
	    '</div>';
	}

	document.getElementById("projects").innerHTML = html;
}

// Lists
function Lists(list) {
	var html = "";

	for (var i = 0; i < list.length; i++) {
		html += 
		'<li>' + 
			'<a href=\"' + list[i][1] + '\" target=\"_blank\">' + list[i][0] + '</a>' + 
		'</li>';
	}

	return html;
}