

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
