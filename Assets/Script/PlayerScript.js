#pragma strict

/***********/
/* GLOBALS */
/***********/

// states
private var listening: boolean = true;
private var climbing: boolean = false;
private var nearbyClimbables: int = 0; //TODO make ladder prefabs with a single trigger collider so that this variable is no longer necessary
private var carrying: Rigidbody;

// speeds
public var maxSpeed: float = 7.5;
public var jumpSpeed: float = 7.5;
public var rotationSpeed: float = 15; //WARNING must equally divide 90 degrees
public var climbSpeed: float = 5;
public var throwSpeed: float = 10;
public var accelerationSpeed: float = 40;

// mechanics
private var direction: int;
private var directionMargin: float = 0.8;
private var verticalBounds: float;
private var crossroads: Collider = null;
private var trackAxis: int;
private var trackPosition: float;
private var trackAdjuster: Collider = null;
private var groundedMargin: float = 0.1;

// item slots
private var primaryItem: Rigidbody;
private var secondaryItem: Rigidbody;

// aiming
private var aimAngle: float = 45;
private var minAimCharge: float = 0.2;
private var aimCharge: float = minAimCharge;
private var aimChargeDuration = 1;

// items
public var bomb: Rigidbody;

// audio
public var vocalTrack: AudioSource;
public var cameraTrack: AudioSource;
public var cameraSwoop: AudioClip;
public var playerJump: AudioClip;
public var playerThrow: AudioClip;


/*************/
/* CONSTANTS */
/*************/

// direction constants
private static var LEFT = -1;
private static var RIGHT = 1;
private static var NORTH = 0;
private static var EAST = 1;
private static var SOUTH = 2;
private static var WEST = 3;
private static var X_AXIS = 0;
private static var Z_AXIS = 1;
private static var CLOCKWISE = -1;
private static var COUNTERCLOCKWISE = 1;

// controller constants
private static var BUTTON_JUMP = 'A';
private static var BUTTON_RUN = 'Left Stick Button';
private static var BUTTON_ITEM_PRIMARY = 'X';
private static var BUTTON_ITEM_SECONDARY = 'Y';
private static var BUTTON_CONTEXT = 'B';
private static var AXIS_WALK = 'Left Stick Horizontal';
private static var AXIS_AIM = 'Left Stick Vertical';
private static var AXIS_CLIMB = 'Left Stick Vertical';
private static var AXIS_TURN = 'Right Stick Horizontal';
private static var BUTTON_TURN_RIGHT = 'Right Button';
private static var BUTTON_TURN_LEFT = 'Left Button';
private static var AXIS_CAMERA = 'Right Stick Vertical';
private static var BUTTON_MENU = 'Start';
private static var BUTTON_INVENTORY = 'Back';

// debug controller constants
private static var DEBUG_HEALTH_INCREMENT = 'Num Add';
private static var DEBUG_HEALTH_DECREMENT = 'Num Subtract';
private static var DEBUG_TIME_DOUBLE = 'Num Multiply';
private static var DEBUG_TIME_HALF = 'Num Divide';


/***************/
/* CONSTRUCTOR */
/***************/

function Start() {
	
	// get distance to ground for use in raycasting
	verticalBounds = this.collider.bounds.extents.y;
	
	// get axis and position of the current track for use in locking position components
	SetTrack();
	
	// set the direction
	direction = RIGHT;
	
	//DEBUG set the primary item for lack of a method to do so
	primaryItem = bomb;
	
}

/**********/
/* LOOPER */
/**********/

function Update() {
	
	// get player input
	CheckInput();
	CheckDebugInput();
	
	// keep player on track
	Align();
	
	// drag along carried object
	Carry();
	
}


/**********************/
/* DEALING WITH INPUT */
/**********************/

// makes the player start listening
function StartListening() {
	listening = true;
}

// makes the player stop listening
function StopListening() {
	listening = false;
}

// respond to input
function CheckInput() {
	
	// player actions
	if (IsListening()) {
		if (Input.GetAxis(AXIS_WALK)) {
			Move(Input.GetAxis(AXIS_WALK));
		}
		if (Input.GetAxis(AXIS_CLIMB)) {
			Climb(Input.GetAxis(AXIS_CLIMB));
		}
		if (Input.GetAxis(AXIS_AIM)) {
			AdjustAim(Input.GetAxis(AXIS_AIM));
		}
		if (Input.GetButtonDown(BUTTON_JUMP)) {
			Jump();
		}
		if (Input.GetButtonDown(BUTTON_ITEM_PRIMARY)) {
			ItemPress(primaryItem);
		}
		if (Input.GetButton(BUTTON_ITEM_PRIMARY)) {
			ItemHold(primaryItem);
		}
		if (Input.GetButtonUp(BUTTON_ITEM_PRIMARY)) {
			ItemRelease(primaryItem);
		}
		if (Input.GetButtonDown(BUTTON_ITEM_SECONDARY)) {
			ItemPress(secondaryItem);
		}
		if (Input.GetButton(BUTTON_ITEM_SECONDARY)) {
			ItemHold(secondaryItem);
		}
		if (Input.GetButtonUp(BUTTON_ITEM_SECONDARY)) {
			ItemRelease(secondaryItem);
		}
		if (Input.GetButtonDown(BUTTON_TURN_RIGHT)) {
			Turn(CLOCKWISE);
		}
		if (Input.GetButtonDown(BUTTON_TURN_LEFT)) {
			Turn(COUNTERCLOCKWISE);
		}
	}
	
	// game status
	if (Input.GetButtonDown(BUTTON_MENU)) {
		Application.Quit();
	}
}

// respond to input that is intended for debugging purposes
function CheckDebugInput() {
	if (Input.GetButtonDown(DEBUG_HEALTH_INCREMENT)) {
		GetComponent(HealthScript).InstantHeal(1);
	}
	if (Input.GetButtonDown(DEBUG_HEALTH_DECREMENT)) {
		GetComponent(HealthScript).InstantDamage(1);
	}
	if (Input.GetButtonDown(DEBUG_TIME_DOUBLE)) {
		Time.timeScale *= 2;
	}
	if (Input.GetButtonDown(DEBUG_TIME_HALF)) {
		Time.timeScale /= 2;
	}
}


/******************/
/* TRIGGER EVENTS */
/******************/

// trigger enter events
//TODO abstract so that no switch statement is used
function OnTriggerEnter(trigger: Collider) {
	switch (trigger.tag) {
	case 'Crossroads':
		crossroads = trigger;
		break;
	case 'Track Adjuster':
		if (!IsParallel(trigger.transform)) {
			trackAdjuster = trigger;
		}
		break;
	case 'Button':
		var button: ButtonScript = trigger.GetComponent(ButtonScript);
		button.Activate();
		break;
	case 'Ladder':
		nearbyClimbables++;
		break;
	}
}

// trigger exit events
//TODO abstract so that no switch statement is used
function OnTriggerExit(trigger: Collider) {
	switch (trigger.tag) {
	case 'Crossroads':
		crossroads = null;
		break;
	case 'Ladder':
		if (nearbyClimbables > 0) {
			nearbyClimbables--;
		}
		if (nearbyClimbables == 0) {
			StopClimbing();
		}
		break;
	}
}


/******************/
/* BASIC MOVEMENT */
/******************/

// returns whether the player can currently be controlled
function IsListening(): boolean {
	return listening;
}

// returns true if a raycast to the 'feet' of the player did not hit anything
//BUG use capsulecast for more accuracy and add a layermask to ignore trigger objects
function IsGrounded(): boolean {
	return Physics.Raycast(transform.position, Vector3.down, verticalBounds + groundedMargin);
}

// returns whether the player is holding the run button
function IsRunning(): boolean {
	return Input.GetButton(BUTTON_RUN);
}

// moves the player horizontally
function Move(movement: float) {

	// update the direction
	if (movement > directionMargin) {
		direction = RIGHT;
	} else if (movement < -directionMargin) {
		direction = LEFT;
	}
	
	// move the player
	//TODO the way it works now, when you just release the run button while running, 'braking' by pressing the opposite direction won't work until the velocity has reduced to less than the maximum. Instead of doing this, separate left and right velocity and set a 'minimum' (negative maximum) on the left direction. this way you can still brake.
	var runningFactor: float = IsRunning() ? 1.5 : 1;
	var groundedFactor: float = IsGrounded() ? 1 : 0.75;
	var acceleration =  movement * Time.deltaTime * accelerationSpeed * groundedFactor * Mathf.Max(0, 1 - rigidbody.velocity.magnitude / (maxSpeed * runningFactor));
	rigidbody.velocity += transform.forward * acceleration;
}

// makes the player jump if it is on the ground
function Jump() {
	if (IsGrounded()) {
		rigidbody.velocity.y += jumpSpeed;
		vocalTrack.PlayOneShot(playerJump);
	}
}

// returns whether the player is moving to the left or to the right (from the camera's perspective)
function GetDirection() {
	return direction;
}


/************
 * CLIMBING *
 ************/

// returns whther or not the player is near something that is climbable
function CanClimb(): boolean {
	return nearbyClimbables > 0;
}

// makes the player start climbing
function StartClimbing() {
	if (CanClimb()) {
		climbing = true;
		rigidbody.useGravity = false;
		//TODO turn the player to face the ladder if it isn't yet
		//TODO turn the camera to be behind the player (so that it is also facing the ladder) if it isn't yet
	}
}

// returns whether the player is climbing
function IsClimbing(): boolean {
	return climbing;
}

// makes the player climb
function Climb(movement: float) {
	if (!IsClimbing()) {
		StartClimbing();
	} else {
		transform.Translate(Vector3(0, movement * climbSpeed * Time.deltaTime, 0));
	}
}

// makes the player stop climbing
function StopClimbing() {
	climbing = false;
	rigidbody.useGravity = true;
}

// forces the player to move to the terrain that the ladder leads to
function FinishClimbing() {
	//TODO make player step forward
	StopClimbing();
	//TODO move the camera so that it is perpendicular to the player as usual
}


/******************************/
/* TRACKS AND STAYING ON THEM */
/******************************/

// returns true if a transform is facing the x axis (in either direction)
function GetAxis(trans: Transform): int {
	var direction = GetDirection(trans);
	return (direction == NORTH || direction == SOUTH) ? Z_AXIS : X_AXIS;
}

// returns the wind-direction the provided transform is facing, or -1 on failure
function GetDirection(trans: Transform): int {
	var threshold = 0.001;
	if (Mathf.Abs(trans.localEulerAngles.y - 0) < threshold) return NORTH;
	else if (Mathf.Abs(trans.localEulerAngles.y - 90) < threshold) return EAST;
	else if (Mathf.Abs(trans.localEulerAngles.y - 180) < threshold) return SOUTH;
	else if (Mathf.Abs(trans.localEulerAngles.y - 270) < threshold) return WEST;
	else return -1;
}

// defines the current track
function SetTrack() {
	trackAxis = GetAxis(this.transform);
	trackPosition = (GetTrackAxis() == X_AXIS) ? this.transform.position.z : this.transform.position.x;
}

// determines the axis of the current track
//WARNING assumes that the player is on the track
function GetTrackAxis(): int {
	return trackAxis;
}

// determines the position of the current track
//WARNING assumes that the player is on the track
function GetTrackPosition(): float {
	return trackPosition;
}

// returns true if the player parallels the provided transform
function IsParallel(trans: Transform): boolean {
	return (GetAxis(this.transform) == GetAxis(trans));
}

// keeps the player on track
function Align() {
	
	// round y rotation
	transform.localEulerAngles.y = Mathf.RoundToInt(transform.localEulerAngles.y);
	
	// correct movement perpendicular to the track
	if (GetTrackAxis() == X_AXIS) {
		this.transform.position.z = GetTrackPosition();
	} else {
		this.transform.position.x = GetTrackPosition();
	}
	
	// adjust the direction of the player if necessary
	if (trackAdjuster != null && (IsGrounded() || (IsClimbing() && transform.position.y >= trackAdjuster.transform.position.y))) {
		CrossRoads(CLOCKWISE, trackAdjuster.transform);
		trackAdjuster = null;
	}
	
}


/******************
 * TURNING AROUND *
 ******************/

// returns whether the player is currently on a crossroads
function OnCrossroads(): boolean {
	return crossroads != null;
}

// turns the player around either 90 degrees or 180 degrees depending on the prescence of a crossroads
function Turn(direction: int) {
	if (IsGrounded()) {
		rigidbody.velocity.x = 0;
		rigidbody.velocity.z = 0;
		if (OnCrossroads()) {
			CrossRoads(direction, crossroads.transform);
		} else {
			UTurn(direction);
		}
	}
}

// rotates the player 180 degrees along the y-axis
function UTurn(clockDirection: int) {
		
	// prepare
	StopListening();
	var iterations: int = 180 / rotationSpeed;
	cameraTrack.pitch = 1 - ((clockDirection == CLOCKWISE) ? 0.1 : 0) - (0.1 * Random.value);
	cameraTrack.PlayOneShot(cameraSwoop);
	cameraTrack.pitch = 1;
	
	// rotate
	for (var i = 0; i < iterations; i++) {
		transform.localEulerAngles.y += rotationSpeed * clockDirection;
		yield;
	}
	
	// finalize
	StartListening();
}

// rotates the player 90 degrees along the y-axis
// also translates the player to the provided track marker to prevent derailing
function CrossRoads(clockDirection: int, track: Transform) {
	
	// prepare
	StopListening();
	var iterations: int = 90 / rotationSpeed;
	var xStep = (track.position.x - transform.position.x) / iterations;
	var zStep = (track.position.z - transform.position.z) / iterations;
	cameraTrack.pitch = 1 + ((clockDirection == CLOCKWISE) ? 0.1 : 0) + (0.1 * Random.value);
	cameraTrack.PlayOneShot(cameraSwoop);
	cameraTrack.pitch = 1;
	
	// rotate and translate
	for (var i = 0; i < iterations; i++) {
		transform.localEulerAngles.y += rotationSpeed * clockDirection;
		transform.position.x += xStep;
		transform.position.z += zStep;
		yield;
	}
	
	// finalize
	SetTrack();
	StartListening();
}


/***************
 * USING ITEMS *
 ***************/
//WARNING this is just a test example using bombs
//TODO move the three item functions to each item's main script

function ItemPress(item: Rigidbody) {
	if (!IsCarrying()) {
		var bombInstance = Instantiate(item, transform.position + Vector3.up, Quaternion.identity);
		PickUp(bombInstance);
	}
}

function ItemHold(item: Rigidbody) {
	ChargeThrow();
}

function ItemRelease(item: Rigidbody) {
	Throw();
}


/*************************
 * CARRYING AND DROPPING *
 *************************/

// pick up an object
function PickUp(object: Rigidbody) {
	carrying = object;
}

// drags along carried object
function Carry() {
	if (IsCarrying()) {
		carrying.transform.position = GetCarryingPosition();
		carrying.velocity = rigidbody.velocity;
	}
}

// returns whether the player is carrying something
function IsCarrying(): boolean {
	return carrying != null;
}

// returns the position at which the player carries an object
function GetCarryingPosition(): Vector3 {
	var carryingPosition = this.transform.up;
	return this.transform.position + carryingPosition;
}

// drops the object currently being carried
function Drop() {
	carrying = null;
	//TODO position the carried object on the dropPosition
}

// returns the position at which the player carries an object
function GetDropPosition(): Vector3 {
	var dropPosition = this.transform.forward;
	return this.transform.position + dropPosition;
}


/***********************
 * AIMING AND THROWING *
 ***********************/

// checks whether the player can aim
function CanAim() {
	return IsListening() && !IsClimbing();
}

// adjusts the aim of the player and updates the crosshair accordingly
function AdjustAim(movement: float) {
	if (CanAim()) {
		aimAngle = Mathf.Max(0, Mathf.Min(aimAngle + movement * 5, 90));
	}
}

// returns the angle the player is currently aiming at
function GetAimAngle() {
	return aimAngle;
}

// charges throw
function ChargeThrow() {
	if (IsCarrying() && aimCharge < 1) {
		aimCharge = Mathf.Min(1, aimCharge + Time.deltaTime * (1 / aimChargeDuration));
	}
}

// returns the charge of the player's aim
function GetAimCharge() {
	return aimCharge;
}

// throws carried object
function Throw() {
	if (IsCarrying()) {
		var throwing = carrying;
		carrying = null;
		var aimAngleRads = aimAngle * (Mathf.PI / 180);
		throwing.velocity = 
			this.rigidbody.velocity + 
			(GetDirection() * aimCharge * throwSpeed * transform.forward * Mathf.Cos(aimAngleRads)) + 
			(aimCharge * throwSpeed * transform.up * Mathf.Sin(aimAngleRads));
		vocalTrack.PlayOneShot(playerThrow);
	}
	aimCharge = minAimCharge;
}