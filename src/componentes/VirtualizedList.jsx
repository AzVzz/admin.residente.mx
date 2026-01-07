import { FixedSizeList as List } from 'react-window';
import { memo, useCallback, useRef, useEffect, useState } from 'react';

/**
 * Lista virtualizada para items de altura fija
 * Solo renderiza los elementos visibles en el viewport
 * 
 * @param {Array} items - Lista de items
 * @param {Function} renderItem - (item, index) => ReactNode
 * @param {number} itemHeight - Altura de cada item
 * @param {number} maxHeight - Altura máxima del contenedor (default: 600)
 * @param {string} className - Clases CSS adicionales
 */
const VirtualizedList = memo(({
    items,
    renderItem,
    itemHeight = 120,
    maxHeight = 600,
    className = ''
}) => {
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(0);

    // Medir el ancho del contenedor
    useEffect(() => {
        if (containerRef.current) {
            const resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    setContainerWidth(entry.contentRect.width);
                }
            });
            resizeObserver.observe(containerRef.current);
            return () => resizeObserver.disconnect();
        }
    }, []);

    // Renderizador de fila
    const Row = useCallback(({ index, style }) => {
        const item = items[index];
        return (
            <div style={style} className="px-1">
                {renderItem(item, index)}
            </div>
        );
    }, [items, renderItem]);

    // Para listas pequeñas, no usar virtualización
    if (items.length <= 20) {
        return (
            <div className={className}>
                {items.map((item, index) => (
                    <div key={index} className="mb-4">
                        {renderItem(item, index)}
                    </div>
                ))}
            </div>
        );
    }

    const listHeight = Math.min(items.length * itemHeight, maxHeight);

    return (
        <div ref={containerRef} className={className}>
            {containerWidth > 0 && (
                <List
                    height={listHeight}
                    itemCount={items.length}
                    itemSize={itemHeight}
                    width={containerWidth}
                    overscanCount={5}
                >
                    {Row}
                </List>
            )}
            <div className="text-center text-sm text-gray-500 mt-2 py-2 border-t">
                {items.length} items total
                {items.length > 20 && " • Scroll optimizado activo"}
            </div>
        </div>
    );
});

VirtualizedList.displayName = 'VirtualizedList';

export default VirtualizedList;
