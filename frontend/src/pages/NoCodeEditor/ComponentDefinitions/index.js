// 모든 컴포넌트 정의들을 import
import { buttonEditors, buttonMeta } from './buttonComponent';
import { textEditors, textMeta } from './textComponent';

// 컴포넌트 타입별 에디터 매핑
export const COMPONENT_EDITORS = {
  button: buttonEditors,
  text: textEditors
};

// 컴포넌트 타입별 메타데이터 매핑
export const COMPONENT_META = {
  button: buttonMeta,
  text: textMeta
};

// 특정 컴포넌트 타입의 에디터들을 가져오는 함수
export function getEditorsForComponent(componentType) {
  return COMPONENT_EDITORS[componentType] || [];
}

// 특정 컴포넌트 타입의 메타데이터를 가져오는 함수
export function getMetaForComponent(componentType) {
  return COMPONENT_META[componentType] || {
    type: componentType,
    label: componentType,
    icon: '❓',
    description: 'Unknown component'
  };
}

// 모든 컴포넌트 타입 목록
export function getAllComponentTypes() {
  return Object.keys(COMPONENT_EDITORS);
}

// 컴포넌트 타입이 유효한지 확인
export function isValidComponentType(componentType) {
  return componentType in COMPONENT_EDITORS;
}
