class Block {

	// constants
	final public static var BLOCK_SPAN: float = 0.5;
	final public static var BLOCK_SIZE: float = BLOCK_SPAN / 2;

	// members
	public var index: Vector3;
	public var position: Vector3;
	public var material: BlockMaterial;
	private var active: boolean = true;
	
	// constructors
	public function Block(_index: Vector3, _material: int) {
		index = _index;
		position = TerrainScript.Index2Position(_index);
		material = BlockMaterial.Map(_material);
	}

	public function Block(_index: Vector3, _position: Vector3, _material: int, _active: boolean) {
		index = _index;
		position = TerrainScript.Index2Position(_index);
		material = BlockMaterial.Map(_material);
		active = _active;
	}
	
	// getters
	public function GetIndex(): Vector3 {
		return index;
	}
	public function GetPosition(): Vector3 {
		return index;
	}
	public function IsActive(): boolean {
		return active;
	}

	// setters
	public function SetActive(_active: boolean) {
		active = _active;
	}
}