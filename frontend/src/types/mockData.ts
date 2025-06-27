import { SelectedComponent, ButtonComponentDefinition } from './componentDefinitions';

// 개발용 Mock 데이터
export const mockSelectedComponent: SelectedComponent = {
  id: 'button_001',
  type: 'BUTTON',
  props: {
    text: 'Click Me',
    backgroundColor: '#3B82F6',
    textColor: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'normal',
    borderRadius: 6,
    padding: '8px 16px',
    disabled: false
  },
  position: { x: 100, y: 100 }
};

// 컴포넌트 정의 맵
export const ComponentDefinitions = {
  BUTTON: ButtonComponentDefinition
};

// 속성 에디터에서 사용할 헬퍼 함수
export const getComponentDefinition = (type: string) => {
  return ComponentDefinitions[type as keyof typeof ComponentDefinitions];
};

// 기본 속성값 가져오기
export const getDefaultProps = (type: string) => {
  const definition = getComponentDefinition(type);
  return definition ? definition.defaultProps : {};
};
