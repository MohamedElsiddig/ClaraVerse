import React from 'react';
import { Plus, Trash2, Move } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAddWidget?: () => void;
  onRemoveWidget?: () => void;
  onRearrangeWidgets?: () => void;
  showRemove?: boolean;
}

const WidgetContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  onAddWidget,
  onRemoveWidget,
  onRearrangeWidgets,
  showRemove = false,
}) => {
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.context-menu')) {
        onClose();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  return (
    <div
      className="context-menu fixed bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      {onAddWidget && (
        <button
          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          onClick={(e) => {
            e.stopPropagation();
            onAddWidget();
            onClose();
          }}
        >
          <Plus className="w-4 h-4" />
          Add Widget
        </button>
      )}
      {onRearrangeWidgets && (
        <button
          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          onClick={(e) => {
            e.stopPropagation();
            onRearrangeWidgets();
            onClose();
          }}
        >
          <Move className="w-4 h-4" />
          Rearrange Widgets
        </button>
      )}
      {showRemove && onRemoveWidget && (
        <button
          className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          onClick={(e) => {
            e.stopPropagation();
            onRemoveWidget();
            onClose();
          }}
        >
          <Trash2 className="w-4 h-4" />
          Remove Widget
        </button>
      )}
    </div>
  );
};

export default WidgetContextMenu; 