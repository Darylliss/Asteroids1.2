let spaceshipImg;
let asteroidImg;
let galaxyImg;
let spaceship;
let asteroids = [];
const asteroidSpeed = 2;
let destroyedAsteroids = 0;
let spaceshipCreated = false;

function preload() {
  spaceshipImg = loadImage('Spaceship.png');
  asteroidImg = loadImage('Glowasteroid.png');
  galaxyImg = loadImage('Galaxy.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  spaceship = new Spaceship(spaceshipImg);
  setInterval(spawnAsteroids, 1000);
}

function spawnAsteroids() {
  if (!spaceship) return;

  let numAsteroids = 1 + floor(destroyedAsteroids / 10) * 0.2;
  for (let i = 0; i < numAsteroids; i++) {
    let pos;
    do {
      pos = createVector(random(width), random(height));
    } while (dist(pos.x, pos.y, spaceship.pos.x, spaceship.pos.y) < 200);
    asteroids.push(new Asteroid(asteroidImg, pos, null, 0.07, spaceship));
  }
}

function draw() {
  if (!spaceship) return;

  image(galaxyImg, 0, 0, width, height);

  let dx = mouseX - spaceship.pos.x;
  let dy = mouseY - spaceship.pos.y;
  let angle = atan2(dy, dx);
  spaceship.setAngle(angle + HALF_PI);

  spaceship.update();
  spaceship.display();

  for (let i = asteroids.length - 1; i >= 0; i--) {
    asteroids[i].update();
    asteroids[i].display();

    if (asteroids[i].collidesWith(spaceship)) {
      textSize(32);
      fill(255);
      text("Game Over", width / 2, height / 2);
      noLoop();
    }

    if (asteroids[i].isShot()) {
      destroyedAsteroids++;
      asteroids.splice(i, 1);
    }
  }

  textSize(24);
  fill(255);
  text(`Asteroids destroyed: ${destroyedAsteroids}`, 10, 30);
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    spaceship.applyForce(createVector(0, -1));
  } else if (keyCode === DOWN_ARROW) {
    spaceship.applyForce(createVector(0, 1));
  } else if (keyCode === LEFT_ARROW) {
    spaceship.applyForce(createVector(-1, 0));
  } else if (keyCode === RIGHT_ARROW) {
    spaceship.applyForce(createVector(1, 0));
  }
}

function mousePressed() {
  if (mouseButton === LEFT) {
    spaceship.shoot();
  }
}

class Spaceship {
  constructor(img) {
    this.img = img;
    this.scale = 0.05;
    this.pos = createVector(width / 2, height / 2);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.rotation = 3 * PI / 4;
    this.bullets = [];
    spaceshipCreated = true;
  }

  setAngle(angle) {
    this.rotation = angle;
  }

  update() {
    this.pos.add(this.vel);
    this.vel.add(this.acc);
    this.vel.limit(5);
    this.acc.mult(0);

    if (this.pos.x > width) {
      this.pos.x = 0;
    } else if (this.pos.x < 0) {
      this.pos.x = width;
    }
    if (this.pos.y > height) {
      this.pos.y = 0;
    } else if (this.pos.y < 0) {
      this.pos.y = height;
    }
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotation + HALF_PI + PI / 6);
    imageMode(CENTER);
    image(this.img, 0, 0, this.img.width * this.scale, this.img.height * this.scale);
    pop();

    for (let bullet of this.bullets) {
      bullet.update();
      bullet.display();

      if (bullet.offScreen()) {
        this.bullets.splice(this.bullets.indexOf(bullet), 1);
      }
    }
  }

  applyForce(force) {
    force.setMag(0.5);
    this.acc.add(force);
  }

  setRotation(angle) {
    this.rotation += angle;
  }

  shoot() {
    this.bullets.push(new Bullet(this.pos.copy(), this.rotation));
  }
}

class Asteroid {
  constructor(img, pos, vel, scale, spaceship) {
    this.img = img;
    this.scale = scale || 0.1;
    this.pos = pos;
    this.vel = vel || createVector(random(-asteroidSpeed, asteroidSpeed), random(-asteroidSpeed, asteroidSpeed));
    this.spaceship = spaceship;
    this.rotation = 0;
    this.rotationSpeed = random(-0.03, 0.03);
  }

  update() {
    this.pos.add(this.vel);
    this.rotation += this.rotationSpeed;
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotation);
    imageMode(CENTER);
    image(this.img, 0, 0, this.img.width * this.scale, this.img.height * this.scale);
    pop();
  }

  collidesWith(spaceship) {
    let d = dist(this.pos.x, this.pos.y, spaceship.pos.x, spaceship.pos.y);
    let minDist = (this.img.width * this.scale) / 2 + (spaceship.img.width * spaceship.scale) / 2;
    return d < minDist;
  }

  isShot() {
    if (!spaceshipCreated) return false;

    for (let bullet of this.spaceship.bullets) {
      let d = dist(this.pos.x, this.pos.y, bullet.pos.x, bullet.pos.y);
      if (d < (this.img.width * this.scale) / 2) {
        this.spaceship.bullets.splice(this.spaceship.bullets.indexOf(bullet), 1);

        if (this.scale > 0.04) {
          let newScale = this.scale * 0.6;
          let newVel1 = createVector(random(-asteroidSpeed, asteroidSpeed), random(-asteroidSpeed, asteroidSpeed));
          let newVel2 = createVector(random(-asteroidSpeed, asteroidSpeed), random(-asteroidSpeed, asteroidSpeed));
          asteroids.push(new Asteroid(this.img, this.pos.copy(), newVel1, newScale, this.spaceship));
          asteroids.push(new Asteroid(this.img, this.pos.copy(), newVel2, newScale, this.spaceship));
        }

        return true;
      }
    }
    return false;
  }
}

class Bullet {
  constructor(pos, rotation) {
    this.pos = pos.copy();
    this.vel = createVector(cos(rotation - HALF_PI) * 10, sin(rotation - HALF_PI) * 10);
  }

  update() {
    this.pos.add(this.vel);
  }

  display() {
    fill(255);
    ellipse(this.pos.x, this.pos.y, 4, 4);
  }

  offScreen() {
    return this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height;
  }
}
