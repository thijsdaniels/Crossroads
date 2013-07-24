#pragma strict

// mechanincs
public var boyancy: float;
public var water: Transform;
public var waterDrag: float;
private var landDrag: float;
public var floatOffset: Vector3;
public var floatMargin: float = 2;

// states
private var swimming: boolean = false;
private var floating: boolean = false;
private var diving: boolean = false;


function Start () {
	landDrag = rigidbody.drag;
}

function Update () {

}

function FixedUpdate () {
	
	// calculate the force of the boyancy
	var boyancyPoint: Vector3 = transform.position + transform.TransformDirection(floatOffset);
	var forceFactor: float = 1f - ((boyancyPoint.y - water.position.y));
	
	if (forceFactor > 0) {
		StartSwimming();
	
		if (!diving) {
			Float(boyancyPoint, forceFactor);
		}
		
	} else {
		StopSwimming();
		
	}

}

function StartSwimming() {
	if (!swimming) {
		swimming = true;
		rigidbody.drag = waterDrag;
	}
}

function StopSwimming() {
	if (swimming) {
		swimming = false;
		rigidbody.drag = landDrag;
	}
}

function Float(boyancyPoint: Vector3, forceFactor: float) {

	// add a force to the rigidbody to make it float
	var uplift = -Physics.gravity * forceFactor * rigidbody.mass * boyancy;
	this.rigidbody.AddForceAtPosition(uplift, boyancyPoint);
	
	// determine whether the player is floating (i.e. the forces of gravity and uplift are in equilibrium)
	if (Mathf.Abs(Physics.gravity.y * rigidbody.mass + uplift.y) < floatMargin * rigidbody.mass) {
		floating = true;
	} else {
		floating = false;
	}
}

function IsSwimming(): boolean {
	return swimming;
}

function IsFloating(): boolean {
	return floating;
}

function IsDiving(): boolean {
	return diving;
}