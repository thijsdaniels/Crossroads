#pragma strict

var target: Transform = null;
var origin: Vector3 = Vector3.zero;
var offset: Vector3 = Vector3.zero;
var angle: Vector2 = Vector2.zero;
var distance: float = 300;
var cycle: float = 60;
var lookAt: boolean = false;

function Start() {
	
}

function FixedUpdate() {
	
	// correct orientation
	if (lookAt) {
		transform.LookAt(Vector3.zero);
	}
	
	// determine origin
	if (target != null) {
		origin = target.position;
	}
	
	// orbit around origin
	var progress = (Time.time % cycle) / cycle;
	var radians = RatioToRadians(progress);
	transform.position = Vector3(
		origin[0] + offset[0] + distance * (Mathf.Cos(radians) * Mathf.Cos(DegreesToRadians(angle[1]))),
		origin[1] + offset[1] + distance * (Mathf.Sin(radians) * Mathf.Cos(DegreesToRadians(angle[0]))),
		origin[2] + offset[2] + distance * (Mathf.Cos(radians) * Mathf.Sin(DegreesToRadians(angle[1])) + Mathf.Sin(radians) * Mathf.Sin(DegreesToRadians(angle[0])))
	);
}

// converts a ratio to radians
function RatioToRadians(ratio: float): float {
	return ratio * Mathf.PI * 2;
}

// converts degrees to radians
function DegreesToRadians(degrees: float): float {
	return degrees / (180 / Mathf.PI);
}