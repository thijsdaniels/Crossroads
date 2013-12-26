#pragma strict

var activated: boolean = false;
var subjects: GameObject[];

function Start() {
	
}

function Update() {

}

function IsActivated(): boolean {
	return activated;
}

function SetActivated() {
	activated = true;
}

function Activate() {
	if (!IsActivated()) {
		Push();
		Effect();
		SetActivated();
	}
}

function Push() {
	transform.position.y -= transform.localScale.y / 4;
	transform.localScale.y /= 4;
}

function Effect() {
	for (var i = 0; i < subjects.Length; i++) {
		subjects[i].SetActive(true);
	}
}