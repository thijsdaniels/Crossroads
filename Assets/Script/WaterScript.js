#pragma strict

private var surface: float;

function Start () {
	surface = transform.position.y + transform.localScale.y / 2;
}

function Update () {
}

function OnTriggerStay(other: Collider) {
	
	var playerScript: PlayerScript = other.gameObject.GetComponent(PlayerScript);
	var floatScript: FloatScript = other.gameObject.GetComponent(FloatScript);

	var offset = floatScript ? floatScript.GetOffset() : Vector3.zero;

	if (InsideTrigger(other.gameObject.transform.position + offset)) {

		if (other.gameObject.rigidbody) {

			// control drag
			other.gameObject.rigidbody.drag = 4;
			other.gameObject.rigidbody.angularDrag = 1;

			// control player state
			if (playerScript && !playerScript.IsSwimming()) playerScript.SetSwimming(true);

			// keep rigidbody afloat
			var bouyancy: float = (playerScript && playerScript.IsDiving()) ? 0 : (floatScript ? floatScript.GetBuoyancy() : 1); // @todo get the actual bouyancy from somewhere
			var depth: float = surface - (other.gameObject.transform.position.y + offset.y);
			var depthFactor: float = Mathf.Min(2, depth);
			var uplift = 1 + bouyancy * depthFactor;
			other.gameObject.rigidbody.AddForce(uplift * -Physics.gravity);
		}

	} else {

		if (other.gameObject.rigidbody) {

			// control drag
			other.gameObject.rigidbody.drag = 0;
			other.gameObject.rigidbody.angularDrag = 0.05;

			// control player state
			if (playerScript) {
				playerScript.SetSwimming(false);
			}
		}
	}
}

function InsideTrigger(pos: Vector3) {

	if (pos.x < collider.bounds.min.x || pos.x >= collider.bounds.max.x) return false;
	if (pos.y < collider.bounds.min.y || pos.y >= collider.bounds.max.y) return false;
	if (pos.z < collider.bounds.min.z || pos.z >= collider.bounds.max.z) return false;
	return true;
}