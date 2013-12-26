#pragma strict

var listening: boolean = true;
var player: GameObject;
var followDelayFactor: float = 3;
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
		if (Input.GetAxis("Right Stick Horizontal")) {
			distance = Mathf.Max(minDistance, Mathf.Min(30, distance + Input.GetAxis("Right Stick Horizontal") / 2));
		}
		if (Input.GetAxis("Right Stick Vertical")) {
			angle = Mathf.Max(minAngle, Mathf.Min(25, angle + Input.GetAxis("Right Stick Vertical") / 2));
		}
	}
}

function Follow() {
	
	// transform position
	var playerOrientation: float = player.transform.localEulerAngles.y / (180 / Mathf.PI);
	transform.position.x += (player.transform.position.x + (distance * player.GetComponent(PlayerScript).GetPlayerDirection() * Mathf.Cos(playerOrientation)) - transform.position.x) / followDelayFactor;
	transform.position.y += ((player.transform.position.y + angle) - transform.position.y) / followDelayFactor;
	transform.position.z += (player.transform.position.z - (distance * Mathf.Sin(player.GetComponent(PlayerScript).GetPlayerDirection() * playerOrientation)) - transform.position.z) / followDelayFactor;
	
	// transfom orientation
	transform.LookAt(player.transform);
	
}