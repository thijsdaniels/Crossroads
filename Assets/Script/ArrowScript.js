#pragma strict

public var damage: int = 2;
public var destroyTimer: float = 5;

function Start () {

}

function Update () {

}

function OnCollisionEnter() {
	rigidbody.useGravity = false;
	rigidbody.velocity = Vector3.zero;
	Destroy(gameObject, destroyTimer);
}