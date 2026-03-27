"use client";

import { useRef, useEffect, useId, useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { scanReceipt } from "@/actions/transaction";

export function ReceiptScanner({ onScanComplete }) {
  const fileInputRef = useRef(null);
  const onScanCompleteRef = useRef(onScanComplete);
  const inputId = useId();
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  useEffect(() => {
    onScanCompleteRef.current = onScanComplete;
  }, [onScanComplete]);

  const {
    loading: scanReceiptLoading,
    fn: scanReceiptFn,
    data: scannedData,
  } = useFetch(scanReceipt);

  const handleReceiptScan = async (file) => {
    await scanReceiptFn(file);
  };

  const validateAndScan = async (file) => {
    if (!file) return;
    const isAllowed =
      file.type?.startsWith("image/") || file.type === "application/pdf";

    if (!isAllowed) {
      toast.error("Please drop an image or PDF receipt");
      return;
    }

    await handleReceiptScan(file);
  };

  useEffect(() => {
    if (!scanReceiptLoading && scannedData !== undefined) {
      if (!scannedData) {
        toast.error("Scanning not possible for this image");
        return;
      }

      if (typeof onScanCompleteRef.current === "function") {
        onScanCompleteRef.current(scannedData);
      }
      toast.success("Receipt scanned successfully");
    }
  }, [scanReceiptLoading, scannedData]);

  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        ref={fileInputRef}
        id={inputId}
        className="hidden"
        accept="image/*,application/pdf"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) validateAndScan(file);
          // Allow selecting the same file again (re-scan) by clearing the input.
          e.target.value = "";
        }}
      />
      <label
        htmlFor={inputId}
        className={
          "w-full" +
          (scanReceiptLoading ? " pointer-events-none opacity-70" : "")
        }
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDraggingOver(true);
        }}
        onDragOver={(e) => {
          // Required so the browser allows dropping.
          e.preventDefault();
          e.stopPropagation();
          setIsDraggingOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDraggingOver(false);
        }}
        onDrop={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDraggingOver(false);
          if (scanReceiptLoading) return;

          const file = e.dataTransfer?.files?.[0];
          await validateAndScan(file);
        }}
      >
        <Button
          type="button"
          variant="outline"
          className={
            "w-full h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 animate-gradient hover:opacity-90 transition-opacity text-white hover:text-white" +
            (isDraggingOver ? " ring-2 ring-offset-2" : "")
          }
          onClick={() => fileInputRef.current?.click()}
          disabled={scanReceiptLoading}
        >
          {scanReceiptLoading ? (
            <>
              <span>Scanning Receipt...</span>
            </>
          ) : (
            <>
              <Camera className="mr-2" />
              <span>
                {isDraggingOver
                  ? "Drop receipt to scan"
                  : "Scan Receipt with AI"}
              </span>
            </>
          )}
        </Button>
      </label>
    </div>
  );
}
