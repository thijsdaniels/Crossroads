#pragma strict

private var opened: boolean = false;
public var itemPosition: Vector2;
public var message: String[];

function Start () {

}

function Update () {

}

function OnTriggerEnter(other: Collider) {

	if (!opened) {
		var playerScript = other.gameObject.GetComponent(PlayerScript);
		if (playerScript) {
			playerScript.SetContextAction('Open', this.gameObject, Open);
		}
	}
}

function OnTriggerExit(other: Collider) {

	if (!opened) {
		var playerScript = other.gameObject.GetComponent(PlayerScript);
		if (playerScript) {
			playerScript.ClearContextAction();
		}
	}
}

function Open() {

	opened = true;
	var playerScript = GameObject.Find('Player').GetComponent(PlayerScript);
	playerScript.ClearContextAction();

	var inventoryScript = GameObject.Find('HUD/Inventory').GetComponent(InventoryScript);
	inventoryScript.items[itemPosition.x, itemPosition.y].Unlock();

	var name = inventoryScript.items[itemPosition.x, itemPosition.y].name;
	var hudScript = GameObject.Find('HUD').GetComponent(HUDScript);
	hudScript.DisplayText(message);
}