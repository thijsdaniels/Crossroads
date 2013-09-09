#pragma strict
/**
 * This sript cooperates with the main player script to update
 * the elements of the user interface. As such, it forms the link
 * between the Player and the UI.
 */

// player
private var player: PlayerScript;

// health
private var playerHealth: HealthScript;
private var healthDisplayed: int = 0;
private var maxHealthDisplayed: int = 0;
public var heart4: GUITexture;
public var heart3: GUITexture;
public var heart2: GUITexture;
public var heart1: GUITexture;
public var heart0: GUITexture;

// clock
private var clock: GUIText;

// buttons
private var primaryItemButton: GUIText;
private var secondaryItemButton: GUIText;
private var firstReserveButton: GUIText;
private var secondReserveButton: GUIText;
private var thirdReserveButton: GUIText;
private var fourthReserveButton: GUIText;
private var contextualActionButton: GUIText;

// text
private var textField: GUIText;
private var textBox: GUITexture;

function Start () {
	
	// get a reference to the player
	var playerObject = GameObject.Find('/Player');
	player = playerObject.GetComponent(PlayerScript);
	
	// get a reference to the player's health
	playerHealth = playerObject.GetComponent(HealthScript);
	
	// get a reference to the clock
	var clockObject = GameObject.Find('HUD/Clock');
	clock = clockObject.GetComponent(GUIText);
	
	// get references to the buttons
	var primaryItemButtonObject = GameObject.Find('HUD/Item1');
	var secondaryItemButtonObject = GameObject.Find('HUD/Item2');
	var firstReserveButtonObject = GameObject.Find('HUD/Reserve1');
	var secondReserveButtonObject = GameObject.Find('HUD/Reserve2');
	var thirdReserveButtonObject = GameObject.Find('HUD/Reserve3');
	var fourthReserveButtonObject = GameObject.Find('HUD/Reserve4');
	var contextualActionButtonObject = GameObject.Find('HUD/Context');
	primaryItemButton = primaryItemButtonObject.GetComponent(GUIText);
	secondaryItemButton = secondaryItemButtonObject.GetComponent(GUIText);
	firstReserveButton = firstReserveButtonObject.GetComponent(GUIText);
	secondReserveButton = secondReserveButtonObject.GetComponent(GUIText);
	thirdReserveButton = thirdReserveButtonObject.GetComponent(GUIText);
	fourthReserveButton = fourthReserveButtonObject.GetComponent(GUIText);
	contextualActionButton = contextualActionButtonObject.GetComponent(GUIText);

	// get a reference to the text field
	textField = GameObject.Find('HUD/TextField').GetComponent(GUIText);
	textBox = GameObject.Find('HUD/TextBox').GetComponent(GUITexture);
}

function Update() {

	// display the time
	UpdateClock();
	
	// display the health
	UpdateHealth();
	
	// display the button actions
	UpdateButtons();
	
}

function UpdateClock() {
	var time: Vector4 = TimeScript.GetDiscreteTime();
	clock.text = String.Format('{0:00}:{1:00}', time[1], time[2]);
}

function UpdateHealth() {

	var health = playerHealth.GetHealth();
	var maxHealth = playerHealth.GetMaxHealth();
	if (health != healthDisplayed || maxHealth != maxHealthDisplayed) {
		DisplayHealth(health, maxHealth);
		healthDisplayed = health;
		maxHealthDisplayed = maxHealth;
	}
	
}

function DisplayHealth(health: int, maxHealth: int) {
	
	// calculate how many hearts are needed
	var hearts = Mathf.Floor(maxHealth / 4);
	
	// destroy all hearts currently on the hud
	var oldHearts = GameObject.FindGameObjectsWithTag('HUDHeart');
	for (var oldHeart in oldHearts) {
		Destroy(oldHeart);
	}
	
	// create the new hearts
	var horSpacing = 0.0275;
	var verSpacing = 0.05;
	var heartsPerLine = 10;
	var healthLeft = health;
	for (var i = 0; i < hearts; i++) {
		
		// calculate position
		var xPos = 0 + (i % heartsPerLine) * horSpacing;
		var yPos = 1 - Mathf.Floor(i / heartsPerLine) * verSpacing;
		
		// determine which texture to use
		var heart: GUITexture;
		if (healthLeft >= 4) heart = heart4;
		else if (healthLeft == 3) heart = heart3;
		else if (healthLeft == 2) heart = heart2;
		else if (healthLeft == 1) heart = heart1;
		else heart = heart0;
		healthLeft -= 4;
		
		// create the texture
		Instantiate(heart, Vector3(xPos, yPos, 0), Quaternion.identity);
		
	}
	
}

function UpdateButtons() {
	primaryItemButton.text = (player.GetPrimaryItem() != null) ? player.GetPrimaryItem().name : 'none';
	secondaryItemButton.text = (player.GetSecondaryItem() != null) ? player.GetSecondaryItem().name : 'none';
	firstReserveButton.text = (player.GetFirstReserve() != null) ? player.GetFirstReserve().name : 'none';
	secondReserveButton.text = (player.GetSecondReserve() != null) ? player.GetSecondReserve().name : 'none';
	thirdReserveButton.text = (player.GetThirdReserve() != null) ? player.GetThirdReserve().name : 'none';
	fourthReserveButton.text = (player.GetFourthReserve() != null) ? player.GetFourthReserve().name : 'none';
	contextualActionButton.text = player.GetContextName();
}

function DisplayText(text: String[]) {

	// prepare
	player.StopListening();
	textBox.enabled = true;
	textField.enabled = true;

	// loop through text using a coroutine, pausing while the player reads
	var textIndex: int = 0;
	while (textIndex < text.length) {

		// show the current line
		printLine(text[textIndex]);

		// wait untill the player presses the talk button, then move to the next line
		while (!Input.GetButtonUp(player.BUTTON_TALK)) yield;
		textIndex++;
		yield;
	}

	// finalize
	textField.enabled = false;
	textBox.enabled = false;
	textField.text = '';
	player.StartListening();
}

function DisplayText(text: String[], character: CharacterScript) {

	// prepare
	player.StopListening();
	player.rigidbody.velocity = Vector3.zero;
	character.PausePath();
	textBox.enabled = true;
	textField.enabled = true;

	// loop through text using a coroutine, pausing while the player reads
	var textIndex: int = 0;
	while (textIndex < text.length) {

		// show the current line
		printLine(text[textIndex]);

		// wait untill the player presses the talk button, then move to the next line
		while (!Input.GetButtonUp(player.BUTTON_TALK)) yield;
		textIndex++;
		yield;
	}

	// finalize
	textField.enabled = false;
	textBox.enabled = false;
	textField.text = '';
	character.ContinuePath();
	player.StartListening();
}

function printLine(text: String) {

	textField.text = '';
	for (var i = 0; i < text.length; i++) {
		textField.text += text[i];
		yield;
	}
	yield;
}