/**
 * ImageListEditor - 다중 이미지 목록 관리 에디터
 * 
 * 기능:
 * - 다중 이미지 업로드 (서버 업로드 방식)
 * - 이미지 순서 변경 (드래그 앤 드롭)
 * - 개별 이미지 삭제
 * - 이미지별 캡션 추가/편집
 * - 이미지 미리보기 표시
 * 
 * 데이터 구조:
 * images: [
 *   { id: string, src: string, alt: string, caption: string }
 * ]
 */

import React, { useState, useRef } from "react";
import { API_BASE_URL } from '../../../config.js';

function ImageListEditor({ value = [], onChange, label = "이미지 목록" }) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef();

  // 🚀 서버 업로드 방식으로 변경된 파일 선택 처리
  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    setIsUploading(true);
    const newImages = [];
    
    try {
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          alert(`${file.name}은(는) 이미지 파일이 아닙니다.`);
          continue;
        }

        // 파일 크기 검증 (5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name}의 크기가 5MB를 초과합니다.`);
          continue;
        }

        // 서버에 파일 업로드
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch(`${API_BASE_URL}/users/upload/image`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`${file.name} 업로드 실패: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          newImages.push({
            id: Date.now() + Math.random(),
            src: result.imageUrl, // 서버 URL 사용
            alt: file.name.split(".")[0],
            caption: ""
          });
        } else {
          throw new Error(`${file.name} 업로드 실패`);
        }
      }

      if (newImages.length > 0) {
        onChange([...value, ...newImages]);
      }
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert("이미지 업로드에 실패했습니다: " + error.message);
    } finally {
      setIsUploading(false);
      event.target.value = ""; // 파일 입력 초기화
    }
  };

  // 이미지 삭제
  const handleRemoveImage = (imageId) => {
    onChange(value.filter(img => img.id !== imageId));
  };

  // 캡션 업데이트
  const handleCaptionChange = (imageId, newCaption) => {
    onChange(value.map(img => 
      img.id === imageId ? { ...img, caption: newCaption } : img
    ));
  };

  // 드래그 앤 드롭 처리
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setIsDragging(false);
      setDraggedIndex(null);
      return;
    }

    const newImages = [...value];
    const draggedImage = newImages[draggedIndex];
    
    // 드래그된 이미지 제거
    newImages.splice(draggedIndex, 1);
    
    // 새 위치에 삽입
    const adjustedDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newImages.splice(adjustedDropIndex, 0, draggedImage);
    
    onChange(newImages);
    setIsDragging(false);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedIndex(null);
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ 
        display: "block", 
        marginBottom: "8px", 
        fontWeight: "500", 
        fontSize: "14px" 
      }}>
        {label}
      </label>

      {/* 이미지 추가 버튼 */}
      <div style={{ marginBottom: "12px" }}>
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
          disabled={isUploading}
          style={{
            padding: "8px 16px",
            backgroundColor: isUploading ? "#f9fafb" : "#f3f4f6",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            fontSize: 13,
            cursor: isUploading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          {isUploading ? (
            <>
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  border: "2px solid #d1d5db",
                  borderTop: "2px solid #3b82f6",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              업로드 중...
            </>
          ) : (
            <>+ 이미지 추가</>
          )}
        </button>
      </div>

      {/* 이미지 목록 */}
      {value.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: "12px",
          padding: "12px",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          backgroundColor: "#fafafa"
        }}>
          {value.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              style={{
                position: "relative",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                overflow: "hidden",
                backgroundColor: "white",
                cursor: isDragging && draggedIndex === index ? "grabbing" : "grab",
                opacity: isDragging && draggedIndex === index ? 0.5 : 1,
                transition: "all 0.2s ease"
              }}
            >
              {/* 이미지 */}
              <img
                src={image.src}
                alt={image.alt}
                style={{
                  width: "100%",
                  height: "80px",
                  objectFit: "cover",
                  display: "block"
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              
              {/* 이미지 로드 실패 시 표시 */}
              <div style={{
                display: "none",
                width: "100%",
                height: "80px",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f3f4f6",
                color: "#6b7280",
                fontSize: "12px"
              }}>
                이미지 로드 실패
              </div>

              {/* 삭제 버튼 */}
              <button
                type="button"
                onClick={() => handleRemoveImage(image.id)}
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  width: "20px",
                  height: "20px",
                  backgroundColor: "rgba(239, 68, 68, 0.9)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ×
              </button>

              {/* 캡션 입력 */}
              <input
                type="text"
                value={image.caption}
                onChange={(e) => handleCaptionChange(image.id, e.target.value)}
                placeholder="사진에 대한 짧은 설명을 적어주세요"
                style={{
                  width: "100%",
                  padding: "4px 6px",
                  border: "none",
                  borderTop: "1px solid #e5e7eb",
                  fontSize: "11px",
                  outline: "none"
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* 빈 상태 */}
      {value.length === 0 && (
        <div style={{
          padding: "24px",
          border: "2px dashed #d1d5db",
          borderRadius: "8px",
          textAlign: "center",
          color: "#6b7280",
          fontSize: "14px"
        }}>
          이미지를 추가해주세요
        </div>
      )}

      {/* CSS 애니메이션 */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default ImageListEditor;
