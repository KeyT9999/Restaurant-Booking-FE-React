import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, Loader2, RefreshCw, WalletCards } from 'lucide-react';
import Header from '../../components/Header';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { getMyWallet, getMyWalletTransactions } from '../../api/walletApi';
import toast from 'react-hot-toast';

const formatVnd = (amount = 0) => `${new Intl.NumberFormat('vi-VN').format(Math.abs(amount))}đ`;

const typeLabels = {
  CREDIT_BOOKING_REFUND: 'Hoàn tiền hủy đặt bàn',
  DEBIT_BOOKING_PAYMENT: 'Thanh toán booking bằng ví',
  CREDIT_BOOKING_PAYMENT_REVERSAL: 'Hoàn lại giao dịch thanh toán',
  CREDIT_ADMIN_ADJUSTMENT: 'Điều chỉnh cộng bởi BookEat',
  DEBIT_ADMIN_ADJUSTMENT: 'Điều chỉnh trừ bởi BookEat',
};

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const loadWallet = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const [walletResponse, transactionResponse] = await Promise.all([
        getMyWallet(),
        getMyWalletTransactions({ page, limit: 20 }),
      ]);
      setWallet(walletResponse.data.wallet);
      setTransactions(transactionResponse.data.transactions);
      setPagination(transactionResponse.data.pagination);
    } catch (error) {
      toast.error(error.message || 'Không thể tải Ví BookEat');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => loadWallet(1), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadWallet]);

  return (
    <div className="min-h-screen bg-background text-white">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Tài khoản BookEat</p>
            <h1 className="mt-2 text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Ví BookEat</h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">Tiền hoàn từ booking đã hủy được giữ an toàn tại đây để dùng cho những lần đặt bàn tiếp theo.</p>
          </div>
          <Button variant="outline" onClick={() => loadWallet(pagination.page)} disabled={loading} className="gap-2 border-border">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Làm mới
          </Button>
        </div>

        <Card className="relative overflow-hidden border-primary/25 bg-[radial-gradient(circle_at_85%_20%,rgba(212,150,83,0.22),transparent_35%),linear-gradient(135deg,#20242D,#15181E)] p-6 sm:p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Số dư khả dụng</p>
              <p className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">{formatVnd(wallet?.balance || 0)}</p>
              <p className="mt-3 text-xs text-muted-foreground">Trạng thái: <span className="font-semibold text-emerald-400">{wallet?.status === 'active' ? 'Đang hoạt động' : wallet?.status || 'Đang hoạt động'}</span></p>
            </div>
            <div className="rounded-2xl border border-primary/25 bg-primary/10 p-4 text-primary"><WalletCards size={28} /></div>
          </div>
        </Card>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Lịch sử giao dịch</h2>
            <span className="text-xs text-muted-foreground">{pagination.total || 0} giao dịch</span>
          </div>

          {loading ? (
            <Card className="flex items-center justify-center gap-2 border-border py-16 text-sm text-muted-foreground"><Loader2 className="animate-spin text-primary" size={18} /> Đang tải giao dịch...</Card>
          ) : transactions.length === 0 ? (
            <Card className="border-dashed border-border py-16 text-center"><WalletCards className="mx-auto text-muted-foreground" /><p className="mt-3 text-sm font-semibold">Chưa có giao dịch ví</p><p className="mt-1 text-xs text-muted-foreground">Khoản hoàn booking đầu tiên sẽ xuất hiện tại đây.</p></Card>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => {
                const credit = transaction.amount > 0;
                return (
                  <Card key={transaction.id} className="flex flex-col gap-4 border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className={`rounded-xl p-2.5 ${credit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-300'}`}>
                        {credit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white">{typeLabels[transaction.type] || transaction.description}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{transaction.description}</p>
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                          <span>{new Date(transaction.createdAt).toLocaleString('vi-VN')}</span>
                          {transaction.bookingId && <Link to={`/bookings/${transaction.bookingId}`} className="font-semibold text-primary hover:underline">Booking #{String(transaction.bookingId).slice(-8).toUpperCase()}</Link>}
                          <span className="text-emerald-400">{transaction.status === 'completed' ? 'Hoàn tất' : transaction.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 text-left sm:text-right">
                      <p className={`text-lg font-bold ${credit ? 'text-emerald-400' : 'text-rose-300'}`}>{credit ? '+' : '-'}{formatVnd(transaction.amount)}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">Số dư sau: {formatVnd(transaction.balanceAfter)}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="mt-5 flex justify-center gap-2">
              <Button variant="outline" disabled={loading || pagination.page <= 1} onClick={() => loadWallet(pagination.page - 1)}>Trang trước</Button>
              <span className="flex items-center px-3 text-xs text-muted-foreground">{pagination.page}/{pagination.totalPages}</span>
              <Button variant="outline" disabled={loading || pagination.page >= pagination.totalPages} onClick={() => loadWallet(pagination.page + 1)}>Trang sau</Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
