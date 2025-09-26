import * as Y from 'yjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { inspectYText } from '../inspectYText';
import { ClonedSharedRoot } from '../../src/utils/ClonedSharedRoot';

describe('ClonedSharedRoot', () => {
  let doc: Y.Doc;
  let simpleSharedRoot: Y.XmlText;
  let nestedSharedRoot: Y.XmlText;
  let mention: Y.XmlText;
  let link: Y.XmlText;

  beforeEach(() => {
    doc = new Y.Doc();
    simpleSharedRoot = doc.get('simpleSharedRoot', Y.XmlText) as Y.XmlText;
    nestedSharedRoot = doc.get('nestedSharedRoot', Y.XmlText) as Y.XmlText;

    simpleSharedRoot.setAttribute('id', 5);
    simpleSharedRoot.insert(0, 'Hello ');
    simpleSharedRoot.insert(6, 'world', { bold: true });
    simpleSharedRoot.insert(11, '2!', { bold: null });
    simpleSharedRoot.delete(11, 1);

    mention = new Y.XmlText();
    mention.setAttribute('type', 'mention');

    link = new Y.XmlText('This is a link to !');
    link.setAttribute('type', 'link');
    link.applyDelta([
      { retain: 10 },
      { retain: 4, attributes: { bold: true } },
      { retain: 4 },
      { insert: mention },
    ]);

    nestedSharedRoot.applyDelta([{ insert: link }]);
  });

  function expectSharedRootsEqual(
    sharedRoot: Y.XmlText,
    clonedSharedRoot: ClonedSharedRoot
  ) {
    expect(inspectYText(clonedSharedRoot.sharedRoot)).toEqual(
      inspectYText(sharedRoot)
    );
  }

  let observedEvents = 0;

  function syncSharedRoots(source: Y.XmlText, destination: ClonedSharedRoot) {
    observedEvents = 0;

    source.observeDeep((events) => {
      events.forEach((event) => {
        destination.applyEvent(event);
        observedEvents++;
      });

      expectSharedRootsEqual(source, destination);
    });
  }

  it('syncs changes on simple shared root', () => {
    const sharedRoot = simpleSharedRoot; // Hello world!

    const clonedSharedRoot = new ClonedSharedRoot(sharedRoot);
    expectSharedRootsEqual(sharedRoot, clonedSharedRoot);
    syncSharedRoots(sharedRoot, clonedSharedRoot);

    sharedRoot.insert(5, ','); // Hello, world!
    expect(observedEvents).toBe(1);

    sharedRoot.delete(1, 4); // H, world!
    sharedRoot.insert(1, 'i'); // Hi, world!
    expect(observedEvents).toBe(3);

    sharedRoot.format(4, 5, { bold: null, italic: true });
    expect(observedEvents).toBe(4);

    expect(inspectYText(clonedSharedRoot.sharedRoot)).toMatchInlineSnapshot(`
      {
        "attributes": {
          "id": 5,
        },
        "insert": [
          {
            "insert": "Hi, ",
          },
          {
            "attributes": {
              "italic": true,
            },
            "insert": "world",
          },
          {
            "insert": "!",
          },
        ],
      }
    `);
  });

  it('syncs changes on nested shared root', () => {
    // <link>This is a link to <mention />!</link>
    const sharedRoot = nestedSharedRoot;

    const clonedSharedRoot = new ClonedSharedRoot(sharedRoot);
    expectSharedRootsEqual(sharedRoot, clonedSharedRoot);
    syncSharedRoots(sharedRoot, clonedSharedRoot);

    // <link>This's a link to <mention />!</link>
    link.delete(4, 2);
    link.insert(4, "'");
    expect(observedEvents).toBe(2);

    // <link>This's a link to <mention>someone</mention>!</link>
    mention.insert(0, 'someone');
    expect(observedEvents).toBe(3);

    // <link>This's a link to !</link>
    link.delete(17, 1);
    expect(observedEvents).toBe(4);

    // <link>This's a link to <mention>you</mention>!</link>
    const mention2 = new Y.XmlText('you');
    mention2.setAttribute('type', 'mention');
    link.applyDelta([{ retain: 17 }, { insert: mention2 }]);
    expect(observedEvents).toBe(5);

    // <link>This's a link to <mention id="2">you</mention>!</link>
    mention2.setAttribute('id', 2);
    expect(observedEvents).toBe(6);

    // <link>This's a link to <mention user="3">you</mention>!</link>
    mention2.setAttribute('id', null);
    mention2.setAttribute('user', 4);
    mention2.setAttribute('user', 3);
    expect(observedEvents).toBe(9);

    // <link>This's a link to <mention user="3">You</mention>!</link>
    mention2.format(0, 3, { bold: true });
    mention2.insert(0, 'Y', { bold: true });
    mention2.delete(1, 1);
    expect(observedEvents).toBe(12);

    expect(inspectYText(clonedSharedRoot.sharedRoot)).toMatchInlineSnapshot(`
      {
        "attributes": {},
        "insert": [
          {
            "attributes": {
              "type": "link",
            },
            "insert": [
              {
                "insert": "This's a ",
              },
              {
                "attributes": {
                  "bold": true,
                },
                "insert": "link",
              },
              {
                "insert": " to ",
              },
              {
                "attributes": {
                  "id": null,
                  "type": "mention",
                  "user": 3,
                },
                "insert": [
                  {
                    "attributes": {
                      "bold": true,
                    },
                    "insert": "You",
                  },
                ],
              },
              {
                "insert": "!",
              },
            ],
          },
        ],
      }
    `);
  });
});
