(function () {
  var id = 'frogger';
  var alias = 'hopper';
  var version = '1';
  var core = '1';

  var default_color_background = 'rgb(0, 0, 0)';

  var default_color_road = 'rgb(34,53,69)';
  var default_color_grass = 'rgb(79,189,57)';
  var default_color_water = 'rgb(0,221,255)';

  var default_color_shadow = 'rgba(0,0,0,0.4)';
  var default_color_depth = 'rgba(0,0,0,0.4)';
  var default_color_outline = 'rgba(255,255,255,0.3)';

  var terrain_types = ['Grass', 'Road', 'Water' /* , 'Train' */];
  var bush_layouts = [
    [0.8, 0.5, 0.3, 0.0, 0.3, 0.4, 0.8],
    [0.8, 0.5, 0.0, 0.0, 0.3, 0.4, 0.8],
    [0.6, 0.8, 0.0, 0.0, 0.2, 0.2, 0.3],
    [0.3, 0.2, 0.0, 0.9, 0.2, 0.8, 0.6],
    [0.4, 0.8, 0.0, 0.0, 0.0, 0.2, 0.3],
    [0.9, 0.2, 0.8, 0.1, 0.0, 0.7, 0.9],
    [0.2, 0.6, 0.0, 0.0, 0.0, 0.8, 0.9]
  ];

  var car_types = ['lorry', 'slow', 'fast'];
  var car_speeds = [1.2, 0.8, 1.8];

  var widget = {
    _isGameDirUp: function() {
      return this.gameDirection == "Up";
    },
    _generateRoad: function (terrain, carSpeed, carType, carWidth) {

      var that = this;
      var game = this.phaser_game;
      terrain.obstacleSpeed = carSpeed;
      terrain.carType = carType;
      terrain.carWidth = carWidth;

      var maxCars = carType == 'slow' ? 3 : 2;
      if (carWidth > game.width * 0.3) {
        maxCars = 2;
      }
      if (carWidth > game.width * 0.45) {
        maxCars = 1;
      }
      var carStarts = [];

      if (maxCars == 1) {
        carStarts.push(carWidth + Math.floor((game.width * 0.33) + (Math.random() * (game.width * 0.66))));
      }

      if (maxCars == 2) {
        var one = carWidth + Math.floor(Math.random() * (game.width * 0.4));
        carStarts.push(one);
        var two = one + carWidth + that.phaser_spriteWidth + Math.floor(Math.random() * (game.width * 0.4));
        carStarts.push(Math.min(game.width, two));
      }

      if (maxCars == 3) {
        var one = carWidth + Math.floor(game.width * 0.2);
        carStarts.push(one);
        var two = one + (carWidth * 0.8) + that.phaser_spriteWidth + Math.floor(Math.random() * (game.width * 0.2));
        carStarts.push(two);
        var three = two + (carWidth * 0.8) + that.phaser_spriteWidth + Math.floor(Math.random() * (game.width * 0.2));
        carStarts.push(three);
      }

      for (var i = 0; i < carStarts.length; i++) {
        var car = this.phaser_createSprite({
          x: carStarts[i],
          y: terrain.position.y - (this.phaser_halfSpriteHeight * 1.2),
          width: carWidth,
          sprite: 'sprite_car_' + carType,
          group: terrain.brood,
          anchorX: 0.5,
          anchorY: 0
        });

        if (carSpeed < 0) {
          car.scale.x *= -1;
        }
      }
    },
    _generateWater: function (logSpeed, terrain) {

      var game = this.phaser_game;
      var logImage = this.phaser_getImage('sprite_log');
      var logHeight = this.phaser_spriteHeight;
      var logWidth = (logHeight / logImage.height) * logImage.width;

      logSpeed *= 0.4 + Math.round((Math.random() * 0.7) * 10) / 10;

      terrain.obstacleSpeed = logSpeed;
      terrain.carWidth = logWidth;

      var maxLogs = 2;
      if (logWidth > game.width * 0.45) {
        maxLogs = 1;
      }

      var logStarts = [];
      if (maxLogs == 1) {
        logStarts.push(logWidth + Math.floor((game.width * 0.33) + (Math.random() * (game.width * 0.66))));
      }

      if (maxLogs == 2) {
        var one = Math.floor(Math.random() * (game.width * 0.3));
        logStarts.push(one);
        var two = one + logWidth + Math.floor(Math.random() * (game.width * 0.3));
        logStarts.push(Math.min(game.width, two));
      }

      for (var i = 0; i < logStarts.length; i++) {
        this.phaser_createSprite({
          x: logStarts[i],
          y: terrain.position.y,
          width: logWidth,
          sprite: 'sprite_log',
          group: terrain.brood,
          anchorX: 0.5,
          anchorY: 0
        });
      }
    },
    _generateGrass: function (terrain) {

      var that = this;
      var columnCount = this.columnCount;
      if (that.nextBush >= bush_layouts.length) {
        that.nextBush = 0;
      }

      for (var i = 0; i < columnCount + 1; i++) {
        var maxBushes = 6;
        if (i < columnCount && terrain.brood.length < maxBushes) {
          var bushChance = bush_layouts[that.nextBush][i];
          if (bushChance > 0 && Math.random() < bushChance) {
            that.phaser_createSprite({
              x: (i * that.phaser_spriteWidth) + that.phaser_halfSpriteWidth,
              y: terrain.position.y - (that.phaser_halfSpriteHeight * 0.5),
              sprite: 'sprite_bush',
              group: terrain.brood
            });
          }
        }
      }

      that.nextBush++;
    },
    getHTML: function () {
      this.game_wrap = this.arcadegame_wrap({
        classes: (this.s('arcadegame_border')) ? '_border' : '',
      });

      this.game_info = this.arcadegame_info();
      this.game_info.wrap.appendTo(this.game_wrap);

      this.game_info.labels.score = this.arcadegame_label({title: this.s('label_score', 'Score')});
      this.game_info.labels.score.wrap.appendTo(this.game_info.labels.wrap);

      this.game_info.labels.high_score = this.arcadegame_label({title: this.s('label_top_score', 'Best')});
      this.game_info.labels.high_score.wrap.appendTo(this.game_info.labels.wrap);

      this.game_info.actions.mute = this.arcadegame_action({type: 'mute'});
      this.game_info.actions.mute.button.appendTo(this.game_info.actions.wrap);

      this.game_info.actions.pause = this.arcadegame_action({type: 'pause'});
      this.game_info.actions.pause.button.appendTo(this.game_info.actions.wrap);

      this.game_screen = this.arcadegame_screen().appendTo(this.game_wrap);

      this.game_overlays = this.arcadegame_overlays();
      this.game_overlays.wrap.appendTo(this.game_screen);

      var activate_options = {
        type: 'activate',
        element: 'button',
        label: this.s('label_activate', 'Tap to Start')
      };

      if (this.s('img_start_button', {}).url) {
        activate_options.element = 'image';
        activate_options.image = this.s('img_start_button').url;
      }

      this.game_overlays.activate = this.arcadegame_overlay(activate_options);
      this.game_overlays.activate.el.appendTo(this.game_overlays.wrap);

      this.game_overlays.start = this.arcadegame_overlay({
        type: 'start',
        label: this.s('label_start', 'Use the arrow keys or tap and swipe to move')
      });

      this.game_overlays.start.el.appendTo(this.game_overlays.wrap);

      this.game_overlays.stop = this.arcadegame_overlay({
        type: 'stop',
        label: this.s('label_stop', 'Game Over')
      });

      this.game_overlays.stop.el.appendTo(this.game_overlays.wrap);

      this.game_overlays.retry = this.arcadegame_overlay({
        type: 'retry',
        element: 'button',
        label: this.s('label_retry', 'Try Again')
      });

      this.game_overlays.retry.el.appendTo(this.game_overlays.wrap);

      this.game_overlays.success = this.arcadegame_overlay({
        type: 'success',
        label: this.s('label_success', 'Success!')
      });

      this.game_overlays.success.el.appendTo(this.game_overlays.wrap);

      return this.game_wrap;
    },

    onSetup: function () {

      var spriteSize = 64;
      this.rowCount = 9;
      this.columnCount = 7;
      this.rows = null;

      this.gameDirection = this.s('game_direction', 'Up');
      this.fixPlayerOrientation = this.s('fix_player_orientation', false);
      this.frogger_minigame = this.s('minigame', false);
      this.getRoot().removeClass('_minigame');
      if (this.frogger_minigame) {
        this.getRoot().addClass('_minigame');
      }

      this.phaser_create({
        transparent: false,
        holder: this.game_screen.get(0),
        width: spriteSize * this.columnCount,
        height: spriteSize * this.rowCount,
        spriteSize: spriteSize,
        color: default_color_background
      });

      this.phaser_activate();
      this.score_label = this.game_info.labels.score.value_span;
    },

    phaser_loading: function (phaser, game) {

      // Fixes CORS security errors in Edge/Firefox/Safari
      // TODO: Move this down into the Phaser base widget so that all derived widgets can benefit
      // (once we have time to fully test)
      this.phaser_game.load.crossOrigin = "Anonymous";
      this.phaser_loadSprites();
      this.phaser_loadSounds();
    },

    onShow: function () {
      this.phaser_score = 0;
      this.nextBush = 0;
      this.frogger_continue = false; //this.gc_canContinueGame();

      var last_score = this.phaser_getLastScore();
      if (last_score !== false && this.frogger_continue) {
        this.phaser_score = last_score;
      }

      // UI
      this.updateLabels();
      this.f('.arcadegame_overlay').attr('hidden', true);
      this.game_overlays.start.el.removeAttr('hidden');

      var top_score = this.phaser_getTopScore();
      this.game_info.labels.high_score.value_span
          .text(top_score ? top_score : '0');

      // Go!
      this.phaser_loaded();
      this.phaser_start();
    },

    frogger_createLevel: function (phaser, game) {

      // UI
      this.updateLabels();

      // Player
      this.frogger_createPlayer();

      // Level
      var rowCount = this.rowCount;

      if (this.s('bg_type') != 'image') {
        this.Road_sprite = this.phaser_generateSprite(game.width, this.phaser_spriteHeight, this.s('color_road_bg', default_color_road));
        this.Grass_sprite = this.phaser_generateSprite(game.width, this.phaser_spriteHeight, this.s('color_grass_bg', default_color_grass));
        this.Water_sprite = this.phaser_generateSprite(game.width, this.phaser_spriteHeight, this.s('color_water_bg', default_color_water));
      }

      this.level_tweening = false;

      this.rows = this.phaser_createGroup();
      var extra_rows = this.frogger_minigame ? 0 : 2;
      for (var i = 0; i < rowCount + extra_rows; i++) {
        this.frogger_createRow(i);
      }

      this.frogger_fixZAxis();
    },

    phaser_main: function (phaser, game) {
      var that = this;
      that.frogger_started = false;

      this.frogger_createLevel(phaser, game); // TODO Call earlier

      // IO
      this.phaser_createCursorKeys();
      this.phaser_onTap(function (pointer, doubleTap) {
        that.player.goUp();
      });

      this.phaser_createSwipes(function () {
        that.player.goUp();
      }, function () {
        that.player.goDown();
      }, function () {
        that.player.goLeft();
      }, function () {
        that.player.goRight();
      }, 20);
    },

    frogger_fixZAxis: function () {
      var that = this;
      this.phaser_game.world.bringToTop(this.player);
      this.phaser_game.world.bringToTop(this.player_jump);
      this.rows.forEach(function (row) {
        if (row.tType !== 'Water' && row.brood) {
          that.phaser_game.world.bringToTop(row.brood);
        }
      });
    },

    frogger_createRow: function (index) {
      var that = this;
      var game = this.phaser_game;
      var terrain;

      var y = that.getYPos(index);
      if (this.s('bg_type') === 'image') {
        terrain = game.add.tileSprite(0, y - (this.phaser_halfSpriteWidth), game.width, this.phaser_spriteHeight, 'sprite_road_bg');
        terrain.anchor.setTo(0, 0.5);
        this.rows.add(terrain);
      } else {
        terrain = this.phaser_createSprite({
          x: game.width * 0.5,
          y: y - (this.phaser_halfSpriteWidth),
          width: game.width,
          sprite: this.Grass_sprite,
          group: this.rows
        });
      }

      terrain.tIndex = index;

      this.frogger_createShadow(terrain);
      this.frogger_createDepth(terrain);
      this.frogger_createOutline(terrain);

      this.frogger_updateRow(terrain);
    },

    frogger_createShadow: function (row) {
      row.shadow = row.shadow || this.phaser_createSprite({
        x: 0,
        y: row.y - this.phaser_halfSpriteHeight,
        width: row.width,
        height: 4,
        anchor: 0,
        sprite: this.phaser_generateSprite(row.width, this.phaser_spriteHeight, default_color_shadow)
      });
    },

    frogger_createDepth: function (row) {
      row.depth = row.depth || this.phaser_createSprite({
        x: 0,
        y: row.y + this.phaser_halfSpriteHeight - 4,
        width: row.width,
        height: 4,
        anchor: 0,
        sprite: this.phaser_generateSprite(row.width, this.phaser_spriteHeight, default_color_depth)
      });
    },

    frogger_createOutline: function (row) {
      row.outline = row.outline || this.phaser_createSprite({
        x: 0,
        y: row.y + this.phaser_halfSpriteHeight - 1,
        width: row.width,
        height: 1,
        anchor: 0,
        sprite: this.phaser_generateSprite(row.width, this.phaser_spriteHeight, default_color_outline)
      });
    },

    frogger_updateRow: function (terrain) {
      // Cleanup
      var that = this;

      if (!terrain) {
        terrain = this.frogger_getDirtyRow();
        if (!terrain) return;

        if (that._isGameDirUp()) {
          terrain.y = -(this.phaser_spriteHeight * 1) - (this.phaser_halfSpriteWidth);
        } else {
          terrain.y = (this.phaser_spriteHeight * this.rowCount) + (this.phaser_spriteHeight * 1) + (this.phaser_halfSpriteWidth);
        }
      }

      var touchingRows = this.frogger_getTouchingRows(terrain);
      var previousRow = touchingRows.prev;

      var type = terrain_types[0];
      if (this.frogger_minigame && this.rowCount == this.rows.length) {
        type = terrain_types[0];
      } else if (this.rows.length > 1) {
        type = terrain_types[Math.floor(Math.random() * terrain_types.length)];
        if (previousRow && previousRow.tType == 'Water' && type != 'Water') {
          type = terrain_types[0];
        } else if (previousRow && previousRow.tType != 'Water' && type == 'Water') {
          type = terrain_types[Math.floor(Math.random() * terrain_types.length)];
        }
      }

      terrain.tType = type;

      if (this.s('bg_type') === 'image') {
        terrain.loadTexture('sprite_' + type.toLowerCase() + '_bg');
      } else {
        terrain.loadTexture(this[type + '_sprite']);
      }

      if (terrain.hasOwnProperty('brood')) terrain.brood.destroy();
      terrain.brood = this.phaser_createGroup(); // avoid using 'children'

      terrain.outline.alpha = 0;
      terrain.depth.alpha = 0;
      terrain.shadow.alpha = 0;

      // Shadows & depth
      if (previousRow && previousRow.tType) {
        if (type == 'Grass' && previousRow.tType != 'Grass') {
          previousRow.shadow.alpha = 1;
          terrain.depth.alpha = 1;
        } else if (type == 'Road' && previousRow.tType == 'Water') {
          previousRow.shadow.alpha = 1;
          terrain.depth.alpha = 1;
        } else if (type == 'Water' && previousRow.tType != 'Water') {
          terrain.outline.alpha = 1;
        } else if (type == 'Road' && previousRow.tType == 'Grass') {
          terrain.outline.alpha = 1;
        }
      }

      // Create children for this terrain type
      if (this.rows.length == 1) return;

      var carTypeIndex = Math.floor(Math.random() * car_types.length);
      var carType = car_types[carTypeIndex];
      var carSpeed = car_speeds[carTypeIndex];
      var carImage = this.phaser_getImage('sprite_car_' + carType);
      var carHeight = this.phaser_spriteHeight;
      var carWidth = (carHeight / carImage.height) * carImage.width;

      if (previousRow && (previousRow.tType == 'Road' || previousRow.tType == 'Water')) {
        if (previousRow.obstacleSpeed == carSpeed) {
          carSpeed *= -1;
        } else if (Math.abs(previousRow.obstacleSpeed) !== Math.abs(carSpeed)) {
          if (Math.random() > 0.5) carSpeed *= -1;
        }
      }

      if (type == 'Road') {
        this._generateRoad(terrain, carSpeed, carType, carWidth);
      }

      if (type == 'Water') {
        this._generateWater(carSpeed, terrain);
      }

      if (type == 'Grass') {
        this._generateGrass(terrain);
      }
    },

    /**
     * Converts a rowIndex to a y-coordinate on the game canvas
     * @param rowIndex The row index
     * @returns {number} The Y coordinate
     */
    getYPos(rowIndex) {
      var that = this;
      var multiplier = that._isGameDirUp() ? rowIndex : this.rowCount - rowIndex - 1;
      return that.phaser_game.height - (that.phaser_spriteHeight * multiplier);
    },

    frogger_createPlayer: function () {

      var that = this;
      this.player = this.phaser_createPlayer({
        x: (that.phaser_game.width * 0.5),
        y: that.getYPos(0) - (that.phaser_spriteWidth * 0.5)
      });

      this.player_jump = this.phaser_createSprite({
        sprite: 'sprite_player_jump',
        height: that.phaser_spriteHeight * 2
      });

      this.player.direction = this.gameDirection;
      this.player_jump.alpha = 0;
      this.player_tweening = false;
      this.player.on_log = false;

      this.player.doMove = function (direction) {

        // Limit the rate at which moves are processed (mitigates the double jump bug when tapping the cursor once)
        var jumpLimitTolerance = 0.15; // Yes, this is a bit of a magic number, but finding the optimal value isn't an exact science
        if (this.lastmove && ((that.phaser_game.time.now - this.lastmove) / 1000) < jumpLimitTolerance) return;
        this.lastmove = that.phaser_game.time.now;

        if (that.player_tweening) return;
        if (!that.phaser_alive) return;

        var dx = that.player.position.x;
        var dy = that.player.position.y;
        var pBounds = that.player.getBounds();

        if (direction == 'Up' || direction == 'Down') {
          var nextRow = that.frogger_getNextRow();
          var previousRow = that.frogger_getPreviousRow();

          if (nextRow && that.isPlayerFacingForward(direction) && nextRow.tType != 'Water') {
            dx = that.frogger_snapToX();
          } else if (previousRow && that.isPlayerFacingBackward(direction) && previousRow.tType != 'Water') {
            dx = that.frogger_snapToX();
          }
        }

        switch (direction) {
          case 'Up':
            dy -= that.phaser_spriteHeight;
            break;
          case 'Down':
            dy += that.phaser_spriteHeight;
            break;
          case 'Left':
            dx -= that.phaser_spriteWidth;
            break;
          case 'Right':
            dx += that.phaser_spriteWidth;
            break;
        }

        if (dx < 0) return;
        if (dx > that.phaser_game.width) return;
        if (dy < 0) return;
        if (dy > that.phaser_game.height) return;

        var collisionCheck = false;
        that.rows.forEach(function (row) {
          if (row.tType == 'Grass' && row.brood) {
            row.brood.forEach(function (bush) {
              if (that.phaser_checkOverlap(new Phaser.Rectangle(
                  dx - that.phaser_halfSpriteWidth, dy - that.phaser_halfSpriteWidth,
                  pBounds.width, pBounds.height
              ), new Phaser.Rectangle(
                  bush.position.x - that.phaser_halfSpriteWidth,
                  bush.position.y - (that.phaser_halfSpriteHeight) + (that.phaser_halfSpriteHeight * 0.5),
                  pBounds.width, pBounds.height
              ))) {
                collisionCheck = true;
              }
            });
          }
        });

        if (collisionCheck) {
          return;
        }

        if (!that.frogger_started) {
          // Audio
          if (!that.inAdmin()) {
            that.phaser_playSound('sound_music', 1, true);
          }

          // Actually start
          that.game_overlays.start.hide();
          that.phaser_startTime = Date.now();
          that.frogger_started = true;
        } else {
          that.phaser_playSound('sound_hop', 1, false);
        }

        that.player_tweening = true;
        that.player.alpha = 0;
        that.player_jump.alpha = 1;
        that.player.direction = direction;

        if (that.isPlayerFacingForward(direction)) {
          that.phaser_score += 100;
        } else if (that.isPlayerFacingBackward(direction)) {
          that.phaser_score = Math.max(0, that.phaser_score - 10);
        }

        that.updateLabels();

        var screenMidpoint = that.phaser_game.height * 0.5;
        var isPlayerPastHalfway = that._isGameDirUp()
            ? that.player.position.y <= screenMidpoint
            : that.player.position.y >= screenMidpoint;
        if (that.isPlayerFacingForward(direction) && !that.frogger_minigame && isPlayerPastHalfway) {
          that.frogger_shiftLevel();
        } else {
          that.phaser_tweenTo(that.player, { x: dx, y: dy }, 0.04).start().onComplete.add(function () {
            that.frogger_playerJumpFinish();
          }, that);
        }
      };

      this.player.goLeft = function () {
        that.player.doMove('Left');
      };

      this.player.goRight = function () {
        that.player.doMove('Right');
      };

      this.player.goUp = function () {
        that.player.doMove('Up');
      };

      this.player.goDown = function () {
        that.player.doMove('Down');
      };
    },

    isPlayerFacingBackward(direction) {
      return (this.gameDirection == "Up" && direction == "Down") || (this.gameDirection == "Down" && direction == "Up");
    },

    isPlayerFacingForward(direction) {
      return this.gameDirection == direction;
    },

    frogger_snapToX: function () {
      var dx = this.player.position.x;
      var nearestDistance = 1000;
      var nearestX = 0;
      for (var i = -this.phaser_halfSpriteWidth;
           i < this.phaser_game.width + this.phaser_halfSpriteWidth;
           i += this.phaser_spriteWidth) {
        (function (x) {
          var d = Math.abs(dx - x);
          if (d < nearestDistance) {
            nearestDistance = d;
            nearestX = x;
          }
        })(i);
      }
      return nearestX;
    },

    frogger_playerJumpFinish: function () {
      var that = this;
      this.player.alpha = 1;
      this.player_jump.alpha = 0;

      if (that.frogger_minigame &&
          ((that._isGameDirUp() && that.player.position.y <= that.phaser_spriteHeight) ||
              (!that._isGameDirUp() && that.player.position.y > that.phaser_game.height - that.phaser_spriteHeight))) {
        that.frogger_completeMinigame();
      }

      if (this.player.direction == 'Up' || this.player.direction == 'Down') {
        if (this.frogger_getCurrentRow().tType != 'Water') {
          this.player.position.x = this.frogger_snapToX();
        }
      }

      this.phaser_createTimer(function () {
        that.player_tweening = false;
      }, 0.04);
    },

    frogger_shiftLevel: function () {
      var that = this;
      that.level_tweening = true;
      this.rows.children.forEach(function (row, index) {
        var newY = that._isGameDirUp() ? row.position.y + that.phaser_spriteHeight : row.position.y - that.phaser_spriteHeight;
        var tween = that.phaser_tweenTo(row, {y: newY}, 0.08);
        if (index == that.rows.children.length - 1) {
          tween.onComplete.add(function () {
            that.frogger_playerJumpFinish();
            that.frogger_updateRow();
            that.frogger_fixZAxis();
            that.level_tweening = false;
          });
        }
        tween.start();
      });
    },

    /**
     * Gets the row that's fallen off the screen.
     * @returns {*}
     */
    frogger_getDirtyRow: function () {
      var that = this;
      var rows = this.rows;
      var game = this.phaser_game;
      var dirtyRow = null;

      var isDirtyRow = function (row) {
        return that._isGameDirUp() ? row.position.y > game.height : row.position.y < 0;
      }

      rows.forEach(function (row) {
        if (isDirtyRow(row)) {
          dirtyRow = row;
        }
      });

      return dirtyRow;
    },

    frogger_getTouchingRows: function (row) {
      if (!row) {
        return {};
      }

      var spriteHeight = this.phaser_spriteHeight;
      var rows = this.rows;
      var prev, next;

      rows.forEach(function (row2) {
        if (row2.position.y == row.position.y - spriteHeight) {
          next = row2;
        }

        if (row2.position.y == row.position.y + spriteHeight) {
          prev = row2;
        }
      });

      return {
        prev: prev,
        next: next
      };
    },

    frogger_getNextRow: function () {
      return this._isGameDirUp()
          ? this.frogger_getCurrentRow(this.phaser_spriteHeight)
          : this.frogger_getCurrentRow(-this.phaser_spriteHeight);
    },

    frogger_getPreviousRow: function () {
      return this._isGameDirUp()
          ? this.frogger_getCurrentRow(-this.phaser_spriteHeight)
          : this.frogger_getCurrentRow(this.phaser_spriteHeight);
    },

    frogger_getCurrentRow: function (offset) {
      offset = offset || 0;

      var player = this.player;
      var rows = this.rows;

      var currentRow = null;
      var distance = 1000;
      rows.forEach(function (row) {
        var d = Math.abs(row.position.y - (player.position.y - offset));
        if (d < distance) {
          distance = d;
          currentRow = row;
        }
      });
      return currentRow;
    },

    phaser_updating: function (p, game, dt) {
      var that = this;
      var player = this.player;

      // Update player
      if (this.phaser_cursors.up.isDown) {
        player.goUp();
      } else if (this.phaser_cursors.down.isDown) {
        player.goDown();
      } else if (this.phaser_cursors.left.isDown) {
        player.goLeft();
      } else if (this.phaser_cursors.right.isDown) {
        player.goRight();
      }

      // TODO Might want to keep an eye on this too
      if (!this.player_tweening && player.on_log !== false) {
        player.position.x += player.on_log;
      }

      player.on_log = false;

      switch (this.player.direction) {
        case 'Up':
          player.angle = 0;
          this.player_jump.angle = player.angle;
          this.player_jump.position.x = player.position.x;
          if (this.level_tweening) {
            this.player_jump.position.y = player.position.y;
          } else {
            this.player_jump.position.y = player.position.y - this.phaser_halfSpriteHeight;
          }
          break;
        case 'Down':
          player.angle = 180;
          this.player_jump.angle = player.angle;
          this.player_jump.position.x = player.position.x;
          this.player_jump.position.y = player.position.y + this.phaser_halfSpriteHeight;
          break;
        case 'Left':
          player.angle = 270;
          this.player_jump.angle = player.angle;
          this.player_jump.position.x = player.position.x - this.phaser_halfSpriteWidth;
          this.player_jump.position.y = player.position.y;
          break;
        case 'Right':
          player.angle = 90;
          this.player_jump.angle = player.angle;
          this.player_jump.position.x = player.position.x + this.phaser_halfSpriteWidth;
          this.player_jump.position.y = player.position.y;
          break;
      }

      if (this.fixPlayerOrientation) {
        player.angle = this.player_jump.angle = this._isGameDirUp() ? 0 : 180;
      }

      // Update entity positioning
      this.rows.forEach(function (row) {
        if (row.brood && row.brood.children.length > 0) {

          // Update Y positioning for different terrains
          row.brood.forEach(function (child) {
            if (row.tType == 'Road') {
              child.position.y = row.position.y - (that.phaser_halfSpriteHeight * 1.2);
            } else if (row.tType == 'Water') {
              child.position.y = row.position.y - that.phaser_halfSpriteHeight;
            } else {
              child.position.y = row.position.y - (that.phaser_halfSpriteHeight * 0.5);
            }
          });

          if (row.tType == 'Road') {
            row.brood.forEach(function (car) {
              if (row.obstacleSpeed > 0) {
                if (car.position.x > game.width + (row.carWidth * 0.5)) {
                  car.position.x = -(row.carWidth * 0.5);
                }
              } else {
                if (car.position.x < -(row.carWidth * 0.5)) {
                  car.position.x = game.width + (row.carWidth * 0.5);
                }
              }

              car.position.x += row.obstacleSpeed;

              car.padding = (that.phaser_spriteWidth * 0.34);
              player.padding = (that.phaser_spriteWidth * 0.25);

              if (player.position.y == row.position.y) {
                if (that.phaser_checkOverlap(player, car)) {
                  that.frogger_gameOver();
                }
              }
            });
          } else if (row.tType == 'Water') {
            row.brood.forEach(function (log) {

              if (row.obstacleSpeed > 0) {
                if (log.position.x > game.width + (row.carWidth * 0.5)) {
                  log.position.x = -(row.carWidth * 0.5);
                }
              } else {
                if (log.position.x < -(row.carWidth * 0.5)) {
                  log.position.x = game.width + (row.carWidth * 0.5);
                }
              }

              log.position.x += row.obstacleSpeed;

              player.padding = (that.phaser_spriteWidth * 0.25);
              log.padding = (that.phaser_spriteWidth * 0.33);

              if (that.phaser_checkOverlap(player, log)) {
                // TODO: Improve
                player.on_log = row.obstacleSpeed;
              }
            });
          }
        }
      });

      // Get player position
      if (!this.player_tweening) {
        var currentRow = this.frogger_getCurrentRow();
        if (currentRow.tType == 'Water' && player.on_log === false) {
          this.frogger_gameOver();
        }
      }
    },

    phaser_forceUpdate: function () {
      var that = this;

      this.rows.forEach(function (row) {
        if (row.shadow) {
          row.shadow.position.y = row.position.y - that.phaser_halfSpriteHeight;
        }

        if (row.depth) {
          row.depth.position.y = row.position.y + that.phaser_halfSpriteHeight - 4;
        }

        if (row.outline) {
          row.outline.position.y = row.position.y + that.phaser_halfSpriteHeight + 0;
        }
      });
    },

    updateLabels: function () {
      this.score_label.text(this.phaser_score);
    },

    frogger_completeMinigame: function () {
      this.phaser_completeGame(2, this.s('nextPageId'));
    },

    phaser_onGameOver: function () {
      if (this.frogger_minigame && this.phaser_score < (this.rowCount - 1) * 10) {
        this.game_overlays.retry.show();
      } else {
        this.goToPage();
      }
    },

    frogger_gameOver: function (stop_render) {
      var that = this;

      that.player.loadTexture('sprite_player_death', 0);

      if (stop_render !== false) {
        // that.phaser_lockRendering();
      }

      if (that.frogger_minigame && that.phaser_score < (this.rowCount - 1) * 10) {
        that.phaser_gameOver();
      } else {
        that.phaser_delayedGameOver(2);
      }
    },

    onHide: function () {
      this.submit({
        success: function () {
        },
        error: function () {
        }
      });
      this.phaser_assignSharedValues(alias);
      this.phaser_stop();
    },

    frogger_getSnapShot: function () {
      return {
        x: this.player.x,
        y: this.player.y
      };
    },

    phaser_assigning: function (assignCallback) {
      if (this.frogger_screenshot) {
        assignCallback('screenshot_url', this.frogger_screenshot.src);
        assignCallback('screenshot_link_start', '<a href="' + this.frogger_screenshot.src + '">');
        assignCallback('screenshot_link_end', '</a>');
      }
    },

    getSubmissionData: function () {
      var data = this.phaser_getSubmissionData();
      return data;
    }
  };

  SocialPromote.registerWidget(id, version, core, ['phaser:1'], widget);
})();