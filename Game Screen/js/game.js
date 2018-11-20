var x;
var y=94;
var colours = ["#FF0000", "#ED7D31", "#FFFF00", "#00B050", "#00B0F0", "#0070C0", "#7030A0", "#fff"];
var selected_colour="";
draw_colours();
draw_table();

function draw_colours() {
	var y=12;
	var x=27;
	for (i = 1; i <= 8; i++) {
		var colour = colours[i-1];
		var circle = document.createElement("span");
		circle.style.top = y+'px';
		circle.style.left = x+'px';
		circle.id = "circle_colour" + i;
		circle.class = "colour_circles";
		circle.style.backgroundColor= colour;
		document.getElementById('colours').appendChild(circle);
		x+=65;
	}
	return 0;
}

function draw_table() {
	for (n = 1; n <= 10; n++) {
		x=125;
		for (i = 1; i <= 4; i++) {
			var circle = document.createElement("span");
			circle.style.top = y+'px';
			circle.style.left = x+'px';
			circle.id = "circle" + n;
			document.getElementById('mastermind').appendChild(circle);
			x+=87;
		}
		y+=55;
	}
}

// Make circle border bigger when clicked
$(".mastermind span").click(function() {
	$(this).css("background-color", selected_colour);
});

// Make circle border bigger when clicked
$(".colours span").click(function() {
	for (i = 1; i <= 8; i++) {
		var d = document.getElementById('circle_colour'+i);
		var p = $('#circle_colour'+i);
		var position = p.position();
		if (d.style.border=="5px solid black") {
    		d.style.border="2px solid black";
    		var x=position.top+4;
    		var left=position.left+4;
    		d.style.top=x+'px';
    		d.style.left=left+'px';
		}
	}
	var p = $(this).position();
	selected_colour = $(this).css( "background-color" );
	$(this).css({
		'top':p.top-4,
  		'left':p.left-4,
      	'border':'5px solid black',
	});
});

// Make circle bigger when mouse enters
$(".colours span").mouseenter(function() {
	$(this).css('cursor', 'hand');
	var p = $(this).position();

  	$(this).css({
  		'top':p.top-1,
  		'left':p.left-1,
      	'width':'35px',
      	'height':'35px'
	});
});

// Make circle smaller when mouse leaves
$(".colours span").mouseleave(function() {
	var p = $(this).position();
  	$(this).css({
  		'top':p.top+1,
  		'left':p.left+1,
      	'width':'33px',
      	'height':'33px'
	});
});