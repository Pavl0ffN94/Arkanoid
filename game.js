const KEYS = {
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
  SPACE: ' ',
};

const game = {
  ctx: null,
  platform: null,
  ball: null,
  running: true,
  blocks: [],
  score: 0,
  rows: 4,
  cols: 8,
  with: 640,
  height: 360,
  sprites: {
    ball: null,
    platform: null,
    background: null,
    block: null,
  },

  init: function () {
    this.ctx = document.getElementById('mycanvas').getContext('2d');
    this.setEvents();
  },
  setEvents() {
    window.addEventListener('keydown', (e) => {
      if (e.key === KEYS.SPACE) {
        this.platform.fire();
      } else if (e.key === KEYS.LEFT || e.key === KEYS.RIGHT) {
        this.platform.start(e.key);
      }
    });
    window.addEventListener('keyup', (e) => {
      this.platform.stop();
    });
  },
  preload(callback) {
    let loaded = 0;
    const required = Object.keys(this.sprites).length;
    let onImageLoad = () => {
      ++loaded;
      if (loaded >= required) {
        callback();
      }
    };

    for (let key in this.sprites) {
      this.sprites[key] = new Image();
      this.sprites[key].src = `img/${key}.png`;
      this.sprites[key].addEventListener('load', onImageLoad);
    }
  },
  update() {
    this.collideBloks();
    this.collidePlatform();
    this.ball.collideWorldBounce();
    this.platform.collideWorldPlatform();
    this.platform.move();
    this.ball.move();
  },
  end(text) {
    this.running = false;
    confirm(text);
    window.location.reload();
  },
  addScore() {
    ++this.score;
    if (this.score === this.blocks.length) {
      game.end('You Win');
    }
  },
  collideBloks() {
    this.blocks.forEach((block) => {
      if (block.active && this.ball.collide(block)) {
        this.ball.bumpBlock(block);
      }
    });
  },
  collidePlatform() {
    if (this.ball.collide(this.platform)) {
      this.ball.bumpPlatform(this.platform);
    }
  },
  run() {
    if (this.running) {
      window.requestAnimationFrame(() => {
        this.update();
        this.render();
        this.run();
      });
    }
  },
  create() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.blocks.push({
          active: true,
          with: 60,
          height: 20,
          x: 64 * col + 65,
          y: 24 * row + 35,
        });
      }
    }
  },
  render() {
    this.ctx.clearRect(0, 0, this.with, this.height);

    this.ctx.drawImage(this.sprites.background, 0, 0);
    this.ctx.drawImage(
      this.sprites.ball,
      0,
      0,
      this.ball.with,
      this.ball.height,
      this.ball.x,
      this.ball.y,
      this.ball.with,
      this.ball.height,
    );
    this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
    this.renderBlocks();
  },
  renderBlocks() {
    this.blocks.forEach((block) => {
      if (block.active) {
        this.ctx.drawImage(this.sprites.block, block.x, block.y);
      }
    });
  },
  start: function () {
    this.init();
    this.preload(() => {
      this.create();
      this.run();
    });
  },
  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  },
};

game.ball = {
  dy: 0,
  dx: 0,
  velocity: 3,
  x: 320,
  y: 280,
  with: 20,
  height: 20,
  start() {
    this.dy = -this.velocity;
    this.dx = game.random(-this.velocity, this.velocity);
  },
  move() {
    if (this.dy) {
      this.y += this.dy;
    }
    if (this.dx) {
      this.x += this.dx;
    }
  },
  collide(element) {
    const x = this.x + this.dx;
    const y = this.y + this.dy;
    if (
      x + this.with > element.x &&
      x < element.x + element.with &&
      y + this.height > element.y &&
      y < element.y + element.height
    ) {
      return true;
    }
    return false;
  },
  collideWorldBounce() {
    const x = this.x + this.dx;
    const y = this.y + this.dy;

    const ballLeft = x;
    const ballRight = ballLeft + this.with;
    const ballTop = y;
    const bollBottom = ballTop + this.height;

    const worldLeft = 0;
    const worldRight = game.with;
    const worldTop = 0;
    const worldBotttom = game.height;

    if (ballLeft < worldLeft) {
      this.x = 0;
      this.dx = this.velocity;
    } else if (ballRight > worldRight) {
      this.x = worldRight - this.with;
      this.dx = -this.velocity;
    } else if (ballTop < worldTop) {
      this.y = 0;
      this.dy = this.velocity;
    } else if (bollBottom > worldBotttom) {
      game.end('You lose');
    }
  },
  bumpBlock(block) {
    this.dy *= -1;
    block.active = false;
    game.addScore();
  },
  bumpPlatform(platform) {
    if (platform.dx) {
      this.x += platform.dx;
    }
    if (this.dy > 0) {
      const touchX = this.x + this.with / 2;
      this.dy = -this.velocity;
      this.dx = this.velocity * platform.getTouchOffet(touchX);
    }
  },
};

game.platform = {
  velocity: 6,
  dx: 0,
  x: 280,
  y: 300,
  with: 100,
  height: 14,
  ball: game.ball,
  fire() {
    if (this.ball) {
      this.ball.start();
      this.ball = null;
    }
  },
  start(direction) {
    if (direction === KEYS.LEFT) {
      this.dx = -this.velocity;
    } else if (direction === KEYS.RIGHT) {
      this.dx = this.velocity;
    }
  },
  stop() {
    this.dx = 0;
  },
  move() {
    if (this.dx) {
      this.x += this.dx;
      if (this.ball) {
        this.ball.x += this.dx;
      }
    }
  },
  getTouchOffet(x) {
    const diff = this.x + this.with - x;
    const offset = this.with - diff;
    const result = (2 * offset) / this.with;
    return result - 1;
  },
  collideWorldPlatform() {
    const x = this.x + this.dx;
    const platformLeft = x;
    const platformRight = platformLeft + this.with;
    const worldLeft = 0;
    const worldRight = game.with;

    if (platformLeft < worldLeft || platformRight > worldRight) {
      this.dx = 0;
    }
  },
};

window.addEventListener('load', () => {
  game.start();
});
