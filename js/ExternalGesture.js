/**
 *
 *
 *	MouseGesture
 *
 *	@notice		Mouse Gesture Recognizer
 *	@author		Didier Brun
 *	@version	1.0
 * 	@date		2007-05-17
 * 	@link		http://www.bytearray.org/?p=91
 *
 *
 *	Original author :
 *	-----------------
 *	Didier Brun aka Foxy
 *	webmaster@foxaweb.com
 *	http://www.foxaweb.com
 *
 * 	AUTHOR ******************************************************************************
 *
 *	authorName : 	Didier Brun - www.foxaweb.com
 * 	contribution : 	the original class
 * 	date :			2007-01-18
 *
 * 	VISIT www.byteArray.org
 *
 *
 *	LICENSE ******************************************************************************
 *
 * 	This class is under RECIPROCAL PUBLIC LICENSE.
 * 	http://www.opensource.org/licenses/rpl.php
 *
 * 	Please, keep this header and the list of all authors
 *	
 * 
 *	MODIFICATION + JavaScript PORT *******************************************************
 * 	
 *	Aaron Sherrill
 * 	Digital Surgeons, LLC
 * 	Javascript Port for use all over the web.
 * 	
 */
function Point(x, y){
    this.x = x || 0;
    this.y = y || 0;
};

Point.prototype.x = null;
Point.prototype.y = null;

function ExternalGesture() {
	var _events = {};
	
	//add
	this.addEventListener = function(CONST, callback) {
		if(!_events[CONST]) {
			_events[CONST] = [];
		}
		_events[CONST].push(callback);
	};
	//remove
	this.removeEventListener = function(CONST, callback) {
		console.log(CONST.hasOwnProperty(callback));
		if(_events.hasOwnProperty(CONST)) {
			for(var j = 0; j < _events[CONST].length; j++) {
				if(_events[CONST][j] == callback) {
					_events[CONST].splice(j, 1);
				}
			}

		}
	};
	//dispatch
	var dispatchEvent = function(CONST, obj) {
		if(_events[CONST]) {
			for(var i = 0; i < _events[CONST].length; i++) {
				if(_events[CONST][i]) {
					_events[CONST][i](obj);
				}
			}
		}
	};
	// ------------------------------------------------
	//
	// ---o static (Yea right!)
	//
	// ------------------------------------------------

	var DEFAULT_NB_SECTORS = 8;
	// Number of sectors
	var DEFAULT_PRECISION = 8;
	// Precision of catpure in pixels
	var DEFAULT_FIABILITY = 10;
	// Default fiability level

	// ------------------------------------------------
	//
	// ---o constructor
	//
	// ------------------------------------------------

	init();

	// ------------------------------------------------
	//
	// ---o properties
	//
	// ------------------------------------------------

	var moves;
	// Mouse gestures
	var lastPoint;
	// Last mouse point
	var mouseZone;
	// Mouse zone
	var captureDepth;
	// Current capture depth
	var gestures;
	// Gestures to match
	
	var points;
	// Mouse points

	var sectorRad;
	// Angle of one sector

	var anglesMap;
	// Angles map

	// ------------------------------------------------
	//
	// ---o public methods
	//
	// ------------------------------------------------

	/**
	 *	Add a gesture
	 */
	this.addGesture = function(o, gesture, matchHandler) {
		var g = [];
		for(var i = 0; i < gesture.length; i++) {
			g.push(gesture.charAt(i) == "." ? -1 : parseInt(gesture.charAt(i), 16));
		}
		gestures.push({
			datas : o,
			moves : g,
			match : matchHandler
		});
	}
	/**
	 *	Add lots of gesture
	 */
	this.addGestures = function(obj) {
		for(var i = 0; i < obj.length; i++){
			this.addGesture(obj[i].name, obj[i].code);
		}
	}

	// ------------------------------------------------
	//
	// ---o private methods
	//
	// ------------------------------------------------

	/**
	 *	Initialisation
	 */
	function init() {

		// Build the angles map
		buildAnglesMap();

		// Gesture Spots
		gestures = [];
	}

	/**
	 *	Build the angles map
	 */
	function buildAnglesMap() {

		// Angle of one sector
		sectorRad = Math.PI * 2 / DEFAULT_NB_SECTORS;

		// map containing sectors no from 0 to PI*2
		anglesMap = [];

		// the precision is Math.PI*2/100
		var step = Math.PI * 2 / 100;

		// memorize sectors
		var sector;
		for(var i = -sectorRad / 2; i <= Math.PI * 2 - sectorRad / 2; i += step) {
			sector = Math.floor((i + sectorRad / 2) / sectorRad);
			anglesMap.push(sector);
		}
	}

	/**
	 *	Process Points
	 */
	this.processPoints = function(ps){
		
		moves = [];
		points = [];
		
		// First point
		lastPoint = new Point(ps[0].x, ps[0].y);

		for(var k = 1; k < ps.length; k++) {
			// calcul dif
			var msx = ps[k].x;
			var msy = ps[k].y;

			var difx = msx - lastPoint.x;
			var dify = msy - lastPoint.y;
			
			var sqDist = difx * difx + dify * dify;
			var sqPrec = DEFAULT_PRECISION * DEFAULT_PRECISION;


			if(sqDist > sqPrec) {
				points.push(new Point(msx, msy));
				addMove(difx, dify);
				lastPoint.x = msx;
				lastPoint.y = msy;

			}

		}

		// match
		matchGesture();
	}
	/**
	 *	Add a move
	 */
	function addMove(dx, dy) {
		var angle = Math.atan2(dy, dx) + sectorRad / 2;
		
		if(angle < 0) {
			angle += Math.PI * 2;
		}
		
		var no = Math.floor(angle / (Math.PI * 2) * 100);
		
		//limit the number of duplicate angles that make up the move.
		if(anglesMap[no] !== moves[moves.length - 1]){
			moves.push(anglesMap[no]);
		}
		
		
	}

	/**
	 *	Match the gesture
	 */
	
	function matchGesture() {

		var bestCost = 1000000;
		var nbGestures = gestures.length;
		var cost;
		var gest;
		var bestGesture = null;
		var infos = {
			points : points,
			moves : moves,
			lastPoint : lastPoint
		};

		for(var i = 0; i < nbGestures; i++) {
			gest = gestures[i].moves;

			infos.datas = gestures[i].datas;
			cost = costLeven(gest, moves);

			if(cost <= DEFAULT_FIABILITY) {
				if(gestures[i].match != null) {
					infos.cost = cost;
					cost = gestures[i].match(infos);
				}
				if(cost < bestCost) {
					bestCost = cost;
					bestGesture = gestures[i];
				}
			}
		}

		if(bestGesture != null) {
			var evt = {};
			evt.datas = bestGesture.datas;
			evt.fiability = bestCost;
			dispatchEvent("MATCH", evt);
		} else {
			dispatchEvent("NO_MATCH", {});
		}
	}

	/**
	 *	dif angle
	 */
	function difAngle(a, b) {
		var dif = Math.abs(a - b);
		if(dif > DEFAULT_NB_SECTORS / 2)
			dif = DEFAULT_NB_SECTORS - dif;
		return dif;
	}

	/**
	 *	return a filled 2D table
	 */
	function fill2DTable(w, h, f) {
		var o = new Array(w);
		for(var x = 0; x < w; x++) {
			o[x] = new Array(h);
			for(var y = 0; y < h; y++)
			o[x][y] = f;
		}
		return o;
	}

	/**
	 *	cost Levenshtein
	 */
	function costLeven(a, b) {

		// point
		if(a[0] == -1) {
			return b.length == 0 ? 0 : 100000;
		}

		// precalc difangles
		var d = fill2DTable(a.length + 1, b.length + 1, 0);
		var w = d.slice();

		for(var x = 1; x <= a.length; x++) {
			for(var y = 1; y < b.length; y++) {
				d[x][y] = difAngle(a[x - 1], b[y - 1]);
			}
		}

		// max cost
		for( y = 1; y <= b.length; y++)
		w[0][y] = 100000;
		for( x = 1; x <= a.length; x++)
		w[x][0] = 100000;
		w[0][0] = 0;

		// levensthein application
		var cost = 0;
		var pa;
		var pb;
		var pc;

		for( x = 1; x <= a.length; x++) {
			for( y = 1; y < b.length; y++) {
				cost = d[x][y];
				pa = w[x-1][y] + cost;
				pb = w[x][y - 1] + cost;
				pc = w[x-1][y - 1] + cost;
				w[x][y] = Math.min(Math.min(pa, pb), pc)
			}
		}

		return w[x-1][y - 1];
	}

}

