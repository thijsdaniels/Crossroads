#pragma strict

public var damage: int = 6;
public var force: float = 50;
public var radius: float = 5;
public var fuseLength: float = 2;
public var explosion: Transform;
public var explosionGround: Transform;

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
	
	// loop over victims
	var colliders: Collider[] = Physics.OverlapSphere (this.transform.position, radius);
	for (var hit: Collider in colliders) {
		
		// this is some null check that was recommended by Unity, but I don't really understand its purpose: how can hit be false at this point?
		if (!hit) continue;
		
		// if the collider has a rigidbody, apply a blastforce
		if (hit.rigidbody) {
			hit.rigidbody.AddExplosionForce(force, this.transform.position, radius, 0.5);
		}
		
		// if the collider has health, inflict damage to it
		var healthScript: HealthScript = hit.transform.gameObject.GetComponent(HealthScript);
		if (healthScript != null) {
			healthScript.InstantDamage(damage);
		}

		// if the collider is a bombable block, destroy it
		var blockScript: BlockScript = hit.transform.gameObject.GetComponent(BlockScript);
		if (blockScript != null) {
			blockScript.GetBombed(damage);
		}
		
	}
	
	// destroy the bomb
	Destroy(this.gameObject);

}