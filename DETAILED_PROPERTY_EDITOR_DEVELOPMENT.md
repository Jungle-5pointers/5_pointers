# Page Cube 속성 에디터 개발 과정 상세 정리

## 🎯 개발 목표
캔버스에서 선택된 컴포넌트의 속성을 실시간으로 편집할 수 있는 속성 에디터 구현

---

## 📋 1단계: 개발 전략 수립

### 개발 접근 방식 결정
- **Mock 데이터 우선 개발**: 팀원의 캔버스/사이드바 작업과 병렬 진행
- **컴포넌트 정의 시스템**: 확장 가능한 구조 설계
- **단계적 구현**: 간단한 버튼 컴포넌트부터 시작

### 기술 스택 선택
- **React + TypeScript**: 타입 안전성과 컴포넌트 재사용성
- **Tailwind CSS**: 빠른 스타일링과 일관된 디자인
- **상태 관리**: React useState (추후 Zustand 연동 예정)

---

## 🏗️ 2단계: 컴포넌트 정의 시스템 설계

### 타입 시스템 구축
```typescript
// 속성 정의 인터페이스
interface PropertyDefinition {
  key: string;           // 속성 키 (예: 'fontSize')
  label: string;         // UI 표시 라벨 (예: '폰트 크기')
  type: PropertyType;    // 입력 컨트롤 타입
  defaultValue: any;     // 기본값
  min?: number;          // 슬라이더 최소값
  max?: number;          // 슬라이더 최대값
  step?: number;         // 슬라이더 단계
  options?: string[];    // 드롭다운 선택지
}

// 지원하는 속성 타입들
type PropertyType = 
  | 'text'      // 텍스트 입력 필드
  | 'color'     // 색상 선택기
  | 'slider'    // 범위 슬라이더
  | 'select'    // 드롭다운 선택
  | 'boolean';  // 체크박스
```

### 컴포넌트 정의 구조
```typescript
interface ComponentDefinition {
  type: string;                    // 컴포넌트 타입 (BUTTON, TEXT 등)
  name: string;                    // 사용자에게 표시될 이름
  icon: string;                    // 아이콘 (이모지)
  category: string;                // 카테고리 분류
  properties: PropertyDefinition[]; // 편집 가능한 속성들
  defaultProps: Record<string, any>; // 기본 속성값들
}
```

### 버튼 컴포넌트 정의 (초기 버전)
```typescript
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
      key: 'backgroundColor',
      label: '배경색',
      type: 'color',
      defaultValue: '#3B82F6'
    },
    // ... 추가 속성들
  ]
};
```

---

## 🔧 3단계: Mock 데이터 시스템 구현 (실패 사례)

### 첫 번째 시도: 별도 파일 분리
```typescript
// types/componentDefinitions.ts
export interface SelectedComponent { ... }
export const ButtonComponentDefinition = { ... };

// types/mockData.ts  
import { SelectedComponent } from './componentDefinitions';
export const mockSelectedComponent: SelectedComponent = { ... };
```

### 발생한 문제들
1. **Import 경로 에러**
   ```
   Failed to resolve import "../types/mockData" 
   ```

2. **TypeScript 모듈 해석 문제**
   - `verbatimModuleSyntax: true` 설정으로 인한 충돌
   - ES 모듈과 CommonJS 혼재 문제

3. **런타임 에러**
   ```
   The requested module does not provide an export named 'SelectedComponent'
   ```

### 시도한 해결 방법들
1. **확장자 명시**: `.js` 확장자 추가
2. **경로 수정**: 상대 경로 재확인
3. **TypeScript 설정 조정**: 모듈 해석 방식 변경

### 최종 결정: Mock 데이터 의존성 제거
- 외부 파일 의존성 완전 제거
- 컴포넌트 내부에 모든 정의 포함
- 즉시 사용 가능한 독립적 구조

---

## 🎨 4단계: 속성 에디터 UI 구현

### 메인 컴포넌트 구조
```typescript
const PropertyEditor: React.FC<PropertyEditorProps> = ({ 
  selectedComponent = defaultSelectedComponent,
  onPropertyChange 
}) => {
  const [componentProps, setComponentProps] = useState(selectedComponent.props);
  
  // 컴포넌트 정의 가져오기
  const componentDefinition = getComponentDefinition(selectedComponent.type);
  
  // 속성 변경 핸들러
  const handlePropertyChange = (propertyKey: string, newValue: any) => {
    // 로컬 상태 업데이트
    setComponentProps(prev => ({ ...prev, [propertyKey]: newValue }));
    
    // 부모 컴포넌트에 변경사항 전달
    onPropertyChange?.(selectedComponent.id, propertyKey, newValue);
  };
```

### 동적 입력 컴포넌트 렌더링
```typescript
const renderPropertyInput = (property: PropertyDefinition) => {
  const currentValue = componentProps[property.key] ?? property.defaultValue;

  switch (property.type) {
    case 'text':
      return <TextInput value={currentValue} onChange={...} />;
    case 'color':
      return <ColorPicker value={currentValue} onChange={...} />;
    case 'slider':
      return <RangeSlider min={property.min} max={property.max} />;
    // ... 기타 타입들
  }
};
```

### 각 입력 컴포넌트 상세 구현

#### 1. 텍스트 입력
```typescript
case 'text':
  return (
    <input
      type="text"
      value={currentValue}
      onChange={(e) => handlePropertyChange(property.key, e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md 
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder={property.defaultValue}
    />
  );
```

#### 2. 색상 선택기 (하이브리드 방식)
```typescript
case 'color':
  return (
    <div className="flex items-center space-x-2">
      {/* 색상 피커 */}
      <input
        type="color"
        value={currentValue}
        onChange={(e) => handlePropertyChange(property.key, e.target.value)}
        className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
      />
      {/* 텍스트 입력 (HEX 값 직접 입력) */}
      <input
        type="text"
        value={currentValue}
        onChange={(e) => handlePropertyChange(property.key, e.target.value)}
        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
        placeholder="#000000"
      />
    </div>
  );
```

#### 3. 범위 슬라이더 (값 표시 포함)
```typescript
case 'slider':
  return (
    <div className="space-y-2">
      {/* 현재 값과 범위 표시 */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">{property.min}</span>
        <span className="text-sm font-medium">{currentValue}px</span>
        <span className="text-sm text-gray-600">{property.max}</span>
      </div>
      {/* 슬라이더 */}
      <input
        type="range"
        min={property.min}
        max={property.max}
        step={property.step || 1}
        value={currentValue}
        onChange={(e) => handlePropertyChange(property.key, Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
```

#### 4. 드롭다운 선택
```typescript
case 'select':
  return (
    <select
      value={currentValue}
      onChange={(e) => handlePropertyChange(property.key, e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md"
    >
      {property.options?.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
```

#### 5. 체크박스 (상태 표시 포함)
```typescript
case 'boolean':
  return (
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        checked={currentValue}
        onChange={(e) => handlePropertyChange(property.key, e.target.checked)}
        className="w-4 h-4 text-blue-600 border-gray-300 rounded"
      />
      <span className="text-sm text-gray-700">
        {currentValue ? '활성화됨' : '비활성화됨'}
      </span>
    </label>
  );
```

---

## 🖼️ 5단계: 실시간 미리보기 구현

### 미리보기 렌더링
```typescript
{/* 미리보기 섹션 */}
<div className="p-4 border-t border-gray-200 bg-gray-50">
  <h3 className="text-sm font-medium text-gray-700 mb-3">미리보기</h3>
  <div className="p-4 bg-white border border-gray-200 rounded-lg">
    {selectedComponent.type === 'BUTTON' && (
      <button
        style={{
          backgroundColor: componentProps.backgroundColor,
          color: componentProps.textColor,
          fontSize: `${componentProps.fontSize}px`,
          fontWeight: componentProps.fontWeight,
          borderRadius: `${componentProps.borderRadius}px`,
          padding: componentProps.padding,
          border: 'none',
          cursor: componentProps.disabled ? 'not-allowed' : 'pointer',
          opacity: componentProps.disabled ? 0.6 : 1
        }}
        disabled={componentProps.disabled}
      >
        {componentProps.text}
      </button>
    )}
  </div>
</div>
```

### 실시간 업데이트 메커니즘
1. **상태 변경**: 사용자 입력 → `handlePropertyChange` 호출
2. **로컬 상태 업데이트**: `setComponentProps` 실행
3. **미리보기 반영**: React 리렌더링으로 즉시 반영
4. **부모 통신**: `onPropertyChange` 콜백으로 변경사항 전달

---

## 🔧 6단계: 크기 시스템 개선

### 발견된 문제
- **폰트 크기 변경 시 버튼 전체 크기 증가**
- 사용자가 의도한 것: 텍스트 크기만 변경
- 실제 동작: 버튼 전체가 커짐 (padding 때문)

### 문제 분석
```css
/* 기존 방식 (문제 있음) */
button {
  padding: 8px 16px;  /* 고정 패딩 */
  font-size: 16px;    /* 폰트 크기 변경 시 버튼도 커짐 */
}
```

### 해결 방안: 크기 속성 분리
```typescript
// 새로운 속성 추가
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
}
```

### 개선된 버튼 스타일
```css
button {
  width: 120px;           /* 고정 너비 */
  height: 40px;           /* 고정 높이 */
  font-size: 14px;        /* 독립적인 폰트 크기 */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;       /* 텍스트 오버플로우 처리 */
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

### 결과
- ✅ 폰트 크기 변경 시 버튼 크기 고정
- ✅ 버튼 크기 독립적 조절 가능
- ✅ 긴 텍스트 오버플로우 처리
- ✅ 사용자 의도에 맞는 직관적 동작

---

## 🧪 7단계: 테스트 환경 구축

### 테스트 페이지 구현
```typescript
const PropertyEditorTest: React.FC = () => {
  const handlePropertyChange = (componentId: string, propertyKey: string, newValue: any) => {
    console.log('속성 변경:', { componentId, propertyKey, newValue });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* 메인 영역 */}
        <div className="flex-1 p-8">
          <div className="text-center">
            <h2>메인 캔버스 영역</h2>
            <p>오른쪽 속성 에디터에서 버튼 속성을 변경해보세요</p>
          </div>
        </div>
        
        {/* 속성 에디터 */}
        <PropertyEditor onPropertyChange={handlePropertyChange} />
      </div>
    </div>
  );
};
```

### 라우팅 설정
```typescript
// App.jsx에 테스트 라우트 추가
<Route path="/test/property-editor" element={<PropertyEditorTest />} />

// 메인 페이지에 테스트 링크 추가
<button onClick={() => navigate('/test/property-editor')}>
  🧪 속성 에디터 테스트
</button>
```

---

## 🎯 최종 구현 결과

### 완성된 기능들
1. **8가지 버튼 속성 편집**
   - 텍스트, 너비, 높이, 배경색, 텍스트 색상
   - 폰트 크기, 폰트 굵기, 모서리 둥글기, 비활성화

2. **5가지 입력 컨트롤**
   - 텍스트 입력, 색상 선택기, 슬라이더, 드롭다운, 체크박스

3. **실시간 기능**
   - 즉시 미리보기 업데이트
   - 콘솔 로그 출력
   - 부모 컴포넌트 통신

4. **사용자 경험**
   - 직관적인 UI 레이아웃
   - 반응형 디자인
   - 접근성 고려

### 기술적 성과
- **타입 안전성**: TypeScript 완전 활용
- **확장성**: 새 컴포넌트 타입 쉽게 추가
- **재사용성**: 속성 정의 기반 동적 UI
- **성능**: 효율적인 React 상태 관리

---

## 🚀 개발 과정에서 배운 점

### 기술적 학습
1. **동적 컴포넌트 렌더링**: switch문을 활용한 조건부 렌더링
2. **TypeScript 고급 활용**: 복잡한 인터페이스와 제네릭 타입
3. **React 상태 관리**: useState와 props drilling 최적화
4. **CSS-in-JS**: 동적 스타일 적용과 성능 고려사항

### 문제 해결 경험
1. **모듈 시스템 이해**: ES 모듈과 CommonJS 차이점
2. **TypeScript 설정**: 컴파일러 옵션이 런타임에 미치는 영향
3. **사용자 경험 설계**: 개발자 의도와 사용자 기대의 차이

### 개발 방법론
1. **점진적 개발**: 간단한 기능부터 복잡한 기능으로
2. **문제 격리**: 의존성을 최소화하여 디버깅 용이성 확보
3. **사용자 중심 설계**: 기술적 구현보다 사용성 우선

---

**개발 완료일**: 2025년 6월 27일  
**총 개발 시간**: 약 4시간  
**최종 상태**: 1차 개발 완료, API 연동 준비 완료
