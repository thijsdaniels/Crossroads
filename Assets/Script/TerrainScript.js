#pragma strict

public static var TERRAIN_OBJECTS: ArrayList;
public static var TERRAIN_SIZE: Vector3;
public static var TERRAIN_OFFSET: Vector3;
public static var TERRAIN: Block[,,];
public static var CHUNKS: ArrayList;

private static var MIN_X: float = Mathf.Infinity;
private static var MIN_Y: float = Mathf.Infinity;
private static var MIN_Z: float = Mathf.Infinity;
private static var MAX_X: float = Mathf.NegativeInfinity;
private static var MAX_Y: float = Mathf.NegativeInfinity;
private static var MAX_Z: float = Mathf.NegativeInfinity;

public var generate: boolean = false;
public var heightmap: Texture2D;
public var chunkPrefab: GameObject;
public var waterPrefab: GameObject;

function Start () {
	
	if (generate) {
		GenerateTerrain();
	}
	
	else {
		PrepareTerrain();
		IndexTerrain();
		UnsetTerrain();
	}
	
	CreateChunks();
}

function Update () {
}

// generates terrain using perlin noise (mostly for fun, but useful for tweaking performance)
function GenerateTerrain() {

	var startTime = Time.realtimeSinceStartup * 1000;
	
	TERRAIN_SIZE =  Vector3(heightmap.width, 64, heightmap.height);
	TERRAIN_OFFSET = Vector3(0, 0, 0);

	var heightOffset = 0;
	
	TERRAIN = new Block[TERRAIN_SIZE.x, TERRAIN_SIZE.y, TERRAIN_SIZE.z];
	
	for (var x: int = 0; x < TERRAIN_SIZE.x; x++) {
		for (var z: int = 0; z < TERRAIN_SIZE.z; z++) {

			var height = heightOffset + Mathf.Ceil(heightmap.GetPixel(x, z).grayscale * (TERRAIN_SIZE.y - heightOffset));

			for (var y: int = 0; y < TERRAIN_SIZE.y; y++) {
				
				var material = BlockMaterial.DIRT;
				if (y == height - 1) material = BlockMaterial.GRASS;
				if (y < height - 10) material = BlockMaterial.ROCK;

				if (y >= height) continue;
				
				TERRAIN[x, y, z] = new Block(Vector3(x, y, z), material);
			}
		}
	}

	var processingTime = Time.realtimeSinceStartup * 1000 - startTime;
	Debug.Log('TERRAIN: Generated a ' + heightmap.width + ' by ' + heightmap.height + ' World in ' + startTime.ToString('f0') + ' milliseconds.');
	
}

function PrepareTerrain() {

	var startTime = Time.realtimeSinceStartup * 1000;
	
	// traverse the terrain tree
	TERRAIN_OBJECTS = new ArrayList();
	TraverseTerrain(this.gameObject);
	
	// store terrain boundaries
	TERRAIN_SIZE =  Vector3(MAX_X - MIN_X + 1, MAX_Y - MIN_Y + 1, MAX_Z - MIN_Z + 1) / Block.BLOCK_SPAN;
	TERRAIN_OFFSET = Vector3(MIN_X, MIN_Y, MIN_Z);

	var processingTime = Time.realtimeSinceStartup * 1000 - startTime;
	Debug.Log('TERRAIN: Prepared ' + TERRAIN_OBJECTS.Count + ' Blocks in ' + startTime.ToString('f0') + ' milliseconds.');

}

function TraverseTerrain(node: GameObject) {

	if (node.transform.childCount == 0) Visit(node);
	else {
		for (var i: int = 0; i < node.transform.childCount; i++) {
			TraverseTerrain(node.transform.GetChild(i).gameObject);
		}
	}
}

function Visit(node: GameObject) {

	// @todo align node position
	// @todo align node rotation

	// correct for rotation
	var worldScale = node.transform.TransformDirection(node.transform.localScale);
	worldScale = Vector3(Mathf.Abs(worldScale.x), Mathf.Abs(worldScale.y), Mathf.Abs(worldScale.z));

	// calculate node span
	var minX = node.transform.position.x - (worldScale.x / Block.BLOCK_SPAN - 1) * Block.BLOCK_SIZE;
	var maxX = node.transform.position.x + (worldScale.x / Block.BLOCK_SPAN - 1) * Block.BLOCK_SIZE;
	var minY = node.transform.position.y - (worldScale.y / Block.BLOCK_SPAN - 1) * Block.BLOCK_SIZE;
	var maxY = node.transform.position.y + (worldScale.y / Block.BLOCK_SPAN - 1) * Block.BLOCK_SIZE;
	var minZ = node.transform.position.z - (worldScale.z / Block.BLOCK_SPAN - 1) * Block.BLOCK_SIZE;
	var maxZ = node.transform.position.z + (worldScale.z / Block.BLOCK_SPAN - 1) * Block.BLOCK_SIZE;

	// update terrain boundaries
	MIN_X = Mathf.Min(MIN_X, minX);
	MAX_X = Mathf.Max(MAX_X, maxX);
	MIN_Y = Mathf.Min(MIN_Y, minY);
	MAX_Y = Mathf.Max(MAX_Y, maxY);
	MIN_Z = Mathf.Min(MIN_Z, minZ);
	MAX_Z = Mathf.Max(MAX_Z, maxZ);
	
	// store node
	TERRAIN_OBJECTS.Add(node);
}

function IndexTerrain() {

	var startTime = Time.realtimeSinceStartup * 1000;
	
	// build terrain
	TERRAIN = new Block[TERRAIN_SIZE.x, TERRAIN_SIZE.y, TERRAIN_SIZE.z];
	for (var i: int = 0; i < TERRAIN_OBJECTS.Count; i++) {
	
		// get block position
		var block: GameObject = TERRAIN_OBJECTS[i];
		
		// get block material from tag
		var material = parseInt(block.tag);

		// correct for rotation
		var worldScale = block.transform.TransformDirection(block.transform.localScale);
		worldScale = Vector3(Mathf.Abs(worldScale.x), Mathf.Abs(worldScale.y), Mathf.Abs(worldScale.z));

		// calculate block span
		var minX = block.transform.position.x - (worldScale.x / Block.BLOCK_SPAN - 1) * Block.BLOCK_SIZE;
		var maxX = block.transform.position.x + (worldScale.x / Block.BLOCK_SPAN - 1) * Block.BLOCK_SIZE;
		var minY = block.transform.position.y - (worldScale.y / Block.BLOCK_SPAN - 1) * Block.BLOCK_SIZE;
		var maxY = block.transform.position.y + (worldScale.y / Block.BLOCK_SPAN - 1) * Block.BLOCK_SIZE;
		var minZ = block.transform.position.z - (worldScale.z / Block.BLOCK_SPAN - 1) * Block.BLOCK_SIZE;
		var maxZ = block.transform.position.z + (worldScale.z / Block.BLOCK_SPAN - 1) * Block.BLOCK_SIZE;

		for (var x: float = minX; x <= maxX; x += Block.BLOCK_SPAN) {
			for (var y: float = minY; y <= maxY; y += Block.BLOCK_SPAN) {
				for (var z: float = minZ; z <= maxZ; z += Block.BLOCK_SPAN) {

					var index = Position2Index(Vector3(x, y, z));

					// create block in terrain array
					if (TERRAIN[index.x, index.y, index.z] != null) Debug.LogWarning('TERRAIN: Duplicate Block found at ' + block.transform.position);
					TERRAIN[index.x, index.y, index.z] = new Block(index, material);
				}
			}
		}
	}

	var processingTime = Time.realtimeSinceStartup * 1000 - startTime;
	Debug.Log('TERRAIN: Indexed terrain in ' + processingTime.ToString('f0') + ' milliseconds.');
	
}

function UnsetTerrain() {

	var startTime = Time.realtimeSinceStartup * 1000;

	for (var object: GameObject in TERRAIN_OBJECTS) {
		Destroy(object);
	}
	TERRAIN_OBJECTS = null;

	var processingTime = Time.realtimeSinceStartup * 1000 - startTime;
	Debug.Log('TERRAIN: Unset terrain in ' + processingTime.ToString('f0') + ' milliseconds.');
}

// converts a worldspace coordinate to a terrain index
public static function Position2Index(position: Vector3): Vector3 {
	return (position - TERRAIN_OFFSET) / Block.BLOCK_SPAN;
}

// converts an index to a worldspace coordinate
public static function Index2Position(index: Vector3): Vector3 {
	return index * Block.BLOCK_SPAN + TERRAIN_OFFSET;
}

// builds chunks using the terrain array
function CreateChunks() {

	var startTime = Time.realtimeSinceStartup * 1000;

	// initialize chunks
	CHUNKS = new ArrayList();
	for (var x = 0; x < TERRAIN_SIZE.x; x += ChunkScript.CHUNK_SIZE.x) {
		for (var y = 0; y < TERRAIN_SIZE.y; y += ChunkScript.CHUNK_SIZE.y) {
			for (var z = 0; z < TERRAIN_SIZE.z; z += ChunkScript.CHUNK_SIZE.x) {
			
				// instantiate a chunk
				var origin: Vector3 = Vector3(x, y, z);
				var position: Vector3 = Index2Position(origin);
				var chunk: GameObject = Instantiate(chunkPrefab, position, Quaternion.identity);
				CHUNKS.Add(chunk);
				
				// initialize the chunk
				var chunkScript: ChunkScript = chunk.GetComponent(ChunkScript);
				chunkScript.Initialize(origin);
			}
		}
	}

	var processingTime = Time.realtimeSinceStartup * 1000 - startTime;
	Debug.Log('TERRAIN: Built ' + CHUNKS.Count + ' Chunks in ' + processingTime.ToString('f0') + ' milliseconds.');
}

public function CreateWater() {

	var startTime = Time.realtimeSinceStartup * 1000;
	var columnCount: int = 0;

	for (var x = 0; x < TERRAIN_SIZE.x; x++) {
		for (var z = 0; z < TERRAIN_SIZE.z; z++) {

			var columnArray = new Array();

			for (var y = 0; y < TERRAIN_SIZE.y; y++) {

				var block: Block = TERRAIN[x, y, z];

				if (block == null || !block.material.IsWater()) {

					if (columnArray.length > 0) {

						var scale: Vector3 = Vector3(Block.BLOCK_SPAN, columnArray.length * Block.BLOCK_SPAN, Block.BLOCK_SPAN);
						var index: Vector3 = Vector3(x, y - columnArray.length / 2f - Block.BLOCK_SPAN, z);
						var position: Vector3 = Index2Position(index);

						var column = Instantiate(waterPrefab, position, Quaternion.identity);
						column.transform.localScale = scale;

						columnArray.Clear();
						columnCount++;
					}
				}
				
				else if (block.material.IsWater()) columnArray.Push(block);
			}
		}
	}

	var processingTime = Time.realtimeSinceStartup * 1000 - startTime;
	Debug.Log('TERRAIN: Built ' + columnCount + ' Water Columns in ' + processingTime.ToString('f0') + ' milliseconds.');
}

public static function Slice(axis: int, position: float, direction: int) {

	var chunksSliced = 0;
	var startTime = Time.realtimeSinceStartup * 1000;

	for (var chunk: GameObject in CHUNKS) {

		// get the chunk's position relative to the track
		var chunkScript: ChunkScript = chunk.GetComponent(ChunkScript);
		var chunkPosition = chunkScript.GetSlicePosition(axis, position, direction);

		// determine what to do with the chunk based on its position
		switch (chunkPosition) {

			// if the chunk is intersected by the track, slice it
			case ChunkScript.INTERSECT:
				chunkScript.Slice(axis, position, direction);
				chunksSliced++;
				break;

			// if the chunk is ahead of the track, hide it
			case ChunkScript.AHEAD:
				chunkScript.Hide();
				break;

			// if the chunk is behind the track, show it
			case ChunkScript.BEHIND:
				chunkScript.ShowAll();
				break;
		}
	}

	var processingTime = Time.realtimeSinceStartup * 1000 - startTime;
	Debug.Log('TERRAIN: Sliced ' + chunksSliced + ' chunks in ' + processingTime.ToString('f0') + ' milliseconds.');
}

public static function InRange(index: Vector3): boolean {
	if (index.x < 0 || index.x >= TERRAIN_SIZE.x) return false;
	if (index.y < 0 || index.y >= TERRAIN_SIZE.y) return false;
	if (index.z < 0 || index.z >= TERRAIN_SIZE.z) return false;
	return true;
}

public static function IsOccupied(index: Vector3): boolean {
	
	if (!InRange(index)) return false;
	
	var block: Block = TERRAIN[index.x, index.y, index.z];
	if (block == null) return false;
	
	return true;
}

public static function IsOpaque(index: Vector3): boolean {

	if (!IsOccupied(index)) return false;

	var block: Block = TERRAIN[index.x, index.y, index.z];
	return block.material.IsOpaque();
}

public static function SameMaterial(index1: Vector3, index2: Vector3): boolean {

	if (!IsOccupied(index1) || !IsOccupied(index2)) return false;

	var block1: Block = TERRAIN[index1.x, index1.y, index1.z];
	var block2: Block = TERRAIN[index2.x, index2.y, index2.z];
	
	return (block1.material.id == block2.material.id);
}

public static function IsActive(index: Vector3): boolean {

	if (!IsOccupied(index)) return false;

	var block: Block = TERRAIN[index.x, index.y, index.z];
	return block.IsActive();
}

public static function IsWater(index: Vector3): boolean {

	if (!IsOccupied(index)) return false;

	var block: Block = TERRAIN[index.x, index.y, index.z];
	return block.material.IsWater();
}