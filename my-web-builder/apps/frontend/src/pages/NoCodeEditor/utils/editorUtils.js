import { API_BASE_URL } from '../../../config';

// 컴포넌트 타입별 기본 크기와 최소 크기 정의
export function getComponentDimensions(type) {
  const dimensions = {
    button: { defaultWidth: 150, defaultHeight: 50, minWidth: 100, minHeight: 50 },
    text: { defaultWidth: 200, defaultHeight: 50, minWidth: 100, minHeight: 50 },
    image: { defaultWidth: 200, defaultHeight: 150, minWidth: 100, minHeight: 100 },
    map: { defaultWidth: 375, defaultHeight: 250, minWidth: 200, minHeight: 150 },
    link: { defaultWidth: 150, defaultHeight: 50, minWidth: 100, minHeight: 50 },
    attend: { defaultWidth: 375, defaultHeight: 300, minWidth: 250, minHeight: 150 },
    dday: { defaultWidth: 375, defaultHeight: 200, minWidth: 150, minHeight: 100 },
    weddingContact: { defaultWidth: 375, defaultHeight: 250, minWidth: 250, minHeight: 200 },
    weddingInvite: { defaultWidth: 375, defaultHeight: 400, minWidth: 300, minHeight: 250 },
    gridGallery: { defaultWidth: 375, defaultHeight: 250, minWidth: 200, minHeight: 200 },
    slideGallery: { defaultWidth: 375, defaultHeight: 400, minWidth: 200, minHeight:200 },
    mapInfo: { defaultWidth: 375, defaultHeight: 500, minWidth: 200, minHeight: 120 },
    calendar: { defaultWidth: 375, defaultHeight: 500, minWidth: 300, minHeight: 350 },
    bankAccount: { defaultWidth: 375, defaultHeight: 200, minWidth: 250, minHeight: 150 },
    comment: { defaultWidth: 375, defaultHeight: 650, minWidth: 250, minHeight: 150 },
    musicPlayer: { defaultWidth: 50, defaultHeight: 50, minWidth: 50, minHeight: 50 },
    kakaotalkShare: { defaultWidth: 150, defaultHeight: 50, minWidth: 50, minHeight: 50 },
    slido: { defaultWidth: 375, defaultHeight: 450, minWidth: 300, minHeight: 200 },
    linkcopy: { defaultWidth: 50, defaultHeight: 50, minWidth: 32, minHeight: 32 },
  };
  return dimensions[type] || { defaultWidth: 150, defaultHeight: 50, minWidth: 100, minHeight: 50 };
}

// 컴포넌트를 행으로 그룹핑 (수직 겹침 기준, x 좌표로 정렬)
export function groupComponentsIntoRows(components) {
  if (!components || components.length === 0) return [];

  const sortedComponents = [...components].sort((a, b) => (a.y || 0) - (b.y || 0));
  const rows = [];
  
  for (const component of sortedComponents) {
    const compTop = component.y || 0;
    const compBottom = compTop + (component.height || 50);
    
    let targetRow = null;
    
    for (const row of rows) {
      const hasOverlap = row.some(existingComp => {
        const existingTop = existingComp.y || 0;
        const existingBottom = existingTop + (existingComp.height || 50);
        return Math.max(compTop, existingTop) < Math.min(compBottom, existingBottom);
      });
      
      if (hasOverlap) {
        targetRow = row;
        break;
      }
    }
    
    if (targetRow) {
      targetRow.push(component);
    } else {
      rows.push([component]);
    }
  }
  
  // 각 행의 컴포넌트들을 X좌표 기준으로 정렬
  return rows.map(row => 
    [...row].sort((a, b) => (a.x || 0) - (b.x || 0))
  );
}

// Page 컴포넌트를 위한 새 페이지 생성
export async function createPageForComponent(pageName = '새 페이지') {
  try {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/users/pages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: pageName,
        subdomain: `page-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      }),
    });

    return response.ok ? await response.json() : null;
  } catch (err) {
    console.error('새 페이지 생성 오류:', err);
    return null;
  }
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

// 뷰포트 설정
export const VIEWPORT_CONFIGS = {
  mobile: { width: '375px', height: '667px', scale: 1 },
  desktop: { width: '100%', height: '100%', scale: 1 },
};

// 그리드 크기
export const GRID_SIZE = 50;

// clamp 함수
export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// 충돌 감지
export function checkCollision(comp1, comp2, getComponentDimensionsFn = getComponentDimensions) {
  const comp1Dimensions = getComponentDimensionsFn(comp1.type);
  const comp2Dimensions = getComponentDimensionsFn(comp2.type);
  const comp1Width = comp1.width || comp1Dimensions.defaultWidth;
  const comp1Height = comp1.height || comp1Dimensions.defaultHeight;
  const comp2Width = comp2.width || comp2Dimensions.defaultWidth;
  const comp2Height = comp2.height || comp2Dimensions.defaultHeight;
  return !(
    comp1.x + comp1Width <= comp2.x ||
    comp2.x + comp2Width <= comp1.x ||
    comp1.y + comp1Height <= comp2.y ||
    comp2.y + comp2Height <= comp1.y
  );
}

// 충돌 방지
export function resolveCollision(draggedComp, otherComponents, getComponentDimensionsFn = getComponentDimensions) {
  const COLLISION_MARGIN = 10;
  let resolvedX = draggedComp.x;
  let resolvedY = draggedComp.y;
  const draggedDimensions = getComponentDimensionsFn(draggedComp.type);
  const draggedWidth = draggedComp.width || draggedDimensions.defaultWidth;
  const draggedHeight = draggedComp.height || draggedDimensions.defaultHeight;
  
  for (const other of otherComponents) {
    if (other.id === draggedComp.id) continue;
    const tempComp = { ...draggedComp, x: resolvedX, y: resolvedY };
    if (checkCollision(tempComp, other, getComponentDimensionsFn)) {
      const otherDimensions = getComponentDimensionsFn(other.type);
      const otherWidth = other.width || otherDimensions.defaultWidth;
      const otherHeight = other.height || otherDimensions.defaultHeight;
      const moveOptions = [
        { x: other.x - draggedWidth - COLLISION_MARGIN, y: resolvedY },
        { x: other.x + otherWidth + COLLISION_MARGIN, y: resolvedY },
        { x: resolvedX, y: other.y - draggedHeight - COLLISION_MARGIN },
        { x: resolvedX, y: other.y + otherHeight + COLLISION_MARGIN },
      ];
      let bestOption = moveOptions[0];
      let minDistance = Math.sqrt(
        Math.pow(bestOption.x - draggedComp.x, 2) +
        Math.pow(bestOption.y - draggedComp.y, 2)
      );

      for (const option of moveOptions) {
        const distance = Math.sqrt(
          Math.pow(option.x - draggedComp.x, 2) +
          Math.pow(option.y - draggedComp.y, 2)
        );
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

// 스냅 위치 계산
export function calculateSnapPosition(draggedComp, otherComponents, gridSize = 50, viewport = 'desktop', getComponentDimensionsFn = getComponentDimensions) {
  const SNAP_THRESHOLD = 12;
  let snappedX = draggedComp.x;
  let snappedY = draggedComp.y;
  let snapped = false;
  const draggedDimensions = getComponentDimensionsFn(draggedComp.type);
  const draggedWidth = draggedComp.width || draggedDimensions.defaultWidth;
  const draggedHeight = draggedComp.height || draggedDimensions.defaultHeight;
  const canvasWidth = viewport === 'mobile' ? 375 : 1920;
  const canvasHeight = viewport === 'mobile' ? 667 : 1080;
  const canvasCenterX = canvasWidth / 2;
  const canvasCenterY = canvasHeight / 2;
  const draggedCenterX = draggedComp.x + draggedWidth / 2;
  const draggedCenterY = draggedComp.y + draggedHeight / 2;
  
  if (Math.abs(draggedCenterX - canvasCenterX) < SNAP_THRESHOLD) {
    snappedX = canvasCenterX - draggedWidth / 2;
    snapped = true;
  }
  if (Math.abs(draggedCenterY - canvasCenterY) < SNAP_THRESHOLD) {
    snappedY = canvasCenterY - draggedHeight / 2;
    snapped = true;
  }
  
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
    snapped,
  };
}

// 편집 모드용 캔버스 크기 설정
export const CANVAS_SIZES = {
  desktop: {
    width: 1920,
    height: 1080,
  },
  mobile: {
    width: 375,
    height: 667,
  },
};

// 편집 모드에서만 사용하는 컴포넌트 스타일 계산 함수
export function getEditorStyles(component, editingViewport = 'desktop') {
  if (!component) {
    console.warn('getEditorStyles: component가 전달되지 않았습니다.');
    return {
      x: 0,
      y: 0,
      width: undefined,
      height: undefined,
      props: {},
    };
  }

  const x = component.x || 0;
  const y = component.y || 0;
  const width = component.width;
  const height = component.height;

  // 모바일 편집 모드에서 캔버스를 벗어난 경우만 x 좌표 조정
  const adjustedX =
    editingViewport === 'mobile'
      ? Math.min(Math.max(0, x), CANVAS_SIZES.mobile.width - (width || 100))
      : x;

  return {
    x: adjustedX,
    y,
    width,
    height,
    props: component.props || {},
  };
}

// 편집 모드에서 모바일 뷰로 전환할 때만 사용하는 함수
export function adjustComponentsForMobile(components) {
  if (!components || components.length === 0) return [];

  const adjustments = [];
  const canvasWidth = CANVAS_SIZES.mobile.width;

  // y 위치 순으로 정렬
  const sortedComponents = [...components].sort((a, b) => {
    const aStyles = getEditorStyles(a, 'mobile');
    const bStyles = getEditorStyles(b, 'mobile');
    return aStyles.y - bStyles.y;
  });

  for (const comp of sortedComponents) {
    const currentStyles = getEditorStyles(comp, 'mobile');

    // 캔버스를 벗어난 경우만 조정
    if (currentStyles.x + (currentStyles.width || 100) > canvasWidth) {
      adjustments.push({
        component: comp,
        originalPosition: currentStyles,
        newPosition: {
          ...currentStyles,
          x: Math.max(0, canvasWidth - (currentStyles.width || 100)),
        },
      });
    }
  }

  return adjustments;
}


// 컴포넌트를 responsive 구조로 마이그레이션
export function migrateToResponsive(component) {
  if (component.responsive) {
    console.log(
      `✅ ${component.id} 이미 responsive 구조:`,
      component.responsive
    );
    return component; // 이미 responsive 구조
  }

  const originalPosition = {
    x: component.x || 0,
    y: component.y || 0,
    width: component.width,
    height: component.height,
    props: component.props || {},
  };

  return result;
}

// 구 반응형 시스템의 모바일 자동 정렬 함수 (더 이상 사용하지 않음)
export function arrangeMobileComponents(components, forcedViewport = null) {
  if (!components) return [];

  return components.map((component) => ({
    ...component,
    style: getFinalStyles(component, forcedViewport),
  }));
}

// 캔버스 크기를 가져오는 함수
export function getCanvasSize(viewport = 'desktop') {
  switch (viewport) {
    case 'mobile':
      return { width: 375, height: 667 };
    case 'tablet':
      return { width: 768, height: 1024 };
    case 'desktop':
    default:
      return { width: 1920, height: 1080 };
  }
}

// 컴포넌트들을 세로로 정렬하는 함수
export function arrangeComponentsVertically(
  components,
  viewport = 'desktop',
  getComponentDimensionsFn = getComponentDimensions
) {
  if (!components || components.length === 0) {
    return [];
  }

  const PADDING = 20;
  const COMPONENT_SPACING = 20;

  // 뷰포트에 따른 캔버스 크기
  const canvasWidth =
    viewport === 'mobile' ? 375 : viewport === 'tablet' ? 768 : 1920;
  const canvasHeight =
    viewport === 'mobile' ? 667 : viewport === 'tablet' ? 1024 : 1080;

  // 컴포넌트들을 y 위치순으로 정렬
  const sortedComponents = [...components].sort((a, b) => {
    const aStyles = getFinalStyles(a, viewport);
    const bStyles = getFinalStyles(b, viewport);
    return aStyles.y - bStyles.y;
  });

  const arrangementUpdates = [];
  let currentY = PADDING;

  for (const comp of sortedComponents) {
    const currentStyles = getFinalStyles(comp, viewport);
    const compDimensions = getComponentDimensionsFn(comp.type);
    const compWidth = currentStyles.width || compDimensions.defaultWidth;
    const compHeight = currentStyles.height || compDimensions.defaultHeight;

    // 컴포넌트가 캔버스 너비를 초과하지 않도록 조정
    let adjustedX = currentStyles.x;
    if (adjustedX + compWidth > canvasWidth - PADDING) {
      adjustedX = canvasWidth - compWidth - PADDING;
    }
    if (adjustedX < PADDING) {
      adjustedX = PADDING;
    }

    // 새로운 위치 설정
    const newPosition = {
      x: adjustedX,
      y: currentY,
      width: compWidth,
      height: compHeight,
    };

    arrangementUpdates.push({
      component: comp,
      originalPosition: currentStyles,
      newPosition: newPosition,
    });

    // 다음 컴포넌트의 y 위치 계산
    currentY += compHeight + COMPONENT_SPACING;
  }

  return arrangementUpdates;
}


// 스냅라인 계산
export function calculateSnapLines(
  draggedComp,
  allComponents,
  gridSize = 50,
  viewport = 'desktop',
  getComponentDimensionsFn = getComponentDimensions
) {
  const effectiveGridSize = gridSize || GRID_SIZE; // ReferenceError 방지
  const SNAP_THRESHOLD = 8;
  const snapLines = { vertical: [], horizontal: [] };
  if (!draggedComp) return snapLines;
  
  const canvasWidth = viewport === 'mobile' ? 375 : 1920;
  const canvasHeight = viewport === 'mobile' ? 667 : 1080;
  const draggedDimensions = getComponentDimensionsFn(draggedComp.type);
  const draggedWidth = draggedComp.width || draggedDimensions.defaultWidth;
  const draggedHeight = draggedComp.height || draggedDimensions.defaultHeight;
  const canvasCenterX = canvasWidth / 2;
  const canvasCenterY = canvasHeight / 2;
  const compCenterX = draggedComp.x + draggedWidth / 2;
  const compCenterY = draggedComp.y + draggedHeight / 2;
  
  if (Math.abs(compCenterX - canvasCenterX) < SNAP_THRESHOLD) {
    snapLines.vertical.push({ x: canvasCenterX, type: 'center' });
  }
  if (Math.abs(compCenterY - canvasCenterY) < SNAP_THRESHOLD) {
    snapLines.horizontal.push({ y: canvasCenterY, type: 'center' });
  }

  // 2. 정렬 스냅 (Alignment)
  allComponents.forEach((other) => {
    if (other.id === draggedComp.id) return;
    const otherDimensions = getComponentDimensionsFn(other.type);
    const otherX = [
      other.x,
      other.x + (other.width || otherDimensions.defaultWidth) / 2,
      other.x + (other.width || otherDimensions.defaultWidth),
    ];
    const dragX = [
      draggedComp.x,
      draggedComp.x + (draggedComp.width || draggedDimensions.defaultWidth) / 2,
      draggedComp.x + (draggedComp.width || draggedDimensions.defaultWidth),
    ];
    otherX.forEach((ox) => {
      dragX.forEach((dx) => {
        if (Math.abs(ox - dx) < SNAP_THRESHOLD) {
          snapLines.vertical.push({ x: ox, type: 'align' });
        }
      });
    });
    const otherY = [
      other.y,
      other.y + (other.height || otherDimensions.defaultHeight) / 2,
      other.y + (other.height || otherDimensions.defaultHeight),
    ];
    const dragY = [
      draggedComp.y,
      draggedComp.y +
      (draggedComp.height || draggedDimensions.defaultHeight) / 2,
      draggedComp.y + (draggedComp.height || draggedDimensions.defaultHeight),
    ];
    otherY.forEach((oy) => {
      dragY.forEach((dy) => {
        if (Math.abs(oy - dy) < SNAP_THRESHOLD) {
          snapLines.horizontal.push({ y: oy, type: 'align' });
        }
      });
    });
  });

  // 3. 간격 스냅 (Spacing)
  allComponents.forEach((a) => {
    allComponents.forEach((b) => {
      if (a.id === b.id || a.id === draggedComp.id || b.id === draggedComp.id)
        return;
      const spacingX = Math.abs(a.x - b.x);
      const spacingY = Math.abs(a.y - b.y);
      if (
        Math.abs(Math.abs(draggedComp.x - a.x) - spacingX) < SNAP_THRESHOLD &&
        spacingX > 0
      ) {
        snapLines.vertical.push({
          x: draggedComp.x,
          type: 'spacing',
          spacing: spacingX,
        });
      }
      if (
        Math.abs(Math.abs(draggedComp.y - a.y) - spacingY) < SNAP_THRESHOLD &&
        spacingY > 0
      ) {
        snapLines.horizontal.push({
          y: draggedComp.y,
          type: 'spacing',
          spacing: spacingY,
        });
      }
    });
  });

  // 4. 그리드 스냅 (Grid) - 줌 레벨 고려
  const gridX =
    Math.round(draggedComp.x / effectiveGridSize) * effectiveGridSize;
  const gridY =
    Math.round(draggedComp.y / effectiveGridSize) * effectiveGridSize;
  if (Math.abs(draggedComp.x - gridX) < SNAP_THRESHOLD) {
    snapLines.vertical.push({ x: gridX, type: 'grid' });
  }
  if (Math.abs(draggedComp.y - gridY) < SNAP_THRESHOLD) {
    snapLines.horizontal.push({ y: gridY, type: 'grid' });
  }
  
  return snapLines;
}

// 최종 스타일 반환
export function getFinalStyles(component, forcedViewport = null) {
  const { style = {}, mobileStyle = {} } = component;
  if (forcedViewport) {
    return forcedViewport === 'mobile' ? { ...style, ...mobileStyle } : style;
  }
  const isMobileView = window.innerWidth <= 768;
  return isMobileView ? { ...style, ...mobileStyle } : style;
}