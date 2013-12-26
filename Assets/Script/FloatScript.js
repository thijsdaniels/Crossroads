#pragma strict

private var drag: float;
public var buoyancy: float = 1;
public var offset: Vector3 = Vector3.zero;

function Start () {
	drag = rigidbody.drag;
}

function Update () {
}

function GetDrag(): float {
	return drag;
}

function GetBuoyancy(): float {
	return buoyancy;
}

function GetOffset(): Vector3 {
	return offset;
}