import styles from './Table.module.css';
import { TableProps } from '../../../types';

function Table<T>({ 
    columns, 
    data, 
    emptyMessage = 'No data found.',
    searchTerm = '',
    className = '',
    onRowClick,
    getRowKey,
    highlightRowId
}: TableProps<T>) {
    const handleRowClick = (item: T) => {
        if (onRowClick) {
            onRowClick(item);
        }
    };

  return (
    <div className={`${styles.tableResponsive} ${className}`}>
        <table className={styles.table}>
            <thead>
            <tr>
                {
                    columns.map((column) => (
                        <th key={column.key} className={column.className}>
                            {column.header}
                        </th>
                    ))
                }
            </tr>
            </thead>
            <tbody>
            {
                data.length === 0 ? (
                    <tr>
                        <td colSpan={columns.length} className={styles.emptyState}>
                            {
                                searchTerm 
                                ? `No items found matching "${searchTerm}". Try a different search term.`
                                : emptyMessage
                            }
                        </td>
                    </tr>
                ) : (
                    data.map((item: any) => {
                        const rowKey = getRowKey(item);
                        const isHighlighted = highlightRowId === rowKey;
                        
                        return (
                            <tr 
                                key={rowKey}
                                onClick={() => handleRowClick(item)}
                                className={`
                                    ${onRowClick ? styles.clickableRow : ''} 
                                    ${isHighlighted ? styles.highlightedRow : ''}
                                `.trim()}
                            >
                                {
                                    columns.map((column) => (
                                        <td key={column.key} className={column.className}>
                                            {column.render(item)}
                                        </td>
                                    ))
                                }
                            </tr>
                        );
                    })
                )
            }
            </tbody>
        </table>
    </div>
  )
}

export default Table