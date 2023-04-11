export interface Broadcaster {
  broadcastUpdate: (singers: string[]) => void;
}

export class KaraokeQueue {
  private singers: string[] = [];
  private currentIndex: number = 0;
  private broadcaster: Broadcaster | undefined;

  constructor(broadcaster?: Broadcaster) {
    this.singers = [];
    this.currentIndex = 0;
    this.broadcaster = broadcaster;
  }

  reset() {
    this.singers = [];
    this.currentIndex = 0;
    this.broadcaster?.broadcastUpdate(this.showSingers());
  }

  addSinger(name: string): [boolean, string?] {
    if (this.singers.includes(name)) {
      return [false, `A singer with the name '${name}' already exists.`];
    }

    if (this.currentIndex === 0) {
      this.singers.push(name);
    } else {
      const currentSingerName = this.currentSinger();
      const insertIndex = this.currentIndex;

      this.singers.splice(insertIndex, 0, name);

      // Update the currentIndex to point back to the current singer
      this.currentIndex = this.singers.indexOf(currentSingerName);
    }

    this.broadcaster?.broadcastUpdate(this.showSingers());

    return [true, `Singer '${name}' has been added.`];
  }

  addPrioritySinger(name: string): [boolean, string?] {
    if (this.singers.includes(name)) {
      return [false, `A singer with the name '${name}' already exists.`];
    }

    if (this.singers.length === 0) {
      this.singers.push(name);
    } else {
      const currentSingerName = this.currentSinger();

      const insertIndex = (this.currentIndex + 2) % this.singers.length;
      this.singers.splice(insertIndex, 0, name);

      // Update the currentIndex to point back to the current singer
      this.currentIndex = this.singers.indexOf(currentSingerName);
    }

    this.broadcaster?.broadcastUpdate(this.showSingers());

    return [true, `Priority singer '${name}' has been added.`];
  }

  currentSinger(): string {
    return this.singers[this.currentIndex];
  }

  nextSinger(): string {
    this.currentIndex = (this.currentIndex + 1) % this.singers.length;
    
    this.broadcaster?.broadcastUpdate(this.showSingers());

    return this.currentSinger();
  }

  showSingers(): string[] {
    if (this.currentIndex === 0) {
      return this.singers;
    }

    const orderedSingers = this.singers
      .slice(this.currentIndex)
      .concat(this.singers.slice(0, this.currentIndex));
    return orderedSingers;
  }

  removeSinger(name: string): [boolean, string?] {
    const index = this.singers.indexOf(name);

    if (index === -1) {
      return [false, `A singer with the name '${name}' does not exist.`];
    }

    this.singers.splice(index, 1);

    if (this.singers.length === 0) {
      this.currentIndex = 0;
    } else if (index < this.currentIndex) {
      this.currentIndex--;
    } else if (this.currentIndex === index) {
      this.currentIndex %= this.singers.length;
    }

    this.broadcaster?.broadcastUpdate(this.showSingers());

    return [true, `Singer '${name}' has been removed.`];
  }
  
}
