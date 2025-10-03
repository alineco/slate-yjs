import { HocuspocusProvider } from '@hocuspocus/provider';
import { withYHistory, withYjs, YjsEditor } from '@slate-yjs/core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createEditor, Descendant } from 'slate';
import { Slate, withReact } from 'slate-react';
import * as Y from 'yjs';
import { ConnectionToggle } from '../components/ConnectionToggle/ConnectionToggle';
import { CustomEditable } from '../components/CustomEditable/CustomEditable';
import { FormatToolbar } from '../components/FormatToolbar/FormatToolbar';
import { HOCUSPOCUS_ENDPOINT_URL } from '../config';
import { withMarkdown } from '../plugins/withMarkdown';
import { withNormalize } from '../plugins/withNormalize';

export function SimplePage() {
  const [value, setValue] = useState<Descendant[]>([]);
  const [connected, setConnected] = useState(false);

  const provider = useMemo(
    () =>
      new HocuspocusProvider({
        url: HOCUSPOCUS_ENDPOINT_URL,
        name: 'slate-yjs-demo',
        onConnect: () => setConnected(true),
        onDisconnect: () => setConnected(false),
      }),
    []
  );

  const toggleConnection = useCallback(() => {
    if (connected) {
      return provider.disconnect();
    }
    provider.connect();
  }, [provider, connected]);

  const editor = useMemo(() => {
    const sharedType = provider.document.get('content', Y.XmlText) as Y.XmlText;

    return withMarkdown(
      withNormalize(
        withReact(
          withYHistory(
            withYjs(createEditor(), sharedType, { autoConnect: false })
          )
        )
      )
    );
  }, [provider.document]);

  /**
   * Do not connect YjsEditor until the provider has synced. This prevents the
   * insertion of additional paragraphs at the start of the document.
   */
  useEffect(() => {
    const connectIfNeeded = () => {
      if (!YjsEditor.connected(editor)) {
        YjsEditor.connect(editor);
      }
    };

    if (provider.isSynced) {
      connectIfNeeded();
    } else {
      const onSynced = () => {
        connectIfNeeded();
        provider.off('synced', onSynced);
      };

      provider.on('synced', onSynced);
      return () => {
        provider.off('synced', onSynced);
      };
    }
  }, [provider, editor]);

  return (
    <div className="flex justify-center my-32 mx-10">
      <Slate initialValue={value} onChange={setValue} editor={editor}>
        <FormatToolbar />
        <CustomEditable className="max-w-4xl w-full flex-col break-words" />
      </Slate>
      <ConnectionToggle connected={connected} onClick={toggleConnection} />
    </div>
  );
}
