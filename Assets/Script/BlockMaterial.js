class BlockMaterial {

	// costants
	public final static var GRASS :int = 1;
	public final static var DIRT :int = 2;
	public final static var ROCK :int = 3;
	public final static var WATER :int = 4;

	// properties
	public var id: int;
	public var texture: int;
	public var opacity: float;
	public var solidity: float;

	// getters
	public function GetTexture(): int {
		return texture;
	}
	public function GetVariant(index: Vector3): int {
		return 0;
	}
	public function GetOpacity(): float {
		return opacity;
	}
	public function GetSolidity(): float {
		return solidity;
	}
	public function IsOpaque(): boolean {
		return opacity == 1;
	}
	public function IsSolid(): boolean {
		return solidity == 1;
	}
	public function IsWater(): boolean {
		return id == 4;
	}

	// helpers
	public static function Map(_material) {
		switch (_material) {
			case GRASS:
				return new Grass();
			case DIRT:
				return new Dirt();
			case ROCK:
				return new Rock();
			case WATER:
				return new Water();
		}
	}
}

class Grass extends BlockMaterial {

	public function Grass() {
		id = 1;
		texture = 0;
		opacity = 1;
		solidity = 1;
	}

	public function GetVariant(index: Vector3) {
		return (index.z % 2 == 0) ? 0 : 1;
	}
}

class Dirt extends BlockMaterial {

	public function Dirt() {
		id = 2;
		texture = 1;
		opacity = 1;
		solidity = 1;
	}

	public function GetVariant(index: Vector3) {
		return (index.y % 2 == 0) ? 0 : 1;
	}
}

class Rock extends BlockMaterial {

	public function Rock() {
		id = 3;
		texture = 2;
		opacity = 1;
		solidity = 1;
	}

	public function GetVariant(index: Vector3) {
		return (Random.value < 0.95) ? 0 : 1;
	}
}

class Water extends BlockMaterial {
	
	public function Water() {
		id = 4;
		texture = 3;
		opacity = 0.5;
		solidity = 0.5;
	}
}