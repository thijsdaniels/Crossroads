# Crossroads

### Somewhere between the second and third dimensions.

# Task List

## Game Mechanics

### Aiming System <code>DONE</code>
- A crosshair is displayed on the HUD whenever it is relevant.
- The crosshair behaves like it does in Worms, so it can move in an arc of 180 degrees around the player.
- When the button for a 'projectile' item is pressed, the player starts charging, as visualized by an, again Worms-like, force meter.
- When that same button is released, the item is launched at the angle of the crosshair and with the force of the meter.
- Think of the crosshair and the force meter together as a vector, where the crosshair is the directional component.

### Controls
- The controls will be similar to zelda.
- An item can be mapped to each of the D-Pad buttons from the inventory.
- If the player presses a D-Pad button, that item is activated, so in case of a bomb, the player will now hold a bomb.
- The A Button will always be used for jumping (this is a platformer after all).
- The X Button will be the primary attack button and it activates whichever item is currently held. If the player is holding a bomb, it will throw the bomb. If the player is holding a sword, it will slash the sword, if the player is holding nothing, it will punch I guess.
- The B-Button will be context sensitive, so that it can be used to pick up an object, talk to people, open treasure chests, et cetera.
- The Y Button is still free.
- The Right Stick, importantly, will be used for camera control. The vertical axis simply controls height and distance, but the horizontal axis will be used to turn the player.
- The Left Stick will of course be used to walk, but its vertical axis, when not climbing, will be used to aim.
- The shoulder buttons are still free. As an alternative to the horizontal right stick axis, turning the player can also be mapped to the shoulder buttons.
- The triggers are still free.
- How will the player run?
  - Pushing the left stick button?
  - Dashing the left stick, like in smash bros?
  - With the X Button when nothing is equiped (which would mean the player cannot attack in this case, and cannot run when something is equipped)?
  - Make it so that the player jumps on releasing the A Button and runs while the A Button is still pressed (which would mean that the player would forcefully jump when it would stop running)?

### Health System <code>done</code>
- Copied off of Zelda, the player has a certain amount of hearts, each consisting of 4 health units.

### Fix Player Movement
- What is the correct way to move a rigidbody? Should it be translated, or should a force be applied? The latter seems to work better, but is still not very smooth. Or do all terrain blocks need to have a rigidbody component as well? Or a terrain-collider perhaps?
- The player should be bound to the path. What is the best way of doing this? Probably to set a fixed height for the world (say 256 voxels) and make invisible wall colliders of 256 voxels high at the dead end of every path. The main problem that arises from this approach is that if there is a path right above a dead end, that path will be blocked by the invisible wall. This may be solved by setting the height of these invisible walls by hand, but his must be done carefully to avoid gamebreakers.

### Climbables
- Climbables, such as ladders, may be on a track as well as next to a track.
- If a climbable is on a track, the camera will turn to face the ladder when the player starts climbing and will return to be perpendicular to the player when the player stops climbing.
- If a climbable is next to the track, instead the player will turn to face the ladder when the player starts climbing. the camera will then switch to be perpendicular to the player when the player stops climbing.
- Should ladders that are next to the track on the camera-side be visible and climbable?

## Voxel-Engine
- Make chunks, that each contain a certain number of terrain voxels.
- Each chunk should have a method for rendering the sides of its voxels according to their neighboring voxels.
- Each terrain voxel should call a re-render of its chunk when it is destroyed or created.
- The terrain (and other relevant game objects) that are on the camera-side of the player will be disabled, with the exception of the row right in front of the player. This way, nothing unintentionally blocks the view and things like treasure chests and NPCs, which must be in the rows adjacent to the player's track anyway, will still be visible.

## Gameplay

### Puzzle Elements
- A gimmicky but fun puzzle element could be a two-way crossroads that can be spun around, so that you can only walk certain ways when the crossroads is in the correct orientation. This is a blatant copy of this type of rooms in 2D zelda games. Also, it would only work if the player is bounded by the path.