#pragma strict

public var bombable: boolean;
public var bombableThreshold: int;
public var digable: boolean;

function Start () {
}

function Update () {
}

function IsBombable(): boolean {
	return bombable;
}

function IsDigable(): boolean {
	return digable;
}

function GetBombed(damage: int) {
	if (!IsBombable()) return;

	if (damage > bombableThreshold) {
		Destroy(this.gameObject);
	}
}

function GetDug() {
	if (!IsDigable()) return;

	Destroy(this.gameObject);
}