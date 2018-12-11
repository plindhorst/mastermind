var colours = ["#FF0000", "#ED7D31", "#FFFF00", "#00B050", "#00B0F0", "#0070C0", "#7030A0", "#FFFFFF"];
var selected_colour = "";
seconds = 0, minutes = 0, hours = 0;
draw_queue();
var socket = new WebSocket("ws://localhost:3000");
var gs = new GameState();

(function setup() {

	socket.onmessage = function (event) { // event = message from server
		let incomingMsg = JSON.parse(event.data);
		//alert(incomingMsg.type);

		if (incomingMsg.type == "PLAYER-TYPE") {
			if (incomingMsg.data == "A") {
				gs.playerType = "A";
				gs.state = "Waiting for other player...";
				update_status();
			} else {
				gs.playerType = "B";
				gs.state = "You joined a game.";
				update_status();
			}
		}
		if (incomingMsg.type == "DRAW-GAME") {
			gs.state += "<br>The game has begun, start cracking the code!";
			draw_game();
			update_status();
		}
		if (incomingMsg.type == "STATUS") {
			gs.state += "<br>" + incomingMsg.data;
			update_status();
		}
		if (incomingMsg.type == "GUESS") {
			var red = incomingMsg.data[0];
			var white = incomingMsg.data[1];
			gs.state += "<br>You Guessed. red(" + red + ") white(" + white + ") Remaining: " + gs.Guesses;
			update_guesses(red, white);
			update_status();
		}
		if (incomingMsg.type == "OPPONENT-GUESS") {
			gs.decrOpponentGuesses();
			var red = incomingMsg.data[0];
			var white = incomingMsg.data[1];
			gs.state += "<br>Opponent guessed. red(" + red + ") white(" + white + ") Remaining: " + gs.OpponentGuesses;
			update_opponent_guesses(red, white);
			update_status();
		}
		if (incomingMsg.type == "OPPONENT-GUESS-CODE") {
			update_opponent_progress(incomingMsg.data);
		}
		if (incomingMsg.type == "QUIT-GAME") {
			gs.state += "<p style='color:red;'>The opponent has left the game.</p>";
			gs.state += "You will be redirected to the splash screen in 5 seconds.";
			update_status();
			redirect();
		}
		if (incomingMsg.type == "WON-GAME") {
			gs.state += "<p style='color:green;'>You have won!</p>";
			gs.state += "You will be redirected to the splash screen in 5 seconds.";
			update_status();
			redirect();
		}
		if (incomingMsg.type == "LOST-GAME") {
			gs.state += "<p style='color:red;'>You have lost the game.</p>";
			gs.state += "You will be redirected to the splash screen in 5 seconds.";
			update_status();
			redirect();
		}
	};
})(); //execute immediately


/* basic constructor of game state */
function GameState() {
	this.playerType = null;
	this.Guesses = 10;
	this.OpponentGuesses = 10;
	this.opponentColour = null;
	this.state = null;

	this.decrGuesses = function () {
		this.Guesses--;
		update_buttons();
		update_status();
	};
	this.decrOpponentGuesses = function () {
		this.OpponentGuesses--;
	};

}

function update_status() {
	document.getElementById('status').innerHTML = gs.state; // Add message to status
	$('.console').scrollTop($('.console')[0].scrollHeight); // Scroll to bottom
};

function update_guesses(red, white) {
	document.getElementById('block-' + (gs.Guesses + 1)).style.display = "block";
	document.getElementById('block_circles-' + (gs.Guesses + 1)).style.display = "block";
	// draw red and white pegs
	var used = [false, false, false, false];
	// set first red pegs
	for (let i = 1; i <= red; i++) {
		document.getElementById('small_circle-' + (gs.Guesses + 1) + "-" + i).style.backgroundColor = "red";
		used[i - 1] = true;
	}
	// set second white pegs
	for (let i = 1; i <= (white + red); i++) {
		if (!used[i - 1]) {
			document.getElementById('small_circle-' + (gs.Guesses + 1) + "-" + i).style.backgroundColor = "white";
		}
	}
};

function update_opponent_guesses(red, white) {
	document.getElementById('opponent_block-' + (gs.OpponentGuesses + 1)).style.display = "block";
	document.getElementById('opponent_block_circles-' + (gs.OpponentGuesses + 1)).style.display = "block";
	// draw red and white pegs
	var used = [false, false, false, false];
	// set first red pegs
	for (let i = 1; i <= red; i++) {
		document.getElementById('opponent_small_circle-' + (gs.OpponentGuesses + 1) + "-" + i).style.backgroundColor = "red";
		used[i - 1] = true;
	}
	// set second white pegs
	for (let i = 1; i <= (white + red); i++) {
		if (!used[i - 1]) {
			document.getElementById('opponent_small_circle-' + (gs.OpponentGuesses + 1) + "-" + i).style.backgroundColor = "white";
		}
	}
};

function update_opponent_progress(code) {
	var colours_guess = code2Colour(code);
	for (let i = 0; i < 4; i++) {
		document.getElementById('opponent_circle-' + (gs.OpponentGuesses + 1) + "-" + (i + 1)).style.backgroundColor = colours_guess[i];
	}
};

function update_buttons() {
	if(gs.Guesses>0){
		document.getElementById('button-' + gs.Guesses).style.display = "block";
		// Change background of circle when clicked
		$(document).on('click', "#circle-" + gs.Guesses + "-1,#circle-" + gs.Guesses + "-2,#circle-" + gs.Guesses + "-3,#circle-" + gs.Guesses + "-4", function () {
			changebg($(this).attr('id'), selected_colour);
		});
	}
	
};

function changebg(id, colour) { // check if circle can change colour
	var n = id.replace("circle-", "").replace("-1", "").replace("-2", "").replace("-3", "").replace("-4", "");
	if (gs.Guesses == n)
		document.getElementById(id).style.backgroundColor = colour;
};



// QUEUE

function draw_queue() {
	draw_queue_code();
	draw_queue_colours();
	Queue_UI();
}

function draw_queue_code() {
	var y = 12;
	var x = 318;
	for (i = 1; i <= 4; i++) {
		var circle = document.createElement("span");
		circle.style.top = y + 'px';
		circle.style.left = x + 'px';
		circle.id = "selected_circle_colour" + i;
		document.getElementById('queue_colours_code').appendChild(circle);
		x += 58;
	}
}

function draw_queue_colours() {
	var y = 102;
	var x = 27;
	for (i = 1; i <= 8; i++) {
		var colour = colours[i - 1];
		var circle = document.createElement("span");
		circle.style.top = y + 'px';
		circle.style.left = x + 'px';
		circle.id = "queue_circle_colour" + i;
		circle.class = "queue_colour_circles";
		circle.style.backgroundColor = colour;
		document.getElementById('queue_colours_table').appendChild(circle);
		x += 65;
	}
}

function Queue_UI() {
	// Get selected colours
	$(".selected_colours button").click(function () {
		var code = [null, null, null, null];
		var err_count = 0;
		for (i = 0; i < code.length; i++) {
			var circle = document.getElementById("selected_circle_colour" + (i + 1));

			if (colours.includes("#" + rgb2hex(circle.style.backgroundColor))) { //check if colour is valid
				code[i] = rgb2hex(circle.style.backgroundColor);
			} else {
				err_count++;
			}
		}
		if (err_count > 0) {
			alert("Not a valid code!"); // change popup
		} else { // convert colours to code
			gs.MyColour = colour2Code(code);
			//send to server	
			send2Server("COLOUR", gs.MyColour);
			// hide some elements
			document.getElementById("select").innerHTML = "Colour Code Confirmed.";
			document.getElementById("select").disabled = true;
			document.getElementById("queue_colours_table").style.display = "none";
		}
	});

	// Change background of circle when clicked
	$(".queue_colours_code span").click(function () {
		$(this).css("background-color", selected_colour);
	});

	// Make circle border bigger when clicked
	$(".queue_colours_table span").click(function () {
		for (i = 1; i <= 8; i++) {
			var d = document.getElementById('queue_circle_colour' + i);
			var p = $('#queue_circle_colour' + i);
			var position = p.position();
			if (d.style.border == "5px solid black") { // Recenter Button
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
	$(".queue_colours_table span").mouseenter(function () {
		var p = $(this).position();

		$(this).css({
			'top': p.top - 1,
			'left': p.left - 1,
			'width': '35px',
			'height': '35px'
		});
	});
	// Make circle smaller when mouse leaves
	$(".queue_colours_table span").mouseleave(function () {
		var p = $(this).position();
		$(this).css({
			'top': p.top + 1,
			'left': p.left + 1,
			'width': '33px',
			'height': '33px'
		});
	});
}



// GAME

function draw_game() {
	document.body.style.cursor = "default"; //reset pointer
	selected_colour = ""; // reset selected colour
	document.getElementById('game').style.display = "inline";
	document.getElementById('queue').style.display = "none";
	draw_colours();
	draw_table();
	draw_opponent_table();
	draw_opponent_colours();
	Game_UI();
	update_buttons();
	timer();
}

function draw_opponent_colours() {
	var y = 12;
	var x = 33;
	var colours = code2Colour(gs.MyColour);
	for (i = 0; i < colours.length; i++) {
		var circle = document.createElement("span");
		circle.style.top = y + 'px';
		circle.style.left = x + 'px';
		circle.id = "opponent_circle_colour" + (i + 1);
		circle.style.backgroundColor = colours[i];
		document.getElementById('opponent').appendChild(circle);
		x += 58;
	}
}

function draw_opponent_table() {
	var y = 60.5;
	var x;
	for (n = 1; n <= 10; n++) {
		x = 33;
		for (i = 1; i <= 4; i++) {
			// create circles
			var circle = document.createElement("span");
			circle.style.top = y + 'px';
			circle.style.left = x + 'px';
			circle.id = "opponent_circle-" + n + "-" + i;
			document.getElementById('opponent').appendChild(circle);
			x += 58;
		}
		// create block
		var block = document.createElement("IMG");
		block.style.top = (y - 5) + 'px';
		block.style.left = '285px';
		block.id = "opponent_block-" + n;
		block.setAttribute("src", "images/block.png");
		document.getElementById('opponent').appendChild(block);
		//create small circles box
		var div = document.createElement("div");
		div.id = "opponent_block_circles-" + n;
		div.className = "opponent_block_circles";
		div.style.top = (y - 5) + 'px';
		div.style.left = '285px';
		document.getElementById('opponent').appendChild(div);
		//create small circles
		var x_ = 290;
		for (i = 1; i <= 2; i++) {
			var small_circle = document.createElement("span");
			small_circle.style.top = y + 'px';
			small_circle.style.left = x_ + 'px';
			small_circle.id = "opponent_small_circle-" + n + "-" + i;
			document.getElementById("opponent_block_circles-" + n).appendChild(small_circle);

			var small_circle2 = document.createElement("span");
			small_circle2.style.top = (y + 18) + 'px';
			small_circle2.style.left = x_ + 'px';
			small_circle2.id = "opponent_small_circle-" + n + "-" + (i + 2);
			document.getElementById("opponent_block_circles-" + n).appendChild(small_circle2);

			x_ += 18;
		}
		y += 37;
	}
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

function Game_UI() {
	// check button is pressed
	$(".mastermind button").click(function () {
		var attempt_code = [null, null, null, null];
		var err_count = 0;
		var attempt = gs.Guesses;
		for (i = 0; i < attempt_code.length; i++) {
			var circle = document.getElementById("circle-" + attempt + "-" + (i + 1));

			if (colours.includes("#" + rgb2hex(circle.style.backgroundColor))) { //check if colour is valid
				attempt_code[i] = rgb2hex(circle.style.backgroundColor);
			} else {
				err_count++;
			}
		}
		if (err_count > 0) {
			alert("Not a valid code!"); // change popup
		} else { // convert colours to code
			$(this).css('display', 'none');
			gs.decrGuesses();
			//send to server
			send2Server("GUESS", colour2Code(attempt_code));
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

// FUNCTIONS

function rgb2hex(rgb) {
	if (rgb == "") {
		return null;
	} else {
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
		if (colour_arr[i] != null && colours.includes("#" + colour_arr[i])) {
			code += colours.indexOf("#" + colour_arr[i]);
		}
	}
	return code;

}

function code2Colour(code) {
	var colourarr = Array(4);
	for (i = 0; i < colourarr.length; i++) {
		colourarr[i] = colours[code.charAt(i)];
	}
	return colourarr;
}
async function redirect() {
	await sleep(5000);
	document.location = 'splash';
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
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

	document.getElementById("time").innerText = "Game duration: " + (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);
	timer();
}

function timer() {
	t = setTimeout(add, 1000);
}
function toggleFullScreen() {
	if (document.getElementById("exit_fullscreen").style.display == "none" || document.getElementById("exit_fullscreen").style.display == "") {
		document.getElementById("exit_fullscreen").style.display = "block";
		document.getElementById("fullscreen").style.display = "none"
	} else {
		document.getElementById("exit_fullscreen").style.display = "none";
		document.getElementById("fullscreen").style.display = "block"
	}
	let elem = document.getElementById("screen");
	if (!document.webkitIsFullScreen) {
		elem.webkitRequestFullscreen();
	} else {
		document.webkitCancelFullScreen();
	}
}

// Send Messages to Server
function send2Server(type, data) {
	let outgoingMsg = {
		type: type,
		playerType: gs.playerType,
		data: data
	};
	socket.send(JSON.stringify(outgoingMsg));
};
// Ask Server for a new Game
function newGame() {
	location.reload();
};

