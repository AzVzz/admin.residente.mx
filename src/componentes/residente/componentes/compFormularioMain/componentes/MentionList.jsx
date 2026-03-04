import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

const MentionList = forwardRef(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => setSelectedIndex(0), [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((prev) => (prev + 1) % items.length);
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  const selectItem = (index) => {
    const item = items[index];
    if (item) {
      command({ id: item.slug, label: item.nombre_restaurante, restauranteId: item.id });
    }
  };

  if (!items.length) {
    return (
      <div className="mention-dropdown" style={{ padding: '8px 12px', color: '#9ca3af', fontSize: '13px' }}>
        No se encontraron restaurantes
      </div>
    );
  }

  return (
    <div className="mention-dropdown">
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          onClick={() => selectItem(index)}
          className={`mention-dropdown-item ${index === selectedIndex ? 'is-selected' : ''}`}
        >
          {item.nombre_restaurante}
        </button>
      ))}
    </div>
  );
});

MentionList.displayName = 'MentionList';

export default MentionList;
