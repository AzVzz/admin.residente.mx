import { FixedSizeGrid as Grid } from 'react-window';
import { useCallback, memo } from 'react';

/**
 * Grid virtualizado para listas de notas
 * Solo renderiza los elementos visibles, mejorando el rendimiento con muchos items
 * 
 * @param {Array} items - Lista de items a mostrar
 * @param {Function} renderItem - Función que renderiza cada item
 * @param {number} itemHeight - Altura de cada item en píxeles
 * @param {number} columns - Número de columnas (default: 3)
 * @param {number} gap - Espacio entre items en píxeles (default: 24)
 */
const VirtualizedGrid = memo(({
    items,
    renderItem,
    itemHeight = 280,
    columns = 3,
    gap = 24,
    containerHeight = 600
}) => {
    const itemCount = items.length;
    const rowCount = Math.ceil(itemCount / columns);

    // Calcular ancho de cada celda basado en el contenedor
    const columnWidth = `calc((100% - ${gap * (columns - 1)}px) / ${columns})`;

    // Renderizador de celda
    const Cell = useCallback(({ columnIndex, rowIndex, style }) => {
        const index = rowIndex * columns + columnIndex;

        // Si no hay item en esta posición, retornar vacío
        if (index >= itemCount) {
            return null;
        }

        const item = items[index];

        return (
            <div
                style={{
                    ...style,
                    left: `calc(${columnIndex} * (100% / ${columns}))`,
                    width: columnWidth,
                    paddingRight: columnIndex < columns - 1 ? gap : 0,
                    paddingBottom: gap,
                }}
            >
                {renderItem(item, index)}
            </div>
        );
    }, [items, itemCount, columns, columnWidth, gap, renderItem]);

    // Si hay pocos items, no usar virtualización
    if (itemCount <= 15) {
        return (
            <div
                className="grid gap-6"
                style={{
                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
                }}
            >
                {items.map((item, index) => renderItem(item, index))}
            </div>
        );
    }

    return (
        <div style={{ width: '100%' }}>
            <Grid
                columnCount={columns}
                columnWidth={300} // Ancho aproximado por columna
                height={containerHeight}
                rowCount={rowCount}
                rowHeight={itemHeight}
                width={900} // Ancho total del grid
                itemData={items}
                overscanRowCount={2} // Pre-renderizar 2 filas extra
            >
                {Cell}
            </Grid>
            <div className="text-center text-sm text-gray-500 mt-4">
                Mostrando {Math.min(itemCount, Math.ceil(containerHeight / itemHeight) * columns)} de {itemCount} items
                {itemCount > 15 && " (scroll para ver más)"}
            </div>
        </div>
    );
});

VirtualizedGrid.displayName = 'VirtualizedGrid';

export default VirtualizedGrid;
