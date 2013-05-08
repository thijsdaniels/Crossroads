#pragma strict

var fuseLength: float = 5;
var explosion: Transform;
var explosionGround: Transform;
private var verticalBounds: float;
private var groundedMargin: float = 0.1;

function Start () {
	verticalBounds = collider.bounds.extents.y;
}

function Update () {

	// decrease fuse length
	fuseLength -= Time.deltaTime;
	audio.pitch += Time.deltaTime / 10;
	
	// explode when fuse has run out
	if (fuseLength <= 0) {
		Explode();
	}
	
}

function IsGrounded() {
	return Physics.Raycast(transform.position, Vector3.down, verticalBounds + groundedMargin);
}

function Explode() {
	
	// explosion animation
	if (IsGrounded()) {
		Instantiate(explosionGround, this.transform.position + Vector3.down * (verticalBounds - groundedMargin), Quaternion.Euler(90,0,0));
	} else {
		Instantiate(explosion, this.transform.position, Quaternion.Euler(90,0,0));
	}
	
	// explosion parameters
	var position: Vector3 = transform.position;
	var damage: float = 1;
	var force: float = 5000;
	var radius: float = 5;
	var upward: float = 0;
	
	// loop over victims
	var colliders: Collider[] = Physics.OverlapSphere (position, radius);
	for (var hit: Collider in colliders) {
		if (!hit) continue;
		if (hit.rigidbody) {
			hit.rigidbody.AddExplosionForce(force, position, radius, upward);
		}
		//TODO if the hit collider has health, decrease it by [damage] amount
	}
	
	// destroy the bomb
	Destroy(this.gameObject);

}