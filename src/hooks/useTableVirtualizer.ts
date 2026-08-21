import { useState, useEffect, useCallback, useMemo, useRef } from "react";

export interface VirtualItem {
  index: number;
  start: number;
  size: number;
}

export interface UseTableVirtualizerOptions {
  count: number;
  estimateSize?: number | ((index: number) => number);
  overscan?: number;
  containerRef: React.RefObject<HTMLElement | null>;
}

export interface UseTableVirtualizerReturn {
  virtualItems: VirtualItem[];
  totalSize: number;
  paddingTop: number;
  paddingBottom: number;
  startIndex: number;
  endIndex: number;
  isScrolling: boolean;
  scrollToIndex: (index: number, align?: "start" | "center" | "end" | "auto") => void;
}

/**
 * useTableVirtualizer
 * Lightweight, zero-dependency virtualization hook designed for MUI Tables and custom grids.
 * Calculates visible index ranges, dynamic top/bottom spacers, and responds to container resizes.
 */
export function useTableVirtualizer({
  count = 0,
  estimateSize = 54,
  overscan = 5,
  containerRef,
}: UseTableVirtualizerOptions): UseTableVirtualizerReturn {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  // Helper to resolve row height
  const getItemSize = useCallback(
    (index: number): number => {
      if (typeof estimateSize === "function") {
        return Math.max(1, estimateSize(index));
      }
      return Math.max(1, estimateSize);
    },
    [estimateSize]
  );

  // Measure container height with ResizeObserver
  useEffect(() => {
    isMountedRef.current = true;
    const container = containerRef.current;
    if (!container) return;

    // Initial measurement
    setContainerHeight(container.clientHeight || 500);

    const resizeObserver = new ResizeObserver((entries) => {
      if (!isMountedRef.current) return;
      for (const entry of entries) {
        if (entry.target === container) {
          const height = entry.contentRect.height || container.clientHeight;
          if (height > 0) {
            setContainerHeight(height);
          }
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      isMountedRef.current = false;
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  // Track scroll position with requestAnimationFrame
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        if (!isMountedRef.current || !container) return;
        setScrollTop(container.scrollTop);
        setIsScrolling(true);

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            setIsScrolling(false);
          }
        }, 150);
      });
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [containerRef]);

  // Compute virtual items and spacers
  const { virtualItems, totalSize, paddingTop, paddingBottom, startIndex, endIndex } =
    useMemo(() => {
      const safeCount = Math.max(0, count);
      if (safeCount === 0) {
        return {
          virtualItems: [],
          totalSize: 0,
          paddingTop: 0,
          paddingBottom: 0,
          startIndex: 0,
          endIndex: 0,
        };
      }

      // If estimateSize is fixed number (most common and fast path)
      if (typeof estimateSize === "number") {
        const itemHeight = Math.max(1, estimateSize);
        const total = safeCount * itemHeight;

        const effectiveHeight = containerHeight > 0 ? containerHeight : 500;
        const rawStart = Math.floor(scrollTop / itemHeight);
        const rawEnd = Math.ceil((scrollTop + effectiveHeight) / itemHeight);

        const start = Math.max(0, rawStart - overscan);
        const end = Math.min(safeCount, rawEnd + overscan);

        const items: VirtualItem[] = [];
        for (let i = start; i < end; i++) {
          items.push({
            index: i,
            start: i * itemHeight,
            size: itemHeight,
          });
        }

        const topSpacer = start * itemHeight;
        const bottomSpacer = Math.max(0, (safeCount - end) * itemHeight);

        return {
          virtualItems: items,
          totalSize: total,
          paddingTop: topSpacer,
          paddingBottom: bottomSpacer,
          startIndex: start,
          endIndex: end,
        };
      }

      // Variable size path
      let runningOffset = 0;
      const offsets: number[] = new Array(safeCount);
      const sizes: number[] = new Array(safeCount);

      for (let i = 0; i < safeCount; i++) {
        offsets[i] = runningOffset;
        const size = getItemSize(i);
        sizes[i] = size;
        runningOffset += size;
      }

      const total = runningOffset;
      const effectiveHeight = containerHeight > 0 ? containerHeight : 500;
      const scrollBottom = scrollTop + effectiveHeight;

      // Binary search for visible start
      let low = 0;
      let high = safeCount - 1;
      let firstVisible = 0;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (offsets[mid] + sizes[mid] >= scrollTop) {
          firstVisible = mid;
          high = mid - 1;
        } else {
          low = mid + 1;
        }
      }

      // Find last visible
      let lastVisible = firstVisible;
      while (lastVisible < safeCount && offsets[lastVisible] <= scrollBottom) {
        lastVisible++;
      }

      const start = Math.max(0, firstVisible - overscan);
      const end = Math.min(safeCount, lastVisible + overscan);

      const items: VirtualItem[] = [];
      for (let i = start; i < end; i++) {
        items.push({
          index: i,
          start: offsets[i],
          size: sizes[i],
        });
      }

      const topSpacer = offsets[start] || 0;
      const bottomSpacer =
        end < safeCount ? total - (offsets[end] || total) : 0;

      return {
        virtualItems: items,
        totalSize: total,
        paddingTop: topSpacer,
        paddingBottom: bottomSpacer,
        startIndex: start,
        endIndex: end,
      };
    }, [count, estimateSize, overscan, containerHeight, scrollTop, getItemSize]);

  // Programmatic scroll to index
  const scrollToIndex = useCallback(
    (index: number, align: "start" | "center" | "end" | "auto" = "auto") => {
      const container = containerRef.current;
      if (!container || index < 0 || index >= count) return;

      const itemSize = getItemSize(index);
      let targetOffset = 0;

      if (typeof estimateSize === "number") {
        targetOffset = index * estimateSize;
      } else {
        for (let i = 0; i < index; i++) {
          targetOffset += getItemSize(i);
        }
      }

      const currentScroll = container.scrollTop;
      const viewportHeight = container.clientHeight;

      if (align === "start") {
        container.scrollTop = targetOffset;
      } else if (align === "end") {
        container.scrollTop = targetOffset - viewportHeight + itemSize;
      } else if (align === "center") {
        container.scrollTop = targetOffset - viewportHeight / 2 + itemSize / 2;
      } else {
        // Auto
        if (targetOffset < currentScroll) {
          container.scrollTop = targetOffset;
        } else if (targetOffset + itemSize > currentScroll + viewportHeight) {
          container.scrollTop = targetOffset - viewportHeight + itemSize;
        }
      }
    },
    [containerRef, count, estimateSize, getItemSize]
  );

  return {
    virtualItems,
    totalSize,
    paddingTop,
    paddingBottom,
    startIndex,
    endIndex,
    isScrolling,
    scrollToIndex,
  };
}

export default useTableVirtualizer;
