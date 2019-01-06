var colours = ["#FF0000", "#ED7D31", "#FFFF00", "#00B050", "#00B0F0", "#0070C0", "#7030A0", "#FFFFFF"];
var selected_colour = "";
seconds = 0, minutes = 0, hours = 0;
var gs = new GameState();
draw_game();
codemaker();

/* basic constructor of game state */
function GameState(){
	this.Guesses = 10;
	this.colour=null;
	this.state="";

    this.decrGuesses = function(){
		this.Guesses--;
		update_buttons();
		update_status();
        if(this.Guesses == 0){
			//lose
			gs.state+="<p style='color:red;'>You have lost!</p>";
			gs.state+="You will be redirected to the splash screen in 10 seconds.";
			var colour1=colours[gs.colour.charAt(0)];
			var colour2=colours[gs.colour.charAt(1)];
			var colour3=colours[gs.colour.charAt(2)];
			var colour4=colours[gs.colour.charAt(3)];
			gs.state += "<br>Answer was: ";
			gs.state += "<span id='opppo' style='color:"+colour1+";'>&#11044;</span>";
			gs.state += "<span id='opppo' style='color:"+colour2+";'>&#11044;</span>";
			gs.state += "<span id='opppo' style='color:"+colour3+";'>&#11044;</span>";
			gs.state += "<span id='opppo' style='color:"+colour4+";'>&#11044;</span>";
			update_status();
			redirect10();
        }
	};
	
}

function update_status() {
	document.getElementById('status').innerHTML=gs.state; // Add message to status
	$('.console').scrollTop($('.console')[0].scrollHeight); // Scroll to bottom
};


function update_guesses(red,white) {
	document.getElementById('block-'+(gs.Guesses+1)).style.display="block";
	document.getElementById('block_circles-'+(gs.Guesses+1)).style.display="block";
	// draw red and white pegs
	var used=[false,false,false,false];
	// set first red pegs
	for (let i = 1; i <= red; i++) {
		document.getElementById('small_circle-'+(gs.Guesses+1)+"-"+i).style.backgroundColor="red";
		used[i-1]=true;
	}
	// set second white pegs
	for (let i = 1; i <= (white+red); i++) {
		if (!used[i-1]) {
			document.getElementById('small_circle-'+(gs.Guesses+1)+"-"+i).style.backgroundColor="white";
		}
	}
};


function update_buttons() {	
	if (gs.Guesses>0) {
		document.getElementById('button-'+gs.Guesses).style.display="block";
	// Change background of circle when clicked
	$(document).on('click',"#circle-" + gs.Guesses + "-1,#circle-" + gs.Guesses + "-2,#circle-" + gs.Guesses + "-3,#circle-" + gs.Guesses + "-4", function () {
		changebg($(this).attr('id'),selected_colour);
	});
	}
}
function changebg(id, colour) { // check if circle can change colour
	var n = id.replace("circle-","").replace("-1","").replace("-2","").replace("-3","").replace("-4","");
	if (gs.Guesses==n)
	document.getElementById(id).style.backgroundColor=colour;
}

function draw_game() {
	document.body.style.cursor="default"; //reset pointer
	selected_colour = ""; // reset selected colour
	document.getElementById('game').style.display = "inline";
	draw_colours();
	draw_table();
	Game_UI();
	update_buttons();
	timer();
}


function draw_colours() {
	var y = 12;
	var x = 27;
	for (i = 1; i <= 8; i++) {
		var colour = colours[i - 1];
		var circle = document.createElement("span");
		circle.style.top = y + 'px';
		circle.style.left = x + 'px';
		circle.id = "circle_colour" + i;
		circle.class = "colour_circles";
		circle.style.backgroundColor = colour;
		document.getElementById('colours').appendChild(circle);
		x += 65;
	}
}

function draw_table() {
	var y = 94;
	for (n = 1; n <= 10; n++) {
		var x = 125;
		for (i = 1; i <= 4; i++) {
			// create circles
			var circle = document.createElement("span");
			circle.style.top = y + 'px';
			circle.style.left = x + 'px';
			circle.id = "circle-" + n + "-" + i;
			document.getElementById('mastermind').appendChild(circle);
			x += 87;
		}
		// create block
		var block = document.createElement("IMG");
		block.style.top = (y - 10) + 'px';
		block.style.left = '500px';
		block.id = "block-" + n;
		block.setAttribute("src", "images/block.png");
		document.getElementById('mastermind').appendChild(block);
		//create small circles box
		var div = document.createElement("div");
		div.id = "block_circles-" + n;
		div.className = "block_circles";
		div.style.top = (y - 10) + 'px';
		div.style.left = '500px';
		document.getElementById('mastermind').appendChild(div);
		//create small circles
		var x_ = 510;
		for (i = 1; i <= 2; i++) {
			// draw smallcircle 1
			var small_circle = document.createElement("span");
			small_circle.style.top = y + 'px';
			small_circle.style.left = x_ + 'px';
			small_circle.id = "small_circle-" + n + "-" + i;
			document.getElementById("block_circles-" + n).appendChild(small_circle);
			// draw smallcircle 2
			var small_circle2 = document.createElement("span");
			small_circle2.style.top = (y + 25) + 'px';
			small_circle2.style.left = x_ + 'px';
			small_circle2.id = "small_circle-" + n + "-" + (i + 2);
			document.getElementById("block_circles-" + n).appendChild(small_circle2);
			x_ += 25;
		}
		// create button
		var button = document.createElement("button");
		button.innerHTML = "CHECK";
		button.id = "button-" + n;
		button.style.top = (y + 2) + 'px';
		button.style.left = '500px';
		document.getElementById('mastermind').appendChild(button);
		y += 55;
	}
}

function rgb2hex(rgb) {
	if (rgb=="") {
		return null;
	}
	else{
		rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

		function hex(x) {
			return ("0" + parseInt(x).toString(16)).slice(-2);
		}
		return (hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3])).toUpperCase();
	}
}
function colour2Code(colour_arr) {
	var code = "";
	for (i = 0; i < colour_arr.length; i++) {
		if (colour_arr[i]!=null && colours.includes("#"+colour_arr[i])) {
			code+=colours.indexOf("#"+colour_arr[i]);
		}
	}
	return code;

}
function code2Colour(code) {
	var colourarr = Array(4);
	for (i = 0; i < colourarr.length; i++) {
		colourarr[i]=colours[code.charAt(i)];
	}
	return colourarr;
}
function Game_UI() {
	// check button is pressed
	$(".mastermind button").click(function () {
		var attempt_code = [null,null,null,null];
		var err_count=0;
		var attempt=gs.Guesses;
		for (i = 0; i < attempt_code.length; i++) {
			var circle = document.getElementById("circle-" +attempt+"-"+(i+1));
			
			if (colours.includes("#"+rgb2hex(circle.style.backgroundColor))) { //check if colour is valid
				attempt_code[i]=rgb2hex(circle.style.backgroundColor);
			}
			else{
				err_count++;
			}
		}
		if (err_count>0) {
			alert("Not a valid code!"); // change popup
		}
		else{ // convert colours to code
			$(this).css('display', 'none');
			gs.decrGuesses();
			
			var result=getPegs(colour2Code(attempt_code),gs.colour);
			if (result[0]==4) {
				// win
				gs.state+="<p style='color:green;'>You have won!</p>";
				gs.state+="You will be redirected to the splash screen in 5 seconds.";
				update_status();
				redirect5();
			}
			update_guesses(result[0], result[1]);
		}
	});

	// Make circle border bigger when clicked
	$(".colours span").click(function () {
		for (i = 1; i <= 8; i++) {
			var d = document.getElementById('circle_colour' + i);
			var p = $('#circle_colour' + i);
			var position = p.position();
			if (d.style.border == "5px solid black") {
				d.style.border = "2px solid black";
				var x = position.top + 4;
				var left = position.left + 4;
				d.style.top = x + 'px';
				d.style.left = left + 'px';
			}
		}
		var p = $(this).position();
		selected_colour = rgb2hex($(this).css("background-color"));
		document.body.style.cursor = 'url("images/cursors/' + selected_colour + '.png"), auto';

		$(this).css({
			'top': p.top - 4,
			'left': p.left - 4,
			'border': '5px solid black',
		});
	});

	// Make circle bigger when mouse enters
	$(".colours span").mouseenter(function () {
		//$(this).css('cursor', 'hand');
		var p = $(this).position();

		$(this).css({
			'top': p.top - 1,
			'left': p.left - 1,
			'width': '35px',
			'height': '35px'
		});
	});

	// Make circle smaller when mouse leaves
	$(".colours span").mouseleave(function () {
		var p = $(this).position();
		$(this).css({
			'top': p.top + 1,
			'left': p.left + 1,
			'width': '33px',
			'height': '33px'
		});
	});
}

  
function add() {
    seconds++;
    if (seconds >= 60) {
        seconds = 0;
        minutes++;
        if (minutes >= 60) {
            minutes = 0;
            hours++;
        }
    }
    
    document.getElementById("time").innerText ="Game duration: "+ (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);
    timer();
}
function timer() {
    t = setTimeout(add, 1000);
}

function getPegs(guess, answer) {
    var result = [0, 0];
    var white = 0;
    var red = 0;
    for (let i = 0; i < 4; i++) {
        if (guess[i] == answer.charAt(i)) {
            red++;
        }
        for (let j = 0; j < 4; j++) {
            if (guess[i] == answer.charAt(j)) {
                white++;
                break;
            }
        }
    }
    result[0] = red;
    result[1] = Math.abs(red - white);
    return result;
};

function codemaker(){
	var code="";
	for(let i = 0; i < 4; i++)
		code+=Math.floor(Math.random() * 8);
	gs.colour=code.toString();
	gs.state+="Start cracking the code!";
	update_status();
}

async function redirect10() {
	await sleep(10000);
	document.location='splash';
}
async function redirect5() {
	await sleep(5000);
	document.location='splash';
}
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}