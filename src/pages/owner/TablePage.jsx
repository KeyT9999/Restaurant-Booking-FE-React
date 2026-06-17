import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { AlertTriangle, Armchair, Loader2, Pencil, Plus, Trash2, Users } from 'lucide-react';
import OwnerLayout from '../../components/owner/OwnerLayout';
import { useRestaurantContext } from '../../context/useRestaurantContext';
import * as tableApi from '../../api/tableApi';
import TableForm from '../../components/tables/TableForm';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { cn } from '../../components/ui/utils';

const STATUS_OPTIONS = [
  { value: 'available', label: 'Available', color: '#22c55e' },
  { value: 'occupied', label: 'Occupied', color: '#3b82f6' },
  { value: 'reserved', label: 'Reserved', color: '#D49653' },
  { value: 'inactive', label: 'Inactive', color: '#94a3b8' },
  { value: 'maintenance', label: 'Maintenance', color: '#8b5cf6' },
];

const STATUS_STYLES = {
  available: {
    tile: 'border-border bg-secondary/70 text-muted-foreground hover:border-emerald-500/35',
    badge: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400',
  },
  occupied: {
    tile: 'border-blue-500/45 bg-blue-500/15 text-blue-300 hover:border-blue-400/60',
    badge: 'border-blue-500/25 bg-blue-500/10 text-blue-300',
  },
  reserved: {
    tile: 'border-primary/45 bg-primary/15 text-primary hover:border-primary/70',
    badge: 'border-primary/25 bg-primary/10 text-primary',
  },
  inactive: {
    tile: 'border-border bg-secondary/40 text-muted-foreground opacity-70',
    badge: 'border-border bg-secondary text-muted-foreground',
  },
  maintenance: {
    tile: 'border-violet-500/35 bg-violet-500/10 text-violet-300',
    badge: 'border-violet-500/25 bg-violet-500/10 text-violet-300',
  },
};

function getTableId(table) {
  return table?.id || table?._id;
}

function formatMoney(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function getStatusMeta(status) {
  return STATUS_OPTIONS.find((item) => item.value === status) || STATUS_OPTIONS[0];
}

export default function TablePage() {
  const { selectedRestaurantId, isRestaurantReady } = useRestaurantContext();

  const [tables, setTables] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, table: null });

  const fetchData = useCallback(async () => {
    if (!selectedRestaurantId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await tableApi.getTables(selectedRestaurantId);
      const nextTables = res.data?.tables || res.tables || [];
      setTables(nextTables);
      setSelectedTableId((currentId) => {
        if (currentId && nextTables.some((table) => getTableId(table) === currentId)) return currentId;
        return getTableId(nextTables.find((table) => table.status === 'occupied') || nextTables[0]) || null;
      });
    } catch (err) {
      setError(err.message || 'Cannot load table floor plan');
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurantId]);

  useEffect(() => {
    if (isRestaurantReady) fetchData();
    else {
      setTables([]);
      setSelectedTableId(null);
      setLoading(false);
    }
  }, [isRestaurantReady, fetchData]);

  const selectedTable = useMemo(
    () => tables.find((table) => getTableId(table) === selectedTableId) || tables[0] || null,
    [tables, selectedTableId]
  );

  const handleCreateTable = () => {
    setEditingTable(null);
    setShowForm(true);
  };

  const handleEditTable = (table) => {
    setEditingTable(table);
    setShowForm(true);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editingTable) {
        await tableApi.updateTable(getTableId(editingTable), data);
        toast.success('Table updated.');
      } else {
        await tableApi.createTable(selectedRestaurantId, data);
        toast.success('Table created.');
      }
      setShowForm(false);
      setEditingTable(null);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Cannot save table.');
    }
  };

  const handleStatusToggle = async () => {
    if (!selectedTable) return;
    const nextStatus = selectedTable.status === 'available' ? 'occupied' : 'available';
    try {
      await tableApi.updateTableStatus(getTableId(selectedTable), nextStatus);
      toast.success('Table status updated.');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Cannot update table status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.table) return;
    try {
      await tableApi.deleteTable(getTableId(deleteModal.table));
      toast.success('Table deleted.');
      setDeleteModal({ open: false, table: null });
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Cannot delete table.');
      setDeleteModal({ open: false, table: null });
    }
  };

  if (!isRestaurantReady) {
    return (
      <OwnerLayout title="Tables & Floor plan" subtitle="Real-time table status">
        <Card className="mx-auto max-w-2xl border-dashed border-border bg-card/70 p-8 text-center">
          <Armchair className="mx-auto h-12 w-12 text-primary" />
          <h2 className="font-serif text-3xl font-bold text-white">Select a restaurant</h2>
          <p className="text-sm text-muted-foreground">
            Choose a restaurant in the sidebar before managing its floor plan.
          </p>
        </Card>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="Tables & Floor plan" subtitle="Real-time table status">
      <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_540px]">
        <Card className="border-border bg-card p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Floor plan · Main hall</h2>
              <p className="mt-1 text-sm text-muted-foreground">Select a table to inspect live capacity and status.</p>
            </div>
            <Button
              variant="outline"
              className="h-10 border-border bg-background text-white hover:bg-secondary"
              onClick={handleCreateTable}
            >
              <Plus size={16} /> Add table
            </Button>
          </div>

          <div className="mt-10 rounded-xl border border-border bg-background p-5 sm:p-7">
            {error && (
              <div className="mb-5 flex items-center gap-3 rounded-xl border border-rose-500/25 bg-rose-500/10 p-4 text-sm text-rose-300">
                <AlertTriangle size={18} /> {error}
              </div>
            )}

            {loading ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm font-medium">Loading floor plan...</span>
              </div>
            ) : tables.length === 0 ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 px-6 text-center">
                <Armchair className="h-12 w-12 text-primary" />
                <h3 className="mt-4 font-serif text-2xl font-bold text-white">No tables yet</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Add the first table to start building a live floor plan for your restaurant.
                </p>
                <Button onClick={handleCreateTable} className="mt-5 bg-primary text-background hover:bg-primary/95">
                  <Plus size={16} /> Add first table
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                {tables.map((table) => {
                  const tableId = getTableId(table);
                  const isSelected = tableId === getTableId(selectedTable);
                  const style = STATUS_STYLES[table.status] || STATUS_STYLES.available;

                  return (
                    <button
                      type="button"
                      key={tableId}
                      onClick={() => setSelectedTableId(tableId)}
                      className={cn(
                        'flex h-36 items-center justify-center rounded-xl border text-sm font-bold transition-colors xl:h-[166px]',
                        style.tile,
                        isSelected && 'border-primary text-primary ring-1 ring-primary'
                      )}
                    >
                      {table.tableNumber}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        <Card className="border-border bg-card p-6 sm:p-7">
          {selectedTable ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Table details · {selectedTable.tableNumber}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedTable.zone || 'Main hall'}</p>
                </div>
                <Badge className={`${(STATUS_STYLES[selectedTable.status] || STATUS_STYLES.available).badge} rounded-lg border px-3 py-1 text-xs font-bold`}>
                  {getStatusMeta(selectedTable.status).label}
                </Badge>
              </div>

              <div className="mt-10 space-y-5">
                <DetailRow label="Capacity" value={`${selectedTable.capacity || 0} guests`} />
                <DetailRow label="Section" value={selectedTable.zone || 'Main hall'} />
                <DetailRow label="Min spend" value={formatMoney(selectedTable.depositAmount)} />
                <DetailRow label="Status" value={getStatusMeta(selectedTable.status).label} />
                <DetailRow label="Current guest" value={selectedTable.currentGuest || selectedTable.currentBooking?.customerName || 'No active guest'} />
                <DetailRow label="Seated at" value={selectedTable.seatedAt || selectedTable.currentBooking?.bookingTime || 'Not seated'} />
              </div>

              {selectedTable.note && (
                <div className="mt-8 rounded-xl border border-border bg-secondary/30 p-4 text-sm leading-relaxed text-muted-foreground">
                  {selectedTable.note}
                </div>
              )}

              <div className="mt-10 border-t border-border pt-8">
                <div className="grid gap-3">
                  <Button
                    className="h-11 bg-primary text-background hover:bg-primary/95"
                    onClick={handleStatusToggle}
                  >
                    {selectedTable.status === 'available' ? 'Mark as occupied' : 'Mark as available'}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 border-border bg-background text-white hover:bg-secondary"
                    onClick={() => handleEditTable(selectedTable)}
                  >
                    <Pencil size={16} /> Edit table
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-10 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                    onClick={() => setDeleteModal({ open: true, table: selectedTable })}
                  >
                    <Trash2 size={15} /> Delete table
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <Users className="h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">Select a table to view details.</p>
            </div>
          )}
        </Card>
      </div>

      {showForm && (
        <TableForm
          table={editingTable}
          statusOptions={STATUS_OPTIONS}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingTable(null);
          }}
        />
      )}

      {deleteModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setDeleteModal({ open: false, table: null })}
        >
          <Card
            className="w-full max-w-sm border-border bg-card p-6 text-center"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3 className="font-serif text-2xl font-bold text-white">Delete table?</h3>
            <p className="text-sm text-muted-foreground">
              This removes table {deleteModal.table?.tableNumber}. Existing bookings may still keep their table number history.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="border-border text-white hover:bg-secondary"
                onClick={() => setDeleteModal({ open: false, table: null })}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </OwnerLayout>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-4">
      <span className="text-base font-medium text-muted-foreground">{label}</span>
      <span className="text-right text-base font-bold text-white">{value}</span>
    </div>
  );
}
