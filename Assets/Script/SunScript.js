#pragma strict

function Start() {
	var orbitScript: OrbitScript = GetComponent(OrbitScript);
	orbitScript.cycle = TimeScript.day;
}

function Awake() {
	var light: Light = GetComponent(Light);
}

function Update() {
	light.intensity = Mathf.Min(150, Mathf.Max(0, transform.position.y)) / 100;
}