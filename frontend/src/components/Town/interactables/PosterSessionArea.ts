import Interactable, { KnownInteractableTypes } from '../Interactable';

export default class PosterSessionArea extends Interactable {
  private _labelText?: Phaser.GameObjects.Text;

  private _defaultTitle?: string;

  private _isInteracting = false;

  public get defaultTitle() {
    if (!this._defaultTitle) {
      return 'No title found';
    }
    return this._defaultTitle;
  }

  addedToScene() {
    super.addedToScene();
    this.setTintFill();
    this.setAlpha(0.3);

    this._defaultTitle = this.getData('title');
    this._labelText = this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y - this.displayHeight / 2,
      `Press space to look at the ${this.name} poster`,
      { color: '#FFFFFF', backgroundColor: '#000000' },
    );
    this._labelText.setVisible(false);
    this.townController.getPosterSessionAreaController(this);
    this.setDepth(-1);
  }

  overlap(): void {
    if (!this._labelText) {
      throw new Error('Should not be able to overlap with this interactable before added to scene');
    }
    const location = this.townController.ourPlayer.location;
    this._labelText.setX(location.x);
    this._labelText.setY(location.y);
    this._labelText.setVisible(true);
  }

  overlapExit(): void {
    this._labelText?.setVisible(false);
    if (this._isInteracting) {
      this.townController.interactableEmitter.emit('endInteraction', this);
      this._isInteracting = false;
    }
  }

  interact(): void {
    this._labelText?.setVisible(false);
    this._isInteracting = true;
  }

  getType(): KnownInteractableTypes {
    return 'posterSessionArea';
  }
}
