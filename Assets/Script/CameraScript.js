#pragma strict

var listening: boolean = true;
var Player: GameObject;
var FollowDelayFactor: float = 3;
var distance: float = 10;
var angle: float = 1;
var minDistance: float = 5;
var minAngle: float = 0;

function Start() {
	
}

function FixedUpdate() {
	Respond();
	Follow();
}

function Respond() {
	if (listening) {
		if (Input.GetAxis("D-Pad Horizontal")) {
			distance = Mathf.Max(minDistance, Mathf.Min(30, distance + Input.GetAxis("D-Pad Horizontal") / 2));
		}
		if (Input.GetAxis("D-Pad Vertical")) {
			angle = Mathf.Max(minAngle, Mathf.Min(25, angle + Input.GetAxis("D-Pad Vertical") / 2));
		}
	}
}

function Follow() {
	
	// transform position
	var PlayerOrientation: float = Player.transform.localEulerAngles.y / (180 / Mathf.PI);
	transform.position.x += (Player.transform.position.x + (distance * Mathf.Cos(PlayerOrientation)) - transform.position.x) / FollowDelayFactor;
	transform.position.y += ((Player.transform.position.y + angle) - transform.position.y) / FollowDelayFactor;
	transform.position.z += (Player.transform.position.z - (distance * Mathf.Sin(PlayerOrientation)) - transform.position.z) / FollowDelayFactor;
	
	// transfom orientation
	transform.LookAt(Player.transform);
	
}