// 버튼 컴포넌트에서 사용할 에디터들 정의
export const buttonEditors = [
  {
    editor: 'TextEditor',
    propKey: 'text',
    label: 'Button Text',
    placeholder: 'Enter button text'
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
  },
  {
    editor: 'BackgroundColorEditor',
    propKey: 'bg',
    label: 'Background Color'
  }
];

// 버튼 컴포넌트 메타데이터
export const buttonMeta = {
  type: 'button',
  label: 'Button',
  icon: '🔘',
  description: 'Interactive button component'
};
