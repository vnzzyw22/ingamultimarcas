import { StockSkeleton } from "@/components/filters/stock-skeleton";

export default function Loading() {
  return (
    <>
      <div className="h-56 bg-ink lg:h-72" />
      <StockSkeleton />
    </>
  );
}
