#pragma strict

// globals
private var Listening: boolean = true;
var maxSpeed: float = 7;
var JumpSpeed: float = 10;
var RotationSpeed: int = 15; // [NB] must equally divide 90 degrees
private var VerticalBounds: float;
private var Crossroads: Collider = null;
private var TrackAlongX: boolean;
private var TrackPosition: float;
private var TrackAdjuster: Collider = null;
private var nearbyClimbables: int = 0;
var climbSpeed: float = 5;
private var isClimbing: boolean = false;
private var groundedMargin: float = 0.1;
var bomb: Rigidbody;
var bombCooldown: float = 1;
private var slotB: Rigidbody;
private var cooldownB: float = 0;
private var carrying: Rigidbody;
private var throwCharge: float = 0;
private var throwChargeDuration = 1;
private var throwSpeed = 10;

// audio
var Whoosh: AudioClip;

// constructor
function Awake() {
	
	// get distance to ground for use in raycasting
	VerticalBounds = collider.bounds.extents.y;
	
	// get axis and position of the current track for use in locking position components
	TrackAlongX = GetAxis(transform);
	TrackPosition = GetTrackPosition();
	
	// initialize item slots
	slotB = bomb;
	
}

// looper
function FixedUpdate() {
	
	// get player input
	CheckInput();
	
	// keep player on track
	Align();
	
	// progress cooldowns
	CoolDown();
	
	// drag along carried object
	Carry();
	
}

/* ================== *
 * DEALING WITH INPUT *
 * ================== */

// respond to input
function CheckInput() {
	
	// player movement
	if (Listening) {
		if (Input.GetAxis('Left Stick Horizontal')) {
			Move(Input.GetAxis('Left Stick Horizontal'));
		}
		if (Input.GetButtonDown('A')) {
			Jump();
		}
		if (Input.GetButtonDown('B')) {
			if (cooldownB <= 0) {
				Use(slotB);
				//TODO deal with cooldowns in the appropriate place
				cooldownB = bombCooldown;
			}
		}
		if (Input.GetButton('X')) {
			ChargeThrow();
		}
		if (Input.GetButtonUp('X')) {
			Throw();
		}
		if (Input.GetButtonDown('Right Button')) {
			Turn(true);
		}
		if (Input.GetButtonDown('Left Button')) {
			Turn(false);
		}
		if (Input.GetAxis('Left Stick Vertical')) {
			if (nearbyClimbables > 0) {
				isClimbing = true;
				rigidbody.useGravity = false;
				transform.Translate(Vector3(0, Input.GetAxis('Left Stick Vertical') * climbSpeed * Time.deltaTime, 0));
			}
		}
	}
	
	// game status
	if (Input.GetButtonDown('Start')) {
		Application.Quit();
	}
}

/* =============================== *
 * GROUNDING, MOVEMENT AND JUMPING *
 * =============================== */

// returns true if a raycast to the 'feet' of the player did not hit anything
// [BUG] use capsulecast for more accuracy and add a layermask to ignore trigger objects
function IsGrounded(): boolean {
	return Physics.Raycast(transform.position, Vector3.down, VerticalBounds + groundedMargin);
}

// returns whether the player is holding the run button
function IsRunning(): boolean {
	return Input.GetButton('X');
}

// moves the player horizontally
function Move(movement: float) {
	//TODO they way it works now, when you just release the run button while running,
	// 'braking' by pressing the opposite direction won't work until the velocity has
	// reduced to less than the maximum. Instead of doing this, separate left and right
	// velocity and set a 'minimum' (negative maximum) on the left direction. this way
 	// you can still brake.
	var running: float = IsRunning() ? 1.5 : 1;
	var grounded: float = IsGrounded() ? 1 : 0.75;
	var acceleration =  movement * Time.deltaTime * 40 * grounded * Mathf.Max(0, 1 - rigidbody.velocity.magnitude / (maxSpeed * running));
	rigidbody.velocity += transform.forward * acceleration;
}

// makes the player jump if it is on the ground
function Jump() {
	if (IsGrounded()) {
		rigidbody.velocity.y = JumpSpeed;
	}
}

/* ============================ *
 * TURNING AND STAYING ON TRACK *
 * ============================ */

// returns true if a transform is facing the x axis (in either direction)
function GetAxis(trans: Transform): boolean {
	var direction = GetDirection(trans);
	return (direction == 0 || direction == 2) ? false : true;
}

// returns the wind-direction the provided transform is facing
// 0 = N, 1 = E, 2 = S, 3 = W, -1 = somewhere in between directions
function GetDirection(trans: Transform): int {
	var threshold = 0.001;
	if (Mathf.Abs(trans.localEulerAngles.y - 0) < threshold) return 0;
	else if (Mathf.Abs(trans.localEulerAngles.y - 90) < threshold) return 1;
	else if (Mathf.Abs(trans.localEulerAngles.y - 180) < threshold) return 2;
	else if (Mathf.Abs(trans.localEulerAngles.y - 270) < threshold) return 3;
	else return -1;
}

// returns the position of the player on the axis parallel to the track
// [NB] this function assumes that the player is on the track
function GetTrackPosition(): float {
	return (TrackAlongX) ? transform.position.z : transform.position.x;
}

// makes the player turn along  the y-axis
function Turn(Direction: boolean) {
	if (IsGrounded()) {
		rigidbody.velocity.x = 0;
		rigidbody.velocity.z = 0;
		if (Crossroads != null) {
			Rotate90(Direction, Crossroads.transform);
		} else {
			Rotate180(Direction);
		}
	}
}

// rotates the player 180 degrees along the y-axis
function Rotate180(IsClockwise: boolean) {
		
	// prepare
	Listening = false;
	var Direction: int = IsClockwise ? -1 : 1;
	var LoopLength: int = 180 / RotationSpeed;
	audio.pitch = 0.9 - (0.1 * Random.value);
	audio.pitch = 1 - ((Direction == 1) ? 0.1 : 0) - (0.1 * Random.value);
	audio.PlayOneShot(Whoosh);
	
	// rotate
	for (var i = 0; i < LoopLength; i++) {
		transform.localEulerAngles.y += RotationSpeed * Direction;
		yield;
	}
	
	// finalize
	Listening = true;
}

// rotates the player 90 degrees along the y-axis
// also translates the player to the provided track marker to prevent derailing
function Rotate90(IsClockwise: boolean, Track: Transform) {
	
	// prepare
	Listening = false;
	var Direction: int = IsClockwise ? -1 : 1;
	var LoopLength: int = 90 / RotationSpeed;
	var XStep = (Track.position.x - transform.position.x) / LoopLength;
	var ZStep = (Track.position.z - transform.position.z) / LoopLength;
	audio.pitch = 1 + ((Direction == -1) ? 0.1 : 0) + (0.1 * Random.value);
	audio.PlayOneShot(Whoosh);
	
	// rotate and translate
	for (var i = 0; i < LoopLength; i++) {
		transform.localEulerAngles.y += RotationSpeed * Direction;
		transform.position.x += XStep;
		transform.position.z += ZStep;
		yield;
	}
	
	// finalize
	TrackAlongX = !TrackAlongX;
	TrackPosition = GetTrackPosition();
	Listening = true;
}

// trigger enter events
// [TODO] abstract so that no switch statement is used
function OnTriggerEnter(trigger: Collider) {
	switch (trigger.tag) {
	case 'Crossroads':
		Crossroads = trigger;
		break;
	case 'Track Adjuster':
		if (!Parallel(trigger.transform)) {
			TrackAdjuster = trigger;
		}
		break;
	case 'Button':
		var button: ButtonScript = trigger.GetComponent(ButtonScript);
		button.OnPush();
		break;
	case 'Ladder':
		nearbyClimbables++;
		break;
	}
}

// trigger exit events
// [TODO] abstract so that no switch statement is used
function OnTriggerExit(trigger: Collider) {
	switch (trigger.tag) {
	case 'Crossroads':
		Crossroads = null;
		break;
	case 'Ladder':
		if (nearbyClimbables > 0) {
			nearbyClimbables--;
		}
		if (nearbyClimbables == 0) {
			isClimbing = false;
			rigidbody.useGravity = true;
		}
		break;
	}
}

// returns true if the player parallels the provided transform
function Parallel(trans: Transform): boolean {
	return (GetAxis(transform) == GetAxis(trans));
}

// keeps the player on track
function Align() {
	
	// round y rotation
	transform.localEulerAngles.y = Mathf.RoundToInt(transform.localEulerAngles.y);
	
	// correct movement perpendicular to the track
	if (TrackAlongX) {
		transform.position.z = TrackPosition;
	} else {
		transform.position.x = TrackPosition;
	}
	
	// adjust the direction of the player if necessary
	if (TrackAdjuster != null && (IsGrounded() || (isClimbing && transform.position.y >= TrackAdjuster.transform.position.y))) {
		Rotate90(true, TrackAdjuster.transform);
		TrackAdjuster = null;
	}
	
}

/* ============================ *
 * ITEMS, CARRYING AND THROWING *
 * ============================ */

// uses an item
function Use(item: Rigidbody) {
	switch (item) {
		case bomb:
			if (carrying == null) {
				var bombInstance = Instantiate(item, transform.position + Vector3.up, Quaternion.identity);
				PickUp(bombInstance);
			}
			break;
	}
}

// pick up an object
function PickUp(object: Rigidbody) {
	carrying = object;
}

// drags along carried object
function Carry() {
	if (carrying != null) {
		carrying.transform.position = transform.position + Vector3.up;
		carrying.velocity = rigidbody.velocity;
	}
}

// charges throw
function ChargeThrow() {
	if (throwCharge < 1) {
		throwCharge = Mathf.Min(1, throwCharge + Time.deltaTime * (1 / throwChargeDuration));
	}
}

// throws carried object
function Throw() {
	if (carrying != null) {
		var throwing = carrying;
		carrying = null;
		throwing.velocity = (transform.forward * Mathf.Min(1, 1 - Input.GetAxis('Left Stick Vertical')) * throwCharge * throwSpeed) + (Vector3.up * Mathf.Max(0, Input.GetAxis('Left Stick Vertical')) * throwCharge * throwSpeed);
		throwCharge = 0;
	}
}

// progresses cooldowns
function CoolDown() {
	if (cooldownB > 0) {
		cooldownB -= Time.deltaTime;
	}
}