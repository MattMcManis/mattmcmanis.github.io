// Generate HTML
function Generate() {
	// Projects Array
	var projects = 
	[
		[	// Title
			"Axiom",
			// URL
			"https://axiomui.github.io",
			// Description
			"An FFmpeg GUI for Windows",
			// Icon
			"axiom.png",
			// Tags
			[
				["ffmpeg", "https://www.ffmpeg.org"],
				["gui", "https://en.wikipedia.org/wiki/Graphical_user_interface"],
				["video","https://en.wikipedia.org/wiki/Video_processing"],
				["image","https://en.wikipedia.org/wiki/Digital_image_processing"],
				["audio","https://en.wikipedia.org/wiki/Audio_signal_processing"],
				["encoder","https://en.wikipedia.org/wiki/Codec"],
				["converter","https://en.wikipedia.org/wiki/Codec"],
			],
			// Details
			[
				["C#", "https://en.wikipedia.org/wiki/C_Sharp_(programming_language)"],
				["GNU General Public License v3.0",	"https://www.gnu.org/licenses/gpl-3.0.en.html"],
				["GitHub", "https://github.com/MattMcManis/Axiom"],
				["Wiki", "https://github.com/MattMcManis/Axiom/wiki"],
			],
		],       

		[	// Title
			"Glow",
			// URL
			"https://glowmpv.github.io",
			// Description
			"mpv Config File Generator for Windows",
			// Icon
			"glow.png",
			// Tags
			[
				["mpv", "https://mpv.io"],
				["video", "https://en.wikipedia.org/wiki/Digital_video"],
				["audio","https://en.wikipedia.org/wiki/Digital_audio"],
				["gui", "https://en.wikipedia.org/wiki/Graphical_user_interface"],
				["generator ","https://mpv.io/manual/stable/"],
				["configurator ","https://mpv.io/manual/stable/"],
			],
			// Details
			[
				["C#", "https://en.wikipedia.org/wiki/C_Sharp_(programming_language)"],
				["GNU General Public License v3.0",	"https://www.gnu.org/licenses/gpl-3.0.en.html"],
				["GitHub", "https://github.com/MattMcManis/Glow"],
				["Wiki", "https://mpv.io/manual/stable/"],
			],
		],

		[	// Title
			"Ultra",
			// URL
			"https://github.com/MattMcManis/Ultra",
			// Description
			"Mupen64Plus N64 Emulator Frontend for Windows",
			// Icon
			"ultra.png",
			// Tags
			[
				["nintendo-64", "https://en.wikipedia.org/wiki/Nintendo_64"],
				["n64", "https://en.wikipedia.org/wiki/Nintendo_64"],
				["frontend", "https://en.wikipedia.org/wiki/Front_end_and_back_end"],
				["gui","https://en.wikipedia.org/wiki/Graphical_user_interface"],
				["emulator", "https://en.wikipedia.org/wiki/Video_game_console_emulator"],
				["mupen64plus","https://mupen64plus.org"],
			],
			// Details
			[
				["C#", "https://en.wikipedia.org/wiki/C_Sharp_(programming_language)"],
				["MIT License",	"https://opensource.org/licenses/MIT"],
				["GitHub", "https://github.com/MattMcManis/Ultra"],
				["Wiki", "https://github.com/MattMcManis/Ultra/wiki"],
			],
		],

		[	// Title
			"Triangulum",
			// URL
			"https://github.com/MattMcManis/Triangulum",
			// Description
			"Pascal's Triangle Generator",
			// Icon
			"triangulum.png",
			// Tags
			[
				["pascals-triangle", "https://en.wikipedia.org/wiki/Pascal%27s_triangle"],
				["generator", "https://en.wikipedia.org/wiki/Pascal%27s_triangle"],
				["mathematics","https://en.wikipedia.org/wiki/Mathematics"],
				["math","https://en.wikipedia.org/wiki/Mathematics"],
			],
			// Details
			[
				["C#", "https://en.wikipedia.org/wiki/C_Sharp_(programming_language)"],
				["GNU General Public License v3.0",	"https://www.gnu.org/licenses/gpl-3.0.en.html"],
				["GitHub", "https://github.com/MattMcManis/Triangulum"],
			],
		],

		[	// Title
			"Aleph",
			// URL
			"https://hebrewnumerals.github.io",
			// Description
			"Hebrew Numerals Converter",
			// Icon
			"aleph.png",
			// Tags
			[
				["hebrew", "https://en.wikipedia.org/wiki/Hebrew_language"],
				["numbers", "https://en.wikipedia.org/wiki/Number"],
				["numerals", "https://en.wikipedia.org/wiki/Arabic_numerals"],
				["converter","https://en.wikipedia.org/wiki/Calculation"],
				["mathematics","https://en.wikipedia.org/wiki/Mathematics"],
				["math","https://en.wikipedia.org/wiki/Mathematics"],
			],
			// Details
			[
				["C#", "https://en.wikipedia.org/wiki/C_Sharp_(programming_language)"],
				["JS", "https://en.wikipedia.org/wiki/JavaScript"],
				["GNU General Public License v3.0",	"https://www.gnu.org/licenses/gpl-3.0.en.html"],
				["GitHub", "https://github.com/MattMcManis/Aleph"],
			],
		],

		[	// Title
			"Ink",
			// URL
			"https://github.com/MattMcManis/Ink",
			// Description
			"Keyboard Typewriter Emulator",
			// Icon
			"ink.png",
			// Tags
			[
				["typewriter", "https://en.wikipedia.org/wiki/Typewriter"],
				["keyboard", "https://en.wikipedia.org/wiki/Computer_keyboard"],
				["soundboard", "https://en.wikipedia.org/wiki/Soundboard_(computer_program)"],
				["audio","https://en.wikipedia.org/wiki/Audio_signal_processing"],
			],
			// Details
			[
				["C#", "https://en.wikipedia.org/wiki/C_Sharp_(programming_language)"],
				["GNU General Public License v3.0",	"https://www.gnu.org/licenses/gpl-3.0.en.html"],
				["GitHub", "https://github.com/MattMcManis/Ink"],
			],
		],

		[	// Title
			"glytch",
			// URL
			"https://glytch.bitbucket.io",
			// Description
			"Video Game & Technology Resource",
			// Icon
			"glytch.png",
			// Tags
			[
				["video-game", "https://en.wikipedia.org/wiki/Video_game"],
				["technology", "https://en.wikipedia.org/wiki/Technology"],
				["resource", "https://en.wikipedia.org/wiki/Encyclopedia"],
				["guide","https://en.wikipedia.org/wiki/User_guide"],
				["wiki","https://en.wikipedia.org/wiki/Wiki"],
			],
			// Details
			[
				["HTML", "https://en.wikipedia.org/wiki/HTML"],
				["CSS", "https://en.wikipedia.org/wiki/Cascading_Style_Sheets"],
				["JS", "https://en.wikipedia.org/wiki/JavaScript"],
				["Go", "https://golang.org"],
				["Hugo", "https://gohugo.io"],
			],
		]
	];

	// Generate Projects List HTML
	var list = document.getElementById("projects");
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

	list.innerHTML = html;
}

// Lists
function Lists(list) {
	var html = '';

	for (var i = 0; i < list.length; i++) {
		html += 
		'<li>' + 
			'<a href=\"' + list[i][1] + '\" target=\"_blank\">' + list[i][0] + '</a>' + 
		'</li>';
	}

	return html;
}