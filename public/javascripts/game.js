var colours = ["#FF0000", "#ED7D31", "#FFFF00", "#00B050", "#00B0F0", "#0070C0", "#7030A0", "#FFFFFF"];
var selected_colour = "";
draw_colours();
draw_table();
draw_opponent_table();
draw_opponent_colours();

function draw_opponent_colours() {
	var y = 12;
	var x = 33;
	for (i = 1; i <= 4; i++) {
		var circle = document.createElement("span");
		circle.style.top = y + 'px';
		circle.style.left = x + 'px';
		circle.id = "opponent_circle_colour" + i;
		document.getElementById('opponent').appendChild(circle);
		x += 58;
	}
}

function draw_opponent_table() {
	var y = 61;
	var x;
	for (n = 1; n <= 10; n++) {
		x = 33;
		for (i = 1; i <= 4; i++) {
			// create circles
			var circle = document.createElement("span");
			circle.style.top = y + 'px';
			circle.style.left = x + 'px';
			circle.id = "opponent-circle-" + n + "-" + i;
			document.getElementById('opponent').appendChild(circle);
			x += 58;
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
		div.style.top = (y - 10) + 'px';
		div.style.left = '500px';
		document.getElementById('mastermind').appendChild(div);
		//create small circles
		var x_ = 510;
		for (i = 1; i <= 2; i++) {
			var small_circle = document.createElement("span");
			small_circle.style.top = y + 'px';
			small_circle.style.left = x_ + 'px';
			small_circle.id = "small_circle-" + n + "-" + i;
			document.getElementById("block_circles-" + n).appendChild(small_circle);
			for (j = 1; j <= 2; j++) {
				var small_circle = document.createElement("span");
				small_circle.style.top = (y + 25) + 'px';
				small_circle.style.left = x_ + 'px';
				small_circle.id = "small_circle-" + n + "-" + (i + 2);
				document.getElementById("block_circles-" + n).appendChild(small_circle);
			}
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
	rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

	function hex(x) {
		return ("0" + parseInt(x).toString(16)).slice(-2);
	}
	return (hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3])).toUpperCase();
}




/* #####	Events		#### */



// Change background of circle when clicked
$(".mastermind span").click(function () {
	$(this).css("background-color", selected_colour);
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