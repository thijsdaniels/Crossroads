#pragma strict

private var healthScript: HealthScript;

function Start () {
	healthScript = gameObject.GetComponent(HealthScript);
}

function Update () {
	if (healthScript.GetHealth() <= 0) {
		Destroy(this.gameObject);
	}
}