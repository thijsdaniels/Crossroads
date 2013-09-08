#pragma strict

public var player: GameObject;
public var items: Item[,] = new Item[6,3];
public var cursor: GUITexture;
public var selection: GUIText;
private var item: Item;

private var playerScript: PlayerScript;
private var overlay: GUITexture;
private var blurEffect: BlurEffect;
private var desaturationEffect: ColorCorrectionCurves;
private var timeScaleOnOpen: float;
private var open: boolean = false;

private var xMargin: float = 0.25;
private var yMargin: float = 0.3;
private var xSpacing: float;
private var ySpacing: float;

private var cursorPosition: Vector2 = Vector2(0,0);
private var cursorObject: GUITexture;
private var timeOut: int = 0;
private static var UP = 0;
private static var RIGHT = 1;
private static var DOWN = 2;
private static var LEFT = 3;

// item icons
public var bombBagIcon: GUITexture;
public var boomerangIcon: GUITexture;
public var bowIcon: GUITexture;
public var hookshotIcon: GUITexture;
public var ironBootsIcon: GUITexture;
public var lanternIcon: GUITexture;
public var lensOfTruthIcon: GUITexture;
public var magicWandIcon: GUITexture;
public var megatonHammerIcon: GUITexture;
public var ocarinaIcon: GUITexture;
public var shovelIcon: GUITexture;
public var swordIcon: GUITexture;

// item projectiles
public var bombBagProjectile: GameObject;
public var boomerangProjectile: GameObject;
public var bowProjectile: GameObject;

function Start () {
	playerScript = player.GetComponent(PlayerScript);
	overlay = GameObject.Find('HUD/Overlay').GetComponent(GUITexture);
	blurEffect = Camera.main.GetComponent(BlurEffect);
	desaturationEffect = Camera.main.GetComponents(ColorCorrectionCurves)[1];
	
	xSpacing = (1 - xMargin * 2) / (items.GetLength(0) - 1);
	ySpacing = (1 - yMargin * 2) / (items.GetLength(1) - 1);
	
	// initialize inventory
	items[0,0] = new Ocarina(playerScript, ocarinaIcon);
	items[1,0] = new Lantern(playerScript, lanternIcon);
	items[2,0] = null;
	items[3,0] = new Shovel(playerScript, shovelIcon);
	items[4,0] = new BombBag(playerScript, bombBagIcon, bombBagProjectile);
	items[1,1] = new Hookshot(playerScript, hookshotIcon);
	items[2,1] = new Bow(playerScript, bowIcon, bowProjectile);
	items[3,1] = new Sword(playerScript, swordIcon);
	items[4,1] = null;
	items[5,1] = new Boomerang(playerScript, boomerangIcon, boomerangProjectile);
	items[0,2] = new LensOfTruth(playerScript, lensOfTruthIcon);
	items[1,2] = null;
	items[2,2] = null;
	items[3,2] = new MegatonHammer(playerScript, megatonHammerIcon);
	items[4,2] = new MagicWand(playerScript, magicWandIcon);

	items[3,0].Unlock();
	items[4,0].Unlock();
	items[2,1].Unlock();
}

function Update () {

	// opening and closing
	if (Input.GetButtonDown(PlayerScript.BUTTON_INVENTORY)) {
		if (!IsOpen()) {
			Open();
		} else {
			Close();
		}
	}
	
	if (IsOpen()) {
	
		// cursor movement
		if (Mathf.Abs(Input.GetAxis('Left Stick Horizontal')) >= 0.9) {
			if (Input.GetAxis('Left Stick Horizontal') > 0) {
				MoveCursor(RIGHT);
			} else {
				MoveCursor(LEFT);
			}
		}
		if (Mathf.Abs(Input.GetAxis('Left Stick Vertical')) >= 0.9) {
			if (Input.GetAxis('Left Stick Vertical') > 0) {
				MoveCursor(UP);
			} else {
				MoveCursor(DOWN);
			}
		}
		if (Mathf.Abs(Input.GetAxis('Left Stick Horizontal')) <= 0.1 && Mathf.Abs(Input.GetAxis('Left Stick Vertical')) <= 0.1) {
			timeOut = 0;
		}
		
		// item selection
		if (Input.GetButtonDown(PlayerScript.BUTTON_ITEM_PRIMARY)) {
			//item = items[cursorPosition.x, cursorPosition.y];
			if (item != null && item.IsUnlocked()) {
				playerScript.primaryItem = item;
			}
		}
		if (Input.GetButtonDown(PlayerScript.BUTTON_ITEM_SECONDARY)) {
			//item = items[cursorPosition.x, cursorPosition.y];
			if (item != null && item.IsUnlocked()) {
				playerScript.secondaryItem = item;
			}
		}
		if (Input.GetAxis(PlayerScript.AXIS_RESERVE_VERTICAL)) {
			//item = items[cursorPosition.x, cursorPosition.y];
			if (item != null && item.IsUnlocked()) {
				if (Input.GetAxis(PlayerScript.AXIS_RESERVE_VERTICAL) > 0) {
					playerScript.firstReserve = item;
				} else {
					playerScript.thirdReserve = item;
				}
			}
		}
		if (Input.GetAxis(PlayerScript.AXIS_RESERVE_HORIZONTAL)) {
			//item = items[cursorPosition.x, cursorPosition.y];
			if (item != null && item.IsUnlocked()) {
				if (Input.GetAxis(PlayerScript.AXIS_RESERVE_HORIZONTAL) > 0) {
					playerScript.secondReserve = item;
				} else {
					playerScript.fourthReserve = item;
				}
			}
		}
		
	}
	
	if (timeOut > 0) {
		timeOut--;
	}
	
}

function IsOpen(): boolean {
	return open;
}

public function Open() {
	if (!IsOpen() && playerScript.IsGrounded() && playerScript.IsListening()) {
		
		// prepare
		playerScript.StopListening();
		timeScaleOnOpen = Time.timeScale;
		Time.timeScale = 0;
		overlay.enabled = true;
		blurEffect.enabled = true;
		desaturationEffect.enabled = true;
		open = true;
		
		// display the item icons
		for (var x = 0; x < items.GetLength(0); x++) {
			for (var y = 0; y < items.GetLength(1); y++) {
				if (items[x,y] != null) {
					var item = items[x,y];
					var xPosition = xMargin + xSpacing * x;
					var yPosition = 1 - yMargin - ySpacing * y;
					var icon = Instantiate(item.GetIcon(), Vector3(xPosition, yPosition, 0), Quaternion.identity);
					if (!item.IsUnlocked()) icon.color.a = 0.1;
				}
			}
		}
		
		// instantiate the cursor
		cursorObject = Instantiate(cursor, Vector3(0, 0, -1), Quaternion.identity);
		UpdateCursorPosition();
		selection.enabled = true;
	}
}

private function Close() {
	if (IsOpen()) {
	
		// destroy the item icons
		var itemIcons = GameObject.FindGameObjectsWithTag('Inventory');
		for (var itemIcon in itemIcons) {
			Destroy(itemIcon);
		}

		// hide the selection text
		selection.enabled = false;
	
		// finalize
		Time.timeScale = timeScaleOnOpen;
		overlay.enabled = false;
		blurEffect.enabled = false;
		desaturationEffect.enabled = false;
		open = false;
		playerScript.StartListening();
	}
}

private function MoveCursor(direction) {

	if (IsListening()) {
		switch (direction) {
			case LEFT:
				cursorPosition.x = Mathf.Repeat(cursorPosition.x - 1, items.GetLength(0));
				break;
			case RIGHT:
				cursorPosition.x = Mathf.Repeat(cursorPosition.x + 1, items.GetLength(0));
				break;
			case UP:
				cursorPosition.y = Mathf.Repeat(cursorPosition.y - 1, items.GetLength(1));
				break;
			case DOWN:
				cursorPosition.y = Mathf.Repeat(cursorPosition.y + 1, items.GetLength(1));
				break;
		}
		TimeOut(20);
		UpdateCursorPosition();
	}
	
}

private function IsListening(): boolean {
	return timeOut == 0;
}

private function TimeOut(duration: int) {
	timeOut = duration;
}

private function UpdateCursorPosition() {
	cursorObject.transform.position.x = xMargin + xSpacing * cursorPosition.x;
	cursorObject.transform.position.y = 1 - yMargin - ySpacing * cursorPosition.y;
	item = items[cursorPosition.x, cursorPosition.y];
	selection.text = (item != null) ? item.name : '';
}