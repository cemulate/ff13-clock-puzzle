// Correct modulo
Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
};

// Returns an angle equivalent to dest such that 
// ref --> dest is an acute angle change
function acuteAngle(ref, dest) {
	var ret = dest - 360;
	while (Math.abs(ret - ref) > 180) {
		ret += 360;
	}
	return ret
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function genRand(length) {
	var ret = []
	for (var i = 0; i < length; i ++) {
		ret.push(getRandomInt(1, Math.floor(length/2)));
	}
	return ret;
}

function ClockPuzzle(paper, width, height, callbacks) {
	
	this.width = width;
	this.height = height;
	this.paper = paper;
	this.callbacks = callbacks;

	this.mapping = null;
	this.state = [];
	this.choices = null;
	this.gameover = false;

	this.g = null;
}

ClockPuzzle.prototype.findSolution = function() {
	for (var i = 0; i < this.mapping.length; i ++) {
		s = this.solve(i);
		if (s) return s;
	}
	return null;
}

ClockPuzzle.prototype.solve = function(n) {
	var marked = []
	for (var i = 0; i < this.mapping.length; i ++) {
		marked.push(false);
	}
	return this.solveCore(n, marked, []);
}

ClockPuzzle.prototype.solveCore = function(n, marked, path) {
	marked[n.mod(this.mapping.length)] = true;

	path.push(n);

	if (_.all(marked)) {
		return path;
	}

	var step = this.mapping[n.mod(this.mapping.length)];
	var nChoice = (n - step).mod(this.mapping.length);
	var pChoice = (n + step).mod(this.mapping.length);

	if (!marked[nChoice]) {
		var nSolved = this.solveCore(nChoice, marked.slice(), path.slice());
		if (nSolved) return nSolved;
	}

	if (!marked[pChoice]) {
		var pSolved = this.solveCore(pChoice, marked.slice(), path.slice());
		if (pSolved) return pSolved;
	}

	return null;
}

ClockPuzzle.prototype.mark = function(n) {

	// Already marked or game ended
	if (this.state[n] || this.gameover) return;

	// Not a valid move
	if (this.choices && !_.contains(this.choices, n)) return;

	// Mark this node
	this.state[n.mod(this.mapping.length)] = true;

	var pChoice = (n + this.mapping[n]).mod(this.mapping.length);
	var nChoice = (n - this.mapping[n]).mod(this.mapping.length);
	this.choices = [nChoice, pChoice];

	this.update(n);
}

ClockPuzzle.prototype.draw = function() {

	this.g = this.paper.group();

	var n = this.mapping.length;

	var radiusLimit = Math.floor(Math.min(this.width, this.height) / 3.2);
	var radius = (radiusLimit < 300) ? radiusLimit : 300;
	var nodeRadiusLimit = Math.floor(Math.sqrt(radius*radius + radius*radius - 2*radius*radius*Math.cos((1/n) * 2 * Math.PI)) / 2);
	var nodeRadius = (nodeRadiusLimit < 100) ? nodeRadiusLimit : 100;

	var glow = paper.filter(Snap.filter.shadow(3, 3, 4, "#fefec9", 0.3));

	for (var i = 0; i < n; i ++) {
		var angle = -(Math.PI / 2) + (i/n) * 2 * Math.PI;

		var x = radius * Math.cos(angle);
		var y = radius * Math.sin(angle);

		var circle = this.paper.circle(x, y, nodeRadius - 5).addClass("node").attr({nodeIndex: i});

		var text = this.paper.text(x, y, this.mapping[i].toString()).addClass("nodeText").attr({nodeIndex: i});
		text.attr({"font-size": "50px"});
		var bbox = text.getBBox();
		text.attr({x: x - (bbox.cx - x), y: y - (bbox.cy - y)});

		this.g.add(circle);
		this.g.add(text);
	}

	this.g.selectAll(".node").forEach(_.bind(function (el) {
		
		el.attr({
			"stroke": "black",
			"fill": "#5AE2FF",
			"stroke-width": 5
		});

		el.click(_.bind(function() {
			this.mark(parseInt(el.attr("nodeIndex")));
		}, this));

	}, this));

	this.g.selectAll(".nodeText").forEach(_.bind(function (el) {
		
		el.attr({
			"stroke": "black",
			"font-size": "20px"
		});

		el.click(_.bind(function() {
			this.mark(parseInt(el.attr("nodeIndex")));
		}, this));

	}, this));

	var handLength = radius - nodeRadius - 25;

	var longHandGroup = this.paper.group();
	longHandGroup.add(this.paper.line(0, 0, handLength, 0).addClass("hand"));
	longHandGroup.add(this.paper.polygon([handLength, -20, handLength, 20, handLength+20, 0, handLength, -20]).addClass("arrowhead"));
	longHandGroup.addClass("handGroup");
	longHandGroup.attr({id: "hand1"});
	longHandGroup.transform("r-90,0,0");

	var shortHandGroup = this.paper.group();
	shortHandGroup.add(this.paper.line(0, 0, handLength, 0).addClass("hand"));
	shortHandGroup.add(this.paper.polygon([handLength, -20, handLength, 20, handLength+20, 0, handLength, -20]).addClass("arrowhead"));
	shortHandGroup.addClass("handGroup");
	shortHandGroup.attr({id: "hand2"});
	shortHandGroup.transform("r-90,0,0");

	this.g.add(longHandGroup);
	this.g.add(shortHandGroup);

	this.g.selectAll(".hand").forEach(function (el) {
		el.attr({
			"stroke": "gray",
			"stroke-width": 10
		});
	});

	this.g.selectAll(".arrowhead").forEach(function (el) {
		el.attr({
			"fill": "gray"
		});
	});

	this.g.transform("t" + this.width/2 + "," + this.height/2);

}

ClockPuzzle.prototype.update = function(newMarkedIndex) {

	if (!this.choices) return;

	this.g.selectAll(".node").forEach(_.bind(function (el) {

		var marked = this.state[parseInt(el.attr("nodeIndex"))];

		if (marked) {
			el.animate({"opacity": 0.4, "fill": "#CCC"}, 500);
		}

	}, this));

	this.g.selectAll(".nodeText").forEach(_.bind(function (el) {

		var marked = this.state[parseInt(el.attr("nodeIndex"))];

		if (marked) {
			el.animate({"opacity": 0.4}, 500);
		}

	}, this));

	var newAngle = -90 + (newMarkedIndex / this.mapping.length) * 360;
	var newTString = "r" + newAngle + ",0,0";

	this.g.select("#hand1").transform(newTString);

	this.g.select("#hand2").transform(newTString);

	setTimeout(_.bind(function() {

		var newAngle1 = -90 + (this.choices[0] / this.mapping.length) * 360;
		var newAngle2 = -90 + (this.choices[1] / this.mapping.length) * 360;

		newAngle1 = acuteAngle(newAngle, newAngle1);
		newAngle2 = acuteAngle(newAngle, newAngle2);
		
		// If both hands are going 180 around, 'tweak' one to a 1 degree smaller angle
		// so that it will go the opposite direction
		if (Math.abs(newAngle1 - newAngle) == 180 && Math.abs(newAngle2 - newAngle) == 180) {
			newAngle1 -= 1;
			if (Math.abs(newAngle1 - newAngle) < 180) newAngle1 += 1;
			newAngle1 = acuteAngle(newAngle, newAngle1);
		}

		var newString1 = "r" + newAngle1 + ",0,0";
		var newString2 = "r" + newAngle2 + ",0,0";

		this.g.select("#hand1").animate({transform: newString1}, 500);
		this.g.select("#hand2").animate({transform: newString2}, 500);

		this.g.selectAll(".node").forEach(_.bind(function (el) {

			var marked = this.state[parseInt(el.attr("nodeIndex"))];

			if (!marked) {
				var color = (_.contains(this.choices, parseInt(el.attr("nodeIndex")))) ? "#5AE2FF" : "#FFF";
				el.animate({"fill": color}, 500);
			}

		}, this));

		if (_.all(this.state)) {
			this.gameover = true;
			this.g.animate({opacity: 0.2}, 3000);
			if (this.callbacks.victory) {
				this.callbacks.victory.call();
			}
		} else if (this.state[this.choices[0]] && this.state[this.choices[1]]) {
			this.gameover = true;
			this.g.animate({opacity: 0.2}, 3000);
			if (this.callbacks.gameover) {
				this.callbacks.gameover.call();
			}
		}

	}, this), 500);

}

ClockPuzzle.prototype.resetGenerateNew = function(length) {
	if (this.g) this.g.clear();
	
	if (length) {
		this.mapping = genRand(length);
		while (!this.findSolution()) {
			this.mapping = genRand(length);
		}
	} else {
		// If null length passed in, keep old mapping
		length = this.mapping.length;
	}
	
	this.state = []
	for (var i = 0; i < length; i ++) {
		this.state.push(false);
	}

	this.choices = null;
	this.gameover = false;
}