import { useEffect, useMemo, useState } from 'react';
import { Armchair, CheckCircle2, X } from 'lucide-react';
import BookingTableCard from './BookingTableCard';
import { cn } from '../ui/utils';

function getTableId(table) {
  return table?.id || table?._id || table?.tableNumber;
}

export default function TableSelectionModal({
  isOpen,
  onClose,
  tables = [],
  suggestedTables = [],
  selectedTables = [],
  onConfirm,
  numberOfGuests,
}) {
  const [selected, setSelected] = useState([]);
  const [zoneFilter, setZoneFilter] = useState('all');

  useEffect(() => {
    if (isOpen) {
      setSelected(selectedTables);
    }
  }, [isOpen, selectedTables]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const zones = useMemo(() => {
    const uniqueZones = new Set(tables.map((table) => table.zone).filter(Boolean));
    return ['all', ...uniqueZones];
  }, [tables]);

  const filteredTables = useMemo(() => {
    if (zoneFilter === 'all') return tables;
    return tables.filter((table) => table.zone === zoneFilter);
  }, [tables, zoneFilter]);

  if (!isOpen) return null;

  const totalCapacity = selected.reduce((sum, table) => sum + Number(table.capacity || 0), 0);
  const capacityMet = totalCapacity >= numberOfGuests;

  const handleTableSelect = (table) => {
    const tableId = getTableId(table);
    setSelected((current) => {
      if (current.some((item) => getTableId(item) === tableId)) {
        return current.filter((item) => getTableId(item) !== tableId);
      }
      return [...current, table];
    });
  };

  const handleConfirm = () => {
    onConfirm?.(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <button type="button" aria-label="Đóng chọn bàn" className="absolute inset-0 z-0" onClick={onClose} />

      <div
        className="relative z-10 flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="table-selection-title"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Armchair size={21} />
            </div>
            <div>
              <h3 id="table-selection-title" className="font-serif text-xl font-bold text-white">
                Chọn vị trí bàn ăn
              </h3>
              <p className="text-xs text-muted-foreground">Chọn một hoặc nhiều bàn đủ sức chứa nhóm của bạn.</p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-white"
            onClick={onClose}
            aria-label="Đóng cửa sổ chọn bàn"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-3 border-b border-border bg-secondary/25 px-5 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="text-muted-foreground">
            Số khách: <strong className="font-bold text-white">{numberOfGuests} người</strong>
          </div>
          <div
            className={cn(
              'inline-flex items-center gap-2 rounded-md border px-3 py-1 text-xs font-semibold',
              capacityMet
                ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
                : 'border-amber-500/25 bg-amber-500/10 text-amber-400'
            )}
          >
            <CheckCircle2 size={14} />
            Đã chọn {totalCapacity} chỗ
            {!capacityMet && selected.length > 0 && `, cần thêm ${numberOfGuests - totalCapacity} chỗ`}
          </div>
        </div>

        <div className="flex items-center gap-3 border-b border-border/60 bg-secondary/10 px-5 py-3 sm:px-6">
          <label htmlFor="modal-zone-filter" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Khu vực
          </label>
          <select
            id="modal-zone-filter"
            value={zoneFilter}
            onChange={(event) => setZoneFilter(event.target.value)}
            className="rounded-md border border-border bg-card px-3 py-2 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          >
            {zones.map((zone) => (
              <option key={zone} value={zone} className="bg-card">
                {zone === 'all' ? 'Tất cả khu vực' : zone}
              </option>
            ))}
          </select>
        </div>

        <div className="min-h-[240px] flex-1 overflow-y-auto p-5 sm:p-6">
          {filteredTables.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/15 px-6 text-center">
              <Armchair size={38} className="mb-3 text-muted-foreground/70" />
              <p className="text-sm font-semibold text-white">Không có bàn trống trong khu vực này</p>
              <p className="mt-1 text-sm text-muted-foreground">Bạn có thể đổi khu vực hoặc để nhà hàng tự xếp bàn.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {filteredTables.map((table) => {
                const tableId = getTableId(table);
                const isSelected = selected.some((item) => getTableId(item) === tableId);
                const isSuggested = suggestedTables.some((item) => item.tableNumber === table.tableNumber);

                return (
                  <BookingTableCard
                    key={tableId}
                    table={table}
                    isSelected={isSelected}
                    isSuggested={isSuggested}
                    onSelect={handleTableSelect}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-border bg-secondary/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <button
            type="button"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-secondary hover:text-white"
            onClick={onClose}
          >
            Để nhà hàng tự xếp bàn
          </button>
          <button
            type="button"
            className={cn(
              'rounded-lg px-5 py-2.5 text-sm font-bold transition',
              selected.length > 0 && !capacityMet
                ? 'cursor-not-allowed bg-muted text-muted-foreground'
                : 'bg-primary text-background hover:bg-primary/95'
            )}
            onClick={handleConfirm}
            disabled={selected.length > 0 && !capacityMet}
          >
            Xác nhận chọn {selected.length} bàn
          </button>
        </div>
      </div>
    </div>
  );
}
