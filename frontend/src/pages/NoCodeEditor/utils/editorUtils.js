// 그리드 크기 상수
export const GRID_SIZE = 50;

// 기준 뷰포트 크기 (데스크톱)
export const BASE_VIEWPORT = {
  width: 1920,
  height: 1080
};

// 뷰포트별 크기 정의
export const VIEWPORT_SIZES = {
  desktop: { width: 1920, height: 1080 },
  mobile: { width: 375, height: 667 }
};

// 반응형 스케일 계산 함수
export function getResponsiveScale(currentViewport) {
  const current = VIEWPORT_SIZES[currentViewport] || VIEWPORT_SIZES.desktop;
  const base = BASE_VIEWPORT;
  
  // 너비 기준으로 스케일 계산 (높이는 자동 조정)
  return current.width / base.width;
}

// 반응형 값 계산 함수
export function getResponsiveValue(value, viewport, type = 'size') {
  if (viewport === 'desktop') return value;
  
  const scale = getResponsiveScale(viewport);
  
  switch (type) {
    case 'size': // 크기 (width, height)
    case 'position': // 위치 (x, y)
      return Math.round(value * scale);
    case 'fontSize': // 폰트 크기
      return Math.max(12, Math.round(value * scale)); // 최소 12px
    default:
      return value;
  }
}

// 반응형 스타일 객체 생성 함수
export function getResponsiveStyles(comp, viewport, additionalStyles = {}) {
  const scale = getResponsiveScale(viewport);
  
  return {
    position: 'absolute',
    left: getResponsiveValue(comp.x, viewport, 'position'),
    top: getResponsiveValue(comp.y, viewport, 'position'),
    width: getResponsiveValue(comp.width || getComponentDimensions(comp.type).defaultWidth, viewport, 'size'),
    height: getResponsiveValue(comp.height || getComponentDimensions(comp.type).defaultHeight, viewport, 'size'),
    // 폰트 크기도 스케일링
    fontSize: comp.props?.fontSize ? getResponsiveValue(comp.props.fontSize, viewport, 'fontSize') : undefined,
    ...additionalStyles
  };
}

// clamp 함수
export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// 랜덤 닉네임/색상 생성
export function randomNickname() {
  const animals = ['Tiger', 'Bear', 'Fox', 'Wolf', 'Cat', 'Dog', 'Lion', 'Panda', 'Rabbit', 'Eagle'];
  return animals[Math.floor(Math.random() * animals.length)] + Math.floor(Math.random() * 100);
}

export function randomColor() {
  const colors = ['#3B4EFF', '#FF3B3B', '#00B894', '#FDCB6E', '#6C5CE7', '#00B8D9', '#FF7675', '#636E72'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// 컴포넌트 타입별 기본 크기와 최소 크기 정의 (50px 그리드에 맞춤)
export function getComponentDimensions(type) {
  const dimensions = {
    button: { defaultWidth: 150, defaultHeight: 50, minWidth: 100, minHeight: 50 },
    text: { defaultWidth: 200, defaultHeight: 50, minWidth: 100, minHeight: 50 },
    image: { defaultWidth: 200, defaultHeight: 150, minWidth: 100, minHeight: 100 },
    map: { defaultWidth: 400, defaultHeight: 300, minWidth: 200, minHeight: 150 },
    link: { defaultWidth: 150, defaultHeight: 50, minWidth: 100, minHeight: 50 },
    attend: { defaultWidth: 300, defaultHeight: 200, minWidth: 250, minHeight: 150 },
    dday: { defaultWidth: 200, defaultHeight: 100, minWidth: 150, minHeight: 100 },
    weddingContact: { defaultWidth: 300, defaultHeight: 250, minWidth: 250, minHeight: 200 },
    gridGallery: { defaultWidth: 400, defaultHeight: 300, minWidth: 200, minHeight: 200 },
    slideGallery: { defaultWidth: 400, defaultHeight: 300, minWidth: 200, minHeight: 200 },
    mapInfo: { defaultWidth: 300, defaultHeight: 200, minWidth: 250, minHeight: 150 },
    calendar: { defaultWidth: 350, defaultHeight: 400, minWidth: 300, minHeight: 350 },
    bankAccount: { defaultWidth: 300, defaultHeight: 200, minWidth: 250, minHeight: 150 },
    comment: { defaultWidth: 300, defaultHeight: 200, minWidth: 250, minHeight: 150 },
    musicPlayer: { defaultWidth: 150, defaultHeight: 150, minWidth: 100, minHeight: 100 }
  };
  return dimensions[type] || { defaultWidth: 150, defaultHeight: 50, minWidth: 100, minHeight: 50 };
}

// 충돌 감지 함수
export function checkCollision(comp1, comp2, getComponentDimensionsFn = getComponentDimensions) {
  const comp1Dimensions = getComponentDimensionsFn(comp1.type);
  const comp2Dimensions = getComponentDimensionsFn(comp2.type);
  
  const comp1Width = comp1.width || comp1Dimensions.defaultWidth;
  const comp1Height = comp1.height || comp1Dimensions.defaultHeight;
  const comp2Width = comp2.width || comp2Dimensions.defaultWidth;
  const comp2Height = comp2.height || comp2Dimensions.defaultHeight;
  
  return !(comp1.x + comp1Width <= comp2.x || 
           comp2.x + comp2Width <= comp1.x || 
           comp1.y + comp1Height <= comp2.y || 
           comp2.y + comp2Height <= comp1.y);
}

// 충돌 방지 위치 계산 함수
export function resolveCollision(draggedComp, otherComponents, getComponentDimensionsFn = getComponentDimensions) {
  const COLLISION_MARGIN = 10; // 컴포넌트 간 최소 간격
  let resolvedX = draggedComp.x;
  let resolvedY = draggedComp.y;
  
  const draggedDimensions = getComponentDimensionsFn(draggedComp.type);
  const draggedWidth = draggedComp.width || draggedDimensions.defaultWidth;
  const draggedHeight = draggedComp.height || draggedDimensions.defaultHeight;
  
  // 각 컴포넌트와의 충돌 검사 및 해결
  for (const other of otherComponents) {
    if (other.id === draggedComp.id) continue;
    
    const tempComp = { ...draggedComp, x: resolvedX, y: resolvedY };
    if (checkCollision(tempComp, other, getComponentDimensionsFn)) {
      const otherDimensions = getComponentDimensionsFn(other.type);
      const otherWidth = other.width || otherDimensions.defaultWidth;
      const otherHeight = other.height || otherDimensions.defaultHeight;
      
      // 4방향 중 가장 가까운 위치로 이동
      const moveOptions = [
        { x: other.x - draggedWidth - COLLISION_MARGIN, y: resolvedY }, // 왼쪽
        { x: other.x + otherWidth + COLLISION_MARGIN, y: resolvedY },   // 오른쪽
        { x: resolvedX, y: other.y - draggedHeight - COLLISION_MARGIN }, // 위쪽
        { x: resolvedX, y: other.y + otherHeight + COLLISION_MARGIN }   // 아래쪽
      ];
      
      // 원래 위치에서 가장 가까운 옵션 선택
      let bestOption = moveOptions[0];
      let minDistance = Math.sqrt(Math.pow(bestOption.x - draggedComp.x, 2) + Math.pow(bestOption.y - draggedComp.y, 2));
      
      for (const option of moveOptions) {
        const distance = Math.sqrt(Math.pow(option.x - draggedComp.x, 2) + Math.pow(option.y - draggedComp.y, 2));
        if (distance < minDistance && option.x >= 0 && option.y >= 0) {
          minDistance = distance;
          bestOption = option;
        }
      }
      
      resolvedX = Math.max(0, bestOption.x);
      resolvedY = Math.max(0, bestOption.y);
    }
  }
  
  return { x: resolvedX, y: resolvedY };
}

// 스냅 위치 계산 함수 (실제 스냅 기능 - 중앙선, 정렬, 그리드 스냅)
export function calculateSnapPosition(draggedComp, otherComponents, gridSize = 50, viewport = 'desktop', getComponentDimensionsFn = getComponentDimensions) {
  const SNAP_THRESHOLD = 12;
  let snappedX = draggedComp.x;
  let snappedY = draggedComp.y;
  let snapped = false;

  const draggedDimensions = getComponentDimensionsFn(draggedComp.type);
  const draggedWidth = draggedComp.width || draggedDimensions.defaultWidth;
  const draggedHeight = draggedComp.height || draggedDimensions.defaultHeight;

  // 드래그된 컴포넌트의 주요 위치들
  const draggedLeft = draggedComp.x;
  const draggedRight = draggedComp.x + draggedWidth;
  const draggedTop = draggedComp.y;
  const draggedBottom = draggedComp.y + draggedHeight;
  const draggedCenterX = draggedComp.x + draggedWidth / 2;
  const draggedCenterY = draggedComp.y + draggedHeight / 2;

  // 캔버스 크기 (뷰포트에 따라)
  const canvasWidth = viewport === 'mobile' ? 375 : 1920;
  const canvasHeight = viewport === 'mobile' ? 667 : 1080;
  const canvasCenterX = canvasWidth / 2;
  const canvasCenterY = canvasHeight / 2;

  // 1. 중앙선 스냅 (최우선)
  if (Math.abs(draggedCenterX - canvasCenterX) < SNAP_THRESHOLD) {
    snappedX = canvasCenterX - draggedWidth / 2;
    snapped = true;
  }
  if (Math.abs(draggedCenterY - canvasCenterY) < SNAP_THRESHOLD) {
    snappedY = canvasCenterY - draggedHeight / 2;
    snapped = true;
  }

  // 2. 다른 컴포넌트들과의 정렬 스냅 체크
  if (!snapped) {
    for (const other of otherComponents) {
      const otherDimensions = getComponentDimensionsFn(other.type);
      const otherWidth = other.width || otherDimensions.defaultWidth;
      const otherHeight = other.height || otherDimensions.defaultHeight;

      const otherLeft = other.x;
      const otherRight = other.x + otherWidth;
      const otherTop = other.y;
      const otherBottom = other.y + otherHeight;
      const otherCenterX = other.x + otherWidth / 2;
      const otherCenterY = other.y + otherHeight / 2;

      // X축 정렬 스냅 체크
      if (Math.abs(draggedLeft - otherLeft) < SNAP_THRESHOLD) {
        snappedX = otherLeft;
        snapped = true;
      } else if (Math.abs(draggedRight - otherRight) < SNAP_THRESHOLD) {
        snappedX = otherRight - draggedWidth;
        snapped = true;
      } else if (Math.abs(draggedCenterX - otherCenterX) < SNAP_THRESHOLD) {
        snappedX = otherCenterX - draggedWidth / 2;
        snapped = true;
      } else if (Math.abs(draggedLeft - otherRight) < SNAP_THRESHOLD) {
        snappedX = otherRight;
        snapped = true;
      } else if (Math.abs(draggedRight - otherLeft) < SNAP_THRESHOLD) {
        snappedX = otherLeft - draggedWidth;
        snapped = true;
      }

      // Y축 정렬 스냅 체크
      if (Math.abs(draggedTop - otherTop) < SNAP_THRESHOLD) {
        snappedY = otherTop;
        snapped = true;
      } else if (Math.abs(draggedBottom - otherBottom) < SNAP_THRESHOLD) {
        snappedY = otherBottom - draggedHeight;
        snapped = true;
      } else if (Math.abs(draggedCenterY - otherCenterY) < SNAP_THRESHOLD) {
        snappedY = otherCenterY - draggedHeight / 2;
        snapped = true;
      } else if (Math.abs(draggedTop - otherBottom) < SNAP_THRESHOLD) {
        snappedY = otherBottom;
        snapped = true;
      } else if (Math.abs(draggedBottom - otherTop) < SNAP_THRESHOLD) {
        snappedY = otherTop - draggedHeight;
        snapped = true;
      }
    }
  }

  // 3. 그리드 스냅 (우선순위가 낮음)
  if (!snapped) {
    const gridX = Math.round(draggedComp.x / gridSize) * gridSize;
    const gridY = Math.round(draggedComp.y / gridSize) * gridSize;
    
    if (Math.abs(draggedComp.x - gridX) < SNAP_THRESHOLD / 2) {
      snappedX = gridX;
      snapped = true;
    }
    if (Math.abs(draggedComp.y - gridY) < SNAP_THRESHOLD / 2) {
      snappedY = gridY;
      snapped = true;
    }
  }

  return {
    x: snappedX,
    y: snappedY,
    snapped
  };
}

// 스냅라인 계산 함수 (정렬, 간격, 그리드, 중앙선 스냅 모두 지원)
export function calculateSnapLines(draggedComp, allComponents, zoom = 100, viewport = 'desktop', getComponentDimensionsFn = getComponentDimensions) {
  const SNAP_THRESHOLD = 8;
  // 고정된 그리드 크기 사용 (줌 레벨에 관계없이 일관된 그리드)
  const effectiveGridSize = GRID_SIZE; // 고정된 그리드 크기
  const snapLines = { vertical: [], horizontal: [] };
  if (!draggedComp) return snapLines;

  // 캔버스 크기 (뷰포트에 따라)
  const canvasWidth = viewport === 'mobile' ? 375 : 1920;
  const canvasHeight = viewport === 'mobile' ? 667 : 1080;

  // 1. 중앙선 스냅 (Canvas Center)
  const draggedDimensions = getComponentDimensionsFn(draggedComp.type);
  const draggedWidth = draggedComp.width || draggedDimensions.defaultWidth;
  const draggedHeight = draggedComp.height || draggedDimensions.defaultHeight;
  
  const canvasCenterX = canvasWidth / 2;
  const canvasCenterY = canvasHeight / 2;
  const compCenterX = draggedComp.x + draggedWidth / 2;
  const compCenterY = draggedComp.y + draggedHeight / 2;
  
  // 수직 중앙선 (캔버스 중앙)
  if (Math.abs(compCenterX - canvasCenterX) < SNAP_THRESHOLD) {
    snapLines.vertical.push({ x: canvasCenterX, type: 'center' });
  }
  
  // 수평 중앙선 (캔버스 중앙)
  if (Math.abs(compCenterY - canvasCenterY) < SNAP_THRESHOLD) {
    snapLines.horizontal.push({ y: canvasCenterY, type: 'center' });
  }

  // 2. 정렬 스냅 (Alignment)
  allComponents.forEach(other => {
    if (other.id === draggedComp.id) return;
    const otherDimensions = getComponentDimensionsFn(other.type);
    const otherX = [other.x, other.x + (other.width || otherDimensions.defaultWidth) / 2, other.x + (other.width || otherDimensions.defaultWidth)];
    const dragX = [draggedComp.x, draggedComp.x + (draggedComp.width || draggedDimensions.defaultWidth) / 2, draggedComp.x + (draggedComp.width || draggedDimensions.defaultWidth)];
    otherX.forEach(ox => {
      dragX.forEach(dx => {
        if (Math.abs(ox - dx) < SNAP_THRESHOLD) {
          snapLines.vertical.push({ x: ox, type: 'align' });
        }
      });
    });
    const otherY = [other.y, other.y + (other.height || otherDimensions.defaultHeight) / 2, other.y + (other.height || otherDimensions.defaultHeight)];
    const dragY = [draggedComp.y, draggedComp.y + (draggedComp.height || draggedDimensions.defaultHeight) / 2, draggedComp.y + (draggedComp.height || draggedDimensions.defaultHeight)];
    otherY.forEach(oy => {
      dragY.forEach(dy => {
        if (Math.abs(oy - dy) < SNAP_THRESHOLD) {
          snapLines.horizontal.push({ y: oy, type: 'align' });
        }
      });
    });
  });

  // 3. 간격 스냅 (Spacing)
  allComponents.forEach(a => {
    allComponents.forEach(b => {
      if (a.id === b.id || a.id === draggedComp.id || b.id === draggedComp.id) return;
      const spacingX = Math.abs(a.x - b.x);
      const spacingY = Math.abs(a.y - b.y);
      if (Math.abs(Math.abs(draggedComp.x - a.x) - spacingX) < SNAP_THRESHOLD && spacingX > 0) {
        snapLines.vertical.push({ x: draggedComp.x, type: 'spacing', spacing: spacingX });
      }
      if (Math.abs(Math.abs(draggedComp.y - a.y) - spacingY) < SNAP_THRESHOLD && spacingY > 0) {
        snapLines.horizontal.push({ y: draggedComp.y, type: 'spacing', spacing: spacingY });
      }
    });
  });

  // 4. 그리드 스냅 (Grid) - 줌 레벨 고려
  const gridX = Math.round(draggedComp.x / effectiveGridSize) * effectiveGridSize;
  const gridY = Math.round(draggedComp.y / effectiveGridSize) * effectiveGridSize;
  if (Math.abs(draggedComp.x - gridX) < SNAP_THRESHOLD) {
    snapLines.vertical.push({ x: gridX, type: 'grid' });
  }
  if (Math.abs(draggedComp.y - gridY) < SNAP_THRESHOLD) {
    snapLines.horizontal.push({ y: gridY, type: 'grid' });
  }

  return snapLines;
} 