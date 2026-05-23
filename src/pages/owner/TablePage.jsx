import { useCallback, useEffect, useState } from 'react';
import { Armchair, Filter, Plus, Search } from 'lucide-react';
import OwnerLayout from '../../components/owner/OwnerLayout';
import { useRestaurantContext } from '../../context/useRestaurantContext';
import * as tableApi from '../../api/tableApi';
import TableCard from '../../components/tables/TableCard';
import TableForm from '../../components/tables/TableForm';
import './TablePage.css';

const STATUS_OPTIONS = [
  { value: 'available', label: 'Trống', color: '#22c55e' },
  { value: 'occupied', label: 'Đang dùng', color: '#ef4444' },
  { value: 'reserved', label: 'Đã đặt', color: '#f59e0b' },
  { value: 'inactive', label: 'Ngưng', color: '#94a3b8' },
  { value: 'maintenance', label: 'Bảo trì', color: '#6366f1' },
];

export default function TablePage() {
  const { selectedRestaurantId, isRestaurantReady } = useRestaurantContext();

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterZone, setFilterZone] = useState('');

  // Form modal
  const [showForm, setShowForm] = useState(false);
  const [editingTable, setEditingTable] = useState(null);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({ open: false, table: null });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    if (!selectedRestaurantId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await tableApi.getTables(selectedRestaurantId, {
        status: filterStatus || undefined,
        zone: filterZone || undefined,
      });
      setTables(res.data?.tables || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách bàn');
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurantId, filterStatus, filterZone]);

  useEffect(() => {
    if (isRestaurantReady) fetchData();
    else { setTables([]); setLoading(false); }
  }, [isRestaurantReady, fetchData]);

  // Zones unique
  const zones = [...new Set(tables.map((t) => t.zone).filter(Boolean))];

  // Stats
  const stats = {
    total: tables.length,
    available: tables.filter((t) => t.status === 'available').length,
    occupied: tables.filter((t) => t.status === 'occupied').length,
    reserved: tables.filter((t) => t.status === 'reserved').length,
    totalCapacity: tables.reduce((sum, t) => sum + (t.capacity || 0), 0),
  };

  // Handlers
  const handleCreateTable = () => { setEditingTable(null); setShowForm(true); };
  const handleEditTable = (table) => { setEditingTable(table); setShowForm(true); };

  const handleFormSubmit = async (data) => {
    try {
      if (editingTable) {
        await tableApi.updateTable(editingTable.id, data);
        showToast('Cập nhật bàn thành công');
      } else {
        await tableApi.createTable(selectedRestaurantId, data);
        showToast('Tạo bàn thành công');
      }
      setShowForm(false);
      setEditingTable(null);
      fetchData();
    } catch (err) {
      showToast(err.message || 'Có lỗi xảy ra', 'error');
    }
  };

  const handleDeleteClick = (table) => setDeleteModal({ open: true, table });
  const handleDeleteConfirm = async () => {
    if (!deleteModal.table) return;
    try {
      await tableApi.deleteTable(deleteModal.table.id);
      showToast('Xóa bàn thành công');
      setDeleteModal({ open: false, table: null });
      fetchData();
    } catch (err) {
      showToast(err.message || 'Không thể xóa bàn', 'error');
      setDeleteModal({ open: false, table: null });
    }
  };

  const handleStatusChange = async (table, newStatus) => {
    try {
      await tableApi.updateTableStatus(table.id, newStatus);
      showToast('Cập nhật trạng thái thành công');
      fetchData();
    } catch (err) {
      showToast(err.message || 'Có lỗi xảy ra', 'error');
    }
  };

  if (!isRestaurantReady) {
    return (
      <OwnerLayout title="Quản lý Bàn" subtitle="Quản lý bàn nhà hàng">
        <div className="table-empty-state">
          <Armchair size={48} />
          <p>Vui lòng chọn nhà hàng để xem bàn</p>
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="Quản lý Bàn" subtitle="Quản lý và theo dõi trạng thái bàn">
      {/* Toast */}
      {toast && (
        <div className={`table-toast table-toast--${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* KPI Cards */}
      <div className="table-kpis">
        <div className="table-kpi">
          <span className="table-kpi-value">{stats.total}</span>
          <span className="table-kpi-label">Tổng bàn</span>
          <span className="table-kpi-meta">{stats.totalCapacity} chỗ</span>
        </div>
        <div className="table-kpi table-kpi--green">
          <span className="table-kpi-value">{stats.available}</span>
          <span className="table-kpi-label">Trống</span>
        </div>
        <div className="table-kpi table-kpi--red">
          <span className="table-kpi-value">{stats.occupied}</span>
          <span className="table-kpi-label">Đang dùng</span>
        </div>
        <div className="table-kpi table-kpi--yellow">
          <span className="table-kpi-value">{stats.reserved}</span>
          <span className="table-kpi-label">Đã đặt</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="table-toolbar">
        <div className="table-filters">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          {zones.length > 0 && (
            <select value={filterZone} onChange={(e) => setFilterZone(e.target.value)}>
              <option value="">Tất cả khu vực</option>
              {zones.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          )}
        </div>
        <button className="table-btn table-btn--primary" onClick={handleCreateTable}>
          <Plus size={16} /> Thêm bàn
        </button>
      </div>

      {/* Error */}
      {error && <div className="table-alert table-alert--error">{error}</div>}

      {/* Content */}
      <div className="table-content">
        {loading ? (
          <div className="table-loading">
            <div className="table-spinner" />
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : tables.length > 0 ? (
          <div className="table-grid">
            {tables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                onEdit={handleEditTable}
                onDelete={handleDeleteClick}
                onStatusChange={handleStatusChange}
                statusOptions={STATUS_OPTIONS}
              />
            ))}
          </div>
        ) : (
          <div className="table-empty-state">
            <Armchair size={48} />
            <h3>Chưa có bàn nào</h3>
            <p>Bắt đầu thêm bàn cho nhà hàng của bạn</p>
            <button className="table-btn table-btn--primary" onClick={handleCreateTable}>
              <Plus size={16} /> Thêm bàn đầu tiên
            </button>
          </div>
        )}
      </div>

      {/* Table Form Modal */}
      {showForm && (
        <TableForm
          table={editingTable}
          statusOptions={STATUS_OPTIONS}
          onSubmit={handleFormSubmit}
          onClose={() => { setShowForm(false); setEditingTable(null); }}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteModal.open && (
        <div className="table-modal-overlay" onClick={() => setDeleteModal({ open: false, table: null })}>
          <div className="table-modal table-modal--delete" onClick={(e) => e.stopPropagation()}>
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc muốn xóa <strong>{deleteModal.table?.tableNumber}</strong>?</p>
            <div className="table-modal-actions">
              <button className="table-btn table-btn--ghost" onClick={() => setDeleteModal({ open: false, table: null })}>Hủy</button>
              <button className="table-btn table-btn--danger" onClick={handleDeleteConfirm}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}
