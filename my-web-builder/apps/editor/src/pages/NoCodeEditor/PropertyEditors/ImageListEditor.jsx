/**
 * ImageListEditor - 다중 이미지 목록 관리 에디터
 * 
 * 기능:
 * - 다중 이미지 업로드 (드래그 앤 드롭 지원)
 * - 이미지 순서 변경 (드래그 앤 드롭)
 * - 개별 이미지 삭제
 * - 이미지별 캡션 추가/편집
 * - 이미지 미리보기 표시
 * 
 * 데이터 구조:
 * images: [
 *   { id: string, src: string, alt: string, caption: string }
 * ]
 * 
 * 사용 예시:
 * <ImageListEditor 
 *   value={images} 
 *   onChange={(newImages) => setImages(newImages)} 
 *   label="이미지 목록" 
 * />
 */

import React, { useState, useRef } from "react";

function ImageListEditor({ value = [], onChange, label = "이미지 목록" }) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const fileInputRef = useRef();

  // 파일 선택 처리
  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    const newImages = [];
    
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name}은(는) 이미지 파일이 아닙니다.`);
        continue;
      }

      // 파일을 Base64로 변환
      const reader = new FileReader();
      const imageData = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });

      newImages.push({
        id: Date.now() + Math.random(),
        src: imageData,
        alt: file.name.split(".")[0],
        caption: ""
      });
    }

    onChange([...value, ...newImages]);
    event.target.value = ""; // 파일 입력 초기화
  };

  // 이미지 삭제
  const handleRemoveImage = (imageId) => {
    onChange(value.filter(img => img.id !== imageId));
  };

  // 캡션 업데이트
  const handleCaptionChange = (imageId, caption) => {
    onChange(value.map(img => 
      img.id === imageId ? { ...img, caption } : img
    ));
  };

  // 드래그 시작
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  // 드래그 오버
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // 드롭 처리
  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newImages = [...value];
    
    // 드래그된 아이템을 새 위치로 이동
    const [draggedItem] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedItem);
    
    onChange(newImages);
    setDraggedIndex(null);
  };

  return (
    <div style={{ marginBottom: 16 }}>
      {/* 라벨 */}
      <label style={{ 
        display: "block",
        fontSize: 13, 
        color: "#333", 
        fontWeight: 500,
        marginBottom: 8
      }}>
        {label}
      </label>

      {/* 이미지 업로드 버튼 */}
      <div style={{ marginBottom: 12 }}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: "8px 16px",
            backgroundColor: "#f3f4f6",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            fontSize: 13,
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#e5e7eb"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#f3f4f6"}
        >
          + 이미지 추가
        </button>
        <span style={{ 
          marginLeft: 8, 
          fontSize: 12, 
          color: "#6b7280" 
        }}>
          ({value.length}개)
        </span>
      </div>

      {/* 이미지 목록 */}
      {value.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: 12,
          padding: 12,
          backgroundColor: "#f9fafb",
          borderRadius: 6,
          border: "1px solid #e5e7eb"
        }}>
          {value.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              style={{
                position: "relative",
                backgroundColor: "white",
                borderRadius: 6,
                overflow: "hidden",
                border: "1px solid #e5e7eb",
                cursor: "move",
                transition: "all 0.2s ease"
              }}
            >
              {/* 이미지 미리보기 */}
              <div style={{
                width: "100%",
                height: 80,
                overflow: "hidden",
                position: "relative"
              }}>
                <img
                  src={image.src}
                  alt={image.alt}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                />
                
                {/* 삭제 버튼 */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(image.id)}
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 20,
                    height: 20,
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    fontSize: 12,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  ×
                </button>
              </div>

              {/* 캡션 입력 */}
              <div style={{ padding: 8 }}>
                <input
                  type="text"
                  placeholder="캡션 입력"
                  value={image.caption}
                  onChange={(e) => handleCaptionChange(image.id, e.target.value)}
                  style={{
                    width: "100%",
                    padding: 4,
                    fontSize: 11,
                    border: "1px solid #e5e7eb",
                    borderRadius: 3,
                    outline: "none"
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 빈 상태 메시지 */}
      {value.length === 0 && (
        <div style={{
          padding: 24,
          textAlign: "center",
          color: "#6b7280",
          fontSize: 13,
          backgroundColor: "#f9fafb",
          border: "2px dashed #d1d5db",
          borderRadius: 6
        }}>
          이미지를 추가해주세요
        </div>
      )}
    </div>
  );
}

export default ImageListEditor;
