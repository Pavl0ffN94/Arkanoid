const KEYS = {
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
  SPACE: ' ',
};

const game = {
  ctx: null,
  platform: null,
  ball: null,
  blocks: [],
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
        console.log('start');
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
    let required = Object.keys(this.sprites).length;
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
    this.platform.move();
    this.ball.move();

    for (let block of this.blocks) {
      this.ball.collide(block);
    }
  },
  run() {
    window.requestAnimationFrame(() => {
      this.update();
      this.render();
      this.run();
    });
  },
  create() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.blocks.push({
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
    for (let block of this.blocks) {
      this.ctx.drawImage(this.sprites.block, block.x, block.y);
    }
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
  collaide(element) {},
};

game.platform = {
  velocity: 6,
  dx: 0,
  x: 280,
  y: 300,
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
};

window.addEventListener('load', () => {
  game.start();
});
