import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Building2, Clock, Edit3, Mail, MapPin, Phone, Plus, Store } from 'lucide-react';
import OwnerLayout from '../../components/owner/OwnerLayout';
import { useRestaurantContext } from '../../context/useRestaurantContext';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { getRestaurantCoverImage } from '../../utils/restaurantImages';
import SafeImage from '../../components/common/SafeImage';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1600&q=80';

const DAY_ROWS = [
  ['monday', 'Mon'],
  ['tuesday', 'Tue'],
  ['wednesday', 'Wed'],
  ['thursday', 'Thu'],
  ['friday', 'Fri'],
  ['saturday', 'Sat'],
  ['sunday', 'Sun'],
];

const STATUS_CONFIG = {
  approved: { label: 'Approved', className: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400' },
  pending: { label: 'Pending review', className: 'border-amber-500/25 bg-amber-500/10 text-amber-400' },
  rejected: { label: 'Rejected', className: 'border-rose-500/25 bg-rose-500/10 text-rose-400' },
  suspended: { label: 'Suspended', className: 'border-orange-500/25 bg-orange-500/10 text-orange-400' },
};

function formatAddress(address) {
  if (!address) return 'Address not configured';
  if (typeof address === 'string') return address;
  if (address.fullAddress || address.formattedAddress) return address.fullAddress || address.formattedAddress;
  return [address.street, address.ward, address.district, address.city, address.province]
    .filter(Boolean)
    .join(', ') || 'Address not configured';
}

function formatCuisine(restaurant) {
  const cuisine = restaurant?.cuisineTypes || restaurant?.cuisines || restaurant?.cuisineType || restaurant?.cuisine;
  if (Array.isArray(cuisine)) return cuisine.filter(Boolean).join(' · ') || 'Cuisine not configured';
  return cuisine || 'Cuisine not configured';
}

function formatHours(dayHours) {
  if (!dayHours) return 'Not set';
  if (dayHours.closed || dayHours.isClosed || dayHours.isOpen === false) return 'Closed';
  const open = dayHours.open || dayHours.openTime || dayHours.from;
  const close = dayHours.close || dayHours.closeTime || dayHours.to;
  if (!open || !close) return 'Not set';
  return `${open} - ${close}`;
}

function FieldBox({ label, value, icon: Icon }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon size={13} className="text-primary" />}
        {label}
      </div>
      <div className="min-h-12 rounded-lg border border-border bg-secondary/50 px-4 py-3 text-base font-semibold text-white">
        {value || 'Not configured'}
      </div>
    </div>
  );
}

export default function OwnerRestaurants() {
  const navigate = useNavigate();
  const {
    restaurants,
    selectedRestaurant,
    selectedRestaurantId,
    loading,
    error,
    setSelectedRestaurantId,
    refreshRestaurants,
  } = useRestaurantContext();

  const restaurant = selectedRestaurant || restaurants[0] || null;
  const status = STATUS_CONFIG[restaurant?.approvalStatus] || STATUS_CONFIG.pending;
  const address = useMemo(() => formatAddress(restaurant?.address), [restaurant?.address]);
  const cuisine = useMemo(() => formatCuisine(restaurant), [restaurant]);
  const heroImage = getRestaurantCoverImage(restaurant) || FALLBACK_IMAGE;

  const action = restaurant ? (
    <Button
      className="bg-primary text-background hover:bg-primary/95"
      onClick={() => navigate(`/owner/restaurants/${restaurant.id}/edit`)}
    >
      <Edit3 size={16} /> Edit profile
    </Button>
  ) : null;

  return (
    <OwnerLayout title="Restaurant profile" subtitle="Public-facing details" action={action}>
      {loading ? (
        <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_540px]">
          <div className="h-[620px] animate-pulse rounded-xl border border-border bg-card" />
          <div className="h-[520px] animate-pulse rounded-xl border border-border bg-card" />
        </div>
      ) : error ? (
        <Card className="mx-auto max-w-2xl border-rose-500/25 bg-rose-500/10 p-6 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-rose-400" />
          <h2 className="font-serif text-2xl font-bold text-white">Cannot load restaurant profile</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={refreshRestaurants} className="mx-auto bg-primary text-background hover:bg-primary/95">
            Try again
          </Button>
        </Card>
      ) : !restaurant ? (
        <Card className="mx-auto max-w-2xl border-dashed border-border bg-card/70 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Store size={28} />
          </div>
          <h2 className="font-serif text-3xl font-bold text-white">No restaurant yet</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Create your first restaurant profile before managing bookings, tables and promotions.
          </p>
          <Button onClick={() => navigate('/owner/restaurants/create')} className="mx-auto bg-primary text-background hover:bg-primary/95">
            <Plus size={16} /> Create restaurant
          </Button>
        </Card>
      ) : (
        <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_540px]">
          <Card className="border-border bg-card p-6 sm:p-7">
            <div className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Restaurant profile</h2>
                <p className="mt-1 text-sm text-muted-foreground">These details appear on the public restaurant page.</p>
              </div>
              <Badge className={`${status.className} rounded-lg border px-3 py-1 text-xs font-bold`}>
                {status.label}
              </Badge>
            </div>

            <div className="overflow-hidden rounded-xl bg-secondary">
              <SafeImage
                src={heroImage}
                alt={restaurant.name}
                className="aspect-[2/1] w-full object-cover"
                fallback={<div className="aspect-[2/1] w-full flex items-center justify-center bg-secondary"><Store className="h-10 w-10 text-muted-foreground/70" /></div>}
              />
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2">
              <FieldBox label="Name" value={restaurant.name} icon={Building2} />
              <FieldBox label="Cuisine" value={cuisine} icon={Store} />
              <FieldBox label="Phone" value={restaurant.phoneNumber || restaurant.phone} icon={Phone} />
              <FieldBox label="Email" value={restaurant.email} icon={Mail} />
              <div className="md:col-span-2">
                <FieldBox label="Address" value={address} icon={MapPin} />
              </div>
            </div>

            {restaurants.length > 1 && (
              <div className="mt-7 rounded-xl border border-border bg-secondary/25 p-4">
                <p className="text-sm font-semibold text-white">Other restaurants</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {restaurants.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setSelectedRestaurantId(item.id)}
                      className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                        item.id === (selectedRestaurantId || restaurant.id)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-card text-muted-foreground hover:text-white'
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card className="border-border bg-card p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Operating hours</h2>
              <Clock size={20} className="text-primary" />
            </div>

            <div className="mt-8 divide-y divide-border/70">
              {DAY_ROWS.map(([key, label]) => {
                const value = formatHours(restaurant.operatingHours?.[key] || restaurant.openingHours?.[key]);
                const isClosed = value === 'Closed' || value === 'Not set';
                return (
                  <div key={key} className="grid grid-cols-[72px_minmax(0,1fr)] items-center py-4">
                    <span className="text-base font-medium text-muted-foreground">{label}</span>
                    <span className={`text-right text-base font-bold ${isClosed ? 'text-white' : 'text-white'}`}>
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 border-t border-border pt-8">
              <Button
                variant="outline"
                className="h-11 w-full border-border bg-background text-white hover:bg-secondary"
                onClick={() => navigate(`/owner/restaurants/${restaurant.id}/edit`)}
              >
                Edit hours
              </Button>
            </div>
          </Card>
        </div>
      )}
    </OwnerLayout>
  );
}
