#pragma strict

public var player: GameObject;
public var items: GUITexture[,] = new GUITexture[6,3];
public var cursor: GUITexture;

private var playerScript: PlayerScript;
private var blurEffect: BlurEffect;
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

// items
public var bomb: GUITexture;
public var bow: GUITexture;

function Start () {
	playerScript = player.GetComponent(PlayerScript);
	blurEffect = Camera.main.GetComponent(BlurEffect);
	
	xSpacing = (1 - xMargin * 2) / (items.GetLength(0) - 1);
	ySpacing = (1 - yMargin * 2) / (items.GetLength(1) - 1);
	
	// initialize inventory
	items[4,0] = bomb;
	items[2,1] = bow;
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
			if (items[cursorPosition.x, cursorPosition.y] != null) {
				playerScript.primaryItem = items[cursorPosition.x, cursorPosition.y].gameObject.GetComponent(ItemScript).GetItem().rigidbody;
			}
		}
		if (Input.GetButtonDown(PlayerScript.BUTTON_ITEM_SECONDARY)) {
			if (items[cursorPosition.x, cursorPosition.y] != null) {
				playerScript.secondaryItem = items[cursorPosition.x, cursorPosition.y].gameObject.GetComponent(ItemScript).GetItem().rigidbody;
			}
		}
		if (Input.GetAxis(PlayerScript.AXIS_RESERVE_VERTICAL)) {
			if (items[cursorPosition.x, cursorPosition.y] != null) {
				if (Input.GetAxis(PlayerScript.AXIS_RESERVE_VERTICAL) > 0) {
					playerScript.firstReserve = items[cursorPosition.x, cursorPosition.y].gameObject.GetComponent(ItemScript).GetItem().rigidbody;
				} else {
					playerScript.thirdReserve = items[cursorPosition.x, cursorPosition.y].gameObject.GetComponent(ItemScript).GetItem().rigidbody;
				}
			}
		}
		if (Input.GetAxis(PlayerScript.AXIS_RESERVE_HORIZONTAL)) {
			if (items[cursorPosition.x, cursorPosition.y] != null) {
				if (Input.GetAxis(PlayerScript.AXIS_RESERVE_HORIZONTAL) > 0) {
					playerScript.secondReserve = items[cursorPosition.x, cursorPosition.y].gameObject.GetComponent(ItemScript).GetItem().rigidbody;
				} else {
					playerScript.fourthReserve = items[cursorPosition.x, cursorPosition.y].gameObject.GetComponent(ItemScript).GetItem().rigidbody;
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
		blurEffect.enabled = true;
		open = true;
		
		// display the item icons
		for (var x = 0; x < items.GetLength(0); x++) {
			for (var y = 0; y < items.GetLength(1); y++) {
				if (items[x,y] != null) {
					var itemScript: ItemScript = items[x,y].gameObject.GetComponent(ItemScript);
					if (itemScript.IsUnlocked()) {
						var xPosition = xMargin + xSpacing * x;
						var yPosition = 1 - yMargin - ySpacing * y;
						Instantiate(itemScript.GetIcon(), Vector3(xPosition, yPosition, 0), Quaternion.identity);
					}
				}
			}
		}
		
		// instantiate the cursor
		cursorObject = Instantiate(cursor, Vector3.zero, Quaternion.identity);
		UpdateCursorPosition();
		
	}
}

private function Close() {
	if (IsOpen()) {
	
		// destroy the item icons
		var itemIcons = GameObject.FindGameObjectsWithTag('Inventory');
		for (var itemIcon in itemIcons) {
			Destroy(itemIcon);
		}
	
		// finalize
		Time.timeScale = timeScaleOnOpen;
		blurEffect.enabled = false;
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
}