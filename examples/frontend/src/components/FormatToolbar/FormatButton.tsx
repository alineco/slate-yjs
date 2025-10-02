import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import React from 'react';
import { Editor, Text, Transforms } from 'slate';
import { useSlate } from 'slate-react';
import { CustomText } from '../../types';

function isFormatActive(editor: Editor, format: keyof CustomText) {
  const [match] = Editor.nodes(editor, {
    match: (n) => Text.isText(n) && !n[format],
    mode: 'all',
  });
  return !match;
}

function toggleFormat(editor: Editor, format: keyof CustomText) {
  const isActive = isFormatActive(editor, format);
  Transforms.setNodes(
    editor,
    { [format]: isActive ? null : true },
    { match: Text.isText, split: true }
  );
}

type FormatButtonProps = {
  format: keyof CustomText;
  icon: IconDefinition;
};

export function FormatButton({ format, icon }: FormatButtonProps) {
  const editor = useSlate();
  const active = isFormatActive(editor, format);

  return (
    <button
      className={clsx(
        'h-8 w-8 flex justify-center items-center hover:bg-gray-600'
      )}
      type="button"
      onMouseDown={(event) => {
        event.preventDefault();
        toggleFormat(editor, format);
      }}
    >
      <FontAwesomeIcon
        icon={icon}
        className={active ? 'text-primary' : 'text-white'}
      />
    </button>
  );
}
