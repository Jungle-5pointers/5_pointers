/**
 * GridGalleryRenderer - 그리드 형태의 갤러리 컴포넌트 렌더러
 * 
 * 기능:
 * - 사용자 정의 그리드 배열 (행 x 열)
 * - 정사각형 이미지 컨테이너 (object-fit: cover)
 * - 클릭 시 모달 전체화면 보기
 * - 반응형 그리드 레이아웃
 * 
 * Props:
 * - containerWidth, containerHeight: 전체 영역 크기
 * - rows, columns: 그리드 배열
 * - gap: 이미지 간격
 * - images: 이미지 배열 [{ id, src, alt, caption }]
 * - enableModal: 모달 활성화 여부
 */

import React, { useState, useEffect } from "react";

function GridGalleryRenderer({ comp, isEditor = false, mode = 'editor', onUpdate }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageSize, setImageSize] = useState(0);

  const {
    containerWidth = comp.width || 400,
    containerHeight = comp.height || 300,
    rows = 3,
    columns = 4,
    gap = 8,
    borderRadius = 4,
    objectFit = "cover",
    objectPosition = "center",
    images = [],
    enableModal = true,
    backgroundColor = "#ffffff"
  } = comp.props;

  //기본값을 명시적으로 설정(에디터에서 편집은 불가능하지만 기능은 동작함)
  const showNavigation = comp.props.showNavigation !== undefined ? comp.props.showNavigation : true;
  const showCaption = comp.props.showCaption !== undefined ? comp.props.showCaption : true;

  // 이미지 크기 자동 계산
  useEffect(() => {
    const availableWidth = containerWidth - (gap * (columns - 1));
    const availableHeight = containerHeight - (gap * (rows - 1));
    
    const widthPerImage = availableWidth / columns;
    const heightPerImage = availableHeight / rows;
    
    // 정사각형을 위해 작은 값 선택
    const calculatedSize = Math.min(widthPerImage, heightPerImage);
    setImageSize(Math.max(calculatedSize, 50)); // 최소 50px
  }, [containerWidth, containerHeight, rows, columns, gap]);

  // 이미지 클릭 핸들러
  const handleImageClick = (index) => {
    if (enableModal) { // 임시: 편집모드에서도 모달 활성화
      setCurrentImageIndex(index);
      setModalOpen(true);
    }
  };

  // 모달 네비게이션
  const goToPrevious = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  // 키보드 이벤트 처리
  useEffect(() => {
    if (!modalOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setModalOpen(false);
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen, images.length]);

  // 갤러리 컨테이너 스타일
  const galleryStyle = {
    width: "100%",
    height: "100%",
    backgroundColor,
    borderRadius: borderRadius + "px",
    padding: gap + "px",
    boxSizing: "border-box",
    overflow: "hidden"
  };

  // 그리드 스타일
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gridTemplateRows: `repeat(${rows}, 1fr)`,
    gap: gap + "px",
    width: "100%",
    height: "100%"
  };

  // 이미지 아이템 스타일
  const imageItemStyle = {
    width: "100%",
    height: "100%",
    borderRadius: borderRadius + "px",
    overflow: "hidden",
    cursor: enableModal ? "pointer" : "default", // 임시: 편집모드에서도 포인터
    transition: "transform 0.2s ease",
    backgroundColor: "#f3f4f6"
  };

  // 이미지 스타일
  const imageStyle = {
    width: "100%",
    height: "100%",
    objectFit,
    objectPosition,
    display: "block"
  };

  // 빈 슬롯 스타일
  const emptySlotStyle = {
    ...imageItemStyle,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px dashed #d1d5db",
    color: "#9ca3af",
    fontSize: "12px",
    cursor: "default"
  };

  // 총 슬롯 수 계산
  const totalSlots = rows * columns;
  const slots = [];

  // 슬롯 생성
  for (let i = 0; i < totalSlots; i++) {
    const image = images[i];
    
    if (image) {
      slots.push(
        <div
          key={image.id || i}
          style={imageItemStyle}
          onClick={() => handleImageClick(i)}
          onMouseEnter={(e) => {
            if (enableModal) { // 임시: 편집모드에서도 모달 활성화
              e.target.style.transform = "scale(1.02)";
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
          }}
        >
          <img
            src={image.src}
            alt={image.alt || `이미지 ${i + 1}`}
            style={imageStyle}
            loading="lazy"
          />
        </div>
      );
    } else {
      slots.push(
        <div key={`empty-${i}`} style={emptySlotStyle}>
          {isEditor ? "+" : ""}
        </div>
      );
    }
  }

  return (
    <>
      {/* 갤러리 컨테이너 */}
      <div style={galleryStyle}>
        <div style={gridStyle}>
          {slots}
        </div>
      </div>

      {/* 모달 */}
      {modalOpen && images.length > 0 && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px"
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 현재 이미지 */}
            <div
              style={{
                width: "min(800px, 90vw)",
                height: "min(600px, 80vh)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                borderRadius: "8px",
                overflow: "hidden"
              }}
            >
              <img
                src={images[currentImageIndex]?.src}
                alt={images[currentImageIndex]?.alt}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  borderRadius: "8px"
                }}
              />
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={() => setModalOpen(false)}
              style={{
                position: "absolute",
                top: "-40px",
                right: "0",
                background: "none",
                border: "none",
                color: "white",
                fontSize: "24px",
                cursor: "pointer",
                padding: "8px"
              }}
            >
              ×
            </button>

            {/* 네비게이션 버튼 */}
            {showNavigation && images.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  style={{
                    position: "absolute",
                    left: "-50px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "none",
                    color: "white",
                    fontSize: "24px",
                    cursor: "pointer",
                    padding: "12px 16px",
                    borderRadius: "50%"
                  }}
                >
                  ‹
                </button>
                <button
                  onClick={goToNext}
                  style={{
                    position: "absolute",
                    right: "-50px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "none",
                    color: "white",
                    fontSize: "24px",
                    cursor: "pointer",
                    padding: "12px 16px",
                    borderRadius: "50%"
                  }}
                >
                  ›
                </button>
              </>
            )}

            {/* 캡션 */}
            {showCaption && images[currentImageIndex]?.caption && (
              <div
                style={{
                  position: "absolute",
                  bottom: "-40px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  color: "white",
                  fontSize: "14px",
                  textAlign: "center",
                  maxWidth: "80%"
                }}
              >
                {images[currentImageIndex].caption}
              </div>
            )}

            {/* 카운터 */}
            {images.length > 1 && (
              <div
                style={{
                  position: "absolute",
                  bottom: "-70px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  color: "white",
                  fontSize: "12px",
                  opacity: 0.7
                }}
              >
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default GridGalleryRenderer;
