// karaoke.test.ts
import { describe, beforeEach, test, expect } from '@jest/globals';
import { KaraokeQueue } from './karaokeQueue';

describe('Karaoke', () => {
  let karaoke: KaraokeQueue;

  beforeEach(() => {
    karaoke = new KaraokeQueue();
  });

  test('addSinger and currentSinger', () => {
    karaoke.addSinger('John');
    expect(karaoke.currentSinger()).toBe('John');
  });

  test('addSinger and nextSinger', () => {
    karaoke.addSinger('John');
    karaoke.addSinger('Paul');
    expect(karaoke.nextSinger()).toBe('Paul');
  });

  test('addSinger with non-unique name', () => {
    karaoke.addSinger('John');
    const [success, message] = karaoke.addSinger('John');
    expect(success).toBe(false);
    expect(message).toBe("A singer with the name 'John' already exists.");
  });

  test('showSingers', () => {
    karaoke.addSinger('John');
    karaoke.addSinger('Paul');
    karaoke.addSinger('George');
    karaoke.nextSinger(); // Move to Paul
    expect(karaoke.showSingers()).toEqual(['Paul', 'George', 'John']);
  });

  test('singers loop', () => {
    karaoke.addSinger('John');
    karaoke.addSinger('Paul');
    karaoke.addSinger('George');
    karaoke.nextSinger(); // Move to Paul
    karaoke.nextSinger(); // Move to George
    karaoke.nextSinger(); // Move to back to John
    expect(karaoke.showSingers()).toEqual(['John', 'Paul', 'George']);
  });


  test('nextSinger and addSinger', () => {
    karaoke.addSinger('John');
    karaoke.addSinger('Paul');
    karaoke.addSinger('George');
    karaoke.nextSinger(); // Move to Paul
    karaoke.addSinger('Ringo');
    expect(karaoke.showSingers()).toEqual(['Paul', 'George', 'John', 'Ringo']);
  });

  test('addPrioritySinger', () => {
    karaoke.addSinger('John');
    karaoke.addSinger('Paul');
    karaoke.addSinger('George');
    karaoke.addPrioritySinger('Ringo');
    expect(karaoke.showSingers()).toEqual(['John', 'Paul', 'Ringo', 'George']);
  });

  test('addPrioritySinger with non-unique name', () => {
    karaoke.addSinger('John');
    const [success, message] = karaoke.addPrioritySinger('John');
    expect(success).toBe(false);
    expect(message).toBe("A singer with the name 'John' already exists.");
  });

  test('nextSinger and addPrioritySinger', () => {
    karaoke.addSinger('John');
    karaoke.addSinger('Paul');
    karaoke.addSinger('George');
    karaoke.nextSinger(); // Move to Paul
    karaoke.addPrioritySinger('Ringo');
    expect(karaoke.showSingers()).toEqual(['Paul', 'George', 'Ringo', 'John']);
  });

  test('removeSinger', () => {
    karaoke.addSinger('John');
    karaoke.addSinger('Paul');
    karaoke.addSinger('George');
    const [success, message] = karaoke.removeSinger('Paul');
    expect(success).toBe(true);
    expect(message).toBe("Singer 'Paul' has been removed.");
    expect(karaoke.showSingers()).toEqual(['John', 'George']);
  });
  
  test('removeSinger with non-existent name', () => {
    karaoke.addSinger('John');
    karaoke.addSinger('Paul');
    karaoke.addSinger('George');
    const [success, message] = karaoke.removeSinger('Ringo');
    expect(success).toBe(false);
    expect(message).toBe("A singer with the name 'Ringo' does not exist.");
    expect(karaoke.showSingers()).toEqual(['John', 'Paul', 'George']);
  });
  
  test('removeSinger and adjust currentIndex', () => {
    karaoke.addSinger('John');
    karaoke.addSinger('Paul');
    karaoke.addSinger('George');
    karaoke.nextSinger(); // Move to Paul
    karaoke.removeSinger('John');
    expect(karaoke.currentSinger()).toBe('Paul');
    expect(karaoke.showSingers()).toEqual(['Paul', 'George']);
    expect(karaoke.nextSinger()).toBe('George');
    expect(karaoke.showSingers()).toEqual(['George', 'Paul']);
  });
  
  test('removeSinger when current singer is the last', () => {
    karaoke.addSinger('John');
    karaoke.addSinger('Paul');
    karaoke.addSinger('George');
    karaoke.nextSinger(); // Move to Paul
    karaoke.nextSinger(); // Move to George
    karaoke.removeSinger('George');
    expect(karaoke.currentSinger()).toBe('John');
    expect(karaoke.showSingers()).toEqual(['John', 'Paul']);
    expect(karaoke.nextSinger()).toBe('Paul');
    expect(karaoke.showSingers()).toEqual(['Paul', 'John']);
  });

  test('bump singer', () => {
    karaoke.addSinger('John');
    karaoke.addSinger('Paul');
    karaoke.addSinger('George');
    karaoke.addSinger('Ringo');
    karaoke.addSinger('Yoko');

    karaoke.bumpSinger('Ringo');
    expect(karaoke.showSingers()).toEqual(['John', 'Paul', 'Ringo', 'George', 'Yoko']);
  });

  test('bump first singer', () => {
    karaoke.addSinger('John');
    karaoke.addSinger('Paul');
    karaoke.addSinger('George');
    karaoke.addSinger('Ringo');

    karaoke.bumpSinger('John');
    expect(karaoke.showSingers()).toEqual(['Paul', 'George', 'John', 'Ringo']);
  });

  test('bump next singer', () => {
    karaoke.addSinger('John');
    karaoke.addSinger('Paul');
    karaoke.addSinger('George');
    karaoke.addSinger('Ringo');

    karaoke.bumpSinger('Paul');
    expect(karaoke.showSingers()).toEqual(['John', 'George', 'Paul', 'Ringo']);
  });

  test('previous singer', () => {
    karaoke.addSinger('John');
    karaoke.addSinger('Paul');
    karaoke.addSinger('George');
    karaoke.addSinger('Ringo');

    expect(karaoke.nextSinger()).toBe('Paul');
    expect(karaoke.showSingers()).toEqual(['Paul', 'George', 'Ringo', 'John' ]);
    expect(karaoke.previousSinger()).toBe('John');
    expect(karaoke.showSingers()).toEqual(['John', 'Paul', 'George', 'Ringo' ]);
  });

  test('previous singer at queue start', () => {
    karaoke.addSinger('John');
    karaoke.addSinger('Paul');
    karaoke.addSinger('George');
    karaoke.addSinger('Ringo');

    expect(karaoke.previousSinger()).toBe('Ringo');
    expect(karaoke.showSingers()).toEqual(['Ringo', 'John', 'Paul', 'George']);
  });
});
