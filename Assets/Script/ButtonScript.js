#pragma strict

var Pushed: boolean = false;
var Subjects: GameObject[];

function Start() {
	
}

function Update() {

}

function OnPush() {
	if (!Pushed) {
		Animate();
		Effect();
		Pushed = true;
	}
}

function Animate() {
	transform.position.y -= transform.localScale.y / 4;
	transform.localScale.y /= 4;
}

function Effect() {
	for (var i = 0; i < Subjects.Length; i++) {
		Subjects[i].SetActive(true);
	}
}