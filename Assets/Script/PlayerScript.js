#pragma strict

///////////////////////////////
////////// CONSTANTS //////////
///////////////////////////////

// direction
private static var LEFT = -1;
private static var RIGHT = 1;

// controller constants
private static var BUTTON_JUMP = 'A';
public static var BUTTON_TALK = 'A';
private static var BUTTON_RUN = 'Left Stick Button';
public static var BUTTON_ITEM_PRIMARY = 'X';
public static var BUTTON_ITEM_SECONDARY = 'Y';
private static var BUTTON_CONTEXT = 'B';
private static var AXIS_WALK = 'Left Stick Horizontal';
private static var AXIS_AIM = 'Left Stick Vertical';
private static var AXIS_CLIMB = 'Left Stick Vertical';
private static var AXIS_TURN = 'Right Stick Horizontal';
private static var BUTTON_TURN_RIGHT = 'Right Button';
private static var BUTTON_TURN_LEFT = 'Left Button';
private static var AXIS_CAMERA = 'Right Stick Vertical';
private static var BUTTON_MENU = 'Start';
public static var BUTTON_INVENTORY = 'Back';
public static var AXIS_RESERVE_VERTICAL = 'D-Pad Vertical';
public static var AXIS_RESERVE_HORIZONTAL = 'D-Pad Horizontal';

// debug controller constants
private static var DEBUG_HEALTH_INCREMENT = 'Num Add';
private static var DEBUG_HEALTH_DECREMENT = 'Num Subtract';
private static var DEBUG_TIME_DOUBLE = 'Num Multiply';
private static var DEBUG_TIME_HALF = 'Num Divide';


///////////////////////////////
/////////// GLOBALS ///////////
///////////////////////////////

// states
public static var listening: boolean = true;
private var climbing: boolean = false;
private var nearbyClimbables: int = 0; //TODO make ladder prefabs with a single trigger collider so that this variable is no longer necessary
private var carrying: GameObject;
private var swimming: boolean = false;
private var swimScript: SwimScript;

// speeds
public var maxSpeed: float = 8;
public var jumpForce: float = 400;
public var rotationSpeed: float = 15; //WARNING must equally divide 90 degrees
public var climbSpeed: float = 5;
public var accelerationSpeed: float = 40;

// land mechanics
private var direction: int;
private var directionMargin: float = 0;
private var verticalBounds: float;
private var crossroads: Collider = null;
private var trackAxis: int;
private var trackPosition: int;
private var trackAdjuster: Collider = null;
private var groundedMargin: float = 0.1;

// context action
private var contextName: String = 'none';
private var contextAction: Function;
private var contextObject: GameObject;

// item slots
public var primaryItem: Item;
public var secondaryItem: Item;
public var firstReserve: Item;
public var secondReserve: Item;
public var thirdReserve: Item;
public var fourthReserve: Item;

// aiming
private var aimAngle: float = 45;
private var minAimCharge: float = 0.2;
private var aimCharge: float = minAimCharge;
private var aimChargeDuration = 1;

// inventory
public var inventory: GameObject;
private var inventoryScript: InventoryScript;

// audio
public var vocalTrack: AudioSource;
public var cameraTrack: AudioSource;
public var cameraSwoop: AudioClip;
public var playerJump: AudioClip;
public var playerThrow: AudioClip;

// notice
private var notice: GameObject;


///////////////////////////////
///////// CONSTRUCTOR /////////
///////////////////////////////

function Start() {
	
	// get distance to ground for use in raycasting
	verticalBounds = this.collider.bounds.extents.y;
	
	// initialize the track, based on the player's initial position
	var playerAxis = GetAxis(this.transform);
	var playerAxisPosition = GetAxisPosition(playerAxis, this.transform);
	SetTrack(playerAxis, playerAxisPosition);
	
	// hide the environment
	EnvironmentScript.Slice(GetTrackAxis(), GetTrackPosition(), EnvironmentScript.NORTH);
	
	// set the direction
	direction = RIGHT;
	
	// get a reference to the inventory
	inventoryScript = inventory.GetComponent(InventoryScript);
	
	// get a reference to the swimming script
	swimScript = gameObject.GetComponent(SwimScript);

	// get a reference to the notice object
	notice = GameObject.Find('Player/Notice').gameObject;
}


///////////////////////////////
///////// MAIN LOOPER /////////
///////////////////////////////

function Update() {
	
	// get player input
	CheckInput();
	CheckDebugInput();
	
	// keep player on track
	Align();
	
	// drag along carried object
	Carry();
	
}


//////////////////////////////
///// DEALING WITH INPUT /////
//////////////////////////////

// makes the player start listening
public static function StartListening() {
	listening = true;
}

// makes the player stop listening
public static function StopListening() {
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
			primaryItem.Press();
		}
		if (Input.GetButton(BUTTON_ITEM_PRIMARY)) {
			primaryItem.Hold();
		}
		if (Input.GetButtonUp(BUTTON_ITEM_PRIMARY)) {
			primaryItem.Release();
		}
		if (Input.GetButtonDown(BUTTON_ITEM_SECONDARY)) {
			secondaryItem.Press();
		}
		if (Input.GetButton(BUTTON_ITEM_SECONDARY)) {
			secondaryItem.Hold();
		}
		if (Input.GetButtonUp(BUTTON_ITEM_SECONDARY)) {
			secondaryItem.Release();
		}
		if (Input.GetButtonDown(BUTTON_CONTEXT)) {
			if (contextAction != null) contextAction(contextObject);
		}
		if (Input.GetButtonDown(BUTTON_TURN_RIGHT)) {
			Spin(EnvironmentScript.CLOCKWISE);
		}
		if (Input.GetButtonDown(BUTTON_TURN_LEFT)) {
			Spin(EnvironmentScript.COUNTERCLOCKWISE);
		}
		if (Input.GetAxis(AXIS_RESERVE_VERTICAL) > 0) {
			primaryItem = firstReserve;
		}
		if (Input.GetAxis(AXIS_RESERVE_VERTICAL) < 0) {
			primaryItem = thirdReserve;
		}
		if (Input.GetAxis(AXIS_RESERVE_HORIZONTAL) > 0) {
			primaryItem = secondReserve;
		}
		if (Input.GetAxis(AXIS_RESERVE_HORIZONTAL) < 0) {
			primaryItem = fourthReserve;
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


//////////////////////////////
/////// TRIGGER EVENTS ///////
//////////////////////////////

// trigger enter events
//TODO abstract so that no switch statement is used
function OnTriggerEnter(trigger: Collider) {
	switch (trigger.tag) {
	case 'Crossroads':
		crossroads = trigger;
		for (var child: Transform in notice.transform) {
			child.gameObject.renderer.enabled = true;
		}
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
		for (var child: Transform in notice.transform) {
			child.gameObject.renderer.enabled = false;
		}
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


//////////////////////////////
/////// BASIC MOVEMENT ///////
//////////////////////////////

// returns whether the player can currently be controlled
function IsListening(): boolean {
	return listening;
}

// returns true if a raycast to the 'feet' of the player did not hit anything
//BUG use capsulecast for more accuracy and add a layermask to ignore trigger objects
function IsGrounded(): boolean {
	return (GetFoundation() != null);
}

function GetFoundation(): GameObject {
	var raycastHit: RaycastHit;
	Physics.Raycast(transform.position, Vector3.down, raycastHit, verticalBounds + groundedMargin);
	return (raycastHit.collider) ? raycastHit.collider.gameObject : null;
}

// returns whether the player is holding the run button
function IsRunning(): boolean {
	return Input.GetButton(BUTTON_RUN);
}

// moves the player horizontally
function Move(movement: float) {

	// update the direction
	if (movement > directionMargin && direction == LEFT) {
		transform.eulerAngles.y += 180;
		direction = RIGHT;
	} else if (movement < -directionMargin && direction == RIGHT) {
		transform.eulerAngles.y += 180;
		direction = LEFT;
	}

	movement = Mathf.Abs(movement);
	
	// calculate the acceleration
	var Acc_groundedFactor: float = IsGrounded() ? 1 : 0.5;
	var acceleration: float =  movement * Time.deltaTime * accelerationSpeed * Acc_groundedFactor;

	// discard the acceleration if over the maximum
	var Max_runningMaxFactor: float = IsRunning() ? 1.5 : 1;
	var Max_groundedMaxFactor: float = IsGrounded() ? 1 : 0.75;
	var currentForwardVelocity: float = SumVector(Vector3.Scale(rigidbody.velocity, transform.forward));
	//if (movement > 0) {
		if (currentForwardVelocity + acceleration > (maxSpeed * Max_runningMaxFactor * Max_groundedMaxFactor)) {
			acceleration = 0;
		}
	//} else if (movement < 0) {
		//if (currentForwardVelocity - acceleration < (-maxSpeed * Max_runningMaxFactor * Max_groundedMaxFactor)) {
			//acceleration = 0;
		//}
	//}

	// accelerate the player
	rigidbody.AddForce(transform.forward * acceleration, ForceMode.VelocityChange);
}

// helper method that returns the sum of all components of a vector
function SumVector(vector: Vector3): float {
	return vector.x + vector.y + vector.z;
}

// makes the player jump if it is on the ground
function Jump() {
	if (IsGrounded() || swimScript.IsFloating()) {
		rigidbody.AddForce(Vector3.up * jumpForce * rigidbody.mass);
		vocalTrack.PlayOneShot(playerJump);
	}
}

// returns whether the player is moving to the left or to the right (from the camera's perspective)
function GetPlayerDirection() {
	return direction;
}


//////////////////////////////
////////// CLIMBING //////////
//////////////////////////////

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


//////////////////////////////
//// TRACKS AND ALIGNMENT ////
//////////////////////////////

// returns true if a transform is facing the x axis (in either direction)
//TODO move this to EnvironmentScript?
function GetAxis(trans: Transform): int {
	var direction = GetDirection(trans);
	return (direction == EnvironmentScript.NORTH || direction == EnvironmentScript.SOUTH) ? EnvironmentScript.Z_AXIS : EnvironmentScript.X_AXIS;
}

// returns the wind-direction the provided transform is facing, or -1 on failure
//TODO move this to EnvironmentScript?
function GetDirection(trans: Transform): int {
	var threshold = 0.001;
	if (Mathf.Abs(trans.localEulerAngles.y - 0) < threshold) return EnvironmentScript.NORTH;
	else if (Mathf.Abs(trans.localEulerAngles.y - 90) < threshold) return EnvironmentScript.EAST;
	else if (Mathf.Abs(trans.localEulerAngles.y - 180) < threshold) return EnvironmentScript.SOUTH;
	else if (Mathf.Abs(trans.localEulerAngles.y - 270) < threshold) return EnvironmentScript.WEST;
	else return -1;
}

// returns the axis perpendicular to the provided axis
//TODO move this to EnvironmentScript?
function GetPerpendicularAxis(axis: int) {
	return (axis == EnvironmentScript.X_AXIS) ? EnvironmentScript.Z_AXIS : EnvironmentScript.X_AXIS;
}

// returns the position of an axis on the perpendicular axis
//TODO move this to EnvironmentScript?
function GetAxisPosition(axis: int, trans: Transform): int {
	if (axis == EnvironmentScript.X_AXIS) return trans.position.z;
	else return trans.position.x;
}

// defines the current track
function SetTrack(axis: int, position: int) {
	trackAxis = axis;
	trackPosition = position;
}

// determines the axis of the current track
function GetTrackAxis(): int {
	return trackAxis;
}

// determines the position of the current track
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
	if (GetTrackAxis() == EnvironmentScript.X_AXIS) {
		this.transform.position.z = GetTrackPosition();
	} else {
		this.transform.position.x = GetTrackPosition();
	}
	
	// adjust the direction of the player if necessary
	if (trackAdjuster != null && (IsGrounded() || (IsClimbing() && transform.position.y >= trackAdjuster.transform.position.y))) {
		Turn(EnvironmentScript.CLOCKWISE, trackAdjuster.transform);
		trackAdjuster = null;
	}
	
}


//////////////////////////////
/////// TURNING AROUND ///////
//////////////////////////////

// returns whether the player is currently on a crossroads
function OnCrossroads(): boolean {
	return crossroads != null;
}

// turns the player around either 90 degrees or 180 degrees depending on the prescence of a crossroads
function Spin(direction: int) {

	// make sure conditions are met
	if (!IsListening()/* || !IsGrounded()*/) return;

	// store velocity and stop the player
	var velocity = rigidbody.velocity;
	rigidbody.velocity = Vector3.zero;

	// flip or turn
	if (OnCrossroads()) {
		Turn(direction, crossroads.transform);
	} else {
		Flip(direction);
	}

	// give the player its velocity back
	//TODO transform the velocity to the player's forward direction
	rigidbody.velocity = velocity;
}

// rotates the player 180 degrees along the y-axis
function Flip(clockDirection: int) {
		
	// prepare
	StopListening();
	var iterations: int = 180 / rotationSpeed;
	cameraTrack.pitch = 1 - ((clockDirection == EnvironmentScript.CLOCKWISE) ? 0.1 : 0) - (0.1 * Random.value);
	cameraTrack.PlayOneShot(cameraSwoop);
	cameraTrack.pitch = 1;
	var direction = Mathf.Repeat((GetPlayerDirection() - 1) + (GetDirection(this.transform) - 1) + 2, 4);
	EnvironmentScript.Slice(GetTrackAxis(), GetTrackPosition(), direction);
	
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
function Turn(clockDirection: int, track: Transform) {
	
	// prepare
	StopListening();
	cameraTrack.pitch = 1 + ((clockDirection == EnvironmentScript.CLOCKWISE) ? 0.1 : 0) + (0.1 * Random.value);
	cameraTrack.PlayOneShot(cameraSwoop);
	cameraTrack.pitch = 1;
	var newTrackAxis = GetPerpendicularAxis(GetTrackAxis());
	var newTrackPosition = GetAxisPosition(newTrackAxis, track);
	var direction = Mathf.Repeat((GetPlayerDirection() - 1) + (GetDirection(this.transform) - 1) + clockDirection, 4);
	EnvironmentScript.Slice(newTrackAxis, newTrackPosition, direction);
	
	// rotate and translate
	var iterations: int = 90 / rotationSpeed;
	var xStep = (track.position.x - transform.position.x) / iterations;
	var zStep = (track.position.z - transform.position.z) / iterations;
	for (var i = 0; i < iterations; i++) {
		transform.localEulerAngles.y += rotationSpeed * clockDirection;
		transform.position.x += xStep;
		transform.position.z += zStep;
		yield;
	}
	
	// finalize
	SetTrack(newTrackAxis, newTrackPosition);
	StartListening();
}


///////////////////////////////
///////// USING ITEMS /////////
///////////////////////////////

function GetPrimaryItem(): Item {
	return primaryItem;
}

function GetSecondaryItem(): Item {
	return secondaryItem;
}

function GetFirstReserve(): Item {
	return firstReserve;
}

function GetSecondReserve(): Item {
	return secondReserve;
}

function GetThirdReserve(): Item {
	return thirdReserve;
}

function GetFourthReserve(): Item {
	return fourthReserve;
}


//////////////////////////////
/////// CONTEXT ACTION ///////
//////////////////////////////
 
function GetContextName(): String {
	return contextName;
}

function GetContextAction(): Function {
	return contextAction;
}

function SetContextAction(name: String, object: GameObject, action: Function) {
	contextName = name;
	contextAction = action;
	contextObject = object;
}

function ClearContextAction() {
	contextName = 'none';
	contextAction = null;
	contextObject = null;
}


///////////////////////////////
//// CARRYING AND DROPPING ////
///////////////////////////////

// pick up an object
function PickUp(object: GameObject) {
	carrying = object;
}

function Draw(object: GameObject) {
	var instance = Instantiate(object, transform.position + Vector3.up, Quaternion.identity);
	PickUp(instance);
}

// drags along carried object
function Carry() {
	if (IsCarrying()) {
		carrying.transform.position = GetCarryingPosition();
		carrying.rigidbody.velocity = rigidbody.velocity;
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


///////////////////////////////
///// AIMING AND THROWING /////
///////////////////////////////

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
function ChargeAim() {
	if (aimCharge < 1) {
		aimCharge = Mathf.Min(1, aimCharge + Time.deltaTime * (1 / aimChargeDuration));
	}
}

// returns the charge of the player's aim
function GetAimCharge() {
	return aimCharge;
}

// returns the minimum charge of the player's aim
function IsAimCharged() {
	return aimCharge > minAimCharge;
}

// throws carried object
function Throw(speedFactor: float) {
	if (IsCarrying()) {
		var throwing = carrying;
		carrying = null;
		var aimAngleRads = aimAngle * (Mathf.PI / 180);
		throwing.rigidbody.velocity = 
			this.rigidbody.velocity + 
			(aimCharge * speedFactor * transform.forward * Mathf.Cos(aimAngleRads)) + 
			(aimCharge * speedFactor * transform.up * Mathf.Sin(aimAngleRads));
		vocalTrack.PlayOneShot(playerThrow);
	}
	aimCharge = minAimCharge;
}


///////////////////////////////
///// SWIMMING AND DIVING /////
///////////////////////////////

function IsSwimming() {
	return swimScript.IsSwimming();
}