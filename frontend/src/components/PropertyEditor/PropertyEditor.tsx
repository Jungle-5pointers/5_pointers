import React, { useState } from 'react';

// 타입 정의를 직접 여기에 포함
interface PropertyDefinition {
  key: string;
  label: string;
  type: 'text' | 'color' | 'number' | 'slider' | 'select' | 'boolean';
  defaultValue: any;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

interface ComponentDefinition {
  type: string;
  name: string;
  icon: string;
  category: string;
  properties: PropertyDefinition[];
  defaultProps: Record<string, any>;
}

interface SelectedComponent {
  id: string;
  type: string;
  props: Record<string, any>;
  position: { x: number; y: number };
}

interface PropertyEditorProps {
  selectedComponent?: SelectedComponent;
  onPropertyChange?: (componentId: string, propertyKey: string, newValue: any) => void;
}

// 버튼 컴포넌트 정의 (크기 속성 추가)
const ButtonComponentDefinition: ComponentDefinition = {
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
      key: 'width',
      label: '버튼 너비',
      type: 'slider',
      defaultValue: 120,
      min: 60,
      max: 300,
      step: 10
    },
    {
      key: 'height',
      label: '버튼 높이',
      type: 'slider',
      defaultValue: 40,
      min: 30,
      max: 80,
      step: 5
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
      defaultValue: 14,
      min: 10,
      max: 24,
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
      key: 'disabled',
      label: '비활성화',
      type: 'boolean',
      defaultValue: false
    }
  ],
  defaultProps: {
    text: 'Click Me',
    width: 120,
    height: 40,
    backgroundColor: '#3B82F6',
    textColor: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'normal',
    borderRadius: 6,
    disabled: false
  }
};

// 기본 선택된 컴포넌트 (크기 속성 추가)
const defaultSelectedComponent: SelectedComponent = {
  id: 'button_001',
  type: 'BUTTON',
  props: {
    text: 'Click Me',
    width: 120,
    height: 40,
    backgroundColor: '#3B82F6',
    textColor: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'normal',
    borderRadius: 6,
    disabled: false
  },
  position: { x: 100, y: 100 }
};

// 컴포넌트 정의 가져오기 함수
const getComponentDefinition = (type: string): ComponentDefinition | null => {
  switch (type) {
    case 'BUTTON':
      return ButtonComponentDefinition;
    default:
      return null;
  }
};

const PropertyEditor: React.FC<PropertyEditorProps> = ({ 
  selectedComponent = defaultSelectedComponent,
  onPropertyChange 
}) => {
  const [componentProps, setComponentProps] = useState(selectedComponent.props);

  // 컴포넌트 정의 가져오기
  const componentDefinition = getComponentDefinition(selectedComponent.type);

  if (!componentDefinition) {
    return (
      <div className="p-4 bg-white border-l border-gray-200 w-80">
        <div className="text-center py-8">
          <div className="text-4xl mb-2">❓</div>
          <p className="text-sm text-gray-500">
            알 수 없는 컴포넌트 타입입니다
          </p>
        </div>
      </div>
    );
  }

  // 속성 변경 핸들러
  const handlePropertyChange = (propertyKey: string, newValue: any) => {
    const updatedProps = {
      ...componentProps,
      [propertyKey]: newValue
    };
    
    setComponentProps(updatedProps);
    
    // 부모 컴포넌트에 변경사항 전달
    if (onPropertyChange) {
      onPropertyChange(selectedComponent.id, propertyKey, newValue);
    }
  };

  // 속성 입력 컴포넌트 렌더링
  const renderPropertyInput = (property: PropertyDefinition) => {
    const currentValue = componentProps[property.key] ?? property.defaultValue;

    switch (property.type) {
      case 'text':
        return (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handlePropertyChange(property.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={property.defaultValue}
          />
        );

      case 'color':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={currentValue}
              onChange={(e) => handlePropertyChange(property.key, e.target.value)}
              className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={currentValue}
              onChange={(e) => handlePropertyChange(property.key, e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="#000000"
            />
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{property.min}</span>
              <span className="text-sm font-medium">
                {currentValue}{property.key === 'width' || property.key === 'height' ? 'px' : property.key === 'fontSize' ? 'px' : ''}
              </span>
              <span className="text-sm text-gray-600">{property.max}</span>
            </div>
            <input
              type="range"
              min={property.min}
              max={property.max}
              step={property.step || 1}
              value={currentValue}
              onChange={(e) => handlePropertyChange(property.key, Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        );

      case 'select':
        return (
          <select
            value={currentValue}
            onChange={(e) => handlePropertyChange(property.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {property.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={currentValue}
              onChange={(e) => handlePropertyChange(property.key, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              {currentValue ? '활성화됨' : '비활성화됨'}
            </span>
          </label>
        );

      default:
        return (
          <div className="text-sm text-gray-400">
            지원하지 않는 속성 타입: {property.type}
          </div>
        );
    }
  };

  return (
    <div className="bg-white border-l border-gray-200 w-80 h-full overflow-y-auto">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{componentDefinition.icon}</span>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {componentDefinition.name}
            </h2>
            <p className="text-xs text-gray-500">
              ID: {selectedComponent.id}
            </p>
          </div>
        </div>
      </div>

      {/* 속성 목록 */}
      <div className="p-4 space-y-6">
        {componentDefinition.properties.map((property) => (
          <div key={property.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {property.label}
            </label>
            {renderPropertyInput(property)}
          </div>
        ))}
      </div>

      {/* 미리보기 섹션 */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700 mb-3">미리보기</h3>
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          {selectedComponent.type === 'BUTTON' && (
            <button
              style={{
                width: `${componentProps.width}px`,
                height: `${componentProps.height}px`,
                backgroundColor: componentProps.backgroundColor,
                color: componentProps.textColor,
                fontSize: `${componentProps.fontSize}px`,
                fontWeight: componentProps.fontWeight,
                borderRadius: `${componentProps.borderRadius}px`,
                border: 'none',
                cursor: componentProps.disabled ? 'not-allowed' : 'pointer',
                opacity: componentProps.disabled ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              disabled={componentProps.disabled}
            >
              {componentProps.text}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyEditor;
