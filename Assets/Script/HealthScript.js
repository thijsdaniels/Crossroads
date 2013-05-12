#pragma strict

public var maxHealth: int = 48;
public var health: int = 28;

// returns the amount of health the player has
public function GetHealth() {
	return health;
}

// returns the ratio of health left as part of the player's max health
public function GetHealthRatio() {
	return health / maxHealth;
}

// sets the health of the player
public function SetHealth(amount: int) {
	health = Mathf.Max(0, Mathf.Min(health + amount, maxHealth));
}

// returns the maximum health of the player
public function GetMaxHealth() {
	return maxHealth;
}

// sets the maximum health of the player
public function SetMaxHealth(amount: int) {
	amount = Mathf.Ceil(amount / 4) * 4;
	maxHealth = Mathf.Max(4, amount);
}

// increments the maximum health by a single unit
public function IncrementMaxHealth() {
	maxHealth += 4;
}

// instantly damages the player
public function InstantDamage(amount: int) {
	health = Mathf.Max(0, health - amount);
}

// instantly kills the player
public function InstantDeath() {
	health = 0;
}

// instantly heals the player
public function InstantHeal(amount: int) {
	health = Mathf.Min(maxHealth, health + amount);
}

// instantly fully heals the player
public function InstantFullHeal() {
	health = maxHealth;
}