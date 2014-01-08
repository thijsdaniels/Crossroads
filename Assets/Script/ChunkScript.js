#pragma strict

// constants
public static var CHUNK_SIZE: Vector3 = Vector3(16, 32, 16);
public static var AHEAD: int = -1;
public static var INTERSECT: int = 0;
public static var BEHIND: int = 1;
public static var ATLAS_SIZE: Vector2 = Vector2(16f, 4f);
public static var DEBUG_COUNT: int = 0;

// members
private var origin: Vector3;
private var blocks: ArrayList;
private var filterMesh: Mesh;
private var colliderMesh: Mesh;
private var meshFilter: MeshFilter;
private var meshCollider: MeshCollider;

function Start () {
}

function Update () {
}

// initializes the chunk
public function Initialize(_origin: Vector3) {

	origin = _origin;
	
	// get mesh components
	meshFilter = GetComponent(MeshFilter);
	meshCollider = GetComponent(MeshCollider);

	// build the chunk
	blocks = new ArrayList();
	for (var x = 0; x < CHUNK_SIZE.x; x++) {
		for (var y = 0; y < CHUNK_SIZE.y; y++) {
			for (var z = 0; z < CHUNK_SIZE.x; z++) {
				var index = origin + Vector3(x, y, z);
				if (TerrainScript.InRange(index)) {
					var block = TerrainScript.TERRAIN[index.x, index.y, index.z];
					if (block) {
						blocks.Add(block);
					}
				}
			}
		}
	}

	// render the chunk
	Render();

	// add a water collider mesh to the chunk
	Flood();
}


public function Flood() {

	if (IsEmpty()) return;

	var nonWater:int = 0;

	// initialize containers for water mesh
	var waterVertices = new Array();
	var waterTriangles = new Array();

	// initialize containers for surface mesh
	var surfaceVertices = new Array();
	var surfaceTriangles = new Array();

	for (var block: Block in blocks) {

		if (!block.material.IsWater()) {
			nonWater++;
			continue;
		}

		var localPosition = block.position;// - transform.position;
		var waterVertexIndex: int = 0;
		var surfaceVertexIndex: int = 0;

		if (ShouldGenerateWaterFace(block.index, Vector3.up)) {

			waterVertexIndex = waterVertices.length;

			waterVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));
			waterVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));
			waterVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));
			waterVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));

			waterTriangles.Add(waterVertexIndex);
			waterTriangles.Add(waterVertexIndex + 1);
			waterTriangles.Add(waterVertexIndex + 2);

			waterTriangles.Add(waterVertexIndex + 2);
			waterTriangles.Add(waterVertexIndex + 3);
			waterTriangles.Add(waterVertexIndex);

			surfaceVertexIndex = surfaceVertices.length;

			surfaceVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));
			surfaceVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));
			surfaceVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));
			surfaceVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));

			surfaceTriangles.Add(surfaceVertexIndex);
			surfaceTriangles.Add(surfaceVertexIndex + 3);
			surfaceTriangles.Add(surfaceVertexIndex + 2);

			surfaceTriangles.Add(surfaceVertexIndex + 2);
			surfaceTriangles.Add(surfaceVertexIndex + 1);
			surfaceTriangles.Add(surfaceVertexIndex);
		}

		if (ShouldGenerateWaterFace(block.index, Vector3.back)) {

			waterVertexIndex = waterVertices.length;

			waterVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));
			waterVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));
			waterVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));
			waterVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));

			waterTriangles.Add(waterVertexIndex);
			waterTriangles.Add(waterVertexIndex + 1);
			waterTriangles.Add(waterVertexIndex + 2);

			waterTriangles.Add(waterVertexIndex + 2);
			waterTriangles.Add(waterVertexIndex + 3);
			waterTriangles.Add(waterVertexIndex);
		}

		if (ShouldGenerateWaterFace(block.index, Vector3.left)) {

			waterVertexIndex = waterVertices.length;

			waterVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));
			waterVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));
			waterVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));
			waterVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));

			waterTriangles.Add(waterVertexIndex);
			waterTriangles.Add(waterVertexIndex + 1);
			waterTriangles.Add(waterVertexIndex + 2);

			waterTriangles.Add(waterVertexIndex + 2);
			waterTriangles.Add(waterVertexIndex + 3);
			waterTriangles.Add(waterVertexIndex);
		}

		if (ShouldGenerateWaterFace(block.index, Vector3.forward)) {

			waterVertexIndex = waterVertices.length;

			waterVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));
			waterVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));
			waterVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));
			waterVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));

			waterTriangles.Add(waterVertexIndex);
			waterTriangles.Add(waterVertexIndex + 1);
			waterTriangles.Add(waterVertexIndex + 2);

			waterTriangles.Add(waterVertexIndex + 2);
			waterTriangles.Add(waterVertexIndex + 3);
			waterTriangles.Add(waterVertexIndex);
		}

		if (ShouldGenerateWaterFace(block.index, Vector3.right)) {

			waterVertexIndex = waterVertices.length;

			waterVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));
			waterVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));
			waterVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));
			waterVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));

			waterTriangles.Add(waterVertexIndex);
			waterTriangles.Add(waterVertexIndex + 1);
			waterTriangles.Add(waterVertexIndex + 2);

			waterTriangles.Add(waterVertexIndex + 2);
			waterTriangles.Add(waterVertexIndex + 3);
			waterTriangles.Add(waterVertexIndex);
		}

		if (ShouldGenerateWaterFace(block.index, Vector3.down)) {

			waterVertexIndex = waterVertices.length;

			waterVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));
			waterVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));
			waterVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));
			waterVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));

			waterTriangles.Add(waterVertexIndex);
			waterTriangles.Add(waterVertexIndex + 1);
			waterTriangles.Add(waterVertexIndex + 2);

			waterTriangles.Add(waterVertexIndex + 2);
			waterTriangles.Add(waterVertexIndex + 3);
			waterTriangles.Add(waterVertexIndex);
		}
	}

	if (nonWater == blocks.Count) return;

	// create water and surface child objects
	var water: GameObject = new GameObject('Water');
	water.transform.parent = transform;
	var waterCollider = water.AddComponent(MeshCollider);
	waterCollider.convex = true;
	waterCollider.isTrigger = true;
	water.AddComponent(WaterScript);

	var surface: GameObject = new GameObject('Surface');
	surface.transform.parent = water.transform;
	var surfaceCollider = surface.AddComponent(MeshCollider);
	surfaceCollider.isTrigger = true;
	surface.layer = WaterScript.SURFACE_LAYER;

	// build filter mesh
	var waterMesh: Mesh = new Mesh();
	waterMesh.vertices = waterVertices;
	waterMesh.triangles = waterTriangles;
	waterCollider.mesh = waterMesh;

	// build collider mesh
	var surfaceMesh: Mesh = new Mesh();
	surfaceMesh.vertices = surfaceVertices;
	surfaceMesh.triangles = surfaceTriangles;
	surfaceCollider.mesh = surfaceMesh;
}

function ShouldGenerateWaterFace(index: Vector3, direction: Vector3): boolean {
	return !TerrainScript.IsWater(index + direction);
}

//////////////////////////////
///////// RENDERING //////////
//////////////////////////////

// renders the chunk
public function Render() {

	/**
	 * @todo An improvement would be to remove the empty chunk objects entirely.
	 */
	// don't do anything if the chunk does not contain any blocks
	if (IsEmpty()) return;

	/**
	 * @todo An improvement would be to leave the mesh as is, and to only remove
	 * the vertices behind the slice position and to build the vertices on the
	 * slice position.
	 */
	// clear both meshes, because it has to be rebuilt
	if (meshFilter.mesh) meshFilter.mesh.Clear();
	if (meshCollider.mesh) meshCollider.mesh.Clear();

	// initialize containers for filter mesh
	var filterVertices = new Array();
	var filterTriangles = new Array();
	var subTriangles = new Array();
	var filterUVs = new Array();

	// initialize containers for collider mesh
	var colliderVertices = new Array();
	var colliderTriangles = new Array();
	var colliderUVs = new Array();

	for (var block: Block in blocks) {
		
		var localPosition = block.position - transform.position; // since vertice positions are in local space
		var texture: float = block.material.GetTexture() / ATLAS_SIZE.x;
		var variant: int = block.material.GetVariant(block.index);
		var filterVertexIndex: int = 0;
		var colliderVertexIndex: int = 0;

		/**
		 * @todo The main body of the function creates triangles and vertices 
		 * where necessary. It deals with six different scenarios one for each
		 * side of the block, for several different types of terrain. Since the
		 * process is the same for each scenario, abstract this process to avoid
		 * duplicate code.
		 */

		if (block.IsActive()) {

			if (ShouldRenderVisual(block.index, Vector3.up)) {

				filterVertexIndex = filterVertices.length;

				filterVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));
				filterVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));
				filterVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));
				filterVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));

				if (block.material.IsOpaque()) {

					filterTriangles.Add(filterVertexIndex);
					filterTriangles.Add(filterVertexIndex + 1);
					filterTriangles.Add(filterVertexIndex + 2);

					filterTriangles.Add(filterVertexIndex + 2);
					filterTriangles.Add(filterVertexIndex + 3);
					filterTriangles.Add(filterVertexIndex);

				} else {

					subTriangles.Add(filterVertexIndex);
					subTriangles.Add(filterVertexIndex + 1);
					subTriangles.Add(filterVertexIndex + 2);

					subTriangles.Add(filterVertexIndex + 2);
					subTriangles.Add(filterVertexIndex + 3);
					subTriangles.Add(filterVertexIndex);
				}

				filterUVs.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
				filterUVs.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
				filterUVs.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
				filterUVs.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
			}

			if (ShouldRenderVisual(block.index, Vector3.back)) {

				filterVertexIndex = filterVertices.length;

				filterVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));
				filterVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));
				filterVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));
				filterVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));

				if (block.material.IsOpaque()) {

					filterTriangles.Add(filterVertexIndex);
					filterTriangles.Add(filterVertexIndex + 1);
					filterTriangles.Add(filterVertexIndex + 2);

					filterTriangles.Add(filterVertexIndex + 2);
					filterTriangles.Add(filterVertexIndex + 3);
					filterTriangles.Add(filterVertexIndex);

				} else {

					subTriangles.Add(filterVertexIndex);
					subTriangles.Add(filterVertexIndex + 1);
					subTriangles.Add(filterVertexIndex + 2);

					subTriangles.Add(filterVertexIndex + 2);
					subTriangles.Add(filterVertexIndex + 3);
					subTriangles.Add(filterVertexIndex);
				}

				filterUVs.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
				filterUVs.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
				filterUVs.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
				filterUVs.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
			}

			if (ShouldRenderVisual(block.index, Vector3.left)) {

				filterVertexIndex = filterVertices.length;

				filterVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));
				filterVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));
				filterVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));
				filterVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));

				if (block.material.IsOpaque()) {

					filterTriangles.Add(filterVertexIndex);
					filterTriangles.Add(filterVertexIndex + 1);
					filterTriangles.Add(filterVertexIndex + 2);

					filterTriangles.Add(filterVertexIndex + 2);
					filterTriangles.Add(filterVertexIndex + 3);
					filterTriangles.Add(filterVertexIndex);

				} else {

					subTriangles.Add(filterVertexIndex);
					subTriangles.Add(filterVertexIndex + 1);
					subTriangles.Add(filterVertexIndex + 2);

					subTriangles.Add(filterVertexIndex + 2);
					subTriangles.Add(filterVertexIndex + 3);
					subTriangles.Add(filterVertexIndex);
				}

				filterUVs.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
				filterUVs.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
				filterUVs.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
				filterUVs.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
			}

			if (ShouldRenderVisual(block.index, Vector3.forward)) {

				filterVertexIndex = filterVertices.length;

				filterVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));
				filterVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));
				filterVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));
				filterVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));

				if (block.material.IsOpaque()) {

					filterTriangles.Add(filterVertexIndex);
					filterTriangles.Add(filterVertexIndex + 1);
					filterTriangles.Add(filterVertexIndex + 2);

					filterTriangles.Add(filterVertexIndex + 2);
					filterTriangles.Add(filterVertexIndex + 3);
					filterTriangles.Add(filterVertexIndex);

				} else {

					subTriangles.Add(filterVertexIndex);
					subTriangles.Add(filterVertexIndex + 1);
					subTriangles.Add(filterVertexIndex + 2);

					subTriangles.Add(filterVertexIndex + 2);
					subTriangles.Add(filterVertexIndex + 3);
					subTriangles.Add(filterVertexIndex);
				}

				filterUVs.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
				filterUVs.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
				filterUVs.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
				filterUVs.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
			}

			if (ShouldRenderVisual(block.index, Vector3.right)) {

				filterVertexIndex = filterVertices.length;

				filterVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));
				filterVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));
				filterVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));
				filterVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));

				if (block.material.IsOpaque()) {

					filterTriangles.Add(filterVertexIndex);
					filterTriangles.Add(filterVertexIndex + 1);
					filterTriangles.Add(filterVertexIndex + 2);

					filterTriangles.Add(filterVertexIndex + 2);
					filterTriangles.Add(filterVertexIndex + 3);
					filterTriangles.Add(filterVertexIndex);

				} else {

					subTriangles.Add(filterVertexIndex);
					subTriangles.Add(filterVertexIndex + 1);
					subTriangles.Add(filterVertexIndex + 2);

					subTriangles.Add(filterVertexIndex + 2);
					subTriangles.Add(filterVertexIndex + 3);
					subTriangles.Add(filterVertexIndex);
				}

				filterUVs.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
				filterUVs.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
				filterUVs.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
				filterUVs.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
			}

			if (ShouldRenderVisual(block.index, Vector3.down)) {

				filterVertexIndex = filterVertices.length;

				filterVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));
				filterVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));
				filterVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));
				filterVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));

				if (block.material.IsOpaque()) {

					filterTriangles.Add(filterVertexIndex);
					filterTriangles.Add(filterVertexIndex + 1);
					filterTriangles.Add(filterVertexIndex + 2);

					filterTriangles.Add(filterVertexIndex + 2);
					filterTriangles.Add(filterVertexIndex + 3);
					filterTriangles.Add(filterVertexIndex);

				} else {

					subTriangles.Add(filterVertexIndex);
					subTriangles.Add(filterVertexIndex + 1);
					subTriangles.Add(filterVertexIndex + 2);

					subTriangles.Add(filterVertexIndex + 2);
					subTriangles.Add(filterVertexIndex + 3);
					subTriangles.Add(filterVertexIndex);
				}

				filterUVs.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
				filterUVs.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
				filterUVs.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
				filterUVs.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
			}
		}

		if (block.material.IsSolid()) {

			if (ShouldRenderPhysical(block.index, Vector3.up)) {

				colliderVertexIndex = colliderVertices.length;

				colliderVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));
				colliderVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));
				colliderVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));
				colliderVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));

				colliderTriangles.Add(colliderVertexIndex);
				colliderTriangles.Add(colliderVertexIndex + 1);
				colliderTriangles.Add(colliderVertexIndex + 2);

				colliderTriangles.Add(colliderVertexIndex + 2);
				colliderTriangles.Add(colliderVertexIndex + 3);
				colliderTriangles.Add(colliderVertexIndex);

				colliderUVs.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
				colliderUVs.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
				colliderUVs.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
				colliderUVs.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
			}

			if (ShouldRenderPhysical(block.index, Vector3.back)) {

				colliderVertexIndex = colliderVertices.length;

				colliderVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));
				colliderVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));
				colliderVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));
				colliderVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));

				colliderTriangles.Add(colliderVertexIndex);
				colliderTriangles.Add(colliderVertexIndex + 1);
				colliderTriangles.Add(colliderVertexIndex + 2);

				colliderTriangles.Add(colliderVertexIndex + 2);
				colliderTriangles.Add(colliderVertexIndex + 3);
				colliderTriangles.Add(colliderVertexIndex);

				colliderUVs.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
				colliderUVs.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
				colliderUVs.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
				colliderUVs.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
			}

			if (ShouldRenderPhysical(block.index, Vector3.left)) {

				colliderVertexIndex = colliderVertices.length;

				colliderVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));
				colliderVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));
				colliderVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));
				colliderVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));

				colliderTriangles.Add(colliderVertexIndex);
				colliderTriangles.Add(colliderVertexIndex + 1);
				colliderTriangles.Add(colliderVertexIndex + 2);

				colliderTriangles.Add(colliderVertexIndex + 2);
				colliderTriangles.Add(colliderVertexIndex + 3);
				colliderTriangles.Add(colliderVertexIndex);

				colliderUVs.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
				colliderUVs.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
				colliderUVs.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
				colliderUVs.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
			}

			if (ShouldRenderPhysical(block.index, Vector3.forward)) {

				colliderVertexIndex = colliderVertices.length;

				colliderVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));
				colliderVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));
				colliderVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));
				colliderVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));

				colliderTriangles.Add(colliderVertexIndex);
				colliderTriangles.Add(colliderVertexIndex + 1);
				colliderTriangles.Add(colliderVertexIndex + 2);

				colliderTriangles.Add(colliderVertexIndex + 2);
				colliderTriangles.Add(colliderVertexIndex + 3);
				colliderTriangles.Add(colliderVertexIndex);

				colliderUVs.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
				colliderUVs.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
				colliderUVs.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
				colliderUVs.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
			}

			if (ShouldRenderPhysical(block.index, Vector3.right)) {

				colliderVertexIndex = colliderVertices.length;

				colliderVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));
				colliderVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));
				colliderVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y + Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));
				colliderVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));

				colliderTriangles.Add(colliderVertexIndex);
				colliderTriangles.Add(colliderVertexIndex + 1);
				colliderTriangles.Add(colliderVertexIndex + 2);

				colliderTriangles.Add(colliderVertexIndex + 2);
				colliderTriangles.Add(colliderVertexIndex + 3);
				colliderTriangles.Add(colliderVertexIndex);

				colliderUVs.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
				colliderUVs.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
				colliderUVs.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
				colliderUVs.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
			}

			if (ShouldRenderPhysical(block.index, Vector3.down)) {

				colliderVertexIndex = colliderVertices.length;

				colliderVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));
				colliderVertices.Add(Vector3(localPosition.x - Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));
				colliderVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z - Block.BLOCK_SIZE));
				colliderVertices.Add(Vector3(localPosition.x + Block.BLOCK_SIZE, localPosition.y - Block.BLOCK_SIZE, localPosition.z + Block.BLOCK_SIZE));

				colliderTriangles.Add(colliderVertexIndex);
				colliderTriangles.Add(colliderVertexIndex + 1);
				colliderTriangles.Add(colliderVertexIndex + 2);

				colliderTriangles.Add(colliderVertexIndex + 2);
				colliderTriangles.Add(colliderVertexIndex + 3);
				colliderTriangles.Add(colliderVertexIndex);

				colliderUVs.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
				colliderUVs.Add(Vector2(texture + 0 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
				colliderUVs.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 1 / ATLAS_SIZE.y));
				colliderUVs.Add(Vector2(texture + 1 / ATLAS_SIZE.x, variant + 0 / ATLAS_SIZE.y));
			}
		}
	}

	// build filter mesh
	filterMesh = new Mesh();
	filterMesh.subMeshCount = 2;
	filterMesh.vertices = filterVertices;
	filterMesh.SetTriangles(filterTriangles.ToBuiltin(int), 0);
	filterMesh.SetTriangles(subTriangles.ToBuiltin(int), 1);
	filterMesh.uv = filterUVs;
	filterMesh.RecalculateNormals();
	filterMesh.RecalculateBounds();
	filterMesh.Optimize();
	meshFilter.mesh = filterMesh;

	// build collider mesh
	colliderMesh = new Mesh();
	colliderMesh.vertices = colliderVertices;
	colliderMesh.triangles = colliderTriangles;
	colliderMesh.uv = colliderUVs;
	colliderMesh.RecalculateNormals();
	colliderMesh.RecalculateBounds();
	colliderMesh.Optimize();
	meshCollider.mesh = colliderMesh;
}

public function ShouldRenderVisual(index: Vector3, direction: Vector3): boolean {
	if (!TerrainScript.IsOccupied(index + direction)) return true;
	if (!TerrainScript.IsOpaque(index + direction) && !TerrainScript.SameMaterial(index, index + direction)) return true;
	if (!TerrainScript.IsActive(index + direction)) return true;
	return false;
}

public function ShouldRenderPhysical(index: Vector3, direction: Vector3): boolean {
	if (!TerrainScript.IsOccupied(index + direction)) return true;
	if (!TerrainScript.IsOpaque(index + direction) && !TerrainScript.SameMaterial(index, index + direction)) return true;
	return false;
}

public function IsEmpty() {
	return blocks.Count == 0;
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

	for (var block: Block in blocks) {

		if (axis == EnvironmentScript.X_AXIS) {

			if (direction == EnvironmentScript.NORTH) {

				if (block.position.z < position) {
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

				if (block.position.z > position) {
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

				if (block.position.x < position) {
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

				if (block.position.x > position) {
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
	for (var block: Block in blocks) {
		block.SetActive(true);
	}
	Show();
	Render();
}