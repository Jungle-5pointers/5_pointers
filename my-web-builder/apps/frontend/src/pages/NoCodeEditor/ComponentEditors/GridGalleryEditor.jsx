/**
 * GridGalleryEditor - 그리드 갤러리 컴포넌트 편집 에디터
 * 
 * 기능:
 * - 영역 크기 설정 (containerWidth, containerHeight)
 * - 그리드 배열 설정 (rows, columns)
 * - 이미지 목록 관리 (ImageListEditor 사용)
 * - 스타일 옵션 (gap, borderRadius, objectFit 등)
 * - 모달 옵션 (enableModal, showNavigation, showCaption)
 * 
 * 사용하는 속성 에디터:
 * - NumberEditor: 크기, 행/열, 간격 등
 * - ImageListEditor: 이미지 목록 관리
 * - BooleanEditor: 모달 옵션들
 * - ColorEditor: 배경색
 * - ObjectFitEditor: 이미지 맞춤 방식
 */

import React from "react";
import { 
  NumberEditor, 
  ImageListEditor,
  BooleanEditor,
  ColorEditor,
  ObjectFitEditor,
  BorderRadiusEditor,
} from "../PropertyEditors";

function GridGalleryEditor({ selectedComp, onUpdate }) {
  // 속성 업데이트 함수
  const updateProperty = (propKey, value) => {
    const updatedComp = {
      ...selectedComp,
      props: {
        ...selectedComp.props,
        [propKey]: value
      }
    };
    onUpdate(updatedComp);
  };

  return (
    <div>


      {/* 영역 크기 설정 - 제거됨 */}

      {/* 그리드 설정 */}
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ margin: "0 0 12px 0", fontSize: 13, fontWeight: 600, color: "#333" }}>
          그리드 배열
        </h4>
        
        <NumberEditor
          value={selectedComp.props.rows}
          onChange={value => updateProperty("rows", value)}
          label="행 수"
          min={1}
          max={10}
        />
        
        <NumberEditor
          value={selectedComp.props.columns}
          onChange={value => updateProperty("columns", value)}
          label="열 수"
          min={1}
          max={10}
        />
        
        <NumberEditor
          value={selectedComp.props.gap}
          onChange={value => updateProperty("gap", value)}
          label="간격"
          min={0}
          max={50}
          suffix="px"
        />
      </div>

      {/* 이미지 목록 */}
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ margin: "0 0 12px 0", fontSize: 13, fontWeight: 600, color: "#333" }}>
          이미지 관리
        </h4>
        
        <ImageListEditor
          value={selectedComp.props.images}
          onChange={value => updateProperty("images", value)}
          label="이미지 목록"
        />
      </div>

      {/* 스타일 설정 */}
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ margin: "0 0 12px 0", fontSize: 13, fontWeight: 600, color: "#333" }}>
          스타일 설정
        </h4>
        
        <BorderRadiusEditor
          value={selectedComp.props.borderRadius}
          onChange={value => updateProperty("borderRadius", value)}
          label="모서리 둥글기"
        />
        
        <ObjectFitEditor
          value={selectedComp.props.objectFit}
          onChange={value => updateProperty("objectFit", value)}
          label="이미지 맞춤"
        />
        
        <ColorEditor
          value={selectedComp.props.backgroundColor}
          onChange={value => updateProperty("backgroundColor", value)}
          label="배경색"
        />
      </div>

      {/* 모달 설정 */}
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ margin: "0 0 12px 0", fontSize: 13, fontWeight: 600, color: "#333" }}>
          모달 설정
        </h4>
        
        <BooleanEditor
          value={selectedComp.props.enableModal}
          onChange={value => updateProperty("enableModal", value)}
          label="전체화면 보기 활성화"
        />
      </div>

      {/* 정보 표시 */}
      <div style={{
        padding: 12,
        backgroundColor: "#f8f9fa",
        borderRadius: 6,
        fontSize: 12,
        color: "#6c757d",
        marginTop: 16
      }}>
        <div>총 슬롯: {selectedComp.props.rows * selectedComp.props.columns}개</div>
        <div>등록된 이미지: {selectedComp.props.images?.length || 0}개</div>
        <div>빈 슬롯: {(selectedComp.props.rows * selectedComp.props.columns) - (selectedComp.props.images?.length || 0)}개</div>
      </div>
    </div>
  );
}

export default GridGalleryEditor;
