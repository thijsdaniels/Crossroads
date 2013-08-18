#pragma strict

public var path: Vector2[];
private var pathIndex: int = 0;
public var speed: float = 1;
public var speech: String[];

function Start () {
	StartPath();
}

function Update () {

}

function OnTriggerEnter(other: Collider) {
	var playerScript = other.gameObject.GetComponent(PlayerScript);
	if (playerScript) {
		playerScript.SetContextAction('Talk', this.gameObject, Speak);
	}
}

function OnTriggerExit(other: Collider) {
	var playerScript = other.gameObject.GetComponent(PlayerScript);
	if (playerScript) {
		playerScript.ClearContextAction();
	}
}

function SetSpeech(_speech: String[]) {
	speech = _speech;
}

function Speak() {
	var hudScript = GameObject.Find('HUD').GetComponent(HUDScript);
	hudScript.DisplayText(speech);
}

function StartPath() {
	//TODO cycle movement to waypoints
}

function PausePath() {
	//TODO stop movement to waypoints
}