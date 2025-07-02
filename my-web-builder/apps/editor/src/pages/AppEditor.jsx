import { useParams } from 'react-router-dom';

function AppEditor() {
  const { pageId } = useParams();

  return (
    <div>
      <h2>No-code Editor</h2>
      <div>Page ID: {pageId}</div>
      {/* 여기에는 "Create New Page" 버튼이 없어야 함 */}
      {/* 에디터 UI만 구현 */}
    </div>
  );
}

export default AppEditor;
