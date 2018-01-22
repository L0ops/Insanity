export default class Key {

  public left:string;
  public right:string;
  public used:Boolean;

  constructor(left:string, right:string) {
    this.left = left;
    this.right = right;
    this.used = false;
  }

}
