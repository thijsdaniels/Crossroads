#pragma strict

private var surface: float;

function Start () {
	surface = transform.position.y + transform.localScale.y / 2;
}

function Update () {
}

function OnTriggerStay(other: Collider) {

	var playerScript: PlayerScript = other.gameObject.GetComponent(PlayerScript);

	if (other.gameObject.rigidbody) {

		// control drag
		if (other.gameObject.rigidbody.drag != 2) other.gameObject.rigidbody.drag = 2;
		if (other.gameObject.rigidbody.angularDrag != 1) other.gameObject.rigidbody.angularDrag = 1;

		// control player state
		if (playerScript && !playerScript.IsSwimming()) playerScript.SetSwimming(true);

		// control bouyancy
		var offset: float = other.gameObject.renderer.bounds.size.y * 0.25;
		var bouyancy: float = (playerScript && playerScript.CanDive()) ? 0 : 1;
		
		var depth: float = surface - (other.gameObject.transform.position.y + offset);
		var depthFactor: float = Mathf.Min(2, depth);
		var bouyancyFactor: float = bouyancy / other.rigidbody.mass;

		var uplift = 1 + bouyancyFactor * depthFactor;
		other.gameObject.rigidbody.AddForce(uplift * -Physics.gravity);
	}
}

function OnTriggerExit(other: Collider) {

	if (other.gameObject.rigidbody) {
		other.gameObject.rigidbody.drag = 0;
		other.gameObject.rigidbody.angularDrag = 0.05;
	}

	var playerScript: PlayerScript = other.gameObject.GetComponent(PlayerScript);
	if (playerScript) {
		playerScript.SetSwimming(false);
	}
}