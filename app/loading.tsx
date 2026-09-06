import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4 text-center">
        <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center animate-pulse">
          <div className="h-6 w-6 rounded-md bg-primary/30" />
        </div>
        <Skeleton className="h-6 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
        <div className="pt-4 space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
