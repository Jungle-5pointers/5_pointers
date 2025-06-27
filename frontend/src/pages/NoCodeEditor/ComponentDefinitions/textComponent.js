// 텍스트 컴포넌트에서 사용할 에디터들 정의
export const textEditors = [
  {
    editor: 'TextEditor',
    propKey: 'text',
    label: 'Text Content',
    placeholder: 'Enter text content'
  },
  {
    editor: 'FontSizeEditor',
    propKey: 'fontSize', 
    label: 'Font Size',
    min: 8,
    max: 72,
    suffix: 'px'
  },
  {
    editor: 'ColorEditor',
    propKey: 'color',
    label: 'Text Color'
  }
];

// 텍스트 컴포넌트 메타데이터
export const textMeta = {
  type: 'text',
  label: 'Text',
  icon: '📝',
  description: 'Simple text component'
};
