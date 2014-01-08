#pragma strict

public var splash: Transform;
public final static var SURFACE_LAYER = 12;

function Start () {
}

function Update () {
}

function OnTriggerStay(other: Collider) {

	var playerScript: PlayerScript = other.gameObject.GetComponent(PlayerScript);
	var floatScript: FloatScript = other.gameObject.GetComponent(FloatScript);

	var offset = floatScript ? floatScript.GetOffset() : Vector3.zero;

	var hit: RaycastHit;
	var mask: LayerMask = ~((1 << 1) | (1 << 2) | (1 << 3) | (1 << 4) | (1 << 5) | (1 << 6) | (1 << 7) | (1 << 8) | (1 << 9) | (1 << 10) | (1 << 11));
	var depth: float;
	if (Physics.Raycast(other.transform.position + offset, Vector3.up, hit, Mathf.Infinity, mask)) {
		depth = hit.distance;
	} else {
		depth = Mathf.Infinity;
	}

	if (InsideTrigger(other.gameObject.transform.position + offset)) {

		if (other.gameObject.rigidbody) {

			// control drag
			other.gameObject.rigidbody.drag = 4;
			other.gameObject.rigidbody.angularDrag = 1;

			// control player state
			if (playerScript && !playerScript.IsSwimming()) {
				playerScript.SetSwimming(true);
				//Instantiate(splash, other.transform.position, Quaternion.Euler(90, 0, 0));
			}

			// keep rigidbody afloat
			var bouyancy: float = (playerScript && playerScript.IsDiving()) ? 0 : (floatScript ? floatScript.GetBuoyancy() : 1);
			var depthFactor: float = Mathf.Min(2, depth);
			var uplift: float = 1 + bouyancy * depthFactor;

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
				//Instantiate(splash, other.transform.position, Quaternion.Euler(90, 0, 0));
			}
		}
	}
}

function InsideTrigger(pos: Vector3) {
	if (pos.x < collider.bounds.min.x || pos.x > collider.bounds.max.x) return false;
	if (pos.y < collider.bounds.min.y || pos.y > collider.bounds.max.y) return false;
	if (pos.z < collider.bounds.min.z || pos.z > collider.bounds.max.z) return false;
	return true;
}