#pragma strict

public var target: Transform;
private var targetScript: PlayerScript;
private var distance: float = 0.5;
private var scale: float = 0.25;

function Start () {

	targetScript = target.GetComponent(PlayerScript); 

}

function Update () {

	// determine whether the crosshair is useful
	if (targetScript.IsAimCharged()) {
	
		// get player's aiming angle
		var aimAngle = targetScript.GetAimAngle();
		var aimAngleRads = aimAngle * (Mathf.PI / 180);
		var aimCharge = targetScript.GetAimCharge();
		
		// make the crosshair follow the target
		var chargedDistance = distance + aimCharge;
		this.transform.position = targetScript.GetCarryingPosition() + (targetScript.GetPlayerDirection() * target.forward * chargedDistance * Mathf.Cos(aimAngleRads)) + (target.up * chargedDistance * Mathf.Sin(aimAngleRads));
		
		// set the crosshair's size according to the charge of the aim
		this.transform.localScale = Vector3.one * (aimCharge * scale);
		
		// set the crosshair to be visible
		if (!this.renderer.enabled) {
			this.renderer.enabled = true;
		}
	
	} else {
		
		// set the crosshair to be invisible
		if (this.renderer.enabled) {
			this.renderer.enabled = false;
		}
		
	}
	
}