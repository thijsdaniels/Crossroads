#pragma strict

function Start () {
	
}

function Update () {

}

class Item {

	public var player: GameObject;
	public var playerScript: PlayerScript;

	public var name;
	public var unlocked: boolean;
	public var icon: GUITexture;
	public var instance: GameObject;

	function IsUnlocked() {
		return unlocked;
	}

	function Unlock() {
		unlocked = true;
	}

	function GetIcon() {
		return icon;
	}

	function GetInstance() {
		return instance;
	}

	function Press() {}

	function Hold() {}

	function Release() {}

}

class BombBag extends Item {

	public function BombBag(_playerScript: PlayerScript, _icon: GUITexture, _instance: GameObject) {
		playerScript = _playerScript;
		name = 'Bomb Bag';
		icon = _icon;
		instance = _instance;
	}

	function Press() {
		if (!playerScript.IsSwimming() && !playerScript.IsCarrying()) {
			playerScript.Draw(instance);
		}
	}

	function Hold() {
		if (!playerScript.IsSwimming()) {
			playerScript.ChargeAim();
		}
	}

	function Release() {
		if (!playerScript.IsSwimming()) {
			playerScript.Throw(10);
		}
	}
}

class Boomerang extends Item {

	public function Boomerang(_playerScript: PlayerScript, _icon: GUITexture, _instance: GameObject) {
		playerScript = _playerScript;
		name = 'Boomerang';
		icon = _icon;
		instance = _instance;
	}
}

class Bow extends Item {

	public function Bow(_playerScript: PlayerScript, _icon: GUITexture, _instance: GameObject) {
		playerScript = _playerScript;
		name = 'Bow';
		icon = _icon;
		instance = _instance;
	}

	function Press() {
		if (!playerScript.IsSwimming() && !playerScript.IsCarrying()) {
			playerScript.Draw(instance);
		}
	}

	function Hold() {
		if (!playerScript.IsSwimming()) {
			playerScript.ChargeAim();
		}
	}

	function Release() {
		if (!playerScript.IsSwimming()) {
			playerScript.Throw(40);
		}
	}
}

class Hookshot extends Item {

	public function Hookshot(_playerScript: PlayerScript, _icon: GUITexture) {
		playerScript = _playerScript;
		name = 'Hookshot';
		icon = _icon;
	}
}

class Lantern extends Item {

	public function Lantern(_playerScript: PlayerScript, _icon: GUITexture) {
		playerScript = _playerScript;
		name = 'Lantern';
		icon = _icon;	}
}

class LensOfTruth extends Item {

	public function LensOfTruth(_playerScript: PlayerScript, _icon: GUITexture) {
		playerScript = _playerScript;
		name = 'Lens of Truth';
		icon = _icon;
	}
}

class MagicWand extends Item {

	public function MagicWand(_playerScript: PlayerScript, _icon: GUITexture) {
		playerScript = _playerScript;
		name = 'Magic Wand';
		icon = _icon;
	}
}

class MegatonHammer extends Item {

	public function MegatonHammer(_playerScript: PlayerScript, _icon: GUITexture) {
		playerScript = _playerScript;
		name = 'Megaton Hammer';
		icon = _icon;
	}
}

class Ocarina extends Item {

	public function Ocarina(_playerScript: PlayerScript, _icon: GUITexture) {
		playerScript = _playerScript;
		name = 'Ocarina';
		icon = _icon;
	}
}

class Shovel extends Item {

	public function Shovel(_playerScript: PlayerScript, _icon: GUITexture) {
		playerScript = _playerScript;
		name = 'Shovel';
		icon = _icon;
	}

	function Release() {
		if (!playerScript.IsSwimming()) {

			var foundation = playerScript.GetFoundation();
			if (!foundation) return;

			var blockScript: BlockScript = foundation.GetComponent(BlockScript);
			if (!blockScript) return;
			
			blockScript.GetDug();
		}
	}
}

class Sword extends Item {

	private var previousInstance: GameObject;

	public function Sword(_playerScript: PlayerScript, _icon: GUITexture, _instance: GameObject) {
		playerScript = _playerScript;
		name = 'Sword';
		icon = _icon;
		instance = _instance;
	}

	function Hold() {
		if (!playerScript.IsSwimming() && !playerScript.IsCarrying()) {
			// charge swing
		}
	}

	function Release() {
		if (!playerScript.IsSwimming() && !playerScript.IsCarrying()) {
			if (previousInstance) playerScript.Destroy(previousInstance);
			previousInstance = playerScript.Instantiate(instance, playerScript.transform.position, Quaternion.identity);
		}
	}
}