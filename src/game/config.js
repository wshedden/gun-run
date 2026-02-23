import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { GameScene } from '../scenes/GameScene';

export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 800;

export const gameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#0a0f1c',
  scene: [BootScene, GameScene],
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  }
};
