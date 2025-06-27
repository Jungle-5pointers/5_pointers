// 속성 타입 정의
export interface PropertyDefinition {
  key: string;
  label: string;
  type: 'text' | 'color' | 'number' | 'slider' | 'select' | 'boolean';
  defaultValue: any;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

// 컴포넌트 정의 인터페이스
export interface ComponentDefinition {
  type: string;
  name: string;
  icon: string;
  category: string;
  properties: PropertyDefinition[];
  defaultProps: Record<string, any>;
}

// 버튼 컴포넌트 정의
export const ButtonComponentDefinition: ComponentDefinition = {
  type: 'BUTTON',
  name: '버튼',
  icon: '🔘',
  category: 'interactive',
  properties: [
    {
      key: 'text',
      label: '버튼 텍스트',
      type: 'text',
      defaultValue: 'Click Me'
    },
    {
      key: 'backgroundColor',
      label: '배경색',
      type: 'color',
      defaultValue: '#3B82F6'
    },
    {
      key: 'textColor',
      label: '텍스트 색상',
      type: 'color',
      defaultValue: '#FFFFFF'
    },
    {
      key: 'fontSize',
      label: '폰트 크기',
      type: 'slider',
      defaultValue: 16,
      min: 12,
      max: 32,
      step: 1
    },
    {
      key: 'fontWeight',
      label: '폰트 굵기',
      type: 'select',
      defaultValue: 'normal',
      options: ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900']
    },
    {
      key: 'borderRadius',
      label: '모서리 둥글기',
      type: 'slider',
      defaultValue: 6,
      min: 0,
      max: 20,
      step: 1
    },
    {
      key: 'padding',
      label: '내부 여백',
      type: 'text',
      defaultValue: '8px 16px'
    },
    {
      key: 'disabled',
      label: '비활성화',
      type: 'boolean',
      defaultValue: false
    }
  ],
  defaultProps: {
    text: 'Click Me',
    backgroundColor: '#3B82F6',
    textColor: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'normal',
    borderRadius: 6,
    padding: '8px 16px',
    disabled: false
  }
};

// 선택된 컴포넌트 타입 (속성 에디터에서 사용)
export interface SelectedComponent {
  id: string;
  type: string;
  props: Record<string, any>;
  position: { x: number; y: number };
}

// 속성 변경 이벤트 타입
export interface PropertyChangeEvent {
  componentId: string;
  propertyKey: string;
  newValue: any;
}
