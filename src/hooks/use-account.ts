"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addressesService, ordersService } from "@/services/account";
import { useWishlistStore } from "@/store/wishlist-store";
import type { AddressInput } from "@/types/address";

export function useOrders(page = 1, perPage = 10) {
  return useQuery({
    queryKey: ["me", "orders", page, perPage],
    queryFn: () => ordersService.list(page, perPage),
    retry: 1,
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ["me", "orders", id],
    queryFn: () => ordersService.byId(id as string),
    enabled: Boolean(id),
    retry: 1,
  });
}

export function useAddresses() {
  return useQuery({ queryKey: ["me", "addresses"], queryFn: addressesService.list, retry: 1 });
}

export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddressInput) => addressesService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me", "addresses"] }),
  });
}

export function useUpdateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AddressInput }) => addressesService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me", "addresses"] }),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressesService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me", "addresses"] }),
  });
}

export function useWishlistHydration() {
  const fetch = useWishlistStore((s) => s.fetch);
  const hydrated = useWishlistStore((s) => s.hydrated);
  if (!hydrated) void fetch();
}
