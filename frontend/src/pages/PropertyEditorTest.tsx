import React from 'react';
import PropertyEditor from '../components/PropertyEditor/PropertyEditor';

const PropertyEditorTest: React.FC = () => {
  const handlePropertyChange = (componentId: string, propertyKey: string, newValue: any) => {
    console.log('속성 변경:', { componentId, propertyKey, newValue });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            속성 에디터 테스트
          </h1>
          <p className="text-gray-600">
            버튼 컴포넌트의 속성을 편집해보세요. 변경사항이 실시간으로 미리보기에 반영됩니다.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex">
            {/* 메인 영역 */}
            <div className="flex-1 p-8">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  메인 캔버스 영역
                </h2>
                <p className="text-gray-500 mb-8">
                  여기에 캔버스가 들어갈 예정입니다.<br/>
                  현재는 속성 에디터 테스트를 위한 공간입니다.
                </p>
                
                <div className="inline-block p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-4xl mb-2">🎨</div>
                  <p className="text-sm text-gray-500">
                    오른쪽 속성 에디터에서<br/>
                    버튼 속성을 변경해보세요
                  </p>
                </div>
              </div>
            </div>

            {/* 속성 에디터 */}
            <PropertyEditor onPropertyChange={handlePropertyChange} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyEditorTest;
