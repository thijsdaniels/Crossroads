#pragma strict

private var startPosition: Vector3;
private var endPosition: Vector3;
private var swingTime: float = 0;
private var swingDuration: float = 0.25;
private var player: GameObject;
private var swingDistance: int = 180;
private var swingTilt: int = 40;

public var damage: int = 2;

function Start() {
	player = GameObject.Find('Player');
	transform.parent = player.transform;
	startPosition = Vector3(-swingTilt / 2, player.transform.eulerAngles.y - swingDistance / 2, 0);
	endPosition = Vector3(swingTilt / 2, player.transform.eulerAngles.y + swingDistance / 2, 0);
	transform.eulerAngles = startPosition;
}

function Update() {
	swingTime += Time.deltaTime;
	if (swingTime < swingDuration) {
		var swingProgress = swingTime * (1f / swingDuration);
		transform.eulerAngles = Vector3.Lerp(startPosition, endPosition, swingProgress);
	} else {
		Destroy(this.gameObject);
	}
}

function OnTriggerEnter(other: Collider) {
	var healthScript: HealthScript = other.gameObject.GetComponent(HealthScript);
	if (healthScript) {
		healthScript.InstantDamage(damage);
	}
}