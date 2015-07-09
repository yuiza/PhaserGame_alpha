var peer = new Peer('player1', { key: 'gj6od1nfegtoi529', debug: 3, config: { 'iceServers': [ {url: 'stun:stun.l.google.com:19302'} ] } });
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

//WebRTC
var conn;

//指定IDでWebRTC
peer.on('open', function(id){
	console.log('my id', id);
});

//受信
peer.on('connection', function receiver(recv){
	"use strict";

	console.log('revceved');

	var _dataPool = new DataPool();

	recv.on('data', function(data){
		console.log('data:', data);
		//command -> DataPool
		if(data.type === 'command'){
			console.log('check OK');
			_dataPool.setCom(data.command);
			console.log(_dataPool.getCom());
			//DataPool.setCom(data.command);
			//console.log(DataPool.getCom());
		}

	});
});


var DataPool = (function(){

	var _command;

	function DataPool(){
		//var _command;
		//this._command;
	};



	//共有でアクセスされたい
	DataPool.prototype.getCom = function(){
		return _command;
	};

	DataPool.prototype.setCom = function(c){
		_command = c;
	};

	return DataPool;
})();


//Game
var player;
var cursors;
var space;
var stars;
var star;
var limitTime;
var platforms;
var enemyCommand;
var PlayerCommand;

function preload() {
	"use strict";

	game.load.image('sky', 'assets/sky.png');
	game.load.image('ground', 'assets/platform.png');
	game.load.image('star', 'assets/star.png');
//	game.load.image('wall', 'assets/wall.png');
	game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
}

function create() {
	"use strict";

	//set limit time
	limitTime = 0;
	//set keyboard
	cursors = game.input.keyboard.createCursorKeys();
	//set Space key
	space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);


	//set Data(command) pool
	enemyCommand = new DataPool();

	//物理エンジンON
	game.physics.startSystem(Phaser.Physics.ARCADE);
	
	//背景
	game.add.sprite(0,0,'sky');

	//プラットフォームグループ生成
	platforms = game.add.group();

	//プラットフォームオブジェクトはすべて物理エンジンON
	platforms.enableBody = true;

	//プラットフォームグループに地面追加
	var ground = platforms.create(0, game.world.height - 64, 'ground');
	//地面のサイズをゲーム幅にフィット
	ground.scale.setTo(2,2);
	//地面固定
	ground.body.immovable = true;
	
	//壁
	//var wall = platforms.create(-60, game.world.heigth -600, 'wall');
	//wall.scale.setTo(2,2);
	//wall.body.immovable = true;

	//星
	stars = game.add.group();
	stars.enableBody = true;
	stars.physicsBodyType = Phaser.Physics.ARCADE;
	stars.createMultiple(32, 'star');
	stars.setAll('anchor.x', 0);
	stars.setAll('anchor.y', 0);
	stars.setAll('outOfBoundsKill', true);
	stars.setAll('checkWorldBounds', true);


	//platformsグループに張り出し(ledge)を追加
	var ledge = platforms.create(400, 400, 'ground');
	ledge.body.immovable = true;

	ledge = platforms.create(-150, 250, 'ground');
	ledge.body.immovable = true;

	//Player
	player = game.add.sprite(32, game.world.height - 150, 'dude');
	
	game.physics.arcade.enable(player);

	player.body.bounce.y = 0.2;
	player.body.gravity.y = 300;
	player.body.collideWordBounds = true;

	player.animations.add('left', [0,1,2,3], 10, true);
	player.animations.add('right', [5,6,7,8], 10, true);

}

function update() {
	"use strict";

	//playerとplatformの衝突判定
	game.physics.arcade.collide(player, platforms);
	game.physics.arcade.collide(stars, platforms);
	game.physics.arcade.overlap(player, stars, bump, null, this);

	//playerの移動速度リセット
	if(player.body.touching.down){
		player.body.velocity.x = 0;
	}

	cursors = game.input.keyboard.createCursorKeys();

	if(player.body.x < 800 -32 && player.body.x > 5){


		//if(cursors.left.isDown){
		if(enemyCommand.getCom() == 'L'){

			//左
			player.body.velocity.x = -150;
			player.animations.play('left');
		// }else if(cursors.right.isDown){
		}else if (enemyCommand.getCom() == 'R'){
			//右
			player.body.velocity.x = 150;
			player.animations.play('right');
		}else{
			//そのまま
			player.animations.stop();

			if(player.animations.name === 'left'){
				player.frame = 0;
			}else{
				player.frame = 5;
			}

		}
	}else if(player.body.x > 800 -32 || player.body.x === 800-32 && player.body.x > 20){
		player.body.x = 800 -33;
		player.animations.stop();
	}else if(player.body.x < 5 || player.body.x == 5){
		player.body.x = 6;
		player.animations.stop();
	}

	//上矢印キー && プレイヤー地面 is Jump
	// if(cursors.up.isDown && player.body.touching.down){
	if(enemyCommand.getCom() == 'U' && player.body.touching.down){
		player.body.velocity.y = -350;
	}

	//Pushed spacekey create star
	// if(space.isDown){
	if(enemyCommand.getCom() == 'S'){
		if(game.time.now > limitTime && stars.total < 5){
			star = stars.getFirstExists(false);
			if(star){
				if(player.animations.name === 'left'){
					star.reset(player.body.x + 32 , player.body.y);
					star.body.velocity.y = player.body.y;
				}else if(player.animations.name === 'right'){
					star.reset(player.body.x - 32, player.body.y);
					star.body.velocity.y = player.body.y;
				}
				limitTime = game.time.now + 300;
			}
		}
	}

}

function bump(player, star){
	"use strict";

	star.kill();
}
