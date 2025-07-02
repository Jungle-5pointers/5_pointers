/**
 * SlideGalleryEditor - 슬라이드 갤러리 컴포넌트 편집 에디터
 * 
 * 기능:
 * - 메인 영역 크기 설정 (containerWidth, containerHeight)
 * - 썸네일 설정 (thumbnailHeight, thumbnailGap)
 * - 이미지 목록 관리 (ImageListEditor 사용)
 * - 스타일 옵션 (backgroundColor, borderRadius)
 * - 표시 옵션 (showArrows, showThumbnails, showCounter)
 * - 자동 재생 설정 (autoPlay, autoPlayInterval)
 * 
 * 사용하는 속성 에디터:
 * - NumberEditor: 크기, 간격, 시간 설정
 * - ImageListEditor: 이미지 목록 관리
 * - BooleanEditor: 표시 옵션들
 * - ColorEditor: 배경색
 * - BorderRadiusEditor: 모서리 둥글기
 */

import React from "react";
import { 
  NumberEditor, 
  ImageListEditor,
  BooleanEditor,
  ColorEditor,
  BorderRadiusEditor
} from "../PropertyEditors";

function SlideGalleryEditor({ selectedComp, onUpdate }) {
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
      {/* 컴포넌트 정보 */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 20,
        padding: "8px 12px",
        backgroundColor: "#f0f2f5",
        borderRadius: 6
      }}>
        <span style={{ fontSize: 16 }}>🎠</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>슬라이드 갤러리</div>
          <div style={{ fontSize: 12, color: "#666" }}>한 장씩 감상하는 슬라이드형 갤러리</div>
        </div>
      </div>

      {/* 메인 영역 크기 설정 */}
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ margin: "0 0 12px 0", fontSize: 13, fontWeight: 600, color: "#333" }}>
          📐 메인 영역 크기
        </h4>
        
        <NumberEditor
          value={selectedComp.props.containerWidth}
          onChange={value => updateProperty("containerWidth", value)}
          label="메인 영역 폭"
          min={300}
          max={1200}
          suffix="px"
        />
        
        <NumberEditor
          value={selectedComp.props.containerHeight}
          onChange={value => updateProperty("containerHeight", value)}
          label="메인 영역 높이"
          min={200}
          max={800}
          suffix="px"
        />
      </div>

      {/* 썸네일 설정 */}
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ margin: "0 0 12px 0", fontSize: 13, fontWeight: 600, color: "#333" }}>
          🖼️ 썸네일 설정
        </h4>
        
        <NumberEditor
          value={selectedComp.props.thumbnailHeight}
          onChange={value => updateProperty("thumbnailHeight", value)}
          label="썸네일 높이"
          min={40}
          max={120}
          suffix="px"
        />
        
        <NumberEditor
          value={selectedComp.props.thumbnailGap}
          onChange={value => updateProperty("thumbnailGap", value)}
          label="썸네일 간격"
          min={0}
          max={20}
          suffix="px"
        />
      </div>

      {/* 이미지 목록 */}
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ margin: "0 0 12px 0", fontSize: 13, fontWeight: 600, color: "#333" }}>
          🖼️ 이미지 관리
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
          🎨 스타일 설정
        </h4>
        
        <ColorEditor
          value={selectedComp.props.backgroundColor}
          onChange={value => updateProperty("backgroundColor", value)}
          label="배경색"
        />
        
        <BorderRadiusEditor
          value={selectedComp.props.borderRadius}
          onChange={value => updateProperty("borderRadius", value)}
          label="모서리 둥글기"
        />
      </div>

      {/* 표시 옵션 */}
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ margin: "0 0 12px 0", fontSize: 13, fontWeight: 600, color: "#333" }}>
          👁️ 표시 옵션
        </h4>
        
        <BooleanEditor
          value={selectedComp.props.showArrows}
          onChange={value => updateProperty("showArrows", value)}
          label="화살표 표시"
        />
        
        <BooleanEditor
          value={selectedComp.props.showThumbnails}
          onChange={value => updateProperty("showThumbnails", value)}
          label="썸네일 표시"
        />
        
        <BooleanEditor
          value={selectedComp.props.showCounter}
          onChange={value => updateProperty("showCounter", value)}
          label="카운터 표시 (3/8)"
        />
        
        <BooleanEditor
          value={selectedComp.props.showCaption}
          onChange={value => updateProperty("showCaption", value)}
          label="캡션 표시"
        />
      </div>

      {/* 자동 재생 설정 */}
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ margin: "0 0 12px 0", fontSize: 13, fontWeight: 600, color: "#333" }}>
          ⏯️ 자동 재생 설정
        </h4>
        
        <BooleanEditor
          value={selectedComp.props.autoPlay}
          onChange={value => updateProperty("autoPlay", value)}
          label="자동 재생 활성화"
        />
        
        {selectedComp.props.autoPlay && (
          <NumberEditor
            value={selectedComp.props.autoPlayInterval}
            onChange={value => updateProperty("autoPlayInterval", value)}
            label="재생 간격"
            min={1000}
            max={10000}
            suffix="ms"
          />
        )}
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
        <div>등록된 이미지: {selectedComp.props.images?.length || 0}개</div>
        <div>현재 슬라이드: {selectedComp.props.images?.length > 0 ? "1" : "0"} / {selectedComp.props.images?.length || 0}</div>
        {selectedComp.props.autoPlay && (
          <div>자동 재생: {selectedComp.props.autoPlayInterval / 1000}초 간격</div>
        )}
      </div>
    </div>
  );
}

export default SlideGalleryEditor;
