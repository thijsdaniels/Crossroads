#pragma strict
/* This sript cooperates with the main player script to update
 * the elements of the user interface. As such, it forms the link
 * between the player and the UI. */

private var player: PlayerScript;
private var playerHealth: HealthScript;
private var clock: GUIText;
private var healthDisplayed: int = 0;
private var maxHealthDisplayed: int = 0;
private var dPad: GameObject;
private var miniMap: GameObject;
private var buttonSet: GameObject;

public var heart4: GUITexture;
public var heart3: GUITexture;
public var heart2: GUITexture;
public var heart1: GUITexture;
public var heart0: GUITexture;

function Start () {
	
	// get a reference to the player
	var playerObject = GameObject.Find('/Player');
	player = playerObject.GetComponent(PlayerScript);
	
	// get a reference to the player's health
	playerHealth = playerObject.GetComponent(HealthScript);
	
	// get a reference to the clock
	var clockObject = GameObject.Find('HUD/Clock');
	clock = clockObject.GetComponent(GUIText);
	
}

function Update() {

	// display the time
	UpdateClock();
	
	// display the health
	UpdateHealth();
	
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

function SetButtonImage(button: GUITexture, image: GUITexture) {
	
	ClearButton(button);
	//TODO set the image
	
}

function SetButtonText(button: GUITexture, text: String) {

	ClearButton(button);
	//TODO set the text
	
}

function ClearButton(button: GUITexture) {
	SetButtonText(button, null);
	SetButtonImage(button, null);
}