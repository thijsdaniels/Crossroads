#pragma strict

// constants
public static var CHUNK_SIZE: Vector2 = Vector2(16, 32);
public static var AHEAD: int = -1;
public static var INTERSECT: int = 0;
public static var BEHIND: int = 1;
public static var ATLAS_SIZE: Vector2 = Vector2(16f, 4f);

// members
private var position: Vector3;
private var blocks: Block[,,];
private var mesh: Mesh;
private var meshFilter: MeshFilter;
private var meshCollider: MeshCollider;

function Start () {
}

function Update () {
}

// initializes the chunk
public function Initialize(xIndex: int, yIndex: int, zIndex: int) {

	this.position = Vector3(xIndex, yIndex, zIndex);
	
	// get mesh components
	meshFilter = GetComponent(MeshFilter);
	meshCollider = GetComponent(MeshCollider);

	// build the chunk
	blocks = new Block[CHUNK_SIZE.x, CHUNK_SIZE.y, CHUNK_SIZE.x];
	for (var x = 0; x < CHUNK_SIZE.x; x++) {
		for (var y = 0; y < CHUNK_SIZE.y; y++) {
			for (var z = 0; z < CHUNK_SIZE.x; z++) {
				var terrainIndex = Vector3(this.position.x * CHUNK_SIZE.x, this.position.y * CHUNK_SIZE.y, this.position.z * CHUNK_SIZE.x) + Vector3(x, y, z);
				if (InRange(terrainIndex)) {
					var type = TerrainScript.TERRAIN[terrainIndex.x, terrainIndex.y, terrainIndex.z];
					if (type != 0) {
						blocks[x, y, z] = new Block(type);
					}
				}
			}
		}
	}
}

function InRange(position: Vector3): boolean {
	if (position.x < 0 || position.x >= TerrainScript.TERRAIN_SIZE.x) return false;
	if (position.y < 0 || position.y >= TerrainScript.TERRAIN_SIZE.y) return false;
	if (position.z < 0 || position.z >= TerrainScript.TERRAIN_SIZE.z) return false;
	return true;
}

//////////////////////////////
///////// RENDERING //////////
//////////////////////////////

// renders the chunk
public function Render() {

	if (meshFilter.mesh) meshFilter.mesh.Clear();
	if (meshCollider.mesh) meshCollider.mesh.Clear();

	// generate vertices and triangles
	var vertices = new Array();
	var triangles = new Array();
	var uv = new Array();

	for (var x = 0; x < CHUNK_SIZE.x; x++) {
		for (var y = 0; y < CHUNK_SIZE.y; y++) {
			for (var z = 0; z < CHUNK_SIZE.x; z++) {

				var position = TerrainScript.Index2Position(Vector3(x, y, z));
				var block: Block = this.blocks[x, y, z];

				if (block != null && block.IsActive()) {

					var material: int = block.GetMaterial();
					var texture: float = (material - 1) / ATLAS_SIZE.x;
					var variant: int = block.GetVariant(Vector3(x, y, z));
					var vertexIndex: int = 0;
					var altSide: int;

					if (!IsOccupied(TerrainScript.Position2Index(position + Vector3.up * Block.BLOCK_SPAN), true)) {

						vertexIndex = vertices.length;

						vertices.Add(Vector3(position.x - Block.BLOCK_SIZE, position.y + Block.BLOCK_SIZE, position.z - Block.BLOCK_SIZE));
						vertices.Add(Vector3(position.x - Block.BLOCK_SIZE, position.y + Block.BLOCK_SIZE, position.z + Block.BLOCK_SIZE));
						vertices.Add(Vector3(position.x + Block.BLOCK_SIZE, position.y + Block.BLOCK_SIZE, position.z + Block.BLOCK_SIZE));
						vertices.Add(Vector3(position.x + Block.BLOCK_SIZE, position.y + Block.BLOCK_SIZE, position.z - Block.BLOCK_SIZE));

						triangles.Add(vertexIndex);
						triangles.Add(vertexIndex + 1);
						triangles.Add(vertexIndex + 2);

						triangles.Add(vertexIndex + 2);
						triangles.Add(vertexIndex + 3);
						triangles.Add(vertexIndex);

						uv.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
						uv.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
						uv.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
						uv.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
					}

					if (!IsOccupied(TerrainScript.Position2Index(position + Vector3.back * Block.BLOCK_SPAN), true)) {

						vertexIndex = vertices.length;

						vertices.Add(Vector3(position.x - Block.BLOCK_SIZE, position.y - Block.BLOCK_SIZE, position.z - Block.BLOCK_SIZE));
						vertices.Add(Vector3(position.x - Block.BLOCK_SIZE, position.y + Block.BLOCK_SIZE, position.z - Block.BLOCK_SIZE));
						vertices.Add(Vector3(position.x + Block.BLOCK_SIZE, position.y + Block.BLOCK_SIZE, position.z - Block.BLOCK_SIZE));
						vertices.Add(Vector3(position.x + Block.BLOCK_SIZE, position.y - Block.BLOCK_SIZE, position.z - Block.BLOCK_SIZE));

						triangles.Add(vertexIndex);
						triangles.Add(vertexIndex + 1);
						triangles.Add(vertexIndex + 2);

						triangles.Add(vertexIndex + 2);
						triangles.Add(vertexIndex + 3);
						triangles.Add(vertexIndex);

						altSide = (Random.value > 0.5) ? 1 : 0;
						uv.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
						uv.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
						uv.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
						uv.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
					}

					if (!IsOccupied(TerrainScript.Position2Index(position + Vector3.left * Block.BLOCK_SPAN), true)) {

						vertexIndex = vertices.length;

						vertices.Add(Vector3(position.x - Block.BLOCK_SIZE, position.y - Block.BLOCK_SIZE, position.z + Block.BLOCK_SIZE));
						vertices.Add(Vector3(position.x - Block.BLOCK_SIZE, position.y + Block.BLOCK_SIZE, position.z + Block.BLOCK_SIZE));
						vertices.Add(Vector3(position.x - Block.BLOCK_SIZE, position.y + Block.BLOCK_SIZE, position.z - Block.BLOCK_SIZE));
						vertices.Add(Vector3(position.x - Block.BLOCK_SIZE, position.y - Block.BLOCK_SIZE, position.z - Block.BLOCK_SIZE));

						triangles.Add(vertexIndex);
						triangles.Add(vertexIndex + 1);
						triangles.Add(vertexIndex + 2);

						triangles.Add(vertexIndex + 2);
						triangles.Add(vertexIndex + 3);
						triangles.Add(vertexIndex);

						altSide = (Random.value > 0.5) ? 1 : 0;
						uv.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
						uv.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
						uv.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
						uv.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
					}

					if (!IsOccupied(TerrainScript.Position2Index(position + Vector3.forward * Block.BLOCK_SPAN), true)) {

						vertexIndex = vertices.length;

						vertices.Add(Vector3(position.x + Block.BLOCK_SIZE, position.y - Block.BLOCK_SIZE, position.z + Block.BLOCK_SIZE));
						vertices.Add(Vector3(position.x + Block.BLOCK_SIZE, position.y + Block.BLOCK_SIZE, position.z + Block.BLOCK_SIZE));
						vertices.Add(Vector3(position.x - Block.BLOCK_SIZE, position.y + Block.BLOCK_SIZE, position.z + Block.BLOCK_SIZE));
						vertices.Add(Vector3(position.x - Block.BLOCK_SIZE, position.y - Block.BLOCK_SIZE, position.z + Block.BLOCK_SIZE));

						triangles.Add(vertexIndex);
						triangles.Add(vertexIndex + 1);
						triangles.Add(vertexIndex + 2);

						triangles.Add(vertexIndex + 2);
						triangles.Add(vertexIndex + 3);
						triangles.Add(vertexIndex);

						altSide = (Random.value > 0.5) ? 1 : 0;
						uv.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
						uv.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
						uv.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
						uv.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
					}

					if (!IsOccupied(TerrainScript.Position2Index(position + Vector3.right * Block.BLOCK_SPAN), true)) {

						vertexIndex = vertices.length;

						vertices.Add(Vector3(position.x + Block.BLOCK_SIZE, position.y - Block.BLOCK_SIZE, position.z - Block.BLOCK_SIZE));
						vertices.Add(Vector3(position.x + Block.BLOCK_SIZE, position.y + Block.BLOCK_SIZE, position.z - Block.BLOCK_SIZE));
						vertices.Add(Vector3(position.x + Block.BLOCK_SIZE, position.y + Block.BLOCK_SIZE, position.z + Block.BLOCK_SIZE));
						vertices.Add(Vector3(position.x + Block.BLOCK_SIZE, position.y - Block.BLOCK_SIZE, position.z + Block.BLOCK_SIZE));

						triangles.Add(vertexIndex);
						triangles.Add(vertexIndex + 1);
						triangles.Add(vertexIndex + 2);

						triangles.Add(vertexIndex + 2);
						triangles.Add(vertexIndex + 3);
						triangles.Add(vertexIndex);

						altSide = (Random.value > 0.5) ? 1 : 0;
						uv.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
						uv.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
						uv.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
						uv.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
					}

					if (!IsOccupied(TerrainScript.Position2Index(position + Vector3.down * Block.BLOCK_SPAN), true)) {

						vertexIndex = vertices.length;

						vertices.Add(Vector3(position.x - Block.BLOCK_SIZE, position.y - Block.BLOCK_SIZE, position.z + Block.BLOCK_SIZE));
						vertices.Add(Vector3(position.x - Block.BLOCK_SIZE, position.y - Block.BLOCK_SIZE, position.z - Block.BLOCK_SIZE));
						vertices.Add(Vector3(position.x + Block.BLOCK_SIZE, position.y - Block.BLOCK_SIZE, position.z - Block.BLOCK_SIZE));
						vertices.Add(Vector3(position.x + Block.BLOCK_SIZE, position.y - Block.BLOCK_SIZE, position.z + Block.BLOCK_SIZE));

						triangles.Add(vertexIndex);
						triangles.Add(vertexIndex + 1);
						triangles.Add(vertexIndex + 2);

						triangles.Add(vertexIndex + 2);
						triangles.Add(vertexIndex + 3);
						triangles.Add(vertexIndex);

						uv.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
						uv.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
						uv.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
						uv.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
					}
				}
			}
		}
	}

	/*
	// generate uvs
	var uv: Vector2[] = new Vector2[vertices.length];
	for (var i = 0; i < uv.length; i++) {
		var vertice: Vector3 = vertices[i];
		uv[i] = Vector2(vertice.x, vertice.z);
	}
	*/

	// build mesh
	mesh = new Mesh();
	mesh.vertices = vertices;
	mesh.triangles = triangles;
	mesh.uv = uv;
	mesh.RecalculateNormals();
	
	// set mesh to filter and collider
	meshFilter.mesh = mesh;
	meshCollider.mesh = mesh;
}

// checks whether a space is occupied
public function IsOccupied(position: Vector3, ignoreTranslucent: boolean): boolean {

	var neighbor: GameObject;
	var neighborScript: ChunkScript;

	if (position.x < 0) {
		if (this.position.x > 0) {
			neighbor = TerrainScript.CHUNKS[this.position.x - 1, this.position.y, this.position.z];
			if (!neighbor.renderer.enabled) return false;
			neighborScript = neighbor.GetComponent(ChunkScript);
			return neighborScript.IsOccupied(Vector3(position.x + CHUNK_SIZE.x, position.y, position.z), ignoreTranslucent);
		} else {
			return false;
		}
	}

	if (position.x >= CHUNK_SIZE.x) {
		if (this.position.x < Mathf.Ceil(TerrainScript.TERRAIN_SIZE.x / CHUNK_SIZE.x) - 1) {
			neighbor = TerrainScript.CHUNKS[this.position.x + 1, this.position.y, this.position.z];
			if (!neighbor.renderer.enabled) return false;
			neighborScript = neighbor.GetComponent(ChunkScript);
			return neighborScript.IsOccupied(Vector3(position.x - CHUNK_SIZE.x, position.y, position.z), ignoreTranslucent);
		} else {
			return false;
		}
	}

	if (position.y < 0) {
		if (this.position.y > 0) {
			neighbor = TerrainScript.CHUNKS[this.position.x, this.position.y - 1, this.position.z];
			if (!neighbor.renderer.enabled) return false;
			neighborScript = neighbor.GetComponent(ChunkScript);
			return neighborScript.IsOccupied(Vector3(position.x, position.y + CHUNK_SIZE.y, position.z), ignoreTranslucent);
		} else {
			return false;
		}
	}

	if (position.y >= CHUNK_SIZE.y) {
		if (this.position.y < Mathf.Ceil(TerrainScript.TERRAIN_SIZE.y / CHUNK_SIZE.y) - 1) {
			neighbor = TerrainScript.CHUNKS[this.position.x, this.position.y + 1, this.position.z];
			if (!neighbor.renderer.enabled) return false;
			neighborScript = neighbor.GetComponent(ChunkScript);
			return neighborScript.IsOccupied(Vector3(position.x, position.y - CHUNK_SIZE.y, position.z), ignoreTranslucent);
		} else {
			return false;
		}
	}

	if (position.z < 0) {
		if (this.position.z > 0) {
			neighbor = TerrainScript.CHUNKS[this.position.x, this.position.y, this.position.z - 1];
			if (!neighbor.renderer.enabled) return false;
			neighborScript = neighbor.GetComponent(ChunkScript);
			return neighborScript.IsOccupied(Vector3(position.x, position.y, position.z + CHUNK_SIZE.x), ignoreTranslucent);
		} else {
			return false;
		}
	}

	if (position.z >= CHUNK_SIZE.x) {
		if (this.position.z < Mathf.Ceil(TerrainScript.TERRAIN_SIZE.z / CHUNK_SIZE.x) - 1) {
			neighbor = TerrainScript.CHUNKS[this.position.x, this.position.y, this.position.z + 1];
			if (!neighbor.renderer.enabled) return false;
			neighborScript = neighbor.GetComponent(ChunkScript);
			return neighborScript.IsOccupied(Vector3(position.x, position.y, position.z - CHUNK_SIZE.x), ignoreTranslucent);
		} else {
			return false;
		}
	}
	
	// check the position for a block
	var block = blocks[position.x, position.y, position.z];
	if (block == null || !block.IsActive() || (ignoreTranslucent && block.IsTranslucent())) {
		return false;
	} else {
		return true;
	}
	
}

//////////////////////////////
////////// SLICING ///////////
//////////////////////////////

public function GetSlicePosition(axis: int, position: float, direction: int): int {

	// determine which coordinate of the chunk's position to evaluate
	var chunkPosition: float;
	var reverseDirection = false;
	if (axis == EnvironmentScript.X_AXIS) {
		chunkPosition = transform.position.z;
		if (direction == EnvironmentScript.SOUTH) {
			reverseDirection = true;
		}
	} else {
		chunkPosition = transform.position.x;
		if (direction == EnvironmentScript.WEST) {
			reverseDirection = true;
		}
	}

	if (position >= chunkPosition) {
		if (position <= chunkPosition + CHUNK_SIZE.x * Block.BLOCK_SPAN) {
			return INTERSECT;
		}
		return (reverseDirection) ? BEHIND : AHEAD;
	}
	return (reverseDirection) ? AHEAD : BEHIND;
}

public function Slice(axis: int, position: float, direction: int) {

	var different = false;

	for (var x = 0; x < CHUNK_SIZE.x; x++) {
		for (var y = 0; y < CHUNK_SIZE.y; y++) {
			for (var z = 0; z < CHUNK_SIZE.x; z++) {

				var block: Block = blocks[x, y, z];
				
				if (block != null) {

					var blockPosition = transform.position + TerrainScript.Index2Position(Vector3(x, y, z));

					if (axis == EnvironmentScript.X_AXIS) {

						if (direction == EnvironmentScript.NORTH) {

							if (blockPosition.z < position) {
								if (block.IsActive()) {
									block.SetActive(false);
									different = true;
								}

							} else {
								if (!block.IsActive()) {
									block.SetActive(true);
									different = true;
								}
							}

						} else if (direction == EnvironmentScript.SOUTH) {

							if (blockPosition.z > position) {
								if (block.IsActive()) {
									block.SetActive(false);
									different = true;
								}

							} else {
								if (!block.IsActive()) {
									block.SetActive(true);
									different = true;
								}
							}
						}

					} else {

						if (direction == EnvironmentScript.EAST) {

							if (blockPosition.x < position) {
								if (block.IsActive()) {
									block.SetActive(false);
									different = true;
								}

							} else {
								if (!block.IsActive()) {
									block.SetActive(true);
									different = true;
								}
							}

						} else if (direction == EnvironmentScript.WEST) {

							if (blockPosition.x > position) {
								if (block.IsActive()) {
									block.SetActive(false);
									different = true;
								}

							} else {
								if (!block.IsActive()) {
									block.SetActive(true);
									different = true;
								}
							}
						}
					}
				}
			}
		}
	}

	if (different) {
		Render();
	}

	Show();
}

public function Hide() {
	if (renderer.enabled) {
		renderer.enabled = false;
	}
}

public function Show() {
	if (!renderer.enabled) {
		renderer.enabled = true;
	}
}

public function ShowAll() {
	for (var x = 0; x < CHUNK_SIZE.x; x++) {
		for (var y = 0; y < CHUNK_SIZE.y; y++) {
			for (var z = 0; z < CHUNK_SIZE.x; z++) {
				var block: Block = blocks[x, y, z];
				if (block != null) {
					block.SetActive(true);
				}
			}
		}
	}
	Show();
	Render();
}

//////////////////////////////
/////////// BLOCKS ///////////
//////////////////////////////

class Block {

	// constants
	final public static var BLOCK_SPAN: float = 0.5;
	final public static var BLOCK_SIZE: float = BLOCK_SPAN / 2;
	public static class MATERIAL {
		public var GRASS: int = 1;
		public var GROUND: int = 2;
		public var ROCK: int = 3;
		public var WOOD: int = 4;
		public var SAND: int = 5;
		public var LAVA: int = 6;
	}

	// members
	private var material: int;
	private var translucent: boolean = false;
	private var active: boolean = true;
	
	// constructors
	public function Block(_material: int) {
		material = _material;
	}
	public function Block(_material: int, _translucent: boolean) {
		material = _material;
		translucent = _translucent;
	}
	
	// getters
	public function GetMaterial(): int {
		return material;
	}
	public function GetVariant(index: Vector3) {
		switch (material) {
			case MATERIAL.GRASS:
				return (index.x % 2 == 0) ? 0 : 1;
				break;
			case MATERIAL.GROUND:
				return (index.y % 2 == 0) ? 0 : 1;
				break;
			case MATERIAL.ROCK:
				return (Random.value < 0.95) ? 0 : 1;
				break;
		}
	}
	public function IsTranslucent(): boolean {
		return translucent;
	}
	public function IsActive(): boolean {
		return active;
	}
	
	// setters
	public function SetMaterial(_material: int) {
		material = _material;
	}
	public function SetTranslucent(_translucent: boolean) {
		translucent = _translucent;
	}
	public function SetActive(_active: boolean) {
		active = _active;
	}
}