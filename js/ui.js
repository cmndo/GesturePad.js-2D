 //--Point awesomeness
function Point(x, y){
    this.x = x || 0;
    this.y = y || 0;
};

Point.prototype.x = null;
Point.prototype.y = null;



var dragObj = {};
var points = [];

function touchPad(e){
	lineColor = '#0090ff';
	points = [];
	dragObj.start = {
		x: e.x,
		y:e.y
	};
	pad.addEventListener('touchmove', dragAround);
	pad.addEventListener('touchend', killDrag);
}
function dragAround(e){
	//now that we have the basics down. each dragAround is going to draw a segment of line.
	dragObj.move = {
		x:e.x,
		y:e.y
	}
	points.push(new Point(e.x, e.y));
	var a, b, c;
	var draggable = Ti.UI.createView({
		touchEnabled: false,
		width: 2, 
		height: 2, 
		backgroundColor: lineColor, 
		top: dragObj.start.y, 
		left: dragObj.start.x,
		anchorPoint: (.5, 0),
		visible: false
	});
	pad.add(draggable);	
	
	var animation = Ti.UI.createAnimation();
	animation.duration = 100;
	animation.backgroundColor = 'black';
	animation.addEventListener("complete", function(){
		draggable.animate(secondaryAnimation)
		animation = null;
	});
	var secondaryAnimation = Ti.UI.createAnimation();
	secondaryAnimation.duration = 200;
	secondaryAnimation.backgroundColor = 'black'
	secondaryAnimation.opacity = 0;
	//secondaryAnimation.width = 14;
	//secondaryAnimation.height = 14;
	secondaryAnimation.addEventListener("complete", function(){
		pad.remove(draggable);
		secondaryAnimation = null;
	})
	draggable.animate(animation);
	
	
	
	
	a = dragObj.move.x - dragObj.start.x;
	b = dragObj.move.y - dragObj.start.y;
	draggable.width = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));

	
	
	
	var m = Ti.UI.create2DMatrix({
		rotate: (Math.atan2(e.y - draggable.top, e.x - draggable.left) * (180/Math.PI))
	});
	draggable.transform = m;
	
	
	draggable.visible = true;
	
	
	dragObj.start = dragObj.move;
	
}
function killDrag(e){
	interpretPoints( points );
	pad.removeEventListener('touchmove', dragAround);
	pad.removeEventListener('touchend', killDrag);
}

/*
 * Directions and values for custom line tracking
 * Example: http://media.photobucket.com/image/recent/drawkbox/mg_algo01.png
 *      6
 *   5  |  7
 * 	  \ | /
 * 4--- * ---0     
 *    / | \
 *   3  |  1
 *      2
 */
/*
 * New method for storing gestures
 * Persistant Data
 */
var defaultGestures = [
	{
		name: "Reset console",
		code: "163",
	},
	{
		name: "Open 'Options Panel' aka Star",
		code: "71503"
	},
	{
		name: "Backwards Z",
		code: "414"
	},
	{
		name: "S",
		code: "54321012345"
	}
];

var _gesture = new ExternalGesture();
_gesture.addEventListener("MATCH", matchHandler);

for(var i= 0; i < defaultGestures.length; i++){
	_gesture.addGesture(defaultGestures[i].name, defaultGestures[i].code);
}


function interpretPoints( ps ){
	_gesture.processPoints(ps);
}


function matchHandler(e){
	//determine which pattern was matched

	if(e.datas === "Reset console"){
		console.value = e.datas +"\n----------\nWelcome to Gesture Pad.\nAuthor: Aaron Sherrill";
	}else{
		console.value = e.datas +"\n" + console.value;
	}
}

