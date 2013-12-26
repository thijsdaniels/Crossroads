#pragma strict

public var path: Vector3[];
private var waypoint: int = 0;
private var moving: boolean = true;
public var speed: float = 1;
public var speech: String[];

function Start () {
	
}

function Update () {
	if (path.length > 0 && moving) FollowPath();
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
	hudScript.DisplayText(speech, this);
}

function FollowPath() {
	if (transform.position == path[waypoint]) waypoint = (waypoint + 1) % path.length;
	var step = speed * Time.deltaTime;
	transform.position = Vector3.MoveTowards(transform.position, path[waypoint], step);
}

function PausePath() {
	moving = false;
}

function ContinuePath() {
	moving = true;
}